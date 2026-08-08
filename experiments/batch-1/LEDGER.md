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
7. 分母規律: REPLY率等の分母は**REACHABLE確認済み接触**で数える（`LEARNINGS.md` L1 / C-1。VOIDは分母外）。
8. 送信前チェック（`LEARNINGS.md` L1）: 送信主体と対象スレッドの公開可視性を送信前に確認する。

## KPI Funnel（Contact単位のstage）

`SENT → REACHABLE → REPLY → GENUINE_PAIN_CONFIRMED → CONTINUED_CONVERSATION → SOLVE_ATTEMPT → VALUE_CONFIRMED → PAID_PILOT → PAYMENT → CONFIRMED_REVENUE`

- 目的は返信率最大化ではない。Terminal Goal = 返金・取消可能期間を経過した確定実収益。
- `KILLED` / `NO_REPLY_TIMEOUT` / `VOID` は失敗・評価不能の記録として保持（FAILを消さない。VOIDをFAILとして学習しない）。

## Funnel Totals（2026-08-08 Human-confirmed）

| SENT | SENT_BUT_NOT_PUBLICLY_VISIBLE（VOID） | PUBLICLY_VISIBLE / REACHABLE | REPLY_WAIT | REPLY |
|---|---|---|---|---|
| **20** | **3**（HN） | **17** | **17** | **0** |

## Ledger（2026-08-08 Human-confirmed sync / SENT = 20）

凡例: sent_at「2026-08-08 (HC)」= 2026-08-08 Human-confirmed sent（exact timestamp = UNKNOWN。推測しない）。X行のurlは**返信先の元投稿**。cluster / 送信文面 / freshness_at_send はDemandセッション成果物がrepo内に存在せず回収不能のため `UNKNOWN`（全remote branch検索済み 2026-08-08。Humanへの再入力要求はしない）。X行のid: Demand採番が判明しているのはLN-58 / LN-62のみ。他はhandleを行キーとし、採番判明時に追記する。

| id | platform | sent_at | url（X行=元投稿） | cluster | freshness_at_send | message_style | stage | last_signal | next_action |
|---|---|---|---|---|---|---|---|---|---|
| C01 | Hacker News | 2026-08-08 (HC) | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | **SENT_BUT_NOT_PUBLICLY_VISIBLE**（VOID — Delivery Layer failure） | 2026-08-08 Human実測（`LEARNINGS.md` 訂正1 C-1） | 分母外。再送・別スレッドはHuman Gate |
| C02 | Hacker News | 2026-08-08 (HC) | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | **SENT_BUT_NOT_PUBLICLY_VISIBLE**（VOID — Delivery Layer failure） | 同上 | 同上 |
| C04 | Hacker News | 2026-08-08 (HC) | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | **SENT_BUT_NOT_PUBLICLY_VISIBLE**（VOID — Delivery Layer failure） | 同上 | 同上 |
| C09 | Software Recommendations SE | 2026-08-08 (HC) | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | REACHABLE / REPLY_WAIT | 2026-08-08 Human画像確認（Answer公開表示） | reply監視（SE APIはR0で確認可・quota注意） |
| C14 | Bluesky | 2026-08-08 (HC) | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | REACHABLE / REPLY_WAIT | 2026-08-08 Human画像確認（公開スレッド表示） | reply監視（読取系R0可。検索はHARNESS_BLOCKED） |
| LN-58 | X @MinoruOffice | 2026-08-08 (HC) | https://x.com/MinoruOffice/status/2085606586463268990 | UNKNOWN | UNKNOWN | BASELINE | REACHABLE / REPLY_WAIT | 2026-08-08 Human送信完了確認（公開reply） | reply監視（X読取不可 — Human報告経路） |
| LN-62 | X @toro_etoile | 2026-08-08 (HC) | https://x.com/toro_etoile/status/2085156769622548531 | UNKNOWN | UNKNOWN | BASELINE | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@ys_aimini | X @ys_aimini | 2026-08-08 (HC) | https://x.com/ys_aimini/status/2085697604189626502 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@HatoNozomu | X @HatoNozomu | 2026-08-08 (HC) | https://x.com/HatoNozomu/status/2085687351939051632 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@Frecciarossa956 | X @Frecciarossa956 | 2026-08-08 (HC) | https://x.com/Frecciarossa956/status/2085697486853919001 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@shinchan731 | X @shinchan731 | 2026-08-08 (HC) | https://x.com/shinchan731/status/2085361070777291124 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@KIITYAN_YouTube | X @KIITYAN_YouTube | 2026-08-08 (HC) | https://x.com/KIITYAN_YouTube/status/2085376088939929684 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@Sharkley28 | X @Sharkley28 | 2026-08-08 (HC) | https://x.com/Sharkley28/status/2085350652478414879 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@gVlKbmhD9D8IghT | X @gVlKbmhD9D8IghT | 2026-08-08 (HC) | https://x.com/gVlKbmhD9D8IghT/status/2085272673320599810 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@Lua_cha_m | X @Lua_cha_m | 2026-08-08 (HC) | https://x.com/Lua_cha_m/status/2085232482753147069 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@ariablue0314 | X @ariablue0314 | 2026-08-08 (HC) | https://x.com/ariablue0314/status/2085247887198638200 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@346kunx | X @346kunx | 2026-08-08 (HC) | https://x.com/346kunx/status/2085311590476439873 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@nameraka | X @nameraka | 2026-08-08 (HC) | https://x.com/nameraka/status/2085645670309068967 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@kubotahiroto | X @kubotahiroto | 2026-08-08 (HC) | https://x.com/kubotahiroto/status/2085846571523129698 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@neginegi55hmaky | X @neginegi55hmaky | 2026-08-08 (HC) | https://x.com/neginegi55hmaky/status/2085519186768638179 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |

