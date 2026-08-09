# OWNERSHIP / COMPOUNDING AUDIT — 2026-08-08

Status: **R0 ANALYSIS — 提案であり決定ではない。実装・DB構築・運用ルール変更を含まない裁定入力**
Task Contract: OWNERSHIP / COMPOUNDING AUDIT（Canonical Boot Protocol準拠。実施 2026-08-08〜09 JST）
Evidence base: default branch `main@f40155e`（canonical block base SHA `5e31133` + merge済みの `experiments/batch-1/LEDGER.md` / `LEARNINGS.md`）
Method: 9並列分析（5資産クラスタ分類 + 4敵対検証）→ Red-Team 1（統合matrixへの攻撃）→ 統合。すべてR0（read / research / analysis）。Red-Teamの修正は本文へ**採択済み**（採択内容はH-5に明示）。
分類変更・KPI変更・ルール追加・canonical文書の修正はいずれもHuman裁定（D-record / Direction Review / merge）を要する。

---

## 問いへの答え（要約）

> 外部Capabilityを最大利用しながら、Factory自身は何を蓄積すればReality Loopごとに強くなるか？

**所有すべきは4種のみ: ①Desire（とその改訂史） ②証拠規律（contract / schema / result語彙 / pinned tests） ③世界から得た経験の記録（failure・outcome・decision・外在化taste） ④最小のidentity継続性の記録。それ以外 — Model / Sensor / Platform / Harness / Code実装 / audience graph — はすべて借りる。**

ただし本監査の最重要発見は分類ではなく実測である: **Factoryの保存の厳密さは、自らの所有教義と逆転している。** 捨ててよいもの（HOLD routeのprompt・config）がSHA-256でpinされる一方、所有すると宣言したもの（能動routeのjoin keys・送信主体・raw artifacts）にはsession→repoのcommit経路が無く、N=20で既に喪失した。加えて、**既に支払った20接触枠のWorld Signal回収路そのものが現在存在しない**（F節）。所有戦略の成否は資産の追加ではなく、この2つの漏れの修復に懸かっている。

---

## A. Candidate Assets

Task Contract指定の24候補を検討した。正直な分類のため多くが**分割**を要した（Audience = list形/graph形、Code = contract/実装/歴史的成果物、Trust = track-record/platform standing等）。

Red-Teamが元リスト外から追加した実質的候補（全analystの盲点を含む）:

1. **Canonical document corpus**（CONSTRAINTS/OS/DESIRES/CURRENT_STATE/ROADMAP/DECISIONS + boot protocol）— **現在最大の実在OWN資産**。D-001のroute交換を生存し、vendor全交換も生存する「portableなpersonalization層」。weightsのfine-tuneより強い形の個別化所有でありながら、どのanalystのmatrixにも行が無かった
2. **World-Signal回収路**（送信主体identity inventory + reply intake/relay手順）— LEDGERは受信者を記録するが、20件をどのアカウントが送ったかはrepoのどこにも無い。F節参照
3. **Human-attention / Human Handoff計測記録** — MD-3の宣言済みWorld Signal（接触1件あたりのHuman判断回数）はLoop 1 baseline=UNKNOWNのまま計測資産が存在しない。North Starは「最小の人間介入」を最適化対象と明言しているにもかかわらず
4. **Demand-sensor query set + 事前登録記録** — E-005の48+5 queriesはsensor構成の再利用可能・所有可能部分（腐るraw rowsとは別物）だがrepo内に存在しない
5. **Draft-PR滞留evidence**というat-riskクラス — E-008 preflight（PR #31）・W0 precursor（PR #24）はmain外にのみ存在。Demand-session喪失と同型の「正本外evidence」構造

---

## B. Ownership Matrix

分類語彙: OWN / RENT / REUSE / TEMPORARY / DO_NOT_BUILD。

