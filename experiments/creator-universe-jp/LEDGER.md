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
| 上位30人の深掘り・personalization hook・推奨Contact Route・初回メッセージ案 | `TOP30_DOSSIERS.md` | Universe収集後に着手 |
| Stage B観測ログ（送信後。Human Gate後にのみ記入開始） | `STAGE_B_OBSERVATION_LOG.csv` | 列のみ確定済み・記入は実送信後 |

## Universe収集バッチ進捗ログ（Human-confirmed実装作業のみを記録。予定は書かない）

| batch | 日付 | 対象カテゴリ | 収集件数（累計） | Notes |
|---|---|---|---|---|
| — | — | — | 0 | 未開始 |

## Stage B — 観測列定義（契約§5が正本。列名の確定のみここに複製）

`creator_id` / `channel` / `sent_at` / `delivered_if_known` / `reply`(Y/N) / `reply_at` / `positive_reply`(Y/N・根拠一言) / `conversation`(Y/N) / `meeting`(Y/N) / `desire_received`(本人の言葉・PII除去) / `reject_reason`

**Stage Bの記入はHumanが実送信した件のみ開始する。Claudeは記入しない・送信もしない。**
