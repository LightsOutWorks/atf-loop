# 英語 発信書法 — 2026-08

由来: 英語8レンズ並列調査 → 敵対的検証 → 統合。**19エージェント / 556ツール呼出 / 約145分。生存115規則・棄却110主張。**

本書は `direction/WRITING_SYSTEM_JA_2026-08.md` の翻訳ではない。**日本語版の各規則について「同一 / 修正して適用 / 英語固有 / 英語では逆効果」を1つずつ判定した結果**である（§1 差分表）。

> ⚠️ **§9 の結論: 今は英語を1本も公開しない。** 解除条件 `EN_GATE` は §9。凍結対象は公開のみで、調査・下書き・本書の更新は凍結中も行う。

---

# 英語 発信書法 — Hacker News / 自前ドメイン / X（2026-08）

Status: **DRAFT / 実行凍結中**（凍結条件は §9）

由来: 英語8レンズ並列調査 → 各レンズを敵対的検証 → 統合。本書は `direction/WRITING_SYSTEM_JA_2026-08.md`（以下「日本語版」）の翻訳ではない。**日本語版の各規則について「同一 / 修正して適用 / 英語固有 / 英語では逆効果」を1つずつ判定した結果**である。

日本語版と同じ棄却条件を引き継ぐ。加えて英語では2つ足す。

1. 根拠が「よく言われている」だけのフォークロア
2. フォロワーが既に多い人にしか効かないもの
3. 小技・グロースハック・煽り・釣り
4. 「売り込まない・相手の判断を奪わない」と衝突するもの
5. 実行できない曖昧語
6. 実績を盛る・誇張することを要求するもの
7. **日本語版の規則を、英語で検証せずに翻訳しただけのもの**
8. **英語ネイティブのふりを要求するもの**

---

## 0. 先に確定していること

**結論1: 今は英語を1本も公開しない。** 解除条件は §9。凍結対象は「公開」だけで、調査・下書き・本書の更新は凍結中も行う。

**結論2: 英語の主配信面はHacker News 1本。** 記事は自前ドメインの静的サイトに置き、自分でHNへ投稿する。X英語アカウントは作らない。dev.to / Medium / hashnode / Indie Hackers / lobste.rs へのクロスポストは0本（§4）。

**結論3: 非ネイティブであることは、隠さない・謝らない・装わない。** 「触れない」を既定にし、bioに事実として1回だけ書くことは許す（§5）。

**結論4: 日本語の完成散文を英訳しない。** 日本語で「1行1事実」まで書き、英語で1文目から書く（§6）。

### 使う順序

書く前に題材ゲート → 英語で書く → §2の機械検査 → §3または§4の構造検査 → §2末尾の公開ゲート。この順を変えない。

**題材ゲート（英語版。日本語版の3項目に2項目を上乗せする）**

| 項目 | 条件 |
|---|---|
| 一次情報 | 日付が特定できる出来事／自分が計測した数値／実際のエラー文言、のいずれかが3点 |
| 証拠 | 実行したコマンド・変更ファイル数・所要時間・試行回数・動くURL のどれか1つ（数字を含む） |
| 次の1手 | 変更対象が名詞で特定・実行日つき・後日報告を宣言 |
| **試行回数（英語追加）** | 同一条件での試行が20回以上ある |
| **生データ（英語追加）** | 公開リポジトリのURLが1つある |

### 数値が競合したときの採用値

複数のレンズが別の数字を出した箇所。**採用値のうちどれが実測でどれが運用値かを明記する。運用値を実測として扱わない。**

| 項目 | 採用値 | 出所 | 落とした値 |
|---|---|---|---|
| 1文の語数 | 標準20語。40語超は全文数の1/8以内。50語超は例外なく分割 | 中央値・分布はHN上位書き手6名の実測（中央値16〜22語、40語超5.0〜17.5%）。20語という標準値は運用値 | 「25語で例外なく分割」「35語絶対上限」「45語で分割」— HN実測に反証された |
| X投稿の1文 | 15語標準、25語で分割 | 運用値 | — |
| 文長の分散 | **管理しない。** 5文につき最低1つ、8語以下の文を入れることだけ | 個人の実文49,834文で8語以下が20.8% | 「最長−最短12語差」「変動係数」「burstiness」— 全て棄却（§8） |
| 1投稿の総量 | 280 English characters 上限、45語上限。**下限は置かない** | 280はXの媒体仕様 | 「240字以上」「180〜240字」— 下限は上限に張り付ける水増しを生む |
| 数字密度 | 本文100語あたりアラビア数字1個以上 | 人間記事11.32 vs AI記事4.13/1000語、個人の実文10.48/1000語 | 「散文型100語2〜6個」「保存型20個以上」 |
| 具体語密度 | 100語ごとに〈日付＋数値＋固有名詞＋原文引用〉の合計2個以上、目標3個 | 日本語版「400字あたり3個」の単位換算 | 上限は置かない（英語で未測定） |
| 段落 | 2〜4文・40〜70語。1文段落は1記事2個まで、連続禁止、数字か固有名詞必須 | 日本語版「3文・150字以内」の換算 | 「1行1段落を解禁」— 英語ではLinkedIn型の版面になる |
| タイトル | 40 English characters 未満を狙う。絶対上限65字 | HN無条件28日全投稿 n=28,273。40字未満 P(≥100点)=5.64% vs それ以外3.68%（z=+6.60） | 「40〜65字が最適」— 実測で最も悪い帯（0.88倍, z=-2.25） |
| I の密度 | 総数は1000語あたり10回以上。I で始まる文は全文数の25%以下。**下限は置かない** | 個人の実文19.73/1000語。上限25%はHN6名全員が遵守 | 「I を1投稿2個以内」「体験段落の70%をI主語に」 |
| ヘッジ | 範囲限定ヘッジは300語に最低1個・150語に1個を超えない。空虚ヘッジは500語2個まで。I think は500語1回・X投稿0〜1回 | 密度はHN Algolia実測の方向のみ。個数上限は運用値 | 「ヘッジ全体を1記事2回まで」— 範囲限定ヘッジまで削ると誠実さが落ちる |
| HN1本あたりの期待値 | 得点中央値2点（全投稿）／3点（個人ドメイン）、コメント0件 | HN実測。7四半期すべてで中央値2で不変。≥50点着地率は直近30日で2.95% | 「良い記事なら届く」 |

**AI検出ツールのスコアは目標にしない。測らない。記録しない。** 非ネイティブのTOEFLエッセイは7種の検出器で61.22%が誤ってAI判定され、ネイティブはほぼ完璧に判定される。判定器をゲートにすると非ネイティブは何を書いても不合格になる。さらに、合格させようとする推敲（「ネイティブらしく」）は誤検出率を61.22%→11.77%へ下げる——つまり**英語を磨く方向とAI標識を増やす方向が一致している**。ネイティブのふりは目標として成立しない。

**「AIっぽく見えないか」を自分の感覚で判断する工程も作らない。** 一般読者の判定精度は50〜52%（偶然と同じ）で、金銭的インセンティブでもフィードバックでも上がらない。公開可否は §2 末尾の数値検査の合否だけで決める。

---

## 1. 日本語版との差分表（本書の最重要部分）

判定は4種。**「同一」= 日本語版の規則がそのまま英語で成立し、検索語だけ英語にする。「修正」= 目的は同じだが手続きか数値を英語で置き直す。「英語固有」= 日本語版に対応物がない。「逆効果」= 日本語版をそのまま英訳すると英語では逆に働く。**

### 1.1 追加禁止語・§0

| 日本語版 | 判定 | 英語版でどうなるか |
|---|---|---|
| 上から目線の禁止語表（付き合う/寄り添う/サポート/導く/引き出す/教える/アドバイス） | **修正** | 語リストに加えて**構文テスト**を持つ（〈主語=自分〉＋〈改善動詞〉＋〈目的語=読者〉を全部削除）。英語の禁止語は日本語より広い（§7） |
| §0 題材ゲート（一次情報3点＋証拠1つ＋次の1手） | **修正** | 試行20回以上・公開リポジトリURLの2項目を上乗せ |
| §0 AI検出スコアを目標にしない | **同一** | 英語では「非ネイティブへの誤検出が構造的に偏在する」という追加根拠がある |
| §0 1文の長さ（40字/60字/上限80字） | **修正** | 語数で管理。標準20語・上限は分布で（40語超1/8以内・50語超分割） |
| §0 読点1文0〜1個 | **逆効果（廃止）** | 英語のカンマは非制限関係節・等位接続・文頭副詞句で文法上必須。個数上限を置くと非文か誤読を生む |

### 1.2 C1〜C22