**採点上の注記（Red-Team採択）**: 当初matrixのdefensibility HIGHは5件が攻撃で崩壊した。North Star（DESIRES.md）は対競合defensibilityを一度も要求していない — この列は憲法が問わない問いに答えていた。以下では defensibility を「**Factoryにとっての代替不能性**」として読み替えて採点する。

### OWN-A: 実在保有（今日repoに実在する資産）

| 資産 | 内容 | 状態 |
|---|---|---|
| **Canonical document corpus** | 正本体系 + Source of Truth Priority + boot protocol。model/vendor非依存のpersonalization層 | 実在・実証済み（D-001 route交換を生存） |
| **Failure history** | JOURNAL 7 entries・VOID記録・訂正C-1/C-2・Rejected Generalizations 5件・NO-GO記録・seed-009物証 | **現在最強のデータ資産**。世界が返した唯一のsignalは全てfailure形。failure→rule→次batch再利用を実証済み（L1→LEDGER規則8、TETHER LOCK→interaction smoke） |
| **Process architecture** | funnel stages・PASS/FAIL/VOID/STALE/HOLD語彙・Human Gate配置・lane規律 | route交換を生存した実証済みcross-route資産（Architecture Compoundsの観測例1件） |
| **Verification / evidence contracts** | canonical JSON blocks・provenance schema・deterministic tests。North Starが構造的に借りられない唯一のcode（自己改変を裁くverifierは被裁定物が再生成できてはならない — ROADMAP §2） | 実在（C0 PASS / F3 PRECURSORが消費）。ただし**最重要のcontract（contact-record schema）が未建設** |
| **Decision records** | D-record形式・FACT/INFERENCE/HYPOTHESIS規律 | format実証済み（収益関連知識ゼロの段階で学習汚染を2回阻止）。contentは種子段階（D-001 + 5 L-entries） |
| **Desire history** | DESIRES.md + 改訂史 + 月次Direction Review | 唯一外部調達不能な入力（Layer1 §4）。compoundingは月次Reviewが実際に回ることが条件（現在0回転） |
| Need→Route→Outcome **capture規律 + 台帳** | append-only・UNKNOWN規律・REACHABLE分母・join keys | 実在するが**漏洩中**（N=20でjoin keys喪失済み）。規律は破られた後に施錠された状態で、無傷の1 loopを未完走 |

### OWN-B: 目標クラス（保有ゼロ。**建設ではなく捕捉** — 発生した瞬間にrepoへcommitする対象）

| 資産 | 捕捉点 | 注記 |
|---|---|---|
| Payment history = 初回確定収益の完全記録 | R4支払Gateと同居（構造的に捕捉しやすい） | MD-1 Terminal Signal。N=0。「Cash—収益証拠」と同一資産（当初matrixの重複を統合） |
| Owned re-contact list（audience-as-list / owned channel） | genuine conversationが再接触同意を生んだ時、LEDGERへ記録 | MD-2「Distribution Asset」の実体は**INFERENCE**（DESIRES.mdにlist/email概念は無い — FACT表記していた当初matrixをRed-Teamが訂正）。**build-deferral必須**: 加入者ゼロでのlist基盤建設はdashboard-before-measurement違反 |
| Human relationships | reply発生時（現在17 threadは一方向・0 reply） | 委譲不可能ゆえhuman burden最大。関係0件の現在、defensibility採点は無意味（paper moat — D節） |
| 外在化Taste（(decision, rationale, outcome) 3つ組） | KILL/SEND判断時に理由を記録し、outcomeとjoin | Batch 1の20判断は決定側fieldsがUNKNOWNのため**恒久的に検証不能**。L5 checklist自体は汎用衛生であり資産ではない |
| Capability evaluation history | 各paid run / capability使用時に成果・費用・時間を記録 | Dynamic Harnessの前提。機械可読形は現在ほぼゼロ（E-005すらHuman-reported要約のみ） |
| Trust-as-track-record（商業側） | confirmed revenue・同意済みcase record発生時 | 正直さの基盤（公開repo・保存された失敗）は実在するが、読者の証拠ゼロ・商業実績ゼロ。「経年で増価する」は正しいが現在は空 |
| Sender identity inventory + sensor query set / 事前登録 | 各送信・各sensor run時（非機密handleのみ。credential禁止はCONSTRAINTS §5どおり） | **F節の最重要欠落**。identity継続性の所有可能部分は「platform account」ではなく「このinventory記録」（Red-Team訂正: account/standingはRENT） |
| Custom domain + portable contact address | 最初の安定公開点が必要になった時（trigger式取得・命名はBatch 1証拠の後） | 唯一真に所有可能なidentity primitive。registrar/DNS/hostingはRENT |

