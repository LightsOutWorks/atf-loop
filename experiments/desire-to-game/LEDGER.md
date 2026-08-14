# experiments/desire-to-game/LEDGER.md — E-014 Desire to Game Reality Test 台帳（正本）

- **Status**: **ACTIVE — Phase 1未着手・納品0**
- **承認**: 2026-08-13 PR #65 merge（= 契約が事前登録したHuman Gate。merge commit `0dcf7d6`）
- **契約（正本）**: `direction/EVAL_DESIRE_TO_GAME_2026-08.md` §5。PASS / FAIL / VOID / STALE・判定点・KILL条件・非目標はすべて契約側が持つ。**本台帳は再掲しない**（記入欄と記録規律のみを持つ）
- **作成**: 2026-08-13（契約の着手条件「1件目の納品前に列を確定する」の履行）

---

## 記録規律（凡例）

1. **PII非記載**: 本リポジトリはPUBLIC。実名・顔・年齢・家族構成の特定につながる記述を書かない。参加者は匿名ID（P1〜）と続柄カテゴリ（子 / 家族 / 友人 / 知人）のみ。
2. **作品はrepoへ入れない**: 生成セッションからヒロへ直接受け渡し、本人の端末で `file://` で開く。台帳にはファイル名とSHA-256のみ記録する（帰属用join key。Batch 1のjoin key恒久喪失の再発防止）。
3. **Expressed / Observed分離**: 発言と行動が矛盾したらObserved（実際の遊び方）を優先（`OS.md` HI-4 F5）。
4. **Repair / Continuation分離**（2026-08-13 Human裁定・契約§5）: **Repair Request（バグ修正・操作不能・明白な難易度破綻）は「次のDesire」にカウントしない。** Repair Request Log（別表）へ記録し、修理はする。Continuation Desire（体験を続ける方向の自発的要求）だけをSignal表の該当列に書く。
5. **観測はHuman報告経路のみ**: 記入は観測メモ（1件1枚・目安数分）から。未報告の欄は `UNKNOWN` 既定。**予定・会話・提案を実施済みとして書かない**（`CONSTRAINTS.md` Part I §6）。
6. **プレイの強制・催促をしない**: 「促しなし再プレイ」は文字どおり促しゼロ・別日のみ成立。催促後のプレイは再挑戦欄へ（再プレイ欄には書かない）。
7. **知人・知人の子供へ広げる前にHard要件**（目的明示・明示同意・保存範囲限定・第三者提供しない明記。子供は親の同意）を消化し、消化した事実を本台帳のNotesへ記録する。

## Funnel現在値（2026-08-13）

聞き取り 0 / 納品 0 / 促しなし再プレイ 0 / Continuation Desire 0 / Repair Request 0 / 強シグナル 0

- **判定点**: 最初の納品から14日後 または 2026-09-15 の早い方（最初の納品が発生した時点で日付を本行へ確定記入する）→ **未確定**
- **Budget消費**: JPY 0（cap: 追加支出0）/ **Human時間消費**: 0分（cap: 合計90分）
- **Retrospective Seed Corpus（本ファイル末尾）はこの数に含めない。** 承認前・承認前後が未確認の既存ゲームはE-014の判定母集団外である。

## 参加者（匿名）

| id | 続柄カテゴリ | Hard要件（家族=不要 / 知人=消化日） | Notes |
|---|---|---|---|
| — | — | — | — |

## Desire → 納品記録

| id | participant | expressed_desire（本人の言葉・PII除去） | 解釈と実装内容 | REUSE検査（既存ゲームで満たせたか） | 納品前検査（smoke / interaction / ヒロ1分プレイ） | delivered_at | artifact（ファイル名 / SHA-256） |
|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — |

## Signal記録（Observed優先）

| id | 初回反応 | 再挑戦 | 促しなし再プレイ（別日・日付） | 他人に見せた | **Continuation Desire発話（本人の言葉）** | 後日「また遊びたい」 | 強シグナル（第三者「自分も欲しい」/「いくら？」— PASS条件外） |
|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — |

## Repair Request Log（カウント外・修理対象）

| id | 申告内容 | 修理内容 | 修理後の再納品（artifact SHA-256） |
|---|---|---|---|
| — | — | — | — |

## 判定（判定点で記入。HI-5語彙）

- Verdict: **未判定**
- 根拠: —

---

## Retrospective Seed Corpus（E-014判定母集団の外。2026-08-14追加）