| 日本語版 | 判定 | 英語版でどうなるか |
|---|---|---|
| C1 語尾を縦に並べて3連続を潰す | **逆効果（対応工程を作らない）** | 隣接文の文頭語一致率は AI 2.18% < 職業記者 3.37% < 個人の実文 6.04%。文頭語を意図的に散らすとAI側の分布に近づく。個人の実文の最頻文頭語は I（9.7%）で、同じ主語の反復こそが個人ログの標識 |
| C2 文長と読点／段落内の最長最短差25字 | **修正（差の条項は廃止）** | 上限だけ語数へ換算。分散管理は棄却（人間SD 11.6 vs AI SD 12.1で判別力ゼロ）。残すのは「5文に1つ8語以下」だけ |
| C3 ヘッジ語の全文検索・1記事2回まで | **修正** | 削減ノルマは範囲限定ヘッジに適用しない。空虚ヘッジと `I think` にだけ個数上限を置く。日本語L1話者の `I think` 過剰使用は学習者コーパスで反復観測されており、日本語では敬体に溶けて見えないものが英語では文頭に立って数えられる |
| C4 ヘッジの振り分け | **同一（実行位置だけ移す）** | 日本語メモではなく**英文側**で走らせる。翻訳された英語はヘッジを過少使用するので、日本語側で仕分けても英文に残らない |
| C5 抽象語の全文検索→具体物へ置換、できなければ文ごと削除 | **修正（手続き同一・検索語を作り直し）** | 日本語の検索語（本質/前提/価値）を訳さない。英語の実測リスト（delve/underscore/pivotal…）に差し替える |
| C6 記号（em dash・絵文字・太字・感嘆符） | **修正（丸括弧だけ逆転）** | em dash 0・絵文字0・ハッシュタグ0は同一。**丸括弧だけは下限を置く**（150語に1個以上）。個人の実文は7.34/1000語 |
| C7 曖昧な量副詞 | **同一（英語語彙で再構築）** | about/roughly/several/a lot of… 実測整数へ置換。置換できなければ "I didn't measure this." と1文で書く |
| C8 時間語 | **同一（英語語彙で再構築）** | recently/lately/soon/for a long time… 実日付か実所要時間へ |
| C9(a) 順接接続詞の一括削除 | **修正（対象を絞る）** | 削除するのは形式接続詞（Moreover/Furthermore/Additionally/文頭Also/Therefore/Thus/In conclusion/Overall/Ultimately/Consequently/Notably）だけ |
| C9(a) のうち等位接続詞 | **逆効果（下限を置く）** | 文頭 And/But/So/Or/Yet は人間2.29 vs AI 0.95/1000語。削るとAI側へ動く。400語に最低1回は文頭に置く |
| C9(b) 主語の一括削除テスト | **逆効果（実行不能・廃止）** | 英語は主語省略が非文。テスト自体が走らない。代わりにフィルター句（"I think that" "The thing is that" "It's worth noting that"）を削除する |
| C10 段落の最終文だけを抜き出す | **同一（英語語彙を追加）** | 段落末の評価動詞は人間1.9% vs AI 8.1%（4.3倍）、未来・希望語は4.4% vs 9.2%。英語側に独立した実測がある |
| C11 箇条書きの行検査 | **同一** | 抽象名詞だけの行が1つでもあれば箇条書きごと地の文に戻す |
| C12 締めと売り込みの禁止語／両論併記の禁止 | **同一（英語語彙）** | I hope this helps / Thanks for reading / In conclusion / There are pros and cons / It depends on your situation |
| C13 冒頭40字に日付・数字・固有名詞 | **同一** | 英語でもそのまま生きる |
| C14 主語のない断定を全部つぶす | **同一** | should/must/always/never/everyone を全文検索し、自分の過去の行動を指す場合以外は全削除 |
| C15 鉤括弧の中身は実発話か自分のプロンプトだけ | **同一（＋英語固有の追加）** | 伝達動詞を said/says に固定する規則が加わる（人間 said/その他 = 6.7:1 vs AI 1.4:1） |
| C16 過剰敬語 | **移植不能（機能だけ移す）** | 英語に敬語がない。儀礼句（kindly / please be advised / I would like to / Thank you for reading to the end）の禁止として実装 |
| C17 硬い語をひらく／和語に置き換える | **修正（同型の操作）** | ラテン系→アングロサクソン系の1対1置換表（utilize→use, implement→build…）＋総称動詞→具体動詞（do/make/take/get/have/give） |
| C18 カタカナ専門語に日本語の言い換えを添える | **移植不能** | 英語に3書記体系がない。この位置に**翻訳調検査語リスト**（英語固有）を置く |
| C19(1) 音読 | **移植不能（廃止）** | 非ネイティブの音読は判定器として機能しない |
| C19(2) 冒頭40字を隠す検査 | **同一** | 冒頭40語を隠して、日付・実測値・エラー原文が3個以上残るか数える |
| C20 20%削る | **同一** | |
| C21 接続を疑う | **同一** | |
| C22 内部用語の検出 | **同一** | 日本語の内部語だけでなく、その英訳（"a list of facts" "a date to check" 等）も禁止 |

### 1.3 §2〜§7

| 日本語版 | 判定 | 英語版でどうなるか |
|---|---|---|
| §2 1投稿に必ず入れる3点（日付／実測値／判断1文） | **同一** | 内容の要件であって言語の特徴ではない |
| §2 総量120〜160字・1行19字以内 | **修正（行内字数の設計は廃止）** | 英語のXは自動折返しなので行の字数を設計しても閲覧環境で崩れる。上限280字/45語、下限なし |
| §2 感嘆符・絵文字・ハッシュタグ0個 | **同一** | 感嘆符だけ条件付きで0〜1個（同じ文に自分が測った数値か実際に出したものがある場合のみ） |
| §2 完結性・1投稿1トピック | **同一** | |
| §2 リプライ規則（全件返す／同意だけの返信をしない） | **同一** | HNのコメント欄にそのまま適用 |
| §2 bio 3点限定 | **修正（例外1つ追加）** | 都市名1語（Tokyo）だけを内容3点の外側に置く。4点目は足さない（C22の失敗の再発防止） |
| §3 note記事 | **面ごと差し替え** | noteが束ねていた〈長文ホスティング＋プラットフォーム内発見＋一般読者〉の3機能を同時に満たす英語面は存在しない。自前ドメイン＋HNへ分解する（§4） |
| §3 タイトル26字・装飾語禁止 | **同一方向・数値を実測で置換** | 英語で40字未満が最良と実測。日本語版の「短くする」方向がそのまま正しかった |
| §3 導入200字（4文） | **修正** | 本文の前に独立したTL;DRブロック（3文以内・25語以内・自分が測った数字1つ以上） |
| §3 読み物系の冒頭に〈時刻／場所／具体物〉2つ | **逆効果** | 英語では専門注釈者がAI導入部の典型として名指ししている（"AI-written introductions often contain a strong scene-opener with a description of a specific time or place"）。〈固有名詞／アラビア数字／コピーできる実文字列〉の3択から2つに差し替える |
| §3 末尾を要約で閉じない | **同一** | ただし読み物系の「情景で終える」だけは英語では使わない。全記事が〈決定文〉か〈名指しの未解決点〉で終わる |
| §3 比喩 1〜2個 | **修正（引き下げ）** | 0〜1個。イディオム・句動詞の比喩用法・スラングは0個 |
| §3 想定読者「あなた」を使わない | **修正（用法制限へ）** | 英語で you を全排除すると受動態と名詞化が増え、平易英語の規則と衝突する。**事実条件節でだけ使う**（"If you're on macOS 14, this step fails."） |
| §4 敬体を基調にする | **移植不能（機能を再配分）** | 英語に敬体/常体の対立がない。「根拠なく言い切らない」機能はC4の振り分け＋should/must/always/neverの全削除＋測定環境ブロックに配分する |
| §4 一人称「私」に固定 | **同一** | |
| §4 「私は」を全部削って読み直す | **逆効果（廃止）** | 英語では I の密度を下げるのではなく保つ（1000語10回以上） |
| §4 絵文字の代わりの3手（自分の失敗を先に／範囲を明示／読者への指示0個） | **同一** | |
| §5 失敗の書き方 条件1〜6 | **全て同一** | 証拠が先／原因の主語は私／次の1手を同じ投稿内に／限界の次に残ることを書く／過程を実測で3〜5個／「分からない」を名詞で限定 |
| §5 humblebrag・過剰謝罪の検出 | **同一（英語語彙）** | "sorry for my English" は英語圏で定型のコピペとして流通しており、情報量0の自己卑下に該当する |
| §5 公開ゲート2問 | **同一** | |
| §6 やらないこと一覧 | **同一＋1行訂正** | 「TweetTextScorerが見るのは5特徴だけ」という根拠は現行系で成立しない（現行の判定器は quality_score / slop_score を持ち、プロンプト本体は非公開）。**結論（スコアを目標にしない）は変えず、根拠だけ差し替える** |
| §7 impression 7〜20は文章力の測定値ではない | **修正（同じ装置・数値を差し替え）** | 英語では「HNの3点は文章力の測定値ではない」になる |
| §7 A/Bテストをしない・低volume期に方針を変えない | **同一** | HNの投稿時刻A/Bもしない |

### 1.4 英語固有（日本語版に対応物がない）

| 規則 | 中身 |
|---|---|
| em dash / en dash 0個 | 個人の書き言葉では「—」0.20/1000語に対しタイプ入力の "-" が2.94/1000語（15倍）。※「em dash = AI」という通説は職業記者記事4.45 vs AI 4.09で判別力ゼロ。**レジスタ一致としてのみ採用する** |
| 伝達動詞を said/says に固定 | 70%以上を said に。noted/emphasized/highlighted/explained/stated の合計は1記事0〜1回 |
| contrastive negation 0個 | "not only … but also" "not just" "it's not X, it's Y" "more than just"。人間0.16 vs AI 0.78/1000語 |
| 定型動詞フレーム0個 | "remains a"(18.4倍) / "a testament to"(16.3) / "highlights"(12.9) / "plays a crucial role"(9.7) / "serves as"(8.6) / "continues to"(6.3) / "ensures"(5.6) / "in today's"(人間0.00) |
| 短縮形を既定にする | don't / it's / I'm / can't を展開しない。ただし**個数のノルマは置かない**（判別力は死んでいる。AI 18.06 > 人間 16.84/1000語） |
| 翻訳調の検査語 | there is/are, in which, the -ing of, as for, it can be said that, is performed, various, and so on … |
| 単位を保持する | 時刻はJST、金額はJPY、日本のサービス名はそのままの綴り。PST/USDに換算しない |
| we / our を0にする | 1人でやった作業で we と書くことは規模の事実に反する。※「weは不利」という業績主張は実測で消えた（Show HN上位58% vs 下位55%）。**正直さの規則としてのみ残す** |
| スペル・機械的誤りの公開ゲート | スペルミス100語0個、機械的誤り全体500語1個上限。綴り検査は別々の日に2回 |
| 面の選定（HN 1本／クロスポスト0） | dev.to は2025-01-01以降 >50点0件。実測 |
| 題材の分離 | 自己分析ツール・「やりたいことが分からない人」向けの記事を英語ドメインに1本も置かない |
| 執筆経路の固定 | 日本語の完成散文を訳さない（§6） |
| EN_GATE | 英語公開の凍結解除条件（§9） |

---

## 2. 英語のAIっぽさ検出チェックリスト（E1〜E25）

上から機械的に走らせる。内容の良し悪しを判断しない。番号は日本語版C1〜C22に対応させてある。

### E1 ← C1 文頭語をいじる工程を作らない／I始まり比率の上限

**日本語版C1は英語に移植しない。** 文頭語をわざと変化させる工程は作らない。代わりに2つだけ数える。

- `I` で始まる文が全文数の**25%を超えたら**直す。下限は置かない（0%でもよい）。
- 直し方は削除でも受動態でもなく**開始語の移動だけ**。日付から / 目的語から / 数字から始める。`was reviewed` `was identified` `it was decided` `it was found that` に逃げたら差し戻す。
- `The` で始まる文が全体の10%を超えたら、その主語を自分か固有名詞（ツール名・ファイル名・エラー文）に置き換える。
- `I` の総出現数は1000語あたり10回以上（600語なら6回以上）。

× The logs were reviewed. The cause was identified. The prompt was rewritten.
○ I went back through the logs. The same line broke 14 times. On June 4 I rewrote prompt.md and it passed on the first run.

### E2 ← C2 文の長さ

ピリオド・疑問符で全文を分割し、1文ずつ語数を数える（ハイフン語は1語、数字は1語）。

- 記事本文: 標準20語。21語目が出たらピリオドで割ることを検討する。**40語超の文は全文数の1/8以内**（8文なら1本、16文なら2本）。**50語超は例外なく分割**。
- X投稿: 標準15語、25語で分割。
- 並列列挙（A, B, and C）を含む文だけ上限の外。
- 3〜5文の段落には**8語以下の文を最低1つ**入れる。その短文には数字・日付・固有名詞・エラー原文のいずれか、または未解決を述べる語（I don't know / I haven't tested）を必ず含める。
- **分散・変動係数・最長最短差は計算しない**（§8）。
- 数えるのは公開前に1回、全文まとめて。書きながら数えない。

