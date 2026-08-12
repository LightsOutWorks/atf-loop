"""テロップ（ASS 字幕）の生成。

描画は libass に任せる。ここが持つのは、日本語として読める位置で改行することと、
カット後のタイムラインへ時刻を移すことだけ。
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from .model import TimeMap, Transcript, Word

# 行頭に置いてはいけない文字（禁則処理）。
NO_LINE_START = "、。，．・：；？！）〕］｝」』】〉》〟ゝゞ々ーぁぃぅぇぉっゃゅょゎヵヶ!?,.:;)]}"
# 行末に置いてはいけない文字。
NO_LINE_END = "（〔［｛「『【〈《〝([{"

_WS = re.compile(r"[ \t　]+")


@dataclass(frozen=True)
class TelopStyle:
    font: str = "Noto Sans CJK JP"
    size: int = 64
    bold: bool = True
    primary: str = "&H00FFFFFF"      # 白（ASS は &HAABBGGRR）
    outline_colour: str = "&H00000000"  # 黒縁
    back_colour: str = "&H90000000"     # 影
    outline: float = 4.0
    shadow: float = 2.0
    alignment: int = 2                  # 2 = 下中央
    margin_v: int = 90
    margin_h: int = 60
    max_chars: int = 22
    max_lines: int = 2

    @classmethod
    def landscape(cls) -> "TelopStyle":
        """YouTube ロング向け。落ち着いた大きさで一文ずつ出す。"""
        return cls(size=54, outline=3.5, margin_v=70, max_chars=28, max_lines=2)

    @classmethod
    def vertical(cls) -> "TelopStyle":
        """ショート / TikTok 向け。大きく、短く、画面中央寄りに出す。"""
        return cls(size=82, outline=5.0, shadow=2.5, margin_v=380, max_chars=11, max_lines=2)


@dataclass
class Event:
    start: float
    end: float
    text: str

    @property
    def duration(self) -> float:
        return max(0.0, self.end - self.start)


def _clean(text: str) -> str:
    return _WS.sub("", text.strip())


def wrap_japanese(text: str, max_chars: int, max_lines: int = 2) -> str:
    """max_chars で折り返しつつ、禁則処理で1文字ぶん寄せる。"""
    text = _clean(text)
    if not text:
        return ""
    lines: list[str] = []
    rest = text
    while rest and len(lines) < max_lines:
        if len(rest) <= max_chars:
            lines.append(rest)
            rest = ""
            break
        cut = max_chars
        # 読点・句点が折返し位置の近くにあるなら、そこで切ると意味の切れ目と一致する。
        window = rest[: max_chars + 1]
        breaks = [i + 1 for i, ch in enumerate(window) if ch in "、。！？"]
        near = [b for b in breaks if b >= max_chars * 0.5]
        if near:
            cut = near[-1]
        else:
            # 行頭に来られない文字が次に来るなら、1文字送って引き取る。
            while cut < len(rest) and rest[cut] in NO_LINE_START:
                cut += 1
            # 行末に来られない文字で切れるなら、1文字戻す。
            while cut > 1 and rest[cut - 1] in NO_LINE_END:
                cut -= 1
        lines.append(rest[:cut])
        rest = rest[cut:]
    if rest and lines:
        # 収まらなかった分は最終行へ足す（切り捨てない）。
        lines[-1] += rest
    return r"\N".join(lines)


def _chunk_words(words: list[Word], chunk_chars: int) -> list[Event]:
    events: list[Event] = []
    buf: list[Word] = []
    length = 0
    for word in words:
        token = _clean(word.text)
        if not token:
            continue
        # 足すと上限を超えるなら、先に吐き出す。超えてから切ると1枚が長くなりすぎる。
        if buf and length + len(token) > chunk_chars:
            events.append(Event(buf[0].start, buf[-1].end, "".join(_clean(w.text) for w in buf)))
            buf, length = [], 0
        buf.append(word)
        length += len(token)
        if length >= chunk_chars:
            events.append(Event(buf[0].start, buf[-1].end, "".join(_clean(w.text) for w in buf)))
            buf, length = [], 0
    if buf:
        events.append(Event(buf[0].start, buf[-1].end, "".join(_clean(w.text) for w in buf)))
    return events


def build_events(
    transcript: Transcript,
    timemap: TimeMap,
    *,
    mode: str = "segment",
    style: TelopStyle | None = None,
    clip: tuple[float, float] | None = None,
    min_duration: float = 0.25,
) -> list[Event]:
    """文字起こしからテロップ事象を作り、出力タイムラインへ移す。

    mode="segment" は一文まるごと、mode="pop" は数語ずつ切り替える短尺向けの出し方。
    clip を渡すと、その入力区間だけを対象にし、区間先頭を 0 秒とする。
    """
    style = style or TelopStyle()
    raw: list[Event] = []

    for seg in transcript.segments:
        text = _clean(seg.text)
        if not text:
            continue
        if clip and (seg.end <= clip[0] or seg.start >= clip[1]):
            continue
        if mode == "pop" and seg.words:
            raw.extend(_chunk_words(seg.words, style.max_chars))
        else:
            raw.append(Event(seg.start, seg.end, text))

    mapped: list[Event] = []
    for ev in raw:
        start, end = ev.start, ev.end
        if clip:
            start = max(start, clip[0])
            end = min(end, clip[1])
            if end - start <= 0:
                continue
        span = timemap.map_range(start, end)
        if span is None:
            continue
        a, b = span
        if clip:
            base = timemap.map(clip[0])
            a, b = a - base, b - base
        if b - a < min_duration:
            b = a + min_duration
        mapped.append(Event(a, b, ev.text))

    mapped.sort(key=lambda e: e.start)

    # 重なりを解く。後ろの開始で前を切り詰める。
    out: list[Event] = []
    for i, ev in enumerate(mapped):
        end = ev.end
        if i + 1 < len(mapped):
            end = min(end, mapped[i + 1].start)
        if end - ev.start < 0.12:
            continue
        out.append(Event(ev.start, end, ev.text))
    return out


def _ass_time(seconds: float) -> str:
    seconds = max(0.0, seconds)
    hours, rem = divmod(seconds, 3600)
    minutes, secs = divmod(rem, 60)
    return f"{int(hours)}:{int(minutes):02d}:{secs:05.2f}"


def render_ass(events: list[Event], width: int, height: int, style: TelopStyle) -> str:
    head = [
        "[Script Info]",
        "ScriptType: v4.00+",
        f"PlayResX: {width}",
        f"PlayResY: {height}",
        "WrapStyle: 2",
        "ScaledBorderAndShadow: yes",
        "YCbCr Matrix: TV.709",
        "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour,"
        " BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle,"
        " BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        (
            f"Style: Telop,{style.font},{style.size},{style.primary},&H000000FF,"
            f"{style.outline_colour},{style.back_colour},{1 if style.bold else 0},0,0,0,"
            f"100,100,0,0,1,{style.outline},{style.shadow},{style.alignment},"
            f"{style.margin_h},{style.margin_h},{style.margin_v},1"
        ),
        "",
        "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]
    body = [
        (
            f"Dialogue: 0,{_ass_time(ev.start)},{_ass_time(ev.end)},Telop,,0,0,0,,"
            + wrap_japanese(ev.text, style.max_chars, style.max_lines)
        )
        for ev in events
        if _clean(ev.text)
    ]
    return "\n".join(head + body) + "\n"
