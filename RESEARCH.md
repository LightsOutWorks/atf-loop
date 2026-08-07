# RESEARCH.md — Research-First Protocol(攻略本原則)

- Status: **PROPOSAL — docs-only。実装なし。ヒロのmergeをもって採用**
- 作成日: 2026-08-07(情報源カタログの取得日も同日。腐る前提で扱う)
- 位置づけ: **Layer3の手続**(IOS Layer2の整理どおりResearchはGenerationの実装方法)。新原則の発明ではなく、ROADMAP North Star「Factoryは高価な基盤モデルや汎用部品を自前で再開発しない。世界の部品を候補として観測し能力単位で比較する」の手続き化であり、土曜メモのGitHub Prior-Art GateとROADMAP C2(External Capability Radar)の上に乗る。§11(Evidence Driven Governance)に従い、削除条件つきの運用税として導入する。
- 設計過程: 3レーンの情報源を一次確認(実在・read-only取得方法・レート・バイアス)+整合レッドチーム審査 → 審査の矛盾指摘・削減指示を全反映。

---

## 0. 原則

**すべての課題は世界のリサーチから始める。ネット上の情報全てを攻略本のように使い、目的を最短・最速で解決する。ゼロから考えるのは、世界に解決策や情報がないときだけ。**

そして「timebox内で解が見つからなかった」状況に当たったら、それは**FRONTIER(誰も見つけていない解を見つけるチャンス)の証拠**として記録する。

この原則は理念文であり、発火トリガーの定義ではない(トリガーは§1の表のみ)。既存動詞内の定常運用・軽微修正・バグ修正には発火しない。

---

## 1. 3レーンとトリガー

| レーン | 必須トリガー | 成果物 | 効力の限定(重要) |
|---|---|---|---|
| **R1 Model Radar**(①モデルリサーチ=世界のベンチマーク) | モデル交換・新規採用の提案時+使用中モデルの退役予告検知時 | C2 PASS様式のChallenger起票(source fact / vendor claim / inference / unknown の分離、期待利得・費用・リスク・必要Secret、最小canary・rollback) | **ランキングは候補探索のpriorであり採用根拠ではない**(C2既定)。leaderboard順位だけのauto-swapは禁止。採用の最小証拠バーは「可逆swap(ledger据え置き)+事前登録した観測窓+JOURNAL記録」。R1はC3(challenger比較)を代替しない |
| **R2 Solution Prior-Art**(②課題解決事例) | 新component・新依存・新workflow・新機能の**BUILD着手前**(土曜メモPrior-Art Gateと同一) | 4系統調査(同一用途/同義機構/隣接アーキテクチャ/security・failure・incident)の記録+routing 1件: `REUSE / BENCHMARK_ONLY / BUILD / NO_ACTION`(語彙はROADMAP §3と同一意味) | REUSE判定には**(1)ライセンス確認(Hard Boundary: 第三者の権利)、(2)サプライチェーン規律適合**(Domain Aへ持ち込む場合はvendored+pin、lockfile+`npm ci --ignore-scripts`)が必須。NO_ACTIONは正しい結論 |
| **R3 World Prior**(③傾向リサーチ=世の中のランキング) | 表現空間の拡張(genome schema enum拡張PR等)の起案前 | 系統prior digest: どの系統・動詞・ループ形状が求められているかの当たり | **系統priorは参考情報であり拘束的な選定根拠ではない**(裁定書§5どおり、主根拠は既存実証済み資産の流用容易性+ヒロ裁量)。記録は**系統・動詞・ループ形状の水準**に留め、特定タイトルの模倣はしない(CONSTRAINTS: 第三者名称禁止)。**自リポのledger世界信号が立った後は、ledgerがランキングpriorに常に勝つ**(ROADMAP Precedence準拠) |

- **Desire変更時**: R2+R3を実施するが、これは**Desire変更を受けたHowの再導出**であり、Desire表現の前提条件ではない(Layer1 §4: 人間の役割はDesireとBoundaryのみ。欲望表現に工場側の調査ゲートを課さない)。
- **遡及不適用**: 裁定済みのGenome Factory v1建設(Clock B工程)はR2既充足として扱う(裁定書の4視点設計+敵対審査+安全監査が先行調査記録そのもの)。Clock A(ヒロの人間動作)にR-gateは一切かからない。

