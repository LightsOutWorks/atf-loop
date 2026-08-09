# DECISIONS.md — Direction Decision Records

North Star / Major Desire / Route / Canonical Architecture等の**重要なDirection変更**だけを記録する（Source of Truth Priority第7位）。能力進化の証拠は `JOURNAL.md`、日々の観測は `CURRENT_STATE.md` が持つ。ここは「なぜ方向を変えたか」の台帳である。

Record形式（最小）: id / date / decision / why / supersedes / rollback。

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
  - `factory.yml` のschedule trigger（毎週土曜10:00 JST）の無効化。**mainには残存しており、次回発火前にHuman Gateでの停止判断が必要。**
  - PR #30（Genome Factory — Override以前のBrowser-Toy収益化Route提案）の採否。
  - PR #24（W0 precursor、HOLD）の扱い。
  - JOURNAL 0005 / 0007訂正とSelection Record v2（record debtとして保持）。
- **Rollback**: 本PRのrevert（`git revert -m 1 <merge-commit>`）で全変更が戻る。物理移動・削除を伴わないため、旧stateへの復帰は単一revertで完結する。

---

## D-000 —（Backfill要約）Browser-Toy Route期の主要Direction

2026-07〜2026-08-07のDirection変更は、当時の `JOURNAL.md`・`ROADMAP.md`・merge済みPR群（#22 OS正本化、#25 F3 precursor、#28 canonical blocks、#29 F3 readonly ranking等）に分散記録されている。本ファイル制定以前の決定は遡及して個別Recordに起こさない（歴史はgit historyが正本）。以後の重要Direction変更はD-recordとして本ファイルへ追記する。
