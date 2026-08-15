# ECHO 再設計 — キャラクター方向性 5案 / Core Interaction・Core Loop 候補 8案

2026-08-15。起点は `EXPERIENCE_BRIEF.md`（Human裁定の正本）。**探索の出力であって決定ではない。**
**Human Taste Gateで停止する。実装は開始していない。1案への確定もしていない。**

---

## 0. この文書が答えていないこと（先に書く）

- **どれが面白いか。** World Priorは他者の作品について観測された外部Evidenceであり、**ECHOのExperiment PASSにも「面白い」の証明にも使わない**（D-013）。
- **どれが売れるか。** 全案 `UNKNOWN`。
- **どれがHumanのTasteに合うか。** これが本文書をHumanへ出す理由そのものである。
- **無料ブラウザ市場のretention。** 下のEvidenceは全てSteam（有料PC市場）とitch.io（順位のみ公開）由来で、**この市場の行動Signalは取得できていない**（`LEARNING.md` §10から未解消）。

---

## 1. World Prior — 取得したEvidence

**Question**: 人が生き物・相棒キャラクターに対して「かわいい」「触りたい」「愛着が湧いた」と感じ、逆に「動かない」「飽きた」「思い出せない」と離脱するのは、**具体的にどのMechanismの有無で分かれているか。**

**取得**: Steam公式API（`appreviews`。review score / 総数 / **レビュー投稿者のplaytime** / positive・negative両側のverbatim）を一次取得。加えて itch.io の **web platform** × virtual-pet タグ一覧（無料ブラウザ市場の分布確認）。**成功例と失敗・低成果例の両方を取る。**

### 1-1. Evidence Set A — 生き物への愛着（前セッション取得）

| 作品 | % | reviews | median play（レビュー投稿者） |
|---|---|---|---|
| Stray | 97 | 89,294 | 557分 |
| Slime Rancher | 98 | 75,288 | 1,583分 |
| Spore | 93 | 41,522 | 1,362分 |
| Rain World | 94 | 36,563 | 2,015分 |
| Slime Rancher 2 | 94 | 27,289 | 1,893分 |
| Little Kitty, Big City | 97 | 8,601 | 568分 |
| Bugsnax | 98 | 7,543 | 1,263分 |

### 1-2. Evidence Set B — 直接触る / 玩具 / 自律する生き物（本セッション取得）

| 作品 | % | reviews | median play |
|---|---|---|---|
| Human Fall Flat | 95 | 226,293 | 1,480分 |
| Goat Simulator | 91 | 70,224 | 872分 |
| Untitled Goose Game | 96 | 24,959 | 463分 |
| Placid Plastic Duck Simulator | 98 | 20,117 | 1,839分 |
| Cat Goes Fishing | 94 | 16,438 | 1,137分 |
| **Wobbledogs** | 98 | 15,158 | 2,356分 |
| Katamari Damacy REROLL | 93 | 6,650 | 454分 |
| Digimon World: Next Order | 81 | 2,935 | 3,024分 |
| Ooblets | 91 | 1,550 | 3,281分 |
| Pupperazzi | 95 | 550 | 222分 |
| Nanomon Virtual Pet | 88 | 145 | 1,302分 |
| Desktop Pet | 88 | 33 | 344分 |
| Kukumushi Virtual Pet | 75 | 20 | 210分 |

### 1-3. Evidence Set C — 無料ブラウザ市場（itch.io / platform-web / tag-virtual-pet 上位）

KittyToy「Kitty Caretaking Simulator」/ Tamaweb「A Tamagotchi-like Virtual Pet Game」/ Dog Wash「Wash a Doggo!」/ Cat Cove Inn「Foster cats…」/ Goodnight Meowmie / Mini Me-Mao「A cozy desktop companion that paints while you decorate their room and dress the[m]」/ Fantastic Fetus / Taming.io / Mothkeeper「Raise a nursery of moths」/ Tiny House「Pet foster care simulator」/ EGG BABY「hatch a baby from an egg」/ ghostfriend / Clowning Around!「Take care of your new monstrosity!」

