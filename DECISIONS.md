# DECISIONS.md — Direction Decision Records

North Star / Major Desire / Route / Canonical Architecture等の**重要なDirection変更**だけを記録する（Source of Truth Priority第7位）。能力進化の証拠は `JOURNAL.md`、日々の観測は `CURRENT_STATE.md` が持つ。ここは「なぜ方向を変えたか」の台帳である。

Record形式（最小）: id / date / decision / why / supersedes / rollback。

---

## D-005 — 文章スキルの自作をKILLし、既存（coji/natural-japanese）を取り込む

- **Date**: 2026-08-10
- **Authority**: ヒロのHuman指示「**と言うか無料で世の中あるならすぐ取り入れたらいいじゃん**」「**ゼロから考えるのをもうやめてほしいな**」（2026-08-10）。`direction/DESIRE_TO_REALITY_SERVICE_DESIGN.md` §1-c（North Starは最良の**外部**手段でRealityへ変換することであり自作ではない／REUSE→BUY→ADAPT→COMPOSE→BUILD）に基づく。
- **Decision**:
  1. **「人間らしい日本語を書かせるスキル」の自作をKILLする。** 商品化も自作継続もしない。
  2. **`coji/natural-japanese`（MIT）を `.claude/skills/natural-japanese/` へ取り込む。** LICENSE と `ORIGIN.md` を同梱。改変しない。
  3. **`scripts/writing-check.py` は退役方向**とし、当面は禁止語チェックのみに使う。
  4. 我々の側に残すのは3点だけ: プロ実文30万字の実測帯（`WRITING_SYSTEM_JA_MEASURED_2026-08-10.md`。**ゲートにしない**）／自分の規則を自分で反証した記録（`WRITING_SYSTEM_JA_FALSIFICATION_2026-08-10.md`）／Humanの直接判定に由来する禁止語。
- **Evidence**（8エージェント / 271ツール呼出の実地調査）:
  - **既に無料で完全公開されている。** note.com を公開API経由で 5,065件走査し 131本の全文を取得。「AIっぽさを消す規則」の実物（禁止語リスト・貼れる指示文14行・18項目の診断表・出典付き推敲プロンプト4本）は**無料記事だけで揃う**。
  - **買い手が居ない。** 有料49件の**中央値 ¥500・65%が¥500以下**。¥1,000〜1,999 は6件のみ。規則配布系の有料記事のスキは**1〜8に集中**。ココナラ170件の**93.5%が実績0**。**¥1,000単体で成立した証拠は0件**。
  - **coji が上位互換。** 14候補を測り一次GO 3件を**後から撤回して最終GO 0件**（我々の棄却リスト7件はその部分集合）。全候補に**誤検知率(FP)**を付与（我々は無し）。ジャンル別条件分け8種（我々は無し）。`lint.py` が動く（我々のゲートは停止済み）。GitHub 148★ / Zenn 248いいね（我々は note 0本 / X 4フォロワー）。
  - **需要の98%は学生の検出回避**であり、`CONSTRAINTS.md` §6 と書法§0 により我々が売らないと決めた領域。
  - **独立再現が1件**: 我々の第2軸「指示語 /1000字」（プロ 10.44 / SEO 4.90）は coji の「こそあど密度」（human high 11.42 / ordinary 9.0 / AI 8.18）と**方向・水準ともに一致**した。別コーパス・別手法で同じ結果。
- **Rejected**: (b) 既存＋我々の差分で作る、(c) 我々の差分だけで足りる。理由は、唯一の差分と想定していた「棄却軸リスト」が最も明確に劣後したこと、残る差分（ひらがな副詞・和語漢語比）は我々自身が「ゲートにしない」と決めており製品にならないこと、Human反証は n=1 であること。
- **副次的に確定した反証**: **禁止語C7「曖昧量副詞」を削除した。** プロ実文 734,001字で 1万字あたり **5.6件**、SEO量産 620,986字で 3.9件、AI無制約 19,484字で **0.5件**。**プロが最も多く使い、AIがほとんど使わない語を禁止していた**（内訳: かなり125 / 多くの77 / ほぼ70 / めちゃくちゃ67 / だいたい30 / 圧倒的に18）。第1軸（ひらがな副詞密度、著者δ+0.883）と正面から衝突していた。元の意図（測っていないのに程度を主張しない）は `CONSTRAINTS.md` §6 が既に担う。
- **Next**: cojiの reader-study は事前登録済みで「有効回答30人」が未達のまま止まっている。**協力を申し出ることは North Star の「繋ぐ」に一致する**（本業の接触母集団を使わない制約にも抵触しない）。実行は Human Gate（第三者への送信）。