× (45語1文) I've been building a setup where I hand parts of my own work to an AI agent, and it mostly doesn't do what I expect, so I went back through the logs to find out why, and it turned out the instructions were the problem.
○ (10/9/8/11語) I hand parts of my own work to an AI agent. It mostly doesn't do what I expect. I went back through 17 failed runs. In 14 of them I never wrote an output format.

**カンマの個数規則は英語版に作らない**（日本語版の読点規則は移植しない）。

### E3 ← C3 空虚ヘッジと `I think` の個数

- `I think` は500語あたり1回まで。X1投稿では0〜1回。自分が計測した数値を含む文には0回。
- `maybe / probably / somewhat / kind of / a bit / it seems / arguably / perhaps / one could argue / tends to be / to some extent` は合計で500語2個まで。
- ヘッジの重ね掛けは0回（"I think it might possibly be" 型を全文検索して潰す）。
- 同じ留保語を1記事で3回以上使わない。

× I think the instruction format might possibly be the problem, and I think the model is probably not great at this.
○ The instruction format was missing in 14 of 17 runs. I think that's the cause, but n=1, my setup only.

### E4 ← C4 ヘッジの振り分け（英文側で走らせる）

英文の各文を2種に仕分ける。

**(1) 自分がやった事実・日時・エラー文言・実測値** → 無標の断定。ヘッジを1つも付けない。
**(2) 原因の説明・一般化・他人の環境への言及** → 次の**残すヘッジ**から必ず1つ付ける。

`in my case` / `n=1` / `on my machine` / `so far` / `as far as I can tell` / `I don't know yet` / `in my logs` / `I haven't tested X` / `in my experience` / `anecdotally` / `YMMV`

**削除するヘッジ**（係り先が主張の範囲ではなく書き手本人。文ごと削除して実測値1つに差し替える）:

`I'm not an expert` / `I'm no expert` / `I'm just a…` / `just my two cents` / `forgive my ignorance` / `I could be wrong, but` / `sorry if this is dumb` / `this may be obvious`

判定は語ではなく**係り先**で1語ずつ行う。ヘッジが係る先が〈主張の範囲（期間・回数・環境・機材）〉なら残す、〈書き手本人〉なら削る。

密度: 300語以上の文章に残すヘッジを最低1個、150語に1個を超えない。X投稿は0〜1個。削除するヘッジは全媒体0個、例外なし。

**不確実性は数で書く。** 「分からない・確かでない・一般化できない」と述べている文を全部抜き出し、その**2/3以上が数字**（試行回数・期間・環境の個数・範囲）を含むようにする。言葉だけで終わる留保文は1記事1つまで。

× I'm not an expert, but I think maybe the instruction format might be the problem. Your results may vary.
○ The instruction format was the problem in 14 of my 17 failures. n=1, one machine, 21 days. I haven't tested this on a team setup, on Windows, or on anything longer than an invoice.

### E5 ← C5 抽象語の全文検索

**手続きは日本語版C5と同一。検索語だけ英語で実測し直した。**

1語ずつ、その語が指す具体物（金額・日付・回数・所要時間・製品名・ファイル名・行番号）に置換できるか試す。できたら置換。できないなら**その文ごと削除する**。別の抽象語への言い換えで残さない。

**検索語（文書単位でヒット0。1000語超の記事のみ上限1）**

```
delve / delves / delving / delve into
intricate / meticulous / meticulously
underscore / underscores / underscoring
showcase / showcases / showcasing
realm / realms / tapestry / testament
pivotal / crucial / vital / profound
seamless / seamlessly / robust / transformative
multifaceted / nuanced / holistic / comprehensive
vibrant / foster / fostering / harness
elevate / streamline / ensure / ensures / ensuring
leverage / leverages / leveraging (動詞用法)
landscape / journey / navigate / navigating (比喩用法)
```

× This underscores the pivotal role of meticulous prompt design in today's agent landscape.
○ I pasted one output example into line 3 of prompt.md. Rework dropped from 17 runs to 3.

### E6 ← C6 記号

| 記号 | 規則 |
|---|---|
| em dash `—` (U+2014) / en dash `–` (U+2013) | **0個。** 丸括弧か半角スペース付きハイフン `" - "` に置換。セミコロンで代用しない |
| 絵文字 | **0個**（行頭・文頭を含む） |
| ハッシュタグ | **0個**（例外なし） |
| 感嘆符 | **0〜1個。** 使ってよいのは**同じ1文の中に**自分が測った数値か実際に出したもの（動くURL・リリース名・ファイル名）があるときだけ。形容詞（amazing / awesome / incredible / crazy）に付いた `!` は例外なく文ごと削除 |
| 丸括弧 | **下限を置く。150語に最低1個**（600語なら4個以上）。用途は補足・実測値・出所・但し書きに限る |
| セミコロン | 1記事0〜1個 |
| コロン | 実データ・エラー文言・引用を出すときだけ |
| 太字 | 500語あたり0〜1箇所 |
| 全大文字 | 3文字以上の全大文字語を数え、標準の略語と製品名（AI / API / URL / CLI / PDF / CSV / GitHub / OpenAI 等）以外は0個。強調は大文字ではなく**語順**で行い、強調したい語を文頭に置く |
| 改行 | 文の途中で改行しない。改行してよいのはピリオド・コロン・疑問符の直後だけ。ブロックの区切りは空行1つ |

× The result — a total failure 🔥 — was **NOT** what I expected!
○ The result was a failure. I did not expect it (run 19 of 31).

### E7 ← C7 丸め語

全文検索して0にする。

```
about / around / roughly / approximately
a few / several / a couple / a bunch of / tons of / a lot of / quite a few
many / most / numerous / various / a variety of
significantly / dramatically / massively / hugely / quite / fairly
```

処理は3択のみ。(1) 記録があれば実測整数か日付に置換 (2) 記録が無ければ `I didn't measure this.` と1文で書く (3) どちらも書けなければ文ごと削除。推測値を入れない。丸めてよいのは予測・目標・比喩だけで、その場合は同じ文に `ballpark` か `I'm guessing` を入れる。

× I ran it quite a few times over the past few weeks and it failed a lot.
○ I ran it 31 times between June 2 and July 1. It failed 27 times.

### E8 ← C8 時間語

全文検索して0にする。

```
recently / lately / the other day / a while ago / these days / nowadays
at some point / eventually / soon / for a long time / in recent years
not long ago / over the past few
```

処理はE7と同じ3択。1記事に厳密な日付または所要時間を最低2つ置く。

× Recently I tried this again and it worked pretty soon after.
○ On June 4 I tried again. It passed 40 minutes later.

### E9 ← C9 接続詞（対象を絞る／主語削除は廃止）

**(a) 形式接続詞を独立した1工程でいったん全部削除する。** 削除したまま通しで読み、意味が変わらない箇所は元に戻さない。

```
文頭の Moreover / Furthermore / Additionally / In addition / Also,
Therefore / Thus / As such / Consequently / Hence
In conclusion / Overall / Ultimately / In summary / Notably
```

**(b) 等位接続詞は削除対象に含めない。むしろ下限を置く。** 400語に最低1回、文を `But / So / And / Because` で始める。600語なら最低2回。**接続詞を後から足すのではなく、長い1文を2文に割って後半を But / So で始める形で作る。**

**(c) 主語の一括削除テストは実行しない**（英語では非文になる）。代わりにフィルター句を全文検索して削除する。

```
"I think that" / "I wanted to say that" / "What I found was that"
"The thing is that" / "It's worth noting that" / "One thing I noticed is that"
"I would argue that" / "It turns out that"
```

× Moreover, the output was wrong. Furthermore, I had not specified the format. In conclusion, the fix was simple.
○ The output was wrong. I had not specified the format. So the fix was one line in prompt.md.

### E10 ← C10 段落末文の抜き出し検査

書き終えたら**各段落の最終文だけ**をコピーして別ファイルに縦に並べる。次の語を含む文を削除する（言い換えず削除）。

```
評価的まとめ動詞: underscores / highlights / reflects / serves as
  is a testament to / is a reminder / demonstrates / illustrates
  represents / marks a / signals / shows how / proves that
未来・希望語: will / future / continue(s) to / hope / ahead
  in the years to come / going forward
```

削除後の段落は (a) 数値を含む事実文 (b) 自分がまだ答えを持っていない問い1文 のどちらかで終える。

× This experience underscores how important clear instructions are, and I'm excited to see where this goes in the years to come.
○ I still don't know how detailed the output spec has to be. 3 attempts, 3 hours, no answer.

### E11 ← C11 箇条書きの行検査

各行に日付・数字・固有名詞のいずれかが入っているか。抽象名詞だけの行が1つでもあれば、その箇条書きは全部やめて地の文に戻す。

× - Understanding the fundamentals
  - The importance of consistency
  - Shifting your perspective
○ - June 2: wrote a 1,200-word instruction file. It did not run.
  - June 4: added 1 output example. It passed on the first try.
  - June 9: same steps, did not reproduce.

### E12 ← C12 締めと売り込みの禁止語／両論併記の禁止

全文検索して0にする。**1行目に限らず全文を検索する。**

```
締め: I hope this helps / Thanks for reading / Feel free to / Be sure to
  Don't forget to / In conclusion / To sum up / At the end of the day
両論併記: It depends on your situation / There are pros and cons
  Everyone is different / It's not for everyone
煽り・釣り: Unpopular opinion / Hot take / You won't believe
  Most people don't know / Nobody talks about / Read this if
  Stop doing / Buckle up / The truth about / Nobody tells you
自慢: I'm humbled to announce / Excited to announce / Excited to share
拡散依頼: Save this post / A thread / follow along / Day 1 of building in public
将来値宣言: on my way to $10k MRR / just hit my first $1
```

**両論併記の代わりに**、自分が選んで捨てた側を過去形1文で書き、その判断が成立した条件（期間・規模・費用・自分の技能）を必ず次の1文に書く。**条件文を省いたらその段落ごと削除する。**

× I hope this helps! There are pros and cons to both approaches, so pick what fits your situation.
○ I stopped the automation and went back to doing it by hand. I gave up the speed. This is a 1-person, 30-minutes-a-day setup, and I have not tested it with a team.

### E13 ← C13 冒頭の作り方（**日本語版とは中身が違う**）

第1文に次の3つのうち**2つ**を必ず入れる。

(a) 検証できる固有名詞（ツール名 / モデル名 / ファイル名 / サービス名）
(b) アラビア数字
(c) コピーできる実文字列（実際のエラー文 / 自分が書いたプロンプトの1行）

**冒頭40語から次の名詞を0個にする**（時刻の数字と併記する場合を除く）。

```
morning / evening / night / quiet / gray / autumn
sunlight / air / hum / silence / glow / dawn / dusk
```

