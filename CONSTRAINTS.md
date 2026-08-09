# CONSTRAINTS.md — Boundary / Hard Constraints / Human Gates

このファイルはリポジトリ全体の最優先Sourceである（Source of Truth Priority第1位。優先順位の全体は `OS.md` 参照）。他のどの指示・文書・会話・過去実験とも矛盾した場合、本ファイルを優先する。

本ファイルは2部構成である。

- **Part I — Factory Boundary**: 現在のMission（Human Desire → Reality Factory）全体に適用される境界。
- **Part II — Browser-Toy Production Route契約**: Historical Experiment（status: HOLD）である旧Browser-Toy生成ルート専用の成果物契約。**現在のMissionの制約ではない。** `factory.yml` による作品生成が実行される場合にのみ適用される。

---

# Part I — Factory Boundary

## 1. Hard Boundary（永久）

- 人間の尊厳
- 法令
- 第三者の権利
- 重大な実害

## 2. Budget

- Factory monthly hard cap: **JPY 50,000**（Claude / ChatGPT / APIs / hosting / domains / advertising / その他Factory支出をすべて含む）
- 支出上限はHumanが宣言する。**AIはBudget Capを自己変更してはならない。**
- 支出は単なるCostではなくRecoveryとの因果を見る: その支出がどのUnknownを減らし、どのDesireを前進させるかを記録可能にする。記録の重さは爆風半径に比例させる。

## 3. Risk-Based Autonomy（Risk Tiers）

自律性はON/OFFではなくTierで扱う。

| Tier | 範囲 | 扱い |
|---|---|---|
| R0 | read / research / analysis | autonomous |
| R1 | local / scratch / reversible generation | autonomous |
| R2 | branch / commit / draft PR | conditional autonomous |
| R3 | external communication / shared-state change / staging | **Human Commit** |
| R4 | production / payment / deletion / permission / credential / irreversible action | **explicit Human Commit** |

**`reversible` の定義（2026-08-10 追加）**: **git管理下のcommit済み状態へ戻せること**。これに当たらない次の3つは R1 ではなく R4 として扱う。

1. **生成物の再生成**のうち、出力が実行環境に依存するもの（例: `scripts/build-catalog.mjs` はRelease dateをgit履歴から導出するため、shallow cloneで再生成すると24件中9件の日付が偽値になる — `experiments/INDEX.md` E-001 実測）
2. **repo外にしか存在しない記録の破棄**（コンテナ内の作業記録・スクラッチ。回収不能な喪失は削除と同じ）
3. **時点依存の観測機会の消費**（外部サービスの状態・他者の投稿など、後から同じものを観測できないもの）

## 4. Human Gates（Humanの明示Commitが必要な行為）

- mainへのmerge
- 第三者への送信（reply / DM / 投稿 / Discovery Contactの送信行為を含む）
- 支払い・契約・課金・credit購入
- credential / Secret / permission / 許可ドメインの変更
- production deploy・公開・不可逆migration
- branch・履歴・過去成果物の破壊的削除
- identity（公開アカウント名等）の新規使用

## 5. Data Boundary

- 外部AIサービスへ、実名企業を含む非公開案件情報・社内CRM・未公開財務・面談文字起こし・買い手具体名を持ち込まない。
- 必要な社内データ統合は会社公認の許可環境（Gemini / NotebookLM等）でのみ行う。
- credential・API key・セッション情報をリポジトリへ保存しない。
- OS.mdのIOS適用範囲どおり、M&A業務そのものは本Factoryの適用範囲外。関連するのは公開情報のみを使うOpportunity Note（`experiments/INDEX.md` 参照）までである。

## 6. 検証の誠実性（全Route共通）

- 検証・テスト・ゲートの無効化・削除・期待値改変によって「見かけ上の成功」を作ることを禁止する。
- 会話・予定・提案を実装済みの事実として記録しない。確認できないことは `UNKNOWN` とする。
- `VOID` を `FAIL` として学習しない。`STALE` な結果を再利用しない。
- Confirmed terminal revenue（返金・取消可能期間を経過した確定実収益）が0である間、Factoryが「成功した」と表現してはならない。

---

# Part II — Browser-Toy Production Route契約（Historical Experiment / status: HOLD）

**Scope**: 以下はBrowser-Toy Production Route（`works/seed-*` の生成、`.github/workflows/factory.yml`、`smoke.mjs`）にのみ適用される成果物契約である。このルートは2026-08-08のD-001（`DECISIONS.md`）によりHistorical Experiment（HOLD）となった。ルートが実行される場合（schedule / workflow_dispatch）、生成担当は本Partを成果物の最優先ルールとして扱うこと。

## 成果物の形

- `index.html` 1ファイルだけで完結すること(ビルド不要、`file://` で直接開いて動く)
- HTML / CSS / JavaScript のみを使うこと
- 1プレイが 60 秒程度で終わるブラウザ FPS 風トイであること
- 1画面で完結すること(ページスクロールなし)

## 禁止事項

- 外部 API・外部通信の使用(`fetch` / `XMLHttpRequest` / `WebSocket` / `EventSource` / `sendBeacon` などすべて)
- CDN・外部スクリプト・外部ライブラリの読み込み(`<script src>` / `@import` / 動的 `import()` を含む)
- 外部画像・外部音声・外部フォントの参照(`<img>` / `<link>` / `<audio src>` / CSS `url()` / `http(s)://` の記述を含む)
- 第三者の名称・キャラクター・ロゴ・歌詞・固有表現の使用
- 金融・法律・医療・政治を題材にすること
- 過度な暴力・差別・露骨な性表現・違法行為の推奨

## 必須要件

- 描画は Canvas・CSS・文字・単純図形のみ(効果音を鳴らす場合はコード生成音のみ可)
- PC のキーボード・マウス操作と、スマートフォンのタップ・ドラッグ操作の両対応
- 状態遷移を持つこと: 開始(タイトル)→ プレイ → 終了/ゲームオーバー → 再プレイ
- 再プレイ時にスコア・残り時間が初期化されること

## UI 言語(プレイヤー向けテキスト)

- All player-facing text in each toy must be written in English only. Do not add language toggles or multilingual UI.
- 適用範囲(player-facing text): タイトル・操作説明・ボタン(START/REPLAY 等)・スコア/残り時間・ゲームオーバー表示・プレイヤー向けエラー文
- 対象外: コードコメント・内部ログ・生成記録(devlog.md 等)

## フォント

- Use only CSS generic font families. Do not reference named fonts, font brands, font files, or external font services.
- 注記: 初回運用では、font-family に使用してよい値を sans-serif / serif / monospace の 3 つに限定する(system-ui も当面使用しない)

## 機械検証(smoke.mjs)

検証項目は次の 6 つに固定する:

1. `index.html` が存在する
2. 外部通信・外部 URL 参照がない
3. script が構文エラーを起こさない
4. 読み込みが成功する(スクリプト実行が例外なく完了し、ゲームが初期化される)
5. 開始操作が存在する(開始操作でプレイ状態に遷移する)
6. リセットまたは再プレイができる(終了後に再プレイでき、スコアと時間が初期化される)

## 検証の誠実性

- スモークテストの無効化・削除・期待値の改変によって「見かけ上の成功」を作ることを禁止する
- スモークが失敗した場合の修正は最大 3 回まで
- 3 回で通らない場合は、失敗理由を `devlog.md` に記録して停止する
