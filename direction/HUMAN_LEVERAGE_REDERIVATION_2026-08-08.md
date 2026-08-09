# Human Leverage Rederivation — 2026-08-08

Status: **DIRECTION DESIGN PROPOSAL — not canonical, not adopted**（採択はヒロのmerge = Human Gate。`CONSTRAINTS.md` Part I §4）

分析対象日: 2026-08-08 / 起草完了: 2026-08-09（利用制限による中断を挟み同一workflowを再開して完成）

- Task Contract: HUMAN LEVERAGE REDERIVATION（2026-08-08）。North Star達成におけるHuman（ヒロ）の最適介在位置をゼロベースで再導出する。現在の役割分担を正しい前提としない。**実装・Automation作成は本Taskの禁止事項であり、本文書はDirection Designのみを含む。**
- 本文書はAI-authoredである。§J-4の境界規定は本文書自身に適用される: ここに書かれた提案は、ヒロが採択するまで何も変更しない。
- Evidence scope: default branch `f40155e` 時点のCanonical文書群（`CONSTRAINTS.md` / `OS.md` / `DESIRES.md` / `CURRENT_STATE.md` / `DECISIONS.md` / `ROADMAP.md` / `experiments/INDEX.md` / `experiments/batch-1/LEDGER.md`・`LEARNINGS.md`）、2026-08-08のgit log実測（merge 4件・commit時刻）、GitHub Actions実測（`factory.yml` 本日不発火・最終run 2026-08-04）、open PR実測（#24 / #30 / #31 / #34）。確認できない値は `UNKNOWN`。
- Method: 独立3レンズ（Maximum-Delegation / Accident-Conservative / Reality-Fit）による13作業の並行分類 + 4本の敵対検討（Human-up-the-loop攻撃 / Desire-only終着攻撃 / Human Contact内在価値攻撃 / AI上流進出境界設計）。レンズ間不一致は不一致として明示する。
- 小N規律（`LEARNINGS.md` L4 / C-2）は本分析自身に適用される: 本文書の根拠は実質1日分の観測・返信0件であり、率ベースの断定は行わない。分類は「現時点の証拠での判定 + named gate」であり恒久ルールではない。

---

## A. Current Human Work Map（2026-08-08にヒロが実際に行った作業と分類）

分類語彙: `HUMAN_MUST`（法的/権限上・定義上Human必須）/ `HUMAN_CURRENTLY_REQUIRED`（現行制約・能力欠損・未検証Tasteにより現在Human。縮小予定）/ `AI_CAN_TAKE_NOW`（現行tool・現行Gateの内側で今日から委譲可）/ `AI_CAN_TAKE_LATER`（named gate通過後に委譲）/ `SHOULD_DISAPPEAR`（仕事自体が消えるべき。誰もやらない）。

多くの作業は単一バケツに収まらず、**判断のcommit部分と周辺作業（準備・記録・監視・中継）で分類が割れる**。splitはそれを示す。