`Setting → 出来事 → 権威者の発言 → 大きな意義` の4段構成を使わない。時刻はログのタイムスタンプ形式でのみ書く。

**前置きを全削除する。**

```
I wanted to share / Recently I've been thinking / In today's
Let me start by / First, some context / Quick thread on
A little background / Before I get into it / So I've been
I've been meaning to write about
```

**冒頭2文テスト**: 書き終えたら冒頭2文だけを残して他を全部隠し、経緯を知らない人に見せる。(a)何が起きたか (b)誰の身に起きたか (c)いつ の3つを言えなければ書き直す。

× On a quiet Sunday evening, the glow of my screen was the only light in the room. I had been thinking about automation for a while.
○ Sunday 23:10 JST. Slack said: "You have 2 invoices for the same client." It was run 19 of 31.

### E14 ← C14 主語のない断定を全部つぶす

`should` / `must` / `always` / `never` / `everyone` を全文検索し、自分の過去の行動を指す場合以外は全削除する。他人を主語にした断定（people don't / most founders fail）を0にする。

原因を書く文の主語は必ず `I` にする。判断を書く文は `I think` / `I decided` / `I'm not sure yet` で書く。

× People who can't get results from AI are just bad at prompting. You should always give the model an output example.
○ Every time I failed to get a result, the cause was my own instructions. That holds for my 21 days of logs. I don't know about anyone else's.

### E15 ← C15 引用符の中身／伝達動詞を said に固定

引用符に入れてよいのは (a) 実際に誰かが言った・書いた言葉 (b) 自分が実際に書いたプロンプトや指示文 の2種類だけ。

**伝達動詞は said / says を全体の70%以上にする。** 1記事あたり `noted / notes / emphasized / underscored / highlighted / explained / remarked / stated / added` の合計を0〜1回に抑える。同じ主体の発話が続いても同義語で散らさず said を繰り返す。**エラー文・ドキュメント・ツール出力の引用にも適用する。**

× The docs emphasized that the format matters, and the model noted that it could not comply.
○ The docs say: "output_format is required." The error said: "missing required field: output_format."

### E16 ← C16 儀礼句の禁止／短縮形を既定にする

**(a) 儀礼句を全文検索して0にする。**

```
kindly / please be advised / I would like to / allow me to
I would be grateful if / it would be appreciated / humbly
Thank you for reading to the end / Please refer to
```

丁寧さを足したくなったら、日本語版と同じ3手だけを使う。①自分の失敗を先に書く ②判断を読者に残す文末 ③検証できる数字。

**(b) 短縮形を既定にする。** 短縮できる形はそのまま短縮して書き、書いたあとに展開しない。

```
don't / doesn't / didn't / isn't / wasn't / aren't / weren't
can't / couldn't / won't / wouldn't / haven't / hasn't / hadn't
I'm / I've / I'd / it's / that's / there's / here's
```

本動詞の have は短縮しない（"I have three files" は正しい）。**個数のノルマは置かない。「短縮形を足したから人間らしくなった」という判断を推敲工程から排除する**（判別力は死んでいる: AI 18.06 > 人間 16.84/1000語）。

**(c) スラング短縮は0個。** `gonna / wanna / kinda / sorta / gotta / y'all / ain't` / 語尾のg落とし（workin'）。

× I would kindly like to request that you please refer to the documentation. Thank you for reading to the end.
○ The docs are here. They don't cover the agent case. I couldn't find that anywhere.

### E17 ← C17 硬い語をひらく（ラテン系→アングロサクソン系／総称動詞→具体動詞）

**(a) 1対1置換表を機械的に当てる。音節を数えない。**

```
implement→build   utilize→use        optimize→tune      verify→check
facilitate→help   commence→start     terminate→end      sufficient→enough
additional→more   obtain→get         require→need       attempt→try
demonstrate→show  indicate→show      assist→help        initiate→start
modify→change     leverage→use       execute→run        perform→run
conduct→run       generate→make      encounter→hit      resolve→fix
investigate→look into   subsequently→then   prior to→before
in order to→to    due to the fact that→because   at this point in time→now
```

**(b) 総称動詞を具体動詞に置換する。** 下書き完成後、`do / make / take / get / have / give` を全文検索して全件列挙する。各1件について、目的語が自分が実際に操作した物なら、その操作を名指しする動詞に置換する。**500語あたり、置換できずに残る6動詞は2個まで。**

```
make a service → build a product
do a test → run a test
take a look at the log → read the log
get an error → the script printed
```

**(c) 自分が辞書を引かずに意味を説明できない語は、候補に出ていても採用しない（0語）。**

**(d) イディオム・句動詞の比喩用法・スラングを0個にする。** 使いたい表現が出たら「これを実際の英文で見た3件を思い出せるか」を自問し、思い出せなければ普通の動詞に置き換える。

```
at the end of the day / move the needle / low-hanging fruit
circle back / touch base / deep dive / bandwidth / in the trenches
nail it / game changer / hit the ground running / bite the bullet
the elephant in the room / burning the midnight oil
bit off more than I could chew → planned wrong
back at square one → started over
```

**(e) 比喩は1記事0〜1個。** 使ってよいのは写真に撮れる具体名詞だけで、`like a` を使わず名詞そのものを置く。書いたあと「これは写真に撮れるか」を判定し、撮れないものは**言い換えずに削除する**（英語で言い換えると新しいコロケーション誤りを作る確率が上がる）。

× I utilized the API to facilitate the implementation and subsequently verified the results. At the end of the day, I was burning the midnight oil to get this over the line.
○ I used the API to build it and then checked the results. I spent 3 hours on June 9. It still failed at the same line.

### E18 ← C18 翻訳調の検査語（**C18は移植不能。この位置に英語固有の検査を置く**）

固有名詞・エラー文言・引用は除外。ヒットしたら書き直す。

```
there is / there are / there was / there were
in which / in the case of / cases where
the -ing of （the drafting of → drafting）
from tomorrow / from next week （→ Tomorrow, I …）
as for / regarding / concerning / with respect to
it can be said that / it is thought that / it is said that
in order to （→ to）  |  due to the fact that （→ because）
is performed / is carried out / is conducted
make it possible to  |  various / a variety of  |  and so on / etc.
```

× There are many cases where the output is wrong, and in order to fix it, various approaches are performed.
○ The output was wrong in 17 of 31 runs. I fixed it by adding one line to prompt.md.

### E19 ← C19 冒頭を隠す検査（音読は廃止）

公開前に**冒頭40語を隠して**残りを読み、(a)日付 (b)自分が測った数値 (c)実際のエラー文言のコピペ、のいずれかが**3個以上**残っているか数える。3個未満なら公開しない。

加えて、独立に確認できる証拠を1本につき最低1つ本文に置く（実行ログのスクリーンショット、コミットハッシュ、エラー文言の原文コピペ）。**文体で自分を証明しようとせず、証拠を置く。**

### E20 ← C20 20%削る

公開前に必ず1回、語数を20%削る工程を入れる。削る対象は、形式接続詞、フィルター句、前置き、同じことの言い直し。**語数の目標値は置かない。**

### E21 ← C21 接続を疑う

読みにくいと感じたら語彙ではなく接続を疑う。隣り合う2文の間に `So` `But` `Because` `That means` を入れてみる。どれも入らない箇所が論理の飛躍点なので、そこに説明を1文足す。足し終えたら、無くても意味が通る接続詞は削る（等位接続詞の下限はE9(b)で別に確保されている）。

× I rewrote prompt.md. The runs passed.
○ I rewrote prompt.md. The old version never named an output format, so the model guessed. The next 14 runs passed.

### E22 ← C22 内部用語の検出

自分の設計文書・実験記録の中でしか使われていない語を、外向けの英文へ出さない。**日本語の内部語だけでなく、その英訳も禁止する。**

```
a list of facts / a date to check / Direction Card / three tags
HOW-gap / TIME-gap / WHAT-gap / Pain / World Signal
Reality Contact / Human Gate / primary record / canonical / Route / Desire
```

× What I send back is a list of facts and a date to check.
○ If you paste your answers in a reply, I'll read them.

### E23（英語固有）定型動詞フレームと contrastive negation

**(a) 句で全文検索して0個にする**（括弧内はAI/人間の実測倍率）。

```
"remains a"(18.4)  "a testament to"(16.3)  "highlights"(12.9)
"plays a crucial/vital/key/pivotal/significant role"(9.7)
"serves as"(8.6)  "continues to"(6.3)  "ensures"/"ensuring"(5.6)
"in today's"(人間0.00)  "paving the way"  "it's important to note"
```

※ `"when it comes to"` は禁止語に入れない（人間0.09 vs AI 0.07、判別力なし）。

**(b) and でつないだ抽象名詞2語**（empathy and community / clarity and focus / growth and resilience 型）を検索し、片方を削って残った1語も具体物に置換できるか試す。できなければ文ごと削除。

**(c) contrastive negation を0個にする。**

```
"not only" / "but also" / "isn't just" / "not just" / "more than just"
"no longer just" / "weren't just" / "rather than just"
"it's not X, it's Y" 型  /  "No X. No Y. Just Z." の3連否定
```

比較したい2つがあるときは否定構文を使わず、両方の実測値を数字で並べる。

× It's not just a tool, it's a testament to what remains a crucial part of modern workflows. This isn't just about prompts — it's about how you think.
○ The script reads 18 answers and prints a table. It saves nothing. I changed 1 line in prompt.md and rework went from 17 to 3.

### E24（英語固有）数字と具体語の密度

- **アラビア数字を100語あたり1個以上**（1000語あたり10個以上）。X投稿40〜60語なら最低1個、600語の記事なら最低6個。0円・0件・0人・0フォロワー・0回も1個として数える。
- **数字は丸めない**（7は7と書き、"a few" "several" "many" に置き換えない）。
- 本文を100語ごとに区切り、各区間で〈日付＋数値＋固有名詞＋原文引用〉の合計を数える。**2個以上を必須、3個を目標**。抽象名詞は数えない。1区間でも2個未満なら、実測値か固有名詞を足すか、区間ごと削除する。**上限は置かない。**
- **200語あたり1つ以上、コピー&ペーストした実物を貼る**（エラー文言の原文／実行したコマンド／ファイル名と行番号／タイムスタンプ／コンソール出力の1行）。
- 数値は回数・時間・率・日付・金額（0円を含む）から取り、**最低1つは自分に不利な数値**にする（失敗回数、捨てた機能の数、収益0円）。
- 読者が出所を確認できない数字にだけ、同じ文の中に出所を1語添える（from the log / measured / on the invoice / counted by hand）。**全ての数字に添えると定型句になるので、1記事で出所語は最大3回まで。**
- **0を0と書く文を1記事に最低1つ置く**（Confirmed revenue: 0 yen. / Non-boilerplate replies: 1.）。比較対象は他人のMRRではなく自分の前回の測定値に固定する（same as week 2 / up from 0 last week）。

