---
name: reuse-before-build
description: "新しいアプリ・Webサイト・サービス・自動化・Bot・外部連携・開発ツール・プロトタイプ・大型の独立機能を「作る」依頼を受けたら、実装を始める前にGitHub上の既存OSSを調査し、ゼロからのBUILDを避けるためのSkill。「〜を作りたい」「〜を作って」「〜を自作」「新しく立ち上げる」「build an app」「create a website / service / bot / integration / CLI / dashboard」「automate X」「set up a new tool」「from scratch」といった依頼で使う。REUSE → BUY → ADAPT → COMPOSE → DELEGATE → BUILD → NO_ACTION の順でRouteを検討し、候補を一次情報から検証し、実装前にHuman承認で停止する。小さなbug修正・定常保守・既存コード内の軽微な編集・同じ目的と条件を扱った新しい調査結果が既にある場合・Humanが外部調査を明示的に禁止した場合には使わない。"
---

# Reuse Before Build

**BUILDはDefaultではない。** 新しいものを作る依頼を受けた時点で、まず「世界に既にあるか」を一次情報で確かめる。
このSkillの成果物は**コードではなく判断**である。実装はHumanの承認後にしか始めない。

---

## 1. 発火するか / しないか

### 発火する
- 新規のアプリ / Webサイト / サービス / SaaS
- 自動化、定期実行、workflow、pipeline
- Bot（Slack / Discord / LINE / X など）
- 外部サービス連携、API連携、webhook基盤
- 開発ツール、CLI、dashboard、admin画面、内部ツール
- プロトタイプ、MVP、PoC
- 既存プロダクト内の**大型の独立機能**（実質1つのサブシステムになるもの）

### 発火しない
- 小さなbug修正
- 定常保守（依存更新、lint、rename、設定調整）
- 既存コード内の軽微な編集・追記
- **同じ目的・同じ制約を扱った新しい調査結果が既にある**（そのセッション内 / リポジトリ内の調査文書。あるなら再調査せずそれを使う）
- Humanが外部調査を明示的に禁止した場合
- Humanが特定の実装方針・特定のライブラリを既に決めており、その決定の再検討を求めていない場合

**迷ったら発火する。** ただし発火は「調査を1往復挟む」だけであり、Humanの意思決定を奪わない。

---

## 2. 前提条件 — GitHub接続の確認（最初にやる）

調査の前に、GitHubへの到達手段を**確認してから**始める。

**優先順**

1. **GitHub MCP**（`mcp__github__*` 系のtool）が使えるならこれを使う
2. 使えなければ**認証済みの `gh` CLI**（`gh auth status` が成功する）を使う
3. どちらも無い場合 → **そこで停止する**

**どちらも無い場合の振る舞い（厳守）**

- 通常のWeb検索で**黙って代替しない**。検索結果の要約は一次情報ではなく、保守状況・ライセンス・実装の実体を確認できない
- 認証・権限・MCP設定を**自分で変更しない**（`gh auth login` を勝手に実行しない、設定ファイルを書き換えない）
- 次のように接続方法を案内して、Humanの返答を待つ:
  - GitHub MCPを繋ぐ（Claude Code内で `/mcp` から GitHub MCP server を追加・認証する）
  - もしくはローカルで `gh auth login` を実行して認証済みにする
  - どちらも用意できない場合、「一次情報で検証しない前提の粗い調査」で進めてよいかをHumanに確認する（明示的な許可が出た場合のみ、限界を明記した上でWeb検索に切り替えてよい）

GitHub接続がある場合、Web検索は**補助**として使ってよい（比較記事、代替候補の発見）。ただし採否の根拠は必ずGitHub上の一次情報に戻して確認する。

---

## 3. 手順

### Step 0. 実装を始めない
コード生成、ファイル作成、scaffold、`npm create` / `create-next-app` の類を**この時点では一切行わない**。
既に書き始めていたら手を止め、この手順に戻る。

### Step 1. 要求を固定する
Humanの依頼から、次を短く言語化する（不明ならこの時点で質問してよい）:

- **目的** — 誰の何を、どう変えるのか
- **必須機能** — 無いと成立しないもの（Nice to haveと分ける）
- **制約** — 技術（言語 / 既存stack / self-host要否）、費用（無料枠・月額上限）、運用（誰が保守するか、SLA、データ所在）
- **最小の価値実証** — 「これが動けば価値があると分かる」最小の観測可能な事象