E-014承認（2026-08-13 PR #65 merge / merge commit `0dcf7d6`）**より前**に作られた、または承認前後が未確認の既存ゲームを、**E-014の判定母集団へ混ぜずに**回収するための表。

**この表の行は、上のFunnel現在値・Desire → 納品記録・Signal記録・Repair Request Log・判定のいずれも動かさない。** 変換能力の学習とTaste学習（`OS.md` HI-3）には使ってよいが、**E-014のPASS / FAIL / VOIDの根拠には使わない。**

### E-014 eligibility（3値。既定は `UNKNOWN`）

| 値 | 成立条件 |
|---|---|
| `ELIGIBLE` | 納品がE-014承認（2026-08-13 `0dcf7d6`）**以後**であること、**かつ**契約§5の対象・納品・観測規律の下で行われたこと。**両方がHuman-confirmed** |
| `PRE-CONTRACT` | 納品が承認**より前**であることがHuman-confirmed |
| `UNKNOWN` | 上のどちらも確認できない（**既定値**） |

- **`UNKNOWN` を推測で `ELIGIBLE` へ上げない。** 「たぶん最近」「承認後のはず」はHuman-confirmedではない。
- `PRE-CONTRACT` と `UNKNOWN` は判定母集団に入らない。**`ELIGIBLE` がHuman-confirmedになった行だけ**を日付付きで上のDesire → 納品記録 / Signal記録へ転記する（Corpus行は削除せず、転記先を evidence note に書く）。

### 記録規律（上の凡例に加えて適用）

1. **artifact本体をrepoへ入れない**: ゲーム本体HTML・Claude Artifact URL・画像・動画・音声のいずれも追加しない。原本はHuman保持・repo外。台帳は**ファイル名とSHA-256だけ**をjoin keyとして持つ（凡例2の適用）。
2. **SHA-256が取得できなければ `UNKNOWN`。** 架空値・仮ハッシュ・切り詰め値を作らない（`CONSTRAINTS.md` Part I §6）。
3. **PII非記載**（凡例1と同じ）: 実名・顔・年齢・具体的な家族関係を書かない。参加者は匿名ID `P1` 〜 と続柄カテゴリ（子 / 家族 / 友人 / 知人）のみ。
4. **ゲーム件数と参加者Nを混同しない。** 参加者Nは異なる `participant_id` の数で数える。1人へ5本作った場合は**ゲーム5件・参加者N=1**。
5. **Hiro Taste SignalとObserved World Signalを混同しない。** 前者はヒロの評価（Human Taste）、後者は参加者本人の行動・発話（World Signal）。ヒロの「出来が良かった」はWorld Signalではない。
6. **Observed World Signalは種別ラベル付きで書く**: `促しなし再プレイ（別日）` / `Continuation Desire` / `Repair Request` / `他人に見せた` / `再挑戦`。**Repair RequestをContinuation Desireへカウントしない**（凡例4）。
7. 未報告欄は `UNKNOWN` 既定。予定・会話・推測を実施済みとして書かない（凡例5）。