### OWN-C: 凍結保有（Decision History証拠。capabilityとしては退役）

| 資産 | 注記 |
|---|---|
| Browser-Toy route成果物（works/ 24作品・factory.yml・gate-prompt・eval.json） | INDEX.md規則「過去実験の成果物は削除しない」により**恒久保存 = OWN（凍結）**。当初のTEMPORARY分類は「捨てる予定」の定義と矛盾（Red-Team訂正）。**例外: factory.ymlの生きたcron trigger（`0 1 * * 6`・実測確認済み）だけは凍結資産ではなく能動的liability** — Human Gateでの停止待ち（D-001既知） |

### RENT（対価を払い、蓄積しない）

| 資産 | 注記 |
|---|---|
| Models（Claude / ChatGPT / Grok） | 憲法既定。ただし現状は「model-agnostic」ではなく**exit未証明の単一vendor RENT**（C1/C3未着手・支出JPY構成未記録・harnessがClaude形）。H-4参照 |
| Sensor（Grok x_search） | E-005 PASS。xAIのX data独占は**model選択でなくdata-access独占**という別種counterparty — swap不能、対応はsensor分散のみ |
| Platform accounts / standing / audience graph | HN 3 VOIDの実証: platform信用は配達層インフラ。無ければ届かない。graph・karma・account年齢はすべて非portable残渣（ToS上譲渡不能）。所有可能なのはその**inventory記録**（OWN-B）だけ |
| Marketplace reviews（将来・条件付き） | marketplace route起動時ですらplatform保有・没収可能のRENT。所有すべきshadow（同意済みcase record）はTrustへ。当初のDO_NOT_BUILD分類は範疇錯誤 — 顧客ゼロでは「作らない」以前に「作れない」（Red-Team訂正） |
| AI subscriptions | Budget cap内で能力単位交換（Capability First） |

### REUSE

| 資産 | 注記 |
|---|---|
| 外部benchmark / leaderboard | 候補発見priorのみ。採用証拠にしない（ROADMAP C2既定） |
| OSS / tool / harness / protocol | REUSE→BUY→ADAPT→COMPOSE→DELEGATE→BUILD |

### TEMPORARY（今は持つが、資産計上しない）

| 資産 | 注記 |
|---|---|
| Raw need-candidate rows（作業集合として） | 24–72hで腐る消耗品。batch中にjoin keysを台帳へ抽出。**ただしpaid sensor runの成果物（query set・raw rows・cost）は支出証拠として1回commitする**（CONSTRAINTS §2の支出因果記録。E-005喪失の再発防止）— 「stale rowsを次loopの候補に再利用しない」規律とは別問題であり両立する（当初matrixとH-3裁定の矛盾をRed-Team指摘に従いこの形で解消） |
| Prompts（文面） | model時代のcache。中のcontract（検証項目・gate基準・文体spec）だけをcanonical文書へ抽出して所有（CONSTRAINTS Part IIが既に正しい形） |
| Verifier / canary実装（~4.8k行） | contract + deterministic testsが耐久部。実装は再生成可能。post-Batch 1のgate再設計でsunk-cost防衛をしない |
| 個別Solve用throwawayコード | REPLY後のSOLVE_ATTEMPT段階で許容（LEDGER規則3/4の枠内） |
| 個人事業paperwork | 初回支払Gateに付随する安価な手続き（payerが要求した時のみ） |

