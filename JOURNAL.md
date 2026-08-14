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
| Capability Change | Added / Modified / Removed / None のいずれかを明示し、Factoryに何を足した・変えた・外したか |
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

### Capability Change

**Added** — ⑧ Interaction Smoke v1（Contract Verification）— PR #14

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

### Capability Change

**Added** — 依存配線の修復 — PR #15

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

### Capability Change

**None** — 今回は依存の配線のみを修正した（0002）。

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

### Capability Change

**Added** — 生成契約への定義明確化1行 — PR #16

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

## 0005 — 決勝3件しかスコアが残らず、ファネルの採点挙動を観測できなかった

**Status**: Closed

### Observation

seed-008 と seed-010 の funnel.json では、決勝3件の C1〜C7 がほとんど横並びだった。seed-010 では7項目中5項目が3候補とも同点で、2位と3位はスコアベクトルが完全に一致しており、順序に根拠が存在しなかった。

当初これを「採点基準が候補を切り分けていないのではないか」と疑ったが、記録仕様が決勝3件のスコアしか残さないため、フェーズ2以降で何が起きたかを確かめる手段がなかった。

PR #18 でフェーズ2を生き残った候補全件のスコアを記録するようにし、run #20（seed-011 カナリア、生存12件）で初めてそのデータが得られた。run #21 で main に載った seed-011（生存11件）が2件目のサンプルになる。

### Root Cause

ファネルは生存候補を採点していたが、上位3件以外のスコアを記録から捨てていたため、採点挙動を観測できなかった。

「基準が候補を切り分けていない」は症状に基づく誤った分類であり、原因は基準側ではなく記録側にあった。

### Capability Change

**Added** — funnel.json の candidates に、フェーズ2の統合・削除を生き残った候補全件のフェーズ3 C1〜C7 スコアを記録する — PR #18

制御でも判断でもなく、観測の追加。ファネルは既に全候補を採点しており記録から落としていただけなので、追加コストはゼロだった。

記録対象はフェーズ1の12案全部ではなく、フェーズ2の統合・削除を生き残った候補である。この区別は当初曖昧に書かれていた。

### Prediction

C7 の散らばりは継続して C4 より小さい。続く場合、等重み合計は実装容易性を深さより優先し続ける。

### Result

**Refuted。**

run #20 では C7 が横並び（生存12件中10件が 3）で C4 が {2,3,4} に散っていた。次の独立run（run #21 / main の seed-011）では関係が反転し、C4 が横並び（生存11件中10件が 3）で C7 が {2,3,4} に散った。「C4 が構造的に強く効く」は再現しなかった。

C1 では 1 も使用されており（PRESSURE VENT、GRID CASCADE）、スコアの使用域を {2,3,4} とした当初の推定も同時に反証された。

### Decision

記録能力は **Permanent**。この能力が、それ自身の生んだ仮説の誤りを1サンプル後に発見できたため。

重み・ルーブリック・C7 の定義は変更しない。撤回したのは仮説であって、基準ではない。

### 付記

- run #20 の C1 は生存12件の段階で {2,3,4} を使い分け、TUG ANCHOR（seed-009 TETHER LOCK に近い弾性テザー機構）と COLOR MIX（色の識別系）に 2 を付けていた。決勝で C1 が横並びになるのは、C1 で高得点だった候補が決勝に残るという選抜の当然の帰結である
- ECHO PING は seed-008 と seed-011 の両方で候補に出現し、C7 が 4→3 に変わっている（同名候補の再生成とスコアの揺れ）
- 本エントリは Rule #1 の実例を2度重ねている。1度目は「基準が切り分けていない」という症状で開き、原因が記録側にあると分かった。2度目は、増えた記録から読み取った「C4 優位」を原因として扱いかけ、2サンプル目で否定された。症状も、1サンプルから読んだ機構も、原因ではない
- run #20 の数値はカナリアの artifact を Founder が手元でダウンロードした経路で読んでおり、0002 や 0004 のようなジョブログからの独立検証より一段弱い来歴だった。run #21 の seed-011 は main に載っており、リポジトリから直接読める

---

## 0006 — Distribution: 世界へ届かせる能力と、世界から受信する能力

**Status**: Observed

### Observation

