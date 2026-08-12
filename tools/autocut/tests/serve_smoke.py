"""サーバー経路の通し検証。

HTTP の受け取り → ジョブ実行 → 出力配信（Range 含む）までを実際に動かす。
音声認識だけは差し替える——検証環境ではモデルを取得できないため（README「検証の状態」）。
差し替えているのはそこだけで、multipart の受け取り・ジョブ・書き出し・配信は本物を通す。

    python tests/serve_smoke.py --fixture /tmp/fx
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import threading
import time
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from autocut import asr, server
from autocut.model import Transcript

PORT = 8799
BASE = f"http://127.0.0.1:{PORT}"


def get(path: str) -> tuple[int, bytes, dict]:
    req = urllib.request.Request(BASE + path)
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, r.read(), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read(), dict(e.headers)


def get_range(path: str, rng: str) -> tuple[int, bytes, dict]:
    req = urllib.request.Request(BASE + path, headers={"Range": rng})
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, r.read(), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read(), dict(e.headers)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--fixture", type=Path, required=True,
                    help="make_fixture.py の出力ディレクトリ")
    ap.add_argument("--out", type=Path, default=Path("/tmp/autocut-serve-smoke"))
    args = ap.parse_args()

    video = args.fixture / "fixture.mp4"
    truth = Transcript.load(args.fixture / "fixture.json")
    if not video.exists():
        sys.exit(f"素材が無い: {video}（先に make_fixture.py を回す）")

    # 認識だけ差し替える。他は本物を通す。
    asr.transcribe = lambda *a, **k: truth

    root = args.out.resolve()
    root.mkdir(parents=True, exist_ok=True)
    server.Handler.runner = server.JobRunner(root)
    server.Handler.pin = ""
    server.Handler.max_bytes = int(8e9)

    httpd = ThreadingHTTPServer(("127.0.0.1", PORT), server.Handler)
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    time.sleep(0.4)

    fails: list[str] = []

    def check(label: str, ok: bool, detail: str = "") -> None:
        print(f"  {'PASS' if ok else 'FAIL'}  {label}" + (f" — {detail}" if detail else ""))
        if not ok:
            fails.append(label)

    code, body, _ = get("/")
    check("トップが返る", code == 200 and b"autocut" in body)
    code, body, _ = get("/healthz")
    check("healthz", code == 200 and json.loads(body)["ok"])
    code, body, _ = get("/api/pin")
    check("PIN 不要と答える", code == 200 and json.loads(body)["required"] is False)

    # 実際に multipart で送る（curl を使い、ブラウザと同じ形にする）
    size_mb = video.stat().st_size / 1e6
    print(f"\n  送信: {video.name} ({size_mb:.1f}MB)")
    out = subprocess.run(
        ["curl", "-sS", "--noproxy", "*", "-X", "POST", BASE + "/api/upload",
         "-F", "shorts=2", "-F", "model=small", "-F", "aggressive=0",
         "-F", f"video=@{video};type=video/mp4"],
        capture_output=True, text=True,
    )
    if out.returncode != 0:
        sys.exit(f"curl 失敗: {out.stderr}")
    posted = json.loads(out.stdout)
    job_id = posted.get("id")
    check("受け取ってジョブ番号を返す", bool(job_id), job_id or out.stdout)
    if not job_id:
        return 1

    # 受け取ったファイルがバイト単位で一致するか（multipart 解析の正しさ）
    saved = next((root / job_id / "input").glob("*"), None)
    check("保存されたファイルの大きさが一致",
          saved is not None and saved.stat().st_size == video.stat().st_size,
          f"{saved.stat().st_size if saved else '—'} / {video.stat().st_size}")

    print("\n  処理待ち…")
    last, job = "", {}
    for _ in range(600):
        code, body, _ = get(f"/api/job/{job_id}")
        job = json.loads(body)
        if job["message"] != last:
            last = job["message"]
            print(f"    {job['percent']:3d}%  {last}")
        if job["state"] in ("done", "error"):
            break
        time.sleep(1)

    check("完了した", job.get("state") == "done", job.get("error", ""))
    if job.get("state") != "done":
        return 1

    outs = job.get("outputs", {})
    check("3種類そろっている", set(outs) == {"youtube_long", "youtube_shorts", "tiktok"},
          ", ".join(sorted(outs)))
    check("短尺の本数が指定どおり(2)",
          len(outs.get("youtube_shorts", [])) == 2 and len(outs.get("tiktok", [])) == 2,
          f"shorts={len(outs.get('youtube_shorts', []))} tiktok={len(outs.get('tiktok', []))}")
    check("集計が返る", bool(job.get("summary", {}).get("output_duration")))

    # 出力の配信。iOS の <video> は Range で来るので、そこを実際に確かめる。
    rel = outs["youtube_shorts"][0]
    path = f"/file/{job_id}/{rel}"
    code, body, hdr = get(path)
    full = int(hdr.get("Content-Length", "0"))
    check("動画が配信される", code == 200 and full > 0, f"{full/1e6:.1f}MB")
    check("Accept-Ranges を返す", hdr.get("Accept-Ranges") == "bytes")

    code, part, hdr = get_range(path, "bytes=0-1023")
    check("Range 部分取得が 206", code == 206 and len(part) == 1024,
          f"{code} / {len(part)}B")
    check("Content-Range が正しい",
          hdr.get("Content-Range") == f"bytes 0-1023/{full}", hdr.get("Content-Range", ""))

    code, tail, _ = get_range(path, f"bytes={full-10}-")
    check("末尾の Range が取れる", code == 206 and len(tail) == 10)

    code, _, hdr = get_range(path, f"bytes={full+50}-")
    check("範囲外は 416", code == 416)

    code, _, hdr = get(path + "?dl=1")
    check("保存用は Content-Disposition が付く",
          "attachment" in hdr.get("Content-Disposition", ""))

    # 経路外への読み出しを弾くか
    code, _, _ = get(f"/file/{job_id}/../../../etc/passwd")
    check("親ディレクトリへ抜けられない", code in (403, 404), str(code))

    code, _, _ = get("/api/job/deadbeefdeadbeef")
    check("知らないジョブは 404", code == 404)

    httpd.shutdown()
    print()
    if fails:
        print(f"  失敗 {len(fails)} 件: " + ", ".join(fails))
        return 1
    print("  すべて通過")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
