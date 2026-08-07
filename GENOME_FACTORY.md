# Genome Factory v1 — Dual-Clock Pure Genome Factory(採用裁定案)

- Status: **PROPOSAL — docs-only。実装なし。ヒロのmergeをもって裁定確定**
- 作成日: 2026-08-07
- 起点: 2026-08-08 18:20 JST 以降(土曜再開メモの停止条件を尊重。本PRは実装・workflow実行・Secret操作を一切含まない)
- 設計過程: 4視点の独立設計(収益最短 / 構造安全 / 進化構造 / 実装最小)→ 2系統の敵対審査(実現性・北極星整合)+ 防御的安全監査 → 統合。3要素(AI純関数化・deploy-pages公開・二重クロック分離)は4案が独立に同一結論へ収束した。

---

## 0. 結論

Genome Factory原案の骨格(権限ゼロAI → toy-genome.json → 固定Renderer → 検証 → 公開、重大事故リスト、ヒロ承認境界)は**採用**。その上に、審査を生き残った改良だけを載せる。

ヒロの「もっと固定観念をぶっ壊したウルトラCがあるなら採用して」への回答は次の3つ。

1. **AIをagentから純関数へ降格する。** 原案は「権限ゼロのAI」と言いながら、agentハーネス(gh-aw / CLI)がrunner上に残る前提だった。AIをtoolなしMessages API 1回のHTTPS呼出(JSON in / JSON out)にすれば、土曜メモで実証済みの境界不成立クラス(key読取・repo書換・env伝播)は緩和ではなく**消滅**する。gh-aw適合canaryは概念ごと不要になり、Codex content gateも自由文字列ゼロschemaで恒久廃止できる。能力の制限に見えるこの一手は、実際には検査・依存・工程の大量削除として返ってくる。
2. **1円検証の時計をFactory完成から切り離す(二重クロック)。** 全工程で最長かつ唯一制御不能な区間は「未知の第三者が支払うまでの世界待ち時間(3〜8週)」であり、その開始条件はFactoryではなく「公開+決済導線」。材料(完成済み24作)と実行者(ヒロの人間動作)は今日すでに揃っている。8/8にitch.io口座+payout手続を開始し、8/9-10に既存最良3〜5作を公開すれば、観測窓は原案比で約2週早く開く。Factory完成が数日滑っても収益クロックは一切影響を受けない。
3. **自己改善=コードの進化ではなくデータの進化。保存は初日から、淘汰は証拠から。** 学習状態は100%データ(genome履歴+世界信号のappend-only ledger)としてrepoに蓄積する。rollback = git revert。モデル交換 = ledger据え置きでモデルID差し替えのみ(Capability First複利)。ただし淘汰・蒸留など**信号を消費する機構は、信号が非ゼロと実証されるまで作らない**(§18「まず測る」)。AIのkeep/discard動詞は初版から剥奪する — AI自己審判はNo Teacher違反の隠れた教師であり、Selection Record v1捏造事案の再生産経路だから。

採用名: **Dual-Clock Pure Genome Factory(双時計・純関数ゲノム工場)**。

North Starは変えない。デザイア連鎖も変えない: 北極星 ← 不労所得で生活 ← 第三者から確定実収益1円 ← Factory v1。

---

## 1. 壊した固定観念

### 原案が既に壊したもの(維持)

| 固定観念 | 置換 |
|---|---|
| 強力なAIを監視・審査して安全に使う | AIに危険な動詞そのものを与えない。AIはコードを書かず、enum/有界数値のみのgenomeだけを生成する。悪い作品は安全審査でなくWorldの「遊ばない・払わない」で落とす |

### 本裁定でさらに壊すもの

