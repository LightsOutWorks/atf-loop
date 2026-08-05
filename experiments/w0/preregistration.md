# W0 事前登録 — Comparable Distribution Canary

Experiment ID: `W0-DIST-CANARY-001`
Schema: `atf-w0-preregistration/1.0`
作成日時: **2026-08-05T04:58Z (UTC) / 2026-08-05 13:58 JST**
状態: **W0 PREPARATION — HOLD**(§10 参照。実験は未開始)

この文書は、結果を観測する **前** に固定した事前登録である。ROADMAP.md の W0 gate(hypothesis と channel 別操作の事前登録、等価指標、`VOID` 条件と attribution confidence の定義、identity / credentials / cost Boundary の遵守)を実装する。

---

## 1. 目的と仮説

### 目的

同じ作品を同じ条件で X と itch.io へ出したとき、**流入元を区別した比較可能な観測が得られるか** を試す。これは計測カナリアであり、作品価値の評価でも、主経路の勝者決定でもない。

### 比較の原則

最優先は「**同じ着地点の中で流入元を比較する**」こと。着地点は単一の itch.io project ページに統一し、X 経由の流入と itch.io 内部経由の流入を、同じ計測面(itch.io Analytics の project page view)で分離観測する。X の post views と itch.io 側の指標を直接比較することはしない(CURRENT_STATE.md §12「impressions と views を直接比較せず、同じ段階を測る共通指標だけを使う」に従う)。

### 仮説 H1(計測仮説・主)

> 同一の itch.io project ページを着地点としたとき、X 由来の project page view と itch.io 内部由来の project page view を、itch.io Analytics の流入元(referrer)別データによって、同一の 7×24 時間について分離取得できる。

- H1 が確認できた場合のみ、公開後の別 PR で **W0 PASS** と判定できる(§9)。
- 分離取得が成立しない場合(referrer 別 views が取得できない、またはデータ欠損で帰属が成立しない)、結果は **VOID** として記録する。比較可能性を捏造しない。

### 副次観測(記録のみ、判定に使わない)

両バケットの view 数、downloads / browser plays、X post views を記録する。**どちらの経路が多いかの解釈、主経路の勝者決定、作品価値の評価は、この実験 1 回では行わない。**

---

## 2. 正本の固定

| 項目 | 値 |
|---|---|
| base SHA(origin/main) | `16b7ad3715fefff4f4909c7a8c480cad0acb6789` |
| `OS.md` blob SHA | `a6e207202f78a00029b75f33a82f7005e671d429` |
| `CURRENT_STATE.md` blob SHA | `a92c9643cea1fcec8cca9d113e55f872b1a4f452` |
| `ROADMAP.md` blob SHA | `8fd95f3f81a4d593043b6dc1a613f1e68c249107` |

STALE 規則(F3 と同型): main SHA が変わっただけでは STALE としない。base 以降の diff が **対象作品(works/seed-010)または W0 の前提・計測契約を実質変更した場合だけ** materially STALE とする。

---

## 3. 対象作品と素材の固定

### 対象作品(無改変)

| ファイル | git blob SHA | SHA-256 |
|---|---|---|
| `works/seed-010/index.html` | `d2b42776c1156870bb149387fb82dc6614fc168c` | `3b0a2abb09e929796244abaa4b5aed5d44a7a025f400769d08ffe0e811f8aafa` |
| `works/seed-010/meta.json` | `4e3f100ceccb50982553560177a5d5313aa72483` | `957a2107cf293dd4b07ca5280c53ef526f3f74245c2eeda34c4d115cece83250` |

**作品本体・ゲームロジックは一切変更していない。** 本実験のために変更してもならない。

### 配布素材(この PR で固定)

| ファイル | SHA-256 | 内容 |
|---|---|---|
| `experiments/w0/materials/seed-010-itch.zip` | `4c72a348ff99716b8c07b5368002e93678b807106ed12ef4ac07f1bf5f92ae72` | ルート直下に `index.html` 1 件のみ |
| `experiments/w0/materials/seed-010-cover.png` | `2c2160fa41a0ca6de42622584bc7a509157138dfcc98ccd14d2c310f4f833be3` | 630×500 PNG。X と itch.io で **同一ファイル** を使う |

### 素材の検証記録(2026-08-05 UTC、このリポジトリ環境で実施)

