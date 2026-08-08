# Batch 1 — Reality Contact Ledger

Experiment: E-006（`experiments/INDEX.md`）/ MD-1 Economic Engine
Owner: Lane A（Reality / Economic Engine）セッション
制定: 2026-08-08

目的: Public Human Desire → Genuine Conversation → Genuine Pain → Smallest Useful Solve → Paid Pilot → **Confirmed Revenue** を最短で1回完走するための、Contact単位のWorld Signal台帳。

## 運用規則（最小）

1. **送信済みメッセージ・過去の記録を事後的に書き換えない**（追記のみ。訂正は訂正として残す）。
2. 返信が発生したら: reply verbatimを記録 → signalを分類 → **次の最小質問を1つだけ**HUMAN_SHORTで生成 → 送信はHuman Gate（自動送信禁止）。
3. Solutionを先に決めない。SOLVE_ATTEMPT段階で AI / SaaS / BUY / outsource / process change / manual service / BUILD を比較する。AIを売らない。
4. 初回Free Solveは許容。ただし無期限に続けない — 価値確認後はPaid Pilotへの最短Routeを設計する。
5. 支払い・契約・公開・第三者送信はすべてHuman Commit。
6. 確認できない値は `UNKNOWN`。推測で埋めない。

## KPI Funnel（Contact単位のstage）

`SENT → REACHABLE → REPLY → GENUINE_PAIN_CONFIRMED → CONTINUED_CONVERSATION → SOLVE_ATTEMPT → VALUE_CONFIRMED → PAID_PILOT → PAYMENT → CONFIRMED_REVENUE`

- 目的は返信率最大化ではない。Terminal Goal = 返金・取消可能期間を経過した確定実収益。
- `KILLED` / `NO_REPLY_TIMEOUT` は失敗記録として保持（FAILを消さない）。

## Ledger（初回7件 + 追加分。REACHABLE確認済みで分母を数える）

| id | platform | sent_at | url | cluster | freshness_at_send | message_style | stage | last_signal | next_action |
|---|---|---|---|---|---|---|---|---|---|
| C01 | Hacker News | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | **SENT_BUT_NOT_PUBLICLY_VISIBLE**（VOID — Delivery Layer failure） | 2026-08-08 Human実測（`LEARNINGS.md` 訂正1 C-1） | NO_REPLY分母に入れない。再送・別スレッドはHuman Gate |
| C02 | Hacker News | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | **SENT_BUT_NOT_PUBLICLY_VISIBLE**（VOID — Delivery Layer failure） | 同上 | 同上 |
| C04 | Hacker News | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | **SENT_BUT_NOT_PUBLICLY_VISIBLE**（VOID — Delivery Layer failure） | 同上 | 同上 |
| C09 | Software Recommendations SE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | SENT / REPLY_WAIT（可視性UNKNOWN） | — | reply監視（SE APIはR0で確認可・quota注意）。可視性確認 |
| C14 | Bluesky | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | SENT / REPLY_WAIT（可視性UNKNOWN） | — | reply監視（getProfile系のみR0可。検索はHARNESS_BLOCKED）。可視性確認 |
| LN-58 | X | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | SENT / REPLY_WAIT（可視性UNKNOWN） | — | reply監視（X読取は本環境から不可 — Human報告待ち）。可視性確認 |
| LN-62 | X | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | SENT / REPLY_WAIT（可視性UNKNOWN） | — | 同上 |

- `UNKNOWN` 列（sent_at / url / cluster / freshness）は送信実務を行ったHuman / Demandセッションからの受領待ち。受領後に本表を更新する（送信文面の書き換えはしない）。
- **追加Contactあり（2026-08-08 Human-reported / `LEARNINGS.md` 訂正1 C-2）**: 初回7件の後にHuman Contactが追加送信されており、実効母数は上表だけではない。追加分の id / platform / 詳細は受領待ち（受領次第、行を追加する）。上表を「現在の全数」と読まないこと。
- 分母規律: REPLY率等の分母は**REACHABLE確認済み接触**で数える（`LEARNINGS.md` L1 / C-1。SENT_BUT_NOT_PUBLICLY_VISIBLE = VOIDは分母外）。
- 送信前チェック（次回から適用。`LEARNINGS.md` L1）: 送信主体と対象スレッドの公開可視性を送信前に確認する。

## Pending — 残り枠（Target 20）

HUMAN_SHORT Default（1〜3文・質問1つ・売らない）。候補生成はDemand側の責務、送信はHuman Gate。送信され次第、本Ledgerへ行を追加する。

## Conversation Log

（返信発生時にここへ追記: id / 受信日時 / reply verbatim / signal分類 / 生成した次の1問 / Human送信結果）

- 2026-08-08: 返信なし（初回抽出時点）。
- 2026-08-08: C01 / C02 / C04へ `SENT_BUT_NOT_PUBLICLY_VISIBLE`（Delivery Layer failure / VOID）を転記。Provenance: Human実測 → `LEARNINGS.md` 訂正1 C-1（Lane C経由のHuman裁定）。これによりL1の「要転記（Human Handoff）」は完了し、当該FACTの一次記録は本台帳へ移る。機構的詳細（shadowban / dead等）は引き続き `UNKNOWN`。
