# Batch 1 — Reality Contact Ledger

Experiment: E-006（`experiments/INDEX.md`）/ MD-1 Economic Engine
Owner: Lane A（Reality / Economic Engine）セッション
制定: 2026-08-08

目的: Public Human Desire → Genuine Conversation → Genuine Pain → Smallest Useful Solve → Paid Pilot → **Confirmed Revenue** を最短で1回完走するための、Contact単位のWorld Signal台帳。

## 運用規則（最小）

1. **送信済みメッセージ・過去の記録を事後的に書き換えない**（追記のみ。訂正は訂正として残す）。
2. 返信が発生したら: reply verbatimを記録 → signalを分類 → **次の最小質問を1つだけ**HUMAN_SHORTで生成 → 送信はHuman Gate（自動送信禁止）。
3. Solutionを先に決めない。SOLVE_ATTEMPT段階で AI / SaaS / BUY / outsource / process change / manual service / BUILD を比較する。AIを売らない。
4. 初回Free Solveは許容。ただし無期限に続けない — 価値確認後はPaid Pilotへの最短Routeを設計する。
5. 支払い・契約・公開・第三者送信はすべてHuman Commit。
6. 確認できない値は `UNKNOWN`。推測で埋めない。
7. 分母規律: REPLY率等の分母は**REACHABLE確認済み接触**で数える（`LEARNINGS.md` L1 / C-1。VOIDは分母外）。
8. 送信前チェック（`LEARNINGS.md` L1）: 送信主体と対象スレッドの公開可視性を送信前に確認する。

## KPI Funnel（Contact単位のstage）

`SENT → REACHABLE → REPLY → GENUINE_PAIN_CONFIRMED → CONTINUED_CONVERSATION → SOLVE_ATTEMPT → VALUE_CONFIRMED → PAID_PILOT → PAYMENT → CONFIRMED_REVENUE`

- 目的は返信率最大化ではない。Terminal Goal = 返金・取消可能期間を経過した確定実収益。
- `KILLED` / `NO_REPLY_TIMEOUT` / `VOID` は失敗・評価不能の記録として保持（FAILを消さない。VOIDをFAILとして学習しない）。

## Funnel Totals（2026-08-10 08:32 JST 更新 — Human-confirmed）

| SENT | SENT_BUT_NOT_PUBLICLY_VISIBLE（VOID） | PUBLICLY_VISIBLE / REACHABLE | REPLY_WAIT | REPLY | GENUINE_PAIN_CONFIRMED |
|---|---|---|---|---|---|
| **20** | **3**（HN） | **17** | **16** | **1** | **0** |

**初返信が発生した（2026-08-09）。** REPLY 0 → 1（分母 REACHABLE 17 に対し 5.9%。N=1でありレートとして扱わない）。

ただし **GENUINE_PAIN_CONFIRMED は 0 のまま**。返信は Pain の確認ではなく、**Pain仮説の明確な否定**だった（Reply Log 001）。`REPLY > 0` を前進と読み替えない — Terminal Signal は Confirmed Revenue であり、返信数ではない。

## Ledger（2026-08-08 Human-confirmed sync / SENT = 20）

凡例: sent_at「2026-08-08 (HC)」= 2026-08-08 Human-confirmed sent（exact timestamp = UNKNOWN。推測しない）。X行のurlは**返信先の元投稿**。cluster / 送信文面 / freshness_at_send はDemandセッション成果物がrepo内に存在せず回収不能のため `UNKNOWN`（全remote branch検索済み 2026-08-08。Humanへの再入力要求はしない）。X行のid: Demand採番が判明しているのはLN-58 / LN-62のみ。他はhandleを行キーとし、採番判明時に追記する。

