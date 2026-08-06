# W0 Native-Instrument Feasibility Precursor — 事前登録

Experiment ID: `W0-DIST-CANARY-001`
Classification: **W0 native-instrument feasibility precursor**(W0 本体の前段。**W0 本体ではない**)
Schema: `atf-w0-preregistration/1.2`
作成日時: **2026-08-05T04:58Z (UTC) / 2026-08-05 13:58 JST**
改訂: **Revision 3 — 2026-08-05T10:20Z (UTC)。EL 指示の反映。観測開始前・merge 前の改訂であり、観測結果はまだ一切存在しない**
状態: **PRECURSOR PREPARATION — HOLD**(§11 参照。実験は未開始)

この文書は、結果を観測する **前** に固定した事前登録である。

改訂履歴:

- Revision 1(head `5ab41f1659277396db58103c3329c4444a46ade4`): 初版。一次指標を referrer 別 page view としていた。
- Revision 2(head `24f4ce0cdedf02e0bd57d81f6ece495782c41d80`): EL 監査により一次指標を X View count / itch Impressions へ変更、観測窓をチャンネル別 7×24h へ一本化、itch 設定表・Boundary・決定論判定を追加。
- Revision 3(本版): EL 指示により **W0 本体から「native-instrument feasibility precursor」へ再分類**。2 計器の数値直接比較を禁止し記録専用へ、判定を PASS/VOID の fail-closed 二値へ、itch Impressions を「直近 1 週間のローリング値」へ訂正し取得許容差を明記、T_pub / T_idx の分離記録と index 期限を追加、Draft 段階の実数表示要求を撤回、itch 説明文への生成 AI 明記を追加、§7 根拠 URL を一次資料 4 件へ置換、公開前照合工程を追加。

---

## 1. 分類・目的・仮説

### 分類

本実験は **W0 native-instrument feasibility precursor** である。W0 本体(流入経路の比較・等価指標の確立・主経路の判断材料収集)は、本 precursor の後に別途設計する。**本実験は W0 本体の PASS を与えない。**

### 目的

W0 本体の問い(同一作品を X と itch.io へ出したとき、経路別の比較可能な観測が得られるか)へ進む **前段** として、各チャンネルの native 計器 —

- X: 当該投稿の **View count**
- itch.io: Project Analytics の **Impressions**

— が、固定した条件・固定した時刻の下で「**数値として取得でき、0 より大きい値を示す**」ことを確認する。計器そのものの成立性(feasibility)だけを検証する。

### 2 計器の関係(固定)

X View count と itch Impressions は **別々の計器** として記録する。定義・母集団・集計方式が異なるため、**数値の直接比較、比率・差の計算、勝者判定、主経路決定を行わない**。W0 本体で経路比較をどう設計するかは、本 precursor の結果(両計器の実挙動)を見て別途事前登録する。

### HYPOTHESIS-1(計測可能性仮説・唯一の仮説)

> X 投稿と itch.io project の Public 化を 15 分以内に行ったとき、X View count と itch Impressions の両方を、事前固定した取得時刻(§6)に数値として取得でき、かつ両方が 0 より大きい。

評価は §10 の決定論条件(PASS / VOID)でのみ行う。**UNKNOWN・部分取得・判定不能を PASS にしない(fail-closed)。**

### 副次観測(記録のみ、判定に使わない)

downloads / browser plays、CTR(itch が表示する場合)、itch Analytics の referrer 別 page view(取得できる範囲)、X 側 engagement。解釈・比較・勝者決定・作品価値評価はしない。

---

## 2. 正本の固定

| 項目 | 値 |
|---|---|
| base SHA(origin/main) | `16b7ad3715fefff4f4909c7a8c480cad0acb6789` |
| `OS.md` blob SHA | `a6e207202f78a00029b75f33a82f7005e671d429` |
| `CURRENT_STATE.md` blob SHA | `a92c9643cea1fcec8cca9d113e55f872b1a4f452` |
| `ROADMAP.md` blob SHA | `8fd95f3f81a4d593043b6dc1a613f1e68c249107` |

Revision 3 時点(2026-08-05T10:20Z)で origin/main を再取得し、上記全 SHA と対象作品 blob SHA が不変であることを再確認した — **material STALE なし**。