| # | 固定観念 | 置換 |
|---|---|---|
| 1 | AIを動かすにはagentハーネス(gh-aw / Claude Code CLI / Codex CLI / OAuth token)がrunner上に要る | AIは純関数。toolなしMessages API 1回のHTTPS呼出(strict JSON Schema+max_tokens上限)のみ。runner上にAIのプロセス・シェル・ファイルシステムは存在しない |
| 2 | 1円検証はFactory完成の後(完成→itch投入→3〜8週待ちの直列) | 二重時計並列化。1円のクリティカルパスはFactoryと完全独立。完成済み24作+ヒロの人間動作のみで世界クロックを約2週前倒しで起動 |
| 3 | 公開にはrepo write(contents:write+push)が要る | actions/deploy-pages+OIDC(contents:read / pages:write / id-token:write)。mainはAIループから構造的にread-only。integrity check(成功偽装検出)は検査対象ごと消滅 |
| 4 | 違法・不適切コンテンツは公開前にAI審査(Codex gate)で落とす | genome schemaから自由文字列型を完全排除(全fieldはenum/有界整数/固定長配列、titleは人間全数レビュー済み語彙bankへのindex列)。不適切表現は「検査で落とす対象」から「表現不能」へ |
| 5 | Rendererがgenomeを安全に解釈することを検証し続ける | テンプレート・サンドイッチ。artifact=固定player.htmlの非実行data island 1穴へのcanonical JSON文字列挿入と定義し、検証を「ajv検証+穴以外バイト等価」の2等式に縮退。meta CSPで三重防御 |
| 6 | 安全性はAIの挙動を3日間のcanaryでテストして確かめる | 脅威モデルを「モデルAPIから任意バイト列(サイズ上限内)が返る」に固定。モデルを迂回して最悪ケースJSONを直接注入する決定論CIテスト群+E2E canary 1本に置換。被覆は無限の挙動空間から有限の入力境界へ移り、むしろ広がる |
| 7 | World信号を取るには作品内テレメトリが要る(CONSTRAINTS正面衝突) | 計測点をプラットフォーム端へ。作品は今後も一切通信せず(CONSTRAINTS無改定)、itch.io公式server APIの累積値をAI不在jobがスナップショット差分で収穫。帰属は「1作=1itchプロジェクト」の物理対応 |
| 8 | keep/discard判断はAIの動詞 | 選別をAIの動詞から完全剥奪。初版は「最新の有効genomeを公開+全genome/全信号のappend-only保存」のみ。淘汰は事前登録閾値(repo commit済み)到達で決定論コードが自動起動し、同時にヒロの暫定評価も自動退役(§13の機械化) |
| 9 | 自己改善=コード/プロンプトの改善 | 学習状態は100%データ(ledger)。rollback=git revert。モデル交換=ledger据え置きで即日。「外部知能の進化を取り込む速度=データ資産の再利用速度」 |
| 10 | 使い捨て公開枠の上書きでよい(=前世代の適応度を観測する前に個体を殺す) | 「枠は使い捨て、記録は不滅」。公開枠は単一・上書きのままだが、全genomeと全信号をappend-only保存するため観測は消えない。N枠個体群・MAP-Elites淘汰は証拠成立後の候補に降格 |
| 11 | 最速化=Factory完成日の短縮 | 支配項は制御不能な世界待ち時間(3〜8週)。完成日の数日短縮より観測窓の2週前倒しの方が3デザイア全てに大きい |

---

## 2. アーキテクチャ

### 設計原理(4行)

1. 脅威モデルは「AIが悪意を持つか」ではなく「**モデルAPIから任意バイト列(サイズ上限内)が返ってくる**」に固定する。安全性の証明からモデルが消え、全テストが決定論になる。
2. 安全は検査でなく「**権限・経路の不存在**」で成立させる(Control Is The Last Resort)。
3. 速度は**世界クロック(1円観測窓)の起動を建設クロックから独立**させることで最大化する。
4. 複利に効く投資は**データ(ledger)のみ**。信号を消費する機構(淘汰・蒸留)は信号非ゼロの証拠が出てから足す。**保存は安い、消費は証拠待ち。**

### コンポーネント(すべてrepo内固定物・AI不可触・変更は人間PR+ヒロmergeのみ)

