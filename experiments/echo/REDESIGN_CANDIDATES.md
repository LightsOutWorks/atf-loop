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
→ **§4のL-1（純粋タッチ玩具）に対する最強の反証Evidence。** ただしPlacid Duck（W4）は同じ性質で98%を取っている——**分かれ目は「自律的な出来事が供給され続けるか」。**

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

## 5. キャラクター方向性 — 5案

全案の共通条件（Briefより）: **単体 / 非人間型 / 数字なし / 触ると即反応（animation + expression + sound）/ 放っておいても勝手に動く。**

### C-1. まだ形が決まっていない、柔らかい塊（もち・スライム状）

| | |
|---|---|
| 見た目 | 単色の柔らかい塊 + 目。輪郭が常に微振動している |
| 触ると | 押すと凹み、離すと跳ね返る。引っ張ると伸びて抗議音、撫でると目が細くなる |
| かわいさの出所 | **物理そのもの。** 言語も凝った表情も要らない |
| 育つと | 形が変わる（角が出る / 色が濃くなる / 跳ね方が速くなる / 触られ待ちの姿勢を取る） |
| Prior根拠 | W1（非言語）/ W2（触り心地が二値なら**触り心地そのものを商品にする**）/ Human Fall Flat |
| 最大のリスク | 「ただのスライム」で個体差が挙動に出ないと **F1の直撃**。Canvasで最も安い＝最も凡庸にもなりやすい |

### C-2. 一本足の小鳥（飛べない・よく転ぶ）

| | |
|---|---|
| 見た目 | 丸い体 + 大きい目 + 短い足。歩くと必ずよろける |
| 触ると | つつくと飛び上がって着地に失敗する。撫でると目を閉じて体を傾けてくる。指を追う |
| かわいさの出所 | **不完全さ。** 転ぶ・失敗する・それでも諦めない |
| 育つと | 転ばなくなる／転び方が変わる／指を待つようになる／勝手に遠くまで行くようになる。**数字ではなく所作で分かる** |
| Prior根拠 | W3（silly chaos = cute）/ Untitled Goose *"controls / behavior are perfect"*（移動そのものが快楽）/ Little Kitty *"silly cat chaos"* |
| 最大のリスク | **歩行・転倒アニメの品質に全部が乗る。** 安く作ると「キャラクターにほとんど動きがない」——**v1でHumanが挙げた不満そのもの**に戻る |

### C-3. 箱の中の生き物（画面のこちら側を覗いてくる）

| | |
|---|---|
| 見た目 | 画面が「箱」で、中で何かが暮らしている。蓋を開ける・傾ける・指を入れる |
| 触ると | 指に寄ってくる／隠れる／噛む。箱を傾けると転がって怒る |
| かわいさの出所 | **こちらを認識していること。** 目が指を追う。放っておくと画面のこちら側を見てくる |
| 育つと | 隠れなくなる／指を待つ／勝手に箱の外へ出ようとする |
| Prior根拠 | W4（自律が物語を作る）/ Placid Duck 98%・1,839分（**操作できないのに**）/ F1の裏返し（*"don't feel alive at all"*） |
| 最大のリスク | 「見てるだけ」へ寄ると **Brief §3-3「直接触れ合う」から外れる**。L系と必ず組む必要がある |

### C-4. 影・煙のような、輪郭の定まらない相棒

| | |
|---|---|
| 見た目 | 半透明の塊に目がひとつ。動くと尾を引く。触ると散って、また集まる |
| 触ると | 指にまとわりつく。撫でると濃くなる。強く払うと薄れて離れる |
| かわいさの出所 | **触れると形が変わるという反応そのもの** |
| 育つと | 濃さ・大きさ・寄ってくる速さ・散り方が変わる |
| Prior根拠 | W1 / W5（個体差が挙動に出る）。**「ECHO」という名と「鏡」という元のDesireへの整合が5案で最も高い** |
| 最大のリスク | **「かわいい」から最も遠い。** Brief §4の0秒条件（「何これ、かわいい」）を満たせない可能性が最も高く、**Taste判定が最も割れる案** |

### C-5. ちいさな四つ足の獣（現実の犬猫ではない中間種）