STALE 規則(F3 と同型): main SHA が変わっただけでは STALE としない。base 以降の diff が **対象作品(works/seed-010)または本実験の前提・計測契約を実質変更した場合だけ** materially STALE とする。

---

## 3. 対象作品と素材の固定

### 対象作品(無改変)

| ファイル | git blob SHA | SHA-256 |
|---|---|---|
| `works/seed-010/index.html` | `d2b42776c1156870bb149387fb82dc6614fc168c` | `3b0a2abb09e929796244abaa4b5aed5d44a7a025f400769d08ffe0e811f8aafa` |
| `works/seed-010/meta.json` | `4e3f100ceccb50982553560177a5d5313aa72483` | `957a2107cf293dd4b07ca5280c53ef526f3f74245c2eeda34c4d115cece83250` |

**作品本体・ゲームロジックは一切変更していない。** 本実験のために変更してもならない。

### 配布素材(この PR で固定。Revision 2 / 3 でも無変更)

| ファイル | SHA-256 | 内容 |
|---|---|---|
| `experiments/w0/materials/seed-010-itch.zip` | `4c72a348ff99716b8c07b5368002e93678b807106ed12ef4ac07f1bf5f92ae72` | ルート直下に `index.html` 1 件のみ |
| `experiments/w0/materials/seed-010-cover.png` | `2c2160fa41a0ca6de42622584bc7a509157138dfcc98ccd14d2c310f4f833be3` | 630×500 PNG。X と itch.io で **同一ファイル** を使う |

### 素材の検証記録(2026-08-05 UTC、このリポジトリ環境で実施。EL 監査で素材 3 件 PASS)

- ZIP 展開後の `index.html` の SHA-256 は元ファイルと **一致**(バイト単位で同一。`cmp` でも確認)。
- ZIP 展開物に対しリポジトリ標準の `smoke.mjs` を実行し **6/6 PASS**(①存在 ②外部通信・外部URL参照なし ③構文 ④読み込み ⑤開始操作 ⑥再プレイ)。
- 機械 grep でも外部 URL・fetch・XHR・WebSocket・localStorage・外部 `<img>/<link>/<iframe>` 参照ゼロを確認。音は WebAudio によるコード生成のみ。**外部素材・外部通信は追加していない。**
- ローカル Chromium(Playwright 経由、viewport 630×500)で ZIP 展開物を起動し、主要操作を確認: 読み込みで `title` 状態 → START クリックで `play` 状態 → キャンバスへのタップでプリズムが分裂しスコア +5 → 矢印キー+Enter でも解決成功(+5)→ 継続プレイでスコア 35、`checkSuccess()`(`prism_resolved_1`)true、console / page エラー 0 件。
- カバー PNG は、上記の実プレイ中の Chromium 画面(viewport 630×500、devicePixelRatio 1)をそのまま撮影したもの。**架空の UI・スコア・ログの合成、画像加工、作品の改変は行っていない。**

---

## 4. 固定する文章

共通部分(X と itch.io で一字一句固定):

```
SEED 010 — PRISM SPLIT

A dusk-canyon light toy: tap a drifting prism to split it into two smaller shards, or tap a fully-split shard to pop it for points.
```

### itch.io 側

- project title: `SEED 010 — PRISM SPLIT`(共通部分 1 行目)
- description: 共通部分 2 行目以降の本文に続けて、空行を挟み、次の生成 AI 明記文を一字一句加える:

```
Generative AI was used for the code, graphics, and audio.
```

### X 側

共通部分の末尾に次の 1 行を付けた全文を 1 回だけ投稿する。画像は `seed-010-cover.png`(SHA-256 固定)を添付する。ハッシュタグ・メンション・その他の文字は追加しない。

```
Play: [ITCH_PROJECT_URL]
```

`[ITCH_PROJECT_URL]` は **推測しない**。ヒロが作成する itch.io Draft project の URL を受領してから、本 PR の merge 前確定フィールド(§11)として確定する。

---

## 5. 実施契約 — channel 別操作(事前登録)

### 5.1 共通・時刻の定義

- 着地点: 同一の itch.io project `[ITCH_PROJECT_URL]`(1 件のみ)。この precursor で作る project は SEED 010 の 1 件だけ。大量の AI 生成 project を作らない。
- 記録する時刻(全て UTC / JST 併記):
  - **T_x** = X 投稿時刻
  - **T_pub** = itch.io Public 化時刻
  - **T_idx** = itch.io で **first verified indexed** を確認した時刻(§5.5。T_pub とは別に記録する)
