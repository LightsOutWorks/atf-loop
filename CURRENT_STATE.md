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

Observed at: **2026-08-15 JST**

Default branch: `main`

Base SHA: `3d94c50361890d398835ea8ffe442f2f5d720778`

Evidence scope: 上記SHAのdefault branch / 本セッションの一次実測（`git`・`node scripts/c0-provenance.mjs`・`node scripts/control-plane-canary.mjs`・GitHub API read-only）/ 明示ラベル付きのHuman-reported。

**本文は現在値だけを持つ**（2026-08-14 / D-011）。訂正の経緯・棄却した仮説・過去の観測値はgit historyと該当D-record・実験台帳が持ち、本文へ積層させない。会話・予定・提案を実装済みの事実として書かない。確認できないことは `UNKNOWN` とする。文書の責務分担とSource of Truth Priorityは `OS.md` が持つ。

---

## 1. Mission State Summary

- 本リポジトリは**ゲーム工場ではない**（D-001）。現MissionはOS.md冒頭のCurrent Identity、North Star / Major Desireは `DESIRES.md` が正本。
- Browser-Toy Production Route（SEED 001〜024）は **Historical Experiment（HOLD）**。成果物契約は `CONSTRAINTS_BROWSER_TOY_ROUTE.md`（旧 `CONSTRAINTS.md` Part II）。
- **Public Identity = `Living Ground`**（D-004）。GitHub org `LightsOutWorks` は作業場として不変更。アセットは `brand/`、幾何規格は `brand/BRAND_SPEC.md`。
- **Identity rollout = 部分実施**（Human-confirmed）。切替済み: X表示名 / Xハンドル `@livinggroundjp` / Xアイコン / X bio / noteアカウント（表示名・アイコン・メール認証完了）/ note ID `livinggroundjp`。**未完了: Xヘッダー（旧名 `LIGHTS OUT FACTORY` が公開面に残存）/ note自己紹介 / noteヘッダー。** 貼付用の実文は `experiments/md2-distribution/PROFILE_COPY_LIVING_GROUND.md` §0。
- **公開面の実測**: Xフォロワー **3** / note記事 **0本**。
- **`EN_GATE`**（英語は公開凍結。条件の正本は `direction/WRITING_SYSTEM_EN_2026-08.md` §9）: `note = 0 / 10` / `non_boilerplate_reply = 1 / 3`。加えて言語追加は「日本語で週2本以上を4週連続で公開」が要る。**凍結対象は公開のみ**で、調査・下書き・書法体系の更新は凍結中も行う。
- **Confirmed terminal revenue = JPY 0**（§5）。Factoryは「成功した」と表現してはならない（`CONSTRAINTS.md` §6）。

## 2. Active Experiment — 現在値

status語彙とroute statusの正本は `experiments/INDEX.md`。各実験の事実の正本は右列の台帳。