| # | 今日のHuman作業 | Evidence | 判定 | Split |
|---|---|---|---|---|
| 1 | Desire/Direction判断（D-001採択・North Star/Portfolio制定・HUMAN_SHORT様式決定・裁定C-1/C-2） | `DECISIONS.md` D-001 Authority欄; `LEARNINGS.md` 訂正1 | **HUMAN_MUST**（核） | North Star/D-001採択=MUST。裁定C-1/C-2のrule適用部分=AI_CAN_TAKE_NOW（CONSTRAINTS §6の成文規則適用。Lane CがL1で先に同一INFERENCEを導出済み—Humanの真の寄与はaccessによるFACT確定）。HUMAN_SHORT様式=item 12へ |
| 2 | Claudeへの指示（6並行セッションへのTask Contract発行: #31/#32/#33/#34/#35+本セッション） | 本日のPR群・branch群 | **AI_CAN_TAKE_NOW** | Direction kernel（「今日は何を証明するか」の1行）=HUMAN。契約起草・Lane分割・dispatch・進捗集約=AI（orchestrator。現harnessにsession生成/通信toolは実在。初回はcanary扱い） |
| 3 | AI出力監査（merge前レビュー・独立verifier起用） | commit `0f9b4fd`（verifier 5/5 PASS） | **AI_CAN_TAKE_NOW**（実体）※ | 監査実体・verifier起用=AI（ROADMAP §2は「独立」を要求するが「人間」を要求しない）。merge採否=item 7。※レンズ不一致あり—下記A-1 |
| 4 | X候補目視（15件中13件をHuman手動sourcing。Demand採番はLN-58/62のみ） | `LEDGER.md` 凡例 | **AI_CAN_TAKE_NOW** | sourcing+L5 checklist適用+ranked shortlist=AI（E-005で$1.815/75行のSensor PASS済み）。送信前のContact Naturalness veto=HUMAN_CURRENTLY_REQUIRED（§13で退役予定） |
| 5 | HUMAN_SHORT最終編集（送信文面。実文面はrepo未回収=永久UNKNOWN） | `LEDGER.md` 凡例・運用規則2 | **HUMAN_CURRENTLY_REQUIRED** | 起草+送信前verbatim記録=AI_CAN_TAKE_NOW（運用規則2が既にAIの仕事と規定）。最終taste編集=HUMAN→AI_CAN_TAKE_LATER（gate: G-3）。**文面が記録されないこと自体=SHOULD_DISAPPEAR** |
| 6 | 第三者への手動送信（20件: HN3/SE1/Bluesky1/X15） | `CONSTRAINTS.md` §4 R3; `LEDGER.md` | **HUMAN_CURRENTLY_REQUIRED** | 送信commit（どの文面を誰に、誰のidentityで）=Gate本体。機械的送信行為=AI_CAN_TAKE_LATER（gate: G-2）。送信前可視性チェック（非X）・送信直後記録=AI_CAN_TAKE_NOW |
| 7 | GitHub merge（本日4件: #32 11:06 / #35 12:10 / #36 12:22 / #33 12:52 UTC） | git log | **HUMAN_CURRENTLY_REQUIRED** | Direction文書のmerge（#32型）=**HUMAN_MUST**（mergeが採択権限の行使そのもの—D-001「採択はヒロの本PR merge」）。定型append-only記録のmerge=AI_CAN_TAKE_LATER（gate: G-4）。同日4回の逐次ceremony→1回のbatch承認へ圧縮可 |
| 8 | workflow disable（`factory.yml` schedule本日不発火。最終run 2026-08-04。無効化操作の実行はHuman報告事項—原因の機構はUNKNOWN） | Actions実測; D-001保留項 | **SHOULD_DISAPPEAR**（残渣として）※ | 停止判断自体=D-001で決定済み（Human、完了）。単独UI操作+「毎週発火を見張る」業務=SHOULD_DISAPPEAR—AIがschedule削除のdraft PR（R2）を起草し既存merge gateに畳み込めば、main上のtrigger残存とUI状態の乖離も恒久解消。※レンズ不一致あり—下記A-1 |
| 9 | API key/payment（xAI $5購入・auto top-up OFF・Claude Max・ChatGPT 8/13予定） | `CURRENT_STATE.md` §5 | **HUMAN_MUST** | 支払いcommit・契約・Budget宣言=MUST（法的名義人 + CONSTRAINTS §2「AIはBudget Capを自己変更してはならない」）。プラン比較・支出→Unknown削減の因果記録・残高追跡=AI_CAN_TAKE_NOW。auto top-up OFFは「構造で制御を代替」の模範設計 |
| 10 | World Signal観測（HN VOID発見・C09/C14画像確認・X15件送信確認・replies=0） | `LEDGER.md`; E-008 | **AI_CAN_TAKE_LATER**（X）/ **AI_CAN_TAKE_NOW**（非X） | SE/Bluesky/HN可視性=AI_CAN_TAKE_NOW（R0。LEDGERのnext_action欄自身が「SE APIはR0で確認可」「読取系R0可」と規定済み）。X reply監視=AI_CAN_TAKE_LATER（gate: G-1）。画像による再確認労働=SHOULD_DISAPPEAR（記録喪失の下流被害） |
| 11 | Agent間情報転送（Lane C所見→Lane A転記中継・full syncのTask返信投入・Overrideの複数セッション再伝達） | `LEARNINGS.md` L1「要転記(Human Handoff)」; `LEDGER.md` Conversation Log | **SHOULD_DISAPPEAR** | AI発contentのAI間中継=消滅させる（repoがcanonical shared bus。session間通信toolも現存）。Human-only観測の一次注入=HUMAN_CURRENTLY_REQUIRED（item 10のgapが閉じるまで。ただし**1回・1箇所**に構造化し、セッションごとの再伝達を不要にする） |
| 12 | ブランド/Taste判断（HUMAN_SHORT定義・Contact Naturalness・本人identity発信） | `LEARNINGS.md` L5・Rejected Gen. 1-2 | **HUMAN_MUST**（identity）/ **HUMAN_CURRENTLY_REQUIRED**（taste） | 誰のidentityで世界に接触するか=MUST（本人の名前・評判へのauthorityは定義上本人。CONSTRAINTS §4 identity gate）。様式・Naturalness=返信0件の未検証prior。§13により自動退役予約済み（gate: G-5） |
| 13 | Stop判断（Lane A定期self check-in停止・送信枠消化宣言→wait-for-World-Signal） | `LEDGER.md` Conversation Log最終行 | **AI_CAN_TAKE_NOW**（今日の実例） | 今日の2判断はいずれもcanonical stateからの決定論的導出（SENT=20≥20は算術。「読めないsignalをpollしない」はE-008+OS §18から機械的に従う）。※Mission級のStop/Kill（route HOLD・実験中止・撤退）はBoundaryでありHUMAN_MUST—今日の実例はそれに該当しない |