| # | 物 | 内容 |
|---|---|---|
| 1 | `genome.schema.json` | JSON Schema 2020-12。全objectに`additionalProperties:false`、全fieldはenum/有界整数/有界number/固定長配列のみ。**自由文字列型ゼロ**(CIメタテストで恒久断言)。`title_words`=語彙bankへのindex整数2〜3個。mechanic=enum(初期値1系統のみ。2系統目以降はenum拡張PR=ヒロ承認の「新しい動詞」経路)。`__proto__`/`constructor`等の危険キーはajvとcanonical化で拒否 |
| 2 | `vocab-bank.json` | 英単語約200語。ヒロが1回全数レビュー(商標・固有名詞・不適切語の不在確認)。拡張はヒロ承認PR |
| 3 | `player.html` | 全作品共通の固定シェル。既存works/の最良seed 1本をパラメータ化リファクタして作る。唯一の可変部は`<script type="application/json" id="genome">`のdata island 1穴。meta CSP: `default-src 'none'; script-src 'sha256-<固定script hash>'`。CONSTRAINTS準拠(外部通信ゼロ・単一HTML)。変更PR時のみAST静的検査(eval/Function/innerHTML/document.write/insertAdjacentHTML/動的import不在) |
| 4 | `forge.mjs`(約100〜150行) | desire.json(Human Desire定数)+ledger(read-only)からプロンプト組立 → Messages APIをtoolなし・strict json_schema・max_tokens上限で1回fetch → **stop_reason分岐を明示実装**(`refusal`/`max_tokens`/不正JSONは無条件破棄・再抽選最大3回・全滅はfail-closed停止=許容損失)→ 合格genomeをcanonical JSON化しplayer.htmlの穴へ文字列挿入 → 穴以外バイト等価を自己確認 → 既存smoke.mjs+interaction-smoke.mjsを**品質ゲート**(安全ゲートではない)として実行 → immutable artifact(genome.json+toy.html+site/+sha256)をupload |
| 5 | release検証script | pinned ajv+pinned templateでschema検証とサンドイッチ・バイト等価を**再実行**、sha256一致確認、works/24作カタログ+Factory単一slotを1つのPagesサイトに合成してdeploy |
| 6 | `signals.mjs`+`ledger/` | AI不在の決定論script。itch公式server APIの累積値(views_count/downloads_count/purchases_count)を定期スナップショットし、差分を`ledger/signals.json`へ追記(**数値+enum作品IDのみ。自由文なし=World→prompt注入の構造的遮断**。欠損はVOID扱いでFAIL学習しない)。あわせて公開済みgenome(Forge artifact経由・ajv再検証済み)を`ledger/genomes/`へアーカイブ。公開日時・itch反映日時を共変量として必ず記録(将来の淘汰の交絡対策を初日から仕込む)。非公開のsession認証エンドポイントは使用禁止 |
| 7 | `thresholds.json` | 淘汰起動の事前登録閾値(例: 「ある作品の14日窓views差分≥100」または「purchases_count≥1」)。初日からcommitし、AI・運用のどちらも後出しで動かせない。到達判定はAI不在の決定論scriptが行う |
| 8 | **廃止物** | 旧factory.yml(contents:write・persist-credentials)、`CLAUDE_CODE_OAUTH_TOKEN`、`CODEX_AUTH_JSON`、Codex content gate、agentハーネス一切、gh-aw適合canary |

### job構成(workflow 3本・信頼ドメイン2つ。ドメイン間の接続はartifactとledgerファイルのみ)

```text
【Domain A: AI接触・repo write不在】
  Forge job    permissions: contents:read のみ
               Secret: ANTHROPIC_API_KEY 1個(専用workspace・Console側spend hard cap)
               timeout 15分・concurrency:1・schedule(週1)+workflow_dispatchのみ
               forge → ajv → 挿入 → バイト等価 → smoke → immutable artifact
        ↓ artifact + SHA
  Release job  モデルSecretなし・git credentialなし
               permissions: contents:read + pages:write + id-token:write
               pinned ajv+templateで再検証 → sha256一致 → deploy-pagesで単一Pages枠を全置換
               不一致はfail-closed。rollback=前回artifactの再デプロイ

【Domain B: AI不在・決定論】
  Signals/Ledger workflow   cron(日次)。Secret: ITCH_API_KEY(読み取り専用)のみ
               モデルSecretはこのworkflowに存在しない(Secretはドメイン間で相互不可視)
               本システム唯一のcontents:write: 固定script・固定append-onlyパス(ledger/配下)のみ・
               schema(数値+enum)検証後commit・AIから起動不能
               commitが固定path以外に触れないことをCIで断言
```

