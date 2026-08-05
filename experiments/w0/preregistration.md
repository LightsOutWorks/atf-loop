# W0 事前登録 — Comparable Distribution Canary

Experiment ID: `W0-DIST-CANARY-001`
Schema: `atf-w0-preregistration/1.1`
作成日時: **2026-08-05T04:58Z (UTC) / 2026-08-05 13:58 JST**
改訂: **Revision 2 — 2026-08-05T09:44Z (UTC)。EL 監査(REQUEST CHANGES)の反映。観測開始前・merge 前の改訂であり、観測結果はまだ一切存在しない**
状態: **W0 PREPARATION — HOLD**(§10 参照。実験は未開始)

この文書は、結果を観測する **前** に固定した事前登録である。ROADMAP.md の W0 gate(hypothesis と channel 別操作の事前登録、**impressions 同士** の等価指標、`VOID` 条件と attribution confidence の定義、identity / credentials / cost Boundary の遵守)を実装する。

改訂履歴:

- Revision 1(head `5ab41f1659277396db58103c3329c4444a46ade4`): 初版。一次指標を referrer 別 page view としていた。
- Revision 2(本版): EL 監査により、一次指標を canonical ROADMAP の「impressions 同士」へ変更(X View count / itch.io Impressions)、referrer 分析を補助観測へ降格、観測窓をチャンネル別 7×24 時間へ一本化、itch 側 channel operation 表を追加、Boundary を明文化、判定を決定論化、§7 の循環要求を除去。

---

## 1. 目的と仮説

### 目的

同じ作品を同じ条件で X と itch.io へ出したとき、**同じ露出段階の指標で、流入経路別の比較可能な観測が得られるか** を試す。これは計測カナリアであり、作品価値の評価でも、主経路の勝者決定でもない。

### HYPOTHESIS-1(計測仮説・主)

> X 投稿と itch.io project の Public 化を 15 分以内に行ったとき、各チャンネルの同じ露出段階の一次指標 — X: 当該投稿の View count、itch.io: Project Analytics の Impressions — を、各々の公開時刻から始まる 7×24 時間について数値として取得でき、かつ両方が 0 より大きい。

- HYPOTHESIS-1 の評価は §10 の決定論条件(PASS / VOID / FAIL)でのみ行う。
- **W0 PASS は「同じ露出段階の比較可能な観測を取得できた」ことだけを意味し、経路の勝者や作品価値を意味しない。**

### 副次観測(記録のみ、判定に使わない)

downloads / browser plays、CTR(itch が表示する場合)、itch Analytics の referrer 別 page view(取得できる範囲)、X 側 engagement。解釈・勝者決定・作品価値評価は、この実験 1 回では行わない。

---

## 2. 正本の固定

| 項目 | 値 |
|---|---|
| base SHA(origin/main) | `16b7ad3715fefff4f4909c7a8c480cad0acb6789` |
| `OS.md` blob SHA | `a6e207202f78a00029b75f33a82f7005e671d429` |
| `CURRENT_STATE.md` blob SHA | `a92c9643cea1fcec8cca9d113e55f872b1a4f452` |
| `ROADMAP.md` blob SHA | `8fd95f3f81a4d593043b6dc1a613f1e68c249107` |

Revision 2 時点(2026-08-05T09:44Z)で origin/main を再取得し、上記全 SHA と対象作品 blob SHA が不変であることを再確認した — **material STALE なし**。

STALE 規則(F3 と同型): main SHA が変わっただけでは STALE としない。base 以降の diff が **対象作品(works/seed-010)または W0 の前提・計測契約を実質変更した場合だけ** materially STALE とする。

---

## 3. 対象作品と素材の固定

### 対象作品(無改変)

| ファイル | git blob SHA | SHA-256 |
|---|---|---|
| `works/seed-010/index.html` | `d2b42776c1156870bb149387fb82dc6614fc168c` | `3b0a2abb09e929796244abaa4b5aed5d44a7a025f400769d08ffe0e811f8aafa` |
| `works/seed-010/meta.json` | `4e3f100ceccb50982553560177a5d5313aa72483` | `957a2107cf293dd4b07ca5280c53ef526f3f74245c2eeda34c4d115cece83250` |

**作品本体・ゲームロジックは一切変更していない。** 本実験のために変更してもならない。

