# Lights Out Factory Roadmap

Status: **LAYER2 ROADMAP HYPOTHESIS — evidence gates, not a calendar promise**  
Created: **2026-08-05 JST**  
Initial evidence base: `main@6bef0f7e001d6ecebddcea4f9904b9dc47cc0343`

この文書は、IOSを実装へ変換する長期ロードマップである。Layer1を追加・変更しない。各段階は日付ではなく、事前登録した証拠gateで進む。

---

## 1. Control Plane: OS / Current State / Roadmap

Factoryは3つの軸で進化する。

| Axis | Canonical file | Question | May contain |
|---|---|---|---|
| OS | `OS.md` | What should the system optimize, and how should it decide? | Layer1 principles, Layer2 capability hypotheses, boundaries |
| Current State | `CURRENT_STATE.md` | What is true and proven now? | Default-branch facts, evidence scope, gaps, bottleneck, current gate |
| Roadmap | `ROADMAP.md` | What is the destination and the next evidence gate? | Final goal, dependency graph, canaries, adoption rules |

`JOURNAL.md`は4本目の軸ではなく、3軸が変化した理由と結果を残す監査履歴である。訂正時は旧主張、訂正理由、根拠を追跡可能にする。

### Precedence

1. Layer0の現行実行可能性とHard Boundary（実行を制約する。OSを改定はしない）
2. `OS.md`（Shouldを統治する）
3. default branch / recorded run / world observationの証拠
4. `CURRENT_STATE.md`
5. `ROADMAP.md`
6. `JOURNAL.md`の過去判断
7. 会話、外部提案、leaderboard

下位が上位と矛盾したら停止し、矛盾を記録する。会話や添付だけでgateを通過扱いにしない。

---

## 2. Final Goal

最終ゴールは、特定モデル、特定ベンダー、ゲーム工場、またはmulti-agent workspaceを所有することではない。

**Human Desireを、その時代に利用可能な最高の外部知能・道具・実行基盤の組合せによって、最小の人間介入でWorld Valueへ変換し続ける、自己改善型Intelligence Transformation Systemを持つこと。**

Factoryは高価な基盤モデルや汎用部品を自前で再開発しない。世界中の研究所・企業・OSSが加速させる部品を候補として観測し、能力単位で比較し、ATF自身の仕事で勝った構成だけを採用する。

目標ループ:

```text
Human Desire + Boundary
          ↓
     Objective contract
          ↓
Generation → Selection → Verification → Distribution
     ↑                                      ↓
     └──── Product Learning ← World Signals ┘

External Capability Radar
          ↓
Challenger configuration
          ↓
Benchmark → Canary → Independent Verification
          ↓
Adopt / Reject / Roll back
          ↓
Next Factory run
```

この2つの学習ループが閉じた時、Factoryは「何を作るか」と「どう作るか」の両方を証拠で更新する。

### “Best” means observed best, not newest

「常に最高峰のモデルを使う」とは、leaderboard 1位を自動採用することではない。

**能力ごとに、現Objective・Layer0・Capability Contractの下で、ATFの証拠上もっとも高い成果を出す構成をChampionとする。**

構成には少なくとも次を含む。

- model / provider / revision
- reasoning or inference configuration
- prompt / context / schema
- tools / skills / MCP / connectors
- harness / CLI / SDK
- permissions / sandbox / credentials scope
- runtime / browser / OS / dependency versions
- agent roles, order, handoff, retry policy
- multiple models and deterministic checksの組合せ

モデルだけを交換し、周辺条件を記録しない比較は無効。

---

## 3. Autonomous Evolution Contract

将来のEvolution runは毎回、次の順で動く。