× I ran the tool many times over a few weeks and most of the runs failed.
○ I ran the tool 31 times between June 2 and July 1 (log in the repo). 27 runs failed. Confirmed revenue from this so far: 0 yen.

### E25（英語固有）機械的誤りの公開ゲート

内容は見ない。数えるだけ。

- スペルミスは**100語あたり0個**。例外なし。
- 機械的誤り全体（綴り・大文字小文字・重複語・終止符抜け）は**500語あたり1個を上限**とし、2個目を見つけた時点で公開しない。
- 綴り検査は**必ず別々の日に2回**走らせる（同日2回は同じ見落としを繰り返す）。
- 冠詞・前置詞・単複・時制はこのゲートの対象外とし、自動チェッカ1パスだけで打ち止めにする（§5）。
- **誤字・口語崩れをわざと残さない**（日本語版§6と同一）。

### 公開ゲート（この12項目の合否だけで決める）

| # | 検査 | 合格条件 |
|---|---|---|
| 1 | アラビア数字 | 100語に1個以上 |
| 2 | 具体語（日付＋数値＋固有名詞＋原文引用） | 100語ごとに2個以上 |
| 3 | E5・E23・§7 の禁止語 | ヒット0 |
| 4 | 段落末の評価動詞・未来語 | 0個 |
| 5 | contrastive negation | 0個 |
| 6 | 文頭 But/So/And | 400語に1回以上。形式接続詞0個 |
| 7 | 文長 | 40語超が全文数の1/8以内、50語超0本、5文に1つ8語以下 |
| 8 | 丸括弧 | 150語に1個以上。em dash / en dash 0個 |
| 9 | `I` | 1000語に10回以上。I始まり文が25%以下 |
| 10 | 読者への指示（you should / 命令形） | 1000語あたり1回以下。X投稿・bioは0 |
| 11 | 冒頭40語を隠す検査 | 日付・実測値・エラー原文が3個以上 |
| 12 | スペルミス | 100語に0個（別日2回チェック） |

---

## 3. 英語X投稿の構造規則

**前提: 英語版Xアカウントは作らない**（§4で理由）。この節は、日本語アカウントで英語を1本出す場合と、将来判断が変わった場合のために形だけ確定させておく。

### 数値

| 項目 | 値 | 種別 |
|---|---|---|
| 総量 | 280 English characters 上限、45語上限。**下限なし** | 上限は媒体仕様 |
| 文数 | 2〜4文 | 運用値 |
| 1文 | 標準15語。25語で分割 | 運用値 |
| 1行目 | 15語以内。自分が測った数字を最低1つ。ピリオドで終える | 運用値 |
| アラビア数字 | 最低1個 | 実測 |
| 改行 | 文の途中で改行しない。ピリオド・コロン・疑問符の直後のみ。3回以内 | 媒体仕様 |
| 行内字数の設計 | **しない**（自動折返しのため） | 媒体仕様 |
| ハッシュタグ / 絵文字 | 0個 | 日本語版と同一 |
| 感嘆符 | 0個（E6の条件を満たす場合のみ1個） | 日本語版と同一 |
| `I think` | 0〜1回 | 運用値 |
| ヘッジ | 0〜1個 | 運用値 |
| 全大文字語 | 0個（標準略語を除く） | 日本語版§3の適用 |
| we / our / us | 0個 | 事実整合性 |

**280字換算**: 英語は1語あたり5.19〜5.29字（スペース込み、実測）。45語 ≒ 216〜238字。280字は約55語に相当するので、45語は上限ではなく意図的に切った値。

**日本語140字に入る内容は英語では入らない。** 語を削るのではなく、**書く事実を1つ捨てる**。捨てる順序は「背景 → 解釈」。日付・実測値・次の1手の3点は最後まで残す。3文45語に収まらない題材は、要素を削るのではなく「1投稿に収まっていない」と判断して記事側に回す。

### 1投稿に必ず入れる3点（日本語版と同一）

(a) 日付または期間　(b) 自分が測った数字を最低1つ（0 yen / 0 replies / 0 runs でよい）　(c) 自分が下した判断を明示した1文。

(c)の文末には `I think` / `I'm not sure yet` / `as far as I can tell` / `n=1, my setup only` のいずれかを付ける。**実測した事実を書いた文にはこれを付けない**（付いていたら削る）。

3点が揃わない下書きは投稿しない。失敗を書く回は「次の1手」も**同じ投稿に**入れる（リプライや記事に逃がさない）。

### 書く順序

①今も動いている事実（1行目）→ ②その中で壊れている箇所を1つ → ③次に自分が変えること1行。

`This didn't work` / `Another failure today` のような失敗宣言で始めない。①に書ける事実が本当に無い日は投稿しない。

### 悪い例 → 良い例（1投稿まるごと）

×
```
I've been thinking a lot about AI lately, and I wanted to share some thoughts.
Honestly, most people don't know how to prompt properly! At the end of the day,
it's not just about the tools — it's about the mindset. Let me show you what I
learned on my journey. #AI #buildinpublic
```
（53語279字。前置き2種、`most people don't`、`At the end of the day`、contrastive negation、em dash、`Let me show you`、`your journey` 相当、ハッシュタグ2個、感嘆符1個、アラビア数字0個。E13・E12・E17・E23・E6・§7・E24 に同時に違反）

○
```
I handed invoice drafts to Claude Code for 21 days. 4 clean runs, 17 reworks.
Fourteen of the 17 had no output format in my instructions. Tomorrow I paste an
output example into line 3 of prompt.md and rerun all 31.
```
（41語215字。1行目9語。数字 21/4/17/14/3/31。固有名詞 Claude Code / prompt.md。日付「21 days」「Tomorrow」。判断1文＝次の1手。感嘆符0、絵文字0、タグ0、em dash 0、we 0）

### bio

160文字以内。**都市名1語（Tokyo）＋内容3点のみ。4点目を足さない。**

3点は: 今やっていること／公開している一次記録の対象／無料で配っているもの。

形容詞0個。役割名詞0個（coach / mentor / guide / expert / guru / thought leader / storyteller）。絵文字0個。`helping X do Y` 構文0個。実績の数字0個（0という数字だけは事実なので書いてよい）。トピックを指す名詞はbioと本文で綴りを一字一句そろえる（`AI agents` に固定し `AI automation` と揺らさない）。

× `Helping founders unlock their potential with AI 🚀 | On my way to $10k MRR | DM me!`
○ `Tokyo. I run AI agents on my own work and publish the failure logs. Free self-analysis tool, 18 questions. Confirmed revenue: JPY 0.`（132字）

---

## 4. 長文面の選定と構造

### 選定: Hacker News 1本

記事は**自前ドメインの静的サイト**に置き、URLは `/YYYY/MM/slug` 形式にする。自分でHNに投稿する。

**判定基準は1つだけ: その画面に、自分をフォローするボタンがあるか。** あるなら使わない。フォロワー0では in-network 経路（配信の約50%）を構造的に持たず、この係数は言語で変わらない。HNにフォロー機能は存在しない。

**置かない面**（実測）:

| 面 | 2025-01-01以降のHN >150点記事 | 判定 |
|---|---|---|
| dev.to | 0件（>50点も0件、>10点が2件） | 使わない |
| Medium | 50件 | クロスポストしない |
| hashnode / Indie Hackers | 2件 | 使わない |
| lobste.rs | 1件 | 使わない |
| ghost.io | 7件 | 使わない |
| substack.com | 316件 | **ホストとしては可。ただしNotesは使わない** |

**クロスポストは0本。自前ドメイン1箇所だけに置く。**

Substackを使う場合はメール名簿の受け皿としてだけ使う。Notesの投稿数は週0本、Recommendationsの設定作業は0分。Notesはフォロワーグラフを持つSNS面であり、日本語版§7が既に棄却した構造そのものである。

**題材の分離**: 技術記録の英語ドメインに、自己分析ツール・「やりたいことが分からない人」向けの記事を**1本も置かない**。メール名簿も分ける。HNのOn-Topic基準は "anything that gratifies one's intellectual curiosity"、Off-Topicは "Most stories about politics, or crime, or sports, or celebrities"。noteが束ねていた3機能（長文ホスティング／プラットフォーム内発見／一般読者）が同時に成立する英語面は存在しない。混ぜると、唯一開いている経路の適格性を落とす。

### タイトル

| 項目 | 値 |
|---|---|
| 長さ | **40 English characters 未満を狙う。絶対上限65字** |
| 大文字 | **文頭1語だけ**（固有名詞を除く）。Title Case にしない |
| 記号 | `—` `–` `:` 末尾`?` `!` を**全て0個**。コロンを1個まで許さない |
| 数字 | 自分が実測した数量を1つ入れる。**6語目より前に置く** |
| 構造 | 〈具体的な主語〉＋〈過去形の出来事〉＋〈実際に起きた帰結〉。帰結は形容詞ではなく名詞か動詞 |
| 形容詞 | 0個 |
| 禁止 | `N things` / `N ways` / `N lessons` / `N tips` / `How to` / `Ultimate` / `Complete Guide` / `You Need To` / `Why You Should` / `Nobody Tells You` / `The Truth About` / `Amazing` / `Insane` / `Shocking` / `Secret` / `my journey` |

`How I` ＋過去形の帰結は可。確定実績0の状態で `How to`（指導の約束）は、持っていないものを持っていることにする側に落ちる。

実測根拠（HN無条件28日全投稿 n=28,273 の P(100点以上)）:

| 特徴 | あり | なし | 比 | z |
|---|---|---|---|---|
| 40字未満 | 5.64% | 3.68% | 1.53 | +6.60 |
| 40〜65字 | 3.89% | 4.43% | 0.88 | -2.25 |
| 65字超 | 3.41% | — | 0.75 | -4.77 |
| sentence case | 5.12% | 3.69% | 1.39 | +5.49 |
| Title Case | 3.07% | 4.98% | 0.62 | -8.21 |
| em/en dash | 2.18% | 4.50% | 0.48 | -8.43 |
| コロン | 2.85% | 4.72% | 0.60 | -7.80 |
| 末尾 `?` | 2.51% | 4.29% | 0.58 | -4.15 |
| **数字あり** | **5.98%** | **3.72%** | **1.61** | **+6.80** |

× `5 Amazing Lessons I Learned From Automating My Work With AI!`（60字、Title Case、感嘆符、`N lessons`、形容詞、数字はリスト件数）
○ `17 of 31 Claude Code runs needed rework`（39字、8語、sentence case、数字が第1語、固有名詞、過去形の帰結、記号0）

### 記事の構造

**TL;DRブロック**（本文の前に独立して置く）: 3文以内・25語以内・自分が測った数字を最低1つ・売り込み語0個。本文の言い換えではなく、何をどれだけやって何が起きたかだけを書く。

○ `I gave invoice drafts to Claude Code for 21 days. It billed one client twice. 14 of 17 reworks had no output format in my prompt.`（26語）

