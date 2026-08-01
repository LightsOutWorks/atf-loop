# atf-loop — 無人生成ブラウザトイ集

ルートの `index.html` は全作品を一覧できるカタログ(英語表記)です。
各作品は `works/seed-<連番>/` に 1 ファイルずつ収録された、ブラウザ FPS 風の 60 秒トイです。
すべて外部通信・外部ライブラリ・外部素材ゼロ、単一 `index.html` で完結します(ルールは [CONSTRAINTS.md](CONSTRAINTS.md) 参照)。

新作は無人パイプライン([.github/workflows/factory.yml](.github/workflows/factory.yml))が生成・検証・公開します(トリガー: `workflow_dispatch` + 毎週土曜 10:00 JST の schedule)。

## 遊び方

1. ルートの `index.html`(カタログ)をブラウザで開く、または GitHub Pages の公開先を開く
2. 遊びたい作品の **Play** リンクから各作品の `index.html` を開く(ダブルクリックでも OK。サーバー不要)
3. 各作品とも: **START** を押す(Enter / Space / 画面タップでも開始)→ 60 秒プレイ → TIME UP 後に **REPLAY** で再挑戦

最初の作品 **SEED 001 — NEON RANGE** は `works/seed-001/index.html` です(以前はルートの `index.html` でした。カタログ上部に導線があります)。

## 動作検証

Node.js があれば、各作品ディレクトリを引数にして固定 6 項目のスモークテストを実行できます。

```sh
node smoke.mjs works/seed-001
```

引数を省略するとルートの `index.html`(カタログページ)を対象にします。カタログは JavaScript を持たない静的ページのため、6 項目のうち③〜⑥(script・読み込み・開始操作・再プレイ)は該当せず FAIL になります。個々の作品を検証する際は、対象ディレクトリを必ず指定してください。

検証項目: ①`index.html` の存在 ②外部参照なし ③構文エラーなし ④読み込み成功 ⑤開始操作あり ⑥再プレイ可。

## ファイル構成

- `index.html` — 作品カタログ(英語表記。各作品の SEED 番号・タイトル・一行概要・公開日・Play リンクのみを掲載)
- `works/seed-<連番>/index.html` — 各作品本体(HTML/CSS/JS すべて内包)
- `works/seed-<連番>/devlog.md` — 各作品の開発ログ(判断・失敗・未解決事項)
- `CONSTRAINTS.md` — 最優先の制約ルール
- `smoke.mjs` — 機械検証スクリプト(対象ディレクトリ引数対応。Node.js 標準モジュールのみ使用)
- `.github/workflows/factory.yml` — 無人生成パイプライン
- `scripts/gate-prompt.txt` — 公開内容ゲートの固定プロンプト
