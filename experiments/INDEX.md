# experiments/INDEX.md — Reality Experiment Registry

全Reality Experimentのstatus台帳。**Historical EvidenceとCurrent Instructionを混同しないための索引**であり、既存成果物の物理移動はしない（リンク・CI・履歴保全のため）。

Status語彙: `ACTIVE` / `HOLD` / `NO-GO` / `RETIRED` / `HISTORICAL` / `PROPOSED` / `OPPORTUNITY NOTE`

| ID | Experiment | Status | Major Desire | 所在 / Evidence |
|---|---|---|---|---|
| E-001 | Browser-Toy Production Loop（Game Factory、SEED 001〜024） | **HOLD**（Historical） | 旧Mission | `works/`, `factory.yml`, `smoke.mjs`, `index.html`（Pagesカタログ）, `JOURNAL.md`。workflow `factory` は**disabled_manually**（2026-08-07停止・Actions API実測 — `ops/OWNERSHIP_AUDIT_2026-08-08.md` 再検証記録2）。ファイル内にhistorical cron定義のみ残存（`CURRENT_STATE.md` §4）。**⚠ 既知の欠陥2件（2026-08-09発見・未修正）**: ①公開中のPagesトップ（`index.html`）は `<title>Catalog — Browser FPS-style Toys</title>` のままで、**現在のMission・現在のIdentityと矛盾する看板が公開面に出ている** ②`scripts/build-catalog.mjs` はRelease dateを**git履歴から導出**するため、**shallow cloneの実行環境で再生成すると24件中9件の日付が偽値になる**（実測: 実際の2026-07-27〜と異なり08-02/03/04の3種へ収束）。**このリポジトリをshallow cloneした環境で `index.html` を再生成してcommitしてはならない。**①の修正は②の制約下で行う必要があり、加えて `build-catalog.mjs` はC0 provenance baselineでSHA-256 pinされているため**baselineの再宣言を伴う**（`config/champion-baseline.json`） |
| E-002 | seed-009 TETHER LOCK Verification Failure | **HISTORICAL**（意図的未修正・証拠保存） | 旧Mission | `works/seed-009/`, `JOURNAL.md` 0001 |
| E-003 | Control Plane（C0 provenance / F3 precursor reader） | **ACTIVE**（route非依存基盤） | MD-3 | `scripts/c0-provenance.mjs`, `scripts/control-plane-canary.mjs`, canonical blocks |
| E-004 | W0 Distribution Precursor（X / itch.io計測可能性） | **HOLD** | 旧Mission→MD-2関連 | draft PR #24 `experiments/w0/` |
| E-005 | Large-N Demand Intelligence Canary（Grok x_search） | **HISTORICAL — verdict: PASS**（Sensorとして実証。2026-08-08実施） | MD-1 | Human-reported。cost ≈ $1.815 / 48+5 queries / raw 75 / unique 72 / Genuine Need ≈60 / clusters 7。repo内raw artifactなし（`CURRENT_STATE.md` §3） |
| E-006 | Batch 1 Discovery Contact（Target 20 / SENT 20 — 送信枠消化済み。VOID 3 / REACHABLE 17） | **ACTIVE**（World Signal回収Phase） | MD-1 | `experiments/batch-1/LEDGER.md`（Contact台帳・正本）、`CURRENT_STATE.md` §2。送信行為はHuman Gate。message style: 初期7件=BASELINE確定、X 13件=`UNKNOWN`（LEDGER凡例） |
| E-007 | Genome Factory v1（Dual-Clock Pure Genome Factory） | **NO-GO**（2026-08-09 ヒロ裁定: PR #30をmerge無しでclose・不採択。branch保存・reopen可逆） | 旧Mission延長 | closed PR #30 / branch `claude/genome-factory-design-538h9e` `GENOME_FACTORY.md` |
| E-008 | Environment Preflight 2026-08-08（Sensor到達性） | **HISTORICAL**（実測記録） | MD-3 | `ops/ENV_PREFLIGHT_2026-08-08.md`（main。PR #31 merge済み 2026-08-09） |
| E-009 | Public Succession Signal Sensor | **OPPORTUNITY NOTE**（実装しない。Data Boundary: `CONSTRAINTS.md` Part I §5） | 候補 | 公開Web情報のみのRanking構想。会話レベル |
| E-010 | WebMCP / Capability Frontier Radar | **OPPORTUNITY NOTE**（常時Radarは実装しない） | 候補 | 会話レベル |
| E-011 | MD-2 Distribution Canary（Public Content候補生成・C-1/C-2投稿） | **ACTIVE**（C-1投稿 2026-08-08・C-2投稿 2026-08-09 いずれもHuman Commit・World Signal観測中。判定は事前登録ルール「3本×2週間」。C-3タイミングはヒロ判断） | MD-2 | `experiments/md2-distribution/CANARY_2026-08-08_CONTENT_CANDIDATES.md`（main。§H World Signal Logに実投稿文・文体差分・impression実測を記録）／ Identity確定後のプロフィール文案: `experiments/md2-distribution/PROFILE_COPY_LIVING_GROUND.md`（**使用はHuman Gate**） |
| E-012 | Desire発見（在重力自己分析 → Direction Card → 検証日 → 伴走） | **ACTIVE**（2026-08-09に凍結解除・主軸へ昇格。同日中にHOLD_WITH_TRIGGER → 3次改訂 → ACTIVE。無料提供のみ・有償接続は`SALES_OS`§12の条件下でのみ発生。**実施件数 = 0 / N=0・完全に未測定**） | MD-3 →（接続時）MD-1 | 評価と改訂履歴: `direction/EVAL_DESIRE_DISCOVERY_SERVICE_2026-08.md` ／ 設計: `direction/DESIRE_TO_REALITY_SERVICE_DESIGN.md`, `direction/DESIRE_ENGINE_LONG_GAME.md` ／ **実装正本: `experiments/desire-discovery/SELF_ANALYSIS_PROTOCOL.md` v1.0**（在重力構造・ヒロ実発話の質問列・Direction Card v2のL0–L6分離）／ 配布: `experiments/desire-discovery/NOTE_DRAFT_SELF_ANALYSIS.md`（**公開はHuman Gate・未公開**） |
| E-013 | Daily Encounter Queue Canary（3日限定・毎日最大10件・Human manual send） | **HISTORICAL — result: `VOID`**（2026-08-14確定。評価時点は事前登録どおり2026-08-11 23:59 JST。**Day 1のみ Human-confirmed**: 配達4 / SENT 4 / REPLY 0 / 実費 USD 0.1631（daily cap 0.18内）。**Day 2 / Day 3 = `UNKNOWN`** — 実行されたともされなかったとも断定しない。Human-confirmed記録・再現可能artifactが無く検証不能。**`FAIL` でも `KILL` でもない**。品質・需要・返信率について学習しない。**xAI追加チャージなし**（USD 10は独立 `HOLD` のまま・auto top-up OFF）。Day 4以降の自動継続なし。**再試行は継続ではなく新規事前登録**——private session state依存を外し、trigger発火・生成・配達・実費が独立検証できることが最低条件） | MD-2 → MD-1 | **台帳: `experiments/encounter-queue/LEDGER.md`**（Final Verdict節が正本。join key = cluster / 送信文面 / freshness を送信時点で確定記録する設計自体は反証されていない——反証されたのは実行経路の検証可能性）。Capability Learnings（xAI API仕様・コスト実測・egress制約）も同台帳が保持。Budget: daily USD 0.18 / 3-day USD 0.50 / top-up禁止 |
| E-014 | Desire to Game Reality Test（実在Desire起点の最小ゲーム変換・N 3〜5・無償・Human観測。変更変数はDesireの起点のみ: AI発案→実在人間の発話） | **ACTIVE — Phase 1未着手・納品0**（2026-08-13 PR #65 mergeで承認 = 契約が事前登録したHuman Gate通過。merge commit `0dcf7d6`） | MD-1（無償前段）/ MD-3 | 評価と契約: `direction/EVAL_DESIRE_TO_GAME_2026-08.md`（VERDICT: 仮説GO / Reality Test MODIFY / 商品仮説HOLD / Factory再稼働NO_ACTION。Repair / Continuation分離 = 2026-08-13 Human裁定を含む）。**台帳: `experiments/desire-to-game/LEDGER.md`**（作成済み。PII非記載・匿名ID・作品はrepo外でSHA-256のみ記録）。budget_cap: 追加支出 JPY 0 / Human時間 合計90分。公開なし・課金なし・D-001のHOLD不変 |