- ZIP 展開後の `index.html` の SHA-256 は元ファイルと **一致**(バイト単位で同一。`cmp` でも確認)。
- ZIP 展開物に対しリポジトリ標準の `smoke.mjs` を実行し **6/6 PASS**(①存在 ②外部通信・外部URL参照なし ③構文 ④読み込み ⑤開始操作 ⑥再プレイ)。
- 機械 grep でも外部 URL・fetch・XHR・WebSocket・localStorage・外部 `<img>/<link>/<iframe>` 参照ゼロを確認。音は WebAudio によるコード生成のみ。**外部素材・外部通信は追加していない。**
- ローカル Chromium(Playwright 経由、viewport 630×500)で ZIP 展開物を起動し、主要操作を確認: 読み込みで `title` 状態 → START クリックで `play` 状態 → **キャンバスへのタップでプリズムが分裂しスコア +5** → 矢印キー+Enter でも解決成功(+5)→ 継続プレイでスコア 35、`checkSuccess()`(`prism_resolved_1`)true、console / page エラー 0 件。
- カバー PNG は、上記の実プレイ中の Chromium 画面(viewport 630×500、devicePixelRatio 1)をそのまま撮影したもの。**架空の UI・スコア・ログの合成、画像加工、作品の改変は行っていない。** 画面内の SCORE 35 / 残り 56.1 秒 / COMBO x2 は実プレイの実値である。

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

## 5. 比較契約(7 日間の固定条件)

- 着地点: 同一の itch.io project `[ITCH_PROJECT_URL]`(1 件のみ)。
- X 側流入: 上記 X 投稿 1 件から同 project へのリンク経由。
- itch 側流入: itch.io 内部(Browse / Search / Recommendation / タグ等)から同 project へ。内部露出を得るための特別な操作はしない(通常の公開のみ)。
- 開始: **X 投稿と itch.io の Public 化の時刻差は 15 分以内**。両時刻を UTC / JST で記録する。
- 観測期間: **公開から 7×24 時間**。
- 期間中の禁止事項: 投稿の編集・削除・再投稿、追加宣伝(他チャンネル含む)、有料流入、個人アカウントからの拡散(リポスト・引用等)、bot 流入、itch ページ設定(タグ・説明・素材・価格・可視性)の変更。
- Public 化時点のページ設定一式(タグ含む)を開始スナップショットとして保存し、期間中変更しない。
- 使用する X アカウントは 1 つ。アカウント ID は開始条件確定時に記録する(§11)。

### 自己アクセスの扱い

- ヒロ自身の動作確認アクセス(project ページ閲覧・ブラウザプレイ)は、**発生の都度、時刻(JST)・回数・経路(直接 URL か)を記録** し、一次指標の解釈時に自己アクセス由来分として分離する。
- 期間中の自己アクセスは動作確認に必要な最小限に留める。Analytics 閲覧(ダッシュボード)は page view に該当しない想定だが、想定に反する挙動が確認された場合は記録して報告する。

---

## 6. 指標

### 一次指標(候補として固定)

**itch.io Analytics 上で流入元(referrer)別に帰属できる project page view**。同一の 7×24 時間について、次のバケットで集計する。

| バケット | 定義(referrer) |
|---|---|
| X 由来 | `t.co` / `twitter.com` / `x.com` |
| itch.io 内部由来 | itch.io 内部ページ(browse / search / tag / home 等。「itch.io」アンブレラ表示を含む) |
| 帰属不能 | referrer なし(direct / unknown)およびその他 — **どちらのバケットにも算入しない**。件数は記録する |

取得方法: 公開直前(開始)と 7 日経過時(終了)に Analytics 画面(referrer 別 views の表を含む)のスナップショットを保存し、その差分を期間値とする。project は新規作成のため、開始スナップショットの事前 view は Draft 期間の自己アクセス分に限られる(それも記録する)。

### attribution confidence(既知の帰属リスク、事前固定)

- 現代のブラウザ・アプリはプライバシー目的で referrer を送らないことがあり、X 経由(特にアプリ内ブラウザ)の一部は「帰属不能」に落ちる可能性がある(X 由来の過小計上方向)。
- コミュニティ報告として、Discord 経由の流入が「itch.io」表示になる事例が報告されている(itch 内部バケットの過大計上方向)。第三者による共有は統制できないため、発生し得るリスクとして記録する。
- これらは方向性が既知の偏りとして解釈時に明記する。**帰属不能が支配的で両バケットの分離観測が成立しない場合は VOID とする(§9)。**

### 補助指標(経路別の「配信が発生したか」の確認のみ)