| id | platform | sent_at | url（X行=元投稿） | cluster | freshness_at_send | message_style | stage | last_signal | next_action |
|---|---|---|---|---|---|---|---|---|---|
| C01 | Hacker News | 2026-08-08 (HC) | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | **SENT_BUT_NOT_PUBLICLY_VISIBLE**（VOID — Delivery Layer failure） | 2026-08-08 Human実測（`LEARNINGS.md` 訂正1 C-1） | 分母外。再送・別スレッドはHuman Gate |
| C02 | Hacker News | 2026-08-08 (HC) | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | **SENT_BUT_NOT_PUBLICLY_VISIBLE**（VOID — Delivery Layer failure） | 同上 | 同上 |
| C04 | Hacker News | 2026-08-08 (HC) | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | **SENT_BUT_NOT_PUBLICLY_VISIBLE**（VOID — Delivery Layer failure） | 同上 | 同上 |
| C09 | Software Recommendations SE | 2026-08-08 (HC) | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | REACHABLE / REPLY_WAIT | 2026-08-08 Human画像確認（Answer公開表示） | reply監視（SE APIはR0で確認可・quota注意） |
| C14 | Bluesky | 2026-08-08 (HC) | UNKNOWN | UNKNOWN | UNKNOWN | BASELINE | REACHABLE / REPLY_WAIT | 2026-08-08 Human画像確認（公開スレッド表示） | reply監視（読取系R0可。検索はHARNESS_BLOCKED） |
| LN-58 | X @MinoruOffice | 2026-08-08 (HC) | https://x.com/MinoruOffice/status/2085606586463268990 | UNKNOWN | UNKNOWN | BASELINE | REACHABLE / REPLY_WAIT | 2026-08-08 Human送信完了確認（公開reply） | reply監視（X読取不可 — Human報告経路） |
| LN-62 | X @toro_etoile | 2026-08-08 (HC) | https://x.com/toro_etoile/status/2085156769622548531 | UNKNOWN | UNKNOWN | BASELINE | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@ys_aimini | X @ys_aimini | 2026-08-08 (HC) | https://x.com/ys_aimini/status/2085697604189626502 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@HatoNozomu | X @HatoNozomu | 2026-08-08 (HC) | https://x.com/HatoNozomu/status/2085687351939051632 | 反復事務（シフト/マニュアル/対応表作成）※返信により事後確定 | UNKNOWN | HUMAN_SHORT（**文面を2026-08-09に回収** — 下記Reply Log 001） | **REPLY**（2026-08-09 Human画像確認） | 2026-08-09 実返信1件（Batch 1初） | Reply Log 001 / 002 参照。2通目を2026-08-09にHuman Commitで送信済み。72h無応答なら `NO_REPLY_TIMEOUT`（期限 2026-08-12 23:32 JST） |
| X-@Frecciarossa956 | X @Frecciarossa956 | 2026-08-08 (HC) | https://x.com/Frecciarossa956/status/2085697486853919001 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@shinchan731 | X @shinchan731 | 2026-08-08 (HC) | https://x.com/shinchan731/status/2085361070777291124 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@KIITYAN_YouTube | X @KIITYAN_YouTube | 2026-08-08 (HC) | https://x.com/KIITYAN_YouTube/status/2085376088939929684 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@Sharkley28 | X @Sharkley28 | 2026-08-08 (HC) | https://x.com/Sharkley28/status/2085350652478414879 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@gVlKbmhD9D8IghT | X @gVlKbmhD9D8IghT | 2026-08-08 (HC) | https://x.com/gVlKbmhD9D8IghT/status/2085272673320599810 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@Lua_cha_m | X @Lua_cha_m | 2026-08-08 (HC) | https://x.com/Lua_cha_m/status/2085232482753147069 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@ariablue0314 | X @ariablue0314 | 2026-08-08 (HC) | https://x.com/ariablue0314/status/2085247887198638200 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@346kunx | X @346kunx | 2026-08-08 (HC) | https://x.com/346kunx/status/2085311590476439873 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@nameraka | X @nameraka | 2026-08-08 (HC) | https://x.com/nameraka/status/2085645670309068967 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@kubotahiroto | X @kubotahiroto | 2026-08-08 (HC) | https://x.com/kubotahiroto/status/2085846571523129698 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |
| X-@neginegi55hmaky | X @neginegi55hmaky | 2026-08-08 (HC) | https://x.com/neginegi55hmaky/status/2085519186768638179 | UNKNOWN | UNKNOWN | UNKNOWN | REACHABLE / REPLY_WAIT | 同上 | 同上 |

- Batch 1 Target 20 / SENT 20 — **送信枠は消化済み**。以後の本Batchの仕事はWorld Signal回収（reply / reaction）と会話前進のみ。
- X 15件の送信方法: Humanが各元投稿を開き、公開replyとして手動送信（送信完了をHumanが確認）。message_styleは、初期7件（C01 / C02 / C04 / C09 / C14 / LN-58 / LN-62）がBASELINE確定、以後のX 13件は `UNKNOWN`（HUMAN_SHORT Defaultの期間だが、実文面が回収できるまで確定記録しない）。

