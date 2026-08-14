```json atf-control-state-v1
{
  "schema": "atf.control-state/1",
  "base_sha": "97b6c63d6db3309601704a6ddfb01aa3b65b49ba",
  "gates": [
    {
      "id": "F0",
      "status": "PASS",
      "evidence": [
        "PR #22 merged as merge commit 6bef0f7e001d6ecebddcea4f9904b9dc47cc0343; OS.md blob a6e207202f78a00029b75f33a82f7005e671d429 on main; SHA-256 match with approved source recorded in CURRENT_STATE.md section 11. OS.md v1.1 amendment proposed by D-001 (2026-08-08) in draft PR #32; adoption occurs at human merge; amendment recorded in DECISIONS.md"
      ]
    },
    {
      "id": "F1",
      "status": "PASS",
      "evidence": [
        "CURRENT_STATE.md on main at 2420fae05435c84602efbaaae5de83457f36311e (blob a92c9643cea1fcec8cca9d113e55f872b1a4f452) with observed_at, base SHA, evidence scope, implemented/unproven separation, single bottleneck and smallest next gate; body re-based to 2026-08-08 observation by D-001"
      ]
    },
    {
      "id": "F2",
      "status": "PASS",
      "evidence": [
        "ROADMAP.md on main at 2420fae05435c84602efbaaae5de83457f36311e (blob 084fbaf430e3585887317140eebde27c4e8071a5) as an evidence-gated dependency graph with lanes, prerequisites and rollback conditions"
      ]
    },
    {
      "id": "F3",
      "status": "IN_PROGRESS",
      "evidence": [
        "PR #25 merged: F3 precursor reader scripts/control-plane-canary.mjs, its deterministic tests and .github/workflows/evolution-control-plane-canary.yml are on main; semantic ranking per OS criteria and F3 PASS are not yet proven",
        "main workflow run 31088621095 at ee85650749912018daa02b58e111017dda09acfe: control-plane canary result PRECURSOR; artifact 8962454105 (SHA-256 3aa87b53d3f256ceee5edf3d885aafadc903d5d6bdb04d093da149392f47ebe6); inspected head identical at start and at final fetch; materially stale=false; structural reader proven; semantic ranking and F3 PASS not yet proven"
      ]
    },
    {
      "id": "F4",
      "status": "NOT_STARTED",
      "evidence": []
    },
    {
      "id": "F5",
      "status": "NOT_STARTED",
      "evidence": []
    },
    {
      "id": "W0",
      "status": "HOLD",
      "evidence": [
        "Draft PR #24 is a W0 precursor held as HOLD; the W0 comparable distribution canary itself has not been executed"
      ]
    },
    {
      "id": "W0A",
      "status": "NOT_STARTED",
      "evidence": []
    },
    {
      "id": "W1",
      "status": "NOT_STARTED",
      "evidence": []
    },
    {
      "id": "W2",
      "status": "NOT_STARTED",
      "evidence": []
    },
    {
      "id": "W3",
      "status": "NOT_STARTED",
      "evidence": []
    },
    {
      "id": "W4",
      "status": "NOT_STARTED",
      "evidence": []
    },
    {
      "id": "W5",
      "status": "NOT_STARTED",
      "evidence": []
    },
    {
      "id": "C0",
      "status": "PASS",
      "evidence": [
        "main workflow run 31075997147 at 01245a29acaab5547a8fbcdff201beb37abf04f9: C0 result PASS; 68/68 deterministic tests passed; 31/31 OBSERVED fields verified (coverage 100%); artifact 8957508638"
      ]
    },
    {
      "id": "C1",
      "status": "NOT_STARTED",
      "evidence": []
    },
    {
      "id": "C2",
      "status": "NOT_STARTED",
      "evidence": []
    },
    {
      "id": "C3",
      "status": "NOT_STARTED",
      "evidence": []
    },
    {
      "id": "C4",
      "status": "NOT_STARTED",
      "evidence": []
    },
    {
      "id": "C5",
      "status": "NOT_STARTED",
      "evidence": []
    },
    {
      "id": "C6",
      "status": "NOT_STARTED",
      "evidence": []
    },
    {
      "id": "X0",
      "status": "NOT_STARTED",
      "evidence": []
    },
    {
      "id": "X1",
      "status": "NOT_STARTED",
      "evidence": []
    }
  ]
}
```

Canonical routing note: The JSON block above is the sole current source within CURRENT_STATE.md for gate status, base revision, and gate-status inputs to routing. The atf-control-roadmap-v1 block at byte 0 of ROADMAP.md is the sole current source for structural prerequisites. Together, these two canonical blocks are the sole machine inputs for deterministic dependency routing. The human-readable body below is the current observed evidence for semantic review, synchronized to the base SHA above. The body may add observations and context, but it MUST NOT override the blocks' gate status or prerequisites; if the body and a block disagree, the block governs and the disagreement is a defect to record and fix.

# Current State

Status: **OBSERVED SNAPSHOT — not a target, not a promise**

Observed at: **2026-08-09 23:13 JST**

Default branch: `main`

Base SHA: `97b6c63d6db3309601704a6ddfb01aa3b65b49ba`（PR #45 merge後）

Evidence scope: **the default branch at the SHA above, recorded GitHub Actions runs and workflow states cited in this file（workflow stateは2026-08-09のActions API read-only実測）, and — explicitly labeled as such — Human-reported reality from the 2026-08-08 Current State Override and the 2026-08-09 Task Contract（D-003 UPPER-LAYER INTEGRATION）+ 同日D-003 AMENDMENT（CURRENT EXPERIMENT PRIORITY SYNC）+ 同日PR #40 FINAL REALITY SYNC + 同日 D-004 Public Identity決定（いずれも会話レベル。リポジトリ外の実測をヒロ/実行セッションが報告したもの）**

この文書は、Factoryが「今できること」と「まだできないこと」を区別するための現在地である。会話、予定、提案を実装済みの事実として書かない。確認できないことは `UNKNOWN` とする。文書の責務分担とSource of Truth Priorityは `OS.md` が持つ。