- X 側: 当該投稿の post views / impressions。
- itch 側: downloads / browser plays、および(存在すれば)browse 掲載・impressions 相当の指標。該当指標の存在は未確認(UNKNOWN)。
- **X の post views と itch.io の impressions を直接比較してはいけない。** 別々に記録し、相互比較・合算をしない。

---

## 7. 計測可能性の根拠と未確定事項

### 実行環境からの一次確認の結果(2026-08-05)

この準備を行ったリポジトリ実行環境からは、itch.io への直接アクセスが全て遮断された(公式 docs `https://itch.io/docs/creators/analytics` は HTTP 403、egress proxy 経由の直接取得も遮断)。したがって **流入元別計測の可否は、一次資料の直接閲覧では未確定** である。これが HOLD 理由の 1 つである(§10)。

### 検索経由で得た参考情報(canonical URL を記録。直接閲覧で再確認が必要)

- 公式 docs(canonical、要再確認): `https://itch.io/docs/creators/analytics`, `https://itch.io/docs/creators/dashboard` — 検索エンジン経由の引用では、project の Analytics は views / downloads / browser plays / referrers を持ち、グラフの期間を調整できるとされる。
- 公式 updates(itch.io 公式ブログ): `https://itchio.tumblr.com/post/144257242519/itchio-week-day-4-dashboard`(2016; dashboard analytics に referring websites 集計)、`https://itchio.tumblr.com/post/93417222514/view-where-purchases-come-from`(2014; 内部ページ(browse / search / home / profile)と外部 referrer(Reddit / Twitter / Facebook 等)を区別表示 — ただし対象は purchases)。
- コミュニティ報告: `https://itch.io/t/4100189/views-without-a-referrer`(referrer なし views の存在)、`https://itch.io/t/3970027/why-are-mastodon-referrers-not-showing-in-analytics`(referrer 欠落と Discord の itch.io 表示)、`https://itch.io/t/1211950/where-are-my-views-coming-from`(タグ検索等が itch.io アンブレラ表示になる)。

### merge 前に確定させる事項(ダッシュボード実物での確認)

ヒロが Draft project を作成した後、その Analytics / ダッシュボード実物で以下を確認し、スクリーンショットを本 PR のコメントとして添付して確定する。

1. project page view の **referrer 別内訳** が実際に表示されること。
2. X 系 referrer(`t.co` / `twitter.com` / `x.com`)と itch.io 内部が **区別可能** であること(表示形式の実例を記録)。
3. 同一 7 日間の値が取得できること(期間指定、または開始・終了スナップショットの差分で成立すること)。

**上記が確認できない場合、W0 は開始しない。比較可能性を捏造しない。**

---

## 8. 開始条件(全て満たすまで公開しない)

1. 本 PR が EL の監査を経て merge されている。
2. `[ITCH_PROJECT_URL]` が実受領した Draft project URL で確定している(§11)。
3. §7 の計測可能性 3 点がダッシュボード実物で確認済み。
4. itch.io Draft に ZIP(`seed-010-itch.zip`)とカバー(`seed-010-cover.png`)が SHA-256 一致のまま設定され、AI disclosure が事実どおり選択され、実プレイ確認済み。
5. 使用する X アカウント ID を記録済み。
6. 開始スナップショット(Analytics・ページ設定・時刻)を保存済み。
7. X 投稿と Public 化を 15 分以内に実施できる態勢である。

---

## 9. 判定条件

- **PREPARATION PASS**(この PR の範囲): 事前登録・固定素材・ZIP・手順が検証できた状態。**PREPARATION PASS は W0 PASS ではない。**
- **HOLD**: itch URL 未受領、流入元別計測を確認できない、権限・認証・費用の Boundary により進めない、証拠不足。
- **STALE**: 対象作品(works/seed-010)または W0 契約(3 正本の W0 関連記述)が main 上で実質変更された場合。main SHA の変化のみでは STALE としない。
- **VOID**(公開後): indexing 不能(itch 内部導線に載らない)、一次指標取得不能、referrer 別データ欠損で帰属不能が支配的、X 投稿と Public 化の時刻差 15 分超過、素材差(固定 SHA-256 と不一致)、期間中の介入(§5 禁止事項)発生、その他事前登録条件の逸脱。
- **W0 PASS**(公開後、別 PR でのみ判定): 事前登録どおり、同一 7×24 時間について X 由来と itch.io 内部由来の project page view を分離取得でき、開始条件・固定条件の違反がない場合。**PASS は「比較可能な観測を取得できた」ことだけを意味し、作品価値や主経路の勝者を意味しない。**