---

## D-004 — Public Identity: Living Ground

- **Date**: 2026-08-09
- **Authority**: ヒロのHuman決定（2026-08-09。エルとの相談を経てロゴ案Bを採用）。`CONSTRAINTS.md` Part I §4により**identity（公開アカウント名等）の新規使用はHuman Gate**であり、本recordは決定の記録であって公開実行の承認ではない。**note / X等での実使用はヒロのHuman操作に限る。** 採択はヒロの本PR merge。
- **Decision**:
  1. **公開Identity（商品面）の名称を `Living Ground` とする。** 対象: サービス名 / note / 記事 / 公開時の表示名。
  2. **GitHub org `LightsOutWorks` は変更しない。** リポジトリは作業場であり商品面ではない。名称を統一しない（統一コストを支払わない）。
  3. **シンボルは八卦の巽（☴）**とし、幾何を `brand/BRAND_SPEC.md` §2で確定する（60 × 44.4 / 下段 +4% / 中央の切れ目 16.7% / 内側 r=1.5 / 外周は直角）。32px以下は簡略版（角丸なし・行間8.5）を用いる。
  4. **図形へ意味を追加しない。** 翼・風・拡散等の追加解釈をマークへ反映しない。言語化は「二層の水平構造＝安定・積層・継続 / 下段中央の余白＝受容・余地」に留める。
  5. **ロゴタイプ（書体）は未決**とする（`brand/BRAND_SPEC.md` §5）。マークと書体を同時に決めない。最終アセット化の際はアウトライン化しフォント依存を残さない。
- **Why**:
  1. `Lights Out`（消灯＝無人生産）は、D-001でHOLDへ降ろされたBrowser-Toy / Game Factory期のIdentityに属する語であり、**名称だけが旧Missionに取り残されていた**。
  2. 現在の主力商品（MD-3 / E-012の自己分析プロトコル）の中核価値は「人間にしかできない質問列」にある。無人性を掲げる名称は商品価値の対極を指し、看板と中身が逆を向く。
  3. 切り替えコストが実質ゼロであることが実測で確認できる（Batch 1 REPLY 0 / MD-2 Canary C-1 ≈20 impressions）。**守るべき既存ブランド資産が現時点で存在しない。** 時間が経つほど切り替えコストは上がる。
  4. `Living Ground` は名称・ロゴ案・象徴（巽）まで検討済みで、新規検討を要さない（2026-08-09にヒロが提供した個人アーカイブ。repo外・PII含むため本リポジトリへは取り込まない）。
  5. 幾何の2つの未決点（下段の光学重量 / 角丸量）は理論ではなく**レンダリング実測**で決定した。下段は分割により光学的重量が落ちるため +4%。角丸はr=1.0で硬さが戻りr=2.5で線でなくなるため、r=1.5（「やさしい」ではなく「静かな整形」）。
- **Supersedes**: 公開面（商品・媒体・表示名）でのブランド名としての `Lights Out Works` の使用。GitHub org名・過去のcommit・過去の公開物は書き換えない（歴史はgit historyが正本）。
- **Rollback**: 本PRのrevertで `brand/` と本recordが戻る。**ただし外部サービス（note / X等）で実使用を開始した後は、外部側の変更が別途必要**であり単一revertでは完結しない。

---

## D-003 — Four-Audit Integration: 上位監査統合とCanonical方向の一意化

