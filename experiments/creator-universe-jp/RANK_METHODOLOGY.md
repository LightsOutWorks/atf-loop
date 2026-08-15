# RANK_METHODOLOGY.md — E-016 Rank方法論

正本は `direction/EVAL_CREATOR_LED_GAME_PUBLISHER_2026-08.md` §5。本ファイルは5要素の適用結果（自然言語の理由）だけを持つ。固定Scoreの合成は行わない（Task Contract Phase 2）。

評価実施: 2026-08-15。`UNIVERSE.csv`（302件）をsegment別（Micro Gaming 196 / Parent-led Family 72 / Exploration 34）に3並列で評価し、本ファイルで統合した。委譲先はTask Contract指定のModel routing（上位選定はFable 5優先→Opus 4.8 fallback）に従いOpus 4.8を使用（`.claude/skills/model-dispatch/SKILL.md` の2026-08-14実測でdeep-worker/fableが月次上限により起動失敗することが判明済みのため、Human指定のfallbackへ直接進んだ）。

## 5要素

1. **Desire Fit** — 本人のゲームTasteが明確か。「こういうゲームが好き」「こんなの欲しい」という方向が読み取れるか。
2. **Distribution Power** — フォロワー総数より、最近の平均再生・配信同接・投稿頻度・Audience反応を優先する。
3. **Contactability** — 公開business email / management / contact form等、合法的・自然な営業経路があるか。
4. **Content Fit** — オリジナルゲームが動画・配信ネタになりやすいか（ホラー / 協力 / party / simulation / weird game / reaction game / viewer participation / challenge等との相性）。Family Creatorについては「家族が作りたいGameを実際に作る過程そのものがContentになるか」を含める。
5. **Decision Speed** — 巨大組織の承認が必要か、本人判断で試せそうか。

**重み付けの考え方**（3評価者共通）: 「Creator #2を最短で発見する」という目的から、**合法的contact経路が実在すること × 本人単独で決められること × ゲームTasteが既に言語化されていること** を最重視した。フォロワー総数が大きくても、contact経路が「チャンネル概要欄経由（未確認）」しかない行や、`audience_size`を含む大半の列がUNKNOWNの行は上位から除外している。

## データ品質メモ（Rank作業中に判明。Top30選定へ反映済み）

Rank評価中に、一部の行でCSV列がズレている（`recommended_contact_channel`/`contactability`/`target_audience_note`等の内容が隣接列にはみ出す）ことが判明した。Top30候補に入った行（FAMILY2-07/08、WEIRD-01）は`UNIVERSE.csv`を直接修正済み。Top30に入らなかった行（EXPLORE2-14〜18、SOCIAL-03〜14等）は未修正のまま残っているため、将来これらの行を機械集計に使う場合は元のagent生出力（`experiments/creator-universe-jp/LEDGER.md` の記録）で再確認すること。

---

## Micro Gaming（196件）Rank結果 — 上位25件の要旨

評価はSegment内契約で実施。全文の5要素コメントは評価担当agentの回答（本セッション記録）にあり、以下は上位者と順位理由の要旨。

