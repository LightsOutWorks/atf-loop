# DECISIONS.md — Direction Decision Records

North Star / Major Desire / Route / Canonical Architecture等の**重要なDirection変更**だけを記録する（Source of Truth Priority第7位）。能力進化の証拠は `JOURNAL.md`、日々の観測は `CURRENT_STATE.md` が持つ。ここは「なぜ方向を変えたか」の台帳である。

Record形式（最小）: id / date / decision / why / supersedes / rollback。

---

## D-003 — Four-Audit Integration: 上位監査統合とCanonical方向の一意化

- **Date**: 2026-08-09
- **Authority**: ヒロのTask Contract「D-003 UPPER-LAYER INTEGRATION」および同日の「D-003 AMENDMENT — CURRENT EXPERIMENT PRIORITY SYNC」（いずれも2026-08-09）。採択はヒロの本PR merge。
- **Inputs**（統合した4監査）: ①North Star Adversarial Audit（採択済み = D-002）②Major Desire Portfolio Rederivation（repo内artifactなし。結論は本Task Contract経由で採択）③Human Leverage Rederivation（`direction/HUMAN_LEVERAGE_REDERIVATION_2026-08-08.md`）④Ownership / Compounding Audit（`ops/OWNERSHIP_AUDIT_2026-08-08.md`）。
- **Decision**:
  1. **Portfolio維持**: MD-1 / MD-2 / MD-3の3本を維持する。ただし3本は定理ではなく**Current Hypothesis**（反証・統合・降格可能）。Direction Review発火点 = Batch 1 signal回収クローズ / 初回Confirmed Revenue（月次はfallback）。再審理は現職MDへも対称的に適用する。
  2. **MD-1 Bootstrap解釈**: 現在Phaseの焦点は「**1本のPaid Value LoopをRealityで証明すること**」。Confirmed Revenue > 0が現在Phaseの最初のTerminal Reality Signal（D-002 Decision 3と同一。永久的達成条件ではない）。
  3. **MD-2の所有範囲**: outbound Demand Sensingとinbound World Signal Intakeの**両方**。Audience 10,000は現時点ではAssetではなく**Proxy**（Inbound Need / Trust / Revenueへ接続して初めて資産性を持つ）。
  4. **Human Position**: Human-up-the-loopを維持する。最適化対象は**義務的・機械的Human Handoff**の削減（Human-as-message-bus / lane間手動コピペ / AI出力の機械的転記 / 重複監視 / AIができる情報収集）であり、**Human Reality Contactをゼロへ収束させない**。維持するHuman Layer: Desire / Taste / Meaning / Boundary / Direction / payment / identity / irreversible decision / 独立したReality Contact / AIの世界観に閉じない外部観測。
  5. **Ownership方針**: Factoryが優先所有するのは ①Desireとその改訂履歴 ②Evidence Discipline（contract / schema / result語彙 / pinned tests）③World Experience / Failure / Outcome / Decisionの記録 ④Identity Continuityの記録。Model / Sensor / Harness / Platform / OSS / APIは原則RENT / REUSE。Need→Route→Outcome→Payment履歴は現時点でMoatではなく**将来の私有Prior候補**。canonical文書で「moat」語彙を使わない（Ownership Audit D-1）。
  6. **Structural Bottleneck確定**: 複数の独立監査が「**World Signalを回収し、正しいContact / Needへ帰属し、次のActionへ戻す経路**」の弱さへ収束した。これを長期の構造欠落として正本化する（`CURRENT_STATE.md` §7）。
  7. **Current Operational Priorityの分離**（AMENDMENT）: **構造的な律速と現在の最優先実験は同一である必要はない。** 構造欠落を正本化しても、そのAutomationを直ちに実装するとは限らない。実direct reply未発生（positive ground truthなし）ではreply ingestionはoutbound mappingしか検証できず情報価値が低く、ヒロはスマホのX通知を容易に確認できるため、現在Bootstrap Phaseは**世界との良質な接点候補の毎日継続供給**（Encounter volume）を優先する。Current approved experiment = **Daily Encounter Queue Canary**（3日間限定 / 毎日最大10件 / HUMAN_SHORT / Private delivery / Human manual send / Adaptive query learning / **自動送信なし**。status = **APPROVED_NOT_STARTED** — repo内に開始証跡なし。Budget: daily USD 0.18 / 3-day cumulative USD 0.50 / reserve ≈ USD 0.10 / 追加top-up禁止）。**X World Signal / Reply Ingestion Canary = HOLD**（execution_authority = NOT_GRANTED。再評価trigger: ①最初の実reply発生 ②Human返信監視負担の実測ボトルネック化。旧budget cap USD 3.00はxAI現残高 ≈ USD 0.649で成立せずUNAPPROVED。起草済み契約fileは本PRから除外 — branch履歴に残存し、trigger発火時に再作成する）。
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
