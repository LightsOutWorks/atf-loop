# ECHO — Autonomous Creation & Evolution Loop v0 / Round 1

2026-08-14。Human Desire起点のゼロ生成から、1回の自律進化・淘汰までを Human の追加介入なしで完走した記録。**次のゲーム判断を変える分だけを残す。**

---

## 1. Human Desire

プレイヤーがAI相棒を育てる。接し方でAIの性格・言葉・見た目・行動・判断が変わる。AIは過去のplayer choiceを記憶し、後の場面で自然に返す。**最後はplayerが結末を直接選ばない**——育ったAI自身が、形成された人格に基づいて最終判断を行う。

核心は「AIを強くするゲーム」ではなく **「自分の接し方がAIという鏡になって返ってくるゲーム」**。
Hook仮説: **「あなたが育てたAIが、最後にあなたの命令に従うか拒否するかを自分で決める」**（固定仕様ではない）。

## 2. World Priorから採用したMechanism

問い: 短時間のbrowser game / AI companion / virtual pet / 育成・選択ゲームで、人が早く理解し、愛着を持ち、最後まで遊び、replay・shareしたくなるMechanismは何か。
取得: Steam公式API（review score / review総数 / **レビュー投稿者のplaytime** / verbatim）。成功例と失敗・低成果例の両方。

| 採用 | Mechanism | 根拠（Observed） |
|---|---|---|
| M1 | **Visible Mirror** — 選択の直後に見た目が変わり、終盤で過去の選択が引用される | Undertale 97% / 188,826 reviews、Slay the Princess 97% / 24,951、Detroit 95% / 66,831 が「選択が後で返る」で収束。verbatim「at the end it makes you reflect on every single choice you've made」 |
| M2 | **Named Ending** — 結末に名前を付ける | The Stanley Parable（92% / 32,196）で複数レビューが同じ結末を**同じ名前**で語る: "the Broom Closet Ending. OH. MY. GOD." / "The broom closet ending was my favorite." 名前のついた瞬間が人づてに再生される |
| M3 | **Legible Replay Hint** — 終了時に「取らなかった道」を1つだけ示す | Slay the Princess の最大の不満が探索の手掛かり不足: "the game does nothing to help you explore it. You'll need a guide open for every play through after the first, which dulls the joy of discovery" |

**採用しなかったもの（失敗Evidence由来）**

- **自由入力のテキストパーサ** — Event[0] は本セット最低の 79%。"The text parser is fairly stupid, and only works off fairly limited keywords... 'Open d10, thanks' ... maxes your rep with the AI easily" / "I don't feel particularly attached to Kaizen"。**対話がキーワード当てに退化すると愛着が壊れる。**
- **「賢いAI」訴求** — Gaming Copilot: AI Companion 75%（n=20）"Good idea, not ready"。賢さで売ると期待外れで死ぬ。
- **長期育成の反復** — Nanomon Virtual Pet の否定側 "simply too repetitive... eventually die and start all over again"。
- **決定的な失敗Evidence**: Emily is Away（87% / 22,833 / median playtime **55分**）"the choices are an illusion" / "I complete the game twice and both end is practically the same thing"。**短くても刺さるが、選択が見せかけだと即座に見抜かれる。**

**Confounders（隠さない）**: Undertale / DDLC / Detroit / Stanley Parable は brand・話題性・IP・年代の交絡が極めて大きく、review数は marketing の関数でもある。「この機構だから売れた」とは言えない。median playtime は**レビュー投稿者**の偏りを含む `Derived`。Emily is Away の55分は2000年代MSNへの nostalgia という強い交絡があり、ECHOにその資産は無い。**無料ブラウザ市場のretentionはSteamからは取れず `UNKNOWN`。**

## 3. Baseline

