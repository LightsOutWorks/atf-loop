# Factory Journal

Factoryの能力が増えた理由だけを記録する学習台帳。ログでもIssue Trackerでもない。

IOS（原則）/ Factory（能力）/ Journal（証拠）/ Implementation（実装）の4層のうち、Journalは証拠の層にあたる。原則はほとんど変わらず、実装は常に変わり、証拠だけが積み上がる。

OSを改正する日は、Journalに十分な証拠が積み上がった日になる。

---

## Rules

**Rule #1**

Never classify failures by symptoms.
Always classify failures by root cause.

失敗は症状では分類しない。原因で分類する。「初回スコア0」は症状であり、原因は習熟不足・UI・バグ・難易度・入力系のいずれでもありうる。Verificationは原因に対して作る。エントリはPRや成果物の単位ではなく、根本原因の単位で切る。

**Rule #2**

Nothing is permanent.
Every capability must justify its existence with evidence.

能力も永久ではない。すべての能力は、存在価値を証拠で証明し続ける。これはControlだけでなくVerificationにも適用する。

---

## Entry format

| Field | 内容 |
|---|---|
| Status | Observed / Investigating / Verified / Implemented / Validated / Closed |
| Observation | 何が観測されたか。誰が観測したか |
| Root Cause | 症状ではなく原因。未確定なら未確定と書く |
| Capability Added | Factoryに何を足したか |
| Prediction | その能力が何を検出・防止すると予測するか |
| Result | 予測は当たったか。実際の証拠 |
| Decision | Permanent / Remove / Revise |

エントリはObservationの時点で開く。Root Causeが未確定でも開いてよい。診断できなかった失敗こそ観測能力の穴を示すため、「記録しない」という選択は取らない。

Verification Dividendは4段階を要する。Failure → Observation → Verification → Capability。観測されない失敗は配当を生まない。

---

## 0001 — seed-009 TETHER LOCK: pointer input can never start a hold

**Status**: Implemented

### Observation

2026-08-02。公開済みの seed-009 TETHER LOCK が、何度プレイしてもスコア0のまま終わる。

終了画面: `SIGNAL LOST / 0 pt / LOCKED 0 / LOST 66 / RELEASED 0`

ドリフターは66体流れており、進行そのものは動いている。LOCKEDとRELEASEDという別々のカウンタが両方ゼロ。

観測者はFounder。自動検証は一切これを検出していない。初期にはFounder自身が「操作が分からない」「習熟不足」として処理しかけており、配当は一歩手前で失われるところだった。

### Root Cause

`holding = true` にする `beginHold(t)` の呼び出しが2箇所しかなく、両方とも通常の操作からは到達できない。

1. `handleAim()` 内の呼び出しは `if (!holding) { engagedId = ...; return; }` に阻まれ、`holding` が既に `true` でないと到達しない。進行中のホールドの対象変更しかできず、開始できない。
2. `confirmDown()` は `keydown` の Space/Enter からのみ呼ばれる。

よってポインタ入力（マウス・タッチ共通）では一度もロックを開始できず、物理キーボードだけが機能する。`cancelHold()` も `if (!holding) return` で無音の no-op になるため RELEASED も 0。LOST だけ増えるのは、期限切れ判定が入力と独立に走るため。

タッチ固有でもiOS固有でもない。`touchstart`/`touchmove` は存在せず Pointer Events に統一されており、`pointerType` による分岐もない。`passive` / `preventDefault` / `touch-action` の設定はいずれも正常。

### なぜ既存の検証が捕まえなかったか

- `smoke.mjs` は構造を見る。6/6 PASS。
- ゲートは内容を見る。PASS。
- どちらも「宣伝した操作が、宣伝した結果を生むか」を見ていない。
- `eval-min` は静的採点のため、到達不能なコードパスの深さを実装済みの深さとして高く採点する。

これは作品の失敗ではなく、Verification Capabilityの不足である。現行の検証能力では、この種類の欠陥を原理的に検出できない。1件で足りる理由は頻度ではなく、非検出性がこの1件で証明されるため。

### Capability Added

⑧ Interaction Smoke v1（Contract Verification）— PR #14