Factory は毎週作品を生成し公開しているが、そこへ人が来る経路が一本もない。ループは Create → Publish → End で閉じており、Observe World → Learn → Improve の矢印が存在しない。

これは疑義リスト第1号として当初から記録されていた。他の保留項目（モデル更新、Objective移譲、CONSTRAINTS拡張）は待っていれば条件が揃うが、Distribution だけは自分から作らない限り永遠に始まらない。Waiting ではなく Blocked。

### Root Cause

**Missing Capability — No Distribution capability exists.**

Distribution 能力が存在しない。失敗ではないが、原因はある。

### Capability Change

**Added** — Distribution v0 — 2部品で1能力。片方だけでは能力として成立しない。

- **Reach**: 週次 run の funnel.json に記録された候補群、最終候補3案、採用作を X（ATF 専用アカウント）へ投稿する。当面は手動。却下理由は現行スキーマに存在せず記録も禁止されているため扱わない。採用理由も、0007 の Selection Record v2 の整合性 validator が実装されるまでは外部向け素材に使わない——seed-011 でスコアと `reason` の自己矛盾が実証されており、validator 以前に外へ出すと Factory が根拠のない説明を公表することになる。投稿内容は、作品リンク、記録に残った候補数、最終候補名、採用作、および Factory の進化記録に限定する。
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
- 固定ポスト（**Factory Manifesto**）にはゲームではなく Factory を置く。毎週人間ゼロで1本作っていること、複数案を比較して1案だけ実装していること、壊れた作品を消さずに残してそこから検証能力を1つ増やしたこと、その台帳を公開していること。候補数と棄却数を具体的な数字で言うのは、0007 の Selection Record v2 でフェーズ1の12案の行方が残るようになってから。現行の公開記録はフェーズ2生存分しか持たないため、数字を立証できない。ゲームクリエイターは世界中にいるが、Factory を公開している人はほぼいない
- 本エントリは Journal 初の非失敗発エントリであり、Capability Evolution Log への再定義を必要とした最初のケースでもある

---

## 0007 — Selection Record が自身の証拠と矛盾し、フェーズ2の統合経路を保存していない

**Status**: Verified

### Observation

run #21 / main の seed-011 で、Selection Record が同点候補に対して、存在しないスコア差を選定理由として記録した。

TRIAGE PULSE と POLARITY FLIP は C1〜C7 が完全に一致する（4,3,4,3,3,4,4 / 合計25）。にもかかわらず `reason` は、採用した POLARITY FLIP が「implementation stability and feedback strength（C4/C6）で勝つ」「既存10作から最も構造的に離れている（C1）」と書いている。C4 は両方 3、C6 は両方 4、C1 は決勝3件すべて 4 であり、挙げられた3つの根拠はいずれも同一ファイル内のスコアで成立しない。

同時に、seed-011 の `candidates` は11件である。フェーズ1は12案を出す契約なので、1案がフェーズ2で統合・削除されたことになるが、それが何であったか、どの候補へ統合されたかは記録に残らない。1位が同点で決着した今回、消えた1案が採用候補の近縁だったかどうかを確認する手段がない。

### Root Cause

Selection Record が自由文中心で、数値根拠との整合確認がない。また、現行スキーマがフェーズ2で消えた候補を意図的に捨てている。

選定そのものは失敗していない。定性的な判断（全体トグル入力か、直接照準か）は妥当でありうる。破れているのは、その判断を数値の言葉で記述し、その数値が支えていない点である。

### Capability Change

**Modified** — Selection Record v2（未実装）

```
phase1_candidates:   12案すべて
  disposition:       survived / deleted / merged_into:<候補名>
survivors:           C1〜C7
finalists:           C1〜C7
selection:
  selected
  mode:              score / qualitative
  decisive_criteria
  reason
```

公開前に走る決定論 validator の確認項目:

- selected が finalists に存在する
- candidates と finalists の同名スコアが一致する
- 合計値を再計算できる
- decisive_criteria に書いた項目で、実際に selected が勝っている
- 数値で勝っていないなら `mode: qualitative` になっている
- フェーズ1の12案すべてに disposition がある

自由な選択は止めない。数値判断なのか定性的判断なのかを正直に記録させるだけである。同点は異常ではなく、同点時に人間へエスカレーションする機構は入れない。