**Observed**: 上位のblurbは**ほぼ全て「世話の物理動作」**（洗う・着せる・部屋を飾る・孵す・世話する）で構成されており、**会話・選択肢・分岐を売り文句にしているものが上位に無い。**
**`UNKNOWN`**: itch.ioはreview score・retention・DAUを公開していない。**質・継続率は測れていない。順位アルゴリズムも非公開。**

---

## 2. World Prior — What appears to work

### W1. 非言語の身体表現が、言葉より強く伝わる
- Stray: *"says so much without saying much at all... because the MC cant even talk"*
- Untitled Goose Game（24,959件 / 96%）: 動詞は3つだけ。*"The controls are simple: you can honk, flap your wings, and pick stuff up with your beak."* 最上位級レビューの核が *"you can honk"* / *"H O N K"*
→ **v1のHuman verbatim「ほぼすべてテキストベース」の真裏。**

### W2. 触った時の手応えは「良ければ加点」ではなく「悪ければ終了」
- Untitled Goose（**否定側** up9 / 127分）: *"The only reason why I am not recommending this game is because the controls feel so bad. Every time I play this game, I feel like I always have an issue controlling my goose"*
- Little Kitty: *"bumping into ANYTHING gets you stunlocked"* / *"Controls and overall feel are incredibly sluggish"* → 30分で離脱
- Katamari（**93%の肯定レビュー内**で / 1,229分）: *"Whats not to love? Well, the controls. ... get an Xbox One controller to use, or you WILL hate your life"*
- 逆（up52 / 3,546分）: *"The goose controls / behavior are perfect. A lot of work went into the controls and animations for the goose, and you can tell."*
→ **高評価作でも操作が最大の不満として名指しされる。触り心地は二値であり、後から足せない。**

### W3. 「かわいい」は静止画ではなく、ばかなことをする挙動
- Pupperazzi 最上位（up74 / 95分）: *"YOU CAN PET THE DOGS. You can play with them! You can watch them do silly stuff! ... I literally laughed so hard I started crying from how cute and silly this game is."*
- Pupperazzi（up2）は**動詞の在庫**をそのまま列挙してレビューにしている: *"Pet the dogs - Feed the dogs - Play music for the dogs - Skateboard with the dogs - Dress the dogs - Undress the dogs - Play lullabies for the dogs"*
- Little Kitty *"plenty of silly cat chaos"* / Bugsnax *"fun goofy simple game"*
- **失敗側**: Bugsnax *"the muppets are a little too human (but in like a boring way)"* → **人間に近づけると魅力が減る。**

### W4. 自律的に起きる出来事が、プレイヤーに物語を語らせる
- **Placid Plastic Duck Simulator: 98% / 20,117件 / median 1,839分。プレイヤーは何も操作できない。**
  最上位（up477 / 4,598分）: *"This is less a game and more of an experience. No, you cannot control the ducks. But you CAN watch them. And by watching them, you can witness SO MUCH. One of my ducks had babies which it promptly abandoned."*
  （up143）: *"The drama is also riveting; aliens abducted my cow duck and impregnated another one of my ducks"*
- Rain World: *"a nature documentary gains sentience"* / *"i love this game's ecosystem"*
- 裏返し（Ooblets 否定側 up5 / 1,212分）: *"I wish the town looked a bit more alive but the characters are always at the same place it doesn't feel like a town where people actually live."*
→ **キャラが勝手に動くと、プレイヤーが勝手に物語を作る。作者が物語を書かなくてよくなる。**

### W5. 愛着は「名前」＋「その個体固有の逸話」で発生する
- Wobbledogs **最上位レビュー（up621 / 301分）が丸ごとこの構造**:
  *"Got my first dog Pancake. Played with him, fed him, loved him. Got some more dogs for Pancake. Pancake played with them. Was best friends with Randy. Watch Pancake grow older & change with the minutes. Always happy and playful. I loved Pancake."*
- （up145 / 2,394分）: *"I made a dog named The Lump. It moves like a spider, is a glutton, and terrifies me."*
→ **愛着の単位は「システム」ではなく「この個体のこの逸話」。**