### 配布素材(この PR で固定。Revision 2 でも無変更)

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

- **itch.io 側**: project title に 1 行目 `SEED 010 — PRISM SPLIT`、description に 2 行目以降の本文を一字一句使用する。
- **X 側**: 共通部分の末尾に次の 1 行を付けた全文を 1 回だけ投稿する。画像は `seed-010-cover.png`(SHA-256 固定)を添付する。ハッシュタグ・メンション・その他の文字は追加しない。

```
Play: [ITCH_PROJECT_URL]
```

`[ITCH_PROJECT_URL]` は **推測しない**。ヒロが作成する itch.io Draft project の URL を受領してから、本 PR の merge 前確定フィールド(§11)として確定する。

---

## 5. 比較契約 — channel 別操作(事前登録)

### 5.1 共通

- 着地点: 同一の itch.io project `[ITCH_PROJECT_URL]`(1 件のみ)。この カナリアで作る project は SEED 010 の 1 件だけ。大量の AI 生成 project を作らない。
- 開始: **X 投稿時刻 T_x と itch.io Public 化時刻 T_i の差は 15 分以内**。両時刻を UTC / JST で記録する。
- 観測窓(チャンネル別に一本化):
  - **X 窓 = T_x から T_x+168h(7×24 時間)**
  - **itch 窓 = T_i から T_i+168h(7×24 時間)**
  - 各窓の開始・終了時刻を UTC / JST で固定・記録する。
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
| AI disclosure | `[TO BE FIXED]` — 事実に合う項目を選ぶ(この作品のコード・グラフィック・音は AI 生成。虚偽選択をしない) |
| Cover / Title / Description / ZIP | §3 の固定素材と §4 の固定文章(SHA-256 一致を確認して設定) |

確定後、Public 化から itch 窓の終了まで全項目を変更しない。

### 5.4 自己アクセス・手動閲覧の扱い

- **X の View count には投稿者自身の閲覧・同一ユーザーの反復閲覧が含まれる。** itch の Impressions も non-unique である。したがって期間中の手動閲覧は一次指標を直接汚染する。
- 動作確認アクセスは **原則 Draft 段階(公開前)に完了させる**。
- 両窓の期間中、ヒロは当該 X 投稿・当該 itch ページの手動閲覧を必要最小限にし、**閲覧の都度、時刻(JST)・回数・surface(X 投稿 / itch ページ / Analytics 画面)を台帳に記録** する。Analytics のダッシュボード閲覧は露出指標に乗らない想定だが、想定に反する挙動を確認した場合は記録して報告する。

---

## 6. 指標

### 一次指標(canonical ROADMAP「impressions 同士」に整合)

| チャンネル | 一次指標 | 取得面 |
|---|---|---|
| X | **当該投稿の View count** | 投稿に表示される View count(数値とスクリーンショット) |
| itch.io | **Project Analytics の Impressions** | project の Analytics 画面(数値とスクリーンショット) |

- 一次値 = **各窓の終了時点の累積値**。窓終了後すみやかに取得し、取得時刻(UTC/JST)と終了時刻からの遅延を記録する。
- 両サーフェスは新規作成のため、窓開始時点の累積は 0 のはずである。0 でない事前値を確認した場合は記録の上、§10 の VOID 判定で扱う。
- 「公開直前スナップショットと公開直後スナップショットの差分」を一次値の定義には **使わない**(Revision 1 の baseline 記述は削除した)。開始直後の画面保存(§12 手順 11)は証拠記録であり、一次値の計算には使わない。

### attribution confidence: **MEDIUM**(事前固定)

- 両指標とも **non-unique な surface exposure** である(同一ユーザーの反復・自己閲覧を含み、ユニーク訪問者数ではない)。
- 露出のカウント定義はプラットフォーム実装に依存し、**完全同一ではない**(X は投稿表示、itch は itch.io 上での project 表示)。同じ「露出段階」を測るが等価性は近似である。
- この非等価リスクが実物確認で「等価に扱えない」水準と判明した場合は §10 の FAIL とする。

### 補助観測(降格済み。記録のみ、判定に使わない)