生成契約とパイプラインに触れるため、実装PRはカナリア対象。

### Prediction

記録内の数値矛盾と、統合・削除による候補消失を、公開前に検出できる。

### Result

保留

### Decision

保留

### 付記

- WEEK 003 の評価軸を run #21 に当てた結果は以下。Factoryが選択した = PASS / 理由を記録した = PASS / 理由を後から照合できた = PASS / 理由が記録済みスコアと整合した = FAIL / フェーズ2を含む全選抜経路を再構成できた = FAIL。矛盾を検出できたのは照合が成立したからであり、「後から検証できない」ではない
- funnel.json は公開内容ゲートの判定対象外である（ゲートへ渡すのは index.html のみ）。この矛盾を公開前に捕まえる機構は、パイプラインに一つも存在しなかった
- seed-010 でも決勝2位と3位のスコアベクトルが完全一致していた（0005 Observation）。同点自体は既知である。新しいのは、同点が1位で起き、`reason` がそこに存在しないスコア差を書いた点である。この矛盾は決勝3件のスコアだけでも照合可能であり、0005 の能力追加がなくても検出できた。0005 の配当ではない

---

## 0008 — Factoryは視覚的成果物を作れるが、見て判定することができなかった

| Field | 内容 |
|---|---|
| Status | Implemented |
| Observation | 2026-08-09、公開Identityのシンボル確定にあたり2つの未決点（下段の光学的重量／内側の角丸量）が残った。いずれも「意見の交換」では収束せず、過去に同じ論点で作業が中断した履歴があった |
| Root Cause | **Missing Capability。** Factoryは視覚的成果物を*生成*できたが、*見て判定*することができなかった。判定は常にHumanの目へ委譲され、AI側は言語的な推測しか返せなかった |
| Capability Change | **Added** — Render → Visual Inspection → Decide のループ |

### Root Cause の位置づけ

これは **0001 TETHER LOCK と同じ根の別症状**である。

0001では、自動チェックが全PASSしたにもかかわらず、人間がマウス/タッチで遊ぶとスコア0だった。原因は「機械が見ていなかった」こと。当時これは*作品の*検証欠落として扱われたが、根はより広い——**Factoryは自分の出力を見られない**。

0001は作品側の症状、0008は設計成果物側の症状であり、原因は同一である。

### 実装

`/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` によりHTML/SVGをPNGへレンダリングし、画像として読み取って判定する。追加の依存・課金・permissionは不要（環境に既存）。

### 実際に判定へ変わったもの

| 論点 | 従来の解き方 | 今回の解き方 | 結果 |
|---|---|---|---|
| 下段の太さ | 「分割すると軽く見えるはず」（推測） | 360pxで並置レンダリング | 実際に浮いて見えた → **+4%** 採用 |
| 角丸量 | 「丸めすぎない」（言語的指示） | r=1.0/1.5/2.0/2.5 を同時レンダリング | 「静かな整形」の境界が1.5と2.0の間と特定 → **1.5** |
| 極小可読性 | 未検証 | 16/20/28/32px 実寸レンダリング | **角丸が切れ目を食って逆に読めなくなる**ことを発見。小サイズ専用版の仕様が確定 |
| アバター | 未検証 | 円形クロップ実測 | **白地はXの白TL上で輪郭が消える**ことを発見。設計時に想定していなかった |

下2件は**事前に予測されていなかった発見**である。見なければ出てこなかった。

### 限界（過大評価しない）

- **環境依存**: Chromiumが存在する実行環境でのみ成立する。Layer3の実装であってLayer1の能力ではない
- **フォントが限られる**: 幾何学サンセリフが1つも入っていないため、書体の判断はできない。実際に本件では書体決定を保留した（`brand/BRAND_SPEC.md` §5）。**見られない領域を「見た」と言わないことが本能力の運用条件**
- **「見える」ことと「Human Tasteに合う」ことは別**。判定の最終権はHumanに残る（§13 Temporary Human Evaluationは退役していない）

### Prediction

視覚的成果物（記事レイアウト・図・UI）について、Humanへ選択肢を投げる前にAI側で自己検証できる。Human Handoffが「A/B/Cどれが良いか」から「Bで確定・理由は実測」へ縮む。

### Result（部分的に観測済み）