### A-1. レンズ間不一致（2項目。不一致自体が情報）

- **item 3（AI出力監査）**: Accident-Conservativeレンズのみ HUMAN_CURRENTLY_REQUIRED — 「今日AI記録は実際に間違っていた（SENT=7のまま74分乖離）」を根拠にHuman最終監査を正当とした。他2レンズは「乖離の原因はhallucinationではなくHuman-onlyデータの未着」でありHuman line reviewの追加検出力は未実証、とした。**統合判定**: 監査実体はAI（独立verifier）へ。Human line reviewは縮小gate付きspot-checkとして残す（gate: verifier単独で欠陥ゼロのmerge実績N回。Nは事前登録）。
- **item 8（workflow disable）**: HUMAN_CURRENTLY_REQUIRED（gate拘束）/ AI_CAN_TAKE_NOW（PR起草）/ SHOULD_DISAPPEAR（単独UI操作という形態自体）で3分裂。**統合判定**: 判断は完了済み・残渣はSHOULD_DISAPPEAR。AIがtrigger削除PRを起草し（R2）、既存merge gate 1クリックで恒久解消するのが正しい形。

---

## B. Waste（今日の純粋な浪費。3レンズ完全収束）

1. **Human-as-message-bus**: Lane C所見のLane A転記中継、full syncのTask返信投入、同一Overrideの複数セッション再伝達。中継されたbyteの全てがAIセッション起源またはitem 10の機械的観測であり、判断内容ゼロ。中継latencyはそのままFAIL誤学習リスクの滞留時間だった（L1自身が「転記されない場合、台帳は将来この3件をFAILとして学習してしまう」と警告し、訂正1時点でも転記未完了）。repoがcanonical shared busである設計は既に存在し、使われなかった。
2. **記録喪失の下流補償労働**: Demand-scanセッション成果物がrepoに一度も着地せず（E-005「repo内raw artifactなし」）、cluster/文面/freshnessが**永久UNKNOWN**化。その結果ヒロが15件のX URLを手で再供給し、C09/C14を画像で再確認し、HN VOIDを目視で発見する羽目になった。観測自体ではなく「非計装接触+成果物未着地が生んだ再作業」がwaste。**今日の唯一の実データ破損は全てHuman-only経路の非記録が原因であり、AI側はUNKNOWN規律を守った**（Accident-Conservativeレンズの最大発見）。
3. **PASS済みSensorの人力重複実行**: X候補15件中13件をHumanが手動sourcing。E-005が$1.815で75行/候補生成をPASSした当日に、L3が「希少資源」と特定した当のHuman時間で、最も安価に機械化済みの工程を実行した。手動経路は同時にprovenanceを破壊した（採番なし→学習不能）。
4. （次点）独立verifier 5/5 PASS済みdoc PRの**4回逐次merge ceremony**（11:06〜12:52 UTC）、および**D-001で決定済みの停止の単独UI実行**。