1. default branchの`OS.md`を読む。
2. default branchと直近run証拠から`CURRENT_STATE.md`の鮮度を検証する。
3. `ROADMAP.md`の依存関係を読む。
4. 権限内かつprerequisite済みのgateを、ゴールへの直接性・現在の律速仮説・情報利得・可逆性・費用で順位付けし、1 runにつき1件選ぶ。人間専権が必要なら`HOLD`し、独立laneの別gateへ進む場合は非依存性を記録する。
5. 現在の律速が不明なら変更を作らず、観測を追加する。
6. 仮説、base SHA、変更変数、PASS / FAIL / VOID / STALE条件、rollbackを事前登録する。
7. 最小のcanaryを実行する。
8. 生成担当とは独立した検証と決定論テストを通す。
9. 証拠に応じてAdopt / Reject / Hold / Roll backを決める。
10. `CURRENT_STATE.md`と`JOURNAL.md`を更新する。
11. 次のrunで結果を再観測する。

一度に複数の未知変数を変えない。全組合せの総当たりは組合せ爆発を起こすため禁止ではなく、通常は最小の情報利得を生むbounded canaryへ縮約する。

### Result states

- `PASS`: 事前登録した目的を証拠が満たした。
- `FAIL`: 十分な観測機会があり、事前登録条件を満たさなかった。
- `VOID`: 配信なし、検査不能、データ欠損等により仮説を評価できなかった。
- `STALE`: baseまたは依存条件が変化し、比較が無効になった。
- `HOLD`: Hard Boundary、Layer0、証拠の曖昧さ、認証・費用等で安全に進めない。

`VOID`を`FAIL`として学習しない。`STALE`な結果を再利用しない。

---

## 4. Two Learning Loops

### 4.1 World Learning — what to build

```text
Output
  → Distribution
  → Reach
  → Attributable Play Start
  → Product Engagement
  → Selection / Generation hypothesis
  → New Output
```

信号は最低でも分離する。

- `distribution`: impressions, views, placement, click-through, channel, source
- `product_engagement`: play start, completion, replay, voluntary return, explicit feedback
- `system_health`: beacon delivery, bot/duplicate suspicion, missing data, attribution confidence

Reachは「届いた」証拠であり、「面白い」証拠ではない。計測健全性とsufficient world feedbackの閾値が通るまで、ReachをGenerationへ直接戻さない。

### 4.2 Capability Learning — how to build

```text
External Radar
  → candidate capability
  → ATF benchmark
  → same-base Champion/Challenger canary
  → independent verification
  → adopt / reject
  → production observation
  → retain / roll back
```

Radarの例:

- model and tool vendor release notes
- Arena系の人間選好データ
- Artificial Analysis等の性能・速度・価格データ
- official benchmarks and system cards
- OSS agent/harness/plugin releases
- ATF内の失敗、修正、費用、latency

外部データは候補探索のpriorであり、採用判定ではない。日時、カテゴリ、出典、利用条件を記録し、ATFの同条件canaryを必須とする。

---

## 5. Evidence-Gated Roadmap

各gateは、その前提が満たされたときだけ着手する。複数レーンは独立に進められるが、世界信号をGenerationへ戻す前にはWorld Learning側の前提をすべて満たす。

### Foundation — three axes become canonical

#### F0 — OS on the default branch

Goal: `OS.md`をdefault branchの正本にする。

PASS:

- PR #22が単独変更としてmerge済み
- default branch上のSHA-256が承認済み原本と一致
- `OS.md`以外の変更が混在しない

#### F1 — Evidence-based current state

Goal: `CURRENT_STATE.md`をmainとrun evidenceから再構成できるようにする。

PASS:

- observed_at / base SHA / evidence scopeがある
- implemented / unproven / missing / pendingが分離される
- bottleneckとsmallest next gateが1つに絞られる
- stale判定規則がある

#### F2 — Roadmap as a gate graph

Goal: 本文書を正本化する。

PASS:

- final goalがIOSと矛盾しない
- 日付ではなく証拠gateで書かれる
- World LearningとCapability Learningが分離される
- 各gateの前提・証明範囲・rollbackがある

