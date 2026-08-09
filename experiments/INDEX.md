# experiments/INDEX.md — Reality Experiment Registry

全Reality Experimentのstatus台帳。**Historical EvidenceとCurrent Instructionを混同しないための索引**であり、既存成果物の物理移動はしない（リンク・CI・履歴保全のため）。

Status語彙: `ACTIVE` / `HOLD` / `NO-GO` / `RETIRED` / `HISTORICAL` / `PROPOSED` / `OPPORTUNITY NOTE`

| ID | Experiment | Status | Major Desire | 所在 / Evidence |
|---|---|---|---|---|
| E-001 | Browser-Toy Production Loop（Game Factory、SEED 001〜024） | **HOLD**（Historical） | 旧Mission | `works/`, `factory.yml`, `smoke.mjs`, `index.html`（Pagesカタログ）, `JOURNAL.md`。workflow `factory` は**disabled_manually**（2026-08-07停止・Actions API実測 — `ops/OWNERSHIP_AUDIT_2026-08-08.md` 再検証記録2）。ファイル内にhistorical cron定義のみ残存（`CURRENT_STATE.md` §4） |
| E-002 | seed-009 TETHER LOCK Verification Failure | **HISTORICAL**（意図的未修正・証拠保存） | 旧Mission | `works/seed-009/`, `JOURNAL.md` 0001 |
| E-003 | Control Plane（C0 provenance / F3 precursor reader） | **ACTIVE**（route非依存基盤） | MD-3 | `scripts/c0-provenance.mjs`, `scripts/control-plane-canary.mjs`, canonical blocks |
| E-004 | W0 Distribution Precursor（X / itch.io計測可能性） | **HOLD** | 旧Mission→MD-2関連 | draft PR #24 `experiments/w0/` |
| E-005 | Large-N Demand Intelligence Canary（Grok x_search） | **HISTORICAL — verdict: PASS**（Sensorとして実証。2026-08-08実施） | MD-1 | Human-reported。cost ≈ $1.815 / 48+5 queries / raw 75 / unique 72 / Genuine Need ≈60 / clusters 7。repo内raw artifactなし（`CURRENT_STATE.md` §3） |
| E-006 | Batch 1 Discovery Contact（Target 20 / SENT 20 — 送信枠消化済み。VOID 3 / REACHABLE 17） | **ACTIVE**（World Signal回収Phase） | MD-1 | `experiments/batch-1/LEDGER.md`（Contact台帳・正本）、`CURRENT_STATE.md` §2。送信行為はHuman Gate。message style: 初期7件=BASELINE確定、X 13件=`UNKNOWN`（LEDGER凡例） |
| E-007 | Genome Factory v1（Dual-Clock Pure Genome Factory） | **NO-GO**（2026-08-09 ヒロ裁定: PR #30をmerge無しでclose・不採択。branch保存・reopen可逆） | 旧Mission延長 | closed PR #30 / branch `claude/genome-factory-design-538h9e` `GENOME_FACTORY.md` |
| E-008 | Environment Preflight 2026-08-08（Sensor到達性） | **HISTORICAL**（実測記録） | MD-3 | `ops/ENV_PREFLIGHT_2026-08-08.md`（main。PR #31 merge済み 2026-08-09） |
| E-009 | Public Succession Signal Sensor | **OPPORTUNITY NOTE**（実装しない。Data Boundary: `CONSTRAINTS.md` Part I §5） | 候補 | 公開Web情報のみのRanking構想。会話レベル |
| E-010 | WebMCP / Capability Frontier Radar | **OPPORTUNITY NOTE**（常時Radarは実装しない） | 候補 | 会話レベル |
| E-011 | MD-2 Distribution Canary（Public Content候補生成・C-1/C-2投稿） | **ACTIVE**（C-1投稿 2026-08-08・C-2投稿 2026-08-09 いずれもHuman Commit・World Signal観測中。判定は事前登録ルール「3本×2週間」。C-3タイミングはヒロ判断） | MD-2 | `experiments/md2-distribution/CANARY_2026-08-08_CONTENT_CANDIDATES.md`（main。§H World Signal Logに実投稿文・文体差分・impression実測を記録） |
| E-012 | Desire発見サービス（自己分析→目的合意→ロードマップ→伴走） | **HOLD_WITH_TRIGGER**（2026-08-09評価: 三重矛盾により独立サービス凍結。検証装置はSALES_OS §9の3タグ分類として稼働中。T1-T3発火で診断SKUとして再審理） | MD-1候補 | `direction/EVAL_DESIRE_DISCOVERY_SERVICE_2026-08.md`（trigger定義・Stage設計保存） |

運用規則:

- 新しいReality Experimentは、experiment_id / desire_id / hypothesis / chosen_route / budget_cap / world_signal / verdict / learning を最低限持つ（巨大schemaを先に作らない。`ROADMAP.md` §0参照）。
- statusの変更はCURRENT_STATE.mdの観測更新と同時に行う。Direction級の変更はD-record（`DECISIONS.md`）。
- 過去実験の成果物は削除しない。Decision History（何を仮説し、何が失敗し、なぜRouteを変えたか）として保存する。
- E-005 / E-006 / E-008のWorld Signalから抽出した次回Demand Scan向け学習は `experiments/batch-1/LEARNINGS.md`（Lane C / MD-3）が保持する（台帳事実はLEDGER、能力変更はJOURNALの管轄のまま）。