| game_id | participant_id | E-014 eligibility | expressed_desire（本人の言葉・PII除去） | 解釈と実装内容 | artifact（ファイル名 / SHA-256） | delivered_at | Hiro Taste Signal | Observed World Signal（種別ラベル付き） | evidence note |
|---|---|---|---|---|---|---|---|---|---|
| G1 | P1 | **`UNKNOWN`** | `UNKNOWN`（本人の言葉の記録なし） | `UNKNOWN`（忍者・手裏剣を題材とすることのみHuman報告。実装内容は未報告） | `shuriken_game.html` / SHA-256 **`UNKNOWN`** | **`UNKNOWN`** | 商用アプリ級だと感じた / 非常に面白かった / Claudeの制作能力を高く評価（**Human Taste・Capability評価。World SignalでもE-014のPASS証拠でもない**） | `初回反応` 強く面白がった / `利用` プレイした / `促しなし再プレイ（別日）` 本人から促しなし / `価値確認` 発話「売れるね」 | 2026-08-14 Human報告（**FACT**）。**「売れるね」は購入意思・支払いではない**——段5の売上へ昇格させず価値確認Signalとしてのみ扱う。**P1は納品対象であり、契約§6 trigger①の「納品対象外の第三者」ではない**（trigger未発火）。**添付 `verify.mjs` は実装前提の異なる別バージョン用のため、本作のWorld Signalに使わない。ChatGPTによる実ブラウザでの人間同等プレイも未確認。** 原本: Human保持・repo外 |
| G1 | P2 | **`UNKNOWN`** | `UNKNOWN` | 同上（G1） | 同上（G1） | **`UNKNOWN`** | ゲーム単位のためP1行に記載 | `利用` プレイした / `促しなし再プレイ（別日・翌朝）` 本人から促しなし | 2026-08-14 Human報告（**FACT**）。続柄カテゴリ `UNKNOWN`。原本: Human保持・repo外 |
| G2 | `UNKNOWN` | **`UNKNOWN`** | `UNKNOWN` | 見下ろし型3v3アリーナ対戦。5ファイター・難易度3段・1試合150秒。単一HTML / 外部通信ゼロ / 日本語UI / タッチとPC両対応 | タイトル `PRISM ARENA — 3v3 クリスタルラッシュ` / ファイル名 **`UNKNOWN`** / SHA-256 **`UNKNOWN`** | **`UNKNOWN`** | `UNKNOWN` | **`UNKNOWN`** | 2026-08-14 **一次実測**（Claudeがartifactを直接確認）。**artifact URLは記録規律1により記録しない。** 原本: Human保持・repo外 |
| G3 | `UNKNOWN` | **`UNKNOWN`** | `UNKNOWN` | 子供向けなぞなぞアドベンチャー。**全文ひらがな**・段階式ヒント・物語仕立て。iPhone / iPad前提 | タイトル `ハッカー・ライト ― ひかりをとりもどせ` / ファイル名 **`UNKNOWN`** / SHA-256 **`UNKNOWN`** | **`UNKNOWN`** | `UNKNOWN` | **`UNKNOWN`** | 同上（一次実測） |
| G4 | `UNKNOWN` | **`UNKNOWN`** | `UNKNOWN` | 4レーン音ゲー。**楽曲・効果音もすべてコード生成**・音ズレ自動調整あり。タッチとPC（DFJK）両対応 | タイトル `ルーン・カデンツァ / Rune Cadenza` / ファイル名 **`UNKNOWN`** / SHA-256 **`UNKNOWN`** | **`UNKNOWN`** | `UNKNOWN` | **`UNKNOWN`** | 同上（一次実測） |
| G5 | `UNKNOWN` | **`UNKNOWN`** | `UNKNOWN` | **全文ひらがな**のオートバトラー。4ステージ＋各ボス・レベルアップ時に3択。WASD / 矢印、スマホは画面なぞり | タイトル `どらごん ふぉーる` / ファイル名 **`UNKNOWN`** / SHA-256 **`UNKNOWN`** | **`UNKNOWN`** | `UNKNOWN` | **`UNKNOWN`** | 同上（一次実測）。特定の子を想定して作られたとHuman報告があるが、**ゲーム内に人名は含まれない**（一次確認） |
| G6 | `UNKNOWN` | **`UNKNOWN`** | `UNKNOWN` | きせかえ。髪型9種・ドレス・メイク・写真保存。**全文ひらがな**。**iPad横向き必須**——縦向きでは全画面で「よこむきにしてね」が出て遊べない（`@media (orientation:portrait)`） | タイトル `まじかる☆きせかえ` / ファイル名 **`UNKNOWN`** / SHA-256 **`UNKNOWN`** | **`UNKNOWN`** | `UNKNOWN` | **`UNKNOWN`** | 同上（一次実測）。G5と同じく**ゲーム内に人名は含まれない**。**横向き必須は段2（利用）の既知の詰まり要因** |
| G7 | `UNKNOWN` | **`UNKNOWN`** | `UNKNOWN` | 暗号解読アドベンチャー。シーザー暗号の回転盤・ビットグリッド・監視カメラの迷路・モールス・換字表／資料アーカイブ・TRACEゲージ・章構成・分岐選択。**漢字を含む日本語UI**（G3・G5・G6の全文ひらがなとは読者層が違う）。iPhone / iPad前提 | タイトル `NULL PROTOCOL ― 亡霊のプロトコル` / ファイル名 **`UNKNOWN`** / SHA-256 **`UNKNOWN`** | **`UNKNOWN`** | `UNKNOWN` | **`UNKNOWN`** | 同上（一次実測） |

### Corpus現在値（2026-08-14 Human報告。個別ゲームへ未分解）

