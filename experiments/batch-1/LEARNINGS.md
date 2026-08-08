# Batch 1 / Reality Loop 1 — Learning Extraction（MD-3）

Owner: Lane C（Desire→Reality Engine / MD-3）
制定: 2026-08-08（Batch 1返信ゼロ時点のPre-Signal抽出。返信回収後に第2回抽出を追記する）

Scope: E-005（Large-N Demand Intelligence）/ E-006（Batch 1 Discovery Contact）/ E-008（Environment Preflight）が2026-08-08までに生んだWorld Signalのうち、**次回Demand Scan・次回Contact選定に再利用価値がある学習だけ**を保持する。台帳の一次事実は `LEDGER.md`（Lane A、draft PR #33・未merge）、能力変更は `JOURNAL.md`、Direction変更は `DECISIONS.md` の管轄であり、本ファイルはそれらを代替しない。

運用規則（最小）:

1. 追記のみ。過去エントリを事後的に書き換えない（訂正は訂正として追記）。
2. 各エントリは FACT / INFERENCE / HYPOTHESIS を明示し、provenanceと再利用先を持つ。
3. 本ファイルはRuleを新設しない。ここは「次回のScan / 選定セッションが読むPrior」であり、Permanent Rule化には別途evidenceとD-recordを要する。
4. 既存の正本（`OS.md` Source of Truth Priority上位の全文書）および Lane A台帳 `LEDGER.md`（draft PR #33・未merge）に既にある内容は再掲しない（参照のみ）。

---

## 2026-08-08 — Loop 1 Pre-Signal抽出（返信0件時点）

### L1 — SENT ≠ REACHABLE。不達接触のNO_REPLYはVOIDであり、FAILとして学習しない

- FACT（Human-reported、Task Contract経由。repo内一次記録なし）: HNの新規アカウント3件がPUBLICLY_VISIBLEでない。可視化の機構的詳細（どちら側のアカウントか / shadowban・dead等の機構）は一次記録がなく `UNKNOWN`。
- INFERENCE: Batch 1のHN 3接触（`LEDGER.md` のC01 / C02 / C04に対応すると解される）は公開可視でない可能性が高く、実効到達数は最大7ではなく最大4。この3件が無返信のまま終わった場合、それは `VOID`（評価不能）であって `FAIL`（需要なし / 文面が悪い）ではない（`CONSTRAINTS.md` Part I §6「`VOID` を `FAIL` として学習しない」の適用）。
- 再利用先: 次回Contact選定の送信前チェックに「送信主体と対象スレッドの公開可視性」を含める。可視性が確認できない接触枠は消費前に減点する。到達未確認の無返信を様式・clusterの評価データに入れない。
- 要転記（Human Handoff）: 上記FACTは現状本ファイルにしか存在しない。Lane Aが `LEDGER.md` のC01 / C02 / C04行（last_signal欄）へ転記した時点で、本エントリのFACTは参照へ降格する。転記されない場合、台帳は将来この3件を `NO_REPLY_TIMEOUT` = FAIL として学習してしまう。
- 反復状況: 1プラットフォーム・3件のみの観測。HN固有の回避手順（アカウント熟成等）をSkill / Automation化しない。

### L2 — Sensorには観測母集団biasがある。Scan結果をscopeなしで「市場」と読まない

- FACT（Human-reported）: GitHub Issues SensorのNO-GO判定（E-008維持事項）の一因は、観測できる母集団が開発者・OSS利用者へ偏るsampling biasである。この理由はrepo内に一次記録がなかったため本エントリが記録する。
- INFERENCE: これはGitHub Issues固有ではなくSensor一般の性質である。Grok x_search（E-005 PASS）もX利用者biasを持つ。cluster分布はSensor母集団の分布であって市場分布ではない（`CURRENT_STATE.md` §3「市場全体を理解したとは主張しない」の運用形）。
- 関連（参照のみ・再掲しない）: Sensor到達性の `HARNESS_BLOCKED`（このharness・このegressから到達不可 ≠ 需要不存在・Evidence不存在）はE-008 = draft PR #31 `ops/ENV_PREFLIGHT_2026-08-08.md` §2 / §4 が一次記録。母集団bias（本エントリ）と到達性ブロック（E-008）は別種のfalse negativeであり、次回Scanのsensor選定は両方と照合する。
- 再利用先: 次回Demand Scanの事前登録に「sensor / 観測できる母集団 / 既知bias / 到達性分類」を各1行残し、cluster間比較の結論にsensor scopeを必ず付す。

