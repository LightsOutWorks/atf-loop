# EVAL — Desire to Game（Human Desire → Playable Reality 実証企画）

- **提案**: Human（2026-08-13 Task Contract・会話レベル）。起点は2026-08の実観測——子供たち本人の要望をAIにゲーム化させたところ、AI自身にゼロから企画させたものより明らかに面白いものができた。
- **評価**: 2026-08-13 Claude。E-012評価（`EVAL_DESIRE_DISCOVERY_SERVICE_2026-08.md`）の前例に従い、**要素分解して個別判定する。一括採用しない。**
- **照合の形跡**（`OS.md` HI-4 F10）: `CONSTRAINTS.md` Part I全文 / `OS.md` Current Identity・HI-2・HI-4・HI-8〜HI-12・Layer2「探索と固定」/ `DESIRES.md` / `CURRENT_STATE.md` §7-0・§7-0-a・§7 / `DECISIONS.md` D-001〜D-008全件 / `ROADMAP.md` §0・§2・§3・§5・§6 / `research/INDEX.md` 全497行（「反証済み」行の全数照合を含む）/ `direction/DESIRE_TO_REALITY_SERVICE_DESIGN.md` / `direction/DESIRE_ENGINE_LONG_GAME.md` / `direction/EVAL_DESIRE_DISCOVERY_SERVICE_2026-08.md` / `ops/JP_COMPLIANCE_BRIEF_2026-08.md` / `JOURNAL.md` 0001〜0008 / `works/`・`smoke.mjs`・`config/champion-baseline.json` 実測。

## VERDICT

| 要素 | 判定 |
|---|---|
| 仮説そのもの（実在Desire起点で、ゲーム媒体のHuman Desire → Reality変換を検証する） | **GO** — 北極星整合（§1） |
| 無償Reality Test（Phase 1〜5・N 3〜5・Human観測） | **MODIFY** — §5の契約（E-014案・修正6点込み）で実行可能。承認 = 本PRのmerge |
| 商品仮説（Desire Vote / Slot / Gift） | **HOLD** — 解除trigger式（§6）。発火まで調査・設計・出品を開始しない |
| ゲームFactory再稼働（`factory.yml` 再enable・カタログ再生成・週次生成） | **NO_ACTION** — 本実験に不要。D-001のHOLDは不変 |

**着手の因果1文**（`OS.md` HI-10）:

> この実験 → 実在Desire起点の変換ループ1周（Desire → 遊べるReality → 自発Signal → 次Desire）の初の実測を取得 → 律速「World Signalを回収し、正しいContact / Needへ帰属し、次のActionへ戻す経路が弱いこと」（`CURRENT_STATE.md` §7）を、直接観測できる唯一の経路で1本貫通する → MD-1（Paid Value Loopの無償前段の実証。E-012 Stage -1bと同一スロット）→ North Star（変換能力自体をWorld Signalで改善する）。

**HI-10 7条件の充足**: ①North Star接続（上記）②MD-1接続（無償前段→§6 trigger経由で有償接続）③律速（構造的律速を直接。戦術律速「会話の本数」への接続は間接である事実を§7-3に明記）④次のReality（納品3〜5件と観測記録）⑤探索範囲（North Star × MD-1 × 現在の優位「人の判断・欲求・迷いを引き出し、本人の言葉として返しながら…意思決定を前に進める力」の交差の内側。子供の欲求を引き出し本人の言葉のままゲームと台帳に返す行為はこの優位の直接行使）⑥より小さい方法がない（REUSE検査を組み込んだ上で、変換ループの検証にはBUILDが不可欠 — §7-2）⑦今やる理由（2026-08の実観測が新鮮なうちに構造化して再現確認する。追加支出0・既存資産が全て揃っている・E-012主軸は実施0件のままで、Desire→Reality実績の1件目を最短で作れる）。

---

## 1. 北極星と整合するか（提案§14-1）— する