---

## C. Human Comparative Advantage（今日の証拠で実在したもの）

1. **Platform identity capital**（durable・身体付随）: HN VOID（3/20接触が新規アカウント不可視で無効化）は、account age/karma/実名brandが実在のdelivery-layer資産であることを実証した。REACHABLE 17件は全てヒロが構築したidentityの上を通った。この資産はAIが保有できない。**ただしL4小N規律: N=3・1プラットフォームの観測であり、「distributionはヒロの常駐を要する」への一般化は禁止**。
2. **独立したReality接触からのDesire形成**: 本repoで最も重要なDesire成果物（`DESIRES.md` 自体）は、ヒロの直接接触の1日（D-001 Authority = Current State Override）から生まれた。MD-2はヒロがdelivery layerの故障を自分で見るまでMajor Desireとして存在しなかった。
3. **Reality較正済みの裁定**: C-1/C-2は「評価しない」はずのHumanが行った評価行為であり、かつ正しかった。ただし分解すると: 裁定のrule部分はAI導出可能（実際Lane Cが先に導出）、Humanの固有寄与は**access**（X/HNを読める）と**確定authority**だった。
4. **営業知見という系外prior**: L4の「少数接触では検出力不足」はFactory外の世界接触で獲得された知見の注入。
5. **法的人格**: 支払い・契約・アカウント名義。
6. （消去法）**現在唯一の帰還チャネル**: X読取HARNESS_BLOCKEDによる。これは人間性の優位ではなく**買える配管ギャップ**であり、Dに移animしうる（Reality-Fitレンズ結論: 今日の3件のHuman訂正のうち、durableなHuman判断優位を示すものはゼロ。全てaccess gapか送信主体の自己報告に還元される）。

## D. AI Comparative Advantage（今日の証拠で実在したもの）

1. **Large-N感知**: $1.815 / 48+5 queries / 75行 / Genuine Need≈60（E-005 PASS）。候補獲得単価は円オーダー。
2. **無損失記録・provenance**: AI経由の作業は採番・スコア・経路が残る。Human経由は文面・時刻・clusterが永久UNKNOWNになった。North Star（World Signalから自己改善）の前提条件はAI側にある。
3. **並行性**: 本日6セッションが並行稼働。Humanは直列でしか動けず、並行させるとbus役が発生した（B-1）。
4. **規則適用・導出**: VOID≠FAIL（CONSTRAINTS §6）の適用をLane Cは裁定前に自力で正しく導出した。NO_ACTION routing結論（CURRENT_STATE §8）もAI runの産物。
5. **独立検証**: verifier 5/5 PASS（`0f9b4fd`）はAI-to-AIで完結した監査実体。
6. **疲れない監視**: R0読取はコスト実質ゼロで反復可能（現にLEDGERが機械監視可能と自己宣言している）。

---

## E. Target Human Position（目標介在位置）

> **Human = Desire + Boundary + 主権的に選んだReality Contact + （証拠で縮小する）Gate commits。**
> **ゼロへ収束させる変数は「loopあたりの義務的Human handoff数」であり、「Humanの世界接触回数」ではない。**

今日の作業は3クラスに分解され、扱いが異なる:

| クラス | 今日の実例 | 目標 |
|---|---|---|
| **Toil**（義務的・判断内容なし） | bus中継・転記・再確認・見張り・ceremony | **積極的に消す**（→F） |
| **Gate acts**（権限のcommit行為） | 送信クリック・mergeクリック・支払い・disable | **証拠で1本ずつ細くする**（→G。OS §8「制約は能力契約」） |
| **Contact / Taste / Arbitration** | 送信文面の声・Naturalness・C-1型裁定・世界との会話 | **退役スケジュールに載せない。** §13のchannel別gateでのみ動く（→G-5）。一部はH（絶対に残す）へ昇格 |