| ID | status | 現在値 | 台帳 |
|---|---|---|---|
| **E-006** Batch 1 Discovery Contact（MD-1） | **ACTIVE**（World Signal回収Phase） | SENT **20** / VOID 3（分母外）/ REACHABLE **17** / REPLY **1** / GENUINE_PAIN_CONFIRMED **0**。送信枠は消化済みで、追加送信・候補準備は本Batchに無い。3通目は2026-08-11送信済み、事前登録の判定時刻2026-08-13 09:45 JSTは**経過したが判定結果のrepo記録が無く `UNKNOWN`**。Stageは `REPLY` のまま（会話の長さをファネルの前進として読み替えない） | `experiments/batch-1/LEDGER.md` |
| **E-011** MD-2 Distribution Canary（MD-2） | **ACTIVE**（観測中） | C-1（2026-08-08）/ C-2（2026-08-09）投稿済み。impression実測は C-1 **≈20 imp / 15h・reply 0**。判定は事前登録の「3本×2週間」 | `experiments/md2-distribution/CANARY_2026-08-08_CONTENT_CANDIDATES.md` |
| **E-012** Desire発見（在重力自己分析） | **ACTIVE** | **実施件数 0 / N=0・完全に未測定**。無料提供のみ。**Instance 1 の実行契約が2026-08-15に承認済み（PR #86 / merge commit `3d94c50`）・未実施** — 承認は実施ではなく、N は 0 のまま。残る未通過Human Gateは第三者接触のみ | `experiments/desire-discovery/LEDGER.md`（台帳・実測行0）／ `INSTANCE_1_CONTRACT.md`（契約）／ `SELF_ANALYSIS_PROTOCOL.md`（実装正本） |
| **E-014** Desire to Game Reality Test（MD-1無償前段 / MD-3） | **ACTIVE — Phase 1未着手・納品0** | 判定母集団のFunnelは未着手。到達実測はRetrospective Seed Corpus側にあり、eligibilityは全件 `UNKNOWN` のため判定母集団の外（§7） | `experiments/desire-to-game/LEDGER.md` |
| **E-013** Daily Encounter Queue Canary | **HISTORICAL — result `VOID`** | Day 1のみHuman-confirmed（配達4 / SENT 4 / REPLY 0 / 実費 USD 0.1631）。Day 2・Day 3は実行の有無ごと `UNKNOWN`。**`FAIL` でも `KILL` でもなく、品質・需要・返信率について学習しない。** Day 4以降の自動継続なし。再試行は継続ではなく新規の事前登録とし、private session state依存を外すことを最低条件とする | `experiments/encounter-queue/LEDGER.md` |
| **X World Signal / Reply Ingestion Canary** | **HOLD**（execution_authority = NOT_GRANTED / budget UNAPPROVED） | 再評価trigger①（初の実reply発生）は**発火済み**、②（Humanの返信確認・転記負担が実測上の律速になる）は**未発火**。**①のみでは解除しない** | — |

E-005（Large-N Demand Intelligence / verdict `PASS`）・E-008（Environment Preflight）は `HISTORICAL`、E-007 は `NO-GO`、E-009 / E-010 は `OPPORTUNITY NOTE`（実装しない）。E-001 / E-002 / E-003 / E-004 の扱いは `experiments/INDEX.md`。

**運用の現在値**: Lane A（E-006）の定期self check-inは停止済み（X読取がharnessから不可 — E-008）。Humanがreply / reactionを共有した時のみ再起動する。並行セッションは同一canonical fileを同時編集しない。

## 3. Proven Sensor Capability — Large-N Demand Intelligence（E-005 / HISTORICAL）

- 2026-08-08実施。xAI API接続・Grok x_search実行に成功。cost ≈ USD 1.815 / 48 collection + 5 verification queries / raw 75・unique 72・Genuine Need ≈60・semantic clusters 7。**Public Real-time Human DesireをXから機械探索するRouteはSensorとしてPASS**（市場全体を理解したとは主張しない）。repo内raw artifactは無い（Human-reported）。
- 運用規律: Large-N（AI観測）とSmall-N（Human個別Contact）を分離する。Demand収集条件に「AIで解けるか」を入れない。Gap分類 A. Capability / B. Productization / C. Distribution / D. Adoption のうち現在はB/C/D重視。Existing Solutionの存在は自動KILL条件ではない。

## 4. Historical Route — Browser-Toy Production Loop（HOLD）

- workflow `factory`（id 322145639）は **`disabled_manually`**（2026-08-07 10:39 JST停止。2026-08-09 Actions API read-only実測）。`.github/workflows/factory.yml` 内にhistorical cron定義（`0 1 * * 6`）は残るが運用scheduleは停止済み。**re-enableはHuman Gate。**
- SEED 001〜024が `works/` にあり、GitHub Pagesのカタログ（`index.html`）で公開中。**既知の未修正欠陥2件**（公開中カタログのtitleが現Missionと矛盾 / `build-catalog.mjs` のRelease dateがshallow cloneで偽値化）は `experiments/INDEX.md` E-001 が正本。
- seed-009 TETHER LOCKは既知のVerification Failureとして意図的に未修正で保存（E-002）。`eval.json` はseed-001〜009のみ・全て `world: null`。JOURNAL 0005 / 0007の訂正とSelection Record v2は未実装（record debt）。
- Control plane: C0 provenance canary **PASS** / F3 precursor reader **PRECURSOR**（いずれも2026-08-14 本セッションでローカル再実行して確認）。

