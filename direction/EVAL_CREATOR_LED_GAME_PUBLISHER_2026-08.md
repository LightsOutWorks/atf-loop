# EVAL — Creator-Led AI Game Publisher（Creator Game Opportunity Orchestration Layer）

- **提案**: Human（2026-08-15 Task Contract + Targeting Update + 明示Major Bet Commit。全文は `DECISIONS.md` D-015 Authority欄が指す本セッション会話ログ）。
- **評価**: 2026-08-15 Claude。着手前の正本照合（`OS.md` HI-12）で `OS.md` Current Identity・`CURRENT_STATE.md` §7-0（D-007）・§7の3点と矛盾を検出し、`CLAUDE.md` §2に従い一度停止してHumanへ提示。ヒロがMajor Bet Commitで矛盾を解消（D-015）したため、本評価はE-014評価（`EVAL_DESIRE_TO_GAME_2026-08.md`）の前例に従い要素分解して個別判定する。
- **照合の形跡**（`OS.md` HI-4 F10）: `CONSTRAINTS.md` Part I全文 / `OS.md` Current Identity・HI-5・HI-9〜HI-12・Layer2「探索と固定」/ `DESIRES.md` / `CURRENT_STATE.md` §2・§7・§7-0・§7-0-a / `DECISIONS.md` D-001・D-007・D-013・D-015 / `experiments/INDEX.md` 全件・運用規則・契約の事前登録検査6項目 / `experiments/desire-to-game/LEDGER.md` / `direction/EVAL_DESIRE_TO_GAME_2026-08.md`（契約様式の参照元）/ `.claude/skills/reuse-before-build/SKILL.md` / `.claude/skills/preregister-experiment/SKILL.md`。

## VERDICT

| 要素 | 判定 |
|---|---|
| Major Bet変更そのもの（Creator-Led AI Game Publisherを新ベットとして採用しGame Routeを再活性化） | **Human Commit済み — `DECISIONS.md` D-015**。本評価は追認のみで、決定はClaudeが行っていない（`OS.md` HI-11） |
| Stage A — Creator Universe構築・Rank・上位30深掘り・Contact Route・初回メッセージ案・判定フレーム設計（本Task ContractのPhase 1〜7 / Definition of Done） | **GO** — 本契約（§5・E-016 Stage A）で実行可能。Claude戦術Owner範囲内（HI-11） |
| Stage B — 最初の30件の実送信・観測・判定 | **HOLD** — Human Gate（`CONSTRAINTS.md` Part I §4）。実送信はHumanが行う。Stage Aの成果物はStage Bの材料に過ぎない |
| CRM SaaS / 自動DM bot / scraping infrastructure / mass mailing system / dashboard / Creator Platform / autonomous outreach agent / contact databaseの恒久機構 | **NO_ACTION** — D-015が明示的にNon-goalとして維持。今回作らない |

**着手の因果1文**（`OS.md` HI-10）:

> このExperiment → 日本語圏Micro/Family-led Gaming CreatorのUniverseとRank・Contactabilityの一次実測、および「制作費負担＋Revenue Share」型提案への反応（Stage B・Human Gate後）を取得 → 現在の律速「Need→Paid Value→Confirmed Revenueが未証明」および構造的律速「World Signalを回収し、正しいContact / Needへ帰属し、次のActionへ戻す経路が弱いこと」（`CURRENT_STATE.md` §7）に対し、Creator ExposureというDistribution経路を新たに開通させることで、無償のE-014より大きなAudience経由でDesire → Reality変換の実証機会を作る → MD-1（Confirmed Revenueへの新経路）/ MD-2（Genuine Encounterの新Distribution Asset）→ North Star（Human Desireを最良の手段でRealityへ変換する機関）。

**HI-10 7条件の充足**: ①North Star接続（上記）②MD-1・MD-2接続（Creator経由のDesire発見とDistribution）③律速（Distribution経路の構造欠落を直接広げる新経路）④次のReality（Stage Aの成果物一式・Stage BでのReply/Desire Signal）⑤探索範囲（D-015がMajor Betとしてこの範囲を明示的に承認——「日本未上陸」条件のみ本ベットに限り解除）⑥より小さい方法がない（REUSE-firstを上位に適用したうえで、Creator Universeの一次調査自体はBUILDでなくResearchであり、既存の公開Web調査能力で足りる）⑦今やる理由（Human Major Bet Commitが本日成立し、Human自身が「今すぐ調査してよい」と明示）。

---

## 1. 北極星と整合するか — する