---

## 1. Mission State Summary

2026-08-08、D-001（`DECISIONS.md`）により本リポジトリはCanonical Migrationを実施した。

- 本リポジトリは**ゲーム工場ではない**。現在のMissionは `OS.md` 冒頭のCurrent Identity、North Star / Major Desireは `DESIRES.md` を参照。
- Browser-Toy Production Route（SEED 001〜024、`factory.yml`）は**Historical Experiment（HOLD）**。`factory.yml` ファイル内にはhistorical cron定義が残るが、GitHub Actions workflow `factory` 自体は **disabled_manually**（2026-08-07 10:39 JST停止。2026-08-09 Actions API read-only実測）。**cron定義の残存とworkflow enabled stateは別のfact**であり、残存riskはre-enable（Human Gate）時のみ（§4）。
- 現在のActive Reality Experimentは**Batch 1 Discovery Contact**（§2。現在Phase = World Signal回収）。
- **2026-08-13 追記（日付付き追加。2026-08-09観測の本文・ヘッダ・canonical blockは変更しない）**: **E-014 Desire to Game Reality Test が承認された**（PR #65 merge = 契約 `direction/EVAL_DESIRE_TO_GAME_2026-08.md` §5 が事前登録したHuman Gate。merge commit `0dcf7d6`）。status = **ACTIVE — Phase 1未着手・納品0**。台帳 = `experiments/desire-to-game/LEDGER.md`。E-006 / E-011 / E-012 / E-013 は変更なし（並走）。現在の戦略・ベット（§7-0）も変更なし——E-014は探索期のprobeであり全ベットではない。
- 上位Direction統合はD-003（`DECISIONS.md`）。現在の律速は§7。
- **Public Identity = `Living Ground`**（D-004。2026-08-09 Human決定）。商品面・公開媒体の名称。GitHub org `LightsOutWorks` は作業場として不変更。シンボル（巽 ☴）とアセット一式は `brand/`、幾何規格は `brand/BRAND_SPEC.md`。
- **Identity rollout = 部分実施済み**（2026-08-10 00:59 Human実施・画像実測）: X表示名 / **Xハンドル `@livinggroundjp`** / Xアイコン / X bio / noteアカウント（表示名・アイコン）は切替済み。Googleアカウントは新規作成が電話番号上限で不可のため、既存 `lightsoutworks@gmail.com` の表示名・アイコンを Living Ground へ変更して対応。**noteメール認証は完了**（2026-08-10 Human-confirmed）。**投稿の前提条件は解除された。** 残る未完了: Xヘッダー（**旧名 `LIGHTS OUT FACTORY` が公開面に残存**）/ note自己紹介 / noteヘッダー / note ID は **`livinggroundjp` で確定**（`https://note.com/livinggroundjp`。2026-08-10 Human報告。**Xハンドル `@livinggroundjp` と完全一致**しており、`LLMO_EXECUTION_PLAN` §5-6 のEntity一貫性を満たす）。詳細と貼付用の実文は `experiments/md2-distribution/PROFILE_COPY_LIVING_GROUND.md` §0。
- **公開面の実測**: Xフォロワー **3**（2026-08-10 00:59）。note記事 **0本**。
- **`EN_GATE`（英語進出の解除条件。2026-08-10 制定 — `direction/WRITING_SYSTEM_EN_2026-08.md` §9）**: 英語は**現在すべて公開凍結**。解除は下記2つが**両方**満たされた日に、その日の実測値で再判断する。**週1回この2つだけ更新する。到達数（impression）は記録するが解除条件に入れない。**

```
EN_GATE: note = 0 / 10    non_boilerplate_reply = 1 / 3
```

  加えて、言語を増やしてよいのは「**日本語で週2本以上を4週連続で公開した**」が満たされた時のみ。凍結対象は公開だけで、調査・下書き・書法体系の更新は凍結中も行う。
- Confirmed terminal revenue = **JPY 0**（§5）。Factoryは「成功した」と表現してはならない。

---

## 2. Active Experiment — Batch 1 Discovery Contact（E-006 / MD-1接続）

Source: `experiments/batch-1/LEDGER.md`（Contact台帳・正本。2026-08-08 Human-confirmed syncとしてmain上に機械記録あり）。