### データフロー(1周=1週間)

```text
Human Desire定数 + ledger(数値のみ・read-only)
        ↓
Forge(純関数API 1回) → genome.json → (ajv) → 固定player.htmlへ挿入
        ↓ (バイト等価+smoke)
immutable artifact + SHA → Release(再検証) → Pages単一slot(+24作カタログ)
        ↓
ヒロが週次約10分で最良作をitchへ手動反映(AI生成開示タグ付き・1作=1プロジェクト)
        ↓
World(itch累積統計・支払) → Signals(スナップショット差分) → ledger → 次週のForge入力
```

ループ内で実行されるAI出力は存在しない。

### 進化ループ(段階制・遷移は事前登録閾値による自動起動)

- **Phase 0(保存期・初日から)**: AIの動詞は変異(genome生成)と探索方針のみ。公開は「最新の有効genome」。全genome・全信号・公開日時共変量をappend-only保存。keep/discardは存在しない。ヒロの暫定評価は任意の数値列としてledgerに置ける(構造上不要・§13準拠)。
- **Phase 1(淘汰期・thresholds.json到達で自動起動)**: AI不在の決定論scriptがledgerのWorld数字から優良genome系統を選び、Forgeのprompt入力(参照genome集合)の重み付けに反映。同時にヒロ暫定評価は自動退役(退役に人間の判断を挟まない=§13の機械化)。
- **Phase 2(拡張期・すべてヒロ承認の「新しい動詞」)**: mechanic 2系統目、公開枠の複数化、外部導線、W0A発火条件を満たした場合のみの自動化検討。
- **モデル交換**: ledger据え置きでモデルID(workflow env)を人間が差し替えるだけ。プロンプト・コードの移植ゼロ(Capability First複利)。

### World信号の定義

- 一次センサー: itch公式server APIの累積値のスナップショット差分。帰属は1作=1itchプロジェクト。
- **「検出」と「受領」の分離**(無留保の日付を約束しないため):
  - 検出 = `purchases_count ≥ 1`(API即日観測可能)。小デザイアの一次マイルストーン。
  - 受領 = payout着金。itch.ioはpayout最低$5.00・税務インタビュー必須・全payoutにスタッフレビュー7〜14日(初回は特に厳格)。検出から構造的に数週遅れる。
  - PWYWの最低取引額(約$1)により文字通りの「1円」支払は不可。「1円以上」条件は満たす。
- 新規アカウントのオーガニック到達はほぼゼロが既定であることを設計前提に含める(外部導線はヒロの任意の人間動作)。
- GitHub Pagesは無料ショーケース(センサーではない)。作品内テレメトリは不採用のままCONSTRAINTS無改定。

### Lane A(収益クロック・人間動作のみ・AIの動詞増加ゼロ)

- 8/8: W0裁定文PR(「itch公開はW0の主経路確定ではなく、1円観測窓の開放+最初の世界センサーとして先行する。W0比較canaryの地位は不変」)をヒロがmerge(記録規律の維持)。itchアカウント作成+税務インタビュー+payout設定を最優先で開始(**payoutレビュー7〜14日の外部レイテンシがここにあるため**)。
- 8/9-10: works/24作から最良3〜5作をヒロが主観キュレーション(統計蒸留ではないと正直に扱う)し、1作=1プロジェクト・PWYW(最低0円)+支援CTA・AI生成開示タグ付きで公開、Pagesカタログと相互リンク。
- 以後: Factory稼働後は週次約10分で最良新作を差し替え/追加。

---

## 3. 安全不変条件