設計原則（敵対検討の3判定から）:

1. **役割の再定義: executor → instrumented sensor + arbiter。** ヒロのReality接触は続く。ただし全ての接触（送信文面verbatim・URL・timestamp）は接触の瞬間に機械捕捉可能な形で残す。今日の文面永久UNKNOWNはこのanti-patternの実測コストであり、二度目は許容しない。
2. **§13の退役はchannel単位・機能単位でのみ発火させる。** global退役（「十分なfeedbackが来たからHuman評価全部引退」）は不可。各channelの後継能力がBenchmark→Canary→Independent Verification（ROADMAP §3）を通過した順にのみ、Humanはそのchannelから抜ける。今日の実測（AI-only記録の現実乖離半減期15〜74分、帰還経路のAIカバレッジ0%）は、実証前に抜ければシステムが実際に盲目になることを示す。
3. **FactoryはHumanの唯一の世界窓になってはならない。** Desireの品質はHumanの独立したReality接触に依存する（D-001自体がその証拠）。L2のsensor bias + Factory媒介のみの世界像は、評価基準の設定者がFactory自身の偏った要約で世界を見る閉ループ（§12 No Teacherが禁じるべき構造）を作る。ヒロが選んで行う低頻度・高品質の世界接触は、除去対象のlaborではなく**Desire機能の一部**である。
4. **MD-1の語法を正とする**: ゼロにするのは「日常運用**労働**」であって世界**接触**ではない。

---

## F. 今日から消せるHuman Work（現行Gate・現行toolの内側。build不要）

各行は「委譲先セッションへの指示1行」で開始できる。Automation構築は不要かつ本Task外。

1. **Agent間courier廃止**: AI発contentのlane間中継はrepo（merged main）とsession間通信で完結させる。ヒロの現実観測の注入は**LEDGERへの1回のみ**とし、複数セッションへの再伝達を廃止。
2. **非X経路のreply/可視性監視**: C09（SE API）・C14（Bluesky公開読取）・HN 3件の可視性再確認をAIのR0定型チェックへ（LEDGER next_action欄が既に規定済みの委譲）。
3. **X候補sourcing/pre-ranking**: 次バッチ候補はE-005 Sensor + L5 checklistのAI適用でranked shortlist化。ヒロは目視sourcingをやめ、shortlistへのNaturalness vetoのみ。
4. **Task Contract起草・dispatch**: ヒロはDirection kernel 1行。orchestratorセッションが契約群を起草・発行・進捗集約（初回はcanary扱い）。
5. **監査実体**: 独立verifier起用をdefault policy化し、ヒロはverifier verdictを見てmerge判断のみ。同日複数PRは1回のbatch承認へ。
6. **運用的Stop/cadence判断**: SENT枠・poll停止類はAIが導出し記録（Mission級Stop/KillはHのまま）。
7. **送信文面のverbatim事前記録**: AIが最終文面をLEDGER行として確定→ヒロは無改変送信（編集したら差分を記録）。文面UNKNOWNを発生源で根絶。
8. **workflow disable残渣の恒久解消**: schedule trigger削除のdraft PRをAIが起草（R2）、既存merge gateで採択。「毎週見張る」業務を仕事ごと消す。

## G. 将来消すHuman Work（named gate付き。gateなしの委譲は行わない）

