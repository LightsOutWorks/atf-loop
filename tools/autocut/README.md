# autocut

撮った動画を1本渡すと、**YouTube ロング / YouTube ショート / TikTok** の3種を、テロップ付き・編集済みで書き出す。

```bash
autocut 撮ったやつ.mp4
```

これだけ。途中で何も聞かれない。

```
撮ったやつ_autocut/
├── youtube_long/     撮ったやつ_youtube_long.mp4        1920x1080
├── youtube_shorts/   撮ったやつ_youtube_shorts_01..03.mp4  1080x1920 / 各58秒以内
├── tiktok/           撮ったやつ_tiktok_01..03.mp4          1080x1920 / 各58秒以内
└── artifacts/        transcript.json / cutplan.json / highlights.json / *.ass / report.json
```

---

## 何を自作していないか

映像処理も音声認識も自作していない。この道具が持っているのは**繋ぎだけ**である。

| 工程 | 使っているもの |
|---|---|
| 文字起こし | faster-whisper（ローカル実行） |
| 無音検出 | ffmpeg `silencedetect` |
| カット・連結 | ffmpeg `trim` / `concat` |
| テロップ描画 | libass（ffmpeg `ass` フィルタ） |
| 縦型への組み直し | ffmpeg `scale` / `crop` / `gblur` / `overlay` |
| 音量正規化 | ffmpeg `loudnorm`（-14 LUFS） |

自作したのは、カット位置の決定・短尺の選定・日本語の折返し・カット後の時刻の付け直しの4つだけ。

## 「いい感じの編集」の中身

曖昧に済ませず、実際にやっていることを全部書く。

1. **無音カット** — 0.35秒以上の無音を詰める。ただし両端に0.12秒の息継ぎを残す。ここをゼロにすると機械的に聞こえる
2. **フィラー除去** — 「えー」「あのー」「えーと」「うーん」など、単独で意味を持たない言い淀みを落とす
3. **音量正規化** — 配信プラットフォームの基準（-14 LUFS / TP -1.5dB）に合わせる
4. **テロップ** — 日本語の禁則処理つきで折返し、読点・句点があればそこで改行する。ロングは一文ずつ、縦型は数語ずつ切り替える
5. **短尺の自動選定** — 文字起こしから「実は」「結論から」「理由は三つ」といった冒頭フックの有無、話速、文として閉じているか、フィラー比率で採点し、重ならないように上位を選ぶ
6. **9:16 への組み直し** — 元映像を縮めて中央に置き、背景に自分のぼかし版を敷く。**被写体が切れない**。`--reframe crop` で中央切り抜きにもできる

## 入れるもの

```bash
# Ubuntu / Debian
sudo apt-get install ffmpeg fonts-noto-cjk

# macOS
brew install ffmpeg
brew install --cask font-noto-sans-cjk-jp

# 本体
cd tools/autocut
pip install -e ".[asr]"
```

`fonts-noto-cjk` を入れないとテロップが豆腐（□）になる。

初回だけ Whisper のモデルを取りに行く（`medium` で約1.5GB）。以降はキャッシュから読むので、**2回目からは完全にオフラインで動く**。

## 使い方

```bash
# 既定（3種類 × ショート3本）
autocut talk.mp4

# 短尺を5本、出力先を指定
autocut talk.mp4 --out ./出力 --shorts 5

# 精度を上げる（時間はかかる）
autocut talk.mp4 --model large-v3

# 速さ優先
autocut talk.mp4 --model small --encode-preset veryfast

# 既に文字起こしがある（SRT / JSON）
autocut talk.mp4 --asr fixture --transcript talk.srt

# 縦型だけ作る
autocut talk.mp4 --targets youtube_shorts tiktok

# 「あの」「まあ」も落とす
autocut talk.mp4 --aggressive-fillers
```

主なオプションは `autocut --help` に全部ある。

### 切り出し位置を自分で決める

自動選定が気に入らない時だけ、位置を外から渡せる。

```json
{"highlights": [{"start": 12.0, "end": 58.0}, {"start": 130.5, "end": 175.0}]}
```

```bash
autocut talk.mp4 --highlights picks.json
```

## 素材を外へ出さない

映像・音声を外部 API へ送るバックエンドは**用意していない**。文字起こしはローカルの faster-whisper で完結し、短尺の選定も規則ベースで外部モデルを呼ばない。業務案件の素材でも、そのまま回して外へ出ない。

## 検証の状態

2026-08-12 時点で、実測できたことと、できていないことを分けて書く。

**実測で確認したもの**（Ubuntu 24.04 / ffmpeg 6.1.1 / espeak-ng 合成の日本語 171秒素材）

| 項目 | 結果 |
|---|---|
| 3種7本の生成 | 完走。所要 220秒（ultrafast） |
| 出力解像度 | ロング 1920x1080 / 縦型 1080x1920 |
| 短尺の尺 | 47.0 / 41.8 / 31.1 秒 — 全て58秒以内 |
| 無音カット | 15箇所を検出・除去。171.2秒 → 154.5秒（9.8%除去） |
| フィラー除去 | 仕込んだ4個（えー / あのー / えーと / うーん）を4個とも除去 |
| テロップ | 焼き込みを目視確認。日本語が豆腐にならず、折返しと位置も意図どおり |
| 縦型の組み直し | 背景ぼかし＋中央配置を目視確認。被写体が切れていない |
| 単体テスト | 38件パス（`python -m unittest discover -s tests`） |

**まだ実測していないもの**

- **faster-whisper による実音声の認識精度**。この検証環境は egress policy で HuggingFace が 403 のためモデルを取得できず、文字起こしは正解データを流し込んで代替した。パイプラインの下流（カット・テロップ・組み直し・書き出し）は全て実測済みだが、**認識そのものの精度は未測定**である
- **人間の肉声・実撮影素材での挙動**。検証素材は espeak-ng の合成音声であり、話速が実際より遅い（1.8文字/秒。実際は5〜9文字/秒程度）
- 短尺選定の規則が、実際に再生数へ効くかどうか

## 既知の限界

- 顔追跡をしていない。縦型は「ぼかし背景＋中央配置」で被写体を切らない方式で回避している
- 短尺の選定は規則ベースであり、話の面白さは判定していない。冒頭フックの語・話速・文の閉じ・フィラー比率だけを見る
- BGM・効果音・ジングル・トランジションは入れない
- 複数話者の切り替え（ワイプ、話者別テロップ色）に対応していない

## テスト

```bash
cd tools/autocut

# ffmpeg 不要（38件）
python -m unittest discover -s tests -p 'test_*.py' -v

# 通しの検証素材を作って回す（ffmpeg + espeak-ng が要る）
python tests/make_fixture.py --out /tmp/fx
python -m autocut /tmp/fx/fixture.mp4 --asr fixture --transcript /tmp/fx/fixture.json --out /tmp/fx/out
```
