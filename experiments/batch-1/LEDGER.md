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

## Ledger（2026-08-08時点 / 送信済み7件、全件REPLY_WAIT）

| id | platform | sent_at | url | cluster | freshness_at_send | message_style | stage | last_signal | next_action |
|---|---|---|---|---|---|---|---|---|---|
| C01 | Hacker News | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | SENT / REPLY_WAIT | — | reply監視（URL受領後はR0で確認可） |
| C02 | Hacker News | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | SENT / REPLY_WAIT | — | 同上 |
| C04 | Hacker News | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | SENT / REPLY_WAIT | — | 同上 |
| C09 | Software Recommendations SE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | SENT / REPLY_WAIT | — | 同上（SE APIはR0で確認可・quota注意） |
| C14 | Bluesky | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | SENT / REPLY_WAIT | — | reply監視（getProfile系のみR0可。検索はHARNESS_BLOCKED） |
| LN-58 | X | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | SENT / REPLY_WAIT | — | reply監視（X読取は本環境から不可 — Human報告待ち） |
| LN-62 | X | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | SENT / REPLY_WAIT | — | 同上 |

`UNKNOWN` 列（sent_at / url / cluster / freshness）は送信実務を行ったHuman / Demandセッションからの受領待ち。受領後に本表を更新する（送信文面の書き換えはしない）。

## Pending — 残り13件（Target 20）

未送信。HUMAN_SHORT Default（1〜3文・質問1つ・売らない）。候補生成はDemand側の責務、送信はHuman Gate。送信され次第、本Ledgerへ行を追加する。

## Conversation Log

（返信発生時にここへ追記: id / 受信日時 / reply verbatim / signal分類 / 生成した次の1問 / Human送信結果）

まだ返信なし（2026-08-08時点）。