### DO_NOT_BUILD（証拠gate付き。再起動trigger併記）

| 資産 | 再起動trigger |
|---|---|
| Community | 複数contactが独立に「集まる場」を要望した時。それまで維持費 = Hiroの常設attention税でMD-1と直接競合 |
| Brand-as-recognition | 実収益後。認知はTrust track-recordの遅行変数であり、N=0で直接建設不能（dashboards-before-measurementの関係資産版） |
| data（無指定hoarding） | 事実上恒久（E節）。eval.json world:nullがrepo内反面教証 |
| Skills packaging | 反復がbottleneckとして観測された時（ROADMAP §0既定）。その時もdocumented procedure（prose）が先 |
| Proprietary software / SaaS | 4条件同時: ①VALUE_CONFIRMED≥1 ②LEDGER規則3比較でBUILD優位 ③同一painの独立複数再発（L4） ④PAID_PILOT段階の支払意思。成立後も最小のglue-over-rented-capability |
| Treasury / 資本蓄積 | 反復的confirmed revenueが再投資先の証拠を作った後 |
| 法人 | 法人請求を要するpilot・重大liability・税務優位のいずれか発火時 |
| Follower数KPI・加重scoring・reply監視自動化・dashboard・CRM | 各所の既定どおり（ROADMAP §0/§6・L5制約） |
| Foundation model自製 / fine-tune | H-4の3条件。それまで維持 |

---

## C. Top Compounding Assets

Reality Loopごとに強くなる資産を、実証度順に:

1. **Canonical document corpus + process architecture** — 最大の実在OWN資産。route交換（D-001）を生存した実測1件を持ち、vendor全交換をも生存する。「次のsessionが正しく起動する」こと自体がこのFactoryの複利の土台
2. **Failure history** — 唯一「failure→rule→次batch」の閉loopを実証済み。現在の全「世界から得た経験」はfailure形であり、実質のMD-3稼働channel
3. **Need→Route→Outcome capture規律 +（未建設の）最小contact-record schema** — North Starの「変換の速度と確度の自己改善」の文字通りの基質。現在は「破られた後に施錠された空の金庫」— 最初の無傷loopが実際の検証
4. **Decision-record規律**（VOID≠FAIL・分母規律・Rejected Generalizations・append-only訂正） — 学習汚染を2回阻止した実績
5. **Trust基盤 + identity inventory** — 経年するだけで増価し、contact枠を消費しない唯一の関係資産（ただし商業側は空） 
6. **（将来）outcome / payment labels + owned re-contact list** — 私的tail（GENUINE_PAIN以降）が埋まった時点で最上位へ昇格する見込み。現在rows=0

共通項: **上位は全て「記録とその規律」であり、データ量でも、コード量でも、audienceでもない。**

---

## D. False Moats

