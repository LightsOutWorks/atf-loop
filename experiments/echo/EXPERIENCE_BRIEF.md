# ECHO — Human Experience Brief（再設計の正本）

2026-08-15。**Human裁定によりHumanが直接与えた仕様である。** ECHOの再設計は、World Priorでも Machine Evaluation でもなく**この文書**を起点とする。本文書と過去の実装・過去のLEARNING・World Priorが矛盾したら、**本文書が勝つ**。

**AIは本文書を要約・最適化・拡張しない。** 不足があれば `UNKNOWN` として提示し、Humanへ返す。

---

## 0. なぜこの文書が存在するか

Round 1のchampion `echo-v1.html` は、Machine Evaluationの全項目（Build健全性 / 操作性 / 意図したMechanicの発現）を通過したうえで、**Human Taste Gateで REJECT された**。判定と反証の記録は `LEARNING.md` §11。

> **Technical Prototypeとしては成功。GameとしてはREJECT。**

つまり反証されたのは実装ではなく、**「機械が全部通れば、それは遊べるゲームである」という評価基準そのもの**である（`OS.md` §12 No Teacher）。本文書は、その評価基準を置き換えるためにHumanが与えたTasteの記述である。

---

## 1. Human verbatim / 実測されたReality（FACT）

Round 1 championを、Human本人が初見・説明なしで実際に遊んだ結果。**この節は解釈せずそのまま保存する。**

> **「びっくりするほどつまらなかった」**

指摘された欠陥（Human verbatim）:

- 選択肢が極端で自由度がない
- ほぼすべてテキストベース
- キャラクターにほとんど動きがない
- 音がない
- 選択肢を選んで最後にテキストを見るだけ
- 育ててもキャラクター自体が大きく変化している感じがない
- キャラクターがかわいくなく、愛着が湧かない

そしてHumanが与えた必須条件:

> **「育成ゲームでは、育てる対象そのものを好きになれることが必須条件」**

---

## 2. 役割分担（Human裁定。本Experimentの前提）

| 誰が | 何を持つ |
|---|---|
| **Human** | **Desire + Taste** |
| **AI（Factory）** | Search + Design候補 + Build + Test + Variation |
| **Real Players** | Reality |

**Machine Evaluationが判定してよいのは次の4つまで**である。

1. 壊れていない
2. 操作できる
3. 意図したMechanicが存在する
4. variant差分が実際に入っている

**「面白い」「かわいい」「愛着が湧く」「これで良い」は、この4つに含まれない。**

---

## 3. Experience Brief

### 3-1. 最初に感じてほしいこと

> **「何こいつ、かわいい。触ってみたい」**

### 3-2. 最初の10秒

- ECHOが**勝手に動いている**
- 触る・撫でる・つつく・ドラッグに**即反応**する
- 入力に対して **animation + expression + sound** が返る

### 3-3. Core Experience

- **直接触れ合う**こと
- **3択の文章を延々選ぶ形式は禁止**

### 3-4. 育っている感覚

- **数字を見せない**
- **行動から気付く**

### 3-5. 自由度

- **極端な善悪二択にしない**
- **性格診断の質問票にしない**

### 3-6. Surprise

- 勝手に何かを見つける / いたずらをする / 甘える 等
- 目的は **「こいつ生きてるな」** と思わせること

### 3-7. 音

- **無音は禁止**
- **feedback soundは必須**

### 3-8. 最後

- **十分に関わった後に**、お願いをする
- 問いは **「こいつならどうする？」**

---

## 4. Player SHOULD FEEL

| いつ | 何を |
|---|---|
| **0秒** | **「何これ、かわいい」** |
| 途中 | 触れている / 応えられている / 勝手に生きている |
| **Ending** | **「うわ、俺がこう育てた結果だ」** |

## 5. Player SHOULD NOT FEEL

- 文章を読んでいるだけ
- 性格診断を受けている
- 正解を当てさせられている
- 分岐ノベルを読んでいる
- 数字を育てている
- **何をしても同じ**
- **キャラに興味が持てない**
- **AIだからすごいと言われているだけ**

---

## 6. 手順の拘束（Human裁定）

1. **いきなり実装しない。**
2. まずこのBriefから、**キャラクター自体の方向性を5案程度**と、**Core Interaction / Core Loop候補を5〜10案**、World Priorを使って探索する。
3. **AIだけで1案へ確定しない。**
4. **キャラクター案とCore Experience案を出したところで停止し、Human Taste Gateへ出す。**

**やらないこと**: `echo-v1.html` の小手先のRound 2 patch / v1のDistribution（CrazyGames等）/ dashboard / Platform / analytics / scheduler。

探索の出力は `REDESIGN_CANDIDATES.md`。