- **Date**: 2026-08-09
- **Authority**: ヒロのTask Contract「D-003 UPPER-LAYER INTEGRATION」および同日の「D-003 AMENDMENT — CURRENT EXPERIMENT PRIORITY SYNC」（いずれも2026-08-09）。採択はヒロの本PR merge。
- **Inputs**（統合した4監査）: ①North Star Adversarial Audit（採択済み = D-002）②Major Desire Portfolio Rederivation（repo内artifactなし。結論は本Task Contract経由で採択）③Human Leverage Rederivation（`direction/HUMAN_LEVERAGE_REDERIVATION_2026-08-08.md`）④Ownership / Compounding Audit（`ops/OWNERSHIP_AUDIT_2026-08-08.md`）。
- **Decision**:
  1. **Portfolio維持**: MD-1 / MD-2 / MD-3の3本を維持する。ただし3本は定理ではなく**Current Hypothesis**（反証・統合・降格可能）。Direction Review発火点 = Batch 1 signal回収クローズ / 初回Confirmed Revenue（月次はfallback）。再審理は現職MDへも対称的に適用する。
  2. **MD-1 Bootstrap解釈**: 現在Phaseの焦点は「**1本のPaid Value LoopをRealityで証明すること**」。Confirmed Revenue > 0が現在Phaseの最初のTerminal Reality Signal（D-002 Decision 3と同一。永久的達成条件ではない）。
  3. **MD-2の所有範囲**: outbound Demand Sensingとinbound World Signal Intakeの**両方**（これに伴い `DESIRES.md` のMD-2見出しを「Distribution / Encounter Engine」へ改名）。Audience 10,000は現時点ではAssetではなく**Proxy**（Inbound Need / Trust / Revenueへ接続して初めて資産性を持つ）。
  4. **Human Position**: Human-up-the-loopを維持する。最適化対象は**義務的・機械的Human Handoff**の削減（Human-as-message-bus / lane間手動コピペ / AI出力の機械的転記 / 重複監視 / AIができる情報収集）であり、**Human Reality Contactをゼロへ収束させない**。維持するHuman Layer: Desire / Taste / Meaning / Boundary / Direction / payment / identity / irreversible decision / 独立したReality Contact / AIの世界観に閉じない外部観測。
  5. **Ownership方針**: Factoryが優先所有するのは ①Desireとその改訂履歴 ②Evidence Discipline（contract / schema / result語彙 / pinned tests）③World Experience / Failure / Outcome / Decisionの記録 ④Identity Continuityの記録。Model / Sensor / Harness / Platform / OSS / APIは原則RENT / REUSE。Need→Route→Outcome→Payment履歴は現時点でMoatではなく**将来の私有Prior候補**。canonical文書で「moat」語彙を使わない（Ownership Audit D-1）。
  6. **Structural Bottleneck確定**: 複数の独立監査が「**World Signalを回収し、正しいContact / Needへ帰属し、次のActionへ戻す経路**」の弱さへ収束した。これを長期の構造欠落として正本化する（`CURRENT_STATE.md` §7）。
  7. **Current Operational Priorityの分離**（AMENDMENT）: **構造的な律速と現在の最優先実験は同一である必要はない。** 構造欠落を正本化しても、そのAutomationを直ちに実装するとは限らない。実direct reply未発生（positive ground truthなし）ではreply ingestionはoutbound mappingしか検証できず情報価値が低く、ヒロはスマホのX通知を容易に確認できるため、現在Bootstrap Phaseは**世界との良質な接点候補の毎日継続供給**（Encounter volume）を優先する。Current approved experiment = **Daily Encounter Queue Canary**（3日間限定 / 毎日最大10件 / HUMAN_SHORT / Private delivery / Human manual send / Adaptive query learning / **自動送信なし**。status = **SCHEDULED_NOT_YET_EXECUTED** — 2026-08-09 PR #40 FINAL REALITY SYNCによるHuman-confirmed / repo-unverified: 非公開Claude Codeセッション内にone-shot trigger 3本設定済み（Day 1〜3 = 2026-08-09〜11 各18:30 JST）・Day 1未実行・恒久recurringではなくDay 3後の自動継続なし。Budget: daily USD 0.18 / 3-day cumulative USD 0.50 / reserve ≈ USD 0.10 / 追加top-up禁止）。**X World Signal / Reply Ingestion Canary = HOLD**（execution_authority = NOT_GRANTED。再評価trigger: ①最初の実reply発生 ②Human返信監視負担の実測ボトルネック化。旧budget cap USD 3.00はxAI現残高 ≈ USD 0.649で成立せずUNAPPROVED。起草済み契約fileは本PRから除外 — branch履歴に残存し、trigger発火時に再作成する）。