この4点が曖昧なまま候補を探すと、比較の軸が無くなり調査が無駄になる。

### Step 2. 候補を広く探す
GitHubで**広く**探す。1回の検索で終わらせない。最低3系統の検索軸を使う。

- **機能語**（何をするか）: `slack bot scheduler`
- **課題語**（何を解決するか）: `meeting notes summarizer`
- **代替語 / カテゴリ語**: `self-hosted alternative to X`, `awesome-<領域>` リストを辿る
- **エコシステム語**: `<stack> starter <領域>`, `<API名> integration`

GitHub MCPの例:
- `search_repositories` — クエリは検索条件のみを書き、並び順は `sort` / `order` パラメータで指定する（クエリ文字列に `sort:` を混ぜない）
- 絞り込み修飾子: `language:`, `stars:>500`, `pushed:>2025-01-01`, `license:mit`, `topic:`, `is:not-archived`
- `search_code` — 特定の実装（schema定義、adapter、workflow）を持つリポジトリを見つける
- `search_issues` / `search_pull_requests` — 「その候補が現実に何で詰まっているか」を見つける

`gh` の例: `gh search repos "<query>" --sort updated --limit 30`, `gh repo view <owner>/<repo>`, `gh api repos/<owner>/<repo>`

**広さの目安**: 候補を10件前後まで並べてから絞る。1件目で決めない。

### Step 3. 上位3件までを深く検証する
広く集めた中から**最大3件**を選び、以下を**一次情報**（リポジトリ本体）から確認する。伝聞・要約記事で埋めない。

| 確認項目 | 見る場所 |
|---|---|
| 何ができるか / できないか | README、docs/、`get_file_contents` |
| ライセンス | LICENSEファイル本文 + repo metadataの `license`（AGPL / SSPL / BSL / 商用制限は特に明記） |
| 最終commit日 | `list_commits`（最新1件の日付）、repoの `pushed_at` |
| 最終release日 | `get_latest_release` / `list_releases`（`published_at`） |
| issue / PRへの反応 | 直近のopen issueに maintainer の返信があるか、PRがmergeされているか、放置期間 |
| 導入・deploy手順 | Dockerfile / docker-compose / Helm / Vercel設定 / `.env.example` の実在 |
| 依存サービス | 必須の外部SaaS、DB、有料API、ベンダーlock-in |
| セキュリティ情報 | SECURITY.md、公開されている脆弱性告知、認証まわりの実装、secretの扱い |
| 状態異常 | `archived: true`、fork元が本流、READMEの「unmaintained」「looking for maintainers」表記 |

**日付は必ず具体値で記録する**（"最近活発" ではなく `最終commit 2026-07-28`）。

### Step 4. 評価の規律
- **stars数だけで判断しない。** starsは過去の話題性であって、現在の保守状況でも適合度でもない
- **「安定完成型」と「放置」を区別する。** commitが少なくても、機能が完成し、issueに返信があり、依存が薄く、releaseがsemverで安定しているなら健全。一方、open issueが積み上がり maintainer の反応が消えているものは放置
- **不明点は `UNKNOWN` と書く。** 推測で埋めない。UNKNOWNが決定を左右するなら、それ自体を「承認待ちの次の一手」にする
- **決定的リスク**は候補ごとに1行で言い切る（ライセンス非互換 / 単独maintainer / 認証機構が自作 / 本番実績なし / 依存SaaSが有料のみ など）

### Step 5. 再利用できる資産を特定する
「全部使うか、全部捨てるか」ではない。候補ごとに**部品単位**で拾う。

- 機能（そのまま動くコア）
- UI / 画面構成
- データschema / モデル定義
- workflow / 状態遷移 / job定義
- integration（API client、webhook handler、認証連携）
- deploy資産（Dockerfile、IaC、CI設定、migration）

**採用しなくても学べる資産がある**（schemaと状態遷移は特に流用価値が高い）。

### Step 6. Routeを1つ選ぶ
次の順で検討し、**最善のRouteを1つだけ**選ぶ。BUILDは最後から2番目である。