| 項目 | 値 | 等級 |
|---|---|---|
| existing_games | **5以上** | **Human-confirmed（FACT）** |
| Hiro Taste | **全作品の出来が良かった** | **Human-confirmed（FACT）**。**Human Taste Signal**であり、World SignalでもE-014のPASS証拠でもない |
| 参加者N / 個別分解 / artifact / 制作・納品日 / プレイ行動 / eligibility | **UNKNOWN** | 未報告。推測で埋めない |
| 原本・成果物 | **Human保持・repo外** | — |

**この報告はE-014のFunnel現在値（聞き取り0 / 納品0）・判定点・Verdictを動かさない。** 個別ゲームへ分解できた時点で上の表へ行を起こす。

> **2026-08-14 追記 — G1の分解（上の表は不変更で保持する）**
>
> G1（`shuriken_game.html`）が個別ゲームへ分解できたため、Corpus表へ2行（G1/P1・G1/P2）を起こした。確定したのは**G1についてのみ**であり、G2以降は引き続き `UNKNOWN`。
>
> | 項目 | 値 | 等級 |
> |---|---|---|
> | G1の参加者N | **2**（P1 / P2） | **Human-confirmed（FACT）** |
> | G1の利用 | **2人がプレイした** | **Human-confirmed（FACT）** |
> | G1の継続利用 | **2人とも別日・促しなし再プレイ**（P2は翌朝） | **Human-confirmed（FACT）** |
> | G1の価値確認 | **P1の発話「売れるね」** | **Human-confirmed（FACT）**。**購入意思・支払いではない** |
> | G1の eligibility / delivered_at / SHA-256 / expressed_desire | **`UNKNOWN`** | 未報告。推測で埋めない |
> | G2〜（残り3本以上） | **`UNKNOWN`** | 未分解 |
>
> **eligibility は既定どおり `UNKNOWN` であり、G1はE-014の判定母集団に入らない。** したがって本追記は **E-014のFunnel現在値（聞き取り0 / 納品0）・判定点・Verdict（未判定）のいずれも動かさない**。判定母集団へ転記できるのは、納品が承認（`0dcf7d6`）以後であることと契約§5の規律下で行われたことの**両方がHuman-confirmed**になった行だけである（`UNKNOWN` を推測で `ELIGIBLE` へ上げない）。
>
> **AI側の検証結果を本作のWorld Signalとして使わない。** 添付 `verify.mjs` は実装前提の異なる別バージョン用であり、ChatGPTによる実ブラウザでの人間同等プレイも未確認（**Claude Artifact URLからの直接プレイは不可だった。HTML本体の受け渡しでコード監査は可能になったが、それは人間のプレイ観測の代替にならない**）。**AIの品質評価より、既に得られている人間のReality Signalを優先する。**

> **2026-08-14 追記 — G2〜G7の分解（上の各行・表は不変更で保持する）**
>
> Humanから artifact 7件が提示され、**7件すべてをClaudeが直接確認した**（一次実測）。Corpus表へ G2〜G7 の6行を起こした。**確認できたのは作品の同定と実装仕様だけであり、参加者・納品・プレイ行動はすべて `UNKNOWN` のまま。**
>
> | 項目 | 値 | 等級 |
> |---|---|---|
> | 個別に同定できたゲーム | **7件**（G1〜G7。すべて別タイトル） | **一次実測（FACT）** |
> | 全7件の共通仕様 | 単一HTML / 外部通信ゼロ / 外部アセットなし / 音はコード生成 / 日本語UI | **一次実測（FACT）** |
> | 読者層の分岐 | 全文ひらがな **3件**（G3 / G5 / G6）・漢字を含む **4件**（G1 / G2 / G4 / G7） | **一次実測（FACT）** |
> | 参加者N / 納品 / プレイ行動（G2〜G7） | **`UNKNOWN`** | 未報告。推測で埋めない |
>
> **記録した3つの事実（いずれも一次実測）**
>
> 1. **実在の人物名を運んでいる作品は無い。** 特定の子を想定して作られたとHuman報告のある G5・G6 を確認したが、**画面に出る固有名詞に実在人物の名前は無い**。G3・G7 には登場人物名があるが**いずれも架空のキャラクター名**である。したがって「作品そのものがPIIを運ぶ」経路は存在しない（**渡す相手や記録側のPII規律は別問題であり、凡例1と凡例7は変わらない**）。
> 2. **提示された artifact はいずれも「リンクを知る者は誰でも閲覧できる」共有状態にある**（取得時のメタデータ）。**ファイル転送なしでリンクだけで開ける**——納品経路の摩擦は想定より小さい。一方でリンクが渡った先は制御できないため、**共有範囲は納品時のHuman判断に属する**。
> 3. **G6 は iPad 横向きが必須。** 縦向きでは全画面オーバーレイが出て操作できない実装である（`@media (orientation:portrait)`）。**段2（利用）が発生しない既知の要因**であり、渡す時点で横向きを伝えるかどうかで結果が変わる。
>
> **本追記もE-014のFunnel現在値・判定点・Verdictを動かさない。** eligibility はG2〜G7も既定どおり `UNKNOWN` である。**artifact URL は記録規律1により記録していない。**

