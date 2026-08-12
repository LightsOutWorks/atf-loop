"""テロップに使う日本語フォントを決める。

OS ごとに入っているフォントが違う。存在しない名前を渡すと libass が別の書体へ
落とし、日本語が豆腐（□）になる。**しかも書き出しは成功するので気付けない。**
だから「入っていることを確かめてから」名前を渡す。
"""

from __future__ import annotations

import platform
import shutil
import subprocess
from pathlib import Path

# (ファミリ名, 同梱されるファイル名の候補)
WINDOWS_CANDIDATES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("Yu Gothic UI", ("YuGothR.ttc", "YuGothM.ttc", "YuGothB.ttc")),
    ("Yu Gothic", ("YuGothR.ttc", "YuGothM.ttc")),
    ("Meiryo", ("meiryo.ttc", "meiryob.ttc")),
    ("MS Gothic", ("msgothic.ttc",)),
)

MACOS_CANDIDATES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("Hiragino Sans", ("ヒラギノ角ゴシック W3.ttc", "HiraginoSans-W3.ttc", "Hiragino Sans W3.ttc")),
    ("Hiragino Kaku Gothic ProN", ("ヒラギノ角ゴ ProN W3.otf",)),
)

LINUX_FAMILIES: tuple[str, ...] = (
    "Noto Sans CJK JP",
    "Noto Sans JP",
    "IPAexGothic",
    "TakaoPGothic",
    "VL PGothic",
)

FALLBACK = "sans-serif"


def _windows_font_dirs() -> list[Path]:
    dirs = [Path("C:/Windows/Fonts")]
    local = Path.home() / "AppData" / "Local" / "Microsoft" / "Windows" / "Fonts"
    dirs.append(local)
    return [d for d in dirs if d.is_dir()]


def _macos_font_dirs() -> list[Path]:
    dirs = [Path("/System/Library/Fonts"), Path("/Library/Fonts"),
            Path.home() / "Library" / "Fonts"]
    return [d for d in dirs if d.is_dir()]


def _fc_families() -> set[str]:
    """fontconfig が知っているファミリ名（Linux / fontconfig 入りの macOS）。"""
    if not shutil.which("fc-list"):
        return set()
    try:
        out = subprocess.run(["fc-list", ":", "family"], capture_output=True,
                             text=True, timeout=10).stdout
    except (OSError, subprocess.SubprocessError):
        return set()
    families: set[str] = set()
    for line in out.splitlines():
        for name in line.split(","):
            name = name.strip()
            if name:
                families.add(name)
    return families


def available() -> list[str]:
    """この機械で使える日本語フォントのファミリ名を、優先順に返す。"""
    system = platform.system()
    found: list[str] = []

    if system == "Windows":
        files = {p.name.lower() for d in _windows_font_dirs() for p in d.glob("*.tt*")}
        for family, names in WINDOWS_CANDIDATES:
            if any(n.lower() in files for n in names) and family not in found:
                found.append(family)
        return found

    if system == "Darwin":
        files = {p.name for d in _macos_font_dirs() for p in d.iterdir() if p.is_file()}
        for family, names in MACOS_CANDIDATES:
            if any(n in files for n in names) and family not in found:
                found.append(family)
        # macOS でも fontconfig が入っていれば拾う
        families = _fc_families()
        for family in LINUX_FAMILIES:
            if family in families and family not in found:
                found.append(family)
        return found

    families = _fc_families()
    for family in LINUX_FAMILIES:
        if family in families:
            found.append(family)
    return found


def default_font() -> str:
    """入っているものの中から選ぶ。1つも無ければ総称名へ落とす。"""
    found = available()
    return found[0] if found else FALLBACK


def describe() -> str:
    """診断用の一行。"""
    found = available()
    if not found:
        return "日本語フォントが見つからない（テロップが豆腐になる）"
    return f"{found[0]}（他に {len(found) - 1} 件）" if len(found) > 1 else found[0]


def install_hint() -> str:
    system = platform.system()
    if system == "Windows":
        return (
            "Windows には通常 Yu Gothic か Meiryo が入っている。見つからない場合は "
            "[設定 → 個人用設定 → フォント] から日本語フォントを追加する。"
        )
    if system == "Darwin":
        return "macOS には通常ヒラギノが入っている。`brew install --cask font-noto-sans-cjk-jp` でも可。"
    return "`sudo apt-get install fonts-noto-cjk` で入る。"