### W6. 音は付属物ではなく、行為そのものとして名指しされる
- Untitled Goose: *"you can honk"* が identity。
- Placid Duck（up390 / 494分）: *"I can watch cute little duckies float around with funny music and just relax"*
- **失敗側**（Ooblets 否定 up4 / **20分で離脱**）: *"i just cannot get into the grating music... if i turn the music off, the game's basically silent except for UI sounds and interactions."*
→ **音の不在・不快は単独で離脱理由になる。** Brief §3-7「無音は禁止」はPriorと一致する。

---

## 3. World Prior — What appears not to work

### F1. 個体差が挙動に出ないと、22時間遊んでも愛着はゼロ
- Wobbledogs（**98% / 15,158件の成功作の否定側** up6 / **1,339分**）:
  *"I wanted a pet simulator, what I got was an animal husbandry simulator. The wobbledogs, in my opinion, exhibit very little personality and after 22 hours of play I cannot recall a single wobbledog who I particularly remember."*
- （up2 / 319分）: *"Boring. There are not enough fun interactions with the dogs, the dogs themselves can barely even move and **they don't feel alive at all**."*
→ **v1のHuman verbatim「育ててもキャラクター自体が大きく変化している感じがない」「愛着が湧かない」と語彙レベルで一致する。**
→ **成功作でもこの失敗モードは起きる。** つまりこれは「作りが甘い」ではなく**構造的な穴**である。

### F2. 世話がタスク化した瞬間に離脱する
- Slime Rancher（98% / 75,288件の否定側）: *"wake up collect slime poop sell slime poop get new slimes go to bed"*
- Wobbledogs（up22 / **58分**）: *"after like an hour it was so incredibly repetitive and boring... there's nothing major to do past the whole 'breed dog.. maybe get fun muta[tions]'"*
- Nanomon Virtual Pet: *"simply too repetitive... eventually die and start all over again"*
- Ooblets（up48）: *"the core components are all a huge slog"*
→ **Brief §3-4「数字を見せない / 行動から気付く」はここに直接効く。メーターを出した瞬間にタスクになる。**

### F3. 「玩具」で止まると、5分〜1時間で底が見える
- Goat Simulator、**本セット最多upvoteの否定レビュー**（up702 / 99分）: *"A few laughs for about 5 minutes, before you realize, there's absolutely nothing fun to do in the game."*
- Wobbledogs（up12 / 104分）: *"there really isn't a whole lot to really do, and **it's almost more of a toy than a game**. I felt like I had seen everything I was going to [see]"*
→ **§6のL-1（純粋タッチ玩具）に対する最強の反証Evidence。** ただしPlacid Duck（W4）は同じ性質で98%を取っている——**分かれ目は「自律的な出来事が供給され続けるか」。**

### F4. 開始の遅さは、良作でも脱落を作る
- Stray: *"The beginning is incredibly slow, and I almost dropped it"*
- Placid Duck（up57）: *"In the beginning I actually almost just stopped playing because I thought the whole thing was just waiting... but then I just like, got it."*
→ Brief §3-2「最初の10秒」はPriorと一致する。

### F5. 死・喪失は、World Priorがコストを実測している
- Wobbledogs（up7 / 1,309分）: *"the first time one of my dog died, I was disturbed that the other dogs cannibalized them"*
- （up1 / 528分）: *"it can give negative feelings. If you have had a pet die than you know what i'm [talking about]"*
→ **Briefは死・喪失を要求していない。AIが勝手に入れない。**

### F6. 個体を増やすと、愛着は分散する
- Wobbledogsは**繁殖・遺伝がコア**で98%を取りながら、否定側の中心が F1（22時間・1匹も思い出せない）である。
- Briefの必須条件は **「育てる対象そのものを好きになれること」**（単数）。
→ **繁殖・コレクション・複数体は、Briefと逆向きに働く可能性がある。** 全案で単体を既定とする。

---

## 4. Confounders / Unknown（隠さない）