1. **D-001が止めたのはIdentityであって媒体ではない。** D-001 Decision 2はBrowser-Toy Production Route（AI起点・無人生産・週次公開）をHistorical Experiment（HOLD）にした。「ゲームという媒体でHuman Desire → Realityを検証すること」を禁じた決定は正本のどこにも存在しない。`DESIRES.md` §6と`OS.md` Operating Philosophy 7はGameを明示的にRoute（Identityではない）として列挙し、`ROADMAP.md` §2は「ブラウザトイは最初の検証基質であり、永続する中心ではない」と書く。提案自身の位置づけ（ゲームは目的ではなくRoute）と一致する。
2. **提案の役割分担はLayer1の写しである。** Human＝Desire・好き嫌い・価値判断／AI＝解釈・実装・検証という分担は、`OS.md` §1 Assumption「Human expresses desire. Factory discovers how. The world decides value.」と§4「人間の役割はDesireとBoundaryだけ」の実装形そのもの。
3. **旧Routeの実測失敗の鏡像修正になっている。** AI起点の24作は世界からの信号ゼロで終わった（`eval.json` 9件全て `world: null`。「world:nullのまま1つの学習も生まなかったことが実証済み」— `ops/OWNERSHIP_AUDIT_2026-08-08.md`）。`JOURNAL.md` 0006は「ループは Create → Publish → End で閉じており、Observe World → Learn → Improve の矢印が存在しない」と記録した。本提案は同じ生成能力のまま**Desireの起点だけを反転させる**（AI発案 → 実在人間の発話）。変更変数が1つであり、旧Routeの失敗と直接比較可能な実験になる。
4. **棄却済み案の再演ではない。** `research/INDEX.md` の「反証済み」行と市場・Route・候補・仮説が一致するものは0件（全数照合済み）。E-007（Genome Factory NO-GO）はAI起点・無人生産・公開カタログの収益化Routeであり、Desire起点・個別納品・非公開の本実験とはRoute構造が異なる。逆に `research/INDEX.md` §H には「会話中に見えた具体的な痛みに対して30分で単一HTMLの動くものを作り、リンクも要求もなしで無償で渡す」という**同型の未検証仮説（N=0・推論のみ）が既に登録されており**、本実験はその初の実測になる。
5. **競合の存在は論点にしない。** AIゲーム生成サービスや既製ゲームの存在は棄却理由にならない（`DESIRE_TO_REALITY_SERVICE_DESIGN.md` §1-c）。問うべきは独自の因果価値であり、それは「本人が言語化したDesireから作り、本人に返し、本人の遊び方で判定する」個別性にある（同§4-b: 独自の因果価値の不在だけが棄却理由になる）。

## 2. そのまま再利用できるもの（§14-2）

| 資産 | 所在 | 再利用の形 |
|---|---|---|
| 最小ゲーム生成能力 | `works/` 24作（単一index.html）・`JOURNAL.md` 0002/0004の複数run実測 | そのまま。生成はセッション内で行う（`factory.yml` 不要） |
| 機械検証 | `smoke.mjs`（6項目・Node組み込みのみ・`node smoke.mjs <dir>` で単体実行可） | `window.__GAME__` 契約（60秒制・title/play/over・startBtn/replayBtn）に準拠する作品はそのまま検証。契約外の形はヒロの1分プレイで代替 |
| 対話・視覚検証 | `scripts/interaction-smoke.mjs`（Playwright実ポインタ）/ `JOURNAL.md` 0008 Render→Visual Inspection | 納品前の自己検証に流用 |
| 成果物様式 | `CONSTRAINTS.md` Part II（単一HTML・外部通信ゼロ・第三者IP不使用・PC/スマホ両対応・状態遷移・再プレイ初期化） | **品質床として任意採用**。Part II自体は発動しない（scopeは `factory.yml` 実行時のみ）。UI英語限定は適用外——日本語UIでよい |
| 観測の形式 | `experiments/encounter-queue/LEDGER.md`（join key規律）/ `DESIRE_ENGINE_LONG_GAME.md` §2-1（日付を決めて戻って聞く・オファーを付けない）/ `ROADMAP.md` §5 W1/W2定義（replay / voluntary returnの帰属可能測定。凍結中だが保存済み） | E-014台帳の列設計に流用 |
| 対人規律 | `experiments/desire-discovery/SELF_ANALYSIS_PROTOCOL.md`（在重力: 裁かない・事実の並置・「何もしない」も可） | 聞き取りと観測の返し方に適用。子供相手でも同じ |
| 実験枠組み | E-012 EVAL AMENDMENT 2(a) Stage -1b（手動・無料・N=5・知人可・DB/自動化/LP作らない・目的はNeed信号の質の検証と自発発話の観測） | 承認済みの同型スロット。本実験は入力を「自己分析」→「ゲームDesire」に替えた変種であり、E-012と競合しない（並走） |
| コンプラ | `ops/JP_COMPLIANCE_BRIEF_2026-08.md`（PRE-REVENUE。無償段階への制約記載なし） | §6発火時にそのまま適用対象 |