| # | Human Work | Named gate（事前登録すべき退役条件） |
|---|---|---|
| G-1 | X reply監視（Human唯一の帰還チャネル、17枠中15枠） | 購入済みxAI credit内でのx_search reply読取canary 1本がPASS + Human中継との並走一致Nサイクル（E-005でX検索readはPASS済み。費用は円オーダー、新規支払いGate不要） |
| G-2 | 機械的送信行為（クリック） | 送達自動検証capability（送信後可視性のAI確認）+ platform規約適合route + CONSTRAINTS §4改定のD-record。**identityはヒロのまま**（送信主体の委譲であってidentityの委譲ではない） |
| G-3 | HUMAN_SHORT最終編集 | 事前登録した最小返信N（REACHABLE分母、C-1規律）で、AI起草文とHuman編集文の成績比較が可能になった時点。それまではHuman編集deltaを毎回記録し、比較材料を蓄積する（記録しなければこのgateは永遠に開かない） |
| G-4 | 定型append-only記録PRのmerge | 独立verifier + 決定論check付きで欠陥ゼロmerge実績N回 → 範囲限定（LEDGER/LEARNINGS append-onlyのみ。canonical/Direction文書は対象外）のauto-merge D-record |
| G-5 | 様式・Naturalness taste veto | §13のchannel別sufficient world feedback閾値（Layer2で事前登録。L5検証方法と同一の設計）。閾値到達で自動退役—「退役に人間の判断を挟まない」 |

共通規則: 委譲は1変数ずつ（ROADMAP §3「一度に複数の未知変数を変えない」）。gateの事前登録を怠ることだけが真の教義違反である。

## H. 絶対に残すHuman Work

1. **Desire**（North Star・Major Desire・「今日は何を証明するか」のkernel）— 定義上、機関への入力そのもの。
2. **Boundary**: Budget宣言・Hard Boundary・Mission級Stop/Kill判断。CONSTRAINTS §2の自己変更禁止は恒久。
3. **支払い・契約・credentialのcommit** — 法的人格に帰属。低頻度・単純なまま残すのが正しい（ROADMAP §3。自動化はPremature Automation）。
4. **Identity決定**: 誰の名前・評判で世界に接触するか。ヒロのplatform identity capitalはFactoryの（現在唯一の）distribution資産であり、毀損の被害者は定義上本人。
5. **Direction変更の採択権限**: OS/DESIRES/CONSTRAINTS/DECISIONS級のmerge。この文脈ではmergeクリックはceremonyではなく**統治行為そのもの**。
6. **独立した世界窓の維持**: Factory媒介ではないReality接触を、ヒロが主権的に選んで保持する（E-3）。これは義務労働ではなくDesire品質の入力であり、「効率化で消される」対象から明示的に除外する。

---

## I. Next Smallest Delegation（次の最小委譲）

> **C09（Software Recommendations SE — SE API）と C14（Bluesky公開読取）のreply監視、および C01/C02/C04（HN）の可視性再確認を、AIセッションの定型R0チェックとして委譲する。検出時のみLEDGERへappend-onlyのdraft PR。**

3レンズ全てが独立に同一の委譲を最小と判定した。最小である理由:

1. **Gate横断ゼロ**: 読取はR0=完全autonomous（CONSTRAINTS §3）。権限・許可・Gate改定を一切要しない。
2. **支出ゼロ・build不要**: LEDGERのnext_action欄自身が「SE APIはR0で確認可」「読取系R0可」と実行可能性を宣言済み。cron等の先行自動化も不要（Premature Automation禁止に抵触しない—セッション内の定型チェックで足りる）。
3. **完全可逆・事故率ゼロ**: 最悪ケースは無駄な読取。誤検出はVOID/UNKNOWN規律（§6）で吸収。
4. **現在のbottleneckを直撃**: CURRENT_STATE §7の最重要未証明区間はWorld Signal回収であり、Humanが唯一の帰還チャネルである接触が17→15件に減る。
5. **MD-3の計測が始まる**: 「接触1件あたりHuman判断回数」（LEARNINGS 次回Loop観測2。Loop 1 baseline=UNKNOWN）に最初の実測点を与える。

**2番手**（この直後に置く）: 既存$5 credit内でのx_search reply読取canary 1本（G-1のgateを開く実験。円オーダー・R0・新規支払いGate不要）。PASSすれば残り15枠のHuman観測独占が既保有能力に畳み込まれる。

## J. Verdict

### J-1. 「Human-up-the-loop」という思想自体は正しいか