#### F3 — Runtime reads the control plane

Goal: Evolution runが3文書を実際に読む。文書を置くだけでは自走と呼ばない。

PASS:

- run artifactにOS / Current State / Roadmapのblob SHAを記録
- 欠落・矛盾・staleをfail-closedで報告
- prerequisite済みgateをIOS §15と本書の選択規則で順位付けし、1件だけ提案
- repo外の会話やmemoryを正本にしない
- Production Loopを壊さない独立canaryで証明

`main` SHAの変化だけでは`STALE`にしない。base以降のdiffが当該assertion、evidence、またはgateを変えた場合だけmaterially staleとする。影響なしなら検査済みhead SHAをrun artifactへ記録して継続する。

#### F4 — Autonomous evolution PR

Goal: 証明済みの欠陥またはRoadmap gateから、branch / draft PR / tests / independent verdictまで人手0にする。

PASS:

- kickoff後、reviewable draft PRと証拠が無人で生成される
- base/head SHA、構成provenance、費用、所要時間、修正回数を記録
- 実装担当が検証規則やHard Boundaryを同じPRで緩められない
- merge、Secrets、permissions、kill switchはこのgateの対象外

First candidate: Selection Record v2 and the verified JOURNAL 0005 / 0007 corrections.

#### F5 — Verified bounded auto-merge

Goal: 同型・低リスク変更に限りhuman mergeを退役させる。

Prerequisite:

- F4の反復成功
- deterministic acceptance contract
- independent reviewer
- strict up-to-date base and rollback
- protected governance filesの別経路

PASS:

- 許可範囲内の変更が無人でmergeされる
- out-of-scope変更、STALE、曖昧なverdictは停止
- rollback rehearsalが成功

通常のauto-merge能力ができても、OS amendment、検証規則、permissions、Secrets、branch protection、kill switchを同一レーンで変更しない。これらの退役は別の最高水準gateでのみ検討する。

---

### World Learning Lane

#### W0 — Comparable distribution canary

Goal: X、itch.io等を主経路と決める前に、同時期・同素材・等価指標で比較する。

PASS:

- hypothesisとchannel別操作を事前登録
- impressions同士、または共通instrumentのplay start同士で比較
- `VOID`条件とattribution confidenceを定義
- identity / credentials / costのBoundaryを守る

itch.ioは既存projectの手動作成と初回HTML5設定が必要であり、butler pushはその後の更新運用だけを証明する。Xも0フォロワーだから構造的に不可能とは仮定しない。

#### W0A — Proven distribution automation

Goal: 手動カナリアで実在を確認した経路の反復作業だけを、Production Loopと分離して自動化する。

PASS:

- 初回identity / project / credentials設定の人間境界を記録
- 独立した`distribution.yml`等で更新できる
- `factory.yml`を変更しない
- distribution failureが作品productionを失敗扱いにしない
- credential scope、費用、retry、停止条件を記録
- 自動更新がReachを生むとは仮定せず、運用成立だけを証明範囲とする

#### W1 — Attributable play start

Goal: 作品コードの外部通信ゼロを保ちながら、入口から作品への遷移を測る。

PASS:

- catalog側の最小instrumentでplay startを帰属
- retry / duplicate / missing eventを識別
- 公開作品本体は無改変
- collection failureが作品runを壊さない

最初はクリック=play startまで。滞在、完走、iframe wrapperは根拠が出るまで足さない。

#### W2 — Trustworthy product engagement

Goal: Distributionではなく作品価値を比較できる信号を得る。

PASS:

- completion / replay / voluntary return / explicit feedbackの少なくとも1つを帰属可能に測定
- fraud / accidental repeat / missingnessの扱いを事前登録
- 同一作品・同一導線でinstrument validityを確認

#### W3 — Sufficient world feedback

Goal: IOS §13のLayer2閾値を決める。

PASS:

