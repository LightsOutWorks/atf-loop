#!/usr/bin/env python3
"""UserPromptSubmit hook — 圧縮を越えて生き残る文脈を毎ターン注入する。

なぜ毎ターンか: 2026-08-10、同一セッション内のコンテキスト圧縮2回目が
direction/ の戦略文書7本の要約を全て落とし、その後AIが「人が来ない問題は
解けない」と4回断定した（既にリポジトリ内で否定済みの主張）。SessionStart は
起動時1回きりなので圧縮で消える。UserPromptSubmit は毎ターン再注入される。

2026-08-14 の縮小: 期限リマインド（DEADLINES）を削除した。登録されていた4件
（Encounter Queue Day 3 / ココナラ判断 / ChatGPT $100枠 / @HatoNozomu 3通目）は
すべて 2026-08-11〜13 で、2026-08-14 時点で全件が過去日となり出力ゼロだった。
期限を静的リストで持つ設計は、期限が過ぎた瞬間に沈黙し、しかも沈黙が正常時と
区別できない。期限の正本は `CURRENT_STATE.md` と各実験台帳であり、hook側で
二重に持たない（`OS.md` §11: 証拠が無くなれば削除する）。

残したのは F10（既出の再発明）の再注入だけ。これは圧縮で実際に失われたものへの
対処であり、上の実測がそのまま根拠になっている。

原則:
- 注入するだけ。ツール呼出を拒否しない。
- 導出値はここで毎回計算する。ファイルに書かない（腐るため）。
- 失敗しても会話を止めない。ただし失敗を黙らせない（末尾に理由を出す）。
"""
import sys, datetime


def main():
    today = datetime.date.today()
    print(
        f"[常設] {today.isoformat()}\n"
        "圧縮で消えやすい結論の所在は CLAUDE.md の索引（§3）から正本を引く。"
        "「無い・できない・詰んでいる・新しく作る」と書く直前に "
        "DECISIONS.md と direction/ と research/INDEX.md を引く（OS.md HI-4 F10）。"
    )


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # 黙って死なせない
        print(f"[常設] context-brief.py が失敗した: {type(e).__name__}: {e}")
    sys.exit(0)