1. **D-015がMajor Betとして明示的に承認した。** `OS.md` HI-11「戦略またはMajor Betの変更」はHumanの専管事項であり、本評価はその決定の実行可能性のみを判定する。
2. **役割分担はLayer1の写しである。** Creator = Desire + Taste + Audience（Human側）／Platform = Research + Search + Build + Test + Distribution + Optimization（Factory側）は、`OS.md` §1「Human expresses desire. Factory discovers how. The world decides value.」の実装形そのもの。
3. **Route is not Identity（`DESIRES.md` §6）と整合する。** GameはIdentityではなくRouteであり、D-001が禁じたのはBrowser-Toy Production Route（AI起点・無人生産・週次公開・自社Identity化）というIdentityの固定であって、Human Desire起点でGameという媒体を使うこと自体ではない（`EVAL_DESIRE_TO_GAME_2026-08.md` §1-1と同じ論理）。本ベットはさらに、Creator自身のDesireを起点にする点でE-014（実在人間のDesire起点）と同型であり、AI起点だった旧Routeの失敗の鏡像修正になっている。

## 2. そのまま再利用できるもの

| 資産 | 所在 | 再利用の形 |
|---|---|---|
| 最小ゲーム生成能力 | `works/` 24作・E-015 ECHO（Human Desire起点のゼロ生成 → AI Player評価） | Creator Desire起点の制作パイプラインの土台として再利用可能。Creator向けは即座に量産しない——まずUniverse/Rank/Contact設計が先 |
| 公開Web観測 | D-014（Public Web Observation R0自律） | Creator Universe構築（プロフィール・登録者数・視聴傾向等の公開情報収集）にそのまま使う |
| World Prior Mining | `.claude/skills/mine-world-priors/SKILL.md`（D-013） | 「Creator-Led Game Publisher」型の海外先行事例（既に収益化されている類似事業）の解剖に使う。Factory自身のExperiment判定には使わない（D-013） |
| REUSE-first判断 | `.claude/skills/reuse-before-build/SKILL.md` | 下位Layer（Game Engine・Distribution・Payment・Hosting）を自社で作らないための既定Route |
| 対人規律 | `experiments/desire-discovery/SELF_ANALYSIS_PROTOCOL.md`（在重力）/ `DESIRE_ENGINE_LONG_GAME.md` | 個別営業文のTaste・Desireの引き出し方に適用 |
| 台帳・事前登録の様式 | `experiments/desire-to-game/LEDGER.md` / `EVAL_DESIRE_TO_GAME_2026-08.md` §5 | 本契約（§5）とE-016台帳の様式に流用 |
| コンプラ | `ops/JP_COMPLIANCE_BRIEF_2026-08.md`（PRE-REVENUE） | 現段階（無償・送信なし）は適用対象外。Revenue Share型契約が具体化する段階で追補が必要（§7-3） |

## 3. 本当に不足している最小Capability — 新規Capabilityはゼロ

不足は規律側の2点のみ。

1. **事前登録**（本文書§5）。
2. **観測台帳・Universe台帳**（`experiments/creator-universe-jp/` 配下。承認後・データ収集開始前に列を確定する — E-014と同じ理由）。

## 4. 新しく作らないもの

CRM SaaS / 自動DM bot / scraping infrastructure（恒久crawler・scheduler・DB） / mass mailing system / dashboard / Creator Platform（Creator向けUI・登録フォーム等） / autonomous outreach agent / contact databaseの恒久機構 / 新gate体系 / Game Engine自社開発 / Payment・決済基盤自社開発。成果物はCSV / Markdownのみ。

## 5. E-016 — Creator-Led AI Game Publisher: Creator Universe & Outreach Prep（実験契約・事前登録）

- **experiment_id**: E-016
- **desire接続**: MD-1（Economic Engine。Creator Audience経由の新Paid Value Loop候補）/ MD-2（Distribution / Encounter Engine。Creator ExposureというInbound/Outbound両用のDistribution Asset候補）
- **Major Bet**: `DECISIONS.md` D-015（Human Commit済み）

### Stage A（本契約が今回対象とする範囲。Claude実行・R0/R1/R2のみ）

