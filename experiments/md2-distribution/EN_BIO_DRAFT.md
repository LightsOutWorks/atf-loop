# 英語 bio / プロフィール — DRAFT

> ⚠️ **公開凍結中**（`direction/WRITING_SYSTEM_EN_2026-08.md` §9 EN_GATE）。使用しないこと。

---

## X bio

```
Tokyo. AI analyzed me and praised me, so I check where it flattered me. Prompts are in the posts. Nothing to pay. AI agent failure logs are in the same place.
```

158 characters / 31 words / 5 sentences. Tokyo + 3 points, no 4th.

## 長文面プロフィール

```
In August 2026 I asked an AI to analyze me. It praised me. So I gave the same
answers to a second model and asked that one to argue against the first. What
came out was different.

The steps and the prompts I used are in the posts here. Nothing to pay, no
account, no email field. I write in Japanese and English.

If you paste what came out of it, I'll read it. What I send back is short: the
lines your own answers keep repeating, and one number you could count in the
next 7 days. Nothing else follows.

Parts of my own work go to AI agents, and I write down what breaks. Confirmed
revenue from any of it: JPY 0 (as of 2026-08-09). I still don't know which part
of the failures is the model and which part is my own instructions.
```

147 words / 13 sentences. Longest sentence 24 words (>40w: 0, >50w: 0). 5 sentences ≤8 words. Arabic numeral tokens 6. Parentheses 1. `I` 54/1000 words, I-initial 15%, The-initial 8%. One sentence-initial `So`. em/en dash 0, emoji 0, hashtag 0, exclamation 0, we/our 0.

## 適用した規則

- §3 bio: 都市名1語＋3点のみ、4点目を足さない。役割名詞0・形容詞0・`helping X do Y` 0・実績数字0（`JPY 0` のみ可）。
- §7 構文テスト:〈I/this〉＋改善動詞＋〈you〉の文は0。`empower / unlock / guide you / help you / your journey / best practices` 全て0ヒット。
- §7 読者への指示: 命令形0、`you should / make sure / don't forget` 0。bio・profileともに0回（1000語1回の上限ではなく0を適用）。`you` は事実条件節（`If you paste…`）と手順の総称（`one number you could count`）にのみ使用。
- E22: `a list of facts` / `a date to check` を出力しない（下記§差分1）。
- E5 / E23 / E12 / E7 / E8 / E18 の禁止語リストを機械検索、ヒット0（`delve / underscore / serves as / remains a / not only…but also / about / roughly / recently / there is / in order to / various` 等）。
- E2: 標準20語、40語超0本、50語超0本、5文につき8語以下1本以上。
- E24: アラビア数字を100語1個以上、うち最低1つを自分に不利な数値（`JPY 0`）に。数字は丸めない（`7 days`）。
- E6: em dash 0 / 絵文字0 / ハッシュタグ0 / 感嘆符0、丸括弧を150語に1個。
- E16(b) 短縮形を既定（`don't` / `I'll`）。E17: `utilize / implement / facilitate` 系0、イディオム・句動詞の比喩用法0。
- §4 末尾: 要約で閉じず、名詞で限定した未解決点1文で終える。§7 道具の説明は2文（何をするか／何をしないか）。

## 日本語版との意図的な差分と、その理由

**1. 「返すのは事実の並びと、確かめる日付です」を英訳していない。** これは E22 が `a list of facts` / `a date to check` として名指しで禁止している文字列そのものである。さらにリポジトリの `experiments/md2-distribution/PROFILE_COPY_LIVING_GROUND.md` §3.0 訂正履歴によれば、この1文は2026-08-10にヒロ指摘で**削除済み**であり、C22 新設の原因になった実失敗である。**タスクに提示された確定文は、リポジトリ上の現行確定文より古い版**（現行版は5文で、この1文を含まない）。英語では削除ではなく、読者が絵にできる語へ置換した:「the lines your own answers keep repeating, and one number you could count in the next 7 days」。何が届くかを想像できる語だけで書き、内部用語の英訳（`primary record` / `Direction Card` 等）も使っていない。

**2. 「料金は取りません」を `I don't charge` と訳していない。** 同ファイル §2.0 の訂正どおり、徴収する側の言い方は主語なしで置くとこちらが上に残る。読者側から見た費用の事実に変えた:「Nothing to pay, no account, no email field」。§4 の「無料提供物の前に壁を置かない（入力フィールド0個）」を同じ1文で満たしている。

**3. 「書いたものを送ってもらえれば読みます」を X bio に入れていない。** bio に入れると 3点限定を破る4点目になる。§3 と C22 の実失敗記録は、まさにこの4点目追加が「売り込みの衝動が規則違反として漏れた」形だと特定している。長文面にだけ置いた。

**4. 冒頭を「自己分析／AI運用／自動化の失敗を記録しています」型の領域列挙にしていない。** 英語で普通名詞を並べた自己紹介は役割説明（§7 の禁止対象）に読める。E13 に従い、出来事から始め、第1文に日付と数字を入れた。

**5. 「全部記事の中にあります」は、公開時点でのみ真になる。** 英語記事は現在0本で、§9 により英語公開自体が凍結中（EN_GATE: note=0/10, non_boilerplate_reply=1/3）。本稿は凍結解除後に貼る下書きであり、記事が1本も無い状態で貼ると事実に反する。貼付の前提条件として明示しておく。

**6. §4 題材の分離との衝突（要判断）。** 日本語版は自己分析とAI運用失敗を1つのプロフィールに束ねているが、英語版 §4 は技術記録の英語ドメイン（HN経路）に自己分析の記事を1本も置くなと定めている。上の長文面プロフィールは**自己分析側の面のもの**である。HN側の自前ドメインに貼るなら、第4段落だけを使う:「Parts of my own work go to AI agents, and I write down what breaks. Confirmed revenue from any of it: JPY 0 (as of 2026-08-09).」1つの英語プロフィールで両方を兼ねることはできない。

**7. 日本語版に無いものを2つ足した。** (a)「I write in Japanese and English.」— §5 が bio に事実として1回だけ許す形。謝罪にせず、冒頭・末尾に置かず、効果のある施策としても扱っていない。(b)「Confirmed revenue from any of it: JPY 0」— E24 が要求する「最低1つは自分に不利な数値」であり、同時に読みますという申し出が有償導線に読まれるのを防ぐ。出所は `CURRENT_STATE.md` §5（Confirmed terminal revenue = JPY 0）。フォロワー数3は実績数字なので書いていない。

**8. 表記の固定。** bio と長文面で `AI agents` / `prompts` / `posts` を一字一句そろえた。`AI automation` `AI tools` へ揺らしていない。