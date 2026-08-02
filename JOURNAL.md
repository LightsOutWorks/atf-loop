# Factory Journal

Factoryの能力が進化した理由だけを記録する Capability Evolution Log。ログでもIssue Trackerでもない。

対象は **Capability Added / Capability Modified / Capability Removed** の3つで、失敗発とは限らない。

Journalの主語は作品ではなく Factory である。読めば「Factoryがどう進化したか」だけが分かる。

IOS（原則）/ Factory（能力）/ Journal（証拠）/ Implementation（実装）の4層のうち、Journalは証拠の層にあたる。原則はほとんど変わらず、実装は常に変わり、証拠だけが積み上がる。

OSを改正する日は、Journalに十分な証拠が積み上がった日になる。

---

## Rules

**Rule #1**

Never classify observations by symptoms.
Always classify them by root cause.

観測は症状では分類しない。原因で分類する。「初回スコア0」は症状であり、原因は習熟不足・UI・バグ・難易度・入力系のいずれでもありうる。Verificationは原因に対して作る。エントリはPRや成果物の単位ではなく、根本原因の単位で切る。

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
| Root Cause | 症状ではなく原因。未確定なら未確定と書く。失敗でなくても原因はある（例: Missing Capability） |
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

保留。run #17 / #18 / #20 の3回のカナリアと run #19 の本番runで正常に起動し、いずれも PASS した。**検出件数は0件。** 予測はまだ試されていない——この検査は一度も作品の欠陥を捕まえていない。カナリアが通ったことは検査が動く証拠であって、検査が効く証拠ではない。

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

**Status**: Validated

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

**2例確認。** run #18（カナリア）の作品は `success_condition="node_energized_1"`、run #19（本番公開・seed-010 PRISM SPLIT）の作品は `success_condition="prism_resolved_1"`。いずれも `_3` ではなく `_1`。カナリアと本番の両方で最小粒度が維持された。

検証ステップの所要時間は run #17 の14秒から2秒へ、さらに run #20 では1秒へ短縮。これは「起動していない」のではなく「1回の状態変化で即座に成功して抜けた」ことを示す。`interaction-smoke.mjs` 自身の PASS 行が一次証拠。

### Decision

**Permanent.** カナリアと本番の2例で最小粒度が維持された。定義の明確化は生成側へ届いている。Rule #2 により永久ではなく、`_3` 相当の粒度が再び現れた時点で再開する。

---

## 0005 — 採点項目ごとの散らばりの差が、等重み合計で意図しない優先順位を作る

**Status**: Observed

### Observation

seed-008 と seed-010 の funnel.json では、決勝3件の C1〜C7 がほとんど横並びだった。seed-010 では7項目中5項目が3候補とも同点で、2位と3位はスコアベクトルが完全に一致しており、順序に根拠が存在しなかった。

当初これを「採点基準が候補を切り分けていないのではないか」と疑ったが、記録仕様が決勝3件のスコアしか残さないため、12→3 の段階で何が起きたかを確かめる手段がなかった。

PR #18 で12案全部のスコアを記録するようにし、run #20（seed-011）で初めてそのデータが得られた。

### Root Cause

2つ判明した。

**1つ目 — C1 は正しく機能している。** 12案の段階で C1 は {2,3,4} を使い分けており、TUG ANCHOR（既存の seed-009 TETHER LOCK に近い弾性テザー機構）と COLOR MIX（色の識別系）にそれぞれ 2 を付けていた。決勝で C1 が横並びになるのは、C1 で高得点だった候補が決勝に残るという選抜の当然の帰結であって、基準の不全ではない。当初の疑いは症状に基づく誤った分類だった。

**2つ目 — こちらが本体。項目ごとに散らばりが大きく違う。**

- C7（習熟後に新しい戦略が現れそうか）: 12件中10件が 3。4 が1件、2 が1件。ほとんど差が付かない
- C4（現行制約内で安定実装）: 4 が4件、3 が5件、2 が3件。広く散る

7項目を等重みで合計すると、散らばりの大きい C4 の影響力が、散らばらない C7 を大きく上回る。誰も重み付けを決めていないにもかかわらず、ファネルは構造的に実装容易性を深さより優先する。

実例: C7 で唯一 4 を取った GRAVITY LASSO は C4=2 で脱落し、採用された MASS BALANCE は C7=3。深さで最高評価の候補が、実装しやすさで落とされている。

これは以前から傾向としてのみ記録されていた「単純化ドリフト — 野心への選択圧の欠如」の機構が、初めて数値として可視化されたものである。

### Capability Added