- 開始: **|T_x − T_pub| ≤ 15 分**。
- 観測窓:
  - **X 窓 = [T_x, T_x+168h]**
  - **itch 窓 = [T_pub, T_pub+168h]**
- 期間中の禁止事項: 投稿の編集・削除・再投稿、追加宣伝(他チャンネル含む)、有料流入、個人アカウントからの拡散(リポスト・引用等)、bot 流入、itch ページ設定(§5.3 の全項目)の変更。
- 使用する X アカウントは 1 つ。アカウント ID は merge 前確定フィールドとして記録する(§11)。

### 5.2 X 側操作

固定文章(§4)+ 固定カバー画像で 1 回だけ投稿する。投稿 URL を記録する。以後 X 窓の終了まで一切触らない(編集・固定表示・返信・セルフリプライもしない)。

### 5.3 itch.io 側操作(merge 前に実 UI で確定)

以下は **実際の Draft 画面の UI 表示名と設定値で確定** する。値を推測して記入しない。`[TO BE FIXED]` はヒロの Draft 実物確認後、本 PR 内で実値化する(§11)。

| 設定項目(実 UI 表示名で確定) | 固定値 |
|---|---|
| public username / project URL | `[TO BE FIXED]` — **公開 username はヒロの明示承認必須(§8)** |
| Kind of project | `[TO BE FIXED]`(HTML / ブラウザ実行を想定) |
| Pricing / donation | `[TO BE FIXED]`(無料・支払い要素なしを想定。課金設定が必要になれば HOLD、§8) |
| Visibility / unlisted | `[TO BE FIXED]`(Draft → 開始時に Public。unlisted にしない想定) |
| Tags | `[TO BE FIXED]` |
| Classification / genre | `[TO BE FIXED]` |
| Language | `[TO BE FIXED]`(English を想定) |
| Mobile friendly | `[TO BE FIXED]` |
| Embed 方式・寸法・fullscreen | `[TO BE FIXED]` |
| AI disclosure | `[TO BE FIXED]` — 事実に合う項目を選ぶ(この作品のコード・グラフィック・音は AI 生成。虚偽選択をしない)。加えて description に §4 の生成 AI 明記文を含める |
| Cover / Title / Description / ZIP | §3 の固定素材と §4 の固定文章(SHA-256 一致を確認して設定) |

確定後、Public 化から itch 窓の終了まで全項目を変更しない。

### 5.4 自己アクセス・手動閲覧の扱い

- **X の View count は、投稿者自身の閲覧・同一ユーザーの反復閲覧を含む**(X 公式 help、§7)。itch の Impressions も non-unique である。期間中の手動閲覧は計器値を直接汚染する。
- 動作確認アクセスは **原則 Draft 段階(公開前)に完了させる**。公開後の動作確認はしない。
- 両窓の期間中、ヒロは当該 X 投稿・当該 itch ページの手動閲覧を必要最小限にし、**閲覧の都度、時刻(JST)・回数・surface(X 投稿 / itch ページ / itch 検索結果 / Analytics 画面)を台帳に記録** する。Analytics のダッシュボード閲覧は露出計器に乗らない想定だが、想定に反する挙動を確認した場合は記録して報告する。

### 5.5 index 確認(T_idx)の手順

- Public 化後、**1 日 1 回まで**、ログアウト状態(またはシークレットウィンドウ)で itch.io の検索に `PRISM SPLIT` を入力し、検索結果一覧に当該 project が表示されるかを確認する。
- 最初に表示を確認できた時刻を **T_idx** として記録する。**project ページはクリックしない。** 検索結果に表示された回数は自己由来 impressions の可能性として台帳に記録する(§5.4)。
- **期限: T_idx が T_pub + 72 時間以内に確認できなければ VOID(§10)。**

---

## 6. 計器(2 本、別々に記録。直接比較禁止)

### 計器 1 — X: 当該投稿の View count

- 定義(一次資料 §7): 投稿が閲覧された回数。**投稿者自身の閲覧・同一ユーザーの反復閲覧を含む。** 投稿時点からの累積値。
- 取得プロトコル: **T_x+168h から遅延 60 分以内**(早期取得は禁止)に、投稿 UI に表示された View count の数値+スクリーンショットを取得し、取得時刻(UTC/JST)を記録する。
- 許容差の根拠: 累積値のため取得遅延分だけ窓外の閲覧が混入する。遅延上限 60 分(窓 168h の 0.6% 未満)を超えた取得は **VOID**。

