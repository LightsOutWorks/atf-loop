```json atf-control-state-v1
{
  "schema": "atf.control-state/1",
  "base_sha": "af26fd0d87e48ee34d888fd5bcbcbbce93f64380",
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

Observed at: **2026-08-09 JST**

Default branch: `main`

Base SHA: `af26fd0d87e48ee34d888fd5bcbcbbce93f64380`

Evidence scope: **the default branch at the SHA above, recorded GitHub Actions runs and workflow states cited in this file（workflow stateは2026-08-09のActions API read-only実測）, and — explicitly labeled as such — Human-reported reality from the 2026-08-08 Current State Override and the 2026-08-09 Task Contract（D-003 UPPER-LAYER INTEGRATION。いずれも会話レベル。リポジトリ外の実測をヒロ/実行セッションが報告したもの）**

この文書は、Factoryが「今できること」と「まだできないこと」を区別するための現在地である。会話、予定、提案を実装済みの事実として書かない。確認できないことは `UNKNOWN` とする。文書の責務分担とSource of Truth Priorityは `OS.md` が持つ。

---

## 1. Mission State Summary

2026-08-08、D-001（`DECISIONS.md`）により本リポジトリはCanonical Migrationを実施した。

- 本リポジトリは**ゲーム工場ではない**。現在のMissionは `OS.md` 冒頭のCurrent Identity、North Star / Major Desireは `DESIRES.md` を参照。
- Browser-Toy Production Route（SEED 001〜024、`factory.yml`）は**Historical Experiment（HOLD）**。`factory.yml` ファイル内にはhistorical cron定義が残るが、GitHub Actions workflow `factory` 自体は **disabled_manually**（2026-08-07 10:39 JST停止。2026-08-09 Actions API read-only実測）。**cron定義の残存とworkflow enabled stateは別のfact**であり、残存riskはre-enable（Human Gate）時のみ（§4）。
- 現在のActive Reality Experimentは**Batch 1 Discovery Contact**（§2。現在Phase = World Signal回収）。
- 上位Direction統合はD-003（`DECISIONS.md`）。現在の律速は§7。
- Confirmed terminal revenue = **JPY 0**（§5）。Factoryは「成功した」と表現してはならない。

---

## 2. Active Experiment — Batch 1 Discovery Contact（E-006 / MD-1接続）

Source: `experiments/batch-1/LEDGER.md`（Contact台帳・正本。2026-08-08 Human-confirmed syncとしてmain上に機械記録あり）。

- Target: **20 Genuine Discovery Contacts** — **送信枠は消化済み**。
- Funnel実測（LEDGER正本）: SENT **20**（HN 3 / SE 1 / Bluesky 1 / X 15）/ SENT_BUT_NOT_PUBLICLY_VISIBLE **3**（HN。VOID — Delivery Layer failure・分母外）/ REACHABLE **17** / REPLY_WAIT **17** / REPLY **0**（last sync時点。以後の返信状態はrepositoryから確認不能 = `UNKNOWN`）。
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
- Control plane: C0 provenance canary PASS（run 31075997147）、F3 precursor reader PRECURSOR（run 31088621095）。canonical blockのbase_shaは2026-08-09観測で `af26fd0` へ更新した（gate statusは新runがないため不変）。
- `eval.json` はseed-001〜009のみ・全て `world: null` のまま（歴史的証拠として保存）。

## 5. Economic / Budget State

Source: 2026-08-08 Current State Override（Human-reported）。

- **Confirmed terminal revenue = JPY 0**。Need→Paid Value→Confirmed Revenueは未証明。
- 証明済みはここまで: Public Demandの機械探索 / Grok x_searchのSensor機能 / Contact候補生成 / HumanのReality接触。
- Factory monthly hard cap: JPY 50,000（`CONSTRAINTS.md` Part I）。
- Claude Max 20x契約中。ChatGPTは2026-08-13から$20 plan予定。xAI Prototype $5購入済み・Auto top-up OFF。

## 6. Open PRs and Session Ownership（観測 2026-08-09）

Open PRは以下の4件（すべてdraft。GitHub API実測）:

- **PR #24**（`experiments/w0/*` 追加のみ）: W0 precursor、HOLD。W laneはBrowser-Toy Route凍結に伴い事実上凍結（§8）。canonical fileと競合しない。
- **PR #30**（`GENOME_FACTORY.md` / `RESEARCH.md` 追加のみ）: 2026-08-07作成のRoute提案（Browser-Toy収益化 / itch.io）。**2026-08-08 Override以前の提案であり、現Mission優先順位と競合し得る。処置はヒロ裁可。** canonical fileへの変更は含まない。
- **PR #31**（`ops/ENV_PREFLIGHT_2026-08-08.md` 追加のみ）: 環境preflight実測（E-008）。Sensor到達性（Bluesky検索・Reddit APIはHARNESS_BLOCKED等）とExecution Readinessの証拠。main外にのみ存在するdraft-PR滞留evidence（Ownership Audit A-5）。
- **PR #34**（`experiments/md2-distribution/*` 追加のみ）: MD-2 Distribution Engine Canaryのcontent候補（GO上位3）。投稿はHuman Gate。**うちC-1候補（TETHER LOCK事故post）はPUBLISHED（Human Commit 2026-08-08 — Human-reported）。公開記録・実投稿文の差分分析はdraft PR #34 branch上にのみ存在し、main上にはない（draft-PR滞留evidence — Ownership Audit A-5と同型）。X上の反応はrepositoryから確認不能 = `UNKNOWN`。** 同branchはE-011（MD-2 Content Canary）のID採番も提案済み。
- Merge済み（2026-08-08〜09）: #32 / #33 / #35 / #36（D-001 / LEDGER / LEARNINGS）、#37（Human Leverage Rederivation）、#38（Ownership / Compounding Audit）、#39（D-002 North Star REPLACE）。
- Lane状態: Lane A（Batch 1 / E-006）= **waiting**（World Signal待ち。self check-in停止）/ Lane B（MD-2 Content Canary）= **waiting**（PR #34 Human Gate待ち）/ Lane C（Learning抽出）= **closed**（Loop 1完了。第2回抽出はreply回収後）/ Direction監査4本 = **closed**（merge済み。統合はD-003）。
- 並行セッション規律: Demand / Reality実験はExperiment Ownerセッション、Canonical文書はMigration / Integration Ownerセッションが担当し、同一canonical fileを複数セッションで同時編集しない。

## 7. Current Bottleneck

最重要未証明区間は不変: **Need→Paid Value→Confirmed Revenue**（MD-1 Terminal Signal。現在JPY 0）。

その内側の現在の律速は、独立した複数監査（D-002 North Star Audit / Portfolio Rederivation / Human Leverage Rederivation / Ownership Audit）が以下へ収束した（D-003）:

> **World Signalを回収し、正しいContact / Needへ帰属し、次のActionへ戻す経路の欠如。** 17 REACHABLE threadのうちX 15件はharnessから読めず（E-008）、送信主体handle・送信文面等のjoin keysも大半が未記録（Ownership Audit F節）。Need発見・Contact準備・Solve調査より、Realityから返る信号の受信経路が弱い。

次にRealityへ問う1件は **X World Signal / Reply Ingestion Canary**（`experiments/x-reply-ingestion-canary/CONTRACT.md`。一回限りのCanary。実施は本契約merge後のヒロの明示Go = Human Gate。常時監視システムは約束しない）。

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
| default branch snapshot | `af26fd0d87e48ee34d888fd5bcbcbbce93f64380` |
| Batch 1 Contact台帳（正本） | `experiments/batch-1/LEDGER.md`（main上。SENT 20 / VOID 3 / REACHABLE 17 / REPLY 0） |
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
| 2026-08-08 Environment Preflight（E-008） | draft PR #31 `ops/ENV_PREFLIGHT_2026-08-08.md` |
| MD-2 Content Canary候補 | draft PR #34（C-1公開はHuman-reported・repositoryから検証不能 = `UNKNOWN`） |

既知のstale（本観測で明示。修正は未実施）: `experiments/INDEX.md` の E-006行「Target 20 / Sent 7」（正: SENT 20・送信枠消化済み — LEDGER正本）および E-001行「⚠ schedule trigger残存」（正: workflow `factory` はdisabled_manually。ファイル内historical cron定義のみ残存）。D-003 Task Contractの変更対象は CURRENT_STATE / DESIRES / ROADMAP / DECISIONS の4ファイルに限定されているため、INDEXの2行修正は別の軽微なfollow-up（Human Gate = merge 1回）として残す。

When this file is updated, `Observed at`, `Base SHA`, affected evidence revisions, bottleneck, and the routing facts in section 8 must be updated together.