1. **「Need→Route→Outcome→Payment履歴」のmoat主張** — 裁定: **not-a-moat**。(a) PAYMENT列0行・join keys喪失済みで資産が実在しない。(b) Need層は誰でも~$2で再生成できるrented sensor出力、**17 REACHABLEのうち15件は公開X reply — outcomeの大半すら無料でscrape可能**（「unpurchasable and unscrapable」は当初matrixの事実誤認。Red-Team訂正済み）。(c) 鮮度24–72hで腐る。(d) 規模天井: 1人・batch20枠・50k JPY/月では支払いlabel年間一桁。**North Starが要求するのはmoatではなくFactory私有の複利prior**であり、それはこの規模でも成立し得る（条件はH-1）。canonical文書で「moat」語彙を使わないことを推奨
2. **Audience 10,000** — vanity proxy。数字はゼロ証拠で出現し、attention→会話の変換は0/17。X graphは非portable・没収可能で、Factory自身は読めない（harness block）。実資産は ①inbound genuine need率 ②owned re-contact list ③repo-first reputation artifacts に分解される
3. **Defensibility採点そのもの** — Red-Teamの構造的発見: 当初matrixのHIGH defensibility 5件（Trust・Human relationships・dataset・Taste・Decision records）は全て崩壊。共通の誤り: **保有ゼロの資産クラスの理論的defensibilityを、このFactoryの資産として採点した**（paper moat）。かつ憲法は対競合防御を一度も要求していない。正しい問いは「競合から守れるか」ではなく「Factoryにとって代替不能か」
4. **Prompts資産説** — model時代のcache。SHA-256でpinしてもhidden_system_prompt=UNKNOWNで挙動は固定できなかった。所有すべきは蒸留されたcontractのみ
5. **Platform standing / karma / reviews** — rented land。配達層として必要（RENT）だが蓄積目標にした瞬間に失敗する
6. **Raw need rows / clusters** — sensor母集団の分布（L2 bias）であって市場でも洞察でもない
7. **Code量** — 2,813行がHOLD route（JPY 0）のconfig provenanceを守る一方、収益routeのdatasetは無schemaでN=20喪失。「所有配分の逆転」がこのrepoの実測
8. **eval.json型の「後で役立つかもデータ」** — world:nullのまま1つの学習も生まなかったことが実証済み

---

## E. What We Should Never Build

真の「Never」（Hard Boundary / 誠実性由来）:

1. **見かけの成功を作る装置** — 偽装review・friendly payerの名目収益・gate改変（CONSTRAINTS §6）。誠実性はこのFactoryの主要OWN資産（Trust・Failure history）の毀損として二重に致命的
2. **第三者の権利・尊厳を侵す蓄積**（Data Boundary違反のデータ保持を含む）

「Never」に近い強DO_NOT_BUILD（発火条件が構造的にほぼ来ない）:

3. **Foundation model自製**（ROADMAP §6既定。50k capの下で恒常的に支配劣位）
4. **第二のmemory / queue / audit log**（ROADMAP §6既定。正本複線化はSource of Truth Priorityの自壊）
5. **無指定データlake** — 保持する全byteはjoin先World Signalを名指しできること
6. **Hiroの常設日次attention税を生む一切のもの**（community運営・content cadence・SNS自動化） — 希少資源L3の恒久的抵当入れ

---

## F. Current Missing Asset

**最重要（Red-Team裁定・採択）: 既に支払った20枠のWorld-Signal回収路。**

全推奨がBatch 2の保護（次のloop）を向く中で、**現在進行中の唯一のWorld Signal露出 — 17 live thread・20 Human Gate枠消費済み・reply latency進行中 — に回収路が無い**:

- FACT: LEDGERは受信者とURL は記録するが**送信主体handleがrepoのどこにも無い** — 将来sessionはHumanに聞かなければreply threadの所在を特定できない
- FACT: Xはharnessから読めず、定期self check-inは2026-08-08に正式停止（LEDGER Conversation Log）。Terminal Signalを運び得る唯一のeventを検知する自律的・文書化済み手段がゼロ
- FACT: 大半の行でmessage文面・clusterがUNKNOWN — replyが来てもFactoryは「何への返信か」を知らずに会話を続けることになり、枠を焼く
- L3の希少時計（reply latency）の真上にこの欠落が乗っている

修復費用は**prose commit 1回・Human Gate横断なし**（非機密handleの記録はCONSTRAINTS §5のcredential禁止に非該当。inventory + 文書化されたHuman relay手順であり、自動化昇格でもない）。

**次点（相補・競合しない）: commit-at-generation capture規律** — 送信/支払Human Gateの事前条件としてのartifact commit（join keys・sensor run成果物）。これはBatch 2以降を守る。F-1が「既に払った分」、F-2が「これから払う分」。