### 計器 2 — itch.io: Project Analytics の Impressions

- 定義(EL 指示による訂正、一次資料 §7): itch.io 上で project が表示された回数。**Analytics に表示される値は「直近 1 週間(7 日間)のローリング値」である。** 累積値ではない。
- 取得プロトコル: **T_pub+168h から遅延 60 分以内**(早期取得は禁止)に、Analytics 画面の Impressions の数値+スクリーンショットを取得し、取得時刻(UTC/JST)を記録する。この時点のローリング値は itch 窓 [T_pub, T_pub+168h] の近似となる。
- 許容差の根拠: ローリング値のため、取得が Δ 遅れると窓先頭 Δ 分が脱落し窓外 Δ 分が混入する。**Δ ≤ 60 分** を超えた取得は **VOID**。
- 実 UI に期間フィルタが存在する場合は、[T_pub, T_pub+168h] 相当を指定した値も補助記録する(一次値は上記プロトコルの値)。

### 計器の既知の限界(事前固定)

- 両計器とも non-unique な表示回数であり、ユニーク到達数ではない。計数信頼度は **MEDIUM** とする。
- 定義・母集団・集計方式(累積 vs ローリング、表示面)が異なるため **相互換算・直接比較は不能**。これが本実験を W0 本体ではなく precursor とする理由である。2 値は同一表・同一グラフ上で対比表示せず、別々の記録として保存する。

---

## 7. 計測可能性の根拠(一次資料)と確認手順

### 一次資料(canonical URL。Revision 3 で置換・固定)

| URL | 根拠として使う内容 |
|---|---|
| `https://itch.io/updates/updates-to-project-analytics-filtering-collections-impressions-and-more` | Project Analytics に Impressions が存在すること、表示仕様(ローリング表示・フィルタ) |
| `https://itch.io/docs/creators/getting-indexed` | 新規 project の index 手続き・所要・条件(T_idx 検証と 72h 期限の根拠) |
| `https://itch.io/docs/creators/quality-guidelines` | 掲載条件・AI disclosure を含むページ品質要件(index / 表出への影響確認) |
| `https://help.x.com/en/using-x/view-counts` | X View count の定義(自己閲覧・反復閲覧を含むこと) |

本準備の実行環境からは itch.io / help.x.com へ直接アクセスできない(HTTP 403 / proxy 遮断)ため、**ヒロがブラウザで上記 4 件を開いて内容を確認し、確認日時と要点(スクリーンショット)を本 PR のコメントへ添付する**(HOLD-2 の解除条件)。

### Draft 段階の確認(実数表示は要求しない)

- **Draft では Impressions の実数値の表示を要求しない**(新規 Draft には実流入がなく、低データでは項目自体が非表示になり得る)。
- merge 前に確認するのは次だけ: (a) 上記一次資料に Impressions と index 手続きの記載が存在すること、(b) 実 UI の Analytics 画面の状態記録(Impressions 項目が見えればその実物、低データで非表示ならその旨の記録で足りる)。
- **公開後も Impressions が非表示・取得不能のままなら、公開後判定の VOID とする**(公開前ゲートに遡らない)。

### 既知のリスク(事前記録)

- AI disclosure により browse / 検索での表出が制限される可能性は、上記 quality-guidelines / getting-indexed の実文で確認する。表出が制限されても **観測を捏造しない**(計器が 0 なら VOID として記録する)。

---

## 8. Boundary(identity / credentials / cost)

- **公開 itch username はヒロの明示承認を得たものだけを使用する**(公開 identity のため。承認の記録を merge 前確定フィールドに含める)。
- **incremental spend = $0**。この実験のために新たに発生する支出は 0 とする。
- **有料広告・支払い手段の登録・課金画面の通過が必要になった時点で HOLD** とし、進めない。
- **credentials(パスワード・API キー・セッション情報)はリポジトリへ保存しない。** identity / credentials / cost はヒロが管理する(CURRENT_STATE.md §9)。

---

## 9. 開始条件(全て満たすまで公開しない)

