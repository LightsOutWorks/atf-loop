# Daily Encounter Queue — Reality Contact Ledger

Experiment: **E-013**（`experiments/INDEX.md`）/ MD-2 Distribution → MD-1 Economic Engine
制定: 2026-08-09（Day 1実行後）

目的: Batch 1（E-006）で**恒久喪失した join key**——cluster / 送信文面 / freshness_at_send——を、今回は**送信時点で確定させて記録する**。`CURRENT_STATE.md` §7 の Structural Bottleneck（World Signalを正しいContact / Needへ帰属させる経路の弱さ）に対する直接の修復。

> Batch 1では送信20件のうち大半の文面・clusterが回収不能となり、返信が来ても何が効いたか判定できない状態になった。**同じ失敗を繰り返さないことが本台帳の唯一の存在理由である。**

## 運用規則

1. **追記のみ。**送信済み記録を事後的に書き換えない（訂正は訂正として残す）
2. 確認できない値は `UNKNOWN`。推測で埋めない
3. 分母は **REACHABLE確認済み接触**（VOIDは分母外）
4. **事前登録（pre-registration）**: 送信前に付いた懸念は、返信が来る前に台帳へ記録する。返信後に「この件は元々弱かった」と後付けしない
5. 送信・返信はすべて Human Gate（自動送信なし）
6. Query Yield等の細粒度データは実行セッションのprivate stateに留める。**本台帳が持つのは funnel事実と join key のみ**

## Funnel Totals

| Day | SENT | REACHABLE | REPLY_WAIT | REPLY | GENUINE_PAIN |
|---|---|---|---|---|---|
| Day 1（2026-08-09） | **4** | `UNKNOWN` | 4 | **0** | 0 |
| Day 2（2026-08-10 予定） | — | — | — | — | — |
| Day 3（2026-08-11 予定） | — | — | — | — | — |

**累積 Reality Contact（E-006 + E-013）= SENT 24 / REPLY 0**（2026-08-09 22:45 JST時点）

REACHABLE は `UNKNOWN`。X上の公開replyであるため到達している蓋然性は高いが、**harnessからX読取ができない**（E-008）ため独立検証不能。Humanが表示確認を報告した時点で更新する。

---

## Day 1 — 2026-08-09

配達4件 / 送信4件（**全件送信 — Human-confirmed 2026-08-09**）。送信時刻は 18:30〜22:45 JST の間（exact timestamp = `UNKNOWN`）。

品質基準未達の候補で10件枠を埋めていない（GO 4件のみ配達。他3件はKILL: 非first-party 1 / 解決済み 1 / 24h窓外 1）。

| id | 元投稿URL | cluster | freshness | 送信文面（verbatim） | 事前懸念 | stage |
|---|---|---|---|---|---|---|
| EQ-1 | https://x.com/bocchi_kigyo/status/2085934021746598267 | 一人事業・反復事務 | <24h | 毎日の帳簿から請求書、入金確認までぜんぶお一人はすごいです…。この中だと一番時間取られてるのはどの作業ですか? | **あり** — handle名から発信系アカウントの可能性。プロフィール確認を推奨したが実施有無は `UNKNOWN` | REPLY_WAIT |
| EQ-2 | https://x.com/poke_mz/status/2085901128554983688 | 一人事業・反復事務 | <24h | 取引先ごとに帳票システム違ってアカウント管理が増えていくやつ、ほんと消耗しますよね…。いま何種類くらい使い分けてるんですか? | なし | REPLY_WAIT |
| EQ-3 | https://x.com/ejimaru_create/status/2086048023197458804 | Creator（制作・すり合わせ） | <24h | 「いい感じで」で作って「なんか違う」が返ってくるの、しんどいですよね…。最初のすり合わせで何か聞くようにしてることあります? | なし | REPLY_WAIT |
| EQ-4 | https://x.com/take_freelance/status/2086036018873196956 | Creator（動画・書き出し） | <24h | 書き出してからミス見つけるの、あるあるすぎます…。書き出し前の最終チェックって何かルーティン決めてます? | **あり** — 元投稿が「あるある」形式のライト投稿。実害の言及なし | REPLY_WAIT |

### 事前登録された解釈上の制約（返信が来る前に記録）

