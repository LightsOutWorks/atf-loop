# 英語記事 TETHER LOCK — DRAFT

> ⚠️ **公開凍結中**（`direction/WRITING_SYSTEM_EN_2026-08.md` §9 EN_GATE）。使用しないこと。

---

## 記事本文（英語）

**Title:** `TETHER LOCK passed 6 tests and locked 0`
(39 English characters, 8 words, sentence case + product name, number at word 4, symbols 0)

---

**TL;DR**

On 2026-08-02 I played a game my own pipeline had published. It ran 66 drifters and locked 0. 6 automated checks had passed it.

---

On 2026-08-02 I opened seed-009 TETHER LOCK, a browser game that my pipeline generated, tested and published with no human in the loop. I played it until I gave up. I didn't count the runs. Every one of them ended on the same screen:

```
SIGNAL LOST / 0 pt / LOCKED 0 / LOST 66 / RELEASED 0
```

Source and the day's notes: [REPO URL]

66 drifters had spawned and expired, so the loop itself was alive. LOCKED and RELEASED are 2 separate counters, and both sat at 0. My first read was that I hadn't understood the controls. That read is the part I want in the record, because it almost closed the case (I had the end screen in front of me and filed it under my own lack of skill).

Did I file earlier builds the same way? I have 0 data on that. Score 0 is a symptom, and skill, difficulty, UI and a dead input path all produce it.

### Both call sites for beginHold() sit behind a guard

`beginHold(t)` is the function that sets `holding = true`. It has 2 call sites, and neither one is reachable from a mouse or a finger.

Call site 1 sits inside `handleAim()`, behind `if (!holding) { engagedId = ...; return; }`. When nothing is held, the function returns before it gets to the call. It can move an existing hold to another target. It can't create one.

Call site 2 is `confirmDown()`, which the code calls from `keydown` on Space and Enter. A physical keyboard was the only way in. Mouse and touch both arrive through Pointer Events, and both dead-end at the guard above.

`cancelHold()` opens with `if (!holding) return`, so every release was a silent no-op and RELEASED stayed at 0. LOST kept climbing because the expiry timer runs on its own clock, with no input. That gives the exact shape on the end screen (motion everywhere, 0 on both counters the player drives).

None of this is touch-specific or iOS-specific. seed-009 has no `touchstart` or `touchmove` handler, it uses Pointer Events throughout, and it has no `pointerType` branch. The `passive`, `preventDefault` and `touch-action` settings all read as normal to me. The code was correct and unreachable.

### 6 structure checks and 1 content gate passed the same build

2 verification steps ran before publication, and this build passed both.

| Step | What it looked at | Result |
|---|---|---|
| `smoke.mjs`, 6 items | files, syntax, load, state transitions | 6/6 PASS |
| content gate | subject matter and wording | PASS |
| `eval-min` | static depth score | read the unreachable path as implemented depth |
| (did not exist) | whether the advertised input produces the advertised result | - |

A hold is the game's one real input, and `beginHold()` is the only door into it. No step in the pipeline ever tried a hold. Each step covered the axis its author had in mind, and the accident came from an axis that no step had (I own all 3 steps).

### The check I added has detected 0 defects in 4 runs

