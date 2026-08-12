"""カット計画。無音とフィラーを落として「残す区間」を決める。

テンポを上げる効果の大半はここで出る。ただし無音を全部削ると機械的に聞こえるため、
息継ぎ分を必ず残す。何を落としたかは全て記録し、後から検証できる形にする。
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from . import ff
from .model import Range, Transcript, invert_ranges, merge_ranges

# 常に落とすフィラー。単独で意味を持たない言い淀みだけを入れてある。
FILLERS_STRICT: tuple[str, ...] = (
    "えー", "えーと", "えっと", "ええと", "えーっと", "えと",
    "あー", "あのー", "あのう", "あーと",
    "うー", "うーん", "うーんと", "んー", "んーと",
    "おー", "そのー", "まー",
)

# 文脈次第で意味を持つ語。--aggressive-fillers を付けた時だけ落とす。
FILLERS_LOOSE: tuple[str, ...] = (
    "あの", "その", "まあ", "なんか", "ええ", "はい", "ね", "で",
)

# 長音符「ー」は入れない。「えー」「あのー」のように、フィラーの語形そのものを
# 作っている文字であり、句読点として削ると照合が壊れる（2026-08-12 実測で発覚）。
_TRIM_CHARS = " 　、。,.!?！？「」『』・…\t\n"


@dataclass
class CutPlan:
    duration: float
    keeps: list[Range]
    dropped_silence: list[Range] = field(default_factory=list)
    dropped_filler: list[Range] = field(default_factory=list)
    filler_words: list[str] = field(default_factory=list)

    @property
    def kept_duration(self) -> float:
        return sum(e - s for s, e in self.keeps)

    @property
    def removed_duration(self) -> float:
        return max(0.0, self.duration - self.kept_duration)

    def to_dict(self) -> dict:
        return {
            "input_duration": round(self.duration, 3),
            "output_duration": round(self.kept_duration, 3),
            "removed_duration": round(self.removed_duration, 3),
            "removed_ratio": round(self.removed_duration / self.duration, 4) if self.duration else 0.0,
            "keep_count": len(self.keeps),
            "silence_cuts": len(self.dropped_silence),
            "filler_cuts": len(self.dropped_filler),
            "filler_words": self.filler_words,
            "keeps": [[round(s, 3), round(e, 3)] for s, e in self.keeps],
        }


def normalize_token(text: str) -> str:
    return text.strip(_TRIM_CHARS)


def find_filler_ranges(
    transcript: Transcript,
    *,
    aggressive: bool = False,
    min_span: float = 0.12,
) -> tuple[list[Range], list[str]]:
    """フィラー語の時間区間を返す。

    min_span より短いものは無視する。切っても聞き分けられない一方で、
    細切れのカットは映像側のつなぎ目を増やすだけだからである。
    """
    vocab = set(FILLERS_STRICT)
    if aggressive:
        vocab |= set(FILLERS_LOOSE)

    ranges: list[Range] = []
    hits: list[str] = []
    for word in transcript.words():
        token = normalize_token(word.text)
        if not token or token not in vocab:
            continue
        if word.duration < min_span:
            continue
        ranges.append((word.start, word.end))
        hits.append(token)
    return merge_ranges(ranges), hits


def build(
    media: Path,
    transcript: Transcript,
    *,
    duration: float,
    remove_silence: bool = True,
    remove_fillers: bool = True,
    aggressive_fillers: bool = False,
    silence_noise_db: float = -32.0,
    silence_min: float = 0.35,
    breath: float = 0.12,
    min_keep: float = 0.25,
    join_gap: float = 0.06,
) -> CutPlan:
    """残す区間を決める。

    breath は各無音区間の両端に残す秒数。ここをゼロにすると詰まって聞こえる。
    """
    silences: list[Range] = []
    if remove_silence:
        try:
            detected = ff.detect_silence(
                media, noise_db=silence_noise_db, min_duration=silence_min
            )
        except ff.FFmpegFailed:
            detected = []
        for start, end in detected:
            cut_start = start + breath
            cut_end = end - breath
            if cut_end - cut_start > 0.05:
                silences.append((cut_start, cut_end))

    fillers: list[Range] = []
    filler_words: list[str] = []
    if remove_fillers:
        fillers, filler_words = find_filler_ranges(transcript, aggressive=aggressive_fillers)

    drops = merge_ranges(silences + fillers)
    keeps = invert_ranges(drops, duration)

    # 細切れを畳んでから、短すぎる断片を捨てる。
    keeps = merge_ranges(keeps, gap=join_gap)
    keeps = [(s, e) for s, e in keeps if e - s >= min_keep]

    if not keeps:
        keeps = [(0.0, duration)]

    return CutPlan(
        duration=duration,
        keeps=keeps,
        dropped_silence=silences,
        dropped_filler=fillers,
        filler_words=filler_words,
    )


def passthrough(duration: float) -> CutPlan:
    """カットしない計画（--no-cut 用）。"""
    return CutPlan(duration=duration, keeps=[(0.0, duration)])
