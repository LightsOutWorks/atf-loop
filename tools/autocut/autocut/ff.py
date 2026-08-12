"""ffmpeg / ffprobe の薄いラッパ。

編集も描画も ffmpeg に任せる。ここが持つのは呼び出しと結果の解釈だけで、
映像処理そのものは一切自作しない。
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

from .model import Range, merge_ranges


class FFmpegNotFound(RuntimeError):
    pass


class FFmpegFailed(RuntimeError):
    def __init__(self, cmd: list[str], returncode: int, stderr: str):
        self.cmd = cmd
        self.returncode = returncode
        self.stderr = stderr
        tail = "\n".join(stderr.strip().splitlines()[-15:])
        super().__init__(f"ffmpeg exited {returncode}\n$ {' '.join(cmd[:6])} ...\n{tail}")


def _binary(name: str) -> str:
    path = shutil.which(name)
    if not path:
        raise FFmpegNotFound(
            f"{name} が見つからない。Ubuntu/Debian なら `apt-get install ffmpeg`、"
            "macOS なら `brew install ffmpeg` で入る。"
        )
    return path


def ffmpeg_bin() -> str:
    return _binary("ffmpeg")


def ffprobe_bin() -> str:
    return _binary("ffprobe")


def run(cmd: list[str], *, quiet: bool = True) -> subprocess.CompletedProcess:
    proc = subprocess.run(cmd, capture_output=True, text=True, errors="replace")
    if proc.returncode != 0:
        raise FFmpegFailed(cmd, proc.returncode, proc.stderr)
    return proc


@dataclass
class MediaInfo:
    path: Path
    duration: float
    width: int
    height: int
    fps: float
    has_audio: bool

    @property
    def aspect(self) -> float:
        return self.width / self.height if self.height else 0.0


def probe(path: Path) -> MediaInfo:
    out = run(
        [
            ffprobe_bin(), "-v", "error", "-print_format", "json",
            "-show_format", "-show_streams", str(path),
        ]
    ).stdout
    data = json.loads(out)
    streams = data.get("streams", [])
    video = next((s for s in streams if s.get("codec_type") == "video"), None)
    audio = next((s for s in streams if s.get("codec_type") == "audio"), None)
    if video is None:
        raise ValueError(f"映像ストリームが無い: {path}")

    duration = float(data.get("format", {}).get("duration") or video.get("duration") or 0.0)
    fps = 30.0
    raw_fps = video.get("avg_frame_rate") or video.get("r_frame_rate") or "30/1"
    if "/" in raw_fps:
        num, _, den = raw_fps.partition("/")
        try:
            if float(den):
                fps = float(num) / float(den)
        except ValueError:
            pass

    return MediaInfo(
        path=path,
        duration=duration,
        width=int(video.get("width") or 0),
        height=int(video.get("height") or 0),
        fps=round(fps, 3) or 30.0,
        has_audio=audio is not None,
    )


_SILENCE_START = re.compile(r"silence_start:\s*(-?[\d.]+)")
_SILENCE_END = re.compile(r"silence_end:\s*(-?[\d.]+)")


def detect_silence(path: Path, *, noise_db: float = -32.0, min_duration: float = 0.35) -> list[Range]:
    """無音区間を返す。ffmpeg の silencedetect をそのまま使う。"""
    cmd = [
        ffmpeg_bin(), "-hide_banner", "-nostdin", "-i", str(path),
        "-map", "0:a:0",
        "-af", f"silencedetect=noise={noise_db}dB:d={min_duration}",
        "-f", "null", "-",
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, errors="replace")
    if proc.returncode != 0:
        raise FFmpegFailed(cmd, proc.returncode, proc.stderr)

    ranges: list[Range] = []
    pending: float | None = None
    for line in proc.stderr.splitlines():
        m = _SILENCE_START.search(line)
        if m:
            pending = max(0.0, float(m.group(1)))
            continue
        m = _SILENCE_END.search(line)
        if m and pending is not None:
            end = float(m.group(1))
            if end > pending:
                ranges.append((pending, end))
            pending = None
    if pending is not None:
        info = probe(path)
        if info.duration > pending:
            ranges.append((pending, info.duration))
    return merge_ranges(ranges)


def extract_audio(src: Path, dst: Path, *, sample_rate: int = 16000) -> Path:
    """ASR 用に 16kHz モノラル WAV を作る。"""
    dst.parent.mkdir(parents=True, exist_ok=True)
    run([
        ffmpeg_bin(), "-hide_banner", "-nostdin", "-y", "-i", str(src),
        "-vn", "-ac", "1", "-ar", str(sample_rate), "-c:a", "pcm_s16le", str(dst),
    ])
    return dst


def concat_segments(
    src: Path,
    keeps: list[Range],
    dst: Path,
    *,
    video_filter: str = "",
    audio_filter: str = "",
    fps: float = 30.0,
    width: int | None = None,
    height: int | None = None,
    crf: int = 20,
    preset: str = "medium",
    has_audio: bool = True,
) -> Path:
    """keeps の区間だけを繋いだ動画を書き出す。

    filter_complex の trim/concat で 1 パス処理する。区間数が増えるとコマンドが
    長くなるため、フィルタは常にファイル経由（-filter_complex_script）で渡す。
    """
    if not keeps:
        raise ValueError("keeps が空。出力するものが無い。")

    dst.parent.mkdir(parents=True, exist_ok=True)
    parts: list[str] = []
    vlabels: list[str] = []
    alabels: list[str] = []

    for i, (start, end) in enumerate(keeps):
        parts.append(
            f"[0:v]trim=start={start:.4f}:end={end:.4f},setpts=PTS-STARTPTS[v{i}];"
        )
        vlabels.append(f"[v{i}]")
        if has_audio:
            parts.append(
                f"[0:a]atrim=start={start:.4f}:end={end:.4f},asetpts=PTS-STARTPTS[a{i}];"
            )
            alabels.append(f"[a{i}]")

    n = len(keeps)
    if has_audio:
        parts.append("".join(f"{v}{a}" for v, a in zip(vlabels, alabels)))
        parts.append(f"concat=n={n}:v=1:a=1[vcat][acat];")
    else:
        parts.append("".join(vlabels))
        parts.append(f"concat=n={n}:v=1:a=0[vcat];")

    vchain = f"[vcat]fps={fps}"
    if width and height:
        vchain += (
            f",scale={width}:{height}:force_original_aspect_ratio=decrease"
            f",pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color=black"
        )
    if video_filter:
        vchain += "," + video_filter
    vchain += ",format=yuv420p[vout];"
    parts.append(vchain)

    if has_audio:
        achain = "[acat]" + (audio_filter or "anull") + "[aout]"
        parts.append(achain)

    filtergraph = "".join(parts).rstrip(";")

    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as fh:
        fh.write(filtergraph)
        script = fh.name

    cmd = [
        ffmpeg_bin(), "-hide_banner", "-nostdin", "-y", "-i", str(src),
        "-filter_complex_script", script,
        "-map", "[vout]",
    ]
    if has_audio:
        cmd += ["-map", "[aout]", "-c:a", "aac", "-b:a", "192k"]
    cmd += [
        "-c:v", "libx264", "-preset", preset, "-crf", str(crf),
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(dst),
    ]
    try:
        run(cmd)
    finally:
        Path(script).unlink(missing_ok=True)
    return dst


def burn_and_encode(
    src: Path,
    dst: Path,
    *,
    video_filter: str,
    audio_filter: str = "",
    crf: int = 20,
    preset: str = "medium",
    has_audio: bool = True,
) -> Path:
    """単一のフィルタチェーンを適用して書き出す（カット済みの素材向け）。"""
    dst.parent.mkdir(parents=True, exist_ok=True)
    cmd = [ffmpeg_bin(), "-hide_banner", "-nostdin", "-y", "-i", str(src)]
    cmd += ["-vf", video_filter]
    if has_audio and audio_filter:
        cmd += ["-af", audio_filter]
    cmd += [
        "-c:v", "libx264", "-preset", preset, "-crf", str(crf),
        "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    ]
    if has_audio:
        cmd += ["-c:a", "aac", "-b:a", "192k"]
    else:
        cmd += ["-an"]
    cmd += [str(dst)]
    run(cmd)
    return dst


def escape_filter_path(path: Path) -> str:
    """filtergraph の引数に埋め込める形へ逃がす。"""
    text = str(path)
    for src_ch, dst_ch in (("\\", "\\\\"), (":", "\\:"), ("'", "\\'"), (",", "\\,")):
        text = text.replace(src_ch, dst_ch)
    return text


def render_vertical(
    src: Path,
    dst: Path,
    *,
    ass: Path | None,
    width: int = 1080,
    height: int = 1920,
    fps: float = 30.0,
    mode: str = "blur",
    audio_filter: str = "",
    crf: int = 20,
    preset: str = "medium",
    has_audio: bool = True,
) -> Path:
    """縦型（9:16）へ組み直してテロップを焼く。

    mode="blur" は元映像を全部残し、背景にぼかし版を敷く。被写体が切れないため既定。
    mode="crop" は中央を切り抜いて画面を埋める。
    """
    dst.parent.mkdir(parents=True, exist_ok=True)
    ass_step = f",ass={escape_filter_path(ass)}" if ass else ""

    if mode == "crop":
        graph = (
            f"[0:v]fps={fps},scale={width}:{height}:force_original_aspect_ratio=increase,"
            f"crop={width}:{height}{ass_step},format=yuv420p[vout]"
        )
    else:
        graph = (
            f"[0:v]fps={fps},split=2[bg][fg];"
            f"[bg]scale={width}:{height}:force_original_aspect_ratio=increase,"
            f"crop={width}:{height},gblur=sigma=24,eq=brightness=-0.08[bgb];"
            f"[fg]scale={width}:{height}:force_original_aspect_ratio=decrease[fgs];"
            f"[bgb][fgs]overlay=(W-w)/2:(H-h)/2[comp];"
            f"[comp]{('ass=' + escape_filter_path(ass) + ',') if ass else ''}"
            f"format=yuv420p[vout]"
        )

    cmd = [
        ffmpeg_bin(), "-hide_banner", "-nostdin", "-y", "-i", str(src),
        "-filter_complex", graph, "-map", "[vout]",
    ]
    if has_audio:
        cmd += ["-map", "0:a:0"]
        if audio_filter:
            cmd += ["-af", audio_filter]
        cmd += ["-c:a", "aac", "-b:a", "192k"]
    else:
        cmd += ["-an"]
    cmd += [
        "-c:v", "libx264", "-preset", preset, "-crf", str(crf),
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(dst),
    ]
    run(cmd)
    return dst


def cut_clip(src: Path, start: float, end: float, dst: Path) -> Path:
    """区間を切り出す（再エンコード。フレーム境界のずれを避ける）。"""
    dst.parent.mkdir(parents=True, exist_ok=True)
    run([
        ffmpeg_bin(), "-hide_banner", "-nostdin", "-y",
        "-i", str(src), "-ss", f"{start:.4f}", "-to", f"{end:.4f}",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k", "-pix_fmt", "yuv420p", str(dst),
    ])
    return dst