### L3 — Large-N探索費用は律速ではない（仮説）。希少資源はHuman接触枠

- FACT（Human-reported、Task Contract経由）: 2026-08-08時点のSensor探索費用は累計$4台で、接触候補20件超を得た（E-005単体の費用・query数・候補数の正本は `CURRENT_STATE.md` §3 / `experiments/INDEX.md` E-005。ここへ再掲しない）。
- INFERENCE: 上記から候補獲得単価は数円〜数十円のオーダーであり、接触枠（Batch 1で20枠・各枠にHuman Gateを要する）の希少性と桁が違う。
- HYPOTHESIS: 律速はSensor費用ではなくHuman接触枠と返信回収時間である。よって次回Scanで最適化すべきは「Sensor費用の節約」ではなく「接触1枠あたりの候補品質」。Large-N側のquery追加は安価な選択肢として常に検討してよい（Budget capの内側で）。
- 検証: Loop 2でSensor探索費用と接触枠消費・Human判断時間の実測比を再確認する。$値は単一構成中心の実測であり、恒久単価としてhardcodeしない。

### L4 — 小N規律。Batch 1は存在証明であり、率の推定・様式比較の検定ではない

- FACT（Human-reported。正本: `CURRENT_STATE.md` §2 / `LEDGER.md` 2026-08-08時点）: 送信7件・返信0件・目標20件。
- INFERENCE（Human営業知見「少数接触では検出力不足」と整合）: L1を適用すると実効到達は最大4。このNではmessage_style（Baseline vs HUMAN_SHORT）・cluster・freshness帯の優劣を統計的に判定できない。Batch 1の成功条件は「Genuine Painを持つ人との会話が1本以上成立するか」の存在証明と定性学習である。
- 再利用先: 次回Loopで「n件中0返信だからcluster Xを廃止」のような率ベースの昇格・降格をBatch 1データ単独で行わない。KILLは候補単位の質的evidence（LEDGER記録）による。

### L5 — 次回Demand Rankingの候補次元（定性checklist。scoreにしない）

- HYPOTHESIS: 次回Demand Scanの候補選定で、以下を**定性checklist**として使うと接触1枠あたりの品質が上がる。
  - Freshness（正本: `CURRENT_STATE.md` §2の既存ranking。ここへ再掲しない）
  - Specificity（具体的状況・具体的困りごとが本文にあるか）
  - First-party（本人の一次的困りごとか、伝聞・一般論か）
  - Unresolved（既に解決済み・自己解決報告が付いていないか）
  - Contact Naturalness（第三者が返信して自然な場・文脈か）
  - Reachability / Public Visibility（L1。相手と場が公開可視で、返信が届く構造か）
- 制約: 現在のN（返信0件）では加重score・機械学習モデル・複雑なランキング実装を作らない。数値化の検討はOS §13のsufficient world feedback（閾値はLayer2）に従い、実返信データが揃ってから行う。
- 将来次元: Historical World Signal（過去Loopの実返信実績）は現在データ0件のためchecklistへ入れない。実返信データが存在した時点で、第2回抽出で追加を検討する。
- 検証方法: Batch 1返信回収後、返信あり / なしとchecklist各項目の対応を定性確認する。ただしL4の小N規律により、このNでの識別力欠如を理由とした項目削除は行わない。削除してよいのは「記録不能・運用不能と判明した項目」のみで、識別力に基づく削除は事前登録した最小返信数が揃ってから行う（それまでは降格候補として定性理由を記録するに留める。項目を足すより先に削る方針は維持）。

