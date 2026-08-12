"""動く条件が揃っているかを先に調べる。

    autocut doctor

スマホから繋がらない時、原因は「ffmpeg が無い」「フォントが無い」
「ファイアウォールが閉じている」のどれかであることが多い。当てずっぽうで
触らずに済むよう、確かめられるものを全部その場で確かめる。
"""

from __future__ import annotations

import platform
import shutil
import socket
import subprocess
import sys
from pathlib import Path

from . import fonts

OK, WARN, BAD = "  ○", "  △", "  ×"


def _line(mark: str, label: str, detail: str = "") -> None:
    print(f"{mark}  {label}" + (f"  —  {detail}" if detail else ""))


def _binary_version(name: str) -> str | None:
    path = shutil.which(name)
    if not path:
        return None
    try:
        out = subprocess.run([path, "-version"], capture_output=True, text=True,
                             timeout=15).stdout
        return out.splitlines()[0] if out else path
    except (OSError, subprocess.SubprocessError):
        return path


def _port_free(port: int) -> bool:
    sock = socket.socket()
    try:
        sock.bind(("0.0.0.0", port))
        return True
    except OSError:
        return False
    finally:
        sock.close()


def _lan_ip() -> str:
    from .server import lan_ip
    return lan_ip()


def run(port: int = 8765, outdir: Path | None = None) -> int:
    system = platform.system()
    problems = 0
    warnings = 0

    print()
    print(f"  autocut doctor — {system} / Python {platform.python_version()}")
    print("  " + "─" * 56)

    # 1. Python
    if sys.version_info >= (3, 10):
        _line(OK, "Python", platform.python_version())
    else:
        _line(BAD, "Python", f"{platform.python_version()} — 3.10 以上が要る")
        problems += 1

    # 2. ffmpeg / ffprobe
    for name in ("ffmpeg", "ffprobe"):
        version = _binary_version(name)
        if version:
            _line(OK, name, version[:64])
        else:
            _line(BAD, name, "見つからない")
            problems += 1
    if not shutil.which("ffmpeg"):
        if system == "Windows":
            print("        入れ方: winget install Gyan.FFmpeg  （入れた後で窓を開き直す）")
        elif system == "Darwin":
            print("        入れ方: brew install ffmpeg")
        else:
            print("        入れ方: sudo apt-get install ffmpeg")

    # 3. 日本語フォント（無いとテロップが豆腐になるが、書き出しは成功してしまう）
    found = fonts.available()
    if found:
        _line(OK, "日本語フォント", fonts.describe())
    else:
        _line(BAD, "日本語フォント", "見つからない — テロップが □ になる")
        print(f"        {fonts.install_hint()}")
        problems += 1

    # 4. 文字起こし
    try:
        import faster_whisper  # noqa: F401
        _line(OK, "faster-whisper", "入っている")
    except ImportError:
        _line(BAD, "faster-whisper", 'pip install "autocut[asr]" が要る')
        problems += 1

    # 5. 置き場所と空き
    target = (outdir or Path.home() / "autocut-web").resolve()
    try:
        target.mkdir(parents=True, exist_ok=True)
        probe = target / ".write-test"
        probe.write_text("ok", encoding="utf-8")
        probe.unlink()
        free_gb = shutil.disk_usage(target).free / 1e9
        if free_gb < 5:
            _line(WARN, "置き場所", f"{target}（空き {free_gb:.0f}GB — 少ない）")
            warnings += 1
        else:
            _line(OK, "置き場所", f"{target}（空き {free_gb:.0f}GB）")
    except OSError as exc:
        _line(BAD, "置き場所", f"{target} に書けない: {exc}")
        problems += 1

    # 6. ポート
    if _port_free(port):
        _line(OK, f"ポート {port}", "空いている")
    else:
        _line(WARN, f"ポート {port}", "使用中 — 既に autocut が動いているかも")
        warnings += 1

    # 7. ファイアウォール（Windows のみ。ここが閉じていると iPhone から一切届かない）
    if system == "Windows":
        from . import agent
        if agent.firewall_rule_exists():
            _line(OK, "受信許可", "ポートが開いている")
        else:
            _line(BAD, "受信許可", "閉じている — iPhone からつながらない")
            print(f"        管理者のコマンドプロンプトで: {agent.firewall_command(port)}")
            print("        あるいは autocut autostart on（UAC が一度出る）")
            problems += 1

    # 8. 宛先
    ip = _lan_ip()
    if ip.startswith("127."):
        _line(WARN, "スマホからの宛先", "LAN アドレスを取れない — Wi-Fi に繋がっているか")
        warnings += 1
    else:
        _line(OK, "スマホからの宛先", f"http://{ip}:{port}/")

    print("  " + "─" * 56)
    if problems:
        print(f"  直すところが {problems} 件あります。")
    elif warnings:
        print(f"  動きます（気になる点が {warnings} 件）。")
    else:
        print("  問題ありません。`autocut autostart on` で待ち受けを始められます。")
    print()
    return 1 if problems else 0


def main(argv: list[str]) -> int:
    import argparse

    ap = argparse.ArgumentParser(prog="autocut doctor",
                                 description="動く条件が揃っているか調べる")
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--out", type=Path, default=None)
    args = ap.parse_args(argv)
    return run(args.port, args.out)