- artifact: `experiments/echo/echo-v0.html`
- sha256: `f144b4130f1cecef6b1ca58f0bf5ea854a3b518de721990a22a9bfde38e50b59`
- commit: `75de818`
- 技術（REUSE-before-BUILD）: 単一HTML + Canvas + vanilla JS。framework / bundler / server は導入せず、**ブラウザ実行環境そのものをREUSE**。file:// で直接開け、mobile viewportで動く。
- 構成: 7場面 / 3軸の人格（warmth・autonomy・honesty、数値はUIに出さず目の色・瞳孔・虹彩で表現）/ 中盤でECHOが過去の選択を引用 / 最終場面でplayerは**命令**を出すが結末は選べない / 名前つき結末4種 + 取らなかった道。

## 4. Observed weakness（実プレイでの観測）

AI Player（`play.cjs`、実ブラウザ・mobile viewport・3つの接し方 × 3つの最終命令 = 9回）で計測。

**Build健全性・操作性に問題は無かった**（runtime error 0 / 全9回でending到達 / replay動作 / 横スクロール0px / タップ対象44px未満0 / 最初の選択に対する可視反応あり）。

**核心の欠陥は Intent Alignment に出た。**

> **9回すべてで、最終命令を変えても結末も文面も1文字も変わらなかった**（`commandChangesEnding: false` / `commandChangesEndingText: false`）。`decide()` が `S.cmd` を一度も参照していなかった。

つまり **Hookそのもの（「命令に従うか拒否するかをAIが決める」）が見せかけ**だった。これは World Prior の最も強い失敗Evidence（Emily is Away「選択が見せかけだと二周目で見抜かれる」）が指す場所と完全に一致する。

**補足（過大評価しないための実測）**: 全経路探索（1,458経路）ではbaselineでも **29%** の経路で命令により結末が変わる。ただしそれは `decide()` が命令を見ているからではなく「自分で決めろ」選択肢自体の数値効果による偶発差であり、**一貫した接し方をするプレイヤーが実際に到達する9経路では0%**。**遊び方が一貫しているほど、命令が効かない。**

## 5. 改善仮説（1つだけ）

> **ECHOの最終判断が「その命令」への応答になっていない。命令ごとに、同じ人格でも返し方が変われば、最大の失敗モード（選択が見せかけ）を回避でき、Hookが実際に成立する。**

## 6. Tested variations（5本。差分は `decide()` 周辺に限定）

| | 変えたこと |
|---|---|
| v1 command-matrix | `decide()` が命令ごとに分岐。専用結末 `THE EMPTY`（一度も決めさせなかった相手に「自分で決めろ」と命じた時だけ出る）を追加 |
| v2 quote-command | 結末冒頭でプレイヤーの命令をそのまま引用し、応答として読ませる |
| v3 cost-of-command | 結末に「その命令が何を奪ったか」を1行足す |
| v4 pushback | 命令後にECHOが問い返し、押し通す／撤回するが最後の1票になる |
| v5 coherence | 命令が育てた自律度と噛み合っているかで決まる（鏡の直接実装） |

## 7. Machine result

3層評価。**「売れる」「面白い」「WTPがある」は判定していない。**

- **A. Build Health**: 全6ビルドで runtime error 0 / ending到達 / replay動作。**regressionなし。**
- **B. Interactive Usability**: 全6で横スクロール0px・タップ対象44px未満0・初回選択で可視反応あり。**6ビルド間に差なし**（SCENES / CSS / canvas / 記憶引用は同一で、差分は `decide()` 周辺のみ）。
- **C. Intent Alignment**（命令感度。1,458経路の全探索 + 9回の実プレイ）:

| build | 全経路で命令が結末を変える | 一貫した9経路で | 結末の種類 |
|---|---|---|---|
| echo-v0 (baseline) | 29% | **0 / 3人格** | 4 |
| **v1 command-matrix** | **70%** | **1 / 3人格** | **5**（+THE EMPTY） |
| v2 quote-command | 29%（文面は3/3で変化） | 0 / 3 | 4 |
| v3 cost-of-command | 29%（文面は3/3で変化） | 0 / 3 | 4 |
| v4 pushback | `UNKNOWN`（下記） | 1 / 3人格 | 4 |
| v5 coherence | 48% | 0 / 3 | 4 |