- Target: **20 Genuine Discovery Contacts** — **送信枠は消化済み**。
- Funnel実測（LEDGER正本。2026-08-09 23:20 JST更新）: SENT **20**（HN 3 / SE 1 / Bluesky 1 / X 15）/ VOID **3**（HN・分母外）/ REACHABLE **17** / REPLY_WAIT **16** / **REPLY 1** / GENUINE_PAIN_CONFIRMED **0**。
- **2026-08-09、Batch 1初の実返信が発生した（X-@HatoNozomu。Human画像確認）。** ただし内容は**Pain仮説の明確な否定**であり、Painスコアは実質0（`LEDGER.md` Reply Log 001）。**`REPLY > 0` を前進と読み替えない** — Terminal Signalは返信数ではなくConfirmed Revenue（現在JPY 0）。
- 根本原因は選定側にある: 元投稿に「**作成するのはいいけどさ**」という本人による明示的な否認が書かれており、**読めば分かる位置にあった**。こちらは否認された側を質問にした。抽出した選定規則（否認語形の機械的検出）はReply Log 001が保持し、次Batchへ引き渡す。
- 本人が実際に述べていた不満（他者が対応表を使わない）は**未着手**。3タグ（HOW/TIME/WHAT）に該当せず、Gap分類では **D. Adoption**。**N=1のためタグを増やさない**（`OS.md` HI-4 F6。同型3件で再検討）。
- **3通目は2026-08-11 03:14 JSTに送信済み**（Human Commit。2026-08-11 03:15 JST Human画像確認 — `LEDGER.md` Reply Log 004）。往復4回。**Stageは `REPLY` のまま動かさない**（会話の長さをファネルの前進として読み替えない）。判定時刻は事前登録どおり **2026-08-13 09:45 JST**（起点を受信時刻で書いた事前登録側の欠陥は Reply Log 004 に記録。窓は延ばさない — `CONSTRAINTS.md` Part I §6）。
- **Humanが起草を1箇所だけ直した**（`OS.md` HI-3 Taste学習則の学習源）: 文末「浮かんでます？」→「**浮かんでたりしますか？**」。在ることを前提に確認する形から、無くてもよい余白を残す形へ。§7-0 の現在の優位のうち**手放す側の余白**にあたる。**N=1のため恒久ルールへ昇格させない**（`OS.md` HI-4 F6。同型3件で書法側へ引き渡す）。
- 現在Phase: **World Signal回収**。送信・候補準備の仕事は本Batchに残っていない。Lane Aの定期self check-inは2026-08-08に停止済み（X読取がharnessから不可のため。Humanがreply / reactionを共有した時のみ再起動 — LEDGER Conversation Log）。
- Message style実測: 初期7件（C01 / C02 / C04 / C09 / C14 / LN-58 / LN-62）= BASELINE確定。X 13件 = `UNKNOWN`（HUMAN_SHORT Defaultの期間だが実文面が未回収 — LEDGER凡例）。cluster / 文面 / freshness_at_send は大半が `UNKNOWN`（Demandセッション成果物の非着地による恒久喪失）。
- DiscoveryとSalesを分離する。初回Discoveryの目的は「相手が自分の現実についてもう一言話したくなる状態を作る」こと。
- Freshness ranking（Hard Boundaryではない）: <24h HIGH / <48h PRIORITY / <72h acceptable / >72h は継続Pain等の追加Evidence要。次Batch向けの未検証prior（`experiments/batch-1/LEARNINGS.md` Rejected Generalizations 2）。
- Contactごとの最小記録項目: source / cluster / freshness / message_style / reply / genuine pain confirmed / continued conversation / pilot candidate / payment / confirmed revenue。学習主体はGrokではなくFactory。

## 3. Proven Sensor Capability — Large-N Demand Intelligence

Source: 2026-08-08実行のCanary（Human-reported + 実行セッション記録。リポジトリ内artifactはまだない）。

- xAI API接続成功、Grok x_search実行成功。cost ≈ $1.815。48 collection + 5 verification queries。
- raw rows 75 / unique 72 / Genuine Need ≈60 / semantic clusters 7 / top clusters 3。Reality Contact候補生成成功。
- 結論: **Public Real-time Human DesireをXから機械探索するRouteはSensorとしてPASS**。市場全体を理解したとは主張しない。
- Large-N（AI観測）とSmall-N（Human個別Contact）を分離する。Demand収集条件に「AIで解けるか」を入れない。
- Gap分類: A. Capability / B. Productization / C. Distribution / D. Adoption。Existing Solutionの存在は自動KILL条件ではない。現在はB/C/D重視。

## 4. Historical Route — Browser-Toy Production Loop（HOLD）

Default branch上の実装事実（前回観測から不変。詳細な運用実績・既知欠陥は git history上の本ファイル旧版 blob `a92c9643cea1fcec8cca9d113e55f872b1a4f452` および `JOURNAL.md` 参照）:

- `factory.yml`（blob `49314d2d531704485064fa1995922f19b8418870`）: 生成→smoke→interaction smoke→Codex gate→公開の無人ループ。ファイル内にhistorical cron定義（`0 1 * * 6` = 毎週土曜01:00 UTC）が残るが、workflow `factory`（id 322145639）は **disabled_manually**（2026-08-07 10:39 JST。2026-08-09 Actions API read-only実測）であり運用scheduleは停止済み。再enableはHuman Gate。
- SEED 001〜024が `works/` にあり、GitHub Pagesのカタログ（`index.html`）で公開済み。
- seed-009 TETHER LOCKは既知のVerification Failureとして意図的に未修正で保存。
- JOURNAL 0005 / 0007の訂正、Selection Record v2は未実装のまま（record debt。凍結中も債務として保持）。
- Control plane: C0 provenance canary PASS（run 31075997147）、F3 precursor reader PRECURSOR（run 31088621095）。canonical blockのbase_shaは2026-08-09 22:30観測で `3408758` へ更新した（同日中に `af26fd0` → `4e690d3` → `3408758` と3回同期。**gate statusは新runがないためいずれの同期でも不変**）。
- `eval.json` はseed-001〜009のみ・全て `world: null` のまま（歴史的証拠として保存）。

## 5. Economic / Budget State

Source: 2026-08-08 Current State Override および 2026-08-09 D-003 AMENDMENT（いずれもHuman-reported / Human-confirmed）。

- **Confirmed terminal revenue = JPY 0**。Need→Paid Value→Confirmed Revenueは未証明。
- 証明済みはここまで: Public Demandの機械探索 / Grok x_searchのSensor機能 / Contact候補生成 / HumanのReality接触。
- Factory monthly hard cap: JPY 50,000（`CONSTRAINTS.md` Part I）。
- Claude Max 20x契約中。ChatGPTは2026-08-13から$20 plan予定。
- **副業条項**（2026-08-09 Human-confirmed）: 就業規則上、副業は**要相談だが禁止ではない**。ヒロの現方針は「**実収益が発生してから会社へ相談して通す**」。相談は**未実施** = `UNKNOWN`。無償提供（自己分析・note記事）のみの現段階では相談不要という前提で進行中。有償受注の発生時点で本項を更新する。
- **xAI credit実測**（2026-08-09 Human-confirmed）: initial **USD 5.00** / cumulative consumption **USD 4.351** / remaining **≈ USD 0.649**。**Day 1 Encounter Queue で USD 0.1631 消費 → 推定残高 ≈ USD 0.486**（2026-08-09 22:45）。Auto top-up **OFF**。追加購入: **条件付き原則承認へ変更**（2026-08-09 Human裁定・会話レベル — Daily Encounter Queue CanaryのDay 3 Final Verdictが**SCALE**の場合に目安**USD 10**をヒロのHuman操作でチャージする。判定前の購入・自動チャージは引き続き禁止。Canary 3日間のBudget capは次項のとおり不変）。
  - > **訂正追記（2026-08-11 03:40 JST / Human Commit。上の原文は不変更で保持する）**: **`SCALE` と USD 10 チャージの連動を解除した。ヒロは USD 10 チャージを承認していない。** `SCALE` は「供給を増やしてよいか」の判断であり、「10ドル買うか」と同じ判断にしない。チャージは**独立した Human Commit として `HOLD`**。解除条件5件（無料供給経路probeの結果 / Humanが無理なく送れる1日件数の実測 / 必要な候補数 / 現在残高で不足する具体量 / 無料経路とxAI経路の品質・時間・再現性の比較）は `experiments/encounter-queue/LEDGER.md`「Day 3 Final Verdict — Human amendment」が正本。判定前の購入・自動チャージの禁止と3日間のBudget capは変更していない。
