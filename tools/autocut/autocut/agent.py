"""母艦の自動起動。ターミナルを二度と開かずに済ませるための仕込み。

    autocut autostart on

macOS は launchd、Linux は systemd --user へ登録する。ログイン時に起動し、
落ちても勝手に上がってくる。以後ヒロが触るのはスマホだけになる。
"""

from __future__ import annotations

import os
import platform
import plistlib
import subprocess
import sys
from pathlib import Path

LABEL = "works.lightsout.autocut"

# launchd はユーザーの PATH を引き継がない。Homebrew の ffmpeg が見つからず
# 「起動はしているのに書き出しだけ落ちる」という形で壊れるので、明示的に渡す。
PATH_HINT = "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"


def _launch_agents_dir() -> Path:
    return Path.home() / "Library" / "LaunchAgents"


def _plist_path() -> Path:
    return _launch_agents_dir() / f"{LABEL}.plist"


def _systemd_path() -> Path:
    return Path.home() / ".config" / "systemd" / "user" / "autocut.service"


def _run(cmd: list[str]) -> tuple[int, str]:
    proc = subprocess.run(cmd, capture_output=True, text=True)
    return proc.returncode, (proc.stderr or proc.stdout).strip()


# ---------------------------------------------------------------- macOS


def _macos_on(outdir: Path, port: int, pin: str | None) -> None:
    args = [sys.executable, "-m", "autocut", "serve",
            "--out", str(outdir), "--port", str(port)]
    if pin:
        args += ["--pin", pin]

    logs = Path.home() / "Library" / "Logs"
    logs.mkdir(parents=True, exist_ok=True)

    spec = {
        "Label": LABEL,
        "ProgramArguments": args,
        "RunAtLoad": True,
        "KeepAlive": True,
        "WorkingDirectory": str(outdir),
        "StandardOutPath": str(logs / "autocut.log"),
        "StandardErrorPath": str(logs / "autocut.log"),
        "EnvironmentVariables": {
            "PATH": PATH_HINT,
            "PYTHONUNBUFFERED": "1",
        },
        "ProcessType": "Background",
    }

    _launch_agents_dir().mkdir(parents=True, exist_ok=True)
    path = _plist_path()
    with open(path, "wb") as fh:
        plistlib.dump(spec, fh)

    uid = os.getuid()
    _run(["launchctl", "bootout", f"gui/{uid}/{LABEL}"])          # 既存があれば外す
    code, err = _run(["launchctl", "bootstrap", f"gui/{uid}", str(path)])
    if code != 0:
        code, err = _run(["launchctl", "load", "-w", str(path)])   # 古い macOS 向け
        if code != 0:
            raise RuntimeError(f"launchctl への登録に失敗した: {err}")

    print(f"  自動起動を入れました（macOS / launchd）")
    print(f"    設定  {path}")
    print(f"    記録  {logs / 'autocut.log'}")


def _macos_off() -> None:
    uid = os.getuid()
    _run(["launchctl", "bootout", f"gui/{uid}/{LABEL}"])
    _run(["launchctl", "unload", "-w", str(_plist_path())])
    _plist_path().unlink(missing_ok=True)
    print("  自動起動を外しました。")


def _macos_status() -> bool:
    if not _plist_path().exists():
        return False
    code, _ = _run(["launchctl", "print", f"gui/{os.getuid()}/{LABEL}"])
    return code == 0


# ---------------------------------------------------------------- Linux


UNIT = """[Unit]
Description=autocut — スマホから動画を渡すための待ち受け
After=network.target

[Service]
Type=simple
ExecStart={exec_start}
Restart=always
RestartSec=3
Environment=PYTHONUNBUFFERED=1
WorkingDirectory={workdir}

[Install]
WantedBy=default.target
"""


def _linux_on(outdir: Path, port: int, pin: str | None) -> None:
    args = [sys.executable, "-m", "autocut", "serve",
            "--out", str(outdir), "--port", str(port)]
    if pin:
        args += ["--pin", pin]

    path = _systemd_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        UNIT.format(exec_start=" ".join(args), workdir=str(outdir)), encoding="utf-8"
    )

    _run(["systemctl", "--user", "daemon-reload"])
    code, err = _run(["systemctl", "--user", "enable", "--now", "autocut.service"])
    if code != 0:
        raise RuntimeError(f"systemd への登録に失敗した: {err}")
    # ログアウトしても残す（母艦として使うため）
    _run(["loginctl", "enable-linger", os.environ.get("USER", "")])

    print("  自動起動を入れました（Linux / systemd --user）")
    print(f"    設定  {path}")
    print("    記録  journalctl --user -u autocut -f")


def _linux_off() -> None:
    _run(["systemctl", "--user", "disable", "--now", "autocut.service"])
    _systemd_path().unlink(missing_ok=True)
    _run(["systemctl", "--user", "daemon-reload"])
    print("  自動起動を外しました。")


def _linux_status() -> bool:
    if not _systemd_path().exists():
        return False
    code, _ = _run(["systemctl", "--user", "is-active", "autocut.service"])
    return code == 0


# ---------------------------------------------------------------- 入口


def supported() -> bool:
    return platform.system() in ("Darwin", "Linux")


def on(outdir: Path, port: int, pin: str | None = None) -> None:
    outdir = outdir.resolve()
    outdir.mkdir(parents=True, exist_ok=True)
    system = platform.system()
    if system == "Darwin":
        _macos_on(outdir, port, pin)
    elif system == "Linux":
        _linux_on(outdir, port, pin)
    else:
        raise RuntimeError(f"{system} には未対応。`autocut serve` を手で起動してください。")


def off() -> None:
    system = platform.system()
    if system == "Darwin":
        _macos_off()
    elif system == "Linux":
        _linux_off()
    else:
        raise RuntimeError(f"{system} には未対応。")


def status() -> bool:
    system = platform.system()
    if system == "Darwin":
        return _macos_status()
    if system == "Linux":
        return _linux_status()
    return False


def main(argv: list[str]) -> int:
    action = argv[0] if argv else "status"

    if action not in ("on", "off", "status"):
        print("使い方: autocut autostart {on|off|status}", file=sys.stderr)
        return 2

    if not supported():
        print(f"エラー: {platform.system()} には未対応です。", file=sys.stderr)
        return 3

    # on のときだけ、待ち受け設定を引数から拾う
    import argparse

    ap = argparse.ArgumentParser(prog="autocut autostart on", add_help=False)
    ap.add_argument("--out", type=Path, default=Path.home() / "autocut-web")
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--pin", default=None)
    args, _ = ap.parse_known_args(argv[1:])

    print()
    try:
        if action == "on":
            on(args.out, args.port, args.pin)
            print()
            print("  Mac の電源が入っていれば、いつでもスマホから使えます。")
            print("  ターミナルを開く必要はもうありません。")
        elif action == "off":
            off()
        else:
            print(f"  自動起動: {'入っています' if status() else '入っていません'}")
    except RuntimeError as exc:
        print(f"  失敗: {exc}", file=sys.stderr)
        return 1
    print()
    return 0