**4件中2件（EQ-1 / EQ-4）に、送信前から Genuine Pain 証拠としての弱さが登録されている。**

- **EQ-1**: 相手が発信系アカウントだった場合、返信は営業的な反応であり得る。Genuine Pain の証拠として弱い
- **EQ-4**: 元投稿が「あるある」の共感投稿であり、実害・頻度・コストの言及がない。**軽い共感は Pain ではない**（`SALES_OS` §4 撤退シグナル「愚痴を楽しんでいるが実害を言えない」に該当し得る）

したがって Day 1 の**実質的な Genuine Pain 検証枠は EQ-2 / EQ-3 の2件**として扱う。返信率を4件を分母に計算してよいが、**Pain confirmation率の分母は2件で見る**。

### 文面の共通構造（BASELINE-EQ として登録）

4件とも同一構造で書かれている。これが Day 1 の実験条件そのものになる。

```
共感1文（相手の投稿内容を具体的に言い換える）＋ 「…。」
　↓
質問1つ（現在の運用を尋ねる。仮定の質問ではない）
　↓
終了（オファーなし・リンクなし・自己紹介なし）
```

- 40〜120字 / 全件個別文面（同一・近似文なし）
- 禁止要素（調査しています / 宣伝ではありません / 定型褒め / 初手売り込み）なし
- **Batch 1 の BASELINE（初期7件）とは別系統**。比較は同一系統内でのみ行う

### コスト実測

| 項目 | 値 |
|---|---|
| Day 1 実費 | **USD 0.1631**（daily cap 0.18 内） |
| 内訳 | 探索3本 0.1482 + 実在検証1本 0.0149 |
| cost_per_GO_candidate | USD 0.0408 |
| query数 | 探索3 + 検証1 |
| 3日累積上限 0.50 の残り | **USD 0.3369** |
| xAI推定残高 | **≈ USD 0.486**（予備 0.10 確保。停止条件該当なし） |

全額 response実測（`cost_in_usd_ticks`）。推定値ではない。

---

## Capability Learnings（Day 2-3 で再利用。環境事実）

Batch 1では実行セッション終了とともに手法が失われた。**同じ喪失を防ぐため、環境・API事実のみ本台帳へ移す。**

1. **Live Search API は廃止**。`/v1/responses` + `tools:[{"type":"x_search"}]` を使う（内部tool: `x_keyword_search` / `x_semantic_search` / `x_thread_fetch`）
2. **課金 = token + tool呼出**（grok-4.20: $1.25/M in・$2.50/M out、加えて $0.005/tool呼出）。`cost_in_usd_ticks`（1 tick = 1e-10 USD）が実請求値であり、計算と1 tickまで一致した
3. **`max_tool_calls` パラメータは非強制**。**prompt内で回数を制限する方が効く**（実測: 9回 → 4回へ半減）
4. **x.com / publish.twitter.com へのegressは遮断**。実在検証は `x_thread_fetch` 経由のみ可能（E-008の追認）
5. **配達候補は原則 `x_thread_fetch` で裏付けを取る**運用が有効だった（Day 1 は4件とも本文照合済み・重複0件）

### Day 2 への配分変更（Day 1 実測に基づく）

- 事務・一人事業系 **60-70%**（Day 1 最良収量: q1 = 9 calls / GO 2）
- Creator隣接 **20-30%**（q2 = 4 calls / GO 2 — **call効率は最良**）
- 未探索枠 **10-20%**（EC出品 or 店舗運用）
- データ整理・転記系は表現を変えて **1枠のみ再試行**（0件×1回目）
- **全queryに検索2ラウンド制限を最初から適用**（probe型の9回検索 ≈ $0.066/本 を回避し、$0.04/本以下へ）

---

## 次のAction

- **返信の観測はHuman経路のみ**（harnessからX読取不可）。ヒロが通知を確認して報告した時点で本台帳を更新する
- 返信が発生したら: reply verbatim記録 → 3タグ分類（HOW / TIME / WHAT-gap）→ 次の最小質問を1つだけ生成 → **送信はHuman Gate**
- 返信0のまま Day 3 を終えた場合、`SCALE` 判定は成立しない（xAI追加チャージの条件付き承認は発火しない）
