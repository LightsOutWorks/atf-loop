```json atf-control-state-v1
{
  "schema": "atf.control-state/1",
  "base_sha": "2420fae05435c84602efbaaae5de83457f36311e",
  "gates": [
    {
      "id": "F0",
      "status": "PASS",
      "evidence": [
        "PR #22 merged as merge commit 6bef0f7e001d6ecebddcea4f9904b9dc47cc0343; OS.md blob a6e207202f78a00029b75f33a82f7005e671d429 on main; SHA-256 match with approved source recorded in CURRENT_STATE.md section 11"
      ]
    },
    {
      "id": "F1",
      "status": "PASS",
      "evidence": [
        "CURRENT_STATE.md on main at 2420fae05435c84602efbaaae5de83457f36311e (blob a92c9643cea1fcec8cca9d113e55f872b1a4f452) with observed_at, base SHA, evidence scope, implemented/unproven separation, single bottleneck and smallest next gate"
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
        "PR #25 merged: F3 precursor reader scripts/control-plane-canary.mjs, its deterministic tests and .github/workflows/evolution-control-plane-canary.yml are on main; semantic ranking per OS criteria and F3 PASS are not yet proven"
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

Canonical routing note: The JSON block above is the sole current source for gate status, base revision, and dependency routing. The unchanged human-readable body below is a historical snapshot observed at main@6bef0f7e001d6ecebddcea4f9904b9dc47cc0343, retained as F1 provenance and not as a second current state. Until it is refreshed after the first main runtime canary, its Observed at, Base SHA, capability status, bottleneck, Smallest Next Gate, Evidence Index, and update instruction MUST NOT be used for current routing.

# Current State

Status: **OBSERVED SNAPSHOT — not a target, not a promise**  
Observed at: **2026-08-05 JST**  
Default branch: `main`  
Base SHA: `6bef0f7e001d6ecebddcea4f9904b9dc47cc0343`  
Evidence scope: **the default branch at the SHA above; repo-external policy or Pending items are labeled explicitly**

この文書は、Factory が「今できること」と「まだできないこと」を区別するための現在地である。

- `OS.md` は Should（何を目指し、どう判断するか）を持つ。
- `CURRENT_STATE.md` は Is（何が証明済みか）だけを持つ。
- `ROADMAP.md` は Next / Target（次に何を証明し、最終的に何になるか）を持つ。
- `JOURNAL.md` は Why / History（能力が変わった理由と結果）を持つ。

会話、予定、提案を実装済みの事実として書かない。確認できないことは `UNKNOWN` とする。

---

## 1. Summary

Lights Out Factory は、単一HTMLのブラウザトイを生成し、機械検証と独立ゲートを通し、GitHub Pagesへ公開するProduction Loopを持つ。監査時点でSEED 001〜024がmainにある。

一方、世界への到達、プレイ開始、継続・再プレイ等のProduct Engagementをリポへ取り込み、その信号で作品選定や能力構成を更新する閉ループはまだない。高価な外部モデル・ツール・ハーネスを継続比較し、能力別Championを自動更新する仕組みもまだない。

したがって現在のFactoryは、**生産と公開は自動化されているが、世界学習と能力構成の自己進化は未接続**である。

---

## 2. Capability Map

| Capability | Current implementation | Evidence status | Main gap |
|---|---|---|---|
| Generation | Claude Code CLIが候補生成、類似統合、採点、上位比較、1案実装を行う | Implemented | 実効model ID、reasoning、prompt/context構成のprovenanceがない |
| Selection | C1〜C7採点と上位3案比較、1案選定 | Implemented but not reliably auditable | Selection Record v1は自由文と数値の整合を検証せず、phase2で消えた候補の経路も再構成不能 |
| Verification | 固定Smoke、Playwright Interaction Smoke、Codexの独立content gate、integrity check | Implemented with known limits | 新しい実欠陥の検出実績、検査基盤失敗の分類、公開後到達確認が不足 |
| Distribution | mainへのpushとGitHub Pagesのカタログ公開 | Publication implemented | Reach、attributable play start、Product Engagement、チャンネル比較が未実装 |
| Learning | `JOURNAL.md`に能力変化を記録 | Internal capability log implemented | 世界信号と外部Capability Radarを使うChampion/Challenger更新が未実装 |

この表の能力名はIOS Layer2の現行仮説であり、将来固定ではない。

---

## 3. Production Loop — Implemented

Source: `.github/workflows/factory.yml` at blob `49314d2d531704485064fa1995922f19b8418870`.

1. `workflow_dispatch` または土曜10:00 JSTのscheduleで起動する。
2. `concurrency: factory` により通常runを直列化する。
3. Claude Codeが既存作品を読み、候補を生成・統合・採点し、1案だけ実装する。
4. `index.html`、`devlog.md`、`funnel.json`、`meta.json`を出力する。
5. 固定6項目の`smoke.mjs`を実行する。
6. Playwright Interaction Smokeが実ポインタ入力を使って主要インタラクションを検証する。
7. 不合格時、生成側による修正を最大3回行う。
8. 対象作品外の変更をintegrity checkで拒否する。
9. Codex CLIをread-only sandboxで一度だけ走らせ、先頭行が完全一致`PUBLISH`の場合だけ通す。判定不能・認証失敗もfail-closedで停止する。
10. metaからカタログを再生成し、作品とカタログをcommitしてmainへpushする。
11. `dry_run=true`ではローカルcommitまで進み、pushしない。
12. run artifactを保存する。

Pinned harness versions observed:

- Claude Code `2.1.220`
- Codex CLI `0.146.0`
- Playwright `1.62.1`

Not recorded:

- effective model ID and revision
- reasoning effort / inference configuration
- resolved prompt and context schema version
- provider-side routing or fallback
- per-capability cost and latency

この欠落により、モデルや構成を変更しても同条件比較のbaselineを再構成できない。

---

## 4. Published Output

Catalog: `index.html` at blob `babcae3a7308fe3042af3f4b8ff967c69896aba8`.

- SEED 001〜024の24作品を列挙する。
- 最新はSEED 024 — RING RUNNER。
- 現行制約は単一HTML、約60秒、1画面、英語UI、PC+mobile、外部通信・外部素材なし等。
- これらは現行Implementation / Soft Boundaryであり、永久原則ではない。

Current public site publication is evidence that the Pages path has worked. It is not evidence that every future push has reached Pages correctly.

---

## 5. Verification — Proven Scope and Gaps

### Proven

- 静的Smokeが固定6項目を実行できる。
- Interaction Smokeはrun #17〜#20で起動し、検証経路を完走した。
- Codex gateは生成担当とは別系統でfail-closed判定する。
- integrity checkは対象外変更を停止する。
- 改名後の`dry_run`カナリア factory #22は、公開直前まで完走し、mainを変更しなかった。

### Not yet proven

- Interaction Smokeが導入後の新作で実欠陥を実際に捕捉した実績は0件。検査が動くことは確認済みだが、予測した欠陥検出能力は未証明。
- Interaction Smokeは既存作に遡及適用されない。
- push後にPages URLのHTTP 200、新作掲載、実プレイ到達を確認するstepがない。
- 作品不合格と検査基盤の実行不能を同じ非0終了として扱うため、後者でも生成修正ループへ入る。
- content gateの直接対象は`index.html`であり、`funnel.json`の数値と採用理由の矛盾は検証しない。

---

## 6. Known Failures and Record Debt

### SEED 009 — TETHER LOCK

pointer入力でhold開始不能のまま公開されている。修正せず、Verification Failureの証拠として保存している。

### Selection Record v1

seed-011では1位同点にもかかわらず、存在しないC1/C4/C6差を採用理由として記述した。Selection Record v2と決定論validatorは未実装。

現行`funnel.json`はphase2生存候補を記録するが、統合・削除された候補と`merged_into`を保存しないため、phase2の判断経路を再構成できない。

### JOURNAL 0005 / 0007

mainには確定済みの訂正が未反映である。PR #18は、生存候補のscoreを追加すると同時に、phase2で消えた候補のtitle/descriptionを記録対象から除いた。0005のCapabilityを`Added`、変更を観測の純増とする記述は不正確で、正しくは`Modified`。0007も、phase2 dispositionの従来からの欠落と、PR #18で発生した候補内容の消失を分離して記録する必要がある。

訂正文はSelection Record v2変更へ相乗りする方針だが、監査時点でそのPRは存在しない。

---

## 7. World Signal and Distribution

`eval.json` at blob `5ccf159975aecc74ca60b7813ce5e144b23c58dd` contains:

- seed-001〜009の9作のみ
- 9作すべて`world: null`
- seed-010〜024は行自体がない

GitHub Pagesへのpublicationはある。しかしdefault branchには次がない。

- `signals.json`
- `.github/workflows/distribution.yml`
- attributable play-start measurement
- distribution signalとproduct engagementの分離保存
- world feedbackをSelection / Generationへ還流する実装
- sufficient world feedbackの具体的閾値

X等での外部活動は存在しても、リポの学習信号として統合されていない限り、FactoryのProduct Learningとはみなさない。impression/viewはDistributionの信号であり、作品価値の証拠とはみなさない。

---

## 8. Capability Evolution

Implemented:

- `JOURNAL.md`によるCapability Evolution Log
- 生成と独立ゲートの分離
- 失敗を残し、次の検証能力へ変える運用

Not implemented:

- effective configuration provenance
- ATF固有の代表タスクbenchmark
- External Model / Tool / Harness Radar
- capability別Champion / Challenger
- 同一base・同一contractでのbounded configuration canary
- 構成の自動adopt / rollback
- `OS.md`、`CURRENT_STATE.md`、`ROADMAP.md`をrun開始時に読み、最小の未通過gateを自律起票する仕組み

Arena系、人間選好ランキング、Artificial Analysis、vendor release等は候補発見のpriorとして利用できるが、ATFでの採用証拠にはまだ接続されていない。

---

## 9. Observed Operating Policy — Pending Repository Codification

Source: `ATF再設計裁定v2 2026-08-04.md`; not present on the default branch at the Base SHA above. This section records the currently agreed operating policy, not a default-branch implementation fact.

### Current, but not permanent

- Factory/OS変更はPRを作り、ヒロがmergeする。
- identity、credentials、Secrets、cost、kill switchはヒロが管理する。
- 週1 cadence。
- 単一HTML、約60秒、作品構造、表現制約。
- GitHubを唯一の正本とhandoffにし、会話やコンテナを状態バスにしない。

通常の作品runは、Verificationを通れば人手なしでmainへ直接pushする。Factory変更のhuman mergeもIOS上の永久Hard Boundaryではなく、高水準のVerificationによって退役可能な暫定能力契約である。

### Canonical Hard Boundaries in OS.md

- 人間の尊厳
- 法令
- 第三者の権利
- 重大な実害

---

## 10. Current Bottleneck

現在、default branchで確認できる最大の能力欠落は、**世界価値を観測し、作品選定と能力構成へ戻すための、健全で帰属可能な信号がないこと**である。

ただし、これがProduction成果の律速であることは未証明であり、律速候補はGeneration / Distribution / Feedbackのままである。agent間通信を律速とするリポ証拠もない。

生産量を増やせば学習速度が比例して上がる証拠もない。新しいorchestrator、A2A、会話relayを先に足す根拠は現在のdefault branchにはない。

---

## 11. Canonical OS and Pending Changes

### OS.md — Canonical on main

- PR: https://github.com/LightsOutWorks/atf-loop/pull/22
- State at observation: closed / merged
- Merge commit: `6bef0f7e001d6ecebddcea4f9904b9dc47cc0343`
- Head: `5f7e561bb95567236397628e050f6402e4b4bff5`
- Diff: `OS.md`のみ、243行追加
- main blob: `a6e207202f78a00029b75f33a82f7005e671d429`
- uploaded source, PR copy, and merged main content SHA-256: `1de1d9620fab4ceace056b5bdd635ee5276e3a5cf96a721419080f98a7acc0ab`

Mainのblob SHAはPR headのblob SHAと一致する。PR headはアップロード原本とのSHA-256一致を事前検証済みであり、OS正本化F0はPASS。

### Selection Record v2

仕様と訂正文は会話上で確定しているが、default branchにもopen PRにも実装は確認できない。

---

## 12. Smallest Next Gate

**W0 — Comparable distribution canary.**

Xとitch.io等の候補を主経路と決める前に、同時期・同素材・等価指標・事前登録した`VOID`条件で手動比較する。impressionsとviewsを直接比較せず、同じ段階を測る共通指標だけを使う。

C0（configuration provenance）とF3（3文書をruntimeが読むcanary）は、W0をblockせずProduction Loopを変更しない場合に限り独立laneとして候補になる。1 runで選ぶgateはGoal Firstの選択規則により1件だけとする。

現時点で、工場本体を変更することはこのgateに含まれない。

---

## 13. Evidence Index

| Evidence | Revision |
|---|---|
| default branch snapshot | `6bef0f7e001d6ecebddcea4f9904b9dc47cc0343` |
| canonical `OS.md` | blob `a6e207202f78a00029b75f33a82f7005e671d429`; PR #22; merge `6bef0f7e001d6ecebddcea4f9904b9dc47cc0343` |
| `.github/workflows/factory.yml` | blob `49314d2d531704485064fa1995922f19b8418870` |
| `index.html` catalog | blob `babcae3a7308fe3042af3f4b8ff967c69896aba8` |
| `CONSTRAINTS.md` | blob `b4ab85cfe1f5babbd6256ef02bd2f72098abcd1e` |
| `JOURNAL.md` | blob `4d6327a9271d25b67c9faf7c48237e5e17a6ec8f` |
| `eval.json` | blob `5ccf159975aecc74ca60b7813ce5e144b23c58dd` |
| seed-011 `funnel.json` | blob `56afd4ff8f085761a3e5889e75be7975f853e485` |
| PR #18 | commit `1620e4bc58a583e9ef1b1f4ded546397adb83d3d` |

When this file is updated, `Observed at`, `Base SHA`, affected evidence revisions, bottleneck, and smallest next gate must be updated together.