- itch Analytics の **referrer 別 project page view**(取得できる範囲で記録。X 系 referrer と itch 内部の分離は attribution confidence を補強する参考情報。referrer 欠落・Discord が itch.io 表示になる等の既知の帰属損失があるため一次指標にしない)
- downloads / browser plays、CTR(itch が表示する場合)
- X 側 engagement(いいね・リポスト数等は記録のみ。リポストの依頼・誘発はしない)

---

## 7. 計測可能性の確認(循環なし)

**新規 Draft には実流入が存在しないため、公開前に X / itch referrer の実例が存在することは要求しない。** merge 前の確認は次の 2 点のみとする(いずれも実流入を必要としない):

1. **実 UI 確認**: ヒロの Draft project の Analytics / ダッシュボード画面に **Impressions 項目** と **期間表示(日別グラフまたは期間指定)** が存在することを確認し、スクリーンショットを本 PR のコメントに添付する。
2. **公式仕様の参照**: itch.io 公式資料の canonical URL を記録する — `https://itch.io/docs/creators/analytics`, `https://itch.io/docs/creators/dashboard`(本準備の実行環境からは HTTP 403 で直接閲覧不可のため、ヒロがブラウザで開き、Impressions と期間表示に関する記載の有無を確認する)。

X 側の View count は投稿 UI に標準表示される仕様であり、投稿後に実表示を記録する。

**低データ等の理由で公開後に Impressions が非表示・取得不能となった場合は、公開前ゲートに遡らず、公開後判定の VOID として扱う(§10)。**

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
3. §7 の実 UI 確認(Impressions 項目・期間表示)が完了している。
4. itch.io Draft に ZIP(`seed-010-itch.zip`)とカバー(`seed-010-cover.png`)が SHA-256 一致のまま設定され、AI disclosure が事実どおり選択され、実プレイ確認が Draft 段階で完了している。
5. 使用する X アカウント ID を記録済み。
6. X 投稿と Public 化を 15 分以内に実施し、T_x / T_i を記録できる態勢である。
7. incremental spend が $0 のままである(§8)。

---

## 10. 判定条件(決定論)

### この PR の範囲

- **PREPARATION PASS**: 事前登録・固定素材・ZIP・手順が検証できた状態。**PREPARATION PASS は W0 PASS ではない。**

### 事前登録の状態判定

- **HOLD**: §11 の HOLD-n が未解除、または Boundary 発動(課金・認証・権限が必要になった、証拠不足)。
- **STALE**: 対象作品(works/seed-010)または W0 契約(3 正本の W0 関連記述)が main 上で実質変更された場合。main SHA の変化のみでは STALE としない。

### 公開後の結果判定(別 PR でのみ行う)

- **W0 PASS**: 次を **全て** 満たす。
  1. X View count と itch Impressions の両方を、各々の 7×24 時間窓(§5.1)の終了時点の累積値として数値取得できた。
  2. 両方の値が 0 より大きい。
  3. T_x / T_i の差 15 分以内を含む §5 の全固定条件・§8 Boundary に違反がない。
  4. 使用素材が固定 SHA-256 と一致している。
  **PASS は同じ露出段階の比較可能な観測を取得できたことのみを意味し、経路の勝者や作品価値を意味しない。**
- **VOID**: どちらかの一次指標が 0、非表示、低データで取得不能。itch の indexing 不能・X の配信なし。時刻差 15 分超過。期間中の設定変更・素材差・追加宣伝・拡散・有料流入・bot。スナップショット取得不能等の計測欠損。窓開始時点の事前値が 0 でなかった場合。
- **FAIL**: 両指標とも十分な非ゼロ露出と数値が得られたが、実物確認(実 UI の指標定義・期間表示)により、**指標の露出段階または 7 日窓を等価に扱えない** と判明した場合。
- `VOID` を `FAIL` として学習しない。`STALE` な結果を再利用しない(ROADMAP.md §3)。

---

## 11. 現在の判定と HOLD 台帳(この Revision 時点)

**W0 PREPARATION — HOLD**

| ID | 内容 | 解除条件 |
|---|---|---|
| **HOLD-1** | `[ITCH_PROJECT_URL]` と §5.3 設定値が未受領・未確定(公開 username のヒロ承認を含む) | ヒロが Draft project を作成し、URL と実 UI 設定値を返す(§12 手順 3–4) |
| **HOLD-2** | Impressions 項目・期間表示の実 UI 確認が未実施(実行環境から itch.io へ直接アクセス不可のため) | §7 の実 UI 確認とスクリーンショット添付 |

