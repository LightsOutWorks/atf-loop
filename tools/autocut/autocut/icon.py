"""ホーム画面用のアイコンを実行時に作る。

画像ファイルをリポジトリへ置かず、必要な寸法をその場で描く。PNG は zlib さえ
あれば組み立てられるので、画像ライブラリを足さずに済む。

図案はカット済みのタイムライン——金の帯と、その間の空き。この道具がやることそのもの。
"""

from __future__ import annotations

import struct
import zlib

BG = (0x14, 0x14, 0x1A)
GOLD = (0xE0, 0xBE, 0x74)
GOLD_DIM = (0x8B, 0x74, 0x40)

# (上端, 下端, [(左, 右), ...]) を 0..1 の比率で持つ。残した区間の並びを模している。
ROWS: tuple[tuple[float, float, tuple[tuple[float, float], ...]], ...] = (
    (0.335, 0.435, ((0.140, 0.395), (0.445, 0.700), (0.750, 0.860))),
    (0.505, 0.605, ((0.140, 0.285), (0.335, 0.610), (0.660, 0.860))),
    (0.675, 0.775, ((0.140, 0.470), (0.520, 0.640), (0.690, 0.860))),
)


def _chunk(tag: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + tag
        + data
        + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


def render(size: int) -> bytes:
    """size×size の PNG を返す（RGB / 8bit）。"""
    pixels = bytearray()

    # 背景を敷く
    bg_row = bytes(BG) * size
    rows = [bytearray(bg_row) for _ in range(size)]

    def fill(x0: int, x1: int, y0: int, y1: int, color: tuple[int, int, int]) -> None:
        x0, x1 = max(0, x0), min(size, x1)
        y0, y1 = max(0, y0), min(size, y1)
        if x1 <= x0 or y1 <= y0:
            return
        span = bytes(color) * (x1 - x0)
        for y in range(y0, y1):
            rows[y][x0 * 3:x1 * 3] = span

    for top, bottom, segments in ROWS:
        y0, y1 = int(top * size), int(bottom * size)
        # 帯の左端に沈んだ影を置くと、小さくしても段が潰れない
        for left, right in segments:
            x0, x1 = int(left * size), int(right * size)
            fill(x0, x1, y0, y1, GOLD)
            fill(x0, x1, y1, y1 + max(1, size // 90), GOLD_DIM)

    for row in rows:
        pixels.append(0)          # 各行の先頭は filter type（0 = なし）
        pixels.extend(row)

    header = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    return (
        b"\x89PNG\r\n\x1a\n"
        + _chunk(b"IHDR", header)
        + _chunk(b"IDAT", zlib.compress(bytes(pixels), 9))
        + _chunk(b"IEND", b"")
    )


_cache: dict[int, bytes] = {}


def get(size: int) -> bytes:
    if size not in _cache:
        _cache[size] = render(size)
    return _cache[size]
