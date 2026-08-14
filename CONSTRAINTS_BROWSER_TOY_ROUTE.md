# Browser-Toy Production Route契約（Historical Experiment / status: HOLD）

本ファイルは `CONSTRAINTS.md` Part II を、**契約本文を1文字も変えずに**分離したものである（2026-08-14 / `DECISIONS.md` D-011）。**分離は所在の変更であって、効力・scope・statusの変更ではない。**

分離の理由: C0 Configuration Provenance baseline（`config/champion-baseline.json`）が `CONSTRAINTS.md` を**ファイル全体**で production_material としてpinしていたため、現Missionの最優先Sourceである Part I を編集するたびにbaseline全体の再宣言が要る構造になっていた（実測記録: `OS.md` HI-4 のR1注釈 — 2026-08-10にPart I側へ書き込んだところC0がSTALEを返し、内容を `OS.md` へ退避した）。pin対象を本ファイルへ移し、Part I を解放する。

Part I（Factory Boundary / Hard Boundary / Budget / Risk Tiers / Human Gates / Data Boundary / 検証の誠実性）は引き続き `CONSTRAINTS.md` が持ち、Source of Truth Priority第1位である。

---

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