- 生成契約に **Interaction Contract（Player Promise）** を追加。作品が `primary_input` と `success_condition` を宣言し、述語 `window.__GAME__.checkSuccess()` を実行時に公開する。Contractはタイトル画面がプレイヤーへ提示している約束から導出する。UIが先であり、作品が自由に決めてよいものではない。
- 述語は、プレイヤーが画面で見ている状態から判定すること。入力ハンドラが立てるフラグを読むだけの実装にしない。
- Playwright 1本で、宣言された入力を実際のポインタイベントで駆動し、述語を呼ぶ。フレームワーク化しない。
- `factory.yml` では smoke の直後・ゲートの前に実行する。遊べないものをゲートへ送る意味がないため。
- 契約の宣言が無い・壊れている・述語が公開されていない場合はすべて fail-closed で停止する。スキップ分岐は存在しない。
- 既存作品への遡及なし。パイプライン内の新作のみが対象。

UI ↔ Contract の整合性検証は追加しない。自己満足契約が実際に確認された時点で、Layer2へ追加する。証拠が無い段階での検査追加はEvidence over Fearに反する。

**実装検証**: 未改変の seed-009 ロジックに対し、実 `lockedCount` を読む `checkSuccess()` のみを追加した状態で25秒の実ポインタ駆動を行い、正しく fail closed することを確認した（PR #14）。これは実装が正しく動くことの証拠であり、能力が有効であることの証拠ではない。

### Prediction

Interaction Smoke v1 は、「作品が宣伝している主要操作が、宣伝している状態変化を生まない」種類の欠陥を、公開前に検出する。本件と同型の欠陥であれば確実に fail する。

### Result

保留。run #17 / run #18 の2回のカナリアで正常に起動し、いずれも PASS した。**検出件数は0件。** 予測はまだ試されていない——この検査は一度も作品の欠陥を捕まえていない。カナリアが通ったことは検査が動く証拠であって、検査が効く証拠ではない。

検出しないまま数ヶ月経過した場合、それも結果として記録し、Rule #2 に従って Remove を検討する。

### Decision

保留。Result確定後に Permanent / Remove / Revise を決める。

### 付記: seed-009は修正しない

Factory史上最初のVerification Failureとして公開履歴に残す。消すと、この能力追加の根拠になった唯一の実物が消える。作品としては失敗だが、Factoryとしては能力を1段上げた失敗である。

---

## 0002 — Interaction Smoke: NODE_PATH does not apply to ESM import

**Status**: Closed

### Observation

2026-08-02、run #16（dry_run canary）。Interaction Smoke の初の実runが32分23秒で失敗。