## 3. 本当に不足している最小Capability（§14-3）— 新規Capabilityはゼロ

実行不能を解く新規能力は存在しない。不足は**規律側の2点**だけ。

1. **事前登録**（`ROADMAP.md` §3 step 6が必須化）— 本文書§5がそれ。
2. **観測台帳1枚**（`experiments/desire-to-game/LEDGER.md`。承認後・1件目の納品前に作成）— E-013台帳の変種であり新規抽象化ではない。Batch 1のjoin key恒久喪失（20枠が分析不能）と `DESIRE_ENGINE_LONG_GAME.md` §2-2「構造化は公開前にしかできない」の教訓により、**列の確定を着手条件とする**。

## 4. 新しく作らないもの（§14-4）

ゲームエンジン / 新Agent・新Governance / 配布基盤（URL公開・Pages掲載・ストア）/ 課金・決済 / Desire収集フォーム・DB・LP / 作品内telemetry・Signal自動収集（`ROADMAP.md` §6: attribution根拠なしのtelemetry禁止）/ 新gate体系（`ROADMAP.md` §0 禁止列挙）/ `factory.yml` 再enable（Human Gateかつ不要）/ `index.html` カタログ再生成（E-001既知欠陥②: shallow clone環境での再生成・commit禁止が**現環境で現に成立**——本実験はカタログに一切触れない）/ 英語版（EN_GATE凍結中）/ ジャンル網羅 / 大作化。

## 5. E-014 — Desire to Game Reality Test（実験契約・事前登録案）