| | |
|---|---|
| 見た目 | 頭が大きく足が短い。耳と尻尾が感情を全部表す |
| 触ると | 撫でると目を閉じて尻尾が動く。つつくと耳が下がる。ドラッグすると足がばたつく |
| かわいさの出所 | **既存の可愛さ回路をそのまま借りる**（最も安全・最も凡庸） |
| 育つと | 尻尾の振り方・耳の角度の既定値が変わる。呼ぶ前に来る／来ない |
| Prior根拠 | Pupperazzi最上位 *"YOU CAN PET THE DOGS"* / Stray 89,294件・97% / Bugsnax *"too human... boring"* の回避として現実の動物からずらす |
| 最大のリスク | **差別化がゼロ。** Priorが最も厚い一方、**itch.ioのbrowser virtual-pet上位が既に全部これ**（KittyToy / Dog Wash / Cat Cove Inn / Tiny House） |

---

## 6. Core Interaction / Core Loop 候補 — 8案

各案は**排他ではない**。L-5・L-7は下敷きに近く、単独ではLoopにならない。

### L-1. 触ることが全部（Pure Touch Toy）
撫でる／つつく／引っ張る／離す だけ。目標なし。ECHOは触られ方を覚える。
- **返り**: 即座の変形 + 表情 + 音（Brief §3-2の「即反応」）
- **育ち**: 触られ方の履歴で「近づく／逃げる／待つ」の既定が変わる
- **Prior**: W2 / W6 / Placid Duck（目標ゼロで98%）
- **反証Evidence**: **F3。** Goat Sim *"5 minutes, before you realize, there's absolutely nothing fun to do"*（up702）。**単独では最も早く底が見える。**

### L-2. ECHOが勝手に何かを見つけてくる（Autonomous Discovery）
放っておくとECHOが画面内を探索し、何かを見つけて持ってくる／壊す／隠す。プレイヤーは受け取る・褒める・叱る・無視する。
- **返り**: 持ってきた物が画面に残る＝プレイヤーの物語の物的証拠
- **育ち**: 持ってくる物の種類が変わる。褒めると同じ物を、叱ると隠れて持ってくる
- **Prior**: **W4の直接実装。** Placid Duckの *"my ducks had babies which it promptly abandoned"* は、**開発者が書いていない物語をプレイヤーが語っている実例**
- **弱点**: 単独だと「見てるだけ」。**L-1と必ず併走させる**

### L-3. いたずらと制止（Mischief / Stop）
ECHOが定期的に良くないことを始める。プレイヤーは止める／笑って見ている／煽る。
- **返り**: 止めると拗ねる、放置すると調子に乗る、煽ると本気になる
- **育ち**: いたずらの規模と頻度。止め続けると何もしなくなる（**これも育ちの結果**）
- **Prior**: Untitled Goose 24,959件・96%（**ゲーム全体がこれ**）/ W3
- **弱点**: 「正解の止め方」が生まれると **Brief §5「正解を当てさせられている」に抵触**。**正解を作らないことが成立条件**

### L-4. 名前と、その個体の逸話（Name + Episode）
最初に名前を付ける。以降ECHOに起きた出来事が短い一行として溜まる（例:「◯◯は初めて自分から近づいてきた」）。
- **返り**: プレイヤー自身の履歴が読み物になる
- **育ち**: 記録の内容そのもの。**数字は一切出さない**
- **Prior**: **W5。Wobbledogs最上位レビュー（up621）が丸ごとこの構造**
- **弱点**: **テキストへ逆戻りする最大のリスク。** v1の失敗と同型になりうる。**行動が先・記録は後から読むもの**という順序を守れるかが全て

### L-5. 触ると音が出る（Sound as the Body）
全反応に固有音。撫でる／つつく／怒る／喜ぶ／転ぶ で音が違う。触り続けると音が繋がって旋律になる。
- **返り**: 音そのものが遊びになる
- **育ち**: 声が変わる（高さ・長さ・返事の速さ）
- **Prior**: W6（*"you can honk"*）/ Ooblets 否定側の20分離脱
- **弱点**: **単独ではLoopにならない。全案の必須下敷き**として扱うのが正しい