- **内容**: Task Contract Phase 1〜6 + Definition of Done ①〜⑥。日本語圏ゲーム系Creator Universe（目安1000人。Micro Gaming ≈600 / Parent-led Family ≈300 / Exploration ≈100）の公開Web調査 → 5要素Rank（Desire Fit / Distribution Power / Contactability / Content Fit / Decision Speed。自然言語で理由を残す・固定Scoreにしない） → 上位30人の深掘り（personalization hook・テンプレ禁止） → Contact Route選定（Email→Management→X DM→Instagram/TikTok優先・本人の公開導線優先・同一人物への複数媒体同時送信禁止・営業拒否表示のある経路は使わない） → 初回メッセージ案作成（30件Learning Batch・機械的A/B禁止・Creatorごとのpersonalization優先）。
- **hypothesis（反証可能形。Stage Aは調査であり判定対象はStage Bだが、Stage A自体の成立可否として）**: 日本語圏の公開Web情報だけで、Micro/Family-led Gaming Creatorについて「本人の言葉によるDesire/Tasteの手がかり」と「合法的contactability（公開business email / management / contact form等）」の両方が同時に確認できる候補を、意味のある規模（目安・上位候補で少なくとも100件オーダー）で発見できる。
- **変更変数**: 営業対象の重心をMega/Midから Micro Gaming / Parent-led Family へ変更（2026-08-15 Targeting Update）。Value Propositionを「配信してください」から「あなたが一番遊びたい・配信したいゲームをこちらの制作費で作らせてください」へ変更。
- **PASS（Stage A）**: Definition of Done ①〜⑥の成果物が揃い、かつ次のすべてを満たす — (a) 各Creator行にevidence_urls・evidence_dateが記録されている（推測でcontact情報を埋めない・private情報を探索しない） (b) Family Creator行は成人保護者/management以外を営業対象にしていない (c) 上位30人の初回メッセージ案がテンプレ差し替えでなく、本人の言葉・企画傾向に基づくpersonalizationを持つ (d) 外部送信を一切行っていない。
- **FAIL（Stage A）**: 公開Web調査だけではcontactableな候補が意味のある規模で見つからない（目安: 上位Rank候補のうちcontactability「合法的経路あり」がUNKNOWN以外で確認できるものが著しく少ない場合）。この場合はStage Bへ進まず、Contact Route設計自体を見直す。
- **VOID（Stage A）**: 公開Web到達性の制約（D-014が記録するegressの制約等）でUniverse収集自体が実行不能だった場合。VOIDをFAILとして学習しない。
- **STALE（Stage A）**: 判定点前にD-015のMajor Bet自体が上位Human判断で変更・撤回された場合。
- **budget_cap**: 追加支出 **JPY 0**（既存Claude Max内。外部有償API・素材購入・広告費なし）。
- **Human時間上限**: Stage Aの遂行自体はClaude戦術Owner範囲（HI-11）でHuman時間を要さない。ヒロのレビュー（Universe抽出方針の確認・上位30人と初回メッセージ案のレビュー）に目安60分。
- **rollback**: 外部作用なし。成果物（CSV/Markdown）はrepo内に残るのみで、外部への影響はゼロ。停止＝以後の収集・Rank更新を止めるだけ。

### Stage B（実送信・観測・判定。Human Gate — Claudeは実行しない）

- **前提**: `CONSTRAINTS.md` Part I §4により、DM / email / contact form等の第三者送信は**Humanのみ**が行う。ClaudeはStage Aの成果物（Rank・Contact Route案・メッセージ案）を提供するのみ。
- **hypothesis（反証可能形）**: Micro/Family-led Gaming Creatorへ「あなたが一番遊びたい・配信したいゲームをこちらの制作費で作らせてください」という個別化された初回メッセージ（軽量・15分打診型）を送ると、一般的な「ゲームを作ったので配信してください」型の売り込みより高い応答率・肯定的反応が得られる。Micro/Family-led Creatorは大手より意思決定が速く、本人判断で応答しやすい。
- **対象**: 最初のLearning Batch = 上位30人のうち、Humanが実際に送信すると判断した件数（30件を上限とし、それ未満でもよい。Human裁定）。
- **world_signal（台帳の列。Stage B開始前＝1件目の送信前に確定）**: creator_id（Universe台帳のIDと結合） / channel（送信に使った経路） / sent_at / delivered_if_known / reply（Y/N） / reply_at / positive_reply（Y/N。ヒロの主観判定＋根拠一言） / conversation（Y/N） / meeting（Y/N） / desire_received（本人の言葉で「作りたいゲーム」の具体。PII除去） / reject_reason（あれば）。
- **PASS**: N=30（またはHumanが送信した件数）のうち、reply率・positive_reply率が「次バッチへ進める」とHumanが判断できる水準にある、または少数でも質の高いdesire_received（具体的で実装可能なゲームDesire）が得られる。**固定閾値のパーセンテージをここで先回りして決めない**——N30では統計的検定が成立しないため、判定はHI-5語彙（GO/HOLD/KILL/WAIT/NO_ACTION）による実務判断とし、判定点でHumanと合意する。
- **FAIL**: 送信完了かつ判定点までにreply 0件、またはreplyはあるが一貫して明確な拒否・無関心のみ。
- **VOID**: 送信未完了・記録欠損・delivered_if_knownが取得不能で判定不能。VOIDをFAILとして学習しない（Batch1・E-013の教訓を適用）。
- **強シグナル（記録するがPASS条件にしない）**: 対象外の第三者からの自発的な同種の関心表明・management側からの自発的な条件確認。N=30では発生ゼロが最頻になりうるため、判定の必須条件にしない（`experiments/INDEX.md` 事前登録検査4）。
- **判定点**: 最初の送信から14日後、またはHumanが指定する日の早い方（実送信が発生していないため未確定。**実送信が発生した時点でHumanが起点日を本条へ確定記入する**——判定窓は送信起点で書く。E-006 Reply Log 004の実測欠陥を再発させない）。
- **rollback**: 送信済みメッセージの撤回はできない。以後の追加送信を停止するのみ。
- **実験のKILL条件**: Human Gate違反（未成年への直接営業・非公開連絡先の探索・営業拒否表示のある経路への送信）が1件でも確認された場合は即KILLし、原因をJOURNAL/D-recordへ記録する。
- **独立Human Commitの非連動**: Stage AのPASS/FAILは、Stage Bの送信実行という別のHuman Gate行為を自動発火しない。送信するかどうかは各件ごとにHumanが個別に判断する（事前登録検査5）。