## Reply Log 001 — X-@HatoNozomu（Batch 1 初返信 / 2026-08-09）

Source: 2026-08-09 23:14 JST Human画像確認（スレッド全体）。harnessからX読取不可のためHuman報告経路（E-008）。

### 元投稿（2026-08-07頃 / verbatim・抜粋）

> 私、実働的な仕事のほうが好き。単純作業とかルーティン作業とか。今週の業務は色々しんどかったけど私的には楽しかった。
> でもさ、何で私がシフト作ってマニュアル作って対応表作ってんの？**作成するのはいいけどさ**、私はあなた達の感情までは知らんよ。**言いたいことは対応表に追記してよね！**

### 送信文面（2026-08-08 / verbatim — 本ログで回収。従来 `UNKNOWN` だった）

> シフトもマニュアルも対応表も全部作る係になってるんですね…。それ一式で毎月どれくらい時間もっていかれてます？

impressions **7**（Human画像実測）。C-1 ≈20 imp と同水準で、reachが極めて小さいことの2件目の実測。

### 返信（2026-08-08〜09 / verbatim）

> シフト作成に関しては基本ルール『Aの時はどうする』があり、それに呼応して『ルートB』『ルートC』と対応ルートが決まっており、それに準じイレギュラーを入れるだけなので作成自体は苦ではありませんし、作成時間も通常業務時間内ですので『時間を持っていかれる』感覚はないですね。

### 判定: **Pain仮説 REFUTED**

こちらは「時間」を聞いた。相手は丁寧かつ具体的に全面否定した — ルール整備済み / 作成自体は苦ではない / 通常業務時間内 / 「時間を持っていかれる」感覚なし。Painスコアカード（`SALES_OS` §4）は実質 0 点。

### 根本原因: **送信前に否認証拠が元投稿へ書かれていた**

元投稿の「**作成するのはいいけどさ**」は、本人による「その作業はPainではない」という明示的な否認である。**こちらはその1節後ろにある本当の不満を読まずに、否認された側を質問にした。**

「回収不能だったから分からなかった」ではない。**読めば分かる位置にあった。**

### 本人が実際に述べていた不満（未着手）

> 私はあなた達の感情までは知らんよ。言いたいことは対応表に追記してよね！

仕組み（対応表）は本人が作り、機能もしている。**問題は他者がそれを使わないこと。**

### 3タグ分類: **該当なし**

`HOW-gap`（やり方が分からない）でも `TIME-gap`（手が回らない）でも `WHAT-gap`（何をすべきか分からない）でもない。本人は解けており、**周囲の採用が起きていない**。`CURRENT_STATE.md` §3 の Gap分類でいえば **D. Adoption**（ただし自社内・自作ツールに対するもの）。

> **N=1。タグを増やさない。** 単一観測を恒久ルールへ昇格させない（`OS.md` HI-4 F6）。同型が3件出た時点で再検討する。

### 起草済みの次の1通（**未送信・送信はHuman Gate**）

> あ、時間の話じゃなかったですね、失礼しました。ルートBCまで決まってるなら仕組みはもう出来上がってるんですね…。気になったのは「言いたいことは対応表に追記してよね」の方で、実際に追記してくれる人ってどれくらいいます？

105字 / 3文 / 質問1つ / オファーなし / リンクなし / 相手の言葉を言い換えていない（§99）。前提が外れたことを先に認めている（Realityが違えば撤回する）。

**送らない判断も正当**: 時間仮説のPainスコアは0であり `SALES_OS` §4 の「2点以下 → 友好的に終える」に該当する。一方で相手は長文で丁寧に訂正しており、これは拒絶ではなく関与である。かつ**本人が実際に述べた不満は一度も質問されていない**。

### 抽出した選定規則（次Batchへ適用可能）

**候補スクリーニングで、次の語形を「その作業はPainではない」という否認として機械的に扱う:**

- 「〜するのはいいけど」「〜自体は問題ない」「〜は苦じゃない」「〜は好き」
- これらが名指しした作業を、Pain仮説の対象にしない
- 否認節の**直後**に本当の不満が来ることが多い（本件では「私はあなた達の感情までは知らんよ」）

コストゼロで実装でき、同型の空振りを消せる。`experiments/batch-1/LEARNINGS.md` の次回抽出へ引き渡す。

---

## Conversation Log

（返信発生時にここへ追記: id / 受信日時 / reply verbatim / signal分類 / 生成した次の1問 / Human送信結果）

