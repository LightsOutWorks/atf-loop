"""短尺の切り出し位置を自動で決める。

外部 API を呼ばずに完結させる。素材が業務案件でも安全に回せることを優先し、
文字起こしだけから決める規則ベースにしてある。判定根拠は必ず reason に残す。
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from .model import Highlight, Segment, Transcript
from .cutplan import FILLERS_STRICT, normalize_token

# 冒頭に来ると続きが見られやすい語。日本語の話し言葉で実際に前置きとして使われる形。
HOOK_PATTERNS: tuple[tuple[str, float], ...] = (
    (r"実は", 3.0),
    (r"結論(から)?", 3.0),
    (r"一番|最も|最大の", 2.5),
    (r"理由は|なぜ|why", 2.5),
    (r"ポイントは|コツは|秘訣", 2.5),
    (r"失敗|やりがち|間違い|注意", 2.5),
    (r"知らないと|意外と|逆に", 2.0),
    (r"おすすめ|結果的に|まとめると", 1.5),
    (r"つまり|要するに", 1.5),
    (r"[0-9０-９]+\s*(つ|個|選|steps?|点)", 3.0),
)

_SENTENCE_END = re.compile(r"[。！？!?]\s*$")


def _text_of(segments: list[Segment]) -> str:
    return "".join(s.text for s in segments)


def _hook_score(text: str) -> tuple[float, list[str]]:
    score = 0.0
    hits: list[str] = []
    for pattern, weight in HOOK_PATTERNS:
        if re.search(pattern, text):
            score += weight
            hits.append(pattern)
    return score, hits


def _filler_ratio(segments: list[Segment]) -> float:
    words = [w for s in segments for w in s.words]
    if not words:
        return 0.0
    fillers = sum(1 for w in words if normalize_token(w.text) in set(FILLERS_STRICT))
    return fillers / len(words)


def _density(segments: list[Segment]) -> float:
    chars = len(_text_of(segments))
    span = segments[-1].end - segments[0].start if segments else 0.0
    return chars / span if span > 0 else 0.0


def score_window(segments: list[Segment], *, sweet_spot: float) -> tuple[float, str]:
    if not segments:
        return 0.0, "empty"

    duration = segments[-1].end - segments[0].start
    text = _text_of(segments)

    hook, hits = _hook_score(segments[0].text)
    # 冒頭以外のフックも拾うが、重みは落とす。
    tail_hook, _ = _hook_score(text[len(segments[0].text):])
    hook += tail_hook * 0.3

    density = _density(segments)
    # 日本語の自然な話速はおおむね 5-9 文字/秒。そこから離れるほど減点する。
    density_score = max(0.0, 4.0 - abs(density - 7.0) * 0.6)

    # 目標尺からの距離。
    length_score = max(0.0, 3.0 - abs(duration - sweet_spot) / sweet_spot * 3.0)

    filler_penalty = _filler_ratio(segments) * 6.0
    complete = 1.5 if _SENTENCE_END.search(segments[-1].text) else 0.0

    total = hook + density_score + length_score + complete - filler_penalty
    reason = (
        f"hook={hook:.1f}({','.join(hits) or 'none'}) density={density:.1f}c/s"
        f" len={duration:.0f}s complete={complete:.0f} filler=-{filler_penalty:.1f}"
    )
    return total, reason


def select(
    transcript: Transcript,
    *,
    count: int = 3,
    min_duration: float = 15.0,
    max_duration: float = 58.0,
    sweet_spot: float = 35.0,
) -> list[Highlight]:
    """重ならない短尺候補を score 順に返す。"""
    segments = [s for s in transcript.segments if s.text.strip()]
    if not segments:
        return []

    candidates: list[Highlight] = []
    for i in range(len(segments)):
        window: list[Segment] = []
        for j in range(i, len(segments)):
            window.append(segments[j])
            duration = window[-1].end - window[0].start
            if duration < min_duration:
                continue
            if duration > max_duration:
                break
            score, reason = score_window(window, sweet_spot=sweet_spot)
            candidates.append(
                Highlight(
                    start=window[0].start,
                    end=window[-1].end,
                    score=score,
                    reason=reason,
                    text=_text_of(window),
                )
            )

    if not candidates:
        # 全体が min_duration に満たない素材。丸ごと 1 本にする。
        whole = segments
        score, reason = score_window(whole, sweet_spot=sweet_spot)
        return [
            Highlight(
                start=whole[0].start, end=whole[-1].end, score=score,
                reason=reason + " (source shorter than min_duration)",
                text=_text_of(whole),
            )
        ]

    candidates.sort(key=lambda h: h.score, reverse=True)
    chosen: list[Highlight] = []
    for cand in candidates:
        if len(chosen) >= count:
            break
        if any(cand.start < c.end and c.start < cand.end for c in chosen):
            continue
        chosen.append(cand)

    chosen.sort(key=lambda h: h.start)
    return chosen


def load_manual(path: Path, transcript: Transcript) -> list[Highlight]:
    """外から切り出し位置を渡す口（LLM の出力や手動指定を受ける）。"""
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    items = data["highlights"] if isinstance(data, dict) else data
    out: list[Highlight] = []
    for item in items:
        start, end = float(item["start"]), float(item["end"])
        text = "".join(
            s.text for s in transcript.segments if s.start < end and start < s.end
        )
        out.append(
            Highlight(start=start, end=end, score=float(item.get("score", 0.0)),
                      reason=item.get("reason", "manual"), text=text)
        )
    out.sort(key=lambda h: h.start)
    return out
