"""出力先ごとの仕様。

各プラットフォームの推奨に合わせた値を1箇所に集める。仕様が変わったらここだけ直す。
"""

from __future__ import annotations

from dataclasses import dataclass

from .telop import TelopStyle


@dataclass(frozen=True)
class Preset:
    key: str
    label: str
    width: int
    height: int
    fps: float
    telop_mode: str          # "segment"（一文ずつ）/ "pop"（数語ずつ）
    max_duration: float | None
    vertical: bool
    crf: int = 20

    def telop_style(self) -> TelopStyle:
        return TelopStyle.vertical() if self.vertical else TelopStyle.landscape()


YOUTUBE_LONG = Preset(
    key="youtube_long",
    label="YouTube ロング",
    width=1920, height=1080, fps=30.0,
    telop_mode="segment", max_duration=None, vertical=False,
)

YOUTUBE_SHORTS = Preset(
    key="youtube_shorts",
    label="YouTube ショート",
    width=1080, height=1920, fps=30.0,
    # Shorts は 60 秒を超えると通常動画として扱われるため、安全側の 58 秒で切る。
    telop_mode="pop", max_duration=58.0, vertical=True,
)

TIKTOK = Preset(
    key="tiktok",
    label="TikTok",
    width=1080, height=1920, fps=30.0,
    telop_mode="pop", max_duration=58.0, vertical=True,
)

ALL: dict[str, Preset] = {p.key: p for p in (YOUTUBE_LONG, YOUTUBE_SHORTS, TIKTOK)}
DEFAULT_KEYS = tuple(ALL)


def resolve(keys: list[str] | None) -> list[Preset]:
    if not keys:
        return [ALL[k] for k in DEFAULT_KEYS]
    out = []
    for key in keys:
        if key not in ALL:
            raise ValueError(f"未知の出力先: {key}（使えるのは {', '.join(ALL)}）")
        out.append(ALL[key])
    return out
