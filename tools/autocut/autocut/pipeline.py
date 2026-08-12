"""全体の組み立て。入力1本から各プラットフォーム向けの出力を作る。

対話は一切しない。呼び出し側がやることは入力パスを渡すことだけ。
"""

from __future__ import annotations

import json
import shutil
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

from . import asr, cutplan, ff, highlight as hl, telop
from .model import Highlight, TimeMap, Transcript
from .presets import Preset

LOUDNORM = "loudnorm=I=-14:TP=-1.5:LRA=11"

Logger = Callable[[str], None]


@dataclass
class Options:
    outdir: Path
    presets: list[Preset]
    asr_backend: str = "faster-whisper"
    asr_model: str = "medium"
    language: str = "ja"
    device: str = "auto"
    compute_type: str = "auto"
    transcript_path: Path | None = None
    highlights_path: Path | None = None
    shorts_count: int = 3
    shorts_min: float = 15.0
    shorts_max: float = 58.0
    remove_silence: bool = True
    remove_fillers: bool = True
    aggressive_fillers: bool = False
    silence_noise_db: float = -32.0
    silence_min: float = 0.35
    breath: float = 0.12
    reframe: str = "blur"
    normalize_audio: bool = True
    encode_preset: str = "medium"
    keep_workdir: bool = False


@dataclass
class Result:
    input: Path
    outputs: dict[str, list[Path]] = field(default_factory=dict)
    report: dict = field(default_factory=dict)


def _spec_key(preset: Preset) -> tuple:
    return (preset.width, preset.height, preset.fps, preset.telop_mode,
            preset.max_duration, preset.crf, preset.vertical)


