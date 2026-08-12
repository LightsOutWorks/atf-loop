"""スマホのブラウザから使うための小さなサーバー。

    autocut serve

母艦（このコマンドを叩いた機械）で待ち受け、同じWi-Fi上のiPhoneから開いて動画を
渡すと、母艦が編集して結果を返す。**素材はこの機械から外へ出ない。**

外部サービスを使わないので、置き場所・課金・アップロード先の管理が要らない。
代わりに母艦が起きている必要がある。

依存は標準ライブラリだけ。追加のパッケージは入れない。
"""

from __future__ import annotations

import argparse
import html
import json
import mimetypes
import os
import platform
import queue
import re
import secrets
import shutil
import socket
import threading
import time
import traceback
from dataclasses import dataclass, field
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

from . import fonts, icon, presets
from .pipeline import Options, run as run_pipeline
from .webui import PAGE

MANIFEST = {
    "name": "autocut",
    "short_name": "autocut",
    "description": "撮った動画からロング・ショート・TikTok をテロップ付きで作る",
    "start_url": "/",
    "scope": "/",
    "display": "standalone",
    "orientation": "portrait",
    "background_color": "#0e0e11",
    "theme_color": "#0e0e11",
    "lang": "ja",
    "icons": [
        {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"},
        {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png",
         "purpose": "maskable"},
    ],
}

CHUNK = 1024 * 1024
STAGE_RE = re.compile(r"\[(\d)/(\d)\]")
SAFE_NAME = re.compile(r"[^\w.\-()（） 　ぁ-んァ-ヶ一-龠]+")


# ---------------------------------------------------------------- ジョブ


@dataclass
class Job:
    id: str
    filename: str
    source: Path
    outdir: Path
    shorts: int = 3
    model: str = "medium"
    aggressive: bool = False
    state: str = "queued"          # queued / running / done / error
    stage: int = 0
    total_stages: int = 6
    message: str = "順番を待っています"
    lines: list[str] = field(default_factory=list)
    outputs: dict[str, list[str]] = field(default_factory=dict)
    report: dict = field(default_factory=dict)
    error: str = ""
    created: float = field(default_factory=time.time)
    finished: float = 0.0

    @property
    def percent(self) -> int:
        if self.state == "done":
            return 100
        if self.state == "queued":
            return 0
        return min(96, int(self.stage / self.total_stages * 100))

    def public(self) -> dict:
        return {
            "id": self.id,
            "filename": self.filename,
            "state": self.state,
            "percent": self.percent,
            "message": self.message,
            "lines": self.lines[-14:],
            "outputs": self.outputs,
            "error": self.error,
            "elapsed": round((self.finished or time.time()) - self.created, 1),
            "summary": self._summary(),
        }

    def _summary(self) -> dict | None:
        if not self.report:
            return None
        cut = self.report.get("cutplan", {})
        return {
            "input_duration": cut.get("input_duration"),
            "output_duration": cut.get("output_duration"),
            "removed_ratio": cut.get("removed_ratio"),
            "silence_cuts": cut.get("silence_cuts"),
            "filler_cuts": cut.get("filler_cuts"),
            "filler_words": cut.get("filler_words", []),
            "highlights": self.report.get("highlights", []),
        }


class JobRunner:
    """1本ずつ順に処理する。動画の書き出しは重いので同時に走らせない。"""

    def __init__(self, root: Path):
        self.root = root
        self.jobs: dict[str, Job] = {}
        self.q: queue.Queue[str] = queue.Queue()
        self.lock = threading.Lock()
        self.worker = threading.Thread(target=self._loop, daemon=True)
        self.worker.start()

    def add(self, job: Job) -> None:
        with self.lock:
            self.jobs[job.id] = job
        waiting = self.q.qsize()
        if waiting:
            job.message = f"順番を待っています（前に {waiting} 本）"
        self.q.put(job.id)

    def get(self, job_id: str) -> Job | None:
        with self.lock:
            return self.jobs.get(job_id)

    def recent(self, limit: int = 12) -> list[Job]:
        with self.lock:
            items = sorted(self.jobs.values(), key=lambda j: j.created, reverse=True)
        return items[:limit]

    def _loop(self) -> None:
        while True:
            job_id = self.q.get()
            job = self.get(job_id)
            if job is None:
                continue
            try:
                self._process(job)
            except Exception as exc:  # noqa: BLE001 - 何が来ても落とさない
                job.state = "error"
                job.error = str(exc) or exc.__class__.__name__
                job.message = "失敗しました"
                job.lines.append(traceback.format_exc().strip().splitlines()[-1])
            finally:
                job.finished = time.time()
                self.q.task_done()

    def _process(self, job: Job) -> None:
        job.state = "running"
        job.message = "準備中"

        def log(line: str) -> None:
            job.lines.append(line)
            m = STAGE_RE.search(line)
            if m:
                job.stage = int(m.group(1))
                job.total_stages = int(m.group(2))
                job.message = line.split("]", 1)[1].strip() or job.message
            elif line.strip().startswith(("YouTube", "TikTok")):
                job.message = line.strip()

        opts = Options(
            outdir=job.outdir,
            presets=presets.resolve(None),
            asr_model=job.model,
            shorts_count=job.shorts,
            aggressive_fillers=job.aggressive,
            encode_preset="veryfast",
        )
        result = run_pipeline(job.source, opts, log=log)

        job.outputs = {
            key: [str(Path(p).relative_to(job.outdir)) for p in paths]
            for key, paths in result.outputs.items()
        }
        job.report = result.report
        job.state = "done"
        job.message = "できました"


# ---------------------------------------------------------------- 受け取り


class UploadTooLarge(Exception):
    pass


def _read_until(rfile, marker: bytes, limit: int) -> bytes:
    """marker が現れるまで読む（部品ヘッダ用。小さい範囲でしか使わない）。"""
    buf = b""
    while marker not in buf:
        if len(buf) > limit:
            raise ValueError("multipart header が長すぎる")
        block = rfile.read(1)
        if not block:
            break
        buf += block
    return buf


def stream_upload(rfile, length: int, boundary: bytes, dest_dir: Path, max_bytes: int) -> tuple[Path, str, dict]:
    """multipart をメモリに載せずディスクへ直接流す。

    iPhone の動画は数百MBから数GBになる。全部を読み込む実装だと母艦が落ちる。
    """
    if length > max_bytes:
        raise UploadTooLarge(f"{length / 1e9:.1f}GB は上限を超えている")

    dest_dir.mkdir(parents=True, exist_ok=True)
    remaining = length
    delim = b"--" + boundary
    fields: dict[str, str] = {}
    saved: Path | None = None
    original = "video.mp4"

    # 最初の境界行まで読み飛ばす
    head = _read_until(rfile, delim, 4096)
    remaining -= len(head)

    while remaining > 0:
        line = rfile.readline()
        remaining -= len(line)
        if line.strip() == b"--":            # 終端 (--BOUNDARY--)
            break

        headers = b""
        while True:
            hl = rfile.readline()
            remaining -= len(hl)
            headers += hl
            if hl in (b"\r\n", b"\n", b""):
                break

        text = headers.decode("utf-8", "replace")
        name_m = re.search(r'name="([^"]*)"', text)
        file_m = re.search(r'filename="([^"]*)"', text)
        name = name_m.group(1) if name_m else ""

        if not file_m or not file_m.group(1):
            # 通常のフォーム値。小さいので普通に読む。
            body = b""
            needle = b"\r\n" + delim
            tail = b""
            while remaining > 0:
                chunk = rfile.read(min(8192, remaining))
                if not chunk:
                    break
                remaining -= len(chunk)
                buf = tail + chunk
                idx = buf.find(needle)
                if idx >= 0:
                    body += buf[:idx]
                    rest = buf[idx + len(needle):]
                    remaining += len(rest)
                    rfile = _Rewound(rest, rfile)
                    break
                keep = len(needle) - 1
                body += buf[:-keep] if len(buf) > keep else b""
                tail = buf[-keep:] if len(buf) > keep else buf
            fields[name] = body.decode("utf-8", "replace").strip()
            continue

        original = os.path.basename(file_m.group(1).replace("\\", "/")) or "video.mp4"
        safe = SAFE_NAME.sub("_", original).strip("._ ") or "video.mp4"
        saved = dest_dir / safe

        needle = b"\r\n" + delim
        tail = b""
        written = 0
        with open(saved, "wb") as out:
            while remaining > 0:
                chunk = rfile.read(min(CHUNK, remaining))
                if not chunk:
                    break
                remaining -= len(chunk)
                buf = tail + chunk
                idx = buf.find(needle)
                if idx >= 0:
                    out.write(buf[:idx])
                    written += idx
                    rest = buf[idx + len(needle):]
                    remaining += len(rest)
                    rfile = _Rewound(rest, rfile)
                    break
                keep = len(needle) - 1
                if len(buf) > keep:
                    out.write(buf[:-keep])
                    written += len(buf) - keep
                    tail = buf[-keep:]
                else:
                    tail = buf
                if written > max_bytes:
                    raise UploadTooLarge("上限を超えた")

    if saved is None:
        raise ValueError("動画が入っていない")
    return saved, original, fields


class _Rewound:
    """境界の直後に読み過ぎた分を、次の read へ戻すための薄い被せ物。"""

    def __init__(self, prefix: bytes, rfile):
        self._prefix = prefix
        self._rfile = rfile

    def read(self, n: int = -1) -> bytes:
        if self._prefix:
            if n < 0 or n >= len(self._prefix):
                out, self._prefix = self._prefix, b""
                return out
            out, self._prefix = self._prefix[:n], self._prefix[n:]
            return out
        return self._rfile.read(n)

    def readline(self) -> bytes:
        if self._prefix:
            idx = self._prefix.find(b"\n")
            if idx >= 0:
                out, self._prefix = self._prefix[: idx + 1], self._prefix[idx + 1:]
                return out
            out, self._prefix = self._prefix, b""
            return out + self._rfile.readline()
        return self._rfile.readline()


# ---------------------------------------------------------------- HTTP


class Handler(BaseHTTPRequestHandler):
    server_version = "autocut"
    protocol_version = "HTTP/1.1"

    runner: JobRunner
    pin: str
    max_bytes: int

    def log_message(self, fmt: str, *args) -> None:
        if self.path.startswith("/api/"):
            return
        print(f"  · {self.address_string()} {fmt % args}", flush=True)

    # -------- helpers

    def _send(self, code: int, body: bytes, ctype: str, extra: dict | None = None) -> None:
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def _json(self, obj, code: int = 200) -> None:
        self._send(code, json.dumps(obj, ensure_ascii=False).encode("utf-8"),
                   "application/json; charset=utf-8")

    def _authorized(self) -> bool:
        if not self.pin:
            return True
        given = self.headers.get("X-Autocut-Pin", "")
        if not given:
            given = parse_qs(urlparse(self.path).query).get("k", [""])[0]
        return secrets.compare_digest(given, self.pin)

    # -------- routes

    def do_GET(self) -> None:  # noqa: N802
        route = urlparse(self.path).path

        if route == "/":
            self._send(200, PAGE.encode("utf-8"), "text/html; charset=utf-8")
            return
        if route == "/healthz":
            self._json({"ok": True})
            return
        # ホーム画面に置くために要るもの。PIN より前で返す——Safari はこれらを
        # 別扱いで取りに来るので、認証をかけるとアイコンが出ない。
        m = re.fullmatch(r"/icon-(\d{2,4})\.png", route)
        if m:
            size = max(16, min(1024, int(m.group(1))))
            self._send(200, icon.get(size), "image/png",
                       {"Cache-Control": "public, max-age=86400"})
            return
        if route == "/manifest.webmanifest":
            self._send(200, json.dumps(MANIFEST, ensure_ascii=False).encode("utf-8"),
                       "application/manifest+json; charset=utf-8")
            return
        if route == "/favicon.ico":
            self._send(200, icon.get(64), "image/png",
                       {"Cache-Control": "public, max-age=86400"})
            return
        if route.startswith("/apple-touch-icon"):
            self._send(200, icon.get(180), "image/png",
                       {"Cache-Control": "public, max-age=86400"})
            return

        if route == "/api/pin":
            self._json({"required": bool(self.pin), "ok": self._authorized()})
            return

        if not self._authorized():
            self._json({"error": "PIN が違います"}, 403)
            return

        if route == "/api/jobs":
            self._json({"jobs": [j.public() for j in self.runner.recent()]})
            return

        m = re.fullmatch(r"/api/job/([0-9a-f]{8,32})", route)
        if m:
            job = self.runner.get(m.group(1))
            if job is None:
                self._json({"error": "見つかりません"}, 404)
                return
            self._json(job.public())
            return

        m = re.fullmatch(r"/file/([0-9a-f]{8,32})/(.+)", route)
        if m:
            self._serve_output(m.group(1), unquote(m.group(2)))
            return

        self._send(404, b"not found", "text/plain; charset=utf-8")

    def do_HEAD(self) -> None:  # noqa: N802
        self.do_GET()

    def do_POST(self) -> None:  # noqa: N802
        route = urlparse(self.path).path
        if route != "/api/upload":
            self._send(404, b"not found", "text/plain; charset=utf-8")
            return
        if not self._authorized():
            self._json({"error": "PIN が違います"}, 403)
            return

        ctype = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in ctype:
            self._json({"error": "形式が違います"}, 400)
            return
        m = re.search(r"boundary=([^;]+)", ctype)
        if not m:
            self._json({"error": "境界が無い"}, 400)
            return

        boundary = m.group(1).strip().strip('"').encode("utf-8")
        length = int(self.headers.get("Content-Length", "0"))
        job_id = secrets.token_hex(8)
        outdir = self.runner.root / job_id

        try:
            source, original, fields = stream_upload(
                self.rfile, length, boundary, outdir / "input", self.max_bytes
            )
        except UploadTooLarge as exc:
            self._json({"error": f"動画が大きすぎます（{exc}）"}, 413)
            return
        except Exception as exc:  # noqa: BLE001
            self._json({"error": f"受け取りに失敗しました: {exc}"}, 400)
            return

        def as_int(key: str, default: int, lo: int, hi: int) -> int:
            try:
                return max(lo, min(hi, int(fields.get(key, default))))
            except (TypeError, ValueError):
                return default

        job = Job(
            id=job_id,
            filename=original,
            source=source,
            outdir=outdir,
            shorts=as_int("shorts", 3, 1, 8),
            model=fields.get("model", "medium") if fields.get("model") in
            ("tiny", "base", "small", "medium", "large-v3") else "medium",
            aggressive=fields.get("aggressive") == "1",
        )
        self.runner.add(job)
        print(f"  ▸ 受け取り: {original} ({source.stat().st_size / 1e6:.0f}MB) → {job_id}",
              flush=True)
        self._json({"id": job_id})

    # -------- 出力の配信（Range 必須。iOS の <video> が部分取得で来る）

    def _serve_output(self, job_id: str, rel: str) -> None:
        job = self.runner.get(job_id)
        if job is None:
            self._send(404, b"not found", "text/plain; charset=utf-8")
            return

        target = (job.outdir / rel).resolve()
        try:
            target.relative_to(job.outdir.resolve())
        except ValueError:
            self._send(403, b"forbidden", "text/plain; charset=utf-8")
            return
        if not target.is_file():
            self._send(404, b"not found", "text/plain; charset=utf-8")
            return

        size = target.stat().st_size
        ctype = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        rng = self.headers.get("Range", "")
        start, end = 0, size - 1
        partial = False

        m = re.fullmatch(r"bytes=(\d*)-(\d*)", rng.strip()) if rng else None
        if m:
            if m.group(1):
                start = int(m.group(1))
                end = int(m.group(2)) if m.group(2) else size - 1
            elif m.group(2):
                start = max(0, size - int(m.group(2)))
            end = min(end, size - 1)
            if start > end or start >= size:
                self.send_response(416)
                self.send_header("Content-Range", f"bytes */{size}")
                self.send_header("Content-Length", "0")
                self.end_headers()
                return
            partial = True

        length = end - start + 1
        download = parse_qs(urlparse(self.path).query).get("dl")
        self.send_response(206 if partial else 200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(length))
        self.send_header("Accept-Ranges", "bytes")
        if partial:
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        if download:
            self.send_header("Content-Disposition",
                             f'attachment; filename="{target.name}"')
        self.end_headers()
        if self.command == "HEAD":
            return

        with open(target, "rb") as fh:
            fh.seek(start)
            left = length
            while left > 0:
                block = fh.read(min(CHUNK, left))
                if not block:
                    break
                try:
                    self.wfile.write(block)
                except (BrokenPipeError, ConnectionResetError):
                    return
                left -= len(block)


# ---------------------------------------------------------------- 起動


def lan_ip() -> str:
    """外へ出る経路のアドレスを引く（実際には送信しない）。"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.connect(("192.0.2.1", 9))          # TEST-NET-1。到達しなくてよい
        return sock.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        sock.close()


def local_hostname() -> str | None:
    """`<機械名>.local` を返す。

    IPアドレスは DHCP で変わり、そのたびにスマホのブックマークが死ぬ。
    macOS は Bonjour で `.local` 名を常時広告しており、iPhone はこれを解決できる。
    ブックマークするならこちらのほうが壊れない。
    """
    if platform.system() != "Darwin":
        return None
    name = socket.gethostname().strip()
    if not name or name in ("localhost", "localhost.local"):
        return None
    return name if name.endswith(".local") else f"{name}.local"


def resolve_pin(root: Path, given: str | None, disabled: bool) -> str:
    """PIN を決める。一度決めたら次の起動でも同じものを使う。

    自動起動にすると再起動のたびに番号が変わってしまい、スマホ側が毎回弾かれる。
    だから乱数は初回だけにして、以降はファイルから読む。
    """
    if disabled:
        return ""
    if given:
        return given
    store = root / ".pin"
    try:
        saved = store.read_text(encoding="utf-8").strip()
        if saved.isdigit() and len(saved) == 4:
            return saved
    except OSError:
        pass
    pin = f"{secrets.randbelow(10000):04d}"
    try:
        store.write_text(pin, encoding="utf-8")
        os.chmod(store, 0o600)
    except OSError:
        pass
    return pin


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="autocut serve",
        description="スマホのブラウザから動画を渡せるようにする（母艦で処理する）。",
    )
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--host", default="0.0.0.0",
                        help="待ち受ける先（既定: 0.0.0.0 = 同じWi-Fiから届く）")
    # autostart 側と同じ既定にする。ここがずれると PIN と出力の置き場所が
    # 手動起動と自動起動で食い違い、原因の分かりにくい混乱になる。
    parser.add_argument("--out", type=Path, default=Path.home() / "autocut-web",
                        help="受け取った動画と出力の置き場所（既定: ~/autocut-web）")
    parser.add_argument("--max-gb", type=float, default=8.0, help="1本の上限（既定: 8GB）")
    parser.add_argument("--pin", default=None,
                        help="PIN を指定する（既定: 初回に決めて以後は使い回す）")
    parser.add_argument("--no-pin", action="store_true",
                        help="PIN を求めない（信頼できる回線でのみ）")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    root = args.out.resolve()
    root.mkdir(parents=True, exist_ok=True)
    pin = resolve_pin(root, args.pin, args.no_pin)

    Handler.runner = JobRunner(root)
    Handler.pin = pin
    Handler.max_bytes = int(args.max_gb * 1e9)

    httpd = ThreadingHTTPServer((args.host, args.port), Handler)
    httpd.daemon_threads = True

    host = local_hostname()
    ip_url = f"http://{lan_ip()}:{args.port}/"
    free_gb = shutil.disk_usage(root).free / 1e9
    windows = platform.system() == "Windows"

    print()
    print("  autocut — スマホから使う")
    print("  " + "─" * 52)
    if host:
        print(f"  iPhone で開く:  http://{host}:{args.port}/")
        print(f"  （繋がらなければ）{ip_url}")
    else:
        print(f"  iPhone で開く:  {ip_url}")
    if pin:
        print(f"  PIN:            {pin}   （最初の1回だけ）")
    print(f"  置き場所:        {root}")
    print(f"  空き:            {free_gb:.0f}GB / 1本の上限 {args.max_gb:.0f}GB")
    print(f"  テロップ書体:    {fonts.describe()}")
    print("  " + "─" * 52)
    print("  開いたら「ホーム画面に追加」。次からはアイコンを押すだけです。")
    if host:
        print("  .local 名なので、Wi-Fi のアドレスが変わってもそのまま使えます。")

    if not fonts.available():
        print()
        print("  ⚠ 日本語フォントが見つかりません。テロップが □ になります。")
        print(f"    {fonts.install_hint()}")

    if windows:
        from . import agent
        if not agent.firewall_rule_exists():
            print()
            print("  ⚠ ファイアウォールが閉じています。iPhone から届きません。")
            print("    管理者のコマンドプロンプトで:")
            print(f"    {agent.firewall_command(args.port)}")

    print()
    print("  終了は Ctrl+C。ずっと待たせるなら `autocut autostart on`。")
    print("  つながらないときは `autocut doctor`。")
    print()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  終了しました。")
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