- **Daily Encounter Queue Canaryの暫定Budget**（2026-08-09 Human裁定）: daily hard cap **USD 0.18** / 3-day cumulative hard cap **USD 0.50** / reserve最低 **≈ USD 0.10** / 追加top-up禁止。

## 6. Open PRs and Session Ownership（観測 2026-08-09）

Open PRは以下の**1件のみ**（draft。GitHub API / git実測 2026-08-09 23:13 JST）:

- **PR #24**（`experiments/w0/*` 追加のみ）: W0 precursor、HOLD。W laneはBrowser-Toy Route凍結に伴い事実上凍結（§8）。canonical fileと競合しない。

2026-08-09夜のmerge（いずれもヒロがmerge。実測確認済み）:

- **PR #43 = merge済み**（main `3408758`）: `direction/WEB_MARKETING_INTELLIGENCE_2026-08.md`（8領域並列調査）。
- **PR #44 = merge済み**（main `e42763b`）: LLMO実行計画 / SALES OS（§12 自己分析→有償の接合部）/ JPコンプラ・ブリーフ / E-012評価と3次改訂 / Desire→Reality 3層設計 / Desire Engine長期構造 / **自己分析プロトコル v1.0**（Direction Card v2のL0–L6分離）/ note記事draft 2本 / **brand一式（D-004）** / `OS.md` v1.2（Human Interface — Operator Priors）/ **E-013 Day 1台帳**。
- **PR #45 = merge済み**（main `97b6c63`）: `OS.md` HI-8（Humanの上位優先順位・**本業がFactoryより上**）/ `JOURNAL.md` 0008（視覚判定能力の追加。0001 TETHER LOCKと同根）。

2026-08-09午前のヒロ裁定（実測確認済み）:

- **PR #31 = merge済み**（main `d77c4f7`）: 環境preflight実測（E-008）がmainに着地。draft-PR滞留evidence（Ownership Audit A-5）は解消。
- **PR #34 = merge済み**（main `0003e2c`）: MD-2 Canaryのcontent候補・**C-1実投稿文と文体差分分析**がmainに着地。E-011の採番が確定（`experiments/INDEX.md`）。C-1公開はHuman Commit 2026-08-08（Human-reported）、X上の反応は引き続き `UNKNOWN`。
- **PR #30 = merge無しでclose**（不採択。branch `claude/genome-factory-design-538h9e` に保存・reopen可逆）: Override以前のBrowser-Toy収益化Route提案。E-007はNO-GOへ（`experiments/INDEX.md`）。
- Merge済み（2026-08-08〜09）: #32 / #33 / #35 / #36（D-001 / LEDGER / LEARNINGS）、#37（Human Leverage Rederivation）、#38（Ownership / Compounding Audit）、#39（D-002 North Star REPLACE）、#40（D-003 Four-Audit Integration）。
- Lane状態: Lane A（Batch 1 / E-006）= **waiting**（World Signal待ち。self check-in停止）/ Lane B（MD-2 Content Canary / E-011）= **active-observing**（C-1 2026-08-08・C-2 2026-08-09投稿済み。初のimpression実測: C-1 ≈20 imp/15h・reply 0 — reachほぼゼロが実測され、Encounter Queue reply→profile訪問を主動線とする仮説を観測対象に追加。§H参照）/ Lane C（Learning抽出）= **closed**（Loop 1完了。第2回抽出はreply回収後）/ Direction監査4本 = **closed**（merge済み。統合はD-003）/ Daily Encounter Queue Canary = **DAY_1_EXECUTED / SENT 4 / REPLY 0**（2026-08-09 Human-confirmed。§7。Day 2 = 2026-08-10 18:30 JST 予定）。
- 並行セッション規律: Demand / Reality実験はExperiment Ownerセッション、Canonical文書はMigration / Integration Ownerセッションが担当し、同一canonical fileを複数セッションで同時編集しない。

## 7. Structural Bottleneck / Current Operational Priority

最重要未証明区間は不変: **Need→Paid Value→Confirmed Revenue**（MD-1 Terminal Signal。現在JPY 0）。

### 7-0. 現在の戦略 / 現在のベット（2026-08-10 Human裁定。正本はここ）

Source: 2026-08-10 会話でのHuman裁定（**Human-confirmed / repo-unverified**。実装済みの事実ではなく、現時点で採用されている方向である）。層の順序（世界観 → 戦略 → 戦略と戦術の間 → 戦術）と、どの層に何を置くかの規律は `OS.md` HI-9 が持つ。本節はその**中身**（現在何を選んでいるか）だけを持つ。North Star / Major Desireは `DESIRES.md` が正本であり、本節はそれを上書きしない。

