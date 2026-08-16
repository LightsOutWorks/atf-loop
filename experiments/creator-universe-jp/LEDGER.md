# experiments/creator-universe-jp/LEDGER.md — E-016 台帳（正本）

- **Status**: 契約起草段階。`experiments/INDEX.md` E-016 = **PROPOSED**（PRのmergeで正式登録）。Stage Aの一次調査自体はD-015 Human Major Bet Commitに基づき着手済み（R0自律の範囲）。
- **契約（正本）**: `direction/EVAL_CREATOR_LED_GAME_PUBLISHER_2026-08.md` §5（E-016 Stage A / Stage B）。hypothesis / PASS / FAIL / VOID / STALE / budget_cap / Human時間上限 / rollback / KILL条件はすべて契約側が持つ。**本台帳は再掲しない**（記入欄と記録規律のみを持つ）。
- **Major Bet**: `DECISIONS.md` D-015（2026-08-15 Human Commit）。
- **作成**: 2026-08-15（契約の着手条件「収集開始前に列を確定する」の履行）。

---

## 記録規律（凡例）

1. **推測でcontact情報を埋めない。** `public_business_email` / `management_company` / `public_contact_form` 等は、公開ページ（公式サイト・プロフィール欄・チャンネル概要欄等）で実際に確認できた場合のみ記入する。確認できない場合は必ず `UNKNOWN`。
2. **Private emailや非公開個人情報を探索しない。** 探索対象は公開Web情報のみ（`CONSTRAINTS.md` Part I §5 Data Boundary）。
3. **evidence_urls / evidence_dateを必須とする。** 各Creator行の主要な定性判断（desire_signal・distinctive_taste・why_fit等）には、根拠となった公開URLと確認日を付す。根拠を示せない主観的判断は書かない。
4. **Family Creator行の追加規律**: 営業対象欄（`recommended_contact_channel` 等）は成人の親・保護者・management宛の経路のみを記入する。未成年本人のSNSアカウント・DM・非公開連絡先は探索・記載しない。`target_audience_note` 列（本Universe固有の追加列）に「対象Audienceが子供向けかどうかはEvidence未確認＝UNKNOWN」の場合は明記し、出演者の年齢構成から推測で埋めない。
5. **UNKNOWN既定**: 確認できない値はすべて `UNKNOWN`。推測・予定・会話を確定事実として書かない（`CONSTRAINTS.md` Part I §6）。
6. **フォロワー数だけで並べない。** Rankは `RANK_METHODOLOGY.md` の5要素（Desire Fit / Distribution Power / Contactability / Content Fit / Decision Speed）を自然言語の理由付きで用いる。固定Scoreの合成には使わない。
7. **営業拒否表示の記録**: プロフィール等に「営業DM不可」「PR外」等の明示がある場合は `contactability` 列に明記し、Stage Bで当該経路を使わない（契約§6）。

## 成果物の所在

| 成果物 | ファイル | 状態 |
|---|---|---|
| Universe（目安1000人。Micro Gaming ≈600 / Family ≈300 / Exploration ≈100） | `UNIVERSE.csv` | 作成中（バッチ収集・進捗は下記ログ） |
| Rank方法論・上位候補の自然言語理由 | `RANK_METHODOLOGY.md` | 作成中 |
| 上位30人の深掘り・personalization hook・推奨Contact Route・初回メッセージ案 | `TOP30_DOSSIERS.md` | **完了**（Opus 4.8委譲・本体で内容検証済み。2026-08-15） |
| Stage B観測ログ（送信後。Human Gate後にのみ記入開始） | `STAGE_B_OBSERVATION_LOG.csv` | 列のみ確定済み・記入は実送信後 |

## 送信前チェックリスト（Human向け。`TOP30_DOSSIERS.md`末尾の集計を転記）

実送信（Stage B・Human Gate）の前に、以下を個別に確認すること。**Claudeは調査・起草のみで、確認・送信は行っていない。**