- **Explicitly NOT adopted**（現時点で採択しない。再提案には新証拠を要する）: 新しいDirection Authority Contract（Human Leverage J-4提案。※同提案内の仮番号「D-002」はNorth Star REPLACEのD-002とは別物であり、将来採択する場合は新番号を要する）/ 新Governance Architecture / Capability FrontierのMD-4昇格 / Trust・Memory・Verificationの独立Major Desire化 / Human Handoffゼロの目的化 / Audience 10,000のTerminal Goal化 / 常時Capability Radar / 常時Demand Radar / 返信前のProduct構築 / 大規模Automation / 新しいDB・Router・Platform / C09・C14・HN数件だけのための専用監視システム。
- **Why**: 4つの独立監査が同一の構造欠落（World Signal受信経路の弱さ）へ収束し、一方でcanonical間にstale（CURRENT_STATE §2旧「Sent 7」vs LEDGER「SENT 20」、cron定義とworkflow stateの混同）が現存していた。新思想の発明ではなく既存監査結論の統合により、新しいセッションが最小読み込みで現在地（North Star / 3 MD / Humanの位置 / 所有方針 / 律速 / 現在の最優先実験）を一意に得られる状態を作る。AMENDMENTは、Reality上の情報価値（positive ground truth不在）と現在Phaseに基づき、構造欠落のAutomationより先にEncounter volumeを増やすHuman裁定を反映した。
- **Supersedes**: `CURRENT_STATE.md` 旧§2「Sent 7 / 残り13件準備中」・旧§1/§4「schedule triggerが残っている（停止はHuman Gate）」等のstale記述（本PRで実測同期）。および本PR初版の「次にRealityへ問う1件 = X Reply Ingestion Canary（budget $3.00）」（AMENDMENTでHOLD / UNAPPROVEDへ差し替え）。D-001 / D-002の決定内容は変更しない。
- **Rollback**: 本PRのrevertで全変更（CURRENT_STATE / DESIRES / ROADMAP / 本record）が旧stateへ戻る。物理移動・削除を伴わないため単一revertで完結する。

---

## D-002 — North Star REPLACE: 変換方向の是正とMission / North Star一本化

- **Date**: 2026-08-09
- **Authority**: ヒロのHuman Commit（2026-08-09「NORTH STAR REPLACEMENT — HUMAN COMMIT」。North Star Adversarial Audit裁定の採択）。採択はヒロの本PR merge。
- **Decision**:
  1. North Starを次の文へREPLACEする:「Human Desireをその時々の最良の手段でRealityへ変換し、その変換能力自体をWorld Signalで改善し続ける、個人所有の機関。」`DESIRES.md` §1と `ROADMAP.md` §2を同時改訂する。旧文はgit historyに保存し、過去履歴は書き換えない。
  2. World Signal解釈の確定: World SignalはRealityで発生する外部観測可能な結果（explicit value confirmation / behavior change / actual use / repeated use / payment / referral / inbound demand等）を指す。Gate PASS / agent数 / cycle time / token効率等のinternal shaping signalのみでNorth Star前進を宣言してはならない。
  3. Bootstrap Phase判定点の事前登録: 最初のTerminal Reality Signal = **Confirmed Revenue > 0**（返金・取消可能期間を経過した確定実収益。MD-1 Terminal Signalと同一。2026-08-09時点で未達 = JPY 0）。これはNorth Star全体の永久的達成条件ではなく、Economic EngineをRealityへ接地する最初の通過点である。非経済的Human DesireをNorth Starから除外しない。
  4. 維持（本決定で変更しない）: MD-1優先規則 / `CONSTRAINTS.md` Part I §6の成功表現規律 / Route is not Identity / Major Desire Portfolioの本数非固定。Major Desire再設計・新Architecture・Skill / Hook / Automation追加・World Signal schemaの拡張は行わない。
- **Why**（North Star Adversarial Audit 2026-08-08〜09: 5 lens敵対批判 + KEEP弁護 + 代替6案生成 + 3裁定者のDecision Battery比較。裁定はREPLACE 3票 / AMEND 0 / KEEP 0）:
  1. 旧文は格構造上「外部知能と機構→Human Desire」と変換方向が逆に読め、上位正本（`CLAUDE.md` / `OS.md` Current Identity / D-001 Decision 1 / `ROADMAP.md` §2 Final Goal）の「Human Desire→Reality / World Value」と矛盾していた。
  2. Mission（D-001 Decision 1）とNorth Starの二重定義を一本化する。新文はD-001 Mission文の圧縮であり、新規要素を導入しない。
  3. 旧文の主述語「速度と確度そのものを自己改善し続ける」はmeta-processの目的化を誘発し得る。実際に、World SignalなしでinternalなControl-plane改善が前進した履歴がある（Browser-Toy期: `eval.json` 全 `world: null`・W lane未着手・確定実収益0のままのF / C lane前進）。
  4. 新文はRoute / Model / AGI等の時代前提（旧文の「世界で進化する外部知能」）に依存しない。