- **現在の戦略（＝資源の配分）**: **トークンと時間を「筋のいい一点を見つけること」に集中投下する。** 筋の悪いもので進めて時間とトークンを溶かすより、考え尽くして「これだ」となってから力を入れるほうが北極星に速く近づく。**ゼロから作らない。**
- **現在のベット（＝戦略と戦術の間）**: 自分たちが先駆者になる道を取らない。**既に収益を生んでいて、日本にまだ来ていない事業**の中から、筋がよく日本で勝てるものを見つける。**その人がどうやって収益しているのかまで解剖した上で**、我々がこれまで作ってきたものを乗せて最もシナジーが出る一点を選ぶ。**決めたら全ベットする。**
- **現在の優位（＝探索範囲の第3条件。2026-08-10 Human裁定。裁定での呼称: Human Experience / Earned Edge）**: **「人の判断・欲求・迷いを引き出し、本人の言葉として返しながら、相手の現実を尊重し、進む・進まない・手放すを含む意思決定を前に進める力」。** 裏づけの既存Evidence: `direction/SALES_OS_2026-08.md` 冒頭（ヒロの営業の勘）/ `experiments/batch-1/LEARNINGS.md` L4（Human営業知見）/ `direction/DESIRE_TO_REALITY_SERVICE_DESIGN.md` §1〜§2（Desireを引き出す力）。**D-005 の禁止語はここに含めない**——優位ではなく制約・学習結果として分離する。
  - **2026-08-10 一文の改訂（Human裁定）**: 旧文「Human自身が実際の営業現場で反復し、結果を見ながら磨いてきた、人の判断・欲求・迷いを**捉え**、相手の現実を尊重したまま意思決定を前に進める力」を上記へ差し替えた。**新しい思想の追加ではなく、既存Evidenceと現在の実装に対する表現精度の修正**（Human裁定の明示）。修正点は2つ——①「捉え」→「**引き出し、本人の言葉として返しながら**」（唯一中身を持つ裏づけ `DESIRE_TO_REALITY_SERVICE_DESIGN.md` §2 が「ヒロがDesireを**引き出し**」と書いており、一文がその語を落としていた）②「**進む・進まない・手放す**を含む」を明示（現行の実装 `experiments/desire-discovery/SELF_ANALYSIS_PROTOCOL.md` §「何もしない」を選んでも構わない／リリースも前進 が既にこの半分を持っており、一文だけが前進の一方向だった）。旧文は `DECISIONS.md` D-007 Decision 2 に記録として残る。範囲の変更ではないため Layer2「探索と固定」A・HI-10・HI-11 は変更していない。
  - **2026-08-10 訂正追記（裏づけEvidenceの等級）**: 上記3件のうち、優位の中身を記述しているのは `direction/DESIRE_TO_REALITY_SERVICE_DESIGN.md` §1〜§2 のみ。`direction/SALES_OS_2026-08.md` 冒頭は「AIが調べた定石であり、ヒロの営業の勘との差分こそが学習データ」と述べるだけで、優位の中身を1つも記述していない。`experiments/batch-1/LEARNINGS.md` L4 の「Human営業知見」は「少数接触では検出力不足」の1項目のみ。**在重力営業の原典はリポジトリ外にあり取り込まない**（`CONSTRAINTS.md` Part I §5。`OS.md` HI-1〜HI-12 の由来段落と同じ扱い）。repo内の実装は `experiments/desire-discovery/SELF_ANALYSIS_PROTOCOL.md`（`CLAUDE.md` §3 索引）。
- **これは絞り込み条件であって Hard Boundary ではない。** この力に直接関係する商品しか作れない、という意味ではない。Reality Evidenceが強い候補は、範囲外でも1つのCommitとしてHumanへ上げてよい（`OS.md` HI-11）。
- **本業から得た判断能力を優位として使うことと、本業の関係を接触母集団に使うことは別である。** 後者は禁止のまま（`direction/DESIRE_TO_REALITY_SERVICE_DESIGN.md` §1-d）。
- **これは世界観ではない。** 中位の選択であり、変わりうる。変わらないのは北極星のほうだけ。
- **現在の位相 = 探索期（Exploration）。** 固定実行（Commitment）へ移る条件、固定中に変えてよいもの・変えてはならないもの、固定を早期解除してよい場合は `OS.md` Layer2「探索と固定（Exploration / Commitment）」が持つ。本節は位相の**現在値**のみを持つ。
- **方向転換の扱いの規律**（探索期に作ったものが使われなくなることを「無駄」「宙に浮いた」と表現しない、等）は `OS.md` Layer2「探索と固定」A / C が持つ。本節では重複させない。

本節が更新された場合、`CLAUDE.md` は変更不要である（`CLAUDE.md` は本節を指すだけで内容を持たない）。

**行動の既定は `NO_ACTION` である**（2026-08-10。`OS.md` HI-10）。上の戦略に接続できることは、実行の**必要条件のひとつ**であって十分条件ではない。**戦略と戦術の権限分界は `OS.md` HI-11**——Strategy Committed後の戦術はClaudeがOwnerであり、Humanへ選択肢を返さない。

### 7-0-a. 2026-08-10 の候補判定（Human Commit済み。再提案・再審理しない）

探索期に検討された商品候補のうち、2件が確定判定を受けた。**Portfolioの現在値であり、判定の根拠と再検討triggerは `DECISIONS.md` D-006 が正本。**

| 候補 | 判定 | Routing | 再検討 |
|---|---|---|---|
| 就労選択支援の指定申請書式パック | **`KILL`** | — | Humanが戦略レベルで規制領域参入を明示Commitし、かつ `direction/DESIRE_TO_REALITY_SERVICE_DESIGN.md` §4-a の解除4条件が揃った場合のみ。**現在は再検討しない** |
| 創業融資の3年収支計画Excel | **`KILL`**（現在の候補として） | **`NO_ACTION`** | 外部証拠5件のいずれか（D-006 Decision 6）。**内部でより良い案が出たことはtriggerではない** |

**創業融資Excelについて、Humanへ25分の音声メモを要求しない。商品の作成・出品・追加調査・差別化案の検討を開始しない。**

**「競合が存在したから」は、どちらのKILL理由でもない**（`direction/DESIRE_TO_REALITY_SERVICE_DESIGN.md` §1-c と同じ規律）。

**Structural Bottleneck**（長期の構造欠落。独立した複数監査 — D-002 North Star Audit / Portfolio Rederivation / Human Leverage Rederivation / Ownership Audit — の収束点。D-003）:

> **World Signalを回収し、正しいContact / Needへ帰属し、次のActionへ戻す経路が弱いこと。** 17 REACHABLE threadのうちX 15件はharnessから読めず（E-008）、送信主体handle・送信文面等のjoin keysも大半が未記録（Ownership Audit F節）。Need発見・Contact準備・Solve調査より、Realityから返る信号の受信経路が弱い。

**2026-08-10 — 遮断は同日中に大部分が解消した**（Human が許可ドメインを Custom へ拡張。実測200確認）。到達可能になったもの: `note.com` / はてな / `zenn.dev` / `qiita.com` / 青空文庫 / `coconala.com` / `*.wikipedia.org` / 文化庁 / J-STAGE / NHK。

**ただし解消は全域ではない**（2026-08-10 本セッション一次実測。`curl` 実行）:

| 対象 | 結果 |
|---|---|
| `https://coconala.com/` / `https://coconala.com/categories/1004` | **HTTP 200**（上記の追認。一次実測） |
| `https://www.mhlw.go.jp/` / `https://www.e-gov.go.jp/` / `https://elaws.e-gov.go.jp/` | **CONNECT tunnel 403**（agent proxy の policy denial） |

**これは tooling / reachability observation である。「一次資料が存在しない」と記録してはならない**（当該Claude実行環境・当該時点で取得できなかった、が正しい記述。`OS.md` HI-4 F9）。到達可能になったことは、**遮断下で取得済みの数値の証拠等級を遡って上げない**（`direction/COCONALA_VERDICT_2026-08.md` 2026-08-10 追記）。

**ただし X は部分的にしか解けていない**（2026-08-10 実測）:

| 取得可否 | 対象 |
|---|---|
| **可** | 単一ポストの本文（URL既知の場合。`og:description` に載る）／アカウントのbio |
| **不可** | スレッドの2投目以降（返信）／impressions・いいね・返信数／フォロワー数／タイムライン |

`WebFetch` は `x.com` を別途拒否するが `curl` は通る。**返信の検知とimpressionsは静的HTMLに載らないため、Encounter Queue の返信監視は引き続き Human 報告経路（E-008）に依存する。** 以下は遮断解消前の記録として保持する（取り消し線を引かず、日付で区別する）:

- 記事が公開されたか、読まれたか、反応があったかを **AIは一切検証できない**。すべてHuman報告経路（`UNKNOWN` 既定）
- `direction/LLMO_EXECUTION_PLAN_2026-08.md` の20クエリ基準パネル（AI引用シェアの定点観測）は、**測定手段の実在が未確認**（2026-08-09時点の記述）。→ **2026-08-10 訂正**: 同パネルは計画 §7 が「ヒロがChatGPT/Claude/Perplexityアプリで1回~15分」と定める**Human手動計測**であり、harnessの到達性とは無関係に実行できる。未確認だったのは測定手段ではなく**未実行**であること。着手の障害は無い
- 観測可能な唯一の公開面は **GitHub**（API / Pages）
- したがって「World Signalの受信経路が弱い」は X 固有の問題ではなく、**Distribution stack全体の性質**である。自動化で解く前に、Humanが低摩擦で報告できる形（スクリーンショット1枚）を維持することが実務上の最適解になっている

**Current Operational Priority**（現在Bootstrap Phaseの最優先。D-003 AMENDMENT 2026-08-09 — 構造的な律速と現在の最優先実験は同一である必要はない: D-003 Decision 7）:

> **世界との良質な接点候補を毎日継続供給し、ヒロが業務外時間に送信できる状態を作ること。**