1. **導線未確定4件** — SIM-03 / FAMILY-03 / FAMILY-04 / EXPLORE2-06。公開の問い合わせ導線（email/フォーム/DM）がCSV上で確認できていない。導線を特定するまで送信対象に含めない。
2. **事務所・窓口URL未確認2件** — SIM-01（Studio Coup）/ FAMILY-08（吉本興業）。所属は確認済みだが、企業向け問い合わせフォームの具体URLは未確認。公式サイトで窓口を特定してから送る。
3. **アカウント運用者の確認が必要2件** — FAMILY6-10 / FAMILY6-02。DM候補アカウントの運用者が保護者本人であることをプロフィール記載等で確認してから送る（未成年本人アカウントへ誤送しない）。
4. **経路の再確認1件** — WEIRD-01。Rank時点で「contact経路の再確認が必要」と判定済み。送信前にX等でDM開放・業務窓口の状態を再確認する。
5. **同一人物への複数経路同時送信はしない**（契約・元Task Contract共通の禁止事項）。`TOP30_DOSSIERS.md`が各人に指定した単一の推奨Contact Routeのみを使う。
6. **`〈送信者名〉`プレースホルダーの確定**は送信者自身のアイデンティティ使用であり、`CONSTRAINTS.md` §4のHuman Gate対象。Claudeは埋めていない。

## Universe収集バッチ進捗ログ（Human-confirmed実装作業のみを記録。予定は書かない）

**累計 302件**（Micro Gaming 196 / Parent-led Family 72 / Exploration 34。2026-08-15時点）。目安1000人にはまだ大きく届いていない。**WebSearch予算がセッション全体で共有される制約が判明**（1並列agentあたりではなくセッション合計200回）。並列度を上げるほど後発agentの取得可能量が減り、収集効率は逓減する。これはtoolingの制約であり「一次資料が存在しない」ことの証明ではない（`OS.md` HI-4 F9）。