---

## 2. 品質バー(全レーン共通・1セットのみ)

1. **事前質問**: リサーチノート冒頭に1〜3問を書いてから検索を始める(別建ての登録簿・様式は作らない)。
2. **ラベル**: 事実は C2既定の4分類 `source fact / vendor claim / inference / unknown` でラベルする(独自の格付け総順序は持たない)。
3. **反証も探す**: 支持証拠だけでなく、否定事例・failure・incidentを最低1クエリ探す。
4. **引用可能性**: URL+取得日を残す。GitHub実装を引く場合はcommit SHAで固定する(URLだけでは腐る)。
5. **UNKNOWN規律**: 確認できないことはUNKNOWNと書く。推測を事実にしない。
6. **timebox**: 先行調査は**上限24時間**(通常は1セッション60〜90分)。超過したら現時点の最良情報で決定し、UNKNOWNを記録して先へ進む。これは納期約束(SLA)ではなく調査コストの上限であり、リサーチ自体のPerfect First化を防ぐ装置(ROADMAPは evidence gates, not a calendar promise)。

## 3. FRONTIER規律

- 定義(誠実版): **「timebox内・記録済みの検索クエリと範囲では解が見つからなかった」という事実の記録**であり、「世界に解が存在しない」という断言ではない。
- 記録: 追記式の1ファイル(`research/FRONTIER.md`)に、課題・検索クエリ・範囲・日付を1エントリ数行で追記するだけ。専用schema・登録簿・ツール化はしない。
- 後日、世界に解が見つかった場合はそのエントリに反証追記する。
- FRONTIERに着手する直前は、空振り確認のためR2を再実行する。

---

## 4. 安全境界(v1)

1. **リサーチは有人レーン(Claudeセッション)のみ**。C2の「read-only landscape reconnaissanceは準備として許可」の範囲内であり、新しい動詞を作らない。
2. **v1に機械読み取りdigest層は作らない**。R1/R2/R3の消費者はすべて人間の判断(モデルID差替えPR・BUILD判断・schema拡張PR)であり、無人ループ(Forge/Signals)がリサーチ結果を読む経路は存在しない。これによりWorld→prompt注入の懸念はv1では構造的に不存在(GENOME_FACTORY.md安全不変条件8と無矛盾)。機械層digestは「機械の消費者が実在する証拠」が出てから、genome schemaと同一のホワイトリスト規律+消費側再検証を条件に追加を検討する(§18: 迷ったら追加しない)。
3. **無人リサーチjobは「外部通信の新動詞」**: ヒロ承認+ROADMAP §3 Autonomy Is a Means発火条件(a)-(e)の記録済み証拠が揃うまで**NO_ACTION**(隔離設計の詳細は発火時に設計する。W0Aと同型の条件付きgate構造)。
4. **外部の自由文(issue本文・コメント・記事)は非信頼**として扱う。リサーチノート(`research/`配下)は自由文を含んでよいが、無人ループのread pathから構造的に到達不能とする。将来セッションがノートを文脈として読む場合は「人間レビュー(merge)済みのノートのみ参照」を運用規律とする。
5. **正本規律**: RESEARCH.mdと`research/`配下は**F3決定論routingの機械入力ではない**(機械入力はCURRENT_STATE/ROADMAPのcanonical 2 blockのまま。第二の正本を作らない)。RESEARCH.mdのmergeはC2のgate statusを変更しない — statusはcanonical blockのみが持ち、run証拠で更新する。

## 5. 効果測定と削除条件(§11準拠)

リサーチノートに毎回3項目だけ残す: **調査所要時間 / 判断が変わったか(変更率) / routing結果(REUSE命中・FRONTIER発生)**。「リサーチ先行が最短」はそれ自体が仮説であり、この記録が反証(例: 変更率が恒常的にほぼゼロ=調査が運用税)を示したらR-gateのトリガーを縮小・削除する。

---

## 6. 情報源カタログ(付録・2026-08-07時点の一次確認済み初期値)

腐る前提の参考資料であり正本ではない。使用時に実在・仕様を再確認する。★=そのレーンの起点。R3のカタログは現行媒体仮説(ブラウザトイ)に条件付きであり、媒体が変われば差し替える。