- 最小sample、観測期間、効果量または信頼区間、VOID条件を事前登録
- distributionとproduct engagementを混同しない
- 閾値の感度分析を行う

#### W4 — Shadow Product Learning

Goal: 世界信号から次のSelection / Generation変更を提案するが、productionには反映しない。

PASS:

- 提案が使用したsignal snapshotを固定
- 人間評価や既存スコアとの一致ではなく、次回world outcomeで前向き検証
- leakageとpost-hoc explanationを排除

#### W5 — Active Product Learning

Goal: 証明済みのworld learnerをproductionへ接続する。

PASS:

- shadow canaryの反復成功
- rollback可能
- exploration / exploitationを記録
- distribution変化と作品変化の効果を識別

---

### Capability Evolution Lane

#### C0 — Configuration provenance

Goal: 現行Championを再構成可能にする。

Record per capability:

- model/provider/revision
- reasoning configuration
- prompt/context/schema version
- CLI/SDK/harness/tool versions
- permissions/runtime
- base SHA
- token/cost/latency

PASS: operatorが制御できる全項目とproviderが公開する全provenanceを記録し、観測不能なrouting / revisionは`UNKNOWN`として明示する。baselineはその不確実性込みで再実行可能である。

#### C1 — ATF benchmark contract

Goal: 一般leaderboardではなく、Factoryの実仕事で能力を測る。

Benchmark families:

- Generation quality and constraint compliance
- Selection record consistency
- Verification defect detection and false positive rate
- Learning diagnosis and minimal repair quality
- Distribution hypothesis quality and measurement validity

PASS:

- candidateに実行前は未提示のevaluation tasksを含む。task hash / versionをrun前に固定し、評価後に公開する。恒久的なsecret setを使う場合は、そのauthority、保管、rotationを別のLayer0 / credential contractとして先に定義する
- deterministic checksとindependent semantic reviewを分離
- benchmark自身のversionとknown blind spotsを記録
- world valueをbenchmark scoreで置き換えない

#### C2 — External Capability Radar

Goal: 新モデル、ツール、ハーネス、実行基盤を継続観測し、試す価値のあるChallengerだけを起票する。

PASS:

- official sourceを優先
- capability単位で候補化
- expected gain / cost / risk / required secretを記録
- rankingだけでproduction変更しない

#### C3 — Capability Champion / Challenger

Goal: 同一base・同一contractで1変数を比較する。

PASS:

- ChampionとChallengerのprovenance完全記録
- quality / reliability / latency / costを能力目的に合わせて比較
- independent verifierが判定
- winnerが明確でなければ現行維持

#### C4 — Configuration combination canary

Goal: model単体ではなく、model × prompt × harness × tools × verifierの組合せを改善する。

PASS:

- 変更変数を最小化
- ablationで利得源を識別
- orchestration overheadを成果として数えない
- 同じblind spotを持つ生成・審査の共倒れを検査

#### C5 — Verified adoption and rollback

Goal: 勝った構成を自動採用し、productionで劣化したら戻す。

PASS:

- bounded rollout
- post-adoption observation window
- regression threshold
- one-step rollback
- JOURNALにAdded / Modified / Removedを記録

#### C6 — Architecture evolution

Goal: 既存GitHub Actionsでは表現できない実測ボトルネックが生じた時だけ、orchestrator、A2A、Kanban、常駐host等を比較する。

Hermes、Buzz、ACP、Cowork、ChatGPT Work、Claude Code、Codex、Goose等は製品名として採用・禁止しない。能力候補である。通信、durable queue、signed identity、connector、local execution等の不足が律速として観測された時だけcanaryへ戻す。

PASS: 新基盤が、既存repo-native構成より成果、運用、信頼性のいずれかを測定可能に改善し、第二の正本を作らない。

---

### Convergence Lane

#### X0 — Dual-loop attribution

Goal: 「何を作るか」の変更と「どう作るか」の変更を同時に行っても、効果を識別する。