## 5. Economic / Budget State

- **Confirmed terminal revenue = JPY 0。** Need→Paid Value→Confirmed Revenueは未証明。証明済みはPublic Demandの機械探索 / Grok x_searchのSensor機能 / Contact候補生成 / HumanのReality接触まで。
- Factory monthly hard cap: **JPY 50,000**（`CONSTRAINTS.md` §2）。Claude Max 20x契約中。ChatGPTは2026-08-13から $20 plan。
- **副業条項**（Human-confirmed）: 就業規則上、副業は**要相談だが禁止ではない**。方針は「実収益が発生してから会社へ相談して通す」。相談は**未実施 = `UNKNOWN`**。有償受注の発生時点で本項を更新する。
- **xAI credit**: initial USD 5.00 / cumulative consumption USD 4.351 / Day 1消費 USD 0.1631 → **推定残高 ≈ USD 0.486**（2026-08-09 Human-confirmed値からの `Derived`）。**auto top-up OFF。追加チャージなし。** USD 10のチャージは**独立した Human Commit として `HOLD`**（未承認）。解除条件5件の正本は `experiments/encounter-queue/LEDGER.md`「Day 3 Final Verdict — Human amendment」。E-013は `VOID` で終了しており、そのcap（daily USD 0.18 / 3-day USD 0.50）は失効した実験のものである。

## 6. Open PRs and Session Ownership（観測 2026-08-14）

GitHub API実測でopenは**2件**（いずれもdraft、base `main`）。

- **PR #75** `claude/bottleneck-analysis-2ilx5b` — ops/direction: 一次ソース到達性の実測とベット候補①の反証。
- **PR #76** `claude/digital-gov-mcp-audit-j5ouc7` — CURRENT_STATE §7のxAI残高を訂正追記で是正。**本ファイルの§5と競合する。** merge順はHumanが決める。

## 7. Structural Bottleneck / Current Operational Priority

最重要未証明区間: **Need→Paid Value→Confirmed Revenue**（MD-1 Terminal Signal。現在JPY 0）。

**Structural Bottleneck**（長期の構造欠落。D-003の4監査収束点）:

> **World Signalを回収し、正しいContact / Needへ帰属し、次のActionへ戻す経路が弱いこと。**

到達性の現在値（2026-08-10 一次実測）: `note.com` / はてな / `zenn.dev` / `qiita.com` / 青空文庫 / `coconala.com` / `*.wikipedia.org` / 文化庁 / J-STAGE / NHK は到達可。`mhlw.go.jp` / `e-gov.go.jp` は **CONNECT tunnel 403**。Xは**単一ポスト本文とbioのみ取得可**で、**スレッドの2投目以降・impressions・いいね・返信数・フォロワー数・タイムラインは取得不可**。したがって返信の検知は引き続きHuman報告経路に依存する。これは tooling / reachability の観測であり、「一次資料が存在しない」と記録してはならない（`OS.md` HI-4 F9）。

**Current Operational Priority**（D-009。2026-08-14 Human裁定）:

```
外部ユーザー → 利用 → 継続利用 → 価値確認 → 売上
```

- **Factory内部の高度化を目的にしない。** 目的は、Factoryを使った結果として外部の人間が実際に触れ、使い、再度使い、価値を感じ、最終的に支払いが発生すること。
- **上流だけの前進を前進と数えない。** 優先は上流から下流の順。**ただしhardな直列ゲートではない**——5段はReality Signalの深まりを観測するファネルであり、**継続利用をhard gateにせず、段4・段5の発生条件にしない**。
- 読みの確定: **段1〜4は家族・友人・知人を外部ユーザーに数え、段5だけが第三者からの支払いを要求する。** 段3はPASS必須条件へ格上げしない（N 3〜5では「継続0」が最頻結果になりうる — `experiments/INDEX.md` 事前登録検査4）。段4→5の経路は**E-014契約 §6 の解除trigger（①第三者の自発的「自分にも作ってほしい」②自発的「いくら？」）だけ**を使い、前売り禁止・Independence Clauseは不変。

