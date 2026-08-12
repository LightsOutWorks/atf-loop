"""ffmpeg を必要としない部分の検証。

    python -m unittest discover -s tests -v
"""

from __future__ import annotations

import sys
import unittest
import unittest.mock
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from autocut import telop
from autocut.cutplan import FILLERS_STRICT, find_filler_ranges, normalize_token
from autocut.highlight import select
from autocut.model import Segment, TimeMap, Transcript, Word, invert_ranges, merge_ranges


def make_transcript(rows: list[tuple[float, float, str]]) -> Transcript:
    segments = []
    for start, end, text in rows:
        segments.append(Segment(start, end, text, [Word(start, end, text)]))
    return Transcript(language="ja", segments=segments)


class RangeTests(unittest.TestCase):
    def test_merge_joins_overlaps(self):
        self.assertEqual(merge_ranges([(0, 2), (1, 3), (5, 6)]), [(0, 3), (5, 6)])

    def test_merge_honours_gap(self):
        self.assertEqual(merge_ranges([(0, 2), (2.05, 3)], gap=0.1), [(0, 3)])

    def test_merge_drops_empty(self):
        self.assertEqual(merge_ranges([(1, 1), (2, 3)]), [(2, 3)])

    def test_invert(self):
        self.assertEqual(invert_ranges([(1, 2), (4, 5)], 6.0), [(0, 1), (2, 4), (5, 6)])

    def test_invert_full_cover(self):
        self.assertEqual(invert_ranges([(0, 5)], 5.0), [])


class TimeMapTests(unittest.TestCase):
    def setUp(self):
        # 入力の 0-1 と 3-5 を残す。出力は 0-1 と 1-3。
        self.tm = TimeMap([(0.0, 1.0), (3.0, 5.0)])

    def test_output_duration(self):
        self.assertAlmostEqual(self.tm.output_duration, 3.0)

    def test_maps_inside_keeps(self):
        self.assertAlmostEqual(self.tm.map(0.5), 0.5)
        self.assertAlmostEqual(self.tm.map(3.0), 1.0)
        self.assertAlmostEqual(self.tm.map(4.5), 2.5)

    def test_dropped_time_snaps_to_previous_boundary(self):
        self.assertAlmostEqual(self.tm.map(2.0), 1.0)

    def test_before_start_is_zero(self):
        self.assertAlmostEqual(self.tm.map(-3.0), 0.0)

    def test_contains(self):
        self.assertTrue(self.tm.contains(0.5))
        self.assertFalse(self.tm.contains(2.0))

    def test_map_range_drops_fully_cut_span(self):
        self.assertIsNone(self.tm.map_range(1.2, 2.4))

    def test_map_range_keeps_surviving_span(self):
        self.assertEqual(self.tm.map_range(3.0, 4.0), (1.0, 2.0))


class FillerTests(unittest.TestCase):
    def test_long_vowel_is_not_stripped(self):
        # 長音符を句読点として削ると「えー」が「え」になり照合が壊れる（実測で発覚した回帰）。
        for token in ("えー", "あのー", "まー", "うー"):
            with self.subTest(token=token):
                self.assertEqual(normalize_token(token), token)
                self.assertIn(normalize_token(token), set(FILLERS_STRICT))

    def test_punctuation_is_stripped(self):
        self.assertEqual(normalize_token("実は、"), "実は")
        self.assertEqual(normalize_token(" えー。"), "えー")

    def test_finds_strict_fillers_only(self):
        tr = make_transcript([(0.0, 0.6, "えー"), (1.0, 2.0, "あの"), (3.0, 3.8, "うーん")])
        ranges, hits = find_filler_ranges(tr)
        self.assertEqual(hits, ["えー", "うーん"])
        self.assertEqual(ranges, [(0.0, 0.6), (3.0, 3.8)])

    def test_aggressive_adds_loose_fillers(self):
        tr = make_transcript([(1.0, 2.0, "あの")])
        _, hits = find_filler_ranges(tr, aggressive=True)
        self.assertEqual(hits, ["あの"])

    def test_ignores_too_short_spans(self):
        tr = make_transcript([(0.0, 0.05, "えー")])
        ranges, hits = find_filler_ranges(tr)
        self.assertEqual((ranges, hits), ([], []))

    def test_does_not_match_substring_of_real_word(self):
        tr = make_transcript([(0.0, 1.0, "映画")])
        _, hits = find_filler_ranges(tr)
        self.assertEqual(hits, [])


class WrapTests(unittest.TestCase):
    def test_short_text_is_single_line(self):
        self.assertEqual(telop.wrap_japanese("こんにちは", 11), "こんにちは")

    def test_wraps_at_limit(self):
        out = telop.wrap_japanese("あいうえおかきくけこさしすせそ", 10)
        self.assertIn(r"\N", out)
        self.assertEqual(out.split(r"\N")[0], "あいうえおかきくけこ")

    def test_prefers_punctuation_break(self):
        out = telop.wrap_japanese("結論から言うと、これは自動化できます", 12)
        self.assertEqual(out.split(r"\N")[0], "結論から言うと、")

    def test_does_not_start_line_with_punctuation(self):
        out = telop.wrap_japanese("あいうえおかきくけこ、さしすせそ", 10)
        for line in out.split(r"\N")[1:]:
            self.assertNotIn(line[0], telop.NO_LINE_START)

    def test_never_drops_characters(self):
        text = "あいうえおかきくけこさしすせそたちつてとなにぬねの"
        out = telop.wrap_japanese(text, 8, max_lines=2)
        self.assertEqual(out.replace(r"\N", ""), text)