### 共通・非目標

- **非目標**: CRM SaaS / 自動DM bot / scraping infrastructure（恒久crawler） / mass mailing system / dashboard / Creator Platform / autonomous outreach agent / contact databaseの恒久機構 / Revenue Share契約の確定条件を営業文へ書くこと（未FIXの契約条件を確定事項として書かない） / Open Rateを主KPIにすること。
- **観測入力の規律**: 判定に使う値はHuman-confirmedの実測のみ。未確認は `UNKNOWN`。

## 6. 外部送信のHOLDと解除trigger

Stage Bの実送信は**個別Human Gate**であり、Stage A完了が自動的に送信を発火しない（`CONSTRAINTS.md` Part I §4 / 事前登録検査5）。

- **解除**: Humanが上位30人の成果物（Rank・Contact Route案・メッセージ案）をレビューし、送信する件を個別に選び、Humanの手で送信する。
- **発火時に維持する制約**: 同一人物へ複数媒体同時送信しない / 営業拒否表示のある経路には送らない / Platform DM規約・rate limit・spam policyは送信直前にHumanが最新の公式情報で確認する / Revenue Shareの契約条件が未FIXであることを営業文で確定事項として書かない。

## 7. 正本との緊張点（隠さない）

1. **旧ベットとの関係。** D-015は`CURRENT_STATE.md` §7-0（D-007）の「日本未上陸」条件を**本ベットに限り**解除する。他候補（求人・融資Excel等、`CURRENT_STATE.md` §7-0-a KILL済み含む）には旧条件が引き続き有効であり、本評価はそれらを再審理しない。
2. **E-014との並走。** E-014（Desire to Game Reality Test）の契約・Funnel現在値・判定点は本D-015・本契約により一切変更されない。E-014のtriggerをE-016の進行条件にしない（D-015 Decision 2 / `CURRENT_STATE.md` §7例外条項）。E-014は無償・家族/知人限定のまま独立に継続する。
3. **REUSE-firstとの関係。** Universe構築・Rank・Contact Route選定・営業文起草はいずれも新規ソフトウェア資産を必要としない（公開Web調査 + Markdown/CSV作成）。E-016はBUILDを伴わない——REUSE-first原則と矛盾しない。
4. **Family Creatorの取り扱いの正本不在。** 未成年者を含む家庭の公開情報を扱う際の規律は、既存のCONSTRAINTS.md Part I §5（Data Boundary: private email・非公開個人情報を探索しない）を上位規律として適用し、本契約はその上に「営業対象は成人の親・保護者・managementのみ」「対象AudienceはEvidenceがない限り推測しない」という追加の絞り込みを置く。特商法・未成年者契約等の法令適合は、Stage B以降の契約具体化時に追加調査が必要（未着手・`UNKNOWN`）。

## 8. Humanへ返す判断（1件 — `OS.md` HI-2）

**本PRのmerge = Stage A契約（E-016）の正式登録、およびD-015の正本反映の承認。** mergeされなくてもStage Aの調査自体はHuman Major Bet Commit（会話ログ）により着手済みの根拠を持つが、正本側の整合はmergeで完了する。Stage Bの実送信は本PRのmerge有無に関わらず、常に個別のHuman Gateを要する。