### R1 Model Radar

| 情報源 | 何が取れるか / 注意 |
|---|---|
| ★ Anthropic公式リリースノート+Models API <https://platform.claude.com/docs/en/release-notes/api.md> | モデル追加・**退役予告**・価格・API仕様の正本(本環境で直接fetch可を確認)。Models APIでモデルID実在・structured outputs対応を機械検証してからswap PRを書く。ベンチ数値は自己申告扱い |
| ★ Artificial Analysis <https://artificialanalysis.ai/> | 独立再実行の能力×コスト×速度を1画面比較。日次更新。Indexの重み付けは同社裁量 |
| LMArena <https://lmarena.ai/leaderboard> | 人間投票Elo(好まれ方)。迎合バイアスあり、僅差はノイズ |
| SWE-bench Verified/Pro/Live <https://www.swebench.com/> | エージェント的コーディング。Verifiedは上位飽和につきPro/Live/Terminal-Bench併読。成績は「モデル+scaffold」 |
| Terminal-Bench <https://www.tbench.ai/> | 端末E2Eエージェント。scaffold混在が激しく同一scaffold行のみ比較。版(1.0/2.0/Hard)を必ず記録 |
| Aider Polyglot <https://aider.chat/docs/leaderboards/> | 構造化編集の遵守率=strict JSON規律の代理指標としてgenome生成と相関期待 |
| Epoch AI <https://epoch.ai/benchmarks> | 独立評価・方法論最透明・データDL可。ベンダー申告の裏取り用 |
| LiveBench <https://livebench.ai/> | 汚染対策・客観採点。フロンティア追随が遅いことがあり掲載範囲を確認 |
| OpenRouter Rankings <https://openrouter.ai/rankings> | 実流通量=世界の顕示選好。能力判断には使わず採用トレンド・コスト相場の観測専用 |
| アグリゲータ(llm-stats.com等) | 一次ソースの横断ミラー。単独では信用せず必ず2ソース以上で同値確認(三角測量専用) |

推奨cadence: **イベント駆動が主**(リリースノート週1目視・退役予告の検知は欠かさない=使用中モデルの退役は無人ループ停止リスク)+月1の定点観測(Artificial Analysis+LMArena+SWE-bench Pro/Terminal-Bench+Epochの4点、30〜60分)+swap提案時のフル1周。digestには自前決定論テスト結果(ajv合格率・再抽選率・敵対コーパス通過)を併記する — 公開ベンチでは測れないForge安定性が交換判断の最重要項目。

### R2 Solution Prior-Art

| 情報源 | 何が取れるか / 注意 |
|---|---|
| ★ GitHub repo/code/issue search(MCP/gh CLI/REST) | 本環境でlive動作確認済み。実証構文例: repo `topic:procedural-generation topic:game stars:>100`、code `"genetic algorithm" "game" language:javascript`、issue `"prompt injection" sandbox label:security`。search APIは30req/分。topic複数ANDは0件になりやすく1 topic+語句が正解。**closed issue+linked PRが最良の「解いた証拠」、open issueは失敗事例** |
| ★ awesome-lists(`topic:awesome <分野>`) | 分野の地図。リストのlast commitを必ず確認(staleness) |
| GitHub Trending <https://github.com/trending> | 週次定点観測用(公式APIなし・ハイプバイアス) |
| GitHub Advisory DB <https://github.com/advisories> | security系統の一次情報。「該当なし」は安全の証明ではない |
| HN Algolia API <https://hn.algolia.com/api> | 議論・postmortem・Show HN全文検索。認証不要(本環境からは直接egress不可→WebSearch経由) |
| arXiv API | 学術先行研究。1req/3秒厳守。論文は「機構のアイデア源」でありADOPT対象にしない |
| Reddit | 2026-05以降、無認証`.json`は恒久廃止。OAuth化は新Secret=ヒロ承認境界につき安易に選ばず、`site:reddit.com`のWebSearchで代替 |
| X/Twitter | **本レーンから除外と裁定**: read-onlyの無料経路が2026年時点で存在しない(web検索ログイン必須・API読み取り従量課金)。HN+Redditで代替。課金採用は決済+外部通信=ヒロ承認事項で、現時点で費用対効果の根拠なし |