`VOID` を `FAIL` として学習しない。`STALE` な結果を再利用しない(ROADMAP.md §3)。

---

## 10. 現在の判定(この PR 作成時点)

**W0 PREPARATION — HOLD**

| # | HOLD 理由 | 解除条件 |
|---|---|---|
| H1 | `[ITCH_PROJECT_URL]` 未受領 | ヒロが Draft project を作成し URL を返す(§12 手順 4) |
| H2 | 流入元別計測が一次資料の直接閲覧で未確定(実行環境から itch.io へ全面アクセス不可) | ダッシュボード実物での 3 点確認(§7) |

準備物(事前登録・ZIP・カバー・手順)の検証は完了している。H1・H2 解除後、本 PR 内で確定フィールドのみ更新し、EL 監査を経て merge する。

---

## 11. 固定宣言と変更契約

- 本文書は、**結果を一切観測する前に固定した**。X 投稿も itch.io project の Public 化もまだ行われていない。
- merge 前に変更してよいのは次の **確定フィールドのみ**: (a) `[ITCH_PROJECT_URL]` の実値化(§4, §5)、(b) §7「merge 前に確定させる事項」の確認結果(可 / 不可と証拠への参照)、(c) §8-5 の X アカウント ID、(d) §10 の HOLD 解除状態。これ以外の本文(仮説・指標・バケット定義・禁止事項・判定条件)は本 PR 内でも変更しない。
- **merge 後は本文を一切変更しない**(誤字修正を含む)。訂正が必要な場合は別 PR・別文書(JOURNAL.md 等)で旧記述を残したまま行う。
- **結果の記録・判定は別 PR で行う**。本文書に結果を追記しない。

---

## 12. ヒロの手順(初心者向け)

このカナリアで作る itch.io project は **SEED 010 の 1 件だけ**。大量の AI 生成 project を作らない。

1. **監査依頼**: この draft PR を EL へ渡し、監査を受ける(内容・SHA-256・手順の確認)。
2. **itch.io アカウント作成**: `https://itch.io/register` から作成する(この作業はリポジトリ外の人間作業。credentials はヒロが管理し、リポジトリへ書かない)。
3. **Draft project を 1 件だけ作成**: ダッシュボードの「Create new project」で作成する。Kind of project は **HTML**(ブラウザで遊べる形式)を選ぶ。まだ Public にしない(Draft のまま)。
4. **project URL を Claude Code へ返す**: project の URL(例: `https://<ユーザー名>.itch.io/<プロジェクト名>`)をそのまま伝える。あわせて §7 の 3 点(referrer 別 views の表示・X 系と内部の区別・7 日間の取得可否)をダッシュボードで確認し、スクリーンショットを PR コメントに添付する。
5. **同じ PR で確定**: Claude Code が `[ITCH_PROJECT_URL]` と計測可能性の確認結果を本文の確定フィールドへ反映する(§11 の範囲のみ)。
6. **merge**: EL 監査の完了後、この PR をマージする。
7. **Draft へ素材を設定**: `seed-010-itch.zip` をアップロードし「This file will be played in the browser」を有効化、カバーに `seed-010-cover.png` を設定、title / description は §4 の固定文章のとおりにする。アップロード前にファイルの SHA-256 が §3 と一致することを確認する。
8. **AI disclosure**: itch.io の AI 生成に関する開示設定で、**事実に合う項目を選ぶ**(この作品のコード・グラフィック・音は AI が生成した。虚偽選択をしない)。
9. **実プレイ確認**: Draft ページをブラウザで開き、START → プリズムをタップして分裂・ポップが動くことを確認する。このアクセスも自己アクセスとして時刻・回数を記録する(§5)。
10. **公開**: itch.io を Public 化し、X へ §4 の固定文章(URL 入り)+ 同一カバー画像を 1 回投稿する。**両者の時刻差は 15 分以内**。両時刻を記録する。
11. **開始スナップショット**: Public 化直後の Analytics(referrer 別 views を含む画面)とページ設定を保存する。
12. **7 日間は何も変えない**: §5 の禁止事項を守る。追加の宣伝・編集・拡散をしない。
13. **終了スナップショット**: 公開から 7×24 時間経過後、同じ Analytics 画面を保存する。
14. **結果は別 PR へ**: スナップショットと記録(自己アクセス台帳、公開時刻、post views 等)を新しい PR にまとめる。本文書は変更しない。