- **市場が違う。** Evidenceは有料PC（Steam）とitch.io。ECHOは**無料ブラウザ・スマホ**。転用は仮説であって実証ではない。
- **median playtimeは `Derived`。** レビュー投稿者だけの偏った母集団。Placid Duckの1,839分は**放置時間**を含む可能性が高く、能動的関与時間ではない。
- **Untitled Goose / Goat Sim / Katamari / Stray は viral・IP・話題性・年代の交絡が極めて大きい。** review数はmarketingの関数でもある（`LEARNING.md` §2と同じ注意）。
- **Human Fall Flat の226,293件はマルチプレイの交絡が支配的**で、「floppy物理が単独で商品になる」証明ではない。
- **「スマホWebでのタッチの手応え」を直接測ったEvidenceは1件も無い。** W2は全てPC操作（controller / keyboard）の話である。**ECHOで最も重要な変数が、World Priorでは `UNKNOWN`。**
- 前回のセッションで私のappid誤りにより別ゲームのレビューを取得した2件（1213210 / 1568590）は、本Evidence Setに**含めていない**。

---

## 5. Briefの明示制約 — 候補が満たさなければならない条件

`EXPERIENCE_BRIEF.md` §3-1 が名指しで否定した実装がある。

> 現在の**中央の目のようなECHO**は、機能上の **state visualization** にはなっているが、「触りたい」「かわいい」「こいつを育てたい」という感情を起こせていない。
> **抽象的な記号や目だけではなく、表情・身体・仕草によって感情を読み取りたくなるキャラクターにする。既存キャラクターのコピーはせず、独自キャラクターにすること。**

したがって全候補は次を満たす。

| # | 条件 | 出所 |
|---|---|---|
| 1 | **身体がある**（手足・頭・尾など、目以外の可動部を持つ） | Brief §3-1 |
| 2 | **表情がある**（目だけでなく、口・耳・毛・体の張り等の第二表現を持つ） | Brief §3-1 |
| 3 | **仕草で感情が読める**（静止画ではなく所作） | Brief §3-1 / W3 |
| 4 | **既存キャラクターのコピーではない** | Brief §3-1 |
| 5 | **触ると即 animation + expression + sound が返る** | Brief §3-2 |
| 6 | **接し方で 表情 / animation / 距離 / 好き嫌い / 行動頻度 / 声 / 色・身体的特徴 / 自発行動 が変わる** | Brief §3-4 |

**この条件により、初稿にあった「影・煙のような塊に目がひとつ」案は取り下げた**（§7）。それは条件1・2を満たさず、**Humanが名指しで否定した「記号と目だけ」の延長**だった。

---

## 6. キャラクター方向性 — 5案

全案の共通条件: **単体 / 非人間型 / 数字なし / 勝手に動く**（F6・Brief §3-6）。

### C-1. もち状の身体に、短い手足と口がある生き物

| | |
|---|---|
| 身体 | 単色の柔らかい体。短い手足。目と口。輪郭が常に微振動している |
| 表情 | 口の形・目の細さ・**体の張り**（緊張すると硬く小さく、安心すると緩んで広がる） |
| 仕草 | 押されると凹んで跳ね返る。引っ張ると伸びて抗議する。撫でると全身が緩む |
| 育つと | 体の大きさ・張り・色の濃さ・跳ね方の速さ・こちらへ寄る距離 |
| Prior | W2（**触り心地は二値。ならば触感そのものを主商品にする**）/ W1 / Human Fall Flat 226,293件・95% |
| リスク | **F1直撃。** 仕草の語彙が少ないと「体は変形するが個性がない」になる。**手足と口を必ず持たせることが成立条件**（記号+目に退化させない） |

### C-2. 一本足の、飛べない鳥（よく転ぶ）

| | |
|---|---|
| 身体 | 丸い体・大きい目・くちばし・短い翼・一本の足 |
| 表情 | くちばしの角度 / 目 / 翼の広げ方 |
| 仕草 | 歩くと必ずよろける。転ぶ。すぐ起き上がる。指を追いかける。撫でると目を閉じて傾いてくる |
| 育つと | 転ばなくなる／転び方が変わる／指を待つ／勝手に遠くまで行く。**所作だけで分かる** |
| Prior | W3（silly = cute）/ Untitled Goose *"The goose controls / behavior are perfect"*（移動そのものが快楽）/ Little Kitty *"silly cat chaos"* |
| リスク | **歩行・転倒アニメの質に全部が乗る。** 安く作ると「キャラクターにほとんど動きがない」——**v1でHumanが挙げた不満そのもの**へ戻る |