### L-6. 世話をタスクにしない要求（Needs without Meters）
空腹メーターを出さない。ECHOが**何かを見ている／こちらを見る**という所作だけで要求を出す。
- **返り**: 応えると近づく。無視し続けると**怒らずに諦める**
- **育ち**: 要求の出し方が変わる（露骨→控えめ／控えめ→露骨）
- **Prior**: F2（*"wake up collect slime poop"* / *"too repetitive"*）+ Brief §3-4
- **弱点**: **気付かれないと何も起きない。** Discoverabilityが最大の未検証点

### L-7. 成長が体に出る（Body as the Stat Sheet）
数値を一切表示せず、大きさ・色・輪郭・動きの速さ・こちらとの距離だけで変化を示す。
- **返り**: プレイヤーが「あれ、前より…」と自分で気付く
- **育ち**: これ自体が育ちの表示系
- **Prior**: W5（*"Watch Pancake grow older & change with the minutes"*）/ **F1（体に出ないと1,339分遊んでも1匹も思い出せない）**
- **弱点**: 変化幅が小さいと **Human verbatim「大きく変化している感じがない」の再発。変化は過剰なくらい大きい側へ倒す**

### L-8. 最後に一度だけ、お願いをする（The One Ask）
十分に関わった後にだけ、一度だけ何かを頼める。ECHOは育ちに応じて応じる／応じない／別のことをする。**テキスト3択ではなく身振りで頼む**（指す・引く・呼ぶ）。
- **返り**: ECHOの反応がそのまま結末
- **育ち**: ここで初めて累積が可視化される
- **Prior**: Brief §3-8 + Round 1で唯一機構として成立した層（命令感度 29%→70%）
- **弱点**: **v1で唯一生き残った良い部分。ここへ寄せすぎるとv1の再生産になる。** 分岐ノベルにしないことが成立条件

---

## 7. 明示的に候補から外したもの（理由つき）

| 外したもの | 理由 |
|---|---|
| 3択テキストの連鎖 | Brief §3-3 明示禁止 + v1のHuman verbatim |
| 数値ステータス表示 | Brief §3-4 明示禁止 + F2 |
| 極端な善悪二択 | Brief §3-5 明示禁止 |
| 性格診断的な質問列 | Brief §3-5 明示禁止 |
| **死・喪失を軸にすること** | **Briefが要求していない。** F5でWorld Priorがコストを実測している（*"I was disturbed"* / *"it can give negative feelings"*） |
| **繁殖・遺伝・コレクション・複数個体** | **F6。** Briefの必須条件は「育てる対象**そのもの**を好きになれること」（単数）。Wobbledogsは繁殖がコアで98%を取りながら、否定側の中心が「22時間で1匹も思い出せない」 |

---

## 8. AIの意見（**決定ではない。Humanが選ぶ**）

Human裁定により**AIだけで1案へ確定しない**。以下は根拠の提示であって推奨の押し付けではない。

- **Priorが最も厚い組み合わせ**は `L-1 + L-2 + L-5 + L-7`（触れる / 勝手に動く / 音 / 体で育つ）。これはPlacid Duck（W4）とUntitled Goose（W1・W2・W6）が別々に実証している層を、**片方だけでは足りないから両方載せる**という構成である。**F3（玩具で止まると5分で底）に対する唯一の反証がW4である**ため、L-1単独は避ける根拠がある。
- **最も危険な単独案**は L-1 単独（F3）と L-4 主軸（v1の再生産）。
- **キャラクターは、World Priorでは決まらない。** C-1〜C-5の差はTasteの差であり、Priorが答えるのは「人間型に寄せると魅力が落ちる」（W3失敗側）と「itch.ioのbrowser上位は既にC-5で埋まっている」までである。

**Humanが判定してほしい軸**（これがGateの中身）:

1. **C-1〜C-5のうち、0秒で「何こいつ、かわいい。触ってみたい」と思うのはどれか。** 1つでも複数でも、全部違うでも良い。
2. **L-1〜L-8のうち、実際に触りたい／触り続けたいのはどれか。**
3. **Briefに書かれていない、Humanが「これは絶対に外せない」と思っているもの**があれば。

---

## 9. STOP — Human Taste Gate

**ここで停止する。** 実装・prototype・variant生成・Round 2は開始していない。`echo-v1.html` にも一切触れていない。

次に進むのは、**Humanがキャラクター方向性とCore Experienceを選んだ後**である（`EXPERIENCE_BRIEF.md` §6-4 / D-015）。