**本文**:

| 項目 | 値 |
|---|---|
| 冒頭100語 | ①ツール名またはモデル名 ②日付または期間 ③見出しになる実測値 を平文で入れる |
| 段落 | 2〜4文・40〜70語。1段落1論点。段落の1文目に段落の結論 |
| 1文段落 | 1記事2個まで。**連続させない。** 数字か固有名詞を必ず含める |
| 見出し | 150〜200語ごとに1つ。体言止めにせず、実測入りの文で書く |
| 疑問符 | 400語に1個以上。**自分がまだ答えを持っていない問いにだけ**使う。`What do you think?` `Have you experienced this?` 型は0個 |
| 訂正 | 1記事1ユニットまで。3文で書く（①以前の自分の文を日付つきで原文引用 ②訂正後の値と出所 ③工程のどこを変えたか、ファイル名か行番号つき）。`I was wrong` だけで終わる文を0個 |
| 末尾 | (a) 一人称の決定文 か (b) 名詞で限定した未解決点 のどちらか1文で終える。要約で閉じない。「続きは次回」と書かない |
| 測定環境ブロック | 記事末に1つ置く（期間・バージョン・規模） |

**1記事＝1つの測定。** 書く前に次の5つを埋め、埋まらない日は書かない。

①測る量（トークン数・失敗回数・秒数・円）②測定器（ログ・プロキシ・スクリプト）③試行回数（最低20回）④固定した条件（モデルID・ツールのバージョン番号・OS）⑤生データの置き場所（公開リポジトリのURL）

**記事1本につき公開リポジトリ1つを対にする。** 記事本文の最初の3段落以内に、そのリポジトリのURLを**平文で1回**置く（リンクテキストに隠さない）。リポジトリには「公開していないデータと、その理由」を書いた節を必ず1つ置く。

**1記事に必ず入れる4点**:

(a) 名前を挙げた未解決事項を1つ、数字つきで（`I still don't know how detailed the output spec has to be. 3 attempts, 3 hours, no answer.`）
(b) 両論併記をせず、自分が選んで捨てた側を過去形1文で書き、その判断が成立した条件を必ず次の1文に書く
(c) 最終文を結論ではなく事実で終える
(d) 一般化・原因説明を書いた段落には `on my machine` / `n=1` / `I have not tested X` のいずれかを同じ段落内に置く。**限界を1つ書いたら、その次の文に「それでも残ること」を必ず書く。限界を書いて終わる段落を作らない**

推敲時、本題に直接関係しない実在の固有名（使った実際の製品名・場所・時刻）を「関係ないから」という理由で削除しない。**足すのではなく、消さない。**

### 運用

| 項目 | 値 |
|---|---|
| 頻度 | 週1本、1回だけ投稿 |
| 再投稿 | 同じURLを再投稿しない（1年程度空いた場合のみ少数回） |
| 投稿時刻 | **06:00〜09:00 UTC を避ける**（2.81% vs 4.38%、z=-4.97）。それ以外の時刻最適化・A/Bテストはしない |
| 期待値 | 得点中央値2〜3点、コメント0件。48.1%が2点以下、73.6%が4点以下。100点到達は5.27%。**最初の20本は「3点で終わるのが標準」として設計し、3点だったことを失敗と記録しない。20本出し終えるまで方針を変えない** |
| コメント比 | コメント数÷得点を1.0以下に。公開前に「この記事に来る最も自然な反応は、賛否の議論か、追加データの提供か」を1文書き出す。前者なら出さない |
| 自己コメント | 投稿後に1度だけ `Author here.` で始まる書き込みをし、その最初の1文に**記事に書かなかった追加の数値を1つ**置く |
| 返信 | 自分に来た質問には全件返す。同意だけの返信・自分のURLを貼る返信・複数人への同文コピペはしない |
| 票の依頼 | **しない。** HN FAQに "We penalize or ban submissions, accounts, and sites that break this rule" と明記 |
| コメント欄の文 | **AIに書かせない・書き直させない。** HN Guidelines に "Don't post generated text or AI-edited text. HN is for conversation between humans." と明記（この条文はコメント節にある。本文への拡張は規約上の義務ではないが、本書は本文にも同じ工程を適用する） |

**無料提供物の前に壁を置かない。** 出力を見るまでに入力させるフィールドを0個にする（メール0・アカウント0・氏名0）。ツールの説明は必ず2文に固定する: (1)何をするか（質問数・所要分数・出力の中身）(2)何をしないか（保存しない／送信しない／こちらから連絡しない）。

× `Enter your email to get your free self-analysis.`
○ `18 questions, no account, nothing stored. The result shows on the page. If you want me to look at your answers, paste them in a reply.`

---

## 5. 非ネイティブ戦略

**結論: 隠さない・謝らない・装わない。既定は「触れない」。**

「ネイティブのふりをする」は目標として成立しない。理由は2つで、どちらも実証がある。

1. 非ネイティブのTOEFLエッセイをChatGPTで「ネイティブらしく」推敲すると、AI誤検出率が61.22%→11.77%へ下がる。**磨く方向とAI標識を増やす方向が一致している。** 人間執筆文を可読性のためだけに推敲した別の実験でも、推敲前97〜100%人間判定が推敲後75〜85%AI判定に反転した。
2. HN上位書き手6名を実測すると、**測れる全指標で非ネイティブがネイティブの帯の内側にいる**（antirez: 文長中央値16語／I始まり8%／`you should` 0.13回/1000語。ネイティブ patio11: 22語／11%／0.32）。英語の書き方の測れる部分に、ネイティブ／非ネイティブの境目が観測されない。

したがって、練習時間は測れる2点にだけ配分する。(a) 第1文に自分が測った数字を1つ入れる (b) 公開前に1文の語数を数える。どちらも慣用表現の知識を必要としない。

### 直すもの / 直さないもの

| 項目 | 判定 | 理由 |
|---|---|---|
| スペル | **直す（0個）** | コストが0で、どんな効果量でも損にならない唯一の項目 |
| 大文字小文字・重複語・終止符抜け | **直す（500語1個上限）** | 同上 |
| 冠詞（a/an/the）・前置詞・主述一致・時制 | **1パスだけ直す** | 理解を妨げる誤りは内容の信用まで下げる。ただし時間を無限に使わない |
| 語彙選択 | **直させない** | LLMに触らせると自分の語彙が均される |
| 語順 | **直させない** | 同上 |
| 文の統合・分割・文数 | **直させない** | 同上 |
| 慣用句・句動詞の比喩用法・スラング | **使わない（0個）** | 非ネイティブが最も破綻する領域。誤用は誤りとして表面化する |
| 短縮形（don't / it's） | **使う（既定にする）** | 機械的に導出できるので誤用リスクがほぼ0。個数ノルマは置かない |
| 単位 | **保持する** | 時刻はJST、金額はJPY、日本のサービス名はそのままの綴り。PST/USDに換算しない |

### LLMの使い方（diffモードのみ）

**プロンプトを固定し、一字も変えない。**

```
Fix only spelling, verb tense agreement, articles (a/an/the), prepositions,
subject-verb agreement, and verb-noun collocations. Do not change any word
choice. Do not reorder, merge, or split sentences. Do not add or delete any
sentence. Output a diff and list every change you made.
```

採用してよい編集は3条件を**全部**満たすものだけ。

(a) 文数の増減が0
(b) 下書きに無い語が1語も足されていない（冠詞・前置詞・語形変化のみ例外）
(c) 変更トークンが全体の10%以下（10%は運用値）

1つでも破ったら**編集全体を捨てて自分で直す**。

**使わない指示**: `polish` / `improve` / `make it flow` / `make it sound natural` / `make it more engaging` / `rewrite` / `native-like` / `improve readability`。

**LLMが生成した文字列を本文に貼らない。** 理由をAI判定の回避と書かない。理由は「LLMの書き換えは、数値・『ここは記録を取っていない』・実際のエラー文言から先に均すため」と書く。日本語版§5の「記録が無い箇所は、ぼかさずその場所に『記録を取っていない』と書く」の英語版であり、機械化された「ぼかす」操作を禁止しているだけ。

### 謝らない / 装わない

全文検索して0にする。

```
sorry for my English / my English is not good / please excuse my
I'm not a native speaker / English is not my first language
apologies if this is unclear / I hope this makes sense
forgive any mistakes / sorry for the long post / I'm not a writer
this might be badly written / apologies in advance
```

同時に**ネイティブを装う語も0にする**。書き言葉での `y'all / gonna / wanna`、米国スポーツ・軍事の比喩、地域限定スラング。

文が不明瞭なら謝らずに**15語以下に切る**。謝罪を書いてよいのは読者に実害が出たときだけ（リンク切れ・誤情報・ツールのバグ）で、その場合は謝罪1文＋原因1文＋対処1文の3文で終える。

**非ネイティブであることを隠す義務はない。** bioに事実として1回だけ `I write in Japanese and English.` を置いてよい。ただし本文の冒頭・末尾には置かない。謝罪の形にしない。予防線として使わない。「効果がある施策」として置かない（根拠がない）。

### 自己限定文の主語は成果物にする

自己卑下と読める文を全部抜き出し、**主語を見る**。

- 主語が `I` ＋資質形容詞（I'm bad at / I'm just a beginner / I'm no expert）→ **削除**。検証不能で情報量0。
- 主語が成果物・道具・データで、述語が検証可能な範囲限定（unmaintained / not tested on Windows / doesn't save anything / n=1 / I stopped updating it in June）→ **残す**。1記事に最低1つ置く（上限3つは運用値）。

× `Sorry for my poor English. I'm just a beginner, so this might not be useful.`
○ `I put the tool up. It scores 18 questions and prints a table. It doesn't save anything, and I haven't tested it on a phone.`

× `Sorry for my English, I'm Japanese and not good at writing.`
○ `I handed invoice drafts to an AI for 21 days. It billed one client twice on June 3.`

### 音声・動画

数字を含む主張は、音声より先に必ず**テキストとして存在させる**。動画を作る場合は記事を先に公開し、動画の説明欄から記事へリンクする。動画の本数・登壇の可否を到達数で条件付けしない。

---

## 6. 執筆経路 — 日本語で書いて訳すのか、英語で直接書くのか

**結論: 日本語では「1行1事実」までしか書かない。英語は1文目から英語で書く。日本語の完成散文を訳さない。**

根拠は4系統が独立に同じ方向を指していること（Kobayashi & Rinnert 1992 n=48、Cohen & Brooks-Carson 2001 n=39、Toral 2019 post-editese、Lost in Literalism ACL 2025）。

**ただし適用範囲を正直に書いておく**: 直接執筆が有利という測定は主に**上位の書き手**で出ており、下位の書き手では翻訳経路が有利だった報告がある。だから規則は「訳すな」ではなく「**完成散文を訳すな／文単位の助けは条件付きで可**」。