1. 本 PR が EL の監査を経て merge されている。
2. `[ITCH_PROJECT_URL]` と §5.3 の全設定値が実 UI で確定している(username のヒロ承認込み)。
3. §7 の一次資料 4 件の確認と、実 UI の Analytics 画面の状態記録が完了している。
4. itch.io Draft に ZIP(`seed-010-itch.zip`)とカバー(`seed-010-cover.png`)が SHA-256 一致のまま設定され、AI disclosure(設定項目+description の明記文)が事実どおりで、実プレイ確認が Draft 段階で完了している。
5. 使用する X アカウント ID を記録済み。
6. **公開前照合(§12 手順 10)が完了し、不一致が 0 件である。**
7. X 投稿と Public 化を 15 分以内に実施し、T_x / T_pub を記録できる態勢である。
8. incremental spend が $0 のままである(§8)。

---

## 10. 判定条件(決定論・fail-closed)

### この PR の範囲

- **PREPARATION PASS**: 事前登録・固定素材・ZIP・手順が検証できた状態。**PREPARATION PASS は instrument PASS でも W0 PASS でもない。**

### 事前登録の状態判定

- **HOLD**: §11 の HOLD-n が未解除、または Boundary 発動(課金・認証・権限が必要になった、証拠不足)。
- **STALE**: 対象作品(works/seed-010)または本実験の契約(3 正本の W0 関連記述)が main 上で実質変更された場合。main SHA の変化のみでは STALE としない。

### 公開後の結果判定(別 PR でのみ行う。PASS / VOID の二値)

- **INSTRUMENT PASS(計測可能性 PASS)**: 次を **全て** 満たす場合のみ。
  1. X View count を §6 のプロトコル(T_x+168h、遅延 ≤ 60 分、早期取得なし)で数値取得できた。
  2. itch Impressions を §6 のプロトコル(T_pub+168h、遅延 ≤ 60 分、早期取得なし)で数値取得できた。
  3. 両方の値が 0 より大きい。
  4. T_idx が T_pub+72h 以内に記録されている。
  5. |T_x − T_pub| ≤ 15 分を含む §5 の全固定条件・§8 Boundary に違反がない。
  6. 使用素材が固定 SHA-256 と一致している。
  **これは計測可能性 PASS であり、W0 PASS ではない。経路の勝者・作品価値・主経路決定を意味しない。**
- **VOID**: 次のいずれか 1 つでも該当した場合。
  - どちらかの計器が 0、非表示、または取得不能。
  - 取得遅延(> 60 分)または早期取得。
  - itch が T_pub+72h 以内に index されない(T_idx 未確認)。
  - 窓不明(T_x / T_pub の記録欠落・曖昧)。
  - |T_x − T_pub| > 15 分。
  - 期間中の設定変更・素材差・追加宣伝・拡散・有料流入・bot・計測欠損。
  - 窓開始時点で 0 でない事前値を確認した場合。
- **UNKNOWN・部分取得・判定不能は全て VOID 側へ倒す。PASS にしない。**
- 本 precursor では FAIL を定義しない(比較仮説を持たないため。計器不成立は VOID)。`VOID` を `FAIL` として学習しない。`STALE` な結果を再利用しない(ROADMAP.md §3)。

---

## 11. 現在の判定と HOLD 台帳(この Revision 時点)

**PRECURSOR PREPARATION — HOLD**

| ID | 内容 | 解除条件 |
|---|---|---|
| **HOLD-1** | `[ITCH_PROJECT_URL]` と §5.3 設定値が未受領・未確定(公開 username のヒロ承認を含む) | ヒロが Draft project を作成し、URL と実 UI 設定値を返す(§12 手順 3–4) |
| **HOLD-2** | §7 一次資料 4 件の確認と実 UI(Analytics 画面)の状態記録が未実施(実行環境から外部へ直接アクセス不可のため) | ヒロによる一次資料確認+実 UI 状態のスクリーンショット添付(§7。Impressions 実数の表示は要求しない) |

仮説は HYPOTHESIS-1(§1)のみであり、HOLD ID と仮説 ID は分離している。

### 固定宣言と変更契約