class TelopEventTests(unittest.TestCase):
    def test_segment_mode_maps_onto_cut_timeline(self):
        tr = make_transcript([(0.0, 1.0, "ひとつめ"), (3.0, 4.0, "ふたつめ")])
        tm = TimeMap([(0.0, 1.0), (3.0, 4.0)])
        events = telop.build_events(tr, tm, mode="segment")
        self.assertEqual(len(events), 2)
        self.assertAlmostEqual(events[1].start, 1.0)

    def test_events_dropped_when_span_is_cut_away(self):
        tr = make_transcript([(0.0, 1.0, "残る"), (1.5, 2.0, "消える")])
        tm = TimeMap([(0.0, 1.0)])
        events = telop.build_events(tr, tm, mode="segment")
        self.assertEqual([e.text for e in events], ["残る"])

    def test_events_do_not_overlap(self):
        tr = make_transcript([(0.0, 5.0, "ながい"), (1.0, 2.0, "みじかい")])
        tm = TimeMap([(0.0, 6.0)])
        events = telop.build_events(tr, tm, mode="segment")
        for a, b in zip(events, events[1:]):
            self.assertLessEqual(a.end, b.start + 1e-6)

    def test_pop_mode_respects_chunk_limit(self):
        words = [Word(i * 0.4, i * 0.4 + 0.4, "あい") for i in range(10)]
        tr = Transcript("ja", [Segment(0.0, 4.0, "あい" * 10, words)])
        tm = TimeMap([(0.0, 4.0)])
        style = telop.TelopStyle(max_chars=5)
        events = telop.build_events(tr, tm, mode="pop", style=style)
        self.assertGreater(len(events), 1)
        for ev in events:
            self.assertLessEqual(len(ev.text), 6)

    def test_clip_rebases_to_clip_start(self):
        tr = make_transcript([(0.0, 1.0, "まえ"), (2.0, 3.0, "なか")])
        tm = TimeMap([(0.0, 4.0)])
        events = telop.build_events(tr, tm, mode="segment", clip=(2.0, 3.0))
        self.assertEqual(len(events), 1)
        self.assertAlmostEqual(events[0].start, 0.0)


class AssTests(unittest.TestCase):
    def test_header_carries_resolution(self):
        out = telop.render_ass([], 1080, 1920, telop.TelopStyle.vertical())
        self.assertIn("PlayResX: 1080", out)
        self.assertIn("PlayResY: 1920", out)

    def test_dialogue_time_format(self):
        events = [telop.Event(1.5, 2.25, "てすと")]
        out = telop.render_ass(events, 1920, 1080, telop.TelopStyle.landscape())
        self.assertIn("Dialogue: 0,0:00:01.50,0:00:02.25,Telop,,0,0,0,,てすと", out)

    def test_empty_events_are_skipped(self):
        out = telop.render_ass([telop.Event(0.0, 1.0, "  ")], 1920, 1080, telop.TelopStyle())
        self.assertNotIn("Dialogue:", out)


class HighlightTests(unittest.TestCase):
    def _long_transcript(self) -> Transcript:
        rows = []
        t = 0.0
        texts = [
            "実は、これが一番大事なところです。",
            "普通の説明が続きます。",
            "もう少し普通の説明が続きます。",
            "結論から言うと、答えはこうなります。",
            "理由は三つあります。",
            "最後のまとめです。",
        ]
        for text in texts:
            rows.append((t, t + 9.0, text))
            t += 9.0
        return make_transcript(rows)

    def test_selects_requested_count(self):
        picks = select(self._long_transcript(), count=2, min_duration=15.0, max_duration=30.0)
        self.assertEqual(len(picks), 2)

    def test_picks_do_not_overlap(self):
        picks = select(self._long_transcript(), count=3, min_duration=15.0, max_duration=30.0)
        for a, b in zip(picks, picks[1:]):
            self.assertLessEqual(a.end, b.start)

    def test_respects_max_duration(self):
        picks = select(self._long_transcript(), count=3, min_duration=15.0, max_duration=20.0)
        for pick in picks:
            self.assertLessEqual(pick.duration, 20.0 + 1e-6)

    def test_hook_is_recorded_in_reason(self):
        picks = select(self._long_transcript(), count=1, min_duration=15.0, max_duration=30.0)
        self.assertIn("hook=", picks[0].reason)

    def test_short_source_returns_whole(self):
        tr = make_transcript([(0.0, 5.0, "みじかい素材です。")])
        picks = select(tr, count=3, min_duration=15.0, max_duration=58.0)
        self.assertEqual(len(picks), 1)
        self.assertAlmostEqual(picks[0].end, 5.0)

    def test_empty_transcript_returns_nothing(self):
        self.assertEqual(select(Transcript("ja", []), count=3), [])


