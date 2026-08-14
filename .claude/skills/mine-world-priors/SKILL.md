---
name: mine-world-priors
description: "人間へFeedbackを取りに行く前に、Internet上で既に発生している外部Realityから『何が人間に選ばれ・使われ・繰り返され・評価され・購入されているか』をAI自身が観測し、次に試す仮説を絞るSkill。発火する問い: 「人が何を欲しがるか」「何が面白いか」「何が売れるか」「どのMechanismがRealityで支持されているか」「次に何を試すべきか」——ただし実測された具体問題があり、既存のWorld Evidenceで仮説空間を狭められる場合だけ。好奇心だけの市場調査には使わない。取得するのは World Prior（他者の商品・作品・行動についての外部Evidence）であり、Factory自身のExperiment PASS・判定・trigger発火・participant数・収益へ混入させない——それは Direct World Signal だけが持つ。read-onlyでon-demand。常駐crawler・scheduler・DB・corpusは作らない。"
---

# Mine World Priors

**人間を低帯域な情報収集器として使うのをやめる。** ネット上に既に大量に存在する外部Realityを先に読み、Humanには Desire / Taste / Boundary / Direction と、本当に必要なDirect Reality Contactだけを残す。

これは `DESIRES.md` MD-3 が既に持つ「**Human-as-message-bus / AIができる情報収集**の削減」の実装であって、新しいMajor Desireではない。

---

## 0. 最重要の分離 — World Prior ≠ Direct World Signal

| | 定義 | 使ってよい所 | 使ってはならない所 |
|---|---|---|---|
| **World Prior** | 他者の商品・作品・行動についてInternet上で観測された外部Evidence | **仮説の絞り込み**（次に何を作る / 試すか） | Experiment の PASS / FAIL / 判定点 / trigger発火 / participant数 / Funnel各段 / 収益 |
| **Direct World Signal** | Factory自身がRealityへ出したものに対して発生した利用・継続利用・request・価格質問・支払い | **Experiment判定のすべて** | — |

**この境界を越えない。** 例: SteamでAI companion gameが大量に売れていても、**E-014 §6 の「納品対象外の第三者から自分にも作ってほしい」triggerが発火したことにはならない。**

World Priorは「**次に何を作る / 試すか**」を強化するだけ。Factory自身が本当に価値を作れたかを判定するのは Direct Reality だけである（`DESIRES.md` §5 / `CONSTRAINTS.md` §6）。

---

## 1. 発火するか / しないか

**発火する**: 実測された具体問題または実在のDesireがあり、**既存のWorld Evidenceで仮説空間を狭められる**時。

**発火しない**: 好奇心だけの市場調査（「面白そうだから調べる」）。問題が無ければ `NO_ACTION`（`OS.md` HI-10）。**「将来役立つ」は実行理由にならない。**

着手前に1文で言えること: **何を知れば次のActionが変わるか。** 言えないなら調べない。

---

## 2. 手順

```
Observed Problem / Desire
→ 何を知れば次Actionが変わるか（1文）
→ その問いに最も近い公開World Signalを特定
→ 一次情報・公式API・公開行動データを優先して取得
→ 成功例だけでなく失敗 / 低成果例も比較
→ 交絡要因を明示
→ 繰り返し支持されているものを抽出
→ transferable mechanism 仮説
→ Factoryの次Action を1案
```

### 単一指標を万能Scoreにしない

売上・人気には **marketing / brand / IP / distribution / price / タイミング** の交絡がある。**Internet evidenceだけで「売れる」「面白い」「需要がある」と断定しない。** 複数種類のSignalを triangulate する。

ゲームの場合の例（必要に応じて組み合わせる。全部を毎回見ない）:

- 購入 / Sales Rank
- 実利用 / player activity
- 継続性 / longevity
- review score / **review text**
- YouTube / Twitch等の attention
- comments内の**具体的な理由**

**「売れたものの共通点」ではなく、行動Signalとverbatimから繰り返し現れるMechanism**を抽出する。共通点の列挙は交絡をそのまま持ち込む。

### 等級を落とさない

`OS.md` HI-4 F5 のとおり **Observed（取得した値そのもの）と Derived（率・中央値・推計）を分ける**。確認できないものは `UNKNOWN`。二次情報（まとめ記事・要約）を一次情報として扱わない（HI-4 F9）。**verbatim は原文のまま引く。**