**Reality Funnel 現在値（G1の実測。正本 = `experiments/desire-to-game/LEDGER.md`）**

| 段 | 現在値 | 等級 |
|---|---|---|
| 1. 外部ユーザー | **2**（P1 / P2） | Human-confirmed（FACT） |
| 2. 利用 | **2** | FACT |
| 3. 継続利用 | **2**（2名とも別日・促しなし再プレイ。P2は翌朝） | FACT |
| 4. 価値確認 | **1**（P1の発話「売れるね」） | FACT。**購入意思でも支払いでもない** |
| 5. 売上 | **JPY 0** | FACT |

ゲーム単位では**利用のあるゲームが3本**（G1 / G3 / G4）、**利用なしが確定したゲームが1本**（G2）、G5〜G7は `UNKNOWN`。G3「良かった」/ G4「面白いね」は感想であり、Continuation Desireでも購入意思でもないため段3・段4へ昇格させない。**参加者Nは2のまま**（ゲーム件数と参加者Nを混同しない）。**G1のeligibilityは `UNKNOWN` であり、E-014の判定母集団の外にある**——本節はE-014のFunnel現在値・判定点・Verdictを動かさない。

**現在の位置と TARGET**

```
段4（到達済み） → E-014 §6 商品HOLD解除triggerの発火 → 有償化準備 → 段5（JPY 0）
```

**現在のTARGETは段5の売上そのものではなく、§6 triggerの発火である。** trigger発火前に、有償化設計・価格設計・収益構造の追加調査を開始しない。発火後は §6 に従い、その時点で売上への最短Routeを再判定する。**G2〜G7の `UNKNOWN` を埋めることは現在の最優先ではない**——積極的に配らないが完全封印でもなく、新しい第三者のDesireが既存ゲームと一致した場合のみREUSE候補として使う（観測手順は台帳の「G1 第三者Exposure — 実行メモ」。新しいExperiment IDを作らない）。

**`ROADMAP.md` §0 の事前登録は動かさない**——律速「会話の本数」と2026-11-10の失敗判定は、結果を見てから基準を変えないため不変更（`CONSTRAINTS.md` §6）。本ファネルはこれと併置し、どちらが先に動くかを実測させる。

### 7-0. 現在の戦略 / 現在のベット（D-007 / Human裁定。正本はここ）

**Human-confirmed / repo-unverified**——実装済みの事実ではなく、現時点で採用されている方向である。層の順序（世界観 → 戦略 → 戦略と戦術の間 → 戦術）の規律は `OS.md` HI-9 が持ち、本節は中身だけを持つ。

- **現在の戦略（＝資源の配分）**: **トークンと時間を「筋のいい一点を見つけること」に集中投下する。** 筋の悪いもので進めて溶かすより、考え尽くして「これだ」となってから力を入れるほうが北極星に速く近づく。**ゼロから作らない。**
- **現在のベット（＝戦略と戦術の間）**: 自分たちが先駆者になる道を取らない。**既に収益を生んでいて、日本にまだ来ていない事業**の中から、筋がよく日本で勝てるものを見つける。**その人がどうやって収益しているのかまで解剖した上で**、これまで作ってきたものを乗せて最もシナジーが出る一点を選ぶ。**決めたら全ベットする。**
- **現在の優位（＝探索範囲の第3条件。呼称: Human Experience / Earned Edge）**: **「人の判断・欲求・迷いを引き出し、本人の言葉として返しながら、相手の現実を尊重し、進む・進まない・手放すを含む意思決定を前に進める力」。** 優位の中身を記述している裏づけは `direction/DESIRE_TO_REALITY_SERVICE_DESIGN.md` §1〜§2 のみ（等級の訂正はD-007）。repo内の実装は `experiments/desire-discovery/SELF_ANALYSIS_PROTOCOL.md`。在重力営業の原典はリポジトリ外にあり取り込まない（`CONSTRAINTS.md` §5）。D-005の禁止語はここに含めない。
- **これは絞り込み条件であって Hard Boundary ではない。** Reality Evidenceが強い候補は範囲外でも1つのCommitとしてHumanへ上げてよい（`OS.md` HI-11）。**本業から得た判断能力を優位として使うことと、本業の関係を接触母集団に使うことは別**であり、後者は禁止のまま。
- **現在の位相 = 探索期（Exploration）。** 固定実行への移行条件・固定中に変えてよい範囲・早期解除条件は `OS.md` Layer2「探索と固定」が持つ。
- **Factoryの価値主張は「生成能力」に置かない**（D-010）。最有力候補は **Reality-learning（Factory私有の複利prior）**。**仮説であり実測0**（移転実績0）。生成モート未検出は不在の証明ではない。