### 工程（5段。順序を変えない）

**(1) 日本語で題材ゲートを埋める**（一次情報3点／数字の証拠1点／次の1手／試行20回／リポジトリURL）。

**(2) 日本語で「1行1事実」だけを書く。** 接続詞を書かない。散文にしない。各行に日付か数字を必ず1つ入れる。

```
2026-06-02 prompt.md 1200字で書いた 動かず
2026-06-04 出力例を1つ足した 1回で通った
2026-06-09 同じ手順 再現せず
31回中 成功4 やり直し17
17回中14回 出力形式の記述なし
2026-06-03 run 19 同じ会社に2回請求
```

**(3) その行を見ながら、英語で1文目から書く。日本語の文を訳さない。**

**(4) 英文に §2 の検索リストを機械的に走らせる。**

**(5) 語数を20%削る。**

### 例外（文単位の助けだけ許す）

1文が英語で書けないときだけ、その1文の候補を出させてよい。採用条件は2つ。

(a) 自分が辞書を引かずに意味を説明できる語だけでできている
(b) 自分が声に出して言える

どちらか欠けたら候補を捨てて、知っている語だけで短く書き直す。

### 訳した場合に何が起きるか（実測）

同じ内容について、構造保存で英訳した版と英語で組み直した版を数えた。

| 版 | 語数 | 文字数 | Xに入るか | §2 翻訳調検査のヒット |
|---|---|---|---|---|
| 日本語→構造保存で英訳 | 63語 | 324字 | **入らない** | 5件 |
| 英語で組み直し | 45語 | 216字 | 入る | **0件** |

他の指標（可読性スコア・音節率）は良悪を分離しなかった。**分離できたのは §2 E18 の語形検索だけ**だった。

### 訳す工程で最も失われるもの

翻訳された英語は母語英語に比べ hedge / booster / attitude marker を**過少使用する**。つまり日本語版C4（ヘッジの振り分け）は翻訳工程で最も失われやすい箇所にちょうど当たる。**だからE4は日本語側ではなく英文側で走らせる。**

同時に、日本語のゼロ照応を英訳すると機械側が主語を補完せざるを得ず、既定で `we` が入る。**日本語のメモで主語を省いた行は、英語を書く前に「誰がやったか」を日本語側で書き戻す。**

---

## 7. 在重力の英語版 — 押さない姿勢を英語で成立させる

日本語版の裁定（2026-08-10）をそのまま英語に適用する。**この節は本書の全規則に優先する。**

### 判定はリストではなく構文テスト

各文を明示的なS-V-Oに書き直す。結果が

**〈I または this〉＋〈改善動詞〉＋〈you〉＋〈より良い状態へ〉**

の形なら、**その文を削除する**。柔らかい動詞に置き換えない。役割を書かない。

構文テストである点が重要で、語リストは新しい言い換えに漏れるが構文形は漏れない。かつ `this script empowers the CLI`（目的語が人間でない）を誤爆しない。

### 禁止リストと代替

| 禁止（全文検索してヒット0） | 何を作る構文か | 代替 |
|---|---|---|
| `empower` / `empowering` / `empower you` | 私があなたに力を与える | 道具が何をするかだけ書く |
| `unlock` / `unlock your potential` / `help you unlock` | 私があなたの中の何かを開ける | 出力の中身を書く |
| `your journey` / `start your journey` / `my journey` | 私があなたの旅程を見ている | 期間を実数で書く（the last 21 days / runs 1 through 31） |
| `guide you` / `I'll guide you` / `walk you through` / `take you through` | 私が案内する側 | 手順を番号で置く |
| `let me show you` / `I'll teach you` | 私が見せる側 | 何が起きたかを過去形で書く |
| `help you` ＋動詞 / `help you achieve` / `help you get clarity` | 私が助ける側 | 削除 |
| `support you` / `be there for you` / `I'm here for you` / `hold space` / `meet you where you are` / `hold your hand` | 私が支える側 | 削除 |
| `foster` / `nurture` / `elevate your` / `transform your` / `supercharge` / `level up` / `10x your` / `take it to the next level` | 同上 | 削除 |
| `navigate the complexities of` / `harness the power` | 私が複雑さを整理してあげる | 具体物に置換、できなければ文ごと削除 |
| `find your why` / `discover your true self` / `trust the process` / `you deserve` / `you've got this` / `we'll get there together` | 同上 | 削除 |
| `as someone who's been there` / `here's what you need to know` / `the key takeaway for you` / `trust me` | 私が先にいる側 | 削除 |
| `best practices` / `tips and tricks` / `ultimate guide` / `complete guide` / `for beginners` / `effortless` / `game changer` | 権威の位置 | 削除 |
| `I help X do Y` / `I guide teams` / `I support` | **役割の説明そのもの** | 役割を1語も書かない |

**読者への指示は語形を問わず削除する。**

```
you should / you need to / you have to / you must / you'd better
make sure you / don't forget to / try to / remember to / stop doing
you can just / simply / all you have to do
文頭の裸の命令形: Try / Just / Make sure / Remember to / Stop / Don't
```

上限: 1000語あたり1回以下。**X投稿とbioでは0回。** 引用したコマンド・プロンプト全文・コードブロック内の命令形は対象外（無制限）。

HN上位書き手6名の実測はネイティブ・非ネイティブにまたがって全員が上限1.0以下だった（bagder 0.00 / fasterthanlime 0.08 / antirez 0.13 / patio11 0.32 / simonw 0.33 / jvns 0.95）。本調査で最も再現性が高い規則。

### `you` の用法制限（全排除は英語では逆効果）

`you` を全排除すると受動態と名詞化が増え、平易英語の規則と衝突する。**禁止ではなく用法制限にする。**

| 用法 | 判定 |
|---|---|
| 事実条件節 `If you're on macOS 14, this step fails.` | **可** |
| 仕組み・手順の総称 `once you hit real tool use` | **可** |
| 約束・評価・励ましの主語 `you will` / `you'll be able to` / `this will help you` | **禁止** |
| 宛先の一般化 `for everyone interested in AI` | **禁止** |
| 命令 | **禁止** |

想定読者は「同じ工程でいま止まっている人1人」に固定し、**名指しは三人称で書く**（people who are stuck at the same step）。

### 代替は「役割を書かない」

自分が読者に何をしてあげる人かを1語も書かず、**事実だけ置く**。何があるか / 何が起きたか / いくらか / 何ができないか。

道具について書くときは必ず2文にする。(1) それが何をするか (2) それが何をしないか。

× `This free self-analysis will help you unlock your potential and guide you on your journey to clarity.`
○ `It's 18 questions, about 25 minutes. It gives you three things to try and one date. It saves nothing and it doesn't email you.`

× `You should always give the model an output example. You need to be specific.`
○ `I pasted one output example into line 3 of prompt.md. Rework went from 3 passes to 1 across the next 14 runs.`

× `We're building tools that help people find their direction.`
○ `I write down what happens when I hand work to AI. My confirmed revenue so far is zero.`

### askとオファーの形

**askは置かなくてよい。** 置く場合だけ形を固定する。

- 6〜15語の1文。動詞は `Let me know` / `Would love` / `Happy to answer` / `Feel free to ask` の4つに限定。
- 目的語は読者が既に持っている情報（feedback / 反例 / 相手の実測値）に限る。
- ask文を2文以上重ねない。感嘆符を付けない。
- 0回にする: `sign up` / `subscribe` / `follow me` / `check out my` / `DM me` / `spots are limited` / `limited time`
- **有料の話をしたときだけ**、直後に3〜6語の解放句を1つだけ置く（`No worries if not.` / `Feel free to ignore this.` / `Happy either way.`）。2つ重ねない。
- **価格は聞かれてから出す。**

**askの有無は成否を分けなかった**（HN上位28% vs 下位27%）。効果の主張はしない。これは形の制約であって、効くという規則ではない。

× `Let me know if you want to work together! Spots are limited.`
○ `If you get stuck after that, I do this kind of work for money. I'd quote a fixed scope and price before anything starts. No worries if not.`

---

## 8. やらないこと一覧

日本語版§6を引き継ぎ、英語で新たに棄却した項目を足す。**日本語版の1行を訂正する。**

### 日本語版からの訂正

| 訂正対象 | 訂正内容 |
|---|---|
| §6「3行改行でアルゴリズムに好かれる型の指南 — TweetTextScorerが見るのは length / readability / shout / link / entropy の5つだけ」 | **理由の後半を削除する。** 現行の判定系は `quality_score`（float）と `slop_score`（int）を持ち、閾値 `score >= 0.4` で選別する。README に "We have eliminated every single hand-engineered feature and most heuristics from the system." とあり、プロンプト本体は非公開。**「テキストの5特徴しか見ない」という前提は現行系では成立しない。結論（スコアを目標にしない）は変えず、根拠だけ差し替える。** なお §7 の 0.75×0.75=0.5625 は2023年版 `param.scala` に実在するので正しい。bookmarkに10倍の重みを与えるパラメータは、2023年版にも現行版にも存在しない |

### 英語で棄却した主張