- 2026-08-08: 返信なし（初回抽出時点）。
- 2026-08-08: C01 / C02 / C04へ `SENT_BUT_NOT_PUBLICLY_VISIBLE`（Delivery Layer failure / VOID）を転記。Provenance: Human実測 → `LEARNINGS.md` 訂正1 C-1（Lane C経由のHuman裁定）。これによりL1の「要転記（Human Handoff）」は完了し、当該FACTの一次記録は本台帳へ移る。機構的詳細（shadowban / dead等）は引き続き `UNKNOWN`。
- 2026-08-08: **Human-confirmed full sync**（Lane A Task返信）。SENT=20（HN 3 / Bluesky 1 / SE 1 / X 15）へ台帳を同期。X 15件の元投稿URL受領・記録。C14 / C09はHuman画像確認によりREACHABLE確定。旧「追加Contactあり・詳細受領待ち」注記（C-2）は本syncで解消。cluster / 文面 / freshnessはrepo内に回収可能なDemand成果物が存在しないため `UNKNOWN` のまま（全remote branch検索済み）。
- 2026-08-08: 定期self check-inを停止（X読取不可環境では主要World Signalを取得できないため）。Humanからreply / reactionが共有された時のみLane Aを再起動する（Human裁定）。

## Reply Log 002 — X-@HatoNozomu（2通目を送信 / 2026-08-09）

Source: 2026-08-10 08:32 JST Human画像確認（スレッド全体）。

### 送信文面（2026-08-09 23:32頃 JST / Human Commit / verbatim）

> 詳しくありがとうございます。完全に時間の話だと思い込んでいました、すみません。
>
> 最後の「言いたいことは対応表に追記してよね」が引っかかっていて、あれって直接は言ってこない感じなんでしょうか？

起草はAI、送信はHuman（Human Gate = 第三者への送信）。文面は起草どおりで改変なし。

### 実測

| 対象 | 時刻 | impressions | 返信 | いいね |
|---|---|---|---|---|
| 相手の返信（否認の投稿） | 19:01 2026-08-09 | **32** | 1（＝こちらの2通目のみ） | 0 |
| こちらの2通目 | 23:32頃 2026-08-09 | **7** | 0 | 0 |

**2通ともimpressions 7で一致した**（Reply Log 001の1通目も7）。C-1投稿 ≈20 と合わせ、reachが極めて小さいことの3件目の実測。相手の投稿32に対しこちらの返信は7で、親の約22%しか露出しない。

2026-08-10 08:32 時点、送信から約9時間で応答なし。

### Stage: 変化なし（**REPLY のまま**）

2通目の送信は前進ではない。`GENUINE_PAIN_CONFIRMED` は 0 のままで、Pain仮説はREFUTEDのまま維持する。台帳の規律どおり、**送信数の増加をファネルの前進として読み替えない**。

### この2通目が賭けているもの

1通目は元投稿の「作成するのはいいけどさ」（＝Painの明示的否認）を読み飛ばして時間を聞き、否認された。
2通目は、その1節後ろにある「言いたいことは対応表に追記してよね！」を対象にした。**仮説は「Painは作業量ではなく、要望が直接は言われず自分が書いた文書へ投げ込まれること」。**

判定条件（事前登録）:
- 応答があり、間接的な伝達についての具体が返る → 仮説を支持（ただしGENUINE_PAIN_CONFIRMEDには不十分。**相手がそれを問題と呼んだ場合のみ**確定）
- 応答があり、それも否定される → 仮説REFUTED。この相手は打ち止めとし、3通目は送らない
- 72時間（2026-08-12 23:32 JST）応答なし → `NO_REPLY_TIMEOUT`。追撃しない

### 観測経路の更新（2026-08-10）

egressの許可ドメイン拡張により `x.com` が到達可能になった。ただし**取得できる範囲は限定的**であることを実測した。

| 取得可否 | 対象 |
|---|---|
| **可** | 単一ポストの本文（URL既知の場合。`og:description` に載る）／アカウントのbio |
| **不可** | スレッドの2投目以降（返信）／impressions・いいね・返信数／フォロワー数／タイムライン |

`WebFetch` は `x.com` を別途拒否する（`EGRESS_BLOCKED`）が、`curl` は通る。返信の検知とimpressionsは静的HTMLに載らないため、**Encounter Queueの返信監視は引き続きHuman報告経路（E-008）に依存する**。この制約は解消していない。