運用規則:

- 新しいReality Experimentは、experiment_id / desire_id / hypothesis / chosen_route / budget_cap / world_signal / verdict / learning を最低限持つ（巨大schemaを先に作らない。`ROADMAP.md` §0参照）。
- statusの変更はCURRENT_STATE.mdの観測更新と同時に行う。Direction級の変更はD-record（`DECISIONS.md`）。
- 過去実験の成果物は削除しない。Decision History（何を仮説し、何が失敗し、なぜRouteを変えたか）として保存する。
- E-005 / E-006 / E-008のWorld Signalから抽出した次回Demand Scan向け学習は `experiments/batch-1/LEARNINGS.md`（Lane C / MD-3）が保持する（台帳事実はLEDGER、能力変更はJOURNALの管轄のまま）。

### 契約の事前登録検査（2026-08-13追記。新規実験の実行前に適用）

E-013とBatch 1で、実行後のHuman amendmentを要した契約欠陥の再発防止。**すべて既存正本の適用であり、新しい規則ではない**——各項の正本・実測記録は括弧内が持つ。本節と正本が矛盾したら正本が勝つ。

1. **事前登録の完備**: hypothesis（反証可能形）/ 変更変数 / 取得可能なworld_signal / 判定点 / PASS・FAIL・VOID・STALEの成立条件 / budget_cap / Human時間上限 / rollback / KILL条件 / 通過すべきHuman Gate（`CONSTRAINTS.md` Part I §4）を、実行前に契約へ書く。結果の観測後の基準変更は、書き換えではなく訂正追記とする（`CONSTRAINTS.md` Part I §6）。
2. **判定語彙の定義存在**: 契約や正本が参照する全verdict語に、成立条件が実行前に定義されている。未定義のverdict語へ下流の決定（支出・継続・拡大）を紐づけない（実測欠陥: `SCALE` が未定義のままUSD 10チャージの条件になっていた — `experiments/encounter-queue/LEDGER.md` Day 3事前登録 冒頭）。
3. **判定窓の起点明示**: タイムアウト・判定窓は絶対時刻に加えて起点事象を明示する。送信起点であるべき窓を受信時刻から書かない——送信がHuman Gateである以上、受信から送信までの間隔は常に `UNKNOWN`（実測欠陥: `experiments/batch-1/LEDGER.md` Reply Log 004）。
4. **検出力（自己閉塞・循環の禁止）**: 契約のN・期間・既知の実測率の下で「発生ゼロ」が最頻結果になりうるSignalを、PASSや資源決定の必須条件にしない。供給が小さすぎて作れない結果に判定を紐づけない。判定がその判定の結果（拡大後にしか得られない量のSignal）に依存する循環も同型として扱う（実測欠陥と訂正: `experiments/encounter-queue/LEDGER.md` Day 3 Final Verdict — Human amendment 訂正理由2。正例: E-014契約の「強シグナル（記録するがPASS条件にしない）」）。
5. **独立Human Commitの非連動**: verdict成立に、支出・チャージ・送信・公開など別のHuman Gate行為を自動連動させない。判定と各Gate行為は独立のHuman Commit（実測欠陥と訂正: 同amendment — USD 10チャージの独立 `HOLD` 分離）。
6. **判定入力の規律**: 判定に使う値はHuman-confirmedの実測のみ。未確認は `UNKNOWN` のまま扱い、判定のために推測で確定させない。供給不足・観測不能・記録欠損は `VOID` であり、`VOID` を `FAIL` として学習しない（`CONSTRAINTS.md` Part I §6 / 同amendment 判定手順）。