### C-3. 殻から半分だけ出ている生き物

| | |
|---|---|
| 身体 | 殻 + そこから出ている頭・短い手。**全身は最初見えない** |
| 表情 | **出ている量そのものが感情。** 怖いと引っ込む、安心すると全身が出る |
| 仕草 | 撫でると少し出る。驚くと瞬時に隠れる。慣れると殻を引きずって寄ってくる |
| 育つと | **どれだけ出てくるか＝関係の履歴。** Brief §3-4「playerとの距離」を**身体で直接表現する唯一の案** |
| Prior | F1の裏返し（*"don't feel alive at all"*）/ W4 / W5 |
| リスク | **序盤ほとんど見えない＝F4（開始の遅さで脱落）。** 0秒の「かわいい」を殻だけで作れるかが勝負 |

### C-4. 耳が異常に大きい、二足の小獣

| | |
|---|---|
| 身体 | 小さい体に不釣り合いに大きい耳。短い手足。尻尾 |
| 表情 | **耳が全感情を表す**（前傾＝興味 / 後ろ倒し＝不安 / ぴくぴく＝反応）。目と口が第二表現 |
| 仕草 | 音に反応して耳が動く。呼ぶと**耳だけ先に**向く。眠い時は耳が垂れる |
| 育つと | 耳の既定角度・反応速度・呼んだ時に来るか・鳴き声 |
| Prior | **W6（音は行為そのもの）。Brief §3-7「音もキャラクター性の一部にする」と構造的に繋がる唯一の案** / W3 / Bugsnax *"too human... boring"* の回避 |
| リスク | **既存キャラの記憶を呼びやすい**（Brief §3-1「既存キャラクターのコピーはしない」）。**耳の動きの語彙で独自性を作れるかが条件** |

### C-5. 半透明の体を持ち、食べたものが体に残る小さな獣

| | |
|---|---|
| 身体 | 半透明の体 + 目 + 口 + 短い足 |
| 表情 | 口と目、そして**体内の色** |
| 仕草 | 光る物・落ちている物を追う。飲み込む。満ちると光る。気に入らない物は吐く |
| 育つと | **体の色と模様が、これまで与えたもの・起きたことの履歴そのもの。** 数字ゼロで累積が可視化される |
| Prior | **F1への直接の対策**（*"cannot recall a single wobbledog"* = 体に出ないと愛着は生まれない）/ W5 / Brief §3-4「色や身体的特徴」 |
| リスク | 「与える」へ寄りすぎると **F2（世話のタスク化）**。給餌をメーター化した瞬間に死ぬ |

---

## 7. Core Interaction / Core Loop 候補 — 10案

Brief §3-3 が挙げた動詞（**撫でる / 遊ぶ / 食べ物を与える / 呼ぶ / 放っておく / 邪魔する / 助ける / 自由にさせる**）を全て覆う。**各案は排他ではない。**

### L-1. 撫でる・つつく・引っ張る（触ることそのもの）
- **返り**: 即座の変形 + 表情 + 音（Brief §3-2）
- **育ち**: 触られ方の履歴で「近づく／逃げる／待つ」の既定が変わる
- **Prior**: W2 / W6 / Pupperazzi 最上位 *"YOU CAN PET THE DOGS"*
- **弱点**: **F3。** Goat Sim *"5 minutes, before you realize, there's absolutely nothing fun to do"*（up702）。**単独では最も早く底が見える**

### L-2. 呼ぶと来る／来ない（距離が関係を表す）
- **返り**: 名前を呼ぶ（タップ／長押し）と、来る・耳だけ向ける・無視する
- **育ち**: **playerとの距離そのもの**（Brief §3-4）。呼ばれる前に来るようになる／来なくなる
- **Prior**: W5（個体の逸話）/ Wobbledogs *"Watch Pancake grow older & change"*
- **弱点**: 「呼べば来る」が固定だと**正解当て**になる（Brief §5違反）。**来ないことに意味を持たせる必要がある**