その他の欠落（軽微・1行級）: model支出のJPY構成記録（H-4のswap trigger可観測化）・Human Handoff計測のbaseline（MD-3 World Signal・Loop 2から計測開始とLEARNINGSが既に予告）・draft-PR滞留evidenceの正本化判断（PR #24/#31）。

---

## G. Next Small Desire

> **Factoryが、既に支払った17 threadと次のLoopの両方について、World Signalを1件も失わない状態を確立する。**

- 接続: MD-1（Batch 1 outcomeの帰属保護 = 現在のbottleneckである「Need→Paid Value→Confirmed Revenue証明」の前提保全）+ MD-3（capture規律というFactory自身の変換能力改善）
- 最小行為（すべてprose/docs級・新規buildなし・自動化なし・R2の範囲でdraft PR→Human merge）:
  1. **Sender identity inventory + reply intake手順の文書化**（F-1。17 threadの各行を送信主体handleへリンク、Humanがreplyを共有した時の受け口をLEDGERに1節）
  2. **送信Gate事前条件の1行拡張**（LEDGER運用規則8: join keys（cluster / 文面verbatim / freshness / 送信主体 / message_style）のcommitを送信の前提とする）
  3. **Paid sensor run成果物のcommit規則1行**（query set / raw rows / cost をcommitしてから候補消費 — CONSTRAINTS §2の支出因果記録の運用形）
- World Signal（検証可能）: (a) LEDGER上の17 live thread全行が送信主体handleを持つ (b) Loop 2起点の行のjoin keys UNKNOWN件数 = **0** (c) 次回paid sensor runのartifactがrepo内に実在
- 明示的にやらないこと: DB・schema自動validation・取込tool・reply監視自動化（Horizon 2の「Batch 1実データが揃った時点」判断とROADMAP §0の禁止事項に従う）

これはCurrent Horizons（ROADMAP §0）の順序を変えない。Batch 1のreply回収が依然として最優先のReality行為であり、本Desireはその**前提保全**である。Red-Teamの適合性チェック済み（H-5）: 全行為がconversation→documented procedureの梯子内で、Skill/Hook/Automation昇格を含まない。

---

## H. Adversarial Review

### H-1. Need→Route→Outcome→Payment履歴はmoatか

**裁定: Not-a-moat。ただしFactory私有の複利priorとしては成立可能であり、North Starの要求はそれで足りる。**
反転条件（全て必要）: ①capture完全性の修復（以後のbatchでjoin keys喪失ゼロ） ②私的tailの充填（単一の持続need-cluster内で100+ REACHABLE・10+ payment段階label） ③実測lift（自前履歴がfrontier prior + fresh scanをreply/pilot/payment予測で上回ること）。
③の比較器としてのC1/C3は**flip-conditionとしてのみ**正当 — 今建てれば「新gate体系の先行実装」違反（Red-Team指摘。H-4は当初から正しく「今建てない」としていた）。
逆に、Batch 2で再びfieldsを失うか、replyが0のままoutcome列が埋まらなければ、not-a-moatは恒久確定。

### H-2. Audience 10,000はassetかvanityか

**裁定: 現時点ではvanity proxy**（D-2参照）。反転条件: (a) inbound genuine conversationのX経由帰属が観測されrelevant follower数と共変 (b) FactoryがHuman attentionを消費せずX signalを観測できる (c) 信用がoutbound reply率を変える実測 (d) 台帳規律修復。
推奨: KPI候補を証拠gate梯子へ置換 — 第1 gate「帰属済みinbound genuine conversation 1件」、第2 gate「inbound needs ≥1/月の持続」。**これはDESIRES.md変更であり、月次Direction ReviewへのD-record提案としてHiroが裁定する**（Humanの領分。sessionが適用しない — Red-Team適合性チェックの明示条項）。
MD-2支出は「MD-1のReality活動から自然発生したものだけをpublic化」の寄生原則を厳守し、全public artifactは**repo-first**（送信Gate前にcommit）— Batch 1のdataset喪失と同型の失敗を同時に塞ぐ。

