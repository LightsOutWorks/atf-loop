# X World Signal / Reply Ingestion Canary — Task Contract

Status: **PROPOSED**（D-003 Decision 6。採択 = ヒロの本契約merge。実施 = merge後のヒロの明示Go（Human Gate）。本契約の存在は実施を約束しない）
制定: 2026-08-09（D-003 UPPER-LAYER INTEGRATION）
Experiment ID候補: E-011（`experiments/INDEX.md` への登録は実施Goと同時に行う）
Major Desire接続: MD-2（inbound World Signal Intake）/ MD-1（Batch 1 outcome帰属の保全）/ MD-3（義務的Human Handoff削減の最初の実測点）
関連evidence: Human Leverage Rederivation G-1・I（2番手候補）/ Ownership Audit F節（World Signal回収路の欠落）/ E-005（Grok x_search Sensor PASS）/ E-008（このharnessからX直接読取はHARNESS_BLOCKED）

これは**一回限りのCanary**である。常時Radar・定期監視・Automationではない。成功しても即Automation化しない（Observe → Learn → Automate。`ROADMAP.md` §0）。

---

## Goal

@LightsOutWorks が送信したX上のDiscovery Contact（`experiments/batch-1/LEDGER.md` のX 15行）について、xAI Grok x_search（E-005でSensorとしてPASS済みのRoute）を用いた1回の実行で、以下が**できるか**を確認する:

1. **outbound replyの自動発見**: 送信済み公開reply（@LightsOutWorks発）を機械探索で発見できるか
2. **元投稿への帰属**: 発見したreplyをLEDGERの元投稿URL（行キー）へ正しく帰属できるか
3. **direct replyの検出**: 元投稿主から@LightsOutWorksへの返信の有無を判定できるか
4. **最小Human Handoff**: 検出結果を必要最小限の形（対象LEDGER行 / reply verbatim / URL）でHumanへ渡せるか

## Non-goals

- 常時監視・定期実行・cron / Skill / Hook / Automation化
- 返信への自動応答・第三者への送信（R3 Human Gateは不変。本Canaryの送信行為はゼロ）
- C09（SE）/ C14（Bluesky）/ HN 3件のための専用監視システム（非X経路は既存のR0手動チェックで足りる — D-003 Explicitly NOT adopted）
- 新DB / Router / Platform / dashboard構築
- Batch 2候補のsourcing（本CanaryはIntakeのみ。Demand Scanと混ぜない）
- Batch 1返信の統計的評価（小N規律 — `LEARNINGS.md` L4 / C-2）

## Inputs

- `experiments/batch-1/LEDGER.md` のX 15行（元投稿URL / status ID）
- 送信主体: @LightsOutWorks（Human-reported。sender identity inventoryはrepo内未整備 — Ownership Audit F-1。本Canaryの記録が最初のinventory実測点を兼ねる）
- xAI API（購入済みPrototype credit残存分。Auto top-up OFF維持。E-005実績: 48+5 queriesで$1.815）
- 実行環境: 本harness + xAI API経由（X直接読取はHARNESS_BLOCKED — E-008。到達性は実行冒頭で確認）

## Unknown（事前登録）

- @LightsOutWorksの公開replyがx_search indexに載るか（新規・低activityアカウントのindex可視性）
- x_searchがreply-to関係（thread構造）を判別可能な形で返すか
- 発見網羅率（15件中何件を発見できるか）
- 投稿からindex反映までのlatency
- status ID直接指定の検索が可能か、handle検索からのfilterが必要か

## Budget cap

- xAI API支出: **USD $3.00**（既購入credit内。新規支払い・top-upなし = 支払いHuman Gate非発生）
- 超過見込みが実測クエリ課金から出た時点で即停止（Stop condition 1）
- 1セッション内で完結。持ち越さない

## Success（事前登録）

以下すべて:

1. X 15行中 **12行以上**でoutbound replyを発見し、元投稿URL / status IDへ正しく帰属
2. 発見した全行についてdirect replyの有無を判定（0件でも「判定できた」なら可）
3. Human Handoff出力（LEDGER行キー / reply verbatim / URL）が生成され、Human ground truth照合で**帰属誤りゼロ**

## Partial success

- 発見が12行未満だが**1行以上**で「発見 → 帰属 → direct reply判定」のchainが完走し、未発見行に原因分類（index未載 / 検索式の限界 / latency等）が付く
- Partial successはRoute PASSとして扱わず、原因分類を次の設計入力とする

## Failure

- 発見0行、または**帰属誤り（別Contactへの誤帰属）が1件でも**Human照合で確認された場合
- FAILはFAILとして記録する。ただしindex遅延等で評価不能が支配的な場合は**VOID**（VOIDをFAILとして学習しない — `CONSTRAINTS.md` Part I §6）

## False-positive防止

- 帰属は元投稿URL / status IDの**完全一致のみ**（handle・本文類似からの推測帰属を禁止）
- 「reply発見」は@LightsOutWorks発の実textを取得できた場合のみ（検索hit件数だけでは発見と数えない）
- direct reply検出は元投稿主handleとの一致を要する（第三者の返信をdirect replyと数えない）
- 全判定行にsource query / raw結果参照を残す（Proposalを先に作って都合の良いEvidenceを探さない — OS.md 補遺2）

## Human ground truth方法

- Canary実行後、ヒロが**最低2行**を無作為に選び、X上で実際のreply / direct reply状態を目視確認する
- AI検出とHuman目視の不一致が1件でもあれば当該行を誤検出として記録し、判定を1段階降格する（Success → Partial / Partial → Failure）

## Stop conditions

1. xAI支出が$3.00へ到達する見込み（実測クエリ課金で判断）
2. x_search APIエラー・認証失敗が3回連続
3. LEDGERのX行URLが1件も検索対象として解決できない
4. Hard Boundary / Data Boundary抵触の兆候（非公開情報の混入等 — `CONSTRAINTS.md` Part I §5）
5. ヒロの停止指示

停止時は、その時点までの実測（query set / raw結果 / cost / 発見行 / 原因）を**repoへcommitしてから**終了する（paid sensor run成果物の着地規則 — Ownership Audit F-2 / `CONSTRAINTS.md` Part I §2の支出因果記録。E-005成果物喪失の再発防止）。

## Human Gate

- **実施Go**: 本契約のmerge後、ヒロの明示Goで開始する（xAI API消費を伴うため。mergeは採択であって実施Goではない）
- **送信ゼロ**: 本Canaryは読取のみ（R0 + paid API消費）。第三者への送信・返信・公開は一切行わない
- **結果の利用**: 検出したreplyへの応答文生成・送信はすべて別Task（HUMAN_SHORT・1問のみ・送信はR3 Human Gate — `LEDGER.md` 運用規則2）
- **成功後の扱い**: 成功してもAutomation化しない。次の反復可否はDirection Review（`DESIRES.md` §3の発火点）で判断する