class IconTests(unittest.TestCase):
    def test_png_signature_and_size(self):
        from autocut import icon
        data = icon.render(180)
        self.assertEqual(data[:8], b"\x89PNG\r\n\x1a\n")
        # IHDR の幅・高さを読み戻す
        import struct
        width, height = struct.unpack(">II", data[16:24])
        self.assertEqual((width, height), (180, 180))

    def test_sizes_differ_and_cache_is_stable(self):
        from autocut import icon
        self.assertNotEqual(icon.get(64), icon.get(180))
        self.assertIs(icon.get(180), icon.get(180))

    def test_renders_across_sizes_without_error(self):
        from autocut import icon
        for size in (16, 64, 180, 192, 512):
            with self.subTest(size=size):
                self.assertGreater(len(icon.render(size)), 60)


class PinTests(unittest.TestCase):
    def setUp(self):
        import tempfile
        self.dir = Path(tempfile.mkdtemp())

    def tearDown(self):
        import shutil
        shutil.rmtree(self.dir, ignore_errors=True)

    def test_pin_is_stable_across_restarts(self):
        # 自動起動では再起動のたびに番号が変わると使えなくなる（実運用上の回帰）
        from autocut.server import resolve_pin
        first = resolve_pin(self.dir, None, False)
        self.assertRegex(first, r"^\d{4}$")
        self.assertEqual(first, resolve_pin(self.dir, None, False))

    def test_explicit_pin_wins(self):
        from autocut.server import resolve_pin
        self.assertEqual(resolve_pin(self.dir, "4821", False), "4821")

    def test_disabled_returns_empty(self):
        from autocut.server import resolve_pin
        self.assertEqual(resolve_pin(self.dir, "4821", True), "")

    def test_stored_file_is_owner_only(self):
        import os
        from autocut.server import resolve_pin
        resolve_pin(self.dir, None, False)
        self.assertEqual(oct(os.stat(self.dir / ".pin").st_mode)[-3:], "600")


class ManifestTests(unittest.TestCase):
    def test_manifest_is_standalone_with_icons(self):
        from autocut.server import MANIFEST
        self.assertEqual(MANIFEST["display"], "standalone")
        self.assertTrue(MANIFEST["icons"])
        self.assertTrue(any(i.get("purpose") == "maskable" for i in MANIFEST["icons"]))
        self.assertEqual(MANIFEST["start_url"], "/")


class FontTests(unittest.TestCase):
    def test_default_font_is_a_name(self):
        from autocut import fonts
        name = fonts.default_font()
        self.assertIsInstance(name, str)
        self.assertTrue(name)

    def test_style_uses_an_installed_font(self):
        # 決め打ちすると OS が変わった瞬間にテロップが豆腐になる（Windows で発覚）
        from autocut import fonts
        from autocut.telop import TelopStyle
        found = fonts.available()
        if found:
            self.assertIn(TelopStyle().font, found)
        else:
            self.assertEqual(TelopStyle().font, fonts.FALLBACK)

    def test_font_override_reaches_the_ass_header(self):
        from autocut.telop import TelopStyle, render_ass
        out = render_ass([], 1080, 1920, TelopStyle.vertical("Yu Gothic UI"))
        self.assertIn("Yu Gothic UI", out)

    def test_presets_pass_the_override_through(self):
        from autocut import presets
        self.assertEqual(presets.TIKTOK.telop_style("Meiryo").font, "Meiryo")
        self.assertEqual(presets.YOUTUBE_LONG.telop_style("Meiryo").font, "Meiryo")

    def test_install_hint_is_platform_specific(self):
        from autocut import fonts
        self.assertTrue(fonts.install_hint())


class AutostartTests(unittest.TestCase):
    def test_three_platforms_are_supported(self):
        from autocut import agent
        for system in ("Darwin", "Linux", "Windows"):
            with self.subTest(system=system), \
                 unittest.mock.patch("platform.system", return_value=system):
                self.assertTrue(agent.supported())

    def test_firewall_command_names_the_port_and_private_profile(self):
        from autocut import agent
        cmd = agent.firewall_command(8765)
        self.assertIn("localport=8765", cmd)
        # 公衆Wi-Fiで開かないよう private に絞る
        self.assertIn("profile=private", cmd)

    def test_unsupported_platform_is_reported(self):
        from autocut import agent
        with unittest.mock.patch("platform.system", return_value="Haiku"):
            self.assertFalse(agent.supported())
            self.assertFalse(agent.status())


class TranscriptIOTests(unittest.TestCase):
    def test_roundtrip(self):
        tr = make_transcript([(0.0, 1.0, "あ"), (1.0, 2.0, "い")])
        again = Transcript.from_dict(tr.to_dict())
        self.assertEqual([s.text for s in again.segments], ["あ", "い"])
        self.assertEqual(len(list(again.words())), 2)


if __name__ == "__main__":
    unittest.main()
