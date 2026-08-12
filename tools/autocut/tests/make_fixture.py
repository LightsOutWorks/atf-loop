"""検証用の素材を作る。

espeak-ng で日本語を合成し、無音とフィラーを意図的に入れた動画を1本組む。
何を何秒に置いたかが分かっているので、カット結果・テロップ位置を実測で照合できる。

    python tests/make_fixture.py --out /tmp/fixture

出るもの:
    fixture.mp4        検証用の動画
    fixture.json       正解の文字起こし（--asr fixture に渡す）
    fixture_truth.json 期待値（無音区間・フィラー区間）
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import wave
from pathlib import Path

# (話す内容, フィラーか)。フィラーは単独の発話として置き、境界を厳密にする。
SCRIPT: list[tuple[str, bool]] = [
    ("えー", True),
    ("実は、動画編集で一番時間を食うのは、カットとテロップの作業です。", False),
    ("あのー", True),
    ("撮影そのものは三十分で終わっても、編集に三時間かかることがあります。", False),
    ("結論から言うと、この二つは機械に任せられます。", False),
    ("えーと", True),
    ("理由は三つあります。", False),
    ("一つ目は、無音の切り詰めが音量の判定だけでできるからです。", False),
    ("二つ目は、文字起こしの精度が実用の水準に届いたからです。", False),
    ("うーん", True),
    ("三つ目は、縦型への組み直しが決まった手順に落ちるからです。", False),
    ("ポイントは、人が判断する場所を一箇所に絞ることです。", False),
    ("失敗しやすいのは、全部を自動にしようとして確認を捨てる場合です。", False),
    ("まとめると、撮って渡すだけで三種類の動画が出る状態を作れます。", False),
]

SILENCE_BEFORE = 0.65   # 各発話の前に入れる無音（秒）
LEAD_IN = 1.0           # 冒頭の無音
TAIL = 1.2              # 末尾の無音
SPEED = 145             # espeak-ng の話速


def require(binary: str) -> str:
    path = shutil.which(binary)
    if not path:
        sys.exit(f"{binary} が要る。`apt-get install {binary}` などで入れる。")
    return path


def synth(text: str, dst: Path) -> Path:
    subprocess.run(
        [require("espeak-ng"), "-v", "ja", "-s", str(SPEED), "-w", str(dst), text],
        check=True, capture_output=True,
    )
    return dst


def split_words(text: str, start: float, end: float, size: int = 5) -> list[dict]:
    """文を数文字ずつに割り、時間を文字数で按分する。"""
    chunks: list[str] = []
    buf = ""
    for ch in text:
        buf += ch
        if len(buf) >= size:
            chunks.append(buf)
            buf = ""
    if buf:
        chunks.append(buf)

    total = sum(len(c) for c in chunks) or 1
    words = []
    cursor = start
    for chunk in chunks:
        span = (end - start) * len(chunk) / total
        words.append({"start": round(cursor, 3), "end": round(cursor + span, 3), "text": chunk})
        cursor += span
    if words:
        words[-1]["end"] = round(end, 3)
    return words


def build(outdir: Path) -> dict:
    outdir.mkdir(parents=True, exist_ok=True)
    parts = outdir / "_parts"
    parts.mkdir(exist_ok=True)

    rendered: list[tuple[str, bool, Path]] = []
    for i, (text, is_filler) in enumerate(SCRIPT):
        rendered.append((text, is_filler, synth(text, parts / f"u{i:02d}.wav")))

    with wave.open(str(rendered[0][2]), "rb") as probe:
        params = probe.getparams()
    rate = params.framerate
    width = params.sampwidth
    channels = params.nchannels
    silence_frame = b"\x00" * (width * channels)

    frames: list[bytes] = []
    cursor_frames = 0
    segments: list[dict] = []
    silences: list[list[float]] = []
    fillers: list[list[float]] = []

    def add_silence(seconds: float) -> None:
        nonlocal cursor_frames
        n = int(seconds * rate)
        if n <= 0:
            return
        start = cursor_frames / rate
        frames.append(silence_frame * n)
        cursor_frames += n
        silences.append([round(start, 3), round(cursor_frames / rate, 3)])

    add_silence(LEAD_IN)
    for text, is_filler, path in rendered:
        with wave.open(str(path), "rb") as fh:
            data = fh.readframes(fh.getnframes())
        start = cursor_frames / rate
        frames.append(data)
        cursor_frames += len(data) // (width * channels)
        end = cursor_frames / rate

        segments.append({
            "start": round(start, 3),
            "end": round(end, 3),
            "text": text,
            "words": (
                [{"start": round(start, 3), "end": round(end, 3), "text": text}]
                if is_filler else split_words(text, start, end)
            ),
        })
        if is_filler:
            fillers.append([round(start, 3), round(end, 3)])
        add_silence(SILENCE_BEFORE)

    add_silence(TAIL - SILENCE_BEFORE if TAIL > SILENCE_BEFORE else 0.0)

    audio = outdir / "fixture.wav"
    with wave.open(str(audio), "wb") as out:
        out.setnchannels(channels)
        out.setsampwidth(width)
        out.setframerate(rate)
        out.writeframes(b"".join(frames))

    duration = cursor_frames / rate
    video = outdir / "fixture.mp4"
    subprocess.run(
        [
            require("ffmpeg"), "-hide_banner", "-nostdin", "-y",
            "-f", "lavfi", "-i", f"testsrc2=size=1280x720:rate=30:duration={duration:.3f}",
            "-i", str(audio),
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "26", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "128k", "-shortest", str(video),
        ],
        check=True, capture_output=True,
    )

    transcript = {"language": "ja", "segments": segments}
    (outdir / "fixture.json").write_text(
        json.dumps(transcript, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    truth = {
        "duration": round(duration, 3),
        "silences": silences,
        "fillers": fillers,
        "utterance_count": len(SCRIPT),
        "filler_count": sum(1 for _, f in SCRIPT if f),
    }
    (outdir / "fixture_truth.json").write_text(
        json.dumps(truth, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    shutil.rmtree(parts, ignore_errors=True)
    return {"video": video, "transcript": outdir / "fixture.json", **truth}


def main() -> int:
    parser = argparse.ArgumentParser(description="検証用の日本語動画を作る")
    parser.add_argument("--out", type=Path, default=Path("/tmp/autocut-fixture"))
    args = parser.parse_args()
    info = build(args.out)
    print(f"video     : {info['video']}")
    print(f"transcript: {info['transcript']}")
    print(f"duration  : {info['duration']:.2f}s")
    print(f"silences  : {len(info['silences'])} / fillers: {info['filler_count']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