I put the change on the verification side (PR #14). Generated builds now declare an interaction contract: `primary_input`, `success_condition`, and a predicate exposed at runtime as `window.__GAME__.checkSuccess()`. Each contract comes from what the title screen promises the player, so the UI decides it and the build doesn't get to.

One Playwright script drives the declared input with real pointer events and then calls the predicate. It runs right after `smoke.mjs` and before the content gate, because a build nobody can play has no business reaching a content review. A missing contract, a broken contract or a missing predicate all stop the run. And the step has no skip branch.

The predicate has to judge from state the player can see on screen. A predicate that only reads a flag set by an input handler doesn't count. That rule comes straight out of seed-009, where the `holding` flag stayed false for every pointer run.

I checked the step against unmodified seed-009 logic, with only a `checkSuccess()` that reads the real `lockedCount` added. 25 seconds of real pointer input, and it failed closed (PR #14). That is evidence the step runs. It is not evidence the step works.

Since then the step has run in 4 runs: #17, #18 and #20 as canaries, and #19 in production. All 4 passed. Detections so far: 0. My prediction (that this check stops seed-009 type defects before publication) has not met a single real defect. How long do I keep a check that has caught nothing?

Run #16 was the first real run of the new step, and it failed for a reason of its own. It stopped after 32 minutes 23 seconds with this:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'playwright'
```

`NODE_PATH` doesn't apply to ESM `import`. I switched to `createRequire(import.meta.url)` and pinned `playwright@1.62.1`, and run #17 came back green in 11 minutes 21 seconds. So adding a check added a surface that breaks on its own, and 18 minutes 55 seconds of run #16 went into repair loops over an error no generator had the rights to fix.

### seed-009 is still published and still broken

I didn't fix the game. Fixing it would delete the only build where this gap did real damage, and the change I owed was on the verification side. seed-009 stays in the published list as the first verification failure this pipeline has produced.

I gave up having a catalog that works end to end. This is a 1-person setup that ships 1 game a week and has brought in JPY 0, so a broken build in the list costs me nothing I can measure.

That check applies only to builds that leave the pipeline after PR #14. I ran it on 0 of the games published before that. So the published list still holds at least 1 game a mouse can't play.

I still don't know how to find the next missing axis before it ships. This one sat in the game's one real input, and I read past it for 3 verification steps and 1 publish. What does a machine read, when the thing under test writes its own promise? 4 passing runs give me 0 evidence either way.

n=1 here: 1 pipeline, 1 person, 6 runs of a weekly job, and I haven't tested any of it on a second machine or a team. What still stands is the number itself, and it's mine to look at every week. So the rule I run on now is 1 line. A check that keeps detecting 0 goes back on the table for removal, on the same terms as everything else in the pipeline.

**Measured**: 2026-08-02 JST. Runs #16 to #21 of one weekly pipeline, 1 machine, 1 person, 1 game a week. `playwright` pinned at 1.62.1. Interaction check detections to date: 0. Confirmed revenue: JPY 0.

## X投稿3本（英語）

**1本目**（232 chars / 43 words / 4 sents / 改行3）
```
On 2026-08-02 I played a game my pipeline had published.
Final screen: LOCKED 0, LOST 66, RELEASED 0.
6 structure checks and 1 content gate had passed it.
No check ever asked whether the advertised input works, as far as I can tell.
```

**2本目**（222 chars / 40 words / 4 sents / 改行3）
```
On 2026-08-02 I added 1 check that drives real pointer input.
It has run in 4 runs since and detected 0 defects.
Canaries passing proves the check runs.
Whether it catches a real defect is untested (n=1, my pipeline only).
```

**3本目**（221 chars / 43 words / 4 sents / 改行2）
```
My new interaction check has run on 0 of the games published before 2026-08-02.
1 of those is seed-009 TETHER LOCK. A mouse can't start a hold in it.
It is still up, and deleting it would delete my only evidence, I think.
```

## 適用した規則

**公開ゲート12項目（機械計測。スクリプト: `/tmp/claude-0/-home-user-atf-loop/9800231e-5758-51dc-b2f7-0fa56b84ee97/scratchpad/gate.py`）**

| # | 検査 | 条件 | 実測 |
|---|---|---|---|
| 1 | アラビア数字 | 100語1個以上 | 6.40 / 100語 |
| 2 | 具体語（日付・数値・固有名詞・原文引用） | 100語ごと2個以上 | 全10区間で5〜31、最小5 |
| 3 | E5 / E23 / §7 禁止語 | 0 | 0 |
| 4 | 段落末の評価動詞・未来語 | 0 | 0 |
| 5 | contrastive negation | 0 | 0 |
| 6 | 文頭 But/So/And、形式接続詞 | 400語1回以上 / 0 | 4回（要2.7）/ 形式接続詞0 |
| 7 | 文長 | 40語超1/8以内・50語超0・5文に1つ8語以下 | 40語超0本 / 50語超0本 / 8語以下18本（要14.6） |
| 8 | 丸括弧・em dash | 150語1個以上 / 0 | 括弧18（要7.1）/ em・en dash 0 |
| 9 | `I` | 1000語10回以上・I始まり25%以下 | 22.6回 / 13.7% |
| 10 | 読者への指示 | 1000語1回以下、投稿0 | 0 |
| 11 | 冒頭40語を隠す検査 | 3個以上 | 数字105個 |
| 12 | スペルミス | 100語0個 | 0（語彙371語を目視照合。**別日2回目は未実施**） |

**構造規則（§4）**: タイトル39字・sentence case・記号0・数字が第4語 / TL;DR 3文24語 / 見出しは150〜200語ごと、いずれも実測値入りの文（「passed 6 tests」「detected 0 defects in 4 runs」）/ 段落2〜4文 / 1文段落は2個（連続なし、数字入り）/ 疑問符3個（すべて自分が答えを持っていない問い）/ 末尾は一人称の決定文 / 記事末に測定環境ブロック / 限界（n=1）の直後に「それでも残ること」を1文。

**E系で実際に書き換えた箇所**: `The` 始まり文を20.0%→4.1%へ（「The first/The second」→「Call site 1 / Call site 2」、「The build」→「seed-009」、E1）。`attempt`→削除、`implement`系は名詞用法のみ残置（E17a）。`about/around/many` の丸め語を全削除、試行回数が記録に無い箇所は "I didn't count the runs." と明示（E7の3択(2)）。`never` を事実記述から除去（E14）。em dash を表内で `-` に置換（E6）。伝達動詞の分散を避けるため、タイトル画面の発話を推定で引用せず「the game's one real input」という検証可能な記述に置換（E15）。

**§7（在重力）**: 構文テスト〈I/this＋改善動詞＋you〉に該当する文0。`you` の使用0（事実条件節すら発生しなかった）。ask 0本。役割名詞0。

**§5（非ネイティブ）**: 謝罪・非ネイティブ表明・ネイティブ装い（gonna/y'all/スポーツ比喩）すべて0。自己限定文の主語は成果物側に固定（"That check applies only to builds…" "n=1 here: 1 pipeline, 1 person…"）。単位は JST / JPY を保持し USD へ換算していない。慣用句・句動詞の比喩用法0（初稿にあった "burning the midnight oil" 型と "count on 0 hands" を削除）。

**§6（執筆経路）**: 日本語一次記録から「1行1事実」相当（日付・数値・関数名・エラー文言）だけを抽出し、英語は1文目から英語で構成した。NOTE_DRAFT_001 の日本語散文は1文も訳していない。E18翻訳調検査のヒット0。

**事実の来歴**: 全数値は `JOURNAL.md` Entry 0001 / 0002 / 0003 と `NOTE_DRAFT_001_TETHER_LOCK.md` から取得。`LOCKED 0 / LOST 66 / RELEASED 0`、6/6 PASS、PR #14、run #16〜#21、32分23秒、11分21秒、18分55秒、25秒、playwright 1.62.1、検出0件、既存作への遡及0。**追加・丸め・推定は0。**

**生成物ファイル**: `/tmp/claude-0/-home-user-atf-loop/9800231e-5758-51dc-b2f7-0fa56b84ee97/scratchpad/article.md`、`/tmp/claude-0/-home-user-atf-loop/9800231e-5758-51dc-b2f7-0fa56b84ee97/scratchpad/posts.txt`、`/tmp/claude-0/-home-user-atf-loop/9800231e-5758-51dc-b2f7-0fa56b84ee97/scratchpad/gate.py`

## この書法で解決しないこと

**1. この記事は §0 の題材ゲートを2項目落としている。書けても出せない。**
「試行20回以上」— 該当するのは smoke の6項目と検査4run であり、20回の同一条件試行は存在しない。「生データの公開リポジトリURL」— 本文に `[REPO URL]` のままにしてある。**URLを捏造しないため空欄で残した。**本人が実URLを入れるまでこの記事は §4「記事1本＝公開リポジトリ1つ」を満たさない。

**2. §9 EN_GATE が開いていない。** note=0/10、non_boilerplate_reply=1/3。英語の公開は凍結中で、本成果物は凍結中に許可されている「下書き」に該当する。X英語投稿3本も §4結論2（英語Xアカウントを作らない）に対して §3 の「形だけ確定させておく」枠の産物であり、投稿可能物ではない。

**3. E25の綴り検査は1回しか走っていない。** 規則は「必ず別々の日に2回」。今日の1回目だけが済んでいる。冠詞・前置詞・単複・時制はゲート対象外のまま自動1パス相当で打ち止めており、修正していない。

**4. 検査が保証するのは形であって、正しさではない。** 12項目は「数字が薄い」「抽象語がある」「読者に命令している」を検出する。**事実誤りは1つも検出しない。**上の数値の正しさは、私が一次記録2ファイルと突き合わせた作業だけが担保しており、機械では確認していない。

**5. 「advertised input」という言い回しは一次記録の主張の英訳であって、seed-009 のタイトル画面の実文言ではない。** タイトル画面のverbatimが一次記録に無いため、`The title screen said …` 型の引用は書けなかった。E15（引用符の中身は実発話のみ）を守った結果、記事の中心概念だけが唯一、コピペ証拠を持たない箇所になっている。ここは書法では埋まらない。実物のスクリーンショットか原文が要る。

**6. HNの中央値2〜3点は、この12項目を全部通しても変わらない。** §9(b)のとおり、届くかどうかは発見グラフの問題で、本書の射程外。この記事が想定する最良の結果は「2〜20人が読み、そのうち誰かが `beginHold` の話に自分の同型を見つける」であり、それを増やす手段は本書に無い。