- Batch 1 Target 20 / SENT 20 — **送信枠は消化済み**。以後の本Batchの仕事はWorld Signal回収（reply / reaction）と会話前進のみ。
- X 15件の送信方法: Humanが各元投稿を開き、公開replyとして手動送信（送信完了をHumanが確認）。message_styleは、初期7件（C01 / C02 / C04 / C09 / C14 / LN-58 / LN-62）がBASELINE確定、以後のX 13件は `UNKNOWN`（HUMAN_SHORT Defaultの期間だが、実文面が回収できるまで確定記録しない）。

## Conversation Log

（返信発生時にここへ追記: id / 受信日時 / reply verbatim / signal分類 / 生成した次の1問 / Human送信結果）

- 2026-08-08: 返信なし（初回抽出時点）。
- 2026-08-08: C01 / C02 / C04へ `SENT_BUT_NOT_PUBLICLY_VISIBLE`（Delivery Layer failure / VOID）を転記。Provenance: Human実測 → `LEARNINGS.md` 訂正1 C-1（Lane C経由のHuman裁定）。これによりL1の「要転記（Human Handoff）」は完了し、当該FACTの一次記録は本台帳へ移る。機構的詳細（shadowban / dead等）は引き続き `UNKNOWN`。
- 2026-08-08: **Human-confirmed full sync**（Lane A Task返信）。SENT=20（HN 3 / Bluesky 1 / SE 1 / X 15）へ台帳を同期。X 15件の元投稿URL受領・記録。C14 / C09はHuman画像確認によりREACHABLE確定。旧「追加Contactあり・詳細受領待ち」注記（C-2）は本syncで解消。cluster / 文面 / freshnessはrepo内に回収可能なDemand成果物が存在しないため `UNKNOWN` のまま（全remote branch検索済み）。
- 2026-08-08: 定期self check-inを停止（X読取不可環境では主要World Signalを取得できないため）。Humanからreply / reactionが共有された時のみLane Aを再起動する（Human裁定）。