funnel.json の candidates にフェーズ3の C1〜C7 スコアを記録する — PR #18

制御でも判断でもなく、観測の追加。ファネルは既に全候補を採点しており記録から落としていただけなので、追加コストはゼロだった。

### Prediction

以後の run でも、C7 の散らばりが C4 より小さい傾向が続く。続く場合、等重み合計は実装容易性を深さより優先し続ける。

### Result

1サンプル（run #20 / seed-011）。

### Decision

保留。対応しない。1サンプルでは重みの調整も C7 の定義変更も根拠が足りない。2件目で同じ非対称が出た時点で、どちらを触るかを議論する。

### 付記

- スコアの実際の使用域は {2,3,4} で、0 と 1 は12案42スコアの中に一度も出ていない
- ECHO PING は seed-008 と seed-011 の両方で候補に出現し、C7 が 4→3 に変わっている（同名候補の再生成とスコアの揺れ）
- 本エントリは Rule #1 の実例でもある。当初「基準が切り分けていない」という症状で開いたが、観測を増やした結果、原因は「基準は切り分けている。ただし項目ごとの散らばりが違うため、等重み合計が意図しない優先順位を作っている」だった。症状で分類していたら、C1 の定義を誤って変更していた
- seed-011 側の数値は、カナリアの artifact を Founder が手元でダウンロードした経路で読んでいる。0002 や 0004 のようなジョブログからの独立検証より一段弱い来歴である。8/8 の本番runでmainに載った時点で独立に確認する

---

## 0006 — Distribution: 世界へ届かせる能力と、世界から受信する能力

**Status**: Observed

### Observation

Factory は毎週作品を生成し公開しているが、そこへ人が来る経路が一本もない。ループは Create → Publish → End で閉じており、Observe World → Learn → Improve の矢印が存在しない。

これは疑義リスト第1号として当初から記録されていた。他の保留項目（モデル更新、Objective移譲、CONSTRAINTS拡張）は待っていれば条件が揃うが、Distribution だけは自分から作らない限り永遠に始まらない。Waiting ではなく Blocked。

### Root Cause

**Missing Capability — No Distribution capability exists.**

Distribution 能力が存在しない。失敗ではないが、原因はある。

### Capability Added

Distribution v0 — 2部品で1能力。片方だけでは能力として成立しない。

- **Reach**: 週次 run の作品を X（ATF 専用アカウント）へ投稿する。当面は手動。投稿の中身は新作の告知ではなく、その週にファネルが検討した候補と、捨てた理由と、選んだ理由。funnel.json がそのまま素材になる。
- **Intake**: 目録側に投票を置く。結果画面直後の一問「また遊びたい?」3択1タップ。作品は外部通信ゼロが不変制約のため、投票 UI は作品ではなく目録に置く。

自動化はしない。理由はコストではなく知識不足で、「何を書くと世界が反応するか」がまだ分かっていない。形が固まる前に自動化すると、作った直後に書き直すことになる。**Observe → Learn → Automate** の順を守る。

順序: X開始 → 試行 → 深い投稿 → Intake完成。守る制約は「深い投稿の前に Intake が存在すること」だけ。観客ゼロの段階では取りこぼす反応も存在しないため、Intake を最優先にする必要はない。ただし初めてまとまった人数が来る可能性のある一手の前には必ず存在していなければならない。

X の選択自体は Layer3 で交換可能。Layer2 の能力は Distribution であって X ではない。

### Prediction

Intake が稼働し、世界信号が蓄積し始める。十分な量に到達した時点で §13 により Temporary Human Evaluation が自動退役し、World vs Rubric が成立する。

### Result

（未記入）

### Decision

（未記入）

### 付記

- X API は 2026年2月に無料枠が廃止され従量課金のみ。投稿作成 $0.015、URL を含む投稿 $0.20（2026年4月20日改定）。週1本のリンク付き投稿で月$1弱、Layer0 には当たらない。ただしリンク付き投稿を13倍で課金していること自体が、X が外部への送客を歓迎していない証拠であり、本文にリンクを入れずリプライに置くのが実務上の回避策になる
- 固定ポスト（**Factory Manifesto**）にはゲームではなく Factory を置く。毎週人間ゼロで1本作っていること、12案考えて11案捨てていること、壊れた作品を消さずに残してそこから検証能力を1つ増やしたこと、その台帳を公開していること。ゲームクリエイターは世界中にいるが、Factory を公開している人はほぼいない
- 本エントリは Journal 初の非失敗発エントリであり、Capability Evolution Log への再定義を必要とした最初のケースでもある