- **experiment_id**: E-014
- **desire接続**: MD-1（Paid Value Loopの無償前段。有償接続は§6のtrigger発火時のみ）/ MD-3（変換ループの実Reality計測）
- **hypothesis（反証可能形）**: 実在の人間が言語化したゲームDesireを、AIが最小の遊べるRealityへ変換して本人に返すと、AI起点の24作で一度も観測されなかった自発的World Signalが発生する。定量: **納品できた対象の過半数で「促しなしの再プレイ（納品日より後の日）」または「次のDesireの自発発話」が判定点までに観測される。**
- **変更変数**: Desireの起点のみ（AI発案 → 実在人間の発話）。生成・検証・単一HTML様式は既存資産のまま変えない（`ROADMAP.md` §3: 一度に複数の未知変数を変えない）
- **対象**: 3〜5人。**家族から開始する。** 知人・知人の子供へ広げるのはHard要件（目的明示・明示同意・保存範囲の限定・第三者提供しない旨の明記 — E-012 EVAL AMENDMENT 2(b)。相手が子供の場合は**親の同意**）を満たした場合のみ
- **Phase構成**: 提案どおり——聞く → 最小実装 → 本人に返す（説明より先に触ってもらう）→ 観測 → 追加Desireが出た場合のみ改造。**AI都合の機能追加禁止。完成度最大化禁止**
- **納品**: 単一HTML・外部通信ゼロ・第三者IP不使用・日本語UI可。本人の端末で `file://` で開く。**公開しない。** 納品前検査 = `smoke.mjs`（契約準拠時）または `interaction-smoke.mjs` ＋ **ヒロが1分遊ぶ**（seed-009の教訓: 全チェックPASSでも遊べないことがある — `JOURNAL.md` 0001）
- **budget_cap**: 追加支出 **JPY 0**（既存Claude Max内。外部API・素材購入・ホスティング追加なし。効果音はコード生成音のみ）
- **Human時間上限**: 1件あたり目安15分（聞く・渡す・観測メモ1枚）・合計90分。業務外時間のみ。**家族の生活を実験のために変えない**（`OS.md` HI-8）。観測は日常の遊びをそのまま見るだけとし、プレイの強制・催促をしない
- **world_signal（台帳の列。1件目の納品前に確定）**: participant_id（匿名・続柄カテゴリのみ）/ expressed_desire（本人の言葉。PII除去）/ 解釈と実装内容 / **REUSE検査**（そのDesireは既存ゲームで満たせたか — `research/INDEX.md` §J「BUILDを既定に置かない」への実測返し）/ delivered_at / 初回反応 / 再挑戦 / **促しなし再プレイ（別日）** / 他人に見せた / **次のDesire発話（本人の言葉）** / 後日また遊びたいと言った
- **Expressed / Observedの分離**（提案§8）: 発言と行動が矛盾した場合はObserved（実際の遊び方）を優先して記録する（`OS.md` HI-4 F5と同じ規律）
- **Repair / Continuationの分離**（2026-08-13 Human裁定）: **Repair Request（バグ修正・操作不能・明白な難易度破綻）は「次のDesire」としてカウントしない。体験を続ける方向の自発的要求だけを Continuation Desire として扱う。** 本契約のhypothesis・PASS・world_signal列の「次のDesire（自発）発話」はすべてContinuation Desireを指す。Repair Requestは修理対象として扱う（カウントしないだけで、直さないのではない）
- **PASS**: 納品3人以上、かつ過半数で「促しなし再プレイ」または「次のDesire自発発話」
- **FAIL**: 納品3人以上、かつ判定点までに両シグナルとも0人
- **VOID**: 納品3人未満・遊ぶ機会が発生しなかった・観測記録欠損。**VOIDをFAILとして学習しない**（`CONSTRAINTS.md` Part I §6）
- **STALE**: 判定点前に上位正本（戦略・Boundary）が変わり比較が無効になった場合
- **強シグナル（記録するがPASS条件にしない）**: 第三者の自発的「自分も欲しい」/ 自発的「いくら？」/ 他人に見せる。N 3〜5では発生ゼロが最頻になりうる——**供給が小さすぎて作れない結果に判定を紐づけない**（E-013 Day 3 Final Verdict Human amendmentの教訓）
- **判定点**: 最初の納品から14日後または2026-09-15の早い方。HI-5語彙（GO / HOLD / KILL / WAIT / NO_ACTION）で記録する
- **rollback**: 外部作用なし。停止＝以後作らないだけ。渡した作品は本人の手元に残す（回収しない）
- **実験のKILL条件**: HI-8違反の観測（家族・生活への負担化）/ 対象本人が嫌がった / Humanの中止裁定
- **この実験の非目標**: 公開 / 課金・価格提示 / URL配布 / カタログ掲載 / 新規基盤 / telemetry / E-012・E-013の変更（**止めない。並走** — E-012 EVAL AMENDMENT 3「止めない、格下げする」と同じ処理。主軸の座も動かさない）/ **repo内へのPII記載**（実名・顔・家族構成の特定につながる記述。実名や家族をキャラクター化した作品はrepoへ入れない——本リポジトリはPUBLIC）

## 6. 商品仮説のHOLDと解除trigger

Desire Vote / Slot / Giftは**今は設計しない**（`OS.md` HI-10 Non-goals: 将来拡張の先回り／網羅性を上げるためだけの調査）。