def run(source: Path, opts: Options, log: Logger = lambda _m: None) -> Result:
    started = time.time()
    source = Path(source).resolve()
    if not source.exists():
        raise FileNotFoundError(f"入力が見つからない: {source}")

    outdir = Path(opts.outdir).resolve()
    artifacts = outdir / "artifacts"
    workdir = outdir / ".work"
    artifacts.mkdir(parents=True, exist_ok=True)
    workdir.mkdir(parents=True, exist_ok=True)

    log(f"[1/6] 入力を調べる: {source.name}")
    info = ff.probe(source)
    log(f"      {info.width}x{info.height} {info.fps:.2f}fps {info.duration:.1f}s "
        f"audio={'あり' if info.has_audio else 'なし'}")
    if not info.has_audio:
        raise ValueError("音声トラックが無い。テロップを作れないため中断する。")

    log(f"[2/6] 文字起こし（{opts.asr_backend}）")
    transcript = asr.transcribe(
        source,
        backend=opts.asr_backend,
        model=opts.asr_model,
        language=opts.language,
        device=opts.device,
        compute_type=opts.compute_type,
        fixture=opts.transcript_path,
        workdir=workdir,
    )
    transcript.dump(artifacts / "transcript.json")
    log(f"      {len(transcript.segments)} 文 / {sum(1 for _ in transcript.words())} 語")

    log("[3/6] カット計画")
    plan = cutplan.build(
        source, transcript, duration=info.duration,
        remove_silence=opts.remove_silence,
        remove_fillers=opts.remove_fillers,
        aggressive_fillers=opts.aggressive_fillers,
        silence_noise_db=opts.silence_noise_db,
        silence_min=opts.silence_min,
        breath=opts.breath,
    )
    (artifacts / "cutplan.json").write_text(
        json.dumps(plan.to_dict(), ensure_ascii=False, indent=2), encoding="utf-8"
    )
    ratio = plan.removed_duration / plan.duration * 100 if plan.duration else 0.0
    log(f"      {plan.duration:.1f}s → {plan.kept_duration:.1f}s（{ratio:.1f}% 除去 / "
        f"無音 {len(plan.dropped_silence)} 箇所・フィラー {len(plan.dropped_filler)} 箇所）")

    timemap = TimeMap(plan.keeps)

    log("[4/6] 短尺の切り出し位置を決める")
    if opts.highlights_path:
        highlights = hl.load_manual(opts.highlights_path, transcript)
    else:
        highlights = hl.select(
            transcript, count=opts.shorts_count,
            min_duration=opts.shorts_min, max_duration=opts.shorts_max,
        )
    for i, h in enumerate(highlights, 1):
        log(f"      #{i} {h.start:.1f}-{h.end:.1f}s score={h.score:.1f} [{h.reason}]")
    (artifacts / "highlights.json").write_text(
        json.dumps(
            {"highlights": [
                {"start": round(h.start, 3), "end": round(h.end, 3),
                 "score": round(h.score, 3), "reason": h.reason, "text": h.text}
                for h in highlights
            ]}, ensure_ascii=False, indent=2,
        ), encoding="utf-8",
    )

    audio_filter = LOUDNORM if opts.normalize_audio else ""
    outputs: dict[str, list[Path]] = {}
    rendered_specs: dict[tuple, tuple[str, list[Path]]] = {}

    log("[5/6] 書き出し")
    for preset in opts.presets:
        key = _spec_key(preset)
        target_dir = outdir / preset.key
        target_dir.mkdir(parents=True, exist_ok=True)

        if key in rendered_specs:
            origin_key, source_files = rendered_specs[key]
            copies = []
            for src_file in source_files:
                dst = target_dir / src_file.name.replace(origin_key, preset.key, 1)
                shutil.copyfile(src_file, dst)
                copies.append(dst)
            outputs[preset.key] = copies
            log(f"      {preset.label}: {origin_key} と同一仕様のため再利用（{len(copies)} 本）")
            continue

        if preset.vertical:
            files = _render_vertical_set(
                source, preset, plan, timemap, transcript, highlights,
                workdir, artifacts, target_dir, audio_filter, opts, info, log,
            )
        else:
            files = [_render_long(
                source, preset, plan, timemap, transcript,
                artifacts, target_dir, audio_filter, opts, info, log,
            )]

        outputs[preset.key] = files
        rendered_specs[key] = (preset.key, files)

    log("[6/6] 記録")
    report = {
        "input": str(source),
        "input_duration": round(info.duration, 3),
        "input_resolution": f"{info.width}x{info.height}",
        "asr_backend": opts.asr_backend,
        "asr_model": opts.asr_model if opts.asr_backend == "faster-whisper" else None,
        "cutplan": plan.to_dict(),
        "highlights": [
            {"start": round(h.start, 3), "end": round(h.end, 3),
             "score": round(h.score, 3), "reason": h.reason}
            for h in highlights
        ],
        "outputs": {k: [str(p) for p in v] for k, v in outputs.items()},
        "elapsed_seconds": round(time.time() - started, 1),
    }
    (artifacts / "report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    if not opts.keep_workdir:
        shutil.rmtree(workdir, ignore_errors=True)

    return Result(input=source, outputs=outputs, report=report)


def _render_long(
    source: Path, preset: Preset, plan, timemap: TimeMap, transcript: Transcript,
    artifacts: Path, target_dir: Path, audio_filter: str, opts: Options, info, log: Logger,
) -> Path:
    events = telop.build_events(
        transcript, timemap, mode=preset.telop_mode, style=preset.telop_style()
    )
    ass_path = artifacts / f"{preset.key}.ass"
    ass_path.write_text(
        telop.render_ass(events, preset.width, preset.height, preset.telop_style()),
        encoding="utf-8",
    )

    dst = target_dir / f"{source.stem}_{preset.key}.mp4"
    ff.concat_segments(
        source, plan.keeps, dst,
        video_filter=f"ass={ff.escape_filter_path(ass_path)}",
        audio_filter=audio_filter,
        fps=preset.fps, width=preset.width, height=preset.height,
        crf=preset.crf, preset=opts.encode_preset, has_audio=info.has_audio,
    )
    log(f"      {preset.label}: {dst.name}（テロップ {len(events)} 枚）")
    return dst


def _clip_keeps(keeps: list[tuple[float, float]], start: float, end: float) -> list[tuple[float, float]]:
    out = []
    for s, e in keeps:
        a, b = max(s, start), min(e, end)
        if b - a > 0.05:
            out.append((a, b))
    return out


def _render_vertical_set(
    source: Path, preset: Preset, plan, timemap: TimeMap, transcript: Transcript,
    highlights: list[Highlight], workdir: Path, artifacts: Path, target_dir: Path,
    audio_filter: str, opts: Options, info, log: Logger,
) -> list[Path]:
    files: list[Path] = []
    for index, spot in enumerate(highlights, 1):
        keeps = _clip_keeps(plan.keeps, spot.start, spot.end)
        if not keeps:
            log(f"      {preset.label} #{index}: カット後に残らないため飛ばす")
            continue

        # 尺の上限で後ろを削る（カット後の実尺で測る）。
        if preset.max_duration:
            budget = preset.max_duration
            trimmed: list[tuple[float, float]] = []
            for s, e in keeps:
                if budget <= 0:
                    break
                span = min(e - s, budget)
                trimmed.append((s, s + span))
                budget -= span
            keeps = trimmed

        clip_start, clip_end = keeps[0][0], keeps[-1][1]
        stem = f"{source.stem}_{preset.key}_{index:02d}"

        cut = ff.concat_segments(
            source, keeps, workdir / f"{stem}_cut.mp4",
            fps=preset.fps, crf=18, preset="veryfast", has_audio=info.has_audio,
        )

        events = telop.build_events(
            transcript, timemap, mode=preset.telop_mode,
            style=preset.telop_style(), clip=(clip_start, clip_end),
        )
        ass_path = artifacts / f"{stem}.ass"
        ass_path.write_text(
            telop.render_ass(events, preset.width, preset.height, preset.telop_style()),
            encoding="utf-8",
        )

        dst = target_dir / f"{stem}.mp4"
        ff.render_vertical(
            cut, dst, ass=ass_path,
            width=preset.width, height=preset.height, fps=preset.fps,
            mode=opts.reframe, audio_filter=audio_filter,
            crf=preset.crf, preset=opts.encode_preset, has_audio=info.has_audio,
        )
        files.append(dst)
        log(f"      {preset.label} #{index}: {dst.name}（テロップ {len(events)} 枚）")
    return files