1. AIはrunner上のプロセスとして存在しない。toolなしMessages API 1回のHTTPS呼出のみで、AIから見える世界はプロンプト文字列だけ。Secret・シェル・ファイルシステム・repo write・deployへの経路が構造上不存在(土曜メモ実証の事故クラスの消滅)。
2. モデルSecretはForge workflowの`ANTHROPIC_API_KEY` 1個のみ。専用workspaceにConsole側spend hard capを設定。モデルkeyはrunner側fetchに使われるだけで、AI出力から到達経路がない。
3. AI出力の唯一の強制点は**runner側ajv**: 境界値・文字クラス・固定長配列・危険キー・`additionalProperties:false`を全て検証。Structured Outputsのサーバー側強制(enum/const/additionalProperties:falseのみ)には依存しないと文書化。`stop_reason ≠ end_turn`と不正JSONは無条件破棄、再抽選最大3回、全滅はfail-closed停止。
4. genome schemaに自由文字列型ゼロ(CIメタテストで恒久断言)。表示され得る文字列の全集合=人間全数レビュー済み語彙bank×固定UIラベルという有限集合。不適切・違法コンテンツは検査対象ではなく表現不能。
5. AI出力はeval・実行・展開されない: genomeは固定player.htmlの非実行data island 1穴へのcanonical JSON文字列挿入のみ。検証は「ajv+穴以外バイト等価」の2等式。meta CSPでブラウザ層を含む三重防御。
6. AIループ(Forge/Release)にcontents:write・persist-credentials・git credentialは存在しない。公開はdeploy-pages+OIDCによる単一Pages枠の全置換のみ。mainはAIループからread-only。rollback=前回artifactの再デプロイ。
7. contents:writeを持つのはAI不在のSignals/Ledger workflowただ1本: モデル呼出なし・固定script・固定append-onlyパスのみ・schema検証後commit・AIから起動不能。Secretは2ドメイン間で相互不可視。
8. World→AIの入力はledgerの数値+enumのみで自由文が構造的に不存在(itch上のコメント等がprompt注入経路になることを遮断)。欠損はVOIDでありFAILとして学習しない。
9. Workflow・player.html・genome schema・語彙bank・thresholds・予算上限・モデルID・公開先はAI不可触。変更は人間PR+ヒロmergeのみ。player.html変更時はAST静的検査必須。
10. 選別・淘汰・予算・公開先割当はAIの動詞に含まれない。淘汰は事前登録閾値到達後にAI不在の決定論コードのみが実行。審判が存在しないため「AIによる審判・予算・Publisherの自己改変」は構造的に不可能。
11. 外部hard cap: Console workspace spend limit・timeout 15分・concurrency:1・週1 cadence・使用actionsのfull SHA pin。公開枠は単一・上書き型で増殖経路なし。
12. itchへの書込(公開・差替え)は全てヒロの手動動作。`ITCH_API_KEY`は読み取り専用でSignals workflowのみに存在。
13. 重大事故リスト6項目と許容リスト(退屈・低品質・売上ゼロ・失敗run・一時的表示不具合・上限内少額損失)は原案のまま不変。

---

## 4. 検証・canary計画(決定論化。専用3日フェーズは廃止)

