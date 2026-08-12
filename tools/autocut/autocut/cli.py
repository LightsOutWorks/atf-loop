"""コマンドライン入口。

    autocut 撮ったやつ.mp4

これだけで YouTube ロング / YouTube ショート / TikTok の3種が出る。
途中で何も聞かない。
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from . import presets
from .ff import FFmpegFailed, FFmpegNotFound
from .asr import ASRUnavailable
from .pipeline import Options, run


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="autocut",
        description="動画1本から YouTube ロング / ショート / TikTok を自動で作る。",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "例:\n"
            "  autocut talk.mp4\n"
            "  autocut talk.mp4 --out ./出力 --shorts 5\n"
            "  autocut talk.mp4 --asr fixture --transcript talk.srt\n"
            "\n"
            "スマホから使う:\n"
            "  autocut serve              母艦で待ち受け、iPhone のブラウザから渡す\n"
        ),
    )
    parser.add_argument("input", type=Path, help="元の動画ファイル")
    parser.add_argument("--out", type=Path, default=None,
                        help="出力先ディレクトリ（既定: <入力名>_autocut）")
    parser.add_argument("--targets", nargs="+", default=None,
                        choices=list(presets.ALL),
                        help=f"作る出力（既定: 全部 = {' '.join(presets.ALL)}）")

    group = parser.add_argument_group("文字起こし")
    group.add_argument("--asr", default="faster-whisper",
                       choices=["faster-whisper", "fixture"],
                       help="認識バックエンド（既定: faster-whisper。ローカル実行）")
    group.add_argument("--model", default="medium",
                       help="Whisper モデル（tiny/base/small/medium/large-v3。既定: medium）")
    group.add_argument("--language", default="ja", help="言語コード（既定: ja。auto で自動判定）")
    group.add_argument("--device", default="auto", choices=["auto", "cpu", "cuda"])
    group.add_argument("--compute-type", default="auto",
                       help="int8 / float16 など（既定: auto）")
    group.add_argument("--transcript", type=Path, default=None,
                       help="既存の文字起こし（.json / .srt）。--asr fixture と併用")

    group = parser.add_argument_group("編集")
    group.add_argument("--no-silence-cut", action="store_true", help="無音カットをしない")
    group.add_argument("--no-filler-cut", action="store_true", help="フィラー除去をしない")
    group.add_argument("--aggressive-fillers", action="store_true",
                       help="「あの」「まあ」など文脈依存の語も落とす")
    group.add_argument("--silence-db", type=float, default=-32.0,
                       help="無音とみなす音量しきい値 dB（既定: -32）")
    group.add_argument("--silence-min", type=float, default=0.35,
                       help="この秒数以上の無音を対象にする（既定: 0.35）")
    group.add_argument("--breath", type=float, default=0.12,
                       help="無音の両端に残す秒数（既定: 0.12）")
    group.add_argument("--no-normalize", action="store_true", help="音量正規化をしない")

    group = parser.add_argument_group("短尺")
    group.add_argument("--shorts", type=int, default=3, help="短尺の本数（既定: 3）")
    group.add_argument("--shorts-min", type=float, default=15.0, help="短尺の下限秒（既定: 15）")
    group.add_argument("--shorts-max", type=float, default=58.0, help="短尺の上限秒（既定: 58）")
    group.add_argument("--highlights", type=Path, default=None,
                       help="切り出し位置を外から与える JSON")
    group.add_argument("--reframe", default="blur", choices=["blur", "crop"],
                       help="9:16 の作り方（既定: blur = 被写体を切らない）")

    group = parser.add_argument_group("書き出し")
    group.add_argument("--encode-preset", default="medium",
                       help="x264 preset（既定: medium。速くしたいなら veryfast）")
    group.add_argument("--keep-workdir", action="store_true", help="中間ファイルを残す")
    group.add_argument("-q", "--quiet", action="store_true", help="進捗を出さない")
    return parser


def main(argv: list[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)

    # `autocut serve` はスマホから使うためのサーバー。位置引数と衝突するので先に分ける。
    if argv and argv[0] == "serve":
        from .server import main as serve_main
        return serve_main(argv[1:])

    args = build_parser().parse_args(argv)

    if args.asr == "fixture" and args.transcript is None:
        print("エラー: --asr fixture には --transcript が要る。", file=sys.stderr)
        return 2

    outdir = args.out or args.input.with_name(f"{args.input.stem}_autocut")
    log = (lambda _m: None) if args.quiet else (lambda m: print(m, flush=True))

    opts = Options(
        outdir=outdir,
        presets=presets.resolve(args.targets),
        asr_backend=args.asr,
        asr_model=args.model,
        language=args.language,
        device=args.device,
        compute_type=args.compute_type,
        transcript_path=args.transcript,
        highlights_path=args.highlights,
        shorts_count=args.shorts,
        shorts_min=args.shorts_min,
        shorts_max=args.shorts_max,
        remove_silence=not args.no_silence_cut,
        remove_fillers=not args.no_filler_cut,
        aggressive_fillers=args.aggressive_fillers,
        silence_noise_db=args.silence_db,
        silence_min=args.silence_min,
        breath=args.breath,
        reframe=args.reframe,
        normalize_audio=not args.no_normalize,
        encode_preset=args.encode_preset,
        keep_workdir=args.keep_workdir,
    )

    try:
        result = run(args.input, opts, log=log)
    except FFmpegNotFound as exc:
        print(f"エラー: {exc}", file=sys.stderr)
        return 3
    except ASRUnavailable as exc:
        print(f"エラー: {exc}", file=sys.stderr)
        return 4
    except FFmpegFailed as exc:
        print(f"エラー: ffmpeg が失敗した。\n{exc}", file=sys.stderr)
        return 5
    except (FileNotFoundError, ValueError) as exc:
        print(f"エラー: {exc}", file=sys.stderr)
        return 2

    if not args.quiet:
        print("\n完成:")
        for key, files in result.outputs.items():
            for path in files:
                print(f"  {key:16s} {path}")
        print(f"\n記録: {outdir / 'artifacts' / 'report.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
