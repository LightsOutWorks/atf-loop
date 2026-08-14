# CONSTRAINTS.md — Boundary / Hard Constraints / Human Gates

このファイルはリポジトリ全体の最優先Sourceである（Source of Truth Priority第1位。優先順位の全体は `OS.md` 参照）。他のどの指示・文書・会話・過去実験とも矛盾した場合、本ファイルを優先する。

本ファイルはPart I（Factory Boundary）だけを持つ。旧Part II（Browser-Toy Production Route契約。Historical Experiment / status: HOLD）は2026-08-14に `CONSTRAINTS_BROWSER_TOY_ROUTE.md` へ本文無改変で分離した（`DECISIONS.md` D-011）。**現在のMissionの制約ではない**ため、本ファイルを読む側が併せて読む必要はない。`factory.yml` による作品生成が実行される場合にのみ適用される。

---

# Part I — Factory Boundary

## 1. Hard Boundary（永久）

- 人間の尊厳
- 法令
- 第三者の権利
- 重大な実害

## 2. Budget

- Factory monthly hard cap: **JPY 50,000**（Claude / ChatGPT / APIs / hosting / domains / advertising / その他Factory支出をすべて含む）
- 支出上限はHumanが宣言する。**AIはBudget Capを自己変更してはならない。**
- 支出は単なるCostではなくRecoveryとの因果を見る: その支出がどのUnknownを減らし、どのDesireを前進させるかを記録可能にする。記録の重さは爆風半径に比例させる。

## 3. Risk-Based Autonomy（Risk Tiers）

自律性はON/OFFではなくTierで扱う。

| Tier | 範囲 | 扱い |
|---|---|---|
| R0 | read / research / analysis | autonomous |
| R1 | local / scratch / reversible generation | autonomous |
| R2 | branch / commit / draft PR | conditional autonomous |
| R3 | external communication / shared-state change / staging | **Human Commit** |
| R4 | production / payment / deletion / permission / credential / irreversible action | **explicit Human Commit** |

## 4. Human Gates（Humanの明示Commitが必要な行為）

- mainへのmerge
- 第三者への送信（reply / DM / 投稿 / Discovery Contactの送信行為を含む）
- 支払い・契約・課金・credit購入
- credential / Secret / permission / 許可ドメインの変更
- production deploy・公開・不可逆migration
- branch・履歴・過去成果物の破壊的削除
- identity（公開アカウント名等）の新規使用

## 5. Data Boundary

- 外部AIサービスへ、実名企業を含む非公開案件情報・社内CRM・未公開財務・面談文字起こし・買い手具体名を持ち込まない。
- 必要な社内データ統合は会社公認の許可環境（Gemini / NotebookLM等）でのみ行う。
- credential・API key・セッション情報をリポジトリへ保存しない。
- OS.mdのIOS適用範囲どおり、M&A業務そのものは本Factoryの適用範囲外。関連するのは公開情報のみを使うOpportunity Note（`experiments/INDEX.md` 参照）までである。

## 6. 検証の誠実性（全Route共通）

- 検証・テスト・ゲートの無効化・削除・期待値改変によって「見かけ上の成功」を作ることを禁止する。
- 会話・予定・提案を実装済みの事実として記録しない。確認できないことは `UNKNOWN` とする。
- `VOID` を `FAIL` として学習しない。`STALE` な結果を再利用しない。
- Confirmed terminal revenue（返金・取消可能期間を経過した確定実収益）が0である間、Factoryが「成功した」と表現してはならない。