- **Current approved experiment: Daily Encounter Queue Canary（E-013）** — status **DAY_1_EXECUTED / SENT 4 / REPLY 0**（2026-08-09 22:45 JST **Human-confirmed**: 配達4件・**全件送信済み**。台帳 = `experiments/encounter-queue/LEDGER.md`）。Day 1実費 **USD 0.1631**（daily cap 0.18内）/ 3日累積上限0.50の残り **USD 0.3369** / xAI推定残高 **≈ USD 0.486**。**4件中2件（EQ-1 / EQ-4）には送信前から Genuine Pain 証拠としての弱さが事前登録されている**ため、Pain confirmation率の分母は2件で見る。返信の観測はHuman経路のみ（harnessからX読取不可 — E-008）。Humanが3-Day Canaryの実行を承認済みで、one-shot triggerが3本設定済み: **Day 1 = 2026-08-09 18:30 JST / Day 2 = 2026-08-10 18:30 JST / Day 3 = 2026-08-11 18:30 JST**（設定自体が**Human-confirmed / repo-unverified** — 非公開Claude Codeセッション内のprivate session stateでありrepositoryから独立検証不能）。**（2026-08-09 22:45 JST Humanの報告により解除。以下は解除前の規律として保持）** 予定時刻の経過だけでは①trigger発火 ②候補の生成・配信 ③候補の品質 ④送信の有無 のいずれもrepositoryから検証できない。**Humanの報告があるまで実行済みと書いてはならない。** 恒久recurring scheduleではなく、**Day 3後の自動継続なし**。仕様（Human裁定）: 3日間限定 / xAI Grok x_search / 毎日最大10件 / HUMAN_SHORT / Private delivery（非公開供給）/ **Human manual send（ヒロが候補を目視して手動送信。自動送信なし）** / Adaptive query learning。常時Radarではない。Budget capは§5。
  - **Day 2（2026-08-10 18:30 JST）= 予定どおり継続する**（2026-08-10 判定 — D-006 Decision 9）。判定根拠: E-013 は Human承認済みの**独立したStrategy Committed済みExperiment**であり、同日 `KILL` した2候補（就労選択支援の書式パック / 創業融資Excel — §7-0-a）のいずれの検証でもない。対象clusterは「一人事業・反復事務」「Creator」で、Day 1 実測4件がその範囲内にある（`experiments/encounter-queue/LEDGER.md`）。**依存が無いため `NO_ACTION` へは落とさず、Humanへも返さない**（`OS.md` HI-11: 戦術レベルの継続判断はClaude側）。送信は従来どおり Human Gate。
  - **Day 2 の実行有無 = `UNKNOWN`**（2026-08-11 03:07 JST 観測）。予定時刻を約8.6時間経過したが、trigger発火・候補生成・配達・送信のいずれもrepositoryから検証できず、Humanの報告も無い。**予定時刻の経過だけで「実行済み」とも「未実行」とも書かない。** Day 2実費が `UNKNOWN` のため、3日累積上限 USD 0.50 の残額は **USD 0.3369 以下**としか言えない。
  - **Day 3 Final Verdict の判定基準を、Day 3 実行前に事前登録した**（2026-08-11 03:07 JST。正本 = `experiments/encounter-queue/LEDGER.md`）。§5 は `SCALE` を条件付きチャージの発火条件としながら **`SCALE` の成立条件を持っておらず**、このままでは結果を見てから基準を書くことになる状態だった（`CONSTRAINTS.md` Part I §6 / `OS.md` §12）。判定はClaude側の戦術判断（`OS.md` HI-11）、**チャージ実行と送信は Human Gate のまま**。要点: 実測返信率 **1/21 ≈ 4.8%**（95%CI 約1〜23%。分母の等級が混在するため `Derived`）に対し、n=12 で返信0となる確率は約56%。**`返信 0` を抽出条件の反証として学習しない。** 反証には n ≈ 33 が要る（`Derived`）。
  - > **訂正追記（2026-08-11 03:40 JST / Human Commit。Day 3 実行前。上の原文は不変更で保持する）**: 上記事前登録のうち **`SCALE` の必須条件「返信 ≥ 1」を撤回**した。E-013の存在理由は台帳自身が定める **join key の確定記録**であり、検証対象は供給と記録であって返信率ではない。加えて n=12 では**返信0が最頻結果**（約56%）であり、供給が小さすぎて作れない結果に供給決定を紐づける自己閉塞設計だった。**これはClaude側の設計ミス。** 現行の判定は E-013本来の5件（品質バー維持 / join key欠損なし / 重複・Boundary違反・cap超過なし / `VOID` と `FAIL` の非混同 / 実行結果の帰属可能性）で行う。**返信は削除せず、下流World Signalとして別記録する。返信0を市場需要の `FAIL` と判定しない。** 正本は `experiments/encounter-queue/LEDGER.md`「Day 3 Final Verdict — Human amendment」。
  - > **2026-08-14 追記（E-013 Final Verdict = `VOID`。上の各行は不変更で保持する）**: E-013は **`VOID`** で終了した。status = `HISTORICAL — result: VOID`（`experiments/INDEX.md`）。評価時点は事前登録どおり **2026-08-11 23:59 JST**。**取得できたRealityはDay 1のみ**（配達4 / SENT 4 / REPLY 0 / 実費 USD 0.1631 — いずれも2026-08-09 Human-confirmed）。**Day 2 / Day 3は、実行されたともされなかったとも断定しない**——Human-confirmed記録も再現可能artifactも無く検証不能である（trigger設定がprivate session stateでrepo-unverified — §9）。**`FAIL` でも `KILL` でもなく、品質・需要・返信率について学習しない**（`CONSTRAINTS.md` Part I §6）。**Day 4以降の自動継続なし。xAI追加チャージなし**（USD 10は独立 `HOLD` のまま・auto top-up OFF）。3日累積実費は「USD 0.1631以上・上限USD 0.50超過の観測なし」までしか言えず、**「cap内に収まった」と断定しない**。再試行は継続ではなく**新規の事前登録**とし、private session state依存を外すことを最低条件とする。正本 = `experiments/encounter-queue/LEDGER.md`「Final Verdict — `VOID`」。
- **X World Signal / Reply Ingestion Canary** — status **HOLD**（execution_authority = **NOT_GRANTED**）。理由（2026-08-09 Human裁定）: 実direct reply未発生でpositive ground truthがなく、outbound mappingしか検証できず情報価値が低い / ヒロはスマホのX通知を容易に確認できる / 現在は返信監視の自動化より良質な接点の増加が優先。**再評価trigger**: ①最初の実replyが1件以上発生した時 ②Humanの返信確認・転記負担が実測上のボトルネックになった時。budget = **UNAPPROVED**（旧案cap USD 3.00は現残高 ≈ USD 0.649で成立しない — §5）。起草済み契約fileは本PRから除外した（branch履歴 `9c1e9d7` 以前に残存。trigger発火時に再作成する）。「次にRealityへ問う1件」ではない。
  - > **2026-08-14 追記（上の原文は不変更で保持する）**: **`HOLD` を継続する。** 再評価trigger①（最初の実replyが1件以上発生）は **発火済み**（2026-08-09 E-006 @HatoNozomu。§2）。しかし**trigger②（Humanの返信確認・転記負担が実測上のボトルネックになった時）は未発火**——実測はE-006の返信1件・E-013の返信0件であり、転記負担が律速になった観測は無い。budget も **UNAPPROVED** のまま（xAI残高 ≈ USD 0.649 / auto top-up OFF / 追加チャージなし）。**①の発火のみでは `HOLD` を解除しない**（解除には②の発火とbudget承認が要る。これは2026-08-14時点の運用判断であり、trigger条項の書き換えではない）。execution_authority = **NOT_GRANTED** 継続。
  - > **訂正追記（2026-08-14 / Human指示。上の2026-08-14追記の原文は不変更で保持する）**: 直上の「xAI残高 ≈ USD 0.649」は **2026-08-09 D-003 AMENDMENT 時点の値であり、2026-08-14 の現在値ではない**。§5 は同じ2026-08-09に Day 1 消費 **USD 0.1631** を Human-confirmed で記録し、そこから **推定残高 ≈ USD 0.486** を導出している。2026-08-14 時点で言えるのは **上限 ≈ USD 0.486 / 下限 `UNKNOWN`** までである——E-013 は `VOID` で終了し **Day 2 / Day 3 の実費が `UNKNOWN`** であるため（§7 E-013 の2026-08-14追記）。**点推定を置かない。** §9 Evidence Index の「remaining ≈ USD 0.649」は 2026-08-09 Observed 値の索引としては正しいが、**現在値ではない**。**下流判断は変わらない**: budget = **UNAPPROVED** / USD 10 は独立 `HOLD` / auto top-up **OFF** は不変（旧案 cap USD 3.00 は 0.486 でも 0.649 でも成立しない）。残高の正本は §5。本追記は `CONSTRAINTS.md` Part I §6（`STALE` な結果を再利用しない / 確認できないことは `UNKNOWN` とする）の適用であり、**新しい規則・検査・自動化・管理文書を追加していない**。