**方向として正しい。ただしladder（一方向の引き上げ）としてのspecificationが誤っている。** 敵対検討（攻撃側steelman）は反証に失敗した—「Humanが唯一のセンサー」証拠のほぼ全てが、買える配管ギャップ（HARNESS_BLOCKED）と非計装接触の帰結に還元され、同日AI自身が$1.815でXの現実75行を機械読取している。しかし攻撃は本物を1つ掴んだ: **今日、誤り訂正能力の100%（VOID発見・full sync・stale-N解除）がReality接触点に集中し、主要帰還経路のAIカバレッジは0%だった。** よって正しい執行形は: 終着点（§4）は維持しつつ、**退役はchannel単位で、各機能の後継が実証された順にのみ**。Humanの現在価値は「下流にいること」ではなく「loopを閉じる唯一の部品であること」にあり、その束は一本ずつしか細くできない。攻撃が証明したのはドクトリンの否定ではなく、**ドクトリンの正しい執行速度の規定**である。

### J-2. 最終的にHumanがDesireだけ担当する状態は本当に最適か

**圧縮としては正しい。運用spec としては不完全。** §4が正しく退役させるもの: 義務労働・定型評価・How。§4が沈黙している（そして平板に読むと誤る）もの: (a) **Desireはoracle関数ではなく世界接触関数である**—本repoで最重要のDesire成果物（DESIRES.md）はヒロの直接接触の1日から生まれ、MD-2は接触なしには存在しなかった。(b) **Boundary裁定は評価行為を含む**—C-1/C-2は「評価もしない」の文字通りの読みと両立しない。(c) **MD-1自身が労働と接触を区別している**。終着形の正しい定義は「Desire + Boundary + 主権的に選んだ接触。義務的handoff→0」であり、「Human接触回数→0」ではない。補遺6への1文追加を提案する（採否はヒロ）: 「**Desireの品質はHumanの独立したReality接触に依存する。FactoryはHumanの唯一の世界窓になってはならない。**」

### J-3. HumanがReality Contactを持つこと自体に価値がある可能性

**内在的価値—no。道具的かつ現在load-bearing—yes。** 価値の実体は分解可能: (i) Gate法遵守（現行憲法）、(ii) 実在のidentity capital（HN VOIDが実証。ただしN=3で一般化禁止）、(iii) 唯一の帰還チャネル（配管ギャップ—買える）、(iv) No-Teacher期のTaste（返信0件で未検証のprior）、(v) Desire形成の入力（これのみHへ昇格—J-2）。「human touchが効く」は信念ではなく**期限付き・反証可能な仮説**として保持し、退役閾値を事前登録する。同時に完全委譲も今日は偽: 憲法的に封鎖され、証拠的に時期尚早（REPLY 0はAI文面が効く証拠もないことを意味する—変数を2つ同時に変えるcanaryなきAdoptになる）、運用的に危険（freshなAI運用アカウントこそdelivery layer差別の第一標的—HN VOIDの教訓の裏面）。

### J-4. AIが上流Directionへ進出した場合の境界

**前提事実: frontierは既に越えられている。** D-001（Mission移行そのもの）はAI起草・Human採択だった（content commit `cbc2d5e` = Claudeセッション、採択 = ヒロのmerge #32）。North Starの文言自体、canonization（`DESIRES.md`）の2日前にAIセッションで初起草されている（commit `308bbfc`、PR #27、2026-08-06 — 本セッションで実測確認）。そして本文書は、AIが「AIの上流scope」を分析するという利益相反を内蔵したAI-authored Direction作業である。問いは「進出を許すか」ではなく「既に起きている進出をどう構造化するか」である。

**判定: Author/Adopt分離は既に最高賭金（Mission移行）で機能した。ただし現状は《構造》ではなく《先例》である。** 必要な境界の約7割は散在する非拘束形で既存: Author/Adopt分離（D-001先例 + F0の「adoption occurs at human merge」）、merge gate（CONSTRAINTS §4）、自己修正不能項目1件（Budget、§2）、verifier原則（ROADMAP §2の1文）、Rejected Alternatives開示（LEARNINGSで1回実践）、矛盾型driftへの防御（Source of Truth Priority・canonical blocks）。**欠けているのは負荷を支える3割**:

1. **verifier要求が非拘束**: Direction級・AI-scope拡大提案への独立検証を要求する規則がない。今日の`0f9b4fd`はヒロのad hoc発注だった。「その変更の影響を受けない」の定義もDirection文脈では未定義（同一アカウント・同一モデルの兄弟セッションは、Claudeのscopeを広げる提案に対して有意に独立ではない）。
2. **自己修正不能集合が未列挙**: 明文でAI不可侵なのはBudget capのみ。CONSTRAINTS.md本体・Human Gates一覧・Risk Tier表は汎用merge gate 1枚で守られ、typo修正とboundary改定が同一の摩擦で同じ扉を通る。境界規則自身を守る自己言及的保護もない。
3. **Desire captureが未対処**: merge gateはテキストの受諾を検査するが、**選択肢空間の来歴**を検査しない。North Star文言はAI起草をヒロが採択したが、棄却された代替framingの記録は存在しない。AIがメニューを書くとき、Humanの「選択」はAIのframingに係留される—そしてこれはverifierで修復できない（desireには照合すべき外部ground truthがない）。
4. **§13は評価基準captureの合法経路を持つ**: 「退役に人間の判断を挟まない」自動退役の閾値はLayer2にあり、Layer2は通常のAI起草PRで改定可能。AI提案が閾値を起草→適合する「world feedback」を蓄積→§13を発動してDirection評価からHumanを退役させる経路が、現行規則のどれにも違反せず存在する。
5. **単層gateは負荷で形骸化する**: 本日ヒロは約106分で4回mergeしながら、同時に20件の手動送信と現実再確認を行った。予約されたattentionなきauthorityはprovenance theaterへ劣化する。canonical-tier区分（CONSTRAINTS/DESIRES級 vs 台帳級）も、self-scope拡大提案へのcooling periodもない。

**OS §11/§18からの最強の内部反論**（「capture事故は未観測—今structureを足すのは恐怖ベースの統治では？」）**への回答**: Direction captureは高爆風半径・低検出性・自己隠蔽的（captureされた評価基準こそが検出器）であり、**事故証拠が既にcaptureされた計器を通ってしか届かない唯一のリスククラス**。爆風半径比例原則（補遺5・CONSTRAINTS §2）により、これは§11のevidence barを満たす。

**提案（採否はヒロ。1ページのcontractであり装置ではない—§17/§18準拠）**: D-002「Direction Authority Contract」として、(1) Author/Adopt分離の明文化 + D-record必須フィールド `authored_by` / `adopted_by`、(2) 自己修正不能集合の列挙（CONSTRAINTS.md全体・Budget cap・Human Gates一覧・Risk Tier表・D-002自身。改定はHuman発意の明記 + 独立verifier報告を伴う場合のみ）、(3) 全D-record・DESIRES.md変更へのRejected Alternatives開示義務（Desire文言はAIが実質的に異なる2案以上を提示）、(4) canonical-tier編集またはAI-scope拡大を含む提案への、採択から利益を得ないverifier + PR内1行の「who benefits」宣言の義務化、(5) §13の狭い補正: **Direction評価**からのHuman退役のみ、confirmed terminal revenue = JPY 0の間はHuman採択のD-recordを追加要件とする（実World Signal到来で自動失効する時限条項。Layer1は改定しない）。

**利益相反の自己申告**: 本判定は、それが記述する利益相反の下で生成された。「AI Direction作業を許可せよ」という結論はその分だけ割り引かれるべきである—**そしてその割引の必要性こそ、verifier要求を裁量ではなく構造にすべき最良の論拠である。** 運用上の教訓も1つ: Direction分析はrepoに着地してから採択される（Demand-scan成果物喪失の再発防止。本文書は本branchへのcommitによってこれに従う）。

---

## 付記: 本文書の限界

- 観測は実質1日・返信0件。全分類は現時点判定であり、Loop 2以降の実データで更新される。
- E-005/E-008等のHuman-reported事実は一次記録の所在をそのまま引き継ぐ（repo内raw artifactなしのものはその旨併記済み）。
- workflow disableの機構（UI無効化か他要因か）はUNKNOWN。不発火の事実のみ実測。
- 本文書はF/G/Iの実行を**開始しない**。全てヒロの裁可待ちのDirection Designである。