> **2026-08-14 追記 — 7本へのHiro Taste（上の各行・表は不変更で保持する）**
>
> | 項目 | 値 | 等級 |
> |---|---|---|
> | 7本全体 | **「全部いい出来だった」** | **Human Taste Signal（FACT）**。**World SignalでもE-014のPASS証拠でもない**（凡例5・記録規律5） |
> | G4（音ゲー）への個別評価 | **音楽を外部の音楽生成（suno等）にすればもっと良くなる気がした。それ以外はかなりいい** | 同上。**Evolution Transfer Log の L1 として登録済み**（未適用・`UNKNOWN`） |
> | 参加者本人のプレイ行動・発話（G2〜G7） | **`UNKNOWN`** | 未報告。Hiroの評価はこれの代わりにならない |
>
> **この評価はFunnel現在値・判定点・Verdictを動かさない。** ヒロの「いい出来」は**変換能力についてのHuman Taste**であり、**段2〜4（利用 / 継続利用 / 価値確認）はG1以外すべて `UNKNOWN` のままである**（`CURRENT_STATE.md` §7 Reality Funnel）。

### G1 — Desire → Reality の到達事例（2026-08-14 Human裁定により記録）

**Human Desireを起点にPlayable Artifactが生成され、価値確認まで到達した最初の事例。** 上のCorpus表 G1/P1・G1/P2 の行が実測の正本であり、本節はその**到達段の要約**だけを持つ。

```
Human Desire → Artifact → 利用 → 自発的な継続利用 → 価値確認
```

| 到達段 | 実測 | 等級 |
|---|---|---|
| Human Desire起点でPlayable Artifactが生成された | **達** | **Human-confirmed（FACT）**。ただし**expressed_desire（本人の言葉）は未記録 = `UNKNOWN`**。起点がDesireであったことと、その中身が記録されていることは別 |
| 利用 | **P1・P2 の2名が実際にプレイ** | **Human-confirmed（FACT）** |
| 自発的な継続利用 | **2名とも別日・促しなし再プレイ**（P2は翌朝） | **Human-confirmed（FACT）** |
| 価値確認 | **P1本人の発話「売れるね」** | **Human-confirmed（FACT）**。購入意思でも支払いでもない |
| 売上 | **JPY 0** | **FACT** |

- **これは「売上成功」ではない。** 到達したのは価値確認までである。**Confirmed terminal revenue が 0 である間、Factoryが「成功した」と表現してはならない**（`CONSTRAINTS.md` Part I §6）。本節が記録するのは**段4までの到達**であって、Factoryの成功宣言ではない。
- **Hiro Taste / Capability評価はWorld Signalと分離済み**（上のHiro Taste追記）。ヒロの「いい出来」「商用アプリ級」は本表のどの行の根拠にもしていない。
- **eligibility は `UNKNOWN` のままであり、本節はE-014のFunnel現在値・判定点・Verdictを動かさない。** 到達事例であることと、事前登録された実験の判定母集団に入ることは別である。

### 7作品の一次確認から得られた観測（2026-08-14。**観測に留める**）

**Source**: 同日、Claudeが7本のartifactを直接取得し、保存HTML（計841,508 bytes）へ固定文字列検索を実行した一次実測。

- **コード生成音（WebAudio）が 7/7 で存在**
- **safe-area対応（ノッチ回避）が 7/7 で存在**
- 以下 localStorage安全ラッパ 5/7、viewport自己修復 5/7、ポインタ入力の統一 5/7、Canvas 2D 5/7 と続く
- **題材に依存しない土台コードが、題材の異なる複数作品で重複している**（忍者・対戦・なぞなぞ・音ゲー・オートバトラー・きせかえ・暗号のいずれでも同じ土台が独立に書かれている）