| # | 検査 | 実行タイミング |
|---|---|---|
| 1 | 敵対的genomeコーパスの常設CIテスト(モデル迂回): scriptタグ断片・URL・巨大値・unicodeトリック・危険キー・境界外数値・schema適合だが極端な値をForge出力点へ直接注入し、全ケースで「破棄される or 穴以外バイト等価」を断言 | 実装日に同梱、以後毎PR/毎run |
| 2 | E2E canary 1本: (a)敵対的genomeでのartifact拒否/バイト等価 (b)Release job環境のenv全キー列挙によるモデルSecret不在断言 (c)GITHUB_TOKENでのrepo write試行が403になることの断言 (d)単一枠上書き確認と前回artifact再デプロイによるrollback実地訓練1回 | dry-run→初回実run |
| 3 | spend cap確認: Console支出上限の存在確認+超過時APIエラーのfail-closed処理確認 | 1回 |
| 4 | itch API粒度canary: 公式API累積値の更新頻度・ブラウザプレイのviews_count計上・purchases反映遅延を実測し、Signalsの差分設計と閾値初期値を較正(旧gh-aw適合canaryの完全置換。未証明度が最も高い点に検証を振り替える) | 8/11-16(Lane A公開物を利用) |
| 5 | schemaメタテスト(常設CI): 「制約なきstring型ゼロ」「全数値に境界あり」「additionalProperties:false全域」「危険キー拒否」を断言 | 毎PR |
| 6 | player.html AST検査+CSP hash再計算 | 変更PR時のみ |
| 7 | Ledger append-only検査(常設CI): commitが固定path以外に触れないことの断言+ledger schema検証 | 毎run |
| 8 | stop_reason分岐の決定論テスト: refusal/max_tokens/不正JSON/3連続失敗→fail-closed停止で正しく終わることを確認 | 毎PR |

---

## 5. 採用しなかったもの

| 要素 | 却下理由 |
|---|---|
| agentハーネス一切のrunner上実行(gh-aw / Claude Code CLI / Codex CLI / OAuth token)とgh-aw適合canary | 土曜メモで境界不成立が実証済みのクラスへの回帰。純関数化により概念ごと不要。両審査で採用禁止 |
| Codex content gateと`CODEX_AUTH_JSON`の存続 | 自由文字列ゼロschema+語彙bankにより審査対象の自由表現が表現不能になった以上、確率的検査+Secret 1個+ベンダー依存は証拠なき運用税(Minimum Governance違反) |
| AIループ内のcontents:write・persist-credentials・mainへのpush+integrity check一式 | 権限レベルから消せるものを検査で守る構成への回帰。書き手が存在しなければ成功偽装検出も不要 |
| butlerによるitchへの自動push | ROADMAP W0A「Autonomy Is a Means発火条件を満たす場合だけ自動化候補」に違反。週10分の人間動作を新Secret+外部自動書込経路+アカウント停止(=1円経路とセンサーの全喪失)リスクと交換する証拠がない |
| MAP-Elites・bin定義・genome距離・Select job・N=6〜10公開スロットの初版実装 | 世界信号が非ゼロと実証される前の淘汰機構は§18違反のPerfect First。購買適応度は数ヶ月ゼロが既定、views適応度はfeed最新性バイアスと交絡し「push頻度を最適化する劣化圧」になる。bin/距離指標は決定論の顔をした隠れた教師 |
| AIのkeep/discard動詞 | AI自己審判はNo Teacher違反の隠れた教師であり、Selection Record v1捏造事案(実証済み失敗様式)の再生産経路。世界信号成立までAIの動詞は変異のみ |
| 8/12時点のitch初期統計による拘束的なmechanic蒸留決定 | 新規アカウント公開直後の作品別viewsは各作0〜数件でノイズ選択そのもの。ヒロの主観キュレーション(参考prior)として正直に扱い、初期mechanic選定の主根拠は既存実証済みseedの流用容易性に置く |
| 非公開のitch日次集計エンドポイント(session認証)のCI利用 | 非公開・セッション認証依存でCI組込が脆弱。公式server API(累積値)のスナップショット差分のみを使う |
| workflow artifact(90日失効)を長期学習記憶として恒久採用 | World信号の立ち上がりが月単位である以上、学習開始前に記憶が消える。複利の母体に失効期限を付けるのは北極星と矛盾 |
| Structured Outputsのschema制約がサーバー側で強制される前提の安全証明 | 数値境界・文字列長・固定長配列・patternはサーバー側で強制されない。runner側ajvを唯一の強制点として設計・文書化して解消 |
| 「1円観測窓が8/9に開く」等の無留保の日程主張 | 検出(purchases_count≥1)と受領(payout: $5最低+税務手続+レビュー7〜14日)の分離なしに日付を約束しない |
| 作品内テレメトリのためのCONSTRAINTS(Soft Boundary)解除申請 | プラットフォーム端計測で個体別帰属が立つため解除そのものが不要。制約を解除するのでなく、制約が問題にならない構造を選ぶ(Control Is The Last Resort) |
| gh-aw(Public Preview)の基盤採用 | 採用基盤が減る方向が正。実証済みのnative Actions境界のみで組む。稼働後のC2 Radar通常Challengerへ降格 |