| 順位 | creator_id | creator_name | 総合順位理由（要旨） |
|---|---|---|---|
| 1 | REACT-07 | 桜鳥ミーナ | Taste・実測Audience（12.5万・ギネス記録）・正規窓口（Sony Music VEE公式フォーム）・Content Fit（ホラー×耐久）の4要素が揃う唯一級。Decision Speedのみ弱い（事務所承認要） |
| 2 | STREAM-14 | アベレージ / Average Channel | 公開ビジネスメール保有（全196件中2件）＋ほぼ毎日配信＋無所属個人勢。Desire Fitは初回接触で聞き出せる項目として許容 |
| 3 | INDIE-03 | しろこりGames | `#しろこりインディー発掘`タグを自ら運用し新作発掘を宣言。公式お仕事窓口フォームあり。Audience規模のみ未確認 |
| 4 | VTAGENCY-15 | 緋笠トモシカ | 所属VOMS Project自体が「無限にゲーム実況が見たい」という欲求から生まれた組織。17万人、VOMS公式メールフォーム確認済み |
| 5 | FIGHT-03 | カワノ | 公開ビジネスメール保有、24万人・総再生3.8億回・ほぼ毎日配信。Content Fitが格ゲーに限定される点のみ弱い |
| 6 | SIM-01 | あめしこうR2 | 「2025年発売予定の農業＆生活シム9選」という自主制作動画＝本人の「次に遊びたいゲームリスト」が既に公開されている |
| 7 | NICONICO-02 | 石黒千尋 | 個人事務所「ちひらぼっ!」の**代表が本人**という、決裁構造が最速の稀有な行。週3回の定期配信 |
| 8 | RETRO-07 | 今更レトロクソゲー、バカゲー攻略解説 | X上で視聴者から動画リクエストを公募中＝外部提案を受け入れる導線を本人が既に運用 |
| 9 | OPENREC-03 | フルコン | 本職フリーランスエンジニア。「作る側の言葉が通じる」希少性で技術すり合わせコストが低い |
| 10 | WEIRD-01 | シーゴ／CgoChannel | 平均再生43.9万回/本（1047本）という本セグメント最強の実測値。contact経路の再確認は必要 |
| 11 | STREAM-15 | のらきゃっとチャンネル | Xで「お仕事依頼はDMまで」と公式明記。無所属個人勢で最速級だがTasteの手がかりが薄い |
| 12 | INDIE-06 | 奈々瀬ひかげ | ホラーゲーム開発者727NotHoundとの共同開発を既に発表済み＝制作参加の実績が既にある。Audience規模（約2000人）が唯一の弱点 |
| 13 | RETRO-06 | ファミっ子プレイ動画 retro gamer | 個人勢で正式な問い合わせフォームを保有する稀な行。1万本超のコレクター |
| 14 | WEIRD-06 | ゆるる | 週2回配信＋週3回投稿という明確な定期スケジュール。フリーゲーム専門で新作の受け皿になりやすい |
| 15 | FIGHT-05 | なるお | 無職から急成長した実体験を武器にする無所属個人勢。毎日配信で最速級 |
| 16 | STREAM-19 | 金美館通りの藤村さん | 有料電話相談等、複数の収益企画を自分で立てて回している実行力 |
| 17 | SIM-03 | スローライフしないジル | Stardew Valley一点特化。動画1本あたり平均19万回という効率の高さ。contact経路が未確認 |
| 18 | MOBILE-04 | しゃけかん【無課金にゃんこ大戦争】 | 開設1年で7万人という成長率の実測あり。Tasteが単一タイトルの縛りプレイに閉じている |

**次点で言及**: VTAGENCY-01〜14（774 inc.系13名、共通窓口`774.ai/contact-us`で一括打診の効率は高いが個人Tasteが読めずDecision Speedも遅い）／COOP2-04 KUNの50人クラフト（視聴者参加型企画そのものが主力フォーマットでContent Fit最高だが窓口未確認）／SOCIAL-01 ひろはす（本人が開発者で「代わりに作る」提案と構造的に競合するためCreator候補ではなく将来の制作パートナー候補）。

---

## Parent-led Family（72件）Rank結果 — 上位15件の要旨

母集団72件のうち、未成年本人のみが営業対象の3件（FAMILY-11/12/13）を除外。重複統合6組（同一家族が複数バッチで発見されたもの）を実施。

