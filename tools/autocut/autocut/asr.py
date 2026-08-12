"""音声認識バックエンド。

自前の認識器は書かない。既定は faster-whisper（ローカル実行・外部送信なし）で、
既に文字起こしを持っている場合は JSON / SRT をそのまま食わせられる。

外部 API へ映像・音声を送るバックエンドは意図的に用意していない。素材が業務案件
である可能性を前提に、既定で外へ出さない設計にしてある。
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from . import ff
from .model import Segment, Transcript, Word


class ASRUnavailable(RuntimeError):
    pass


def transcribe(
    media: Path,
    *,
    backend: str = "faster-whisper",
    model: str = "medium",
    language: str = "ja",
    device: str = "auto",
    compute_type: str = "auto",
    fixture: Path | None = None,
    workdir: Path | None = None,
) -> Transcript:
    if backend == "fixture":
        if fixture is None:
            raise ValueError("backend=fixture には --transcript が要る")
        return _load_fixture(fixture, language=language)
    if backend == "faster-whisper":
        return _faster_whisper(
            media, model=model, language=language, device=device,
            compute_type=compute_type, workdir=workdir,
        )
    raise ValueError(f"未知の ASR backend: {backend}")


def _load_fixture(path: Path, *, language: str) -> Transcript:
    if path.suffix.lower() == ".srt":
        return _from_srt(path, language=language)
    data = json.loads(path.read_text(encoding="utf-8"))
    return Transcript.from_dict(data)


_SRT_TIME = re.compile(
    r"(\d{2}):(\d{2}):(\d{2})[,.](\d{1,3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{1,3})"
)


def _srt_seconds(h: str, m: str, s: str, ms: str) -> float:
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms.ljust(3, "0")) / 1000.0


def _from_srt(path: Path, *, language: str) -> Transcript:
    segments: list[Segment] = []
    block: list[str] = []

    def flush() -> None:
        if not block:
            return
        times = None
        text_lines: list[str] = []
        for line in block:
            m = _SRT_TIME.search(line)
            if m and times is None:
                times = (
                    _srt_seconds(*m.group(1, 2, 3, 4)),
                    _srt_seconds(*m.group(5, 6, 7, 8)),
                )
            elif times is not None:
                text_lines.append(line.strip())
            elif not line.strip().isdigit():
                text_lines.append(line.strip())
        if times:
            text = "".join(t for t in text_lines if t)
            if text:
                segments.append(_segment_with_even_words(times[0], times[1], text))
        block.clear()

    for raw in path.read_text(encoding="utf-8").splitlines():
        if raw.strip():
            block.append(raw)
        else:
            flush()
    flush()
    return Transcript(language=language, segments=segments)


def _segment_with_even_words(start: float, end: float, text: str) -> Segment:
    """語単位の時刻が無い入力に、文字数按分で仮の語時刻を割り当てる。

    これは推定であって観測ではない。カット判定には使わず、テロップの分割にだけ使う。
    """
    chars = [c for c in text if not c.isspace()]
    if not chars:
        return Segment(start, end, text, [])
    per = (end - start) / len(chars)
    words: list[Word] = []
    cursor = start
    for chunk in _chunk_japanese(text):
        n = len([c for c in chunk if not c.isspace()])
        w_end = min(end, cursor + per * n)
        words.append(Word(cursor, w_end, chunk))
        cursor = w_end
    return Segment(start, end, text, words)


def _chunk_japanese(text: str, size: int = 4) -> list[str]:
    out: list[str] = []
    buf = ""
    for ch in text:
        buf += ch
        if len(buf) >= size:
            out.append(buf)
            buf = ""
    if buf:
        out.append(buf)
    return out


def _faster_whisper(
    media: Path,
    *,
    model: str,
    language: str,
    device: str,
    compute_type: str,
    workdir: Path | None,
) -> Transcript:
    try:
        from faster_whisper import WhisperModel  # type: ignore
    except ImportError as exc:  # pragma: no cover - 依存が無い環境向け
        raise ASRUnavailable(
            "faster-whisper が入っていない。`pip install faster-whisper` で入る。"
            "既に文字起こしがあるなら `--asr fixture --transcript <json|srt>` で回せる。"
        ) from exc

    if device == "auto":
        device = "cpu"
    if compute_type == "auto":
        compute_type = "int8" if device == "cpu" else "float16"

    workdir = workdir or media.parent
    wav = ff.extract_audio(media, Path(workdir) / "audio16k.wav")

    whisper = WhisperModel(model, device=device, compute_type=compute_type)
    segments_iter, info = whisper.transcribe(
        str(wav),
        language=None if language == "auto" else language,
        word_timestamps=True,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 300},
    )

    segments: list[Segment] = []
    for seg in segments_iter:
        words = [
            Word(float(w.start), float(w.end), w.word)
            for w in (seg.words or [])
            if w.start is not None and w.end is not None
        ]
        text = (seg.text or "").strip()
        if not text:
            continue
        if not words:
            words = _segment_with_even_words(float(seg.start), float(seg.end), text).words
        segments.append(Segment(float(seg.start), float(seg.end), text, words))

    return Transcript(language=getattr(info, "language", language) or language, segments=segments)