- **解除trigger（外部で観測できる事象で書く — `OS.md` Layer2 B-12）**: ①納品対象外の第三者から自発的な「自分（の子）にも作ってほしい」が1件以上 ②対象または親から自発的な「いくら？」発話が1件以上
- **発火時に最初にやること**: 海外で既に収益を生んでいる類似事業（パーソナライズ絵本・カスタムゲーム受託・体験ギフト等）の収益構造の解剖。`research/INDEX.md` に当該調査は0件（§N「調べていない領域」一覧にも載らない完全な未調査域）。これは現在のベット「既に収益を生んでいて日本にまだ来ていない事業から選ぶ」（`CURRENT_STATE.md` §7-0）の**枠内での候補化**であり、ベットの変更ではない
- **発火時の既存制約**: 前売り禁止（E-012 EVAL恒久禁止「伴走の前売り」と同型。課金は相手が自発的に依頼した時にだけ価格を出す — 同AMENDMENT 2(d)）/ ¥2-15万帯への独立サービス投入は再提案禁止（`research/INDEX.md` §J。二重棄却済み）/ Independence Clause（分析・レビュー側に課金しない — `DESIRE_ENGINE_LONG_GAME.md` §1-B。課金するなら制作権側）/ 特商法の本名表記はPF販売で最小化（`ops/JP_COMPLIANCE_BRIEF_2026-08.md` §8）/ **未成年者契約（親権者同意・取消権）・子供向け商品特有の規制・AI生成素材の第三者権利は既存コンプラ文書に未記載** — 有償化前に追補必須

## 7. 正本との緊張点（隠さない）

1. **現在のベットとの関係。** `CURRENT_STATE.md` §7-0のベット「既に収益を生んでいて日本にまだ来ていない事業から選ぶ。決めたら全ベット」を**本評価は変更しない**。E-014は探索期のprobeであり全ベットではない。Desire to Gameを「筋のいい一点」として固定する判断はHumanのMajor Bet（`OS.md` HI-11）であり、その材料は判定点の実測と§6発火時の海外解剖が与える。
2. **REUSE-firstとの緊張。** `DESIRE_TO_REALITY_SERVICE_DESIGN.md` §3（繋ぐ→足す/引く→作る）と `research/INDEX.md` §J（5件中4件REUSE・BUILDを既定に置かない。範囲限定N=5）に対し、本実験はBUILDを既定に置く。正当化は3つ——(a) 検証対象が変換ループそのものであり、BUILDを外すと実験が成立しない (b) パーソナライズDesire（自分だけの必殺技・家族キャラ）は既存ゲームで原理的に満たせない (c) 限界コスト≈0。ただし**REUSE検査列を台帳に置き**、既存ゲームで満たせたDesireの比率を実測して§Jの範囲限定（N=5）に実測を足す。
3. **律速「会話の本数」への接続は間接。** 家族との会話は `ROADMAP.md` §0のファネル会話ではない。本実験が直接動かすのは構造的律速（World Signal回収経路 — `CURRENT_STATE.md` §7）の側であり、ファネル律速へは第三者インバウンド（§6 trigger①）経由でしか届かない。`ROADMAP.md` §0の事前登録「2026-11-10までに会話5件へ届いていなければ、noteとXの前に接触の作り方を変える」に対し、本実験は**接触の作り方の代替候補へ前倒しで実測を与える**（判定日自体は動かさない）。
4. **長期Theme「ヒロをmessage-busから外す」とは逆方向。** 本実験はHuman観測に依存する。ただしD-003 Decision 7（構造的な律速と現在の最優先実験は同一である必要はない）が既にこの分離を認めており、X読取遮断下ではHuman報告経路（スクリーンショット1枚・観測メモ1枚）が実務最適（`research/INDEX.md` §L）。自動化は反復がボトルネックとして実測されてから（`ROADMAP.md` §0 Premature Automation禁止）。
5. **対象が子供である点は正本に規定がない。** `DESIRE_TO_REALITY_SERVICE_DESIGN.md` §1-dの禁止範囲は「本業で会っている人・面談の場・面談で生まれた関係」のみで、家族・子供・友人・知人は**含まれない**（全文grepで不出現を確認済み）。ただし明示許可でもない。無償・家族内・ヒロ本人による接触の範囲で開始し、範囲拡張と有償化は§5・§6の条件に従う。「返信前のProduct構築」禁止（`ROADMAP.md` §0）には抵触しない——本実験は**本人がDesireを発話した後にのみ**作る。

## 8. Humanへ返す判断（1件 — `OS.md` HI-2）

**本PRのmerge = E-014の承認。** mergeされなければ何も起きない（生成・接触・台帳作成のいずれも開始しない）。本日期限の既存判断2件（ChatGPT $100枠P1 / @HatoNozomu 3通目タイムアウト — `ROADMAP.md` §0判断表）を本評価は変更しない。E-012・E-013も変更しない。