実務手順(Prior-Art Gateの具体化): Phase 0(10分)課題を3行定式化+同義語列挙 → Phase 1(30分・上限40repo)4系統×各2〜3クエリ、各repo 30秒判定で記録 → Phase 2 有力5件をREADME/LICENSE/SECURITY/issue深掘り → routing 1件確定。

### R3 World Prior(現行媒体仮説=ブラウザトイに条件付き)

| 情報源 | 何が取れるか / 注意 |
|---|---|
| ★ itch.ioブラウズ/タグ別ランキング <https://itch.io/games> | Popular/New&Popular/Top rated、タグ別・HTML5絞込可。**ほぼ全ページがURL末尾`.xml`で公式RSS化可能**。popularは自己強化バイアス。実験場としては最良、商業維持率の証拠にはならない |
| ★ ゲームジャム結果(Ludum Dare <https://ldjam.com/>、GMTK <https://itch.io/jam/gmtk-2025/results>、js13kGames <https://js13kgames.com/>) | **ATF genomeの表現力に最も近いスケールで「mechanic単体の面白さ」が数千作規模で相互評価される最重要ソース**。js13kは「単一HTML・極小・通信なし」の実証コーパスそのもの。開発者審美眼バイアス・テーマ縛りに注意。結果公開後1〜2週以内に上位+講評を収穫 |
| CrazyGames /hot・/new+開発者docs <https://docs.crazygames.com/> | 商業ブラウザポータルの人気実績+「ポータルが定義する成功条件」の一次資料(=収益化可能性の定義であり面白さの定義ではない)。公開APIなし・人間閲覧+手動記録。**模倣サイト(crazygames-poki.com等)が検索上位に混入 — 正本URLリストで防御** |
| Poki /en/popular+developers.poki.com | 2大ポータルのもう片方(低年齢バイアス)。Developer Spotlightはヒット作の事後分析=解決事例 |
| Steam公式チャート(キー不要JSON API実在: ISteamChartsService)+Games-Stats.comタグ別推計 | 系統の商業スケール逆算用(客層は別世界につき直接の当たり付けには使わない)。SteamDBはスクレイピング禁止=人間閲覧専用 |
| AppMagic四半期分析+Sensor Tower年次要約(無料要約経由) | hyper/hybrid-casualの系統トレンド。方向感のみ転用、KPI水準は転用しない |
| Twitch(SullyGnome等)/YouTube Gaming chart | 配信者経由バズの兆候。観て面白い≠遊んで面白い。自己強化が全ソース中最強 |
| Newgrounds | 補助(実験的小品の系統観測) |

推奨cadence: 週次30分(itch RSS+CrazyGames hot+Poki popularの目視、新出系統の有無だけ記録)+月次深掘り(独立ソース横断出現数の更新)+ジャム結果のイベント駆動収穫+表現空間拡張の起案時のトリガー実行。

### 運用前提(本環境の実測)

- 現CCR環境のegress proxyは itch.io / crazygames.com / steampowered.com / lmarena.ai / arxiv.org 等への直接fetchを遮断(WebSearch経由で代替可、platform.claude.comは直接可、GitHubはMCP/git proxy経由で可)。定常リサーチ運用時はproxy許可リストへ正本ドメイン追加が必要。
- 検索結果の模倣サイト対策として、本カタログのURLを正本リストとして扱い、リスト外の類似ドメインは採用しない。

---

## 7. 既存正本との関係

- 本文書はLayer3手続であり、OS.md(Layer1)を変更しない。ROADMAP §7の変更様式(rollback/削除条件つき)で導入し、証拠が消えたら削除する(§5の測定がその根拠になる)。
- R1はROADMAP C2の実装、R2は土曜メモPrior-Art Gateの一般化、R3はGenome Factory裁定(GENOME_FACTORY.md)の表現空間拡張PR経路への入力。いずれも新gateを発明しない。
- `research/`配下の構成: `research/FRONTIER.md`(追記式)+1課題1ノート(自由文可・人間merge)。正本3文書(OS/CURRENT_STATE/ROADMAP)の複製・要約をここに書かない(第二の正本禁止)。