---

## 6. 日程(計画基準は「標準」。最短は宣伝値扱い)

### Clock A: 収益・世界クロック(人間動作のみ・Factoryと完全並列)

- 8/8(土): W0裁定文PRのmerge(10分)→ itchアカウント作成+税務インタビュー+payout設定開始(外部レイテンシ7〜14日のため最優先)。
- 8/9-10: 最良3〜5作をキュレーション公開(1作=1プロジェクト、PWYW+支援CTA、AI生成開示タグ、Pages相互リンク)。→ **検出窓がここで開く**。ただし「窓が開く」ことと「信号が来る」ことは別(オーガニック到達ほぼゼロが既定)。
- 1円クロック: 一次マイルストーン「検出」の標準見込みは公開起点6〜8週で9月中旬〜10月上旬(原案の8/22起点比で約2週前倒し。それ以上の日付は約束しない)。「受領」は検出からさらに+2〜4週。

### Clock B: Factory建設クロック

| 期間 | 作業 |
|---|---|
| 8/8-9 | 旧Secret失効(`CLAUDE_CODE_OAUTH_TOKEN`・`CODEX_AUTH_JSON`)+旧factory.yml無効化+`ANTHROPIC_API_KEY`新設(専用workspace+spend cap)+genome.schema.json+vocab-bank(ヒロ全数レビュー)+schemaメタテスト |
| 8/10-13 | player.html(既存最良seed 1本のパラメータ化リファクタ・1 mechanic・CSP hash・AST検査・既存smoke接続)— **日程の最大分散要因につき2〜3日+予備1日** |
| 8/13-14 | forge.mjs+Forge workflow |
| 8/15 | Release workflow(pinned再検証+deploy-pages+カタログ合成) |
| 8/16 | Signals/Ledger workflow+thresholds.json事前登録commit |
| 8/11-16 | itch API粒度canary実測(Lane A公開物を利用) |
| 8/17-18 | 敵対的コーパス常設CIテスト+E2E canary+rollback実地訓練 |
| 8/19-20 | E2Eバッファ+初回実run |

- **標準完成 8/20(木)**。最短(宣伝値)8/16、バッファ込み上限 8/22。原案標準8/31より約1.5週前倒し。完成が数日滑ってもClock Aは一切影響を受けない。
- 8/22以降: 週1 run定常運用+ledger蓄積。閾値到達でPhase 1が自動起動(現実的にはトラフィック水準から月単位先と想定。それまで設計は保存モードで壊れない)。

---

## 7. ヒロの作業

### 承認ポイント(新しい動詞のみ。既存動詞内は完全自動・恒常承認ゼロ)

1. 8/8のW0裁定文merge
2. itch口座・税務・payout・公開・週次差し替え(ヒロ自身の人間動作であり、AIへの動詞追加ではない)
3. 新mechanic追加=genome schema enum拡張PR
4. 語彙bank拡張(全数レビュー付き)
5. 外部通信・決済・個人データに触れる一切の新動詞
6. 公開枠の複数化・外部導線・自動化(W0A発火条件の充足記録が前提)
7. player.html変更PR(AST検査付き)
8. thresholds.json(淘汰閾値)の変更

### 時間見積

- 初週(8/8-9): 合計約3〜4時間(W0裁定文10分 / itch口座+税務+payout約1時間 / キュレーション・公開約2時間 / Secret失効+APIキー発行+spend cap約30分)
- 建設期(8/10-22): PRレビュー週1〜2時間+語彙bank全数レビュー1回約1時間
- 定常(8/23以降): 週20〜40分(itch差し替え約10分+ledger数値の目視+必要時のPR merge)。ヒロ不在週はitch反映が1周止まるが設計は壊れない
- Phase 1自動起動後: 週10〜20分へ漸減。人間関与は「新しい動詞の承認」だけに収束(Temporary Human Evaluationの順行)