**これは「再利用可能性を示す観測」に留める。** 現時点で次のいずれへも昇格しない——**部品索引（COMPONENT_INDEX）/ 恒久Capability / registry / 共通ライブラリ / 自動抽出 / 新しい管理規則**。

**再判定のtrigger（2026-08-14 Human裁定）**: 次に実際に新作を作る必要が発生した際、既存作品から**必要な部品を1つだけ**再利用する。そこで制作時間・品質・再利用性へ効果が出た場合に、恒久索引の要否を初めて再判定する。

---

## Evolution Transfer Log（前作の学びが次作へ移ったかの実測。2026-08-14追加）

**「作ったゲームの数」ではなく「前作の学びが次作へ移り、適用後のSignalが観測された数」を進化の証拠にするための表。**

### 判定規律

1. **`source_game_id` の無い一般論は登録しない。** どのゲームの何から出た学びかを特定できないものは、学びとして扱わない。
2. **evidence sourceをHuman TasteとWorld Signalで分ける。** ヒロの評価 = Human Taste / 参加者の行動・発話 = World Signal。1行に混ぜない。
3. **抽出しただけでは「進化」と書かない。** `applied_to_game_id` が埋まって初めて**移転実績**である。
4. **適用後のHuman TasteまたはWorld Signalが取得できた時点で** conclusion へ `支持` / `反証` を記録する。取得できていない間は `UNKNOWN` のまま残す（効果を推測で書かない）。
5. **結果が悪化した学びも削除しない。** `反証` された学びとして残す（`CONSTRAINTS.md` Part I §6）。
6. **同じ学びを複数作品へ適用した場合は、適用先ごとに行を分ける**（`learning_id` は共通、`applied_to_game_id` が異なる行を並べる）。各適用先が独立に追跡できることを優先する。
7. **ここでの実測を新しいKPI・恒久ルールへ昇格させない**（`OS.md` HI-4 F6）。まず実測を残す。

| learning_id | source_game_id | evidence source（Human Taste / World Signal） | 抽出した学び | applied_to_game_id | 実際に変えたこと | 適用後のHuman Taste / World Signal | conclusion（支持 / 反証 / UNKNOWN） |
|---|---|---|---|---|---|---|---|
| L1 | **G4**（音ゲー） | **Human Taste**（2026-08-14 ヒロ。**World Signalではない**——参加者の行動・発話ではない） | 楽曲をコード生成ではなく**外部の音楽生成サービス**（suno等）で作れば、体験がさらに上がる可能性がある。**音以外は現状で良いという評価とセット**（「それ以外はかなりいい」） | **`UNKNOWN`**（未適用） | — | — | **`UNKNOWN`** |

### Transfer現在値（2026-08-14）

抽出済み学び **1** / 移転実績（適用済み）0 / 適用後Signal取得済み 0 / 支持 0 / 反証 0

**現時点で「Factoryが進化した」と書ける実測は存在しない**（判定規律3: 抽出しただけでは進化と書かない。`applied_to_game_id` が埋まって初めて移転実績）。

> **L1 の実行前に解く必要がある衝突（2026-08-14。Claudeが指摘。判断はHuman）**
>
> L1 を実装すると **E-014契約 §5 の納品要件と3点で衝突する**。学びとして残すことと、実行してよいことは別である。
>
> | 衝突 | 契約の条文 |
> |---|---|
> | 生成した音声ファイルは**外部アセット**である | §5 納品: 「単一HTML・**外部通信ゼロ**」。**7本すべてが現在この要件を満たしている**（2026-08-14 一次実測: 音はすべてコード生成） |
> | suno等は**有償サービス** | §5 budget_cap: 「追加支出 **JPY 0**」（既存Claude Max内。外部API・素材購入なし） |
> | 生成物の権利・利用条件が未確認 | §5 納品: 「**第三者IP不使用**」 |
>
> **したがって L1 は現契約の下では適用できない。** 適用するなら契約の変更（Human裁定）が要る。**Claudeの側でsunoの調査・契約・購入・実装のいずれも開始しない**（`CONSTRAINTS.md` Part I §4 Human Gate: 支払い・契約・課金）。**学びは削除せず、`applied_to_game_id` = `UNKNOWN` のまま保持する。**
