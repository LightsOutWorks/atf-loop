```json atf-control-state-v1
{
  "schema": "atf.control-state/1",
  "base_sha": "5e31133e09c8c6dfb0bf4bb3298441fda7a4c103",
  "gates": [
    {
      "id": "F0",
      "status": "PASS",
      "evidence": [
        "PR #22 merged as merge commit 6bef0f7e001d6ecebddcea4f9904b9dc47cc0343; OS.md blob a6e207202f78a00029b75f33a82f7005e671d429 on main; SHA-256 match with approved source recorded in CURRENT_STATE.md section 11. OS.md amended to v1.1 by D-001 (2026-08-08) via reviewed PR; amendment recorded in DECISIONS.md"
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

Observed at: **2026-08-08 JST**

Default branch: `main`

Base SHA: `5e31133e09c8c6dfb0bf4bb3298441fda7a4c103`

Evidence scope: **the default branch at the SHA above, recorded GitHub Actions runs cited in the canonical block, and — explicitly labeled as such — Human-reported reality from the 2026-08-08 Current State Override（会話レベル。リポジトリ外の実測をヒロ/実行セッションが報告したもの）**

この文書は、Factoryが「今できること」と「まだできないこと」を区別するための現在地である。会話、予定、提案を実装済みの事実として書かない。確認できないことは `UNKNOWN` とする。文書の責務分担とSource of Truth Priorityは `OS.md` が持つ。

---

## 1. Mission State Summary

2026-08-08、D-001（`DECISIONS.md`）により本リポジトリはCanonical Migrationを実施した。

- 本リポジトリは**ゲーム工場ではない**。現在のMissionは `OS.md` 冒頭のCurrent Identity、North Star / Major Desireは `DESIRES.md` を参照。
- Browser-Toy Production Route（SEED 001〜024、`factory.yml`）は**Historical Experiment（HOLD）**。ただし後述§4のとおり、mainの `factory.yml` には毎週土曜10:00 JSTのschedule triggerが**まだ残っている**（無効化はHuman Gate）。
- 現在のActive Reality Experimentは**Batch 1 Discovery Contact**（§2）。
- Confirmed terminal revenue = **JPY 0**（§5）。Factoryは「成功した」と表現してはならない。

---

## 2. Active Experiment — Batch 1 Discovery Contact（MD-1接続）

Source: 2026-08-08 Current State Override（Human-reported。default branch上の機械記録はまだない）。

- Target: **20 Genuine Discovery Contacts**
- Sent: **7**（C01 / C04 / C02 = Hacker News、C14 = Bluesky、C09 = Software Recommendations Stack Exchange、LN-58 / LN-62 = X）。現在REPLY_WAIT。
- 残り13件を準備中。数を満たすために品質を落とさない。同時に、過剰KILLでReality試行数が不足することも失敗と扱う。
- Message style: 既送信7件はBaselineとして保持（事後的に書き換えない）。今後の13件は **HUMAN_SHORT** をDefaultとする（1〜3文・質問1つ・売らない・自己説明過剰なし。詳細ポリシーは実行契約側）。
- DiscoveryとSalesを分離する。初回Discoveryの目的は「相手が自分の現実についてもう一言話したくなる状態を作る」こと。
- Freshness ranking（Hard Boundaryではない）: <24h HIGH / <48h PRIORITY / <72h acceptable / >72h は継続Pain等の追加Evidence要。
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

- `factory.yml`（blob `49314d2d531704485064fa1995922f19b8418870`）: 生成→smoke→interaction smoke→Codex gate→公開の無人ループ。**schedule trigger（毎週土曜01:00 UTC）が現存**。停止はHuman Gate（Actions UIでのworkflow disable、またはPR）。
- SEED 001〜024が `works/` にあり、GitHub Pagesのカタログ（`index.html`）で公開済み。
- seed-009 TETHER LOCKは既知のVerification Failureとして意図的に未修正で保存。
- JOURNAL 0005 / 0007の訂正、Selection Record v2は未実装のまま（record debt。凍結中も債務として保持）。
- Control plane: C0 provenance canary PASS（run 31075997147）、F3 precursor reader PRECURSOR（run 31088621095）。canonical blockのbase_shaは本観測で `5e31133` へ更新した。
- `eval.json` はseed-001〜009のみ・全て `world: null` のまま（歴史的証拠として保存）。

## 5. Economic / Budget State

Source: 2026-08-08 Current State Override（Human-reported）。

- **Confirmed terminal revenue = JPY 0**。Need→Paid Value→Confirmed Revenueは未証明。
- 証明済みはここまで: Public Demandの機械探索 / Grok x_searchのSensor機能 / Contact候補生成 / HumanのReality接触。
- Factory monthly hard cap: JPY 50,000（`CONSTRAINTS.md` Part I）。
- Claude Max 20x契約中。ChatGPTは2026-08-13から$20 plan予定。xAI Prototype $5購入済み・Auto top-up OFF。

## 6. Open PRs and Session Ownership（観測 2026-08-08）

- **PR #24**（`experiments/w0/*` 追加のみ）: W0 precursor、HOLD。canonical fileと競合しない。
- **PR #30**（`GENOME_FACTORY.md` / `RESEARCH.md` 追加のみ）: 2026-08-07作成のRoute提案（Browser-Toy収益化 / itch.io）。**2026-08-08 Override以前の提案であり、現Mission優先順位と競合し得る。処置はヒロ裁可。** canonical fileへの変更は含まない。
- **PR #31**（`ops/ENV_PREFLIGHT_2026-08-08.md` 追加のみ）: 環境preflight実測。Sensor到達性（Bluesky検索・Reddit APIはHARNESS_BLOCKED等）とExecution Readinessの証拠。
- 並行セッション規律: Demand / Reality実験はExperiment Ownerセッション、Canonical文書はMigration Ownerセッションが担当し、同一canonical fileを複数セッションで同時編集しない。

## 7. Current Bottleneck

**Need→Paid Value→Confirmed Revenueが未証明であること。** 具体的な最小の次の一歩は、Batch 1の完了（残り13 contacts、HUMAN_SHORT）とreply/World Signalの回収・記録である。

Control-plane側のbottleneck判定（Generation / Distribution / Feedbackのどれが律速か）はBrowser-Toy Route凍結に伴い凍結。新Routeでの律速は証拠不足でUNKNOWN。

## 8. Routing Facts

判定入力はcanonical block（status / prerequisites）であり、本文はこれを上書きしない。

- Control-plane gates（F/W/C/X）はBrowser-Toy Route時代に定義されたもの。F3（runtime reads control plane）はroute非依存の基盤として IN_PROGRESS のまま。W lane はBrowser-Toy Routeのworld learning laneであり、routeのHOLDに伴い事実上凍結（blockのstatusは実測どおり保持）。
- 直近のrouting結論（run 31088621095ベース）: **NO_ACTION — INSUFFICIENT_EVIDENCE**（C1 / C2いずれか1件を提案するには証拠不足）。この結論は現在も有効。
- Mission-levelの現在の実行はcontrol-plane gateではなく、Human-committedのActive Experiment（§2 Batch 1）が担う。
- 新しいMajor Desire構造の下でのgate体系の再設計は、Batch 1のWorld Signal回収後に証拠ベースで行う（`ROADMAP.md` Current Horizons参照）。先回りで作らない。

## 9. Evidence Index

| Evidence | Revision |
|---|---|
| default branch snapshot | `5e31133e09c8c6dfb0bf4bb3298441fda7a4c103` |
| canonical `OS.md`（v1.1へ本PRでamend） | 本PR参照（旧: blob `a6e207202f78a00029b75f33a82f7005e671d429`） |
| 旧CURRENT_STATE本文（Browser-Toy期詳細） | blob `a92c9643cea1fcec8cca9d113e55f872b1a4f452` ほかgit history |
| `.github/workflows/factory.yml` | blob `49314d2d531704485064fa1995922f19b8418870` |
| `index.html` catalog | blob `babcae3a7308fe3042af3f4b8ff967c69896aba8` |
| `JOURNAL.md` | blob `4d6327a9271d25b67c9faf7c48237e5e17a6ec8f` |
| C0 canary run | run 31075997147; artifact 8957508638 |
| F3 precursor reader run | run 31088621095; artifact 8962454105 |
| W0 precursor (HOLD) | draft PR #24 head `0aa39664404aabf9214f8da96401e325b0d12308` |
| 2026-08-08 Demand Intelligence Canary | Human-reported（`experiments/INDEX.md` 参照。repo内raw artifactなし） |
| 2026-08-08 Environment Preflight | draft PR #31 `ops/ENV_PREFLIGHT_2026-08-08.md` |

When this file is updated, `Observed at`, `Base SHA`, affected evidence revisions, bottleneck, and the routing facts in section 8 must be updated together.