---

## 8. 未証明の仮定(正直に)

1. 【根本仮説・全設計共通】genome空間の探索が「未知の第三者からの1円」に届く — どの設計でも設計内では解決不能。最速の検証手段が既存24作の即時公開(Lane A)であり、これが並列化を最優先する理由。
2. enum/有界数値のみのgenome空間(初期1 mechanic+語彙bank200語)で「遊んで面白い」水準に達するか — 表現力崩壊リスク。安全設計では解決できず、mechanic追加(ヒロ承認)の反復速度が実質の勝負。
3. 新規itchアカウントのオーガニック到達はほぼゼロが既定 — 外部導線なしで検出窓が非ゼロになるかは未証明。60秒トイへのPWYW転換率も極めて低い可能性。
4. itch公式APIの実挙動(更新頻度・views計上・purchases反映遅延)は8/11-16のcanaryで実測するまで仮説。不成立でも設計は保存モードで壊れないが、World淘汰の起動は遅れる。
5. 既存seed 1本のパラメータ化リファクタが2〜3日で収まるか(seed実物は各500〜625行の独立実装)— 日程の最大分散要因。
6. Structured Outputsの不適合頻度が再抽選3回で吸収できる水準か — 恒常失敗ならその週の生産ゼロ(許容内だが速度低下)。
7. Console spend capの超過時挙動のfail-closed処理(canaryで確認)。Actionsサプライチェーン経由のAPIキー流出リスクはfull SHA pin+最小action構成でも残余ゼロにはならない。
8. AI生成開示タグ付きコンテンツのitch上の露出・アカウント評判への影響 — 小N・手動・明示ラベル運用で緩和するが保証はない。
9. thresholds.jsonの初期値には較正データがない — 保守的に置き、未達が続いても保存は継続。閾値が高すぎればPhase 1の起動がその分遅れる。
10. 週次の「最良新作」選定は当面ヒロの主観(§13準拠の暫定措置)— 閾値到達での自動退役は初回到達まで未検証。
11. 1円の「受領」はpayout外部レイテンシにより検出から数週遅れる — 本設計のいかなる工夫でも短縮できない外部制約。

---

## 9. 既存正本との関係

- `OS.md`(Layer1)は無変更。本裁定はLayer2/Layer3の提案であり、IOS §15の審査(最短でゴールへ近付くか→成果は増えるか→運用は減るか→重大な実害はあるか→制御なしで実現できないか)を通した。
- `ROADMAP.md`のゲート体系は維持。本裁定の位置づけ: Lane Aは**W0の主経路確定ではなく**1円観測窓の開放+最初の世界センサーの先行(8/8のW0裁定文PRで正本化)。Signals/LedgerはW1(attributable signal)の最小実装への布石。Phase 1閾値はW2以降の証拠ゲートに接続。
- 土曜再開メモの実行順(旧token失効→Secret削除→境界再設計→negative canary→再Enable)は本裁定に内包される。三job設計(Generate/Verify/Publish)は、本裁定の2ドメイン3workflow構成(Forge/Release/Signals)へ発展的に置換される — Verifierの役割は「pinned ajv+バイト等価のRelease内再検証」と「常設決定論CIテスト」に分解された。
- `CONSTRAINTS.md`は無改定(作品内外部通信ゼロは維持)。
- 本文書はヒロのmergeをもって裁定として確定し、CURRENT_STATE/ROADMAPへの反映は実装PRの側で行う。

---

## 参照

- Claude Structured Outputs: <https://docs.anthropic.com/en/docs/build-with-claude/structured-outputs>
- GitHub Pages deploy action (OIDC): <https://github.com/actions/deploy-pages>
- itch.io payments / payouts: <https://itch.io/docs/creators/payments>
- itch.io server-side API: <https://itch.io/docs/api/serverside>
- GitHub Agentic Workflows(不採用・C2 Radar候補へ降格): <https://github.com/github/gh-aw>