PASS:

- product hypothesis revisionとcapability configuration revisionを別IDで記録
- 同一runで両方変えた場合はinteraction experimentとして事前登録
- attribution不能ならAdoptしない

#### X1 — Self-Evolving Factory

Goal: 3軸から最小gateを選び、世界と能力市場の変化を観測し、自らcanaryを設計・実行・検証し、証明された変更を採用・rollbackする。

PASS is continuous, not terminal:

- HumanはDesireとBoundaryを与える
- FactoryがHow、実装、評価仮説、改善を担う
- 世界信号が作品判断を更新する
- ATF benchmarkとproduction evidenceが能力構成を更新する
- 生成者と検証者の独立を能力契約として維持する
- governance taxを証拠が消えた時に削除する
- current Champion、State、Roadmap gateがdefault branchから再構成できる
- 新しい部品が登場しても、製品名の移行プロジェクトではなく通常canaryとして吸収できる

この状態でも進化は完了しない。観測対象と部品市場が動く限り、ループは継続する。

---

## 6. What We Do Not Build Yet

次は、証拠なしでは追加しない。

- Hermes / Buzz / A2A / ACPを通常経路へ入れること
- Cowork / ChatGPT Work / Gmail / chat threadを正本やhandoffにすること
- 常駐VPS、第二のqueue、第二のmemory、第二のaudit log
- leaderboard順位だけによるmodel auto-swap
- foundation modelの自前開発
- AI人数、思考量、候補数を成果として最大化すること
- Reachを面白さとしてGenerationへ戻すこと
- sufficient signal前の自動学習
- 固定cadenceの神聖化
- 計測より先のdashboard
- attribution根拠なしのiframe wrapperや作品内telemetry

これは恒久禁止リストではない。該当する能力不足が律速として証明されれば、通常のRadar → Benchmark → Canaryへ戻す。

---

## 7. Change Protocol

このRoadmapを変えるPRは次を含む。

1. Change type: Added / Modified / Removed
2. 影響するgate
3. base SHAとevidence revision
4. hypothesis and falsifier
5. result: PASS / FAIL / VOID / STALE / HOLD
6. OS alignment
7. unknowns
8. rollback or deletion condition

日付が来たこと、最新製品が出たこと、誰かが高評価したことだけではgateを進めない。

`CURRENT_STATE.md`は観測が変わるたびに更新する。`ROADMAP.md`は証拠、Layer0、またはOSが進路を変えた時だけ更新する。`OS.md`は十分な世界証拠があるLayer1 amendmentでのみ変更する。

---

## 8. Dependency-Safe Routing

Gateの現在statusと次の1件は`CURRENT_STATE.md`だけに置く。本書へ`Drafting`、`PASS`、現在SHA等の運用状態を重複記録しない。

依存順序:

1. FoundationはF0 → F1 → F2。F3は3文書がdefault branchへ揃った後にだけ実行する。F4はF3の後、F5はF4の反復成功後。
2. World LearningはW0（手動比較カナリア）→ W0A（distribution自動化）→ W1（計測）→ W2 / W3 → W4（shadow learning）→ W5。
3. Capability EvolutionはC0 → C1 / C2 → C3 → C4 → C5。C6は既存構造では表現できない律速が証明された時だけ候補化する。
4. C0とF3は、World LaneをblockせずProduction Loopを変更しない独立canaryとして並行候補になりうる。ただし1 runにつき選ぶgateは1件。
5. Selection Record v2は、F3通過後のF4候補、または現行PR運用で行う独立した証明済み欠陥修理として扱える。

どの候補を今選ぶかは本文書の並びでは決めない。`CURRENT_STATE.md`の証拠を使い、Goal First、律速仮説、情報利得、可逆性、費用で順位付けする。

ドキュメントを置いただけでは自走ではない。F3とF4が通って初めて、3軸が実行系へ接続されたと言える。