---

## 3. 到達性（2026-08-14 一次実測。**これはtooling制約であって「データが存在しない」ではない**）

| 到達 | 対象 |
|---|---|
| **可（200）** | `arxiv.org` / `*.wikipedia.org` / `note.com` / `reddit.com` |
| **不可（CONNECT tunnel 403 = proxy allowlist拒否）** | `store.steampowered.com` / `api.steampowered.com` / `steamspy.com` / `steamdb.info` / `youtube.com` / `itch.io` / `apps.apple.com` / `play.google.com` |

**したがって現状では、購入・Sales Rank・player activity・review score・動画attention は harness から直接取得できない。** 取れるのは主に **verbatim と論文・辞書的記述**であり、**行動Signalが欠けた状態で「売れる」を推論しない**（それは §2 の禁止に当たる）。

**許可ドメインの変更はHuman Gate**（`CONSTRAINTS.md` §4）。**自分で設定を変えない。** 不足する場合は、不足しているSignal種別を明示してHumanへ返す（Humanがドメインを開けるか、該当ページを渡すか、その問いを落とすかを決める）。

**有料API（xAI等）の使用は支出であり Human Gate。** 無料・公開経路で足りるかを先に確認する。

---

## 4. 出力

**大きなResearch reportを作らない。** 原則この形まで。

```
Question:
Observed World Evidence:
- <source / 取得日 / Observed値 or verbatim>
What appears to work:
What appears not to work:
Confounders / Unknown:
Transferable Hypothesis:
Next Action:
```

**「失敗 / 低成果例」を空にしない。** 成功例だけを並べた出力は生存バイアスであり、この形式を満たしていない。

**調査結果をrepoへ蓄積しない。** 次の判断を実際に変えた分だけを、該当する既存の場所（実験台帳 / D-record / `research/INDEX.md`）へHumanの判断後に残す。**新しいcorpus・DB・索引を作らない**（D-010 Decision 2: 蓄積するのはログ量ではなく、次の意思決定を変えるRealityだけ）。

---

## 5. 他Skillとの境界（混ぜない）

| Skill | 何を探すか |
|---|---|
| `reuse-before-build` | **解法・Capability・Prior Art**（既にある実装・仕組み） |
| **`mine-world-priors`（本Skill）** | **人間の需要・行動・Taste** について、既に世界で発生した結果 |
| `record-world-signal` | **Factory自身に返ってきた Direct World Signal** の台帳転記 |

---

## 6. 禁止事項

- **World Prior を Experiment の PASS / 判定点 / trigger発火 / participant数 / Funnel各段 / 収益へ混入させること**（§0）
- 実測された問題が無いのに調査を始めること（好奇心駆動）
- Internet evidence だけで「売れる」「面白い」「需要がある」と断定すること
- 単一指標を万能Scoreにすること / 「N件一致で採用」のような固定判定規則を作ること
- 成功例だけを見て失敗・低成果例を比較しないこと
- 二次情報を一次情報として扱うこと / 推測で `UNKNOWN` を埋めること
- **調査結果だけで既存の作品・契約・Experimentを自動変更すること**（最小Transfer案をHumanへ返して停止する）
- 常駐crawler / scheduler / DB / schema / dashboard / permanent corpus / 専用agent を作ること
- 許可ドメイン・認証・proxy設定を自分で変更すること
- 有料APIをHuman承認なしに使うこと

---

## 7. 最初のCalibration Case（Human指定・未実行）

**問い**: 人がAI / デジタル相棒を育てる体験で、**何を面白い・愛着が湧く・続けたい**と感じているか。

**用途**: 制作中のAI相棒ゲーム `ECHO` の次revision候補。**調査結果だけでECHOを自動変更しない。まずHumanへ最小Transfer案を返す。**

**現在の制約**: §3のとおり、Steam・動画・ストアの行動Signalは harness から取得不可。**verbatim中心（`reddit.com` 等）＋論文で組める範囲**にとどまり、購入・継続の行動Signalは欠ける。実行前に、その欠損を許容して verbatim だけで始めるか、許可ドメインを開けるか（Human Gate）をHumanが決める。