仮説は HYPOTHESIS-1(§1)のみであり、HOLD ID と仮説 ID は分離した(Revision 1 の「H1」重複を解消)。

### 固定宣言と変更契約

- 本文書は、**結果を一切観測する前に固定した**。X 投稿も itch.io project の Public 化もまだ行われていない。Revision 2 も観測開始前・merge 前の改訂である。
- merge 前に変更してよいのは次の **確定フィールドのみ**: (a) `[ITCH_PROJECT_URL]` の実値化、(b) §5.3 の `[TO BE FIXED]` の実 UI 値化、(c) §7 実 UI 確認の結果記録、(d) X アカウント ID と username 承認の記録、(e) §11 の HOLD 解除状態。これ以外の本文(仮説・指標・窓・禁止事項・判定条件)は、EL の再監査指示がない限り本 PR 内でも変更しない。
- **merge 後は本文を一切変更しない**(誤字修正を含む)。訂正が必要な場合は別 PR・別文書(JOURNAL.md 等)で旧記述を残したまま行う。
- **結果の記録・判定は別 PR で行う**。本文書に結果を追記しない。

---

## 12. ヒロの手順(初心者向け)

この カナリアで作る itch.io project は **SEED 010 の 1 件だけ**。大量の AI 生成 project を作らない。

1. **監査依頼**: この draft PR を EL へ渡し、監査を受ける。
2. **itch.io アカウント作成**: `https://itch.io/register` から作成する(リポジトリ外の人間作業。credentials はヒロが管理し、リポジトリへ書かない。公開 username は自分で承認できる名前にする — §8)。
3. **Draft project を 1 件だけ作成**: ダッシュボードの「Create new project」で作成する。Kind of project はブラウザで遊べる HTML 形式を選ぶ。まだ Public にしない(Draft のまま)。
4. **URL・設定値・Analytics 画面を Claude Code へ返す**: project URL、§5.3 の各項目の **実際の UI 表示名と設定値**、および Analytics / ダッシュボードの **Impressions 項目と期間表示が写ったスクリーンショット** を PR コメントで返す。あわせて §7 の公式 docs をブラウザで開き、Impressions・期間表示の記載を確認する。
5. **同じ PR で確定**: Claude Code が §11 の確定フィールド(URL・設定値・確認結果)だけを本文へ反映する。
6. **merge**: EL 監査の完了後、この PR をマージする。
7. **Draft へ素材を設定**: `seed-010-itch.zip` をアップロードし「このファイルをブラウザで実行する」に相当する設定を有効化、カバーに `seed-010-cover.png` を設定、title / description は §4 の固定文章のとおりにする。アップロード前にファイルの SHA-256 が §3 と一致することを確認する。
8. **AI disclosure**: 事実に合う項目を選ぶ(この作品のコード・グラフィック・音は AI が生成した。虚偽選択をしない)。実際の項目名と選択値は §5.3 の表に確定済みの値を使う。
9. **実プレイ確認(Draft 段階で完了させる)**: Draft ページをブラウザで開き、START → プリズムをタップして分裂・ポップが動くことを確認する。このアクセスも時刻・回数を台帳に記録する(§5.4)。公開後の動作確認はしない。
10. **公開**: itch.io を Public 化し、X へ §4 の固定文章(URL 入り)+ 同一カバー画像を 1 回投稿する。**T_x と T_i の差は 15 分以内**。両時刻(UTC/JST)と投稿 URL を記録する。
11. **開始記録**: 公開直後の Analytics 画面とページ設定・投稿画面を保存する(証拠記録。一次値の計算には使わない — §6)。
12. **7 日間は何も変えない**: §5 の禁止事項を守り、手動閲覧を最小化し、閲覧台帳をつける(§5.4)。
13. **終了記録**: X 窓終了(T_x+168h)後に投稿の View count を、itch 窓終了(T_i+168h)後に Analytics の Impressions を、それぞれ数値+スクリーンショットで取得し、取得時刻を記録する。
14. **結果は別 PR へ**: 記録一式(数値、スクリーンショット、閲覧台帳、公開時刻)を新しい PR にまとめ、§10 の決定論条件で判定する。本文書は変更しない。