### L-3. 与える・好き嫌いができる
- **返り**: 食べる／吐く／隠す。反応が個体差になる
- **育ち**: **好き嫌い**（Brief §3-4）。C-5なら体の色に残る
- **Prior**: W3（動詞の在庫が快楽）/ Bugsnax
- **弱点**: **F2の最短経路。** 空腹メーターを出した瞬間にタスク化して死ぬ（*"wake up collect slime poop"*）

### L-4. 一緒に遊ぶ（投げる・追わせる・引っ張り合う）
- **返り**: 物理的な往復。ECHOが持ち帰る／持ち帰らない／独り占めする
- **育ち**: 遊びの誘い方をECHO側から出すようになる（**自発行動**）
- **Prior**: W3 / Untitled Goose（物を咥えて運ぶことがゲーム全体）
- **弱点**: **W2直撃。** 投げる・追う の手触りが悪いとその場で終わる

### L-5. 邪魔する／自由にさせる（**干渉の量そのものが性格軸**）
- **返り**: ECHOが何かを始めた時、止める・手を出す・見ている・放っておく
- **育ち**: 手を出し続けると**player待ち**の性格に、放っておくと**勝手にやる**性格になる
- **Prior**: W4（Placid Duck 98%・1,839分は**操作できないことが体験**）/ Rain World *"a nature documentary gains sentience"*
- **なぜ重要か**: **Brief §3-5「極端な善悪二択にしない / 普通に遊んだ結果として性格が形成される」への直接の答え。** 軸を「優しい／冷たい」ではなく**「どれだけ手を出すか」**に置けば、善悪の判断を一度もさせずに性格が分岐する
- **弱点**: 何もしないことが選択だと**気付かれない**可能性。Discoverabilityが未検証

### L-6. 助ける（ECHOが自分で困る）
- **返り**: ECHOが挟まる・届かない・落ちる。playerは助ける／見ている／笑う
- **育ち**: 助けられ続けると呼ぶようになる／自力で解決するようになる
- **Prior**: W4（自律的な出来事が物語を生む）/ Stray *"squeezing through tiny spaces"*（身体の物理が快楽）
- **弱点**: 困り方の種類が少ないと **F2（反復）**

### L-7. 放っておく（不在も入力）
- **返り**: 戻ってきた時の反応が変わる。拗ねる／忘れている／待っていた
- **育ち**: 独立心と執着。**「無視する」もECHO側の反応として返る**（Brief §3-6）
- **Prior**: F2の回避（世話を義務にしない）/ Brief §3-3「放っておく」
- **弱点**: **罰ゲーム化すると F5（死・喪失）へ滑る。** Briefは死を要求していない

### L-8. ECHOが勝手に見つけてくる・いたずらする（Surprise供給）
- **返り**: 持ってきた物・壊した物が画面に残る＝**プレイヤーの物語の物的証拠**
- **育ち**: 見つけてくる物の種類・いたずらの規模・頻度（**行動頻度**・**自発行動**）
- **Prior**: **W4の直接実装。** Placid Duck *"One of my ducks had babies which it promptly abandoned"* は**開発者が書いていない物語を客が語っている実例**
- **弱点**: **F3への唯一の反証がこれ。** 逆に単独だと「見てるだけ」になりBrief §3-3違反。**L-1と必ず併走させる**

### L-9. 音と声（触った音 / 喜び / 嫌がる / 移動 / 発見 / 重要イベント）
- **返り**: 全反応に固有音。触り続けると音が繋がる
- **育ち**: **鳴き声・声が変わる**（Brief §3-4）。高さ・長さ・返事の速さ
- **Prior**: W6（*"you can honk"* が identity）/ Ooblets 否定側は「音楽が不快、切ると無音」で**20分離脱**
- **弱点**: **単独ではLoopにならない。全案の必須下敷き**として扱うのが正しい

### L-10. 最後に一度だけ、身振りでお願いする（**Round 1のHookを維持**）
- **返り**: 十分に関わった後にだけ発生。**テキスト3択ではなく身振りで頼む**（指す・引く・呼ぶ）。ECHOは性格・関係・経験から自分で判断する
- **育ち**: ここで初めて累積が結果として返る（Brief §3-8）
- **Prior**: Brief §3-8 + **Round 1で機構として成立が確認された層**（命令感度 実測 29%→70%。Human裁定により**維持対象**）
- **弱点**: ここへ寄せすぎると **v1の再生産**。分岐ノベルにしないことが成立条件（Brief §5）