**独立Evaluator（別context・別model・盲検）の順位**: v1 > v5 > v3 > v4 > v2 > **baseline（REJECT）**。理由は「命令が結末カテゴリを最も広く左右し、命令と人格の不一致だけに出現する専用結末まで実装している」。Evaluatorは独自に1,458経路を探索し、**その数値は私の再測定と一致した**（v1 70% / baseline 29% / v5 48%）。

## 8. Winner

> **champion更新: `experiments/echo/echo-v1.html`（v1 command-matrix 由来）**
> sha256 `00dfbf853effe0b5b26bc7fea0db26f2a5705ad2ee4d57c2a7bffe4f3531e52e`
> baseline `echo-v0.html` は Historical として保持（削除しない）。

採用理由: 事前に決めた1つの指標（命令が結末を変えるか）で baseline を明確に上回り（70% vs 29%、一貫プレイでも 1/3 vs 0/3）、**Build健全性・操作性のregressionが無い**。独立Evaluatorも同じ結論に独立到達した。

**v5（48%）は理論的にはもっとも「鏡」に忠実だが、蓄積された人格の絶対値（|autonomy| ≈ 10）に対して命令ごとの期待値差（±4）が小さすぎ、一貫プレイでは一度も発現しなかった。** 機構が悪いのではなくスケールが噛み合っていない。次ラウンドの候補として残す。

## 9. Learning（次のゲーム判断を変える分だけ）

1. **「選択が結末に効いているか」は、設計を読んでも分からない。実際に軸を振って遊ばないと分からない。** baselineは設計上は「AIが自分で決める」だったが、実測すると命令は完全に無視されていた。
2. **一貫した遊び方をするプレイヤーほど、分岐が効かない領域に入りやすい。** 全経路では29%効いていたものが、まともな遊び方3種では0%だった。**平均で測ると欠陥が見えない。**
3. **評価器は、検証したい軸を独立に振れないと何も見えない。** 最初のAI Playerは人格だけを振って命令を振っておらず、6ビルド全部が「同じ」に見えていた。計器を直して初めて差が出た。
4. **生成側の失敗は静かに起きる。** variant 5本のうち **2本（v3・v4）は置換が適用されず、実質baselineのまま計測されていた**。個別の置換ごとに検証を入れるまで気づけなかった。**「差分を作った」と「差分が入った」は別。**
5. **World Priorの失敗Evidenceが、実際に欠陥の在り処を当てた。** Emily is Away の「選択が見せかけ」は、baselineの最大の欠陥と同じ場所を指していた。成功例だけを見ていたら、この弱点は探しにいけなかった。

## 10. Direct Human RealityではまだUNKNOWNなこと

- **人間がECHOを面白いと感じるか。** Machine Evaluationは「壊れていないか」「意図した機構が動いているか」しか答えていない（`DESIRES.md` §5 / D-013）。
- **外部ユーザーが1人でも触ったか。** 現時点で0。Reality Funnel 段1〜4はこのゲームについて全て `UNKNOWN`。
- **継続利用・replay が実際に起きるか。** `THE EMPTY` が人を二周目へ動かすかは未観測。
- **WTP・価格質問・支払い。** 全て `UNKNOWN`。E-014 §6 の解除triggerは発火していない。
- **無料ブラウザ市場のretention。** World PriorはSteam（有料PC市場）由来で、この市場の行動Signalは取得していない。
- **実機のタッチ操作感。** Playwrightのクリック模擬のみで、実デバイスは未検証。

**World Prior も Machine Evaluation も、これらの `UNKNOWN` を埋めない**（D-013）。