| やらないこと | なぜ死ぬか |
|---|---|
| X投稿に240字の下限を置く | 日本語版が既に棄却した「上限に張り付ける最適化」の再発。実測とされたコーパスは存在が確認できなかった |
| 1文の中央値を10語以下にする／文長の変動係数・burstiness・最長最短差を管理する | 人間 平均20.9語/SD 11.6 vs AI 21.5/SD 12.1。8語以下の割合11.0% vs 10.2%、30語以上19.1% vs 19.7%。**どの角度でも差がない** |
| 1文のカンマを0〜1個にする | 英語のカンマは非制限関係節・等位接続・文頭副詞句で文法上必須。個数上限は非文か誤読を生み、綴り・文法0という規則と衝突する |
| 1行目を14語/70字以内にする、1行目を3型に限定する | 閾値の出所が確認できないコーパス。日本語版§6が「1行目を2型に限定」を n=21 で既に棄却済み |
| 保存型（bookmark狙い）と共感型を投稿前に宣言して分ける | 日本語版§6が既に棄却（指標を先に選ぶ設計は記録ではなく最適化になる）。「bookmarkはlikeの10倍の重み」という前提も存在しない |
| 絵文字を行頭に1個だけ許す／❌✅を自分の記号辞書に決め打ちする | 緩める側の根拠が無い。0個のほうが検査が単純 |
| 短縮形を100語あたり2個以上入れる | 採用理由がAI検出回避の枠組み。かつ判別力は死んでいる（AI 18.06 > 人間 16.84/1000語）。日本語版§6の「推敲の最後に崩す工程を足す」と同型 |
| `I` を1投稿2個以内に抑える／主語を道具名・数値に付け替える／投稿の半分を I=0 にする | 日本語版§5条件2（原因の主語は「私」）とC14に正面衝突。失敗の一次記録で責任の所在をぼかす方向に働く |
| `not only … but also` を英語の標準構文として使う | contrastive negation として0個にする（人間0.16 vs AI 0.34〜0.78/1000語）。ただし「LLM過剰語」という理由づけは誤りで、禁止理由は断定芸の型であること |
| `tapestry / boast / unwavering / navigating / embark / journey / testament / in conclusion` を「実測された過剰語」として扱う | 手元の過剰語彙データ901行に1件も存在しない。出所は手作業のslop語リストでフォークロア。**禁止自体は別の理由（抽象語）で残るが、実測とは書かない** |
| `complexities` / `tailored` を style語として禁止する | 同データで `type="content"` に分類されており、話題の変化を反映しうる |
| `when it comes to` を禁止語に入れる | 人間0.09 vs AI 0.07/1000語（比0.82）。判別力なし |
| `Here's why` / `Here's how to` を禁止フックにする | 煽り・釣り・誇張・グロースハックのどれにも当たらない中立的な導入句。根拠が「使われていない」という不在だけ |
| em dash を「AIの標識」として一般命題で扱う | 職業ジャーナリスト記事 4.45 vs AI記事 4.09/1000語で判別力ゼロ。**0個にする規則は残るが、根拠は個人発信のレジスタ一致だけ** |
| `we` を「規模の誇張として読まれるから不利」として避ける | Show HN実測で上位58% vs 下位55%。差は3ポイントでノイズ。**0個にする規則は残るが、根拠は事実整合性だけ** |
| タイトルを40〜65字にする | 実測で最も悪い帯（3.89%、0.88倍、z=-2.25） |
| タイトルにコロンを1個まで許す | 実測でem dashとほぼ同等の減点（0.60倍、z=-7.80） |
| タイトルの数字は「弱い加点にとどまり必須ではない」 | 無条件検定で最強の正の予測子（1.61倍、z=+6.80）。勝者条件付けを外すと結論が逆転する |
| タイトルに `I` / `my` を積極的に使う | 無条件検定で有意でない（1.12倍、z=+0.90） |
| 60-69文字のタイトルが最良（中央値308点） | 400回ブートストラップで再現率16%。30-79字の全バケットが201〜215で平坦 |
| HNの投稿時刻・曜日を最適化する | 単一時刻・単一曜日のピークは24回・7回の多重比較で有意でない。**06-09 UTCブロックの回避だけ**が頑健（z=-4.97）。因果は主張しない |
| コメント数÷得点を0.6以下にする | 実測は非単調。0-0.3帯が最低（中央値160）、0.3-0.6が最高（213）。**降格が問題になるのは1.0超の帯だけ** |
| 抽象名詞の3項目列挙を0にする／具体名詞の列挙を1記事1個に制限する | 一般の3項目列挙は人間1.89 vs AI 1.90/1000語で差なし。抽象名詞限定でも実数15件で統計になっていない。具体名詞の上限1個は人間の実測1.89より低く、人間から遠ざける |
| 本題と無関係な実在の具体物を1記事1つ入れる／後半にcallbackを1つ入れる | 挿入ノルマは、持っていない具体物を作る経路になる。日本語版が「五感描写と直接話法を最低1つずつ」を棄却したのと同型。**逆方向（消さない）だけ残す** |
| 英語の読み物系冒頭に〈時刻／場所／具体物〉を2つ入れる | 英語では専門注釈者がAI導入部の典型として名指ししている |
| 文頭語をわざと変化させる | AI 2.18% < 職業記者 3.37% < 個人の実文 6.04%。散らすとAI側へ動く |
| `and / but / so` を含む接続詞を一括削除する | 文頭 And/But/So/Or/Yet は人間2.29 vs AI 0.95/1000語。削るとAI側へ動く |
| 主語の一括削除テストを英語で走らせる | 非文になる。テストが走らない |
| 英語で `I think` を語尾の癖として一括削除する | 削除ではなく振り分け（実測＝断定／推論＝範囲限定ヘッジ）。総量ではなく貼り付け先を検査する |
| AI検出ツールのスコアを測る・下げる・記録する | 非ネイティブへの誤検出が構造的に偏在（61.22% vs ネイティブほぼ0）。かつ合格させる推敲がAI側の統計に寄せる |
| 「AIっぽく見えないか」を自分の感覚で判定する | 一般読者の判定精度50〜52%。金銭的インセンティブでもフィードバックでも上がらない |
| 語彙を難しくして検出を回避する | 平易英語の規則と衝突する |
| dev.to / Medium / hashnode / Indie Hackers / lobste.rs にクロスポストする | dev.to は2025-01-01以降 >50点0件 |
| Substack Notes を運用する | フォロワーグラフを持つSNS面。日本語版§7が既に棄却した構造 |
| 英語版Xアカウントを作る | in-network が配信の約50%。フォロワー0はこの経路を構造的に持たない。係数は言語で変わらない |
| Buffer / Groove / Baremetrics を0からの手本にする | 公開開始時点で月$12,000 / $28,000 / $3,000。**0フォロワー・0収益からの英語参入に直接の手本は見つからなかった** |
| HN Show HN の「動くもの」を連載できる媒体として扱う | 現在該当するのは無料の自己分析ツール1つだけで、1回きりの投稿である |
| Show HN 記事のREADMEに8見出しを置く | 元の主張の根拠となる実リポジトリが取得できず、検証していない |
| bioに「非ネイティブである」と書いて効果を期待する | 根拠なし。**書くこと自体は禁止しないが、効果がある施策として置かない** |
| 「英語圏は直截を好む」を一般化する | Cardon(2008)の224論文メタ分析で支持されていない。直截さは1文目の事実提示にだけ適用する |
| 3音節以上の語を8%以下にする | 良例4.4%・翻訳調の悪例6.3%で分離しない。閾値ではなく置換表だけ残す |

---

## 9. 英語進出の是非についての正直な結論

### 結論: **今はやらない。日本語で先に条件を満たす。**

理由は3つで、どれも精神論ではない。

**理由1: 日本語の書法体系がまだ一度も実行されていない。**

CURRENT_STATE.md の実測で note記事 **0本**、定型でない返信 **1件**、Xフォロワー **3**、確定収益 **JPY 0**。103規則で確立した書法体系は、まだ1本も公開に使われていない。英語版はその体系の英語適用であって、元の体系が動いていない段階で分岐させると、うまくいかなかったときに「体系が悪いのか、言語が悪いのか、面が悪いのか」を分離できない。

**理由2: 両腕とも n=0 の実験を2本走らせることになる。**

日本語版§7は既に同じ分散論を採用している（「impressionが1桁〜2桁前半では、1投稿あたりの分散がどんな効果量も覆う」「A/Bテストはしない」）。言語を2本に割ることは、n=0の腕を2本作る操作と同型。**現在の律速は読者数ではなく公開本数0本である。**

**理由3: 英語側の期待値が、日本語側の現状より良いわけではない。**

| 指標 | 実測 |
|---|---|
| HN投稿の得点中央値（全投稿・7四半期不変） | **2点** |
| HN投稿の得点中央値（個人ドメイン） | **3点** |
| 2点以下で終わる割合 | 48.1% |
| 4点以下で終わる割合 | 73.6% |
| 100点到達 | 5.27% |
| ≥50点着地率（直近30日） | **2.95%**（2023年 7.67% → 2024年 7.40% → 2025年 4.49% から一貫して低下） |
| コメント | 中央値0件 |

**「フォロワー0でも文章だけで届く面」ではない。** 2026年の>80点HN記事11,129件を投稿者別に集計すると、上位1%の55アカウントが20.3%を占める（speckx 211件、surprisetalk 158件、zdw 136件）。フォローグラフは無いが**発見グラフはある**。さらに、レンズが「個人ブログが届いた実例」として挙げた mariozechner.at / evanhahn.com / thereallo.dev / blog.dailydoseofds.com は**全て著者本人ではない第三者による投稿**だった。経路が開いていることと、届くことは別。

### 解除条件（EN_GATE）

次の**両方**が満たされた日に、その日の実測値で英語をやるか判断する。

```
EN_GATE: note=0/10, non_boilerplate_reply=1/3
```

- **note公開記事が10本**（日本語版§3「見直しは10本ごと」から）
- **定型の同意でない返信が累計3件**（日本語版§7「記録する数字は2つだけ(b)」から）

`CURRENT_STATE.md` にこの1行を置き、**週1回この2つの数字だけ更新する**。到達数（impression）は記録するが解除条件に入れない。

加えて、言語を増やしてよいのは「**日本語で週2本以上を4週連続で公開した**」が満たされたときだけ。週1本のうちは、英語圏の読者数がいくら大きくても言語を増やさない。

**両方の数字は本人が単独で数えられ、反証可能である。** 10も3も日本語版の既存文書から取っており、この関門のために新しく作った数字は0個。

### 解除後、最初にやること（順序）

1. 自前ドメインの静的サイトを立てる（`/YYYY/MM/slug`）。記事0本の状態でよい。
2. 記事1本＋公開リポジトリ1つの対を作る。試行20回以上、モデルID固定、生データ公開。
3. §2の公開ゲート12項目を通す。
4. HNへ自分で1回投稿する。06:00〜09:00 UTC を避ける。
5. `Author here.` で1度だけコメントし、記事に書かなかった数値を1つ置く。
6. **3点で終わったことを失敗と記録しない。20本出し終えるまで方針を変えない。**

### 隠さずに書いておくこと

**(a) 本書の根拠には強度の差がある。** 実測で確認できたのは、HN Algolia API の再集計（n=28,273 / n=11,129 / n=3,558 / n=4,948）、HN Guidelines と FAQ の原文、過剰語彙データ901行、x-algorithm リポジトリの4点。一方、「実在の英語書き手7アカウント24投稿を verbatim 実測した」という主張は**該当ファイルを開いた結果、英語の投稿が1件も含まれていなかった**。そのコーパスだけを根拠とする数値（中央値268字/44語、1文9語、カンマ0.69個、I 2.3個/100語、短縮形2.0個/100語 等）は**1つも再現できず、全て棄却した**。

**(b) 本書が守れても、届く保証はない。** 文章の射程は「届いた読者が最後まで読む／リポジトリを見る／コメントする／転送する」までで、その外（そもそも誰に届くか）は発見グラフの問題である。HNの中央値2点は、その構造の既定値であって文章力の測定値ではない。

**(c) 同時に、2点を「構造のせいだから文章は関係ない」とも解釈しない。** 構造は変えられないが、届いた2〜20人に対して何を渡せるかは全部こちら側にある。そのために必要なのは、うまい英語ではなく、日付と実測値と、記録を取っていない箇所を「取っていない」と書く正確さになる。

**(d) 0フォロワー・0収益からの英語参入に、直接の手本は見つからなかった。** これは調査の失敗ではなく、否定的な発見として記録する。借りられるのは形式（実測値の定期公開・失敗の明示・数字を据え置くこと）だけで、規模の前提は借りられない。