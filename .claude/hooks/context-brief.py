#!/usr/bin/env python3
"""UserPromptSubmit hook — 圧縮を越えて生き残る文脈を毎ターン注入する。

なぜ毎ターンか: 2026-08-10、同一セッション内のコンテキスト圧縮2回目が
direction/ の戦略文書7本の要約を全て落とし、その後AIが「人が来ない問題は
解けない」と4回断定した（既にリポジトリ内で否定済みの主張）。SessionStart は
起動時1回きりなので圧縮で消える。UserPromptSubmit は毎ターン再注入される。

原則:
- 注入するだけ。ツール呼出を拒否しない。
- 導出値（残り何日）はここで毎回計算する。ファイルに書かない（腐るため）。
- 失敗しても会話を止めない。ただし失敗を黙らせない（末尾に理由を出す）。
"""
import sys, json, datetime, pathlib

DEADLINES = [
    ("2026-08-11", "Encounter Queue Day 3"),
    ("2026-08-12", "ココナラ判断（現状 NO_ACTION）"),
    ("2026-08-13", "ChatGPT $100枠（P1未実行）"),
    ("2026-08-13", "@HatoNozomu 3通目 無応答タイムアウト"),
]

def main():
    today = datetime.date.today()
    lines = [f"[常設] {today.isoformat()}"]
    urgent = []
    for d, label in DEADLINES:
        y, m, dd = (int(x) for x in d.split("-"))
        left = (datetime.date(y, m, dd) - today).days
        if left < 0:
            continue
        urgent.append(f"{label} 残{left}日" if left else f"{label} **本日**")
    if urgent:
        lines.append("期限: " + " / ".join(urgent))
    lines.append(
        "圧縮で消えやすい結論の所在は CLAUDE.md の索引（§3）から正本を引く。"
        "「無い・できない・詰んでいる・新しく作る」と書く直前に "
        "DECISIONS.md と direction/ と research/INDEX.md を引く（OS.md HI-4 F10）。"
    )
    print("\n".join(lines))

if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # 黙って死なせない
        print(f"[常設] context-brief.py が失敗した: {type(e).__name__}: {e}")
    sys.exit(0)