| batch | 日付 | 対象カテゴリ | 収集件数（累計） | Notes |
|---|---|---|---|---|
| 4 | 2026-08-15 | Family追加2バッチ29／レトロ17／RPG18／格闘16／スマホゲーム9／Exploration追加18／協力・パーティ再々調査0(空振り) | 累計302（batch1-3の200＋本batch102） | 8並列agentのうち1件（パズル・カジュアルゲーム枠）はWebSearch予算が着手前に枯渇し**0件のまま正直に終了**（捏造なし）。RPG枠は前半8件が良質だが後半10件（ダンガンロンパ実況者）はジャンル確認のみでaudience_size等ほぼ全項目UNKNOWN——情報価値は低いがUNKNOWN既定を守った誠実な報告として記録。**この回で判明した重要な制約**: WebSearchツールの200回上限は並列agent1体あたりではなくセッション全体で共有されている。8並列を維持すると後発のagentほど予算が枯渇し、WebFetch頼みで収集効率が落ちる。次バッチ以降は並列数を下げるか、収集の優先順位（Family拡充を最優先）を絞ることを検討 |
| 1 | 2026-08-15 | Family（Parent-led Family／ゲーム実況中心） | 13 | 公開Web調査（R0自律）で実在確認できたゲーム実況系Family Creatorのみを収集。目安300件のうち一次バッチ。3件（FAMILY-11〜13）は出典が「子どもだけで配信」と分類しており、親/managementの公開連絡先が確認できなかったため`contactability`＝「未成年本人アカウントのみ確認・営業対象なし」で記録し営業対象から除外。セッションのWebSearch呼び出し上限（200/200）に到達したため本バッチはここで打ち切り。残り約287件は次バッチ以降に持ち越し |
| 3 | 2026-08-15 | Micro Gaming（協力・パーティ再調査16／リアクション・チャレンジ17／シミュレーション9／中小事務所VTuber17／Family3・4計18／ニコニコ・OPENREC・Instagram15／weird game12）＋ 重複除去 | 累計200（batch1+2の101＋本batch101、うち重複2件を除去後200） | 8並列agent（standard-worker相当）による第3バッチ。前バッチの教訓（フォロワー帯を1万〜15万に限定すると対象0件になりうる、桁区切りカンマがCSV列を破壊する）を反映し、対象レンジを1万〜30万人程度（一部80万人程度まで）へ拡大・桁区切りカンマの使用を避けるようagentへ指示した結果、フォーマット崩れはバッチ1（31/101行）からバッチ3（3/101行）へ大幅に減少。**バッチ間・バッチ内重複が多数発生**——各agentが独立に検索するため、同一Creatorが複数バッチで再発見される（例: れのれらTV・きりすけファミリー・HIMAWARIちゃんねる・天開司・たいじ・ヒラ・こーすけ・ドグマ風見・しろこりGames・LayerQ・Koutetsusteel等、計約20件）。マージ時にcreator_name完全一致で重複検出し、UNKNOWN数が少ない（＝情報が充実している）方を残して除去した。次バッチでは検索対象niche・除外済みCreator名リストを各agentへ事前共有し重複再発見を減らすことを推奨 |
| 2 | 2026-08-15 | Micro Gaming（ホラー6 / 協力・パーティ0 / インディー15 / Twitch・VTuber19 / X・TikTok15 / Exploration16）＋ Family（親子2バッチ目17） | 累計101（batch1の13＋本batch88） | 8並列agent（standard-worker相当・Sonnet系）による第2バッチ。**協力・パーティ枠（COOP-\*）は0件**——WebSearch予算（200/session）を発見段階で使い切り、対象条件（登録者1万〜15万人）を満たす候補を1件も確認できなかったため空で終了（捏造なし）。他7agentも同一制約（WebSearch 200/session上限・YouTube本体および登録者数分析サイト`yutura.net`/`noxinfluencer.com`/`userlocal.jp`/`socialblade.com`等への直接アクセスが403/402/bot検知でブロック）に当たったが、公式サイト・Steam・VTuber事務所ページ・まとめ記事・Twitchランキングサイト等の到達可能な一次情報源へ切り替えて実在確認済みの件のみ報告。**フォーマット上の欠陥と修復**: 一部agentのCSV出力が29列中1列を欠落（target_audience_note等を省略）または1列超過（フィールドの誤分割）していたため、31行に対し機械的な列数正規化（左側12列＝creator_id〜desire_signal固定・右側4列＝why_fit/personalization_hook/evidence_urls/evidence_date固定・中間13列を過不足に応じてUNKNOWN補完または隣接セル結合）を適用した。**この31行は中間列（watchability〜target_audience_noteのうち一部）のセル対応がagent出力の意味的境界と完全には一致しない可能性があり、Rank・Top30選定時に該当行のcontact系フィールドを使う場合は元のagent生出力（本セッションのtask-notification記録）で再確認すること**——creator_id/segment/creator_name/main_platform/profile_url/audience_size〜game_genres（左12列）とwhy_fit/personalization_hook/evidence_urls/evidence_date（右4列）は左右アンカー方式のため信頼できる |
| 到達性の観測（tooling制約。`OS.md` HI-4 F9により「一次資料が存在しない」とは記録しない） | 2026-08-15 | — | — | WebSearchツールはセッションあたり200回で予算上限に達する。YouTube本体の`/about`ページはbot検知(`/sorry/index`)でブロック。`yutura.net`・`noxinfluencer.com`・`userlocal.jp`・`tuber-town.com`・`playboard.co`・`socialblade.com`・`x.com`（一部402）へのWebFetchは403/453/503等で失敗することが複数agentで再現された。到達可能だった代替情報源: 公式サイト・Steamストア/コミュニティページ・VTuber事務所公式サイト・`ikioi-ranking.com`（Twitch同接ランキング）・`liverank.jp`（VTuber登録者ランキング）・`find-model.jp`（インフルエンサーマーケティング記事）・`harf-way.com`（インディーイベント記事）・Wikipedia日本語版・note.com |

## Stage B — 観測列定義（契約§5が正本。列名の確定のみここに複製）

`creator_id` / `channel` / `sent_at` / `delivered_if_known` / `reply`(Y/N) / `reply_at` / `positive_reply`(Y/N・根拠一言) / `conversation`(Y/N) / `meeting`(Y/N) / `desire_received`(本人の言葉・PII除去) / `reject_reason`

**Stage Bの記入はHumanが実送信した件のみ開始する。Claudeは記入しない・送信もしない。**