**（任意の追加要素）名前と、その個体の逸話** — 最初に名前を付け、起きた出来事が短い一行として溜まる。**W5は本セット最強のPrior**（Wobbledogs最上位 up621 が丸ごとこの構造）だが、**Briefは要求していない**。**テキストへ逆戻りする最大のリスク**であり、採るなら「行動が先・記録は後から読むもの」の順序が絶対条件。

---

## 8. 明示的に候補から外したもの（理由つき）

| 外したもの | 理由 |
|---|---|
| **中央の目だけの state visualization** | **Brief §3-1 が名指しで否定。** v1の実装そのもの |
| **初稿の「影・煙に目がひとつ」案** | 同上。§5条件1・2（身体・第二表情）を満たさない。**私の初稿の誤り** |
| 3択テキストの連鎖 | Brief §3-3 明示禁止 + v1のHuman verbatim |
| 数値ステータス表示 | Brief §3-4 明示禁止 + F2 |
| 極端な善悪二択 | Brief §3-5 明示禁止（代替はL-5の干渉量軸） |
| 性格診断的な質問列 | Brief §3-5 明示禁止 |
| 既存キャラクターの模倣 | Brief §3-1 明示禁止 |
| **死・喪失を軸にすること** | **Briefが要求していない。** F5でWorld Priorがコストを実測（*"I was disturbed"* / *"it can give negative feelings"*） |
| **繁殖・遺伝・コレクション・複数個体** | **F6。** Briefの必須条件は「育てる対象**そのもの**を好きになれること」（単数）。Wobbledogsは繁殖がコアで98%を取りながら、否定側の中心が「22時間で1匹も思い出せない」 |

---

## 9. AIの意見（**決定ではない。Humanが選ぶ**）

Brief §6 により **AIだけで1案へ確定しない。** 以下は根拠の提示であって推奨の押し付けではない。

**Loopについて（Priorが答えられる範囲）**

- **F3（玩具は5分で底）に対する唯一の反証が W4（自律的な出来事）** である。したがって **L-1 単独は避ける根拠がある**。最小構成は `L-1 + L-8 + L-9`（触れる / 勝手に起きる / 音）。
- **L-5（干渉量を性格軸にする）は、Brief §3-5「極端な善悪二択にしない」への構造的な答え**として、他のどの案よりも直接的である。
- **L-3（給餌）と L-7（放置）は、扱いを誤ると F2 / F5 へ最短で滑る。** 採るなら設計条件を先に固定する必要がある。

**キャラクターについて（Priorが答えられない範囲）**

- **キャラクターは World Prior では決まらない。** C-1〜C-5 の差は Taste の差である。Priorが答えるのは次の2点だけ:
  - **人間型に寄せると魅力が落ちる**（W3失敗側 Bugsnax *"too human (but in like a boring way)"*）
  - **itch.io の browser virtual-pet 上位は既に犬猫で埋まっている**（KittyToy / Dog Wash / Cat Cove Inn / Tiny House）ため、**現実の犬猫そのものは避ける根拠がある**

**Human Taste Gateで判定してほしい軸**

1. **C-1〜C-5 のうち、開いた瞬間に「何こいつ、かわいい。触ってみたい」と思うのはどれか。** 1つでも複数でも、全部違うでも良い。
2. **L-1〜L-10 のうち、実際に触りたい／触り続けたいのはどれか。**
3. **Briefに書かれていないが「これは絶対に外せない」と思っているもの**があれば。

---

## 10. STOP — Human Taste Gate

**ここで停止する。** 実装・prototype・variant生成・Round 2は開始していない。`echo-v1.html` にも一切触れていない。

次は Brief §6 に従い、**Humanがキャラクター方向性とCore Experienceを選んだ後**に、選ばれた方向についてのみ大量variationを探索する（`大量Concept → 少数Prototype → Human Taste → 深く作る`）。