Control-plane側のbottleneck判定（Generation / Distribution / Feedbackのどれが律速か）はBrowser-Toy Route凍結に伴い凍結。

## 8. Routing Facts

判定入力はcanonical block（status / prerequisites）であり、本文はこれを上書きしない。

- Control-plane gates（F/W/C/X）はBrowser-Toy Route時代に定義されたもの。F3（runtime reads control plane）はroute非依存の基盤として IN_PROGRESS のまま。W lane はBrowser-Toy Routeのworld learning laneであり、routeのHOLDに伴い事実上凍結（blockのstatusは実測どおり保持）。
- 直近のrouting結論（run 31088621095ベース）: **NO_ACTION — INSUFFICIENT_EVIDENCE**（C1 / C2いずれか1件を提案するには証拠不足）。この結論は現在も有効。
- Mission-levelの現在の実行はcontrol-plane gateではなく、Human-committedのActive Experiment（§2 Batch 1）が担う。
- 新しいMajor Desire構造の下でのgate体系の再設計は、Batch 1のWorld Signal回収後に証拠ベースで行う（`ROADMAP.md` Current Horizons参照）。先回りで作らない。

## 9. Evidence Index

| Evidence | Revision |
|---|---|
| default branch snapshot | `97b6c63d6db3309601704a6ddfb01aa3b65b49ba`（PR #43 / #44 / #45 merge済み） |
| Public Identity決定（D-004） | `DECISIONS.md` D-004（本PR内）。アセットは `brand/`、幾何規格は `brand/BRAND_SPEC.md`。**外部での実使用は未実施 = `UNKNOWN`** |
| Web Marketing Intelligence | `direction/WEB_MARKETING_INTELLIGENCE_2026-08.md`（main。PR #43 merge済み 2026-08-09） |
| Batch 1 Contact台帳（正本） | `experiments/batch-1/LEDGER.md`（main上。SENT 20 / VOID 3 / REACHABLE 17 / **REPLY 1** — 2026-08-09 初返信。Reply Log 001 / 002） |
| Loop 1 Learning抽出 | `experiments/batch-1/LEARNINGS.md`（main上。訂正1含む） |
| 4監査（D-003 Inputs） | D-002 record（`DECISIONS.md`）/ `direction/HUMAN_LEVERAGE_REDERIVATION_2026-08-08.md` / `ops/OWNERSHIP_AUDIT_2026-08-08.md` / Portfolio Rederivation（repo内artifactなし — 採択結論は2026-08-09 Task Contract経由 = D-003） |
| factory workflow state | workflow id 322145639 = `disabled_manually`（updated 2026-08-07 10:39 JST。2026-08-09 Actions API read-only実測） |
| `.github/workflows/factory.yml`（historical cron定義） | blob `49314d2d531704485064fa1995922f19b8418870` |
| 旧CURRENT_STATE本文（Browser-Toy期詳細） | blob `a92c9643cea1fcec8cca9d113e55f872b1a4f452` ほかgit history |
| `index.html` catalog | blob `babcae3a7308fe3042af3f4b8ff967c69896aba8` |
| `JOURNAL.md` | blob `4d6327a9271d25b67c9faf7c48237e5e17a6ec8f` |
| C0 canary run | run 31075997147; artifact 8957508638 |
| F3 precursor reader run | run 31088621095; artifact 8962454105 |
| W0 precursor (HOLD) | draft PR #24 head `0aa39664404aabf9214f8da96401e325b0d12308` |
| 2026-08-08 Demand Intelligence Canary（E-005） | Human-reported（`experiments/INDEX.md` 参照。repo内raw artifactなし） |
| 2026-08-08 Environment Preflight（E-008） | `ops/ENV_PREFLIGHT_2026-08-08.md`（main。PR #31 merge済み 2026-08-09） |
| MD-2 Content Canary（E-011） | `experiments/md2-distribution/CANARY_2026-08-08_CONTENT_CANDIDATES.md`（main。PR #34 merge済み 2026-08-09。C-1公開はHuman-reported・X上の反応は `UNKNOWN`） |
| xAI credit実測 | Human-confirmed 2026-08-09（D-003 AMENDMENT）: consumed USD 4.351 / remaining ≈ USD 0.649。追加チャージはDay 3 SCALE判定時のみ条件付き承認（§5・会話レベル） |
| Daily Encounter Queue trigger設定（one-shot×3） | Human-confirmed 2026-08-09（PR #40 FINAL REALITY SYNC）。private session state・**repo-unverified** |
| E-014 Desire to Game Reality Test（承認・2026-08-13追記） | 契約 `direction/EVAL_DESIRE_TO_GAME_2026-08.md`（PR #65 merge済み 2026-08-13・merge commit `0dcf7d6`）/ 台帳 `experiments/desire-to-game/LEDGER.md`（納品0・全欄未記入） |

`experiments/INDEX.md` のstale 2行（E-006「Sent 7」/ E-001「⚠ schedule trigger残存」）は、2026-08-09 PR #40 FINAL REALITY SYNCの裁定に基づき本PR内で修正済み（main上の確定事実 — LEDGER正本・Actions実測 — のみによる機械的修正。open PR 4本のいずれもINDEX.mdを変更しないことをbranch diff実測で確認済み・競合なし）。

When this file is updated, `Observed at`, `Base SHA`, affected evidence revisions, bottleneck, and the routing facts in section 8 must be updated together.