| Route | 意味 | 選ぶ条件 |
|---|---|---|
| **REUSE** | 既存OSSをそのまま使う | 必須機能を満たし、保守が生きており、ライセンス適合 |
| **BUY** | 既存の有料製品・SaaSを買う | 費用制約内で、自作より安く速く、運用も外部化できる |
| **ADAPT** | 既存OSSをforkして改変する | コアは合うが差分が必要。差分を自分で保守し続けられる |
| **COMPOSE** | 複数の既存物を繋いで組む | 単体では満たせないが、組合せで満たせる。接着部分だけが自作 |
| **DELEGATE** | 人・外部に任せる | 自動化より手運用が安く、頻度が低い |
| **BUILD** | 自作する | 上のすべてが成立しない理由を具体的に言える場合のみ |
| **NO_ACTION** | 作らない | 目的が上位の目標に接続しない、または今やる理由がない。**これも正当なRoute** |

### Step 7. 「そのまま使う / 既存を改変する / 自作する」へ対応づける
選んだRouteを、Humanが即断できる3語のどれかに明確に落とす。

- **そのまま使う** ← REUSE / BUY / DELEGATE
- **既存を改変する** ← ADAPT / COMPOSE
- **自作する** ← BUILD

### Step 8. 最小MVPを提示する
次の5つを必ず含める。**どれか1つでも書けないなら、調査がまだ足りない。**

1. **再利用部分** — 既存物から持ってくるもの（どのリポジトリの何を）
2. **最小追加部分** — 自分で書く最小の差分
3. **まだ作らない部分** — 意図的に落とすもの（後回しにする理由付き）
4. **成功Signal** — 何が観測できたら成功か（観測可能な事象で書く）
5. **停止条件** — 何が起きたら中止・撤退するか（期限・失敗回数・コスト上限）

### Step 9. 実行の手前で停止する
以下は**すべてHumanの承認後**にしか行わない。

- 実装 / コード生成 / scaffold
- `git clone` / fork
- `npm install` / `pip install` / 依存追加
- 外部プロジェクトのコード・スクリプトの**実行**
- build / deploy / 本番設定 / secret登録

承認を待つ間に「準備として少しだけclone」もしない。停止とは停止である。

---

## 4. 出力形式

必ずこの順で出す。

```
## 結論
推奨Route: <REUSE / BUY / ADAPT / COMPOSE / DELEGATE / BUILD / NO_ACTION>
最有力: <owner/repo または製品名>（そのまま使う / 既存を改変する / 自作する）
理由: 1〜2行

## 候補比較
### 1. <owner/repo> — https://github.com/<owner>/<repo>
- 保守状況: 最終commit YYYY-MM-DD / 最終release YYYY-MM-DD (vX.Y.Z) / issue反応: <具体>
- 再利用できる部分: <機能 / UI / schema / workflow / integration / deploy資産>
- 導入負荷: <手順の実体。Docker有無、必要な外部サービス、所要時間の見積>
- ライセンス: <SPDX識別子と、用途上の制約>
- 決定的リスク: <1行>
（2., 3. も同形式。不明な欄は UNKNOWN と書く）

## 最小MVP
- 再利用部分:
- 最小追加部分:
- まだ作らない部分:
- 成功Signal:
- 停止条件:

## 次点と、ゼロからBUILDを採らない理由
- 次点: <候補> — 採らない理由
- ゼロBUILDを採らない理由: <具体的に。「車輪の再発明だから」では不可>
（BUILDを推奨する場合は、上位Routeが成立しない理由を候補ごとに書く）

## 承認待ち
次の一手（1つだけ）: <Humanが Yes/No で答えられる具体的な行動>
```

**「承認待ちの次の一手」は1つに絞る。** 選択肢を並べてHumanに設計させない。

---

## 5. 禁止事項

- 調査を飛ばして実装を始めること
- GitHub接続が無いまま、Web検索の要約を一次情報として扱うこと
- 認証・権限・MCP設定を自分で変更すること
- **外部プロジェクトのコードを実行すること**（承認前は読むだけ。install scriptもbuildも走らせない）
- stars数を主根拠にすること
- 不明点を推測で埋めること（`UNKNOWN` と書く）
- 候補を1件だけ見て結論を出すこと
- 承認を待たずに「ついでに」ファイルを作ること