- 本文書は、**結果を一切観測する前に固定した**。X 投稿も itch.io project の Public 化もまだ行われていない。Revision 2 / 3 も観測開始前・merge 前の改訂である。
- merge 前に変更してよいのは次の **確定フィールドのみ**: (a) `[ITCH_PROJECT_URL]` の実値化、(b) §5.3 の `[TO BE FIXED]` の実 UI 値化、(c) §7 確認の結果記録、(d) X アカウント ID と username 承認の記録、(e) §11 の HOLD 解除状態。これ以外の本文(仮説・計器・窓・許容差・禁止事項・判定条件)は、EL の再監査指示がない限り本 PR 内でも変更しない。
- **merge 後は本文を一切変更しない**(誤字修正を含む)。訂正が必要な場合は別 PR・別文書(JOURNAL.md 等)で旧記述を残したまま行う。
- **結果の記録・判定は別 PR で行う**。本文書に結果を追記しない。

---

## 12. ヒロの手順(初心者向け)

この precursor で作る itch.io project は **SEED 010 の 1 件だけ**。大量の AI 生成 project を作らない。

1. **監査依頼**: この draft PR を EL へ渡し、監査を受ける。
2. **itch.io アカウント作成**: `https://itch.io/register` から作成する(リポジトリ外の人間作業。credentials はヒロが管理し、リポジトリへ書かない。公開 username は自分で承認できる名前にする — §8)。
3. **Draft project を 1 件だけ作成**: ダッシュボードの「Create new project」で作成する。Kind of project はブラウザで遊べる HTML 形式を選ぶ。まだ Public にしない(Draft のまま)。
4. **URL・設定値・確認結果を Claude Code へ返す**: project URL、§5.3 の各項目の **実際の UI 表示名と設定値**、§7 の一次資料 4 件の確認結果(確認日時・要点・スクリーンショット)、実 UI の Analytics 画面の状態(Impressions 項目の有無。実数表示は不要)を PR コメントで返す。
5. **同じ PR で確定**: Claude Code が §11 の確定フィールド(URL・設定値・確認結果・アカウント ID・username 承認)だけを本文へ反映する。
6. **merge**: EL 監査の完了後、この PR をマージする。
7. **Draft へ素材を設定**: `seed-010-itch.zip` をアップロードし「このファイルをブラウザで実行する」に相当する設定を有効化、カバーに `seed-010-cover.png` を設定、title / description は §4 の固定文章(生成 AI 明記文を含む)のとおりにする。アップロード前にファイルの SHA-256 が §3 と一致することを確認する。
8. **AI disclosure**: 設定項目で事実に合う項目を選び(§5.3 で確定した値)、description に §4 の明記文が入っていることを確認する。虚偽選択をしない。
9. **実プレイ確認(Draft 段階で完了させる)**: Draft ページをブラウザで開き、START → プリズムをタップして分裂・ポップが動くことを確認する。このアクセスも時刻・回数を台帳に記録する(§5.4)。公開後の動作確認はしない。
10. **公開前照合(不一致なら公開しない)**: Draft 状態のまま、次を 1 件ずつ照合する — X アカウント ID の記録 / itch username のヒロ承認 / §5.3 の全設定値 / 素材の SHA-256(ZIP・カバー)/ AI disclosure(設定項目+description の明記文)/ 実プレイ確認の完了。**1 つでも不一致・未完了があれば公開せず HOLD とし、解消してから再照合する。**
11. **公開**: itch.io を Public 化し、X へ §4 の固定文章(URL 入り)+ 同一カバー画像を 1 回投稿する。**|T_x − T_pub| ≤ 15 分**。T_x / T_pub(UTC/JST)と投稿 URL を記録する。
12. **開始記録と index 確認**: 公開直後の Analytics 画面・ページ設定・投稿画面を保存する(証拠記録。計器値の計算には使わない)。以後 §5.5 の手順で 1 日 1 回 index を確認し、**T_idx** を記録する(期限 T_pub+72h。超過は VOID)。
13. **7 日間は何も変えない**: §5 の禁止事項を守り、手動閲覧を最小化し、閲覧台帳をつける(§5.4)。
14. **終了取得(時刻厳守)**: **T_x+168h から 60 分以内** に X View count を、**T_pub+168h から 60 分以内** に itch Impressions を、それぞれ数値+スクリーンショットで取得し、取得時刻を記録する(§6。早期取得禁止)。
15. **結果は別 PR へ**: 記録一式(数値、スクリーンショット、閲覧台帳、T_x / T_pub / T_idx、取得時刻)を新しい PR にまとめ、§10 の決定論条件で判定する。本文書は変更しない。