- **Supersedes**: D-001 Decision 3で制定されたNorth Star文「世界で進化する外部知能と機構をHuman Desireへ変換する速度と確度そのものを自己改善し続ける、個人所有の自律進化機関。」
- **Rollback**: 本PRのrevertで `DESIRES.md` §1 / `ROADMAP.md` §2 / 本recordが旧stateへ戻る（物理移動・削除を伴わないため単一revertで完結）。

---

## D-001 — Canonical Migration: Game Factory → Human Desire → Reality Factory

- **Date**: 2026-08-08
- **Authority**: ヒロのCurrent State Override（2026-08-08）。採択はヒロの本PR merge。
- **Decision**:
  1. 本リポジトリのCurrent Identityを「Human Desireを最良の外部知能・Capability・Tool・Service・Human・Execution RouteでRealityへ変換し、その変換能力自体をWorld Signalから自己改善する機関」のCanonical Repositoryとする。
  2. Browser-Toy Production Route（Game Factory、SEED 001〜024、`factory.yml`）を**Historical Experiment（HOLD）**とする。削除・移動はしない（Decision Historyとして保存）。
  3. North Star（単一）とMajor Desire Portfolio（MD-1 Economic / MD-2 Distribution / MD-3 Desire→Reality。本数非固定）を `DESIRES.md` として制定。
  4. Canonical Information Architectureを確定: `CONSTRAINTS.md`（Boundary）/ `OS.md`（Identity・Philosophy）/ `DESIRES.md` / `CURRENT_STATE.md` / `ROADMAP.md` / `DECISIONS.md` / `JOURNAL.md` / `experiments/INDEX.md`。Source of Truth PriorityをOS.mdに一本化。加えて `CLAUDE.md`（Claude Codeが自動読込するBoot Protocolの入口。正本ではなくOS.md冒頭への案内板）を設置。
  5. `OS.md` をv1.1へamend（Current Identity節 / Operating Philosophy補遺 / Layer2 route注記。Layer1既存原則は不変更）。
  6. `CONSTRAINTS.md` をPart I（Factory Boundary: Hard Boundary / Budget JPY 50,000 / Risk Tiers R0-R4 / Human Gates / Data Boundary）+ Part II（旧Browser-Toy契約のverbatim保存・scope明示）へ再構成。
- **Why**:
  - 新しいセッションが過去のGame成果物からMissionを誤認するリスクの排除（Historical EvidenceとCurrent Instructionの分離）。
  - Route（Game / MCP / X / Grok等）をIdentityと混同しないため。
  - 確定実収益0の現実を正本に固定し、「成功」表現を禁止するため。
- **Supersedes**:
  - 「このリポジトリ=無人生成ブラウザトイ集」という旧README / 旧CONSTRAINTS.mdのIdentity記述。
  - OS.md Layer2のBrowser-Toy固有値のMission制約としての読み。
  - ROADMAP.mdの旧Precedence表（OS.mdのSource of Truth Priorityへ一本化）。
- **Explicitly NOT decided here**（ヒロ裁可待ち / 別決定）:
  - `factory.yml` のschedule trigger（毎週土曜10:00 JST）の無効化。**mainには残存しており、次回発火前にHuman Gateでの停止判断が必要。**（※2026-08-09訂正追記: Actions API read-only実測により、workflow `factory` は2026-08-07 10:39 JSTに停止済み = `disabled_manually` と判明。ファイル内のhistorical cron定義のみ残存。本文は歴史記録として不変更 — `ops/OWNERSHIP_AUDIT_2026-08-08.md` 再検証記録2 / D-003）
  - PR #30（Genome Factory — Override以前のBrowser-Toy収益化Route提案）の採否。
  - PR #24（W0 precursor、HOLD）の扱い。
  - JOURNAL 0005 / 0007訂正とSelection Record v2（record debtとして保持）。
- **Rollback**: 本PRのrevert（`git revert -m 1 <merge-commit>`）で全変更が戻る。物理移動・削除を伴わないため、旧stateへの復帰は単一revertで完結する。

---

## D-000 —（Backfill要約）Browser-Toy Route期の主要Direction

2026-07〜2026-08-07のDirection変更は、当時の `JOURNAL.md`・`ROADMAP.md`・merge済みPR群（#22 OS正本化、#25 F3 precursor、#28 canonical blocks、#29 F3 readonly ranking等）に分散記録されている。本ファイル制定以前の決定は遡及して個別Recordに起こさない（歴史はgit historyが正本）。以後の重要Direction変更はD-recordとして本ファイルへ追記する。