ブラウザ準備ステップは26秒で成功、生成は12分47秒で成功、`smoke.mjs` は①〜⑥すべてOKで PASS (6/6)。その直後に `interaction-smoke.mjs` が停止。

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'playwright'
imported from .../scripts/interaction-smoke.mjs
Did you mean to import "playwright/index.js"?
```

修正ループ上限3回を使い切って exit 1。ゲート・目録生成・公開はすべてスキップされ、fail-closed は正しく機能した。

### Root Cause

`NODE_PATH` は ESM の `import` には一切適用されず、CommonJS の `require()` の解決アルゴリズムにしか効かない。`npm install --prefix "$PW_DIR" playwright` でパッケージは配置されていたが、静的 `import` からは見えなかった。

ブラウザのバイナリ取得は成功していた。壊れていたのはパッケージ解決だけ。

### Capability Added

依存配線の修復 — PR #15

- `import { chromium } from 'playwright'` を `createRequire(import.meta.url)('playwright')` に置き換え。`NODE_PATH` を参照する解決アルゴリズムへ切り替える。
- `playwright@1.62.1` に版数を固定。床凍結の対象を1つ増やす。
- 実際に解決された版数をログに出力する行を追加（`claude` / `codex` と同形式）。

版数 1.62.1 は失敗run自体のログからは取得できず（`added 2 packages in 1s` のみ）、同日の手元の2回のインストールで確認した値である。実runのログから直接抽出したものではない。

### Prediction

`createRequire` への切り替えにより、`interaction-smoke.mjs` は `playwright` を解決でき、実runで起動する。

### Result

**確認済み。** run #17（2026-08-02、11分21秒）で全ステップ緑。ログに `playwright: Version 1.62.1` が出力され、固定した版数と一致（初の実測）。`interaction-smoke.mjs` は起動し、`primary_input="hold"` で `success_condition="docked_3"` を確認して PASS。

### Decision

**Permanent.** 依存解決は修復され、版数固定により再発しない。実版数がログに残るようになったため、以後は実測で確認できる。

---

## 0003 — 検証ループが「作品の失敗」と「検査が実行できなかった」を区別できない

**Status**: Observed

### Observation

2026-08-02、run #16 の失敗時。`interaction-smoke.mjs` が `ERR_MODULE_NOT_FOUND` で停止したとき、パイプラインはそれを「作品が検査に落ちた」として扱い、生成担当に対して修正ループを3回回した。18分55秒が消費された。

渡されたのは `node_modules` の解決エラーであり、生成担当の権限では原理的に修正できない。

### Root Cause

検証ステップは終了コードの非ゼロを一律に「作品の不合格」と解釈しており、「検査そのものが実行できなかった」という状態を表現する手段を持たない。両者は本来まったく異なる対応を要する——前者は作品を直す、後者は即座に停止して人間に返す。

これは既存の運用ルールにある異常3区分（故障 / 運用イベント / KNOWN WARNING）と同じ種類の区別だが、新設した検査はその分類を通っていない。

### Capability Added

なし。今回は依存の配線のみを修正した（0002）。

### Prediction

（未記入。対応していないため）

### Result

（未記入）

### Decision

保留。現時点では重大な実害がないため対応しない——カナリアでも本番runでも fail-closed により公開へ到達せず、失われるのはその週の作品1本と時間のみ。

なお、当初「作品が3回書き換えられた」と記録したが誤り。失敗runのログでは、修正エージェント自身が同じ根本原因を独立に特定したうえで「根本解決には `scripts/` やリポジトリ直下への `node_modules` 追加が必要だが、禁止事項に該当するため実施不可能」と正しく判断し、WORK_DIR側での誤魔化し修正をしていない。**禁止事項は圧力下で保持された。** 浪費されたのは時間であって作品ではない。

同じ形が2件目として観測された時点で、「検査が実行できなかった」を別の終了コードにして修正ループへ入れない、という対応を検討する。検証を増やすほど検査側の故障面は増えるため、いずれ必ず来る。

---

## 0004 — success_condition が勝利条件の粒度で書かれる

**Status**: Implemented

### Observation

2026-08-02。Interaction Contract を宣言した最初期の2作が、いずれも `success_condition` を「3個」の粒度で書いていた。

- run #16 の作品: `primary_input="tap"` / `success_condition="chain_streak_3"`
- run #17 の作品: `primary_input="hold"` / `success_condition="docked_3"`

前者は修正エージェントの診断用ハーネス上で、25秒の検証時間内に3連続成功へ到達できないケースが観測された。後者は通ったが、運の差でしかない。

**正常な作品が偶然で落ちうる。**

### Root Cause

Interaction Contract の定義は「主要操作が主要な**状態変化**を生む」であり、勝利条件ではない。生成側がこの定義から逸れて、ゲームの到達目標を `success_condition` に書いていた。

配線が生きていることの証明には1回の状態変化で足りる。3回にすると、検証が配線の確認ではなく技能テストになる。時間予算を延ばせば症状は消えるが、原因は残る。

### Capability Added

生成契約への定義明確化1行 — PR #16

`success_condition` は「主要操作が引き起こす最小の観測可能な状態変化」を指し、ゲームの勝利条件や到達目標（3個そろえる・3連続する等）ではない。

新しい制御ではなく、既存の定義の明確化である。

### Prediction

以後に生成される作品は、`success_condition` を最小粒度（`_1` 相当）で宣言する。検証の実行時間は短縮され、正常な作品が偶然で落ちる確率は下がる。

### Result

**1例確認。** run #18（2026-08-02、9分27秒）の作品は `success_condition="node_energized_1"` を宣言。`_3` ではなく `_1`。

検証ステップの所要時間は run #17 の14秒から2秒へ短縮。これは「起動していない」のではなく「1回の状態変化で即座に成功して抜けた」ことを示す。`interaction-smoke.mjs` 自身の PASS 行が一次証拠。

### Decision

保留。1例のみ。複数作にわたって最小粒度が維持されることを確認してから Permanent とする。