**行動の既定は `NO_ACTION`**（`OS.md` HI-10）。上の戦略に接続できることは実行の必要条件のひとつであって十分条件ではない。**Strategy Committed後の戦術はClaudeがOwnerであり、Humanへ選択肢を返さない**（HI-11）。

本節が更新されても `CLAUDE.md` は変更不要である（`CLAUDE.md` は本節を指すだけで内容を持たない）。

### 7-0-a. 確定済みの候補判定（Human Commit済み。再提案・再審理しない）

| 候補 | 判定 | 再検討trigger |
|---|---|---|
| 就労選択支援の指定申請書式パック | **`KILL`** | Humanが戦略レベルで規制領域参入を明示Commitし、かつ `direction/DESIRE_TO_REALITY_SERVICE_DESIGN.md` §4-a の解除4条件が揃った場合のみ。**現在は再検討しない** |
| 創業融資の3年収支計画Excel | **`KILL`** / Routing `NO_ACTION` | 外部証拠5件のいずれか（D-006 Decision 6）。**内部でより良い案が出たことはtriggerではない** |

根拠の正本は `DECISIONS.md` D-006。**創業融資Excelについて、Humanへ25分の音声メモを要求しない。商品の作成・出品・追加調査・差別化案の検討を開始しない。**「競合が存在したから」はどちらのKILL理由でもない。

## 8. Routing Facts

判定入力はcanonical block（本ファイル冒頭のstatus / `ROADMAP.md` 冒頭のprerequisites）であり、本文はこれを上書きしない。

- Control-plane gates（F/W/C/X 全22件）はBrowser-Toy Route時代に定義されたもの。F3はroute非依存の基盤として `IN_PROGRESS`。W laneはrouteのHOLDに伴い事実上凍結（blockのstatusは実測どおり保持）。
- **Mission-levelの現在の実行はcontrol-plane gateではなく、§7のCurrent Operational Priorityが担う。** 行動の既定 `NO_ACTION` の根拠は `OS.md` HI-10 であり、Browser-Toy期のrouting結論ではない。
- 新Mission用のgate体系は先回りで作らない（`ROADMAP.md` Current Horizons）。

## 9. Evidence Index

| Evidence | 所在 |
|---|---|
| default branch snapshot | `1e59e031470a779571573da9e85adf3d9853357c` |
| 各実験の事実 | `experiments/INDEX.md` と §2 の台帳列 |
| Direction変更の根拠 | `DECISIONS.md` D-001〜D-011 |
| Public Identity / brand | `DECISIONS.md` D-004 / `brand/` / `brand/BRAND_SPEC.md` |
| Web Marketing一次調査 | `direction/WEB_MARKETING_INTELLIGENCE_2026-08.md` / `research/INDEX.md` |
| Browser-Toy Route成果物契約 | `CONSTRAINTS_BROWSER_TOY_ROUTE.md` |
| factory workflow state | workflow id 322145639 = `disabled_manually`（2026-08-07 10:39 JST） |
| C0 provenance / F3 precursor | `config/champion-baseline.json` / `scripts/c0-provenance.mjs` / `scripts/control-plane-canary.mjs` |
| Daily Encounter Queue trigger設定 | private session state・**repo-unverified**（E-013が `VOID` である理由） |

本文を更新したら `Observed at` と `Base SHA` を同時に更新する。**過去値は本文へ残さず、git historyへ任せる**（D-011）。