| 順位 | creator_id | creator_name | 総合順位理由（要旨） |
|---|---|---|---|
| 1 | FAMILY4-12 | ボードゲーム家族 | Distribution以外すべて最上位。「家族でルールを考案する過程」が既存フォーマットにそのまま乗る唯一級 |
| 2 | FAMILY4-13 | にちようかぞく（Sunday*family） | 手作り謎解き・脱出ゲームを自費で既に実行＝提案がその上位互換。運営者（パパゾン・ママゾン）が成人と明示 |
| 3 | FAMILY6-01 | だーしま動画チャンネル（サブch: だーしまGames） | 投稿頻度実測・親2名の接触経路・ゲーム専用サブchの3点が同時に確認できる |
| 4 | FAMILY6-10 | しょうやん男三兄弟 | Parent-led Family中で最も具体的にゲームタイトルが列挙されている（Ubongo等）。対決型フォーマットとの相性 |
| 5 | FAMILY6-02 | やまっち三兄弟／やまっちげーむず | 視聴者参加型企画の運営実績＋二層ch構造＋親側SNS二経路 |
| 6 | FAMILY-08 | カジサック KAJISAC | Content Fitと規模は突出（元芸人の企画力・専用サブch）だが吉本興業経由でDecision Speedが最遅 |
| 7 | FAMILY-06 | HIMAWARIちゃんねる | UUUM公式creatorページという最良級の正規導線。ゲーム実況の一次確認が課題 |
| 8 | FAMILY5-12 | ソラサクchannel【家族vlog】 | UUUM公式が「家族で安心して楽しめるゲーム実況者」と明言する事務所側一次情報あり |
| 9 | FAMILY6-06 | タクジ ボドゲ time. | 中量級ボドゲに明確な嗜好、夫婦2名のみで決裁が最速 |
| 10 | FAMILY-03 | なつめさんちのゲーム実況 | Tasteの明確さと決裁速度は最上位級。規模・contact経路が未確認 |
| 11 | FAMILY-04 | パパやるゲームズ | 父親本人のブログで保護者が運営者と本人の言葉で立証。「息子が企画担当」と役割明示 |
| 12 | FAMILY3-02 | ガッチマン | 妻（漫画家トラちん）の作品で家族の日常が既に作品化。ホラー特化16年の圧倒的実績 |
| 13 | FAMILY2-08 | はれママ キッズTV | 「しのはゲームが大好き」と特定の子の嗜好が公開情報で名指し。Kiii社代理店経由の正規導線 |
| 14 | FAMILY6-09 | かえでっチャンネル【親子でゲーム実況】 | 「親子でゲーム実況」のコンセプト純度が高く5歳から継続。規模・連絡先が未確認 |
| 15 | FAMILY-09 | しちみっこチャンネル | 「こどもとつくるパパのガンプラ」という親子共同制作の直接実績。chURL自体が未確認 |

**除外**: FAMILY-11/12/13（未成年本人アカウントのみ・営業対象なし）／FAMILY5-13/14 IORI・IORI GAME ROOM（唯一の接触経路が本人16歳のXアカウントで、保護者/management宛の独立経路が未確認のため準除外）／FAMILY5-04 じいちゃんねる（活動停止を示唆する本人投稿あり）／FAMILY5-11 薩摩人のMinecraft（チャンネル本体URL未特定）。

---

## Exploration（34件）Rank結果 — 上位10件の要旨

| 順位 | creator_id | creator_name | 総合順位理由（要旨） |
|---|---|---|---|
| 1 | EXPLORE-11 | けんぼー | 「誰かに刺さるゲームをプレイ」という選書哲学を公言。弱点がContactabilityのみの唯一級 |
| 2 | EXPLORE-03 | やさぐれゆむ | 34件中ただ一人、公開ビジネスメール保有。Distributionの鮮度（2019年時点）のみ課題 |
| 3 | EXPLORE-05 | ひろはす | 公式問い合わせフォームと即決可能性。ただし本人が開発者で「代わりに作る」提案と競合するリスク |
| 4 | EXPLORE-01 | Hytacka | 「世界一面白いアクションRPGを作る」と公言、Taste言語化度は34件トップ。既に自力開発中で提案が競合的に見えるリスクあり |
| 5 | EXPLORE-02 | コーマ | 「ゆる日本づくり」という独自テーマ＋「ほぼ毎日夜8時投稿」の頻度実測 |
| 6 | EXPLORE-09 | たぶやん | 「全1252本のファミコンソフト制覇」という期限・数値のある個人ミッションを公言 |
| 7 | EXPLORE-06 | 蛇足 | 34件中唯一、Distributionの一次実測（直近30日376時間50分配信）を持つ。Contactability未確認 |
| 8 | EXPLORE2-06 | りくお（りくおのへや） | 顎操作でApexをプレイ。探索枠の趣旨に最も忠実、Content Fitと即決性は最上位級。規模が完全に未測 |
| 9 | EXPLORE-10 | HAL99（The Game Gallery） | 1996年から30年近くボードゲーム一筋。ゲームメカニクスを言語化できる審美眼 |
| 10 | EXPLORE2-07 | Jeni（畠山駿也） | 顎コントローラーを自作しEVO Japan 2023参戦。Content Fitと社会的インパクトは最上位だが決裁が企業経由で最遅 |