---

## Rejected Generalizations（2026-08-08 — 意図的に昇格させなかった一般化）

次回セッションが同じ一般化を再提案する場合は、新しいevidenceを要する。

1. 「HUMAN_SHORTはBaselineより優れる」— 返信0件。様式変更は決定（`CURRENT_STATE.md` §2）であって検証済み学習ではない。
2. 「Freshness閾値（<24h / <48h / <72h）は検証済み」— 事前priorにすぎない。返信データによる検証前に硬直化しない。
3. 「GitHub Issuesは恒久的に無価値なSensor」— NO-GOは現Mission・現harness下の判定。bias記録（L2）であって永久追放ではない。
4. 「Grok x_searchが標準Sensor」— PASS 1回。Route is not Identity（`DESIRES.md` §6）。
5. 「個別Solve → Pattern → Productization」の順序仮説の文書化 — Batch 1にSolve実績0件でWorld Signal由来でない。premature productizationの抑止は既存正本（`ROADMAP.md` §0 / `LEDGER.md` 運用規則3）が既に持つため、新規記録は重複と判断した。Solve実完走が発生した時点で第2回抽出が再評価する。

---

## 次回Loop（Loop 2）の観測

1. L1 / L3 / L4 / L5 の各「再利用先」「検証」をそのまま観測項目とする（ここへ重複列挙しない）。
2. 接触1件あたりのHuman判断回数（MD-3 Human Handoff逓減のWorld Signal — `DESIRES.md` MD-3）: Loop 1のbaselineは `UNKNOWN`（未計測）。Loop 2で計測を開始し、Loop間比較はLoop 3から行う。

---

## 2026-08-08 — 訂正 1（Human Reality同期。対象: L1 / L4 / L5）

Provenance: 2026-08-08 Human裁定（Lane C Task返信）。運用規則1に従い上記エントリ本文は書き換えない。本訂正が対象箇所に優先する。

### C-1 — L1のFACT / INFERENCEをHuman実測で確定

- FACT（Human実測）: `LEDGER.md` のC01 / C02 / C04（HN 3件）は **SENT_BUT_NOT_PUBLICLY_VISIBLE**。L1初稿の「対応すると解される」というINFERENCEは実測で確定した。機構的詳細は引き続き `UNKNOWN`。
- 分類（Human裁定）: この3件は **Delivery Layer failure** として扱い、`NO_REPLY_TIMEOUT` の分母に含めない。`VOID` ≠ `FAIL` の適用（L1）は不変。
- L1の要転記（Human Handoff）は未完了のまま継続。Lane Aによる `LEDGER.md` C01 / C02 / C04行への転記は本status（SENT_BUT_NOT_PUBLICLY_VISIBLE / Delivery Layer failure）で行う。

### C-2 — 「実効≤4・返信0件」を現在状態として読まない（stale-N固定の解除）

- FACT（Human-reported 2026-08-08）: Batch 1はその後Human Contactが追加されており、実効母数は≤4ではない。L1 / L4の「実効到達は最大4」「送信7件・返信0件」および§見出しの「返信0件時点」は、いずれも**2026-08-08抽出時点のsnapshot**であり、現在状態でも恒久パラメータでもない（現在値の正本は `LEDGER.md` / `CURRENT_STATE.md`）。
- Durable Learningの確定形（特定の古いNに依存させない）: **初期の極小N観測だけから率ベースのcluster / message_style判断をしない。十分なReachable母数とWorld Signalが蓄積するまで、HUMAN_SHORT優位・Freshness効果等を確定しない。** L4のINFERENCE、L5制約の「現在のN（返信0件）」、L5検証方法の「このN」は、すべてこの形で読む。分母はREACHABLE確認済み接触で数える（C-1）。