### H-3. Code所有はどこまで必要か

**裁定: 所有するのはCONTRACT — schema・fail-closed result語彙・verifier挙動をpinするdeterministic tests — であり、実装ではない。** 現routeの最小owned-code面: ①versioned contact-record schema（fieldsはCURRENT_STATE §2既定） ②fail-closed validator 1本（~100–200行）+ pinned tests ③「artifact commitなきpaid sensor runの禁止」チェック。合計数百行。建設triggerは「Batch 1 reply実データ到着」（Horizon 2どおり）。
根拠: このrepoで意思決定を変えたcodeは検証/schema系のみ（smoke gate停止・canary NO_ACTION）。feature codeは1つのworld signalも生まなかった。一方**codeゼロのrouteこそがN=20喪失を起こした** — prose contractは次sessionの読む意志と同程度にしか強くなく、executable contractはfail-closedする。この論点はRed-Teamが発見した**main上の実欠陥によってさらに強化された**（H-5 (7)）。
併記: c0-provenance級の作り込み（2,800行超）を新routeへ移植しない。所有予算はdataset保護が先。

### H-4. Model非所有戦略は長期成立するか

**裁定: 成立する。ただし安全なのは「exit実証済みのRENT」だけであり、現状は「exit未建設の単一vendor RENT」。**
- fine-tune/self-hostのcanary昇格条件（全て必要）: ①rented frontierが自前benchmark（C1型）で実測敗北する反復task classからのconfirmed revenue>0 ②OS §13閾値以上の自前dataset実在（UNKNOWN混じりのLEDGERは不適格） ③総費用（Hiro維持時間を正直に価格化）がcap内でrented Championに勝つC3同基準比較
- **Swap trigger**（1つで発火）: model支出がcap比~60%超過（見込み含む）・自task class能力退行の実測・subscription-OAuth認証パターンへのToS執行・90日未満告知のdeprecation
- 現状の具体的欠陥: **支出JPY構成が未記録のためswap triggerは観測不能**。C1/C3は今建てない（standing hedgeとして発火条件のみ1行保持）
- x_searchのX data独占はdata-access独占という別種counterpartyで、所有に救済策なし。対応はsensor分散（L2枠組みの拡張）のみ
- 「own the experience」がmodel非所有の全正当化である以上、**所有側complementが漏れる間、戦略は静かに逆転する**（labeled desire-conversion dataをvendor側だけが保持する状態）— F節の修復はこの教義の防衛でもある

### H-5. Red-Team（統合matrixへの攻撃）と採択

Red-Teamの評価: 「matrixと4裁定の重心 — capture規律 > データhoarding、contract > code、RENT+exit、community/brand/法人/productのDO_NOT_BUILD — は正しく、事実基盤は検証に耐えた（cron・pinned CLI・hidden_system_prompt UNKNOWN・world:null・N=20喪失、すべてrepo内で確認）。ただし系統的欠陥が3つある」。全て本文へ採択済み:

1. **OWN-inflation** → OWN-A（実在）/ OWN-B（目標クラス）/ OWN-C（凍結）へ分離。重複2組（Payment history=収益証拠、audience-list=owned channel）を統合
2. **Defensibility-theater** → HIGH 5件を棄却し、次元を「Factoryにとっての代替不能性」へ読み替え（D-3）
3. **時間的盲点** → 全推奨がBatch 2保護に偏り、支払済みの17 threadの回収路欠如を全analystが資産行として見落とした → F節を差し替え
4. 個別訂正の採択: identity継続性のOWN/RENT矛盾解消（account=RENT、inventory記録=OWN）/ Browser-Toy成果物のTEMPORARY→OWN-C（凍結）/ audience-listのFACT→INFERENCE降格 + build-deferral明記 / Marketplace reviewsのDO_NOT_BUILD→RENT（範疇錯誤の訂正）/ datasetのdefensibility HIGH→LOW-MED（15/17は公開reply）
5. raw rows取扱いの当初matrix vs H-3裁定の矛盾 → 「paid sensor run成果物は支出証拠として1回commit（再利用はしない）」の形で解消
6. 見落とし候補5件 → A節へ追加（canonical corpusを筆頭に）
7. **Repo実欠陥の発見（本監査のscope外だが報告義務あり）**: main上で `CURRENT_STATE.md` §2 / `experiments/INDEX.md` E-006 が「Sent 7」のまま、正本 `LEDGER.md` は「SENT 20」（2026-08-08 Human-confirmed sync済み）。INDEX自身の規則「statusの変更はCURRENT_STATE.mdの観測更新と同時に行う」がN=20の時点で既に破られている — **prose-onlyの状態規律が自明なNでも失敗するという、H-3のexecutable-contract論のanalyst自身の主張より強い証拠**。修正はcanonical文書の変更でありHuman Gate（本監査は変更しない）

### H-5補: 本監査自身への適用限界

分類の相当部分は 0 reply・JPY 0・N=20 という極小証拠上の推論であり、L4の小N規律は本監査にも適用される。Batch 1のWorld Signal回収後、H-1〜H-4の反転条件に照らした再監査が正当。

---

## I. Verdict

1. **所有は4種で足りる**: ①Desire ②証拠規律（contract/schema/result語彙/pinned tests — 数百byte〜数百行） ③世界から得た経験の記録（failure・outcome・decision・外在化taste） ④最小identity継続性の**記録**（inventory・domain・owned list — accountそのものではない）。それ以外は借りる。これは憲法（Philosophy 3）の再確認であると同時に、**その憲法が現在実行されていない**という指摘である。
2. **今日実際に所有しているものは4つだけ**: canonical document corpus・failure/decision記録・verification contracts・漏洩中のcontact台帳。それ以外のOWNはすべて意図（null holdings）であり、資産として数えることはOWN-inflationである。
3. **保存の厳密さと所有教義の逆転が最重要発見**: HOLD routeのconfigはSHA-256でpinされ、能動routeのjoin keys・送信主体・raw artifactsは喪失した。しかも「Sent 7 vs SENT 20」の同期崩れがmain上に現存し、prose-only状態規律が自明なNでも失敗することを示している。修復は新規buildなしの規律3点（G節）で足りる。
4. **「moat」枠組みを棄てる**: North Starが要求するのは対競合defensibilityではなく、自分のrouting判断を毎loop改善する私有priorである。moat語はdataset infraの過剰建設への入口（「When in doubt, do not add」違反の誘導）。
5. **Model非所有・Code最小所有・Audience非追求は維持**。ただし各1行級の宿題: model支出構成の記録・contact-record schemaのHorizon 2実装（reply到着後）・follower KPIの証拠gate梯子化（Direction Review裁定）。
6. **時間軸の優先**: 次のbatchを守る前に、既に支払った17 threadの回収路（F-1）を確立する。最初のreplyが「Factory初のworld-validated datum」になるか「2度目の帰属不能喪失」になるかの分岐が、prose commit 1回の距離にある。

---

## Appendix: 本監査が否定した一般化（再提案には新証拠を要する）

1. 「datasetがmoatである」— H-1で棄却。private prior論のみ存置
2. 「follower 10,000はMD-2の資産目標である」— H-2でvanity proxy裁定。証拠gate梯子へ（Direction Review裁定事項）
3. 「prompt資産・code資産は蓄積する」— contract抽出後のcacheと裁定
4. 「保有ゼロの資産クラスにdefensibilityを採点してよい」— paper moatとして棄却
5. 「所有を増やすほど強くなる」— 本監査の全体反証。所有は4種で足り、5種目からは運用税