**次点で言及**: EXPLORE-15 たいじ（Exploration最大規模だが競技文脈からオリジナルゲームへの橋が架けにくい）／EXPLORE-16 DOLCE（元KONAMI公式プロ、オリジナル音ゲーの制作費が現実的）／EXPLORE2-04 須田泰生（登録者急増中だが現役局アナの兼業で金銭を伴う個別案件は所属局規定に抵触する懸念）。

---

## 統合Top 30（3segment横断・最終選定）

3つのRank結果を、**Desire Fit・Contactability・Decision Speedが同時に揃う候補を優先**しつつ、Human Targeting Update（Micro Gaming主戦場・Family重視）を踏まえてバランスした。固定比率で機械的に配分してはいない——各segmentのRank順位を尊重し、根拠の薄い行（UNKNOWN過多）は規模が大きくても採用していない。

内訳: Micro Gaming 17 / Parent-led Family 10 / Exploration 3 = 30

| # | creator_id | creator_name | segment |
|---|---|---|---|
| 1 | REACT-07 | 桜鳥ミーナ | Micro Gaming |
| 2 | STREAM-14 | アベレージ / Average Channel | Micro Gaming |
| 3 | INDIE-03 | しろこりGames | Micro Gaming |
| 4 | VTAGENCY-15 | 緋笠トモシカ | Micro Gaming |
| 5 | FIGHT-03 | カワノ | Micro Gaming |
| 6 | SIM-01 | あめしこうR2 | Micro Gaming |
| 7 | NICONICO-02 | 石黒千尋 | Micro Gaming |
| 8 | RETRO-07 | 今更レトロクソゲー、バカゲー攻略解説 | Micro Gaming |
| 9 | OPENREC-03 | フルコン | Micro Gaming |
| 10 | WEIRD-01 | シーゴ／CgoChannel | Micro Gaming |
| 11 | STREAM-15 | のらきゃっとチャンネル | Micro Gaming |
| 12 | INDIE-06 | 奈々瀬ひかげ | Micro Gaming |
| 13 | RETRO-06 | ファミっ子プレイ動画 retro gamer | Micro Gaming |
| 14 | WEIRD-06 | ゆるる | Micro Gaming |
| 15 | FIGHT-05 | なるお | Micro Gaming |
| 16 | STREAM-19 | 金美館通りの藤村さん | Micro Gaming |
| 17 | SIM-03 | スローライフしないジル | Micro Gaming |
| 18 | FAMILY4-12 | ボードゲーム家族 | Parent-led Family |
| 19 | FAMILY4-13 | にちようかぞく（Sunday*family） | Parent-led Family |
| 20 | FAMILY6-01 | だーしま動画チャンネル | Parent-led Family |
| 21 | FAMILY6-10 | しょうやん男三兄弟 | Parent-led Family |
| 22 | FAMILY6-02 | やまっち三兄弟／やまっちげーむず | Parent-led Family |
| 23 | FAMILY-08 | カジサック KAJISAC | Parent-led Family |
| 24 | FAMILY-06 | HIMAWARIちゃんねる | Parent-led Family |
| 25 | FAMILY6-06 | タクジ ボドゲ time. | Parent-led Family |
| 26 | FAMILY-04 | パパやるゲームズ | Parent-led Family |
| 27 | FAMILY-03 | なつめさんちのゲーム実況 | Parent-led Family |
| 28 | EXPLORE-11 | けんぼー | Exploration |
| 29 | EXPLORE-03 | やさぐれゆむ | Exploration |
| 30 | EXPLORE2-06 | りくお（りくおのへや） | Exploration |

各人の深掘り・personalization hook・推奨Contact Route・初回メッセージ案は `TOP30_DOSSIERS.md` が持つ。
