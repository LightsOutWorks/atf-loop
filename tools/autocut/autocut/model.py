"""Data types shared across the pipeline.

時間はすべて「入力動画の先頭からの秒数」で持つ。カット後の出力タイムラインへ
移す必要があるものは TimeMap を通す。二つの時間軸を混ぜないための型である。
"""

from __future__ import annotations

import bisect
import dataclasses
import json
from dataclasses import dataclass, field
from typing import Iterable, Iterator, Sequence


@dataclass(frozen=True)
class Word:
    start: float
    end: float
    text: str

    @property
    def duration(self) -> float:
        return max(0.0, self.end - self.start)


@dataclass
class Segment:
    """ASR が返す発話のまとまり（おおむね一文）。"""

    start: float
    end: float
    text: str
    words: list[Word] = field(default_factory=list)

    @property
    def duration(self) -> float:
        return max(0.0, self.end - self.start)


@dataclass
class Transcript:
    language: str
    segments: list[Segment] = field(default_factory=list)

    def words(self) -> Iterator[Word]:
        for seg in self.segments:
            yield from seg.words

    @property
    def duration(self) -> float:
        return self.segments[-1].end if self.segments else 0.0

    def to_dict(self) -> dict:
        return {
            "language": self.language,
            "segments": [
                {
                    "start": s.start,
                    "end": s.end,
                    "text": s.text,
                    "words": [dataclasses.asdict(w) for w in s.words],
                }
                for s in self.segments
            ],
        }

    @classmethod
    def from_dict(cls, d: dict) -> "Transcript":
        segs = []
        for s in d.get("segments", []):
            words = [Word(float(w["start"]), float(w["end"]), w["text"]) for w in s.get("words", [])]
            segs.append(Segment(float(s["start"]), float(s["end"]), s["text"], words))
        return cls(language=d.get("language", "ja"), segments=segs)

    def dump(self, path) -> None:
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(self.to_dict(), fh, ensure_ascii=False, indent=2)

    @classmethod
    def load(cls, path) -> "Transcript":
        with open(path, encoding="utf-8") as fh:
            return cls.from_dict(json.load(fh))


Range = tuple[float, float]


def merge_ranges(ranges: Iterable[Range], gap: float = 0.0) -> list[Range]:
    """重なり・隣接する区間を畳む。gap 以下の隙間も繋ぐ。"""
    ordered = sorted((s, e) for s, e in ranges if e > s)
    out: list[Range] = []
    for start, end in ordered:
        if out and start - out[-1][1] <= gap:
            out[-1] = (out[-1][0], max(out[-1][1], end))
        else:
            out.append((start, end))
    return out


def invert_ranges(ranges: Sequence[Range], total: float) -> list[Range]:
    """[0, total] のうち ranges に含まれない部分を返す。"""
    out: list[Range] = []
    cursor = 0.0
    for start, end in merge_ranges(ranges):
        if start > cursor:
            out.append((cursor, min(start, total)))
        cursor = max(cursor, end)
        if cursor >= total:
            break
    if cursor < total:
        out.append((cursor, total))
    return [(s, e) for s, e in out if e - s > 1e-6]


class TimeMap:
    """残す区間の列から「入力時刻 → 出力時刻」の写像を作る。

    カット後にテロップの時刻がずれるのを防ぐための唯一の経路。keeps に含まれない
    時刻は、その時刻を挟む最も近い境界へ丸める（落とした区間の中身は出力に無い）。
    """

    def __init__(self, keeps: Sequence[Range]):
        self.keeps: list[Range] = [(s, e) for s, e in merge_ranges(keeps) if e > s]
        self._starts = [s for s, _ in self.keeps]
        self._offsets: list[float] = []
        acc = 0.0
        for start, end in self.keeps:
            self._offsets.append(acc)
            acc += end - start
        self.output_duration = acc

    def __bool__(self) -> bool:
        return bool(self.keeps)

    def contains(self, t: float) -> bool:
        i = bisect.bisect_right(self._starts, t) - 1
        return i >= 0 and self.keeps[i][0] <= t <= self.keeps[i][1]

    def map(self, t: float) -> float:
        if not self.keeps:
            return 0.0
        i = bisect.bisect_right(self._starts, t) - 1
        if i < 0:
            return 0.0
        start, end = self.keeps[i]
        if t <= end:
            return self._offsets[i] + (t - start)
        # 落とした区間に落ちた時刻。直前の keep の末尾へ丸める。
        return self._offsets[i] + (end - start)

    def map_range(self, start: float, end: float) -> Range | None:
        """区間を出力タイムラインへ移す。完全に落ちていれば None。"""
        if not self.keeps:
            return None
        if not any(s < end and start < e for s, e in self.keeps):
            return None
        a, b = self.map(start), self.map(end)
        return (a, b) if b - a > 1e-3 else None


@dataclass
class Highlight:
    """短尺として切り出す候補。時刻は入力タイムライン。"""

    start: float
    end: float
    score: float
    reason: str
    text: str = ""

    @property
    def duration(self) -> float:
        return max(0.0, self.end - self.start)
