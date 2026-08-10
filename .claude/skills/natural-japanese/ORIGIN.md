# 出所

このスキルは **`coji/natural-japanese`（MIT License, Copyright (c) 2026 coji）** をそのまま取り込んだもの。
`LICENSE` を同梱している。改変していない。

## なぜ自作せず取り込んだか

2026-08-10、Human裁定「無料で世の中にあるならすぐ取り入れたらいい」に基づく市場調査の結果、
**自作の書法体系より上位互換であることが実測で確定した**ため。

| | 我々（自作） | coji |
|---|---|---|
| 棄却した軸の記録 | 7件 | **14候補を測り、一次GO 3件を後から撤回して最終GO 0件** |
| 誤検知率(FP) | **無し** | 全候補に human quality:high での FP% を付与 |
| ジャンル条件分け | 無し | essay / tech / business / minutes / report / memo / guide / slide |
| 動く検査 | janome 282行（ゲート停止済み） | `lint.py` が今日動く |
| 到達 | note 0本 / X 4フォロワー | GitHub 148★ / Zenn 248いいね |

我々が唯一持っていた差分は「機械の合格とHuman判定がズレた実測」（`direction/WRITING_SYSTEM_JA_FALSIFICATION_2026-08-10.md`）だが、
これは n=1 であり商品にならない。cojiの reader-study は事前登録済みで「有効回答30人」が未達のまま止まっている。

**独立再現が1件ある**: 我々が測った第2軸「指示語 /1000字」（プロ 10.44 / SEO 4.90）は、
cojiの「こそあど密度」（human high 11.42 / ordinary 9.0 / AI 8.18）と**方向・水準ともに一致した**。
別コーパス・別手法で同じ結果が出ている。

## 我々の側に残すもの

- `direction/WRITING_SYSTEM_JA_MEASURED_2026-08-10.md` — プロ実文30万字の実測帯（ひらがな副詞 / 指示語 / 和語漢語比）。**ゲートにしない**
- `direction/WRITING_SYSTEM_JA_FALSIFICATION_2026-08-10.md` — 自分の規則を自分で反証した記録
- 禁止語リストのうち Human の直接判定に由来するもの（付き合う / 寄り添う / サポート / 導く / 引き出す / 教える / アドバイス）
- `scripts/writing-check.py` — **退役予定**。当面は禁止語チェックのみに使う