本件では、HumanとEl（別AI）が独立にB案へ収束した後、残った2つの未決点をAIが実測で閉じた。**1往復で確定した。**過去に同じロゴ検討が中断した際は、判定材料が「どちらが良いと感じるか」しか無かった。

長期的な検証は未了。視覚判定が実際にHuman Handoff回数を減らすかは、複数案件の実測で判断する。

### 付記

- 本エントリはJournal 2件目の非失敗発エントリである
- Capability追加のトリガーはブランド作業だったが、能力自体はブランドに固有ではない。Route（ロゴ）とCapability（視覚判定）を混同しない

---

## 0009 — Factoryは同じ部品を毎回書き直しており、それを検出できなかった

| Field | 内容 |
|---|---|
| Status | Observed |
| Observation | 2026-08-14、Humanが提示した7本のゲームartifactをClaudeが直接取得し、保存HTML（計841,508 bytes）へ固定文字列検索を実行した。**題材に依存しない土台の部品が、7本すべてで独立に書かれていた**——コード生成音（WebAudio oscillator）7/7、safe-area対応 7/7。以下 localStorage安全ラッパ 5/7、viewport自己修復 5/7、ポインタ入力の統一 5/7、Canvas 2D 5/7、ノイズ音源 4/7、高DPI対応 4/7 と続く |
| Root Cause | **Missing Capability。** Factoryは作品を作る能力を持つが、**自分が既に作った部品を同定して次へ回す経路を持たない**。作品はrepo外（Human保持）にあり、repo側には「何を作ったか」の記録はあっても「何で作ったか」の記録が無かった。結果として、題材が変わるたびに同じ土台を書き直していた |
| Capability Change | **Added** — 部品の所在索引（`ops/COMPONENT_INDEX.md`）。**コードは持たず、所在（game_id）と重複本数だけを持つ** |
| Prediction | 次の作品を作るとき、索引を引いた部品は書き直されない。とくに 7/7 の2件（コード生成音・safe-area対応）は、次作で新規に書かれた時点で本能力の失敗として観測できる |
| Result | **未取得。** 次の作品が作られるまで判定しない |
| Decision | **保留**（Resultが出るまで。`OS.md` §11 Evidence Driven Governance: 証拠が無くなれば削除する） |

### なぜ「作品数」ではなく「重複本数」で測ったか

`experiments/desire-to-game/LEDGER.md` の Evolution Transfer Log が既に「作ったゲームの数を進化の証拠にしない」と定めている。本エントリはその同型で、**部品の総数ではなく、同じ部品が何本で書き直されたかを見る**。重複本数は「書き直しの実測」であり、在庫の自慢ではない。

### この能力が持たないもの（意図的に持たない）

- **部品コードそのもの**。作品本体はHuman保持・repo外の規律があり（Corpus 記録規律1）、索引は所在だけを持つ
- **共通ライブラリ**。抽出は「次に何を作るか」が決まり、その部品を実際に使う時に、その1つだけ行う。全部を先に整えない（HI-10 Non-goals: 将来拡張の先回り／不要な汎用化）
- **自動抽出script・カタログ生成・registry・schema**。反復がボトルネックとして実測されるまで作らない（`ROADMAP.md` §0 Premature Automation禁止）
- **再利用の実績記録**。それは Evolution Transfer Log の管轄であり、索引は在庫だけを持つ

### 0001・0008 との関係

0001（機械が遊べない）と0008（機械が見られない）は「**Factoryが自分の出力を扱えない**」の症状だった。0009はその第3の面である——**Factoryが自分の出力を部品として読み返せない**。3件とも根は同じで、出力が生成された瞬間にFactoryの視界から消えることにある。

### 限界（過大評価しない）

- **1回の実測にすぎない。** N=7、しかも同一期間・同一の作り手による作品群である。他の題材・他の時期で同じ重複が出るかは未検証
- **固定文字列検索であり、意味的な同一性は見ていない。** 同じAPIを使っていることは分かるが、実装が同じとは限らない（実際、決定論PRNGは mulberry32 と xorshift が併存する）。「同じ部品」と書いた粒度は**役割の一致**であって実装の一致ではない
- **索引があっても再利用されるとは限らない。** Predictionが外れた場合、本能力は Remove の候補である
