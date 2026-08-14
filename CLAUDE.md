# CLAUDE.md

> **これは案内板（Bootloader / Index）である。内容を持たない。**
> 持つのは「どの順で読むか」「どの問いをどのファイルが持つか」「矛盾したらどうするか」だけ。
> **CLAUDE.md単体で判断しない。** ここに書かれていないことを推測で埋めない。判断の根拠は、必ず下記の正本を開いてから作る。**このファイルを引用して戦略・方針・事実を正当化しない。**

> **本リポジトリは現在ゲーム工場ではない。** `works/` のゲーム・`factory.yml` 等はHistorical Experiment（HOLD。`DECISIONS.md` D-001）。**過去成果物・branch名・commit messageから現在のMissionを推測しない。** 現在のMissionは `OS.md` 冒頭のCurrent Identityが正本。

---

## 1. 読む順序

1. `CONSTRAINTS.md` — Hard Boundary / Budget / Risk Tiers / **Human Gates**（最優先Source）
2. `OS.md` — Identity / Mission / Philosophy / **Source of Truth Priority（優先順位の全体はここが正本）** / HI-1〜HI-9 / Layer2「探索と固定」
3. `DESIRES.md` — North Star / Major Desire Portfolio
4. `CURRENT_STATE.md` — 実測状態 / **現在の戦略・現在のベット・現在の位相（§7-0）** / 現在の律速（§7）
5. **今回のTask Contract**（＝Source of Truth Priority 第5位「Current approved experiment / execution contract」）— このセッションでHumanが与えた指示、および `experiments/` 配下の承認済み契約。**1〜4より下位**であり、契約が1〜4と矛盾する場合は§2に従う。契約に無いことを契約の名で実行しない
6. `direction/` のACTIVE文書 — 分野別の結論の正本（§3の索引で引く）
7. 必要時のみ `ROADMAP.md` / `DECISIONS.md` / `experiments/INDEX.md` / `research/INDEX.md` / `JOURNAL.md`

## 2. 矛盾したとき

- **上位が勝つ。** 優先順位の全体は `OS.md` のSource of Truth Priorityが持つ。`CONSTRAINTS.md` はすべてに優先する。
- **独断で埋めない。** 上位規則でも決着しない矛盾に当たったら、**そこで止めてHumanに出す。** 自分で解釈して先へ進めない。矛盾の存在自体を欠陥として記録する。
- Human Gates（`CONSTRAINTS.md` Part I §4）に該当する行為は、明示Commitが無い限り実行しない。

## 3. どの問いをどのファイルが持つか

| 問い | 正本 |
|---|---|
| 何をしてよいか／いけないか、いくらまで使えるか | `CONSTRAINTS.md` Part I（§1 Hard Boundary / §2 Budget / §3 Risk Tiers / §4 Human Gates / §5 Data Boundary / §6 検証の誠実性。2,109字） |
| 判断の順序・判定語彙、失敗の型、提案を組み立てる順序、探索と固定の切替 | `OS.md`（HI-5 / HI-4 / HI-9 / Layer2「探索と固定」） |
| **そもそも着手してよいか**（行動の既定 = `NO_ACTION`・7条件・Non-goals）、**誰が決めるか**（HumanとClaudeの権限分界） | `OS.md`（HI-10 / HI-11） |
| 何を目指しているか（北極星・Major Desire・その順位） | `DESIRES.md` |
| 今どうなっているか。現在の戦略・現在のベット・現在の優位（探索範囲）・現在の律速 | `CURRENT_STATE.md`（§7-0 / §7） |
| 過去に何を、なぜ決めたか | `DECISIONS.md` の該当D-record |
| この候補・仮説は過去に棄却されたか。再検討triggerは何か | `DECISIONS.md` 該当D-record / `research/INDEX.md` の状態列（`反証済み`） |
| どこまで読むか。上表に無い正本が必要になった場合の扱い | `OS.md` HI-12（取得規律） |
| 到達（note / X / LLMO・AI引用） | `direction/LLMO_EXECUTION_PLAN_2026-08.md` |
| 誰に何を売るか（顧客層・介在の可否・接触母集団の禁止範囲） | `direction/DESIRE_TO_REALITY_SERVICE_DESIGN.md` |
| 収益動線・価格 | `direction/SALES_OS_2026-08.md` |
| どう売るか（在重力営業の構造） | `experiments/desire-discovery/SELF_ANALYSIS_PROTOCOL.md`（在→重力→前進の実装。原典はリポジトリ外・非取り込み） |
| 日本語の書法（何が生きていて、何が実測で停止したか） | `direction/WRITING_SYSTEM_JA_FALSIFICATION_2026-08-10.md` / `direction/WRITING_SYSTEM_JA_MEASURED_2026-08-10.md`（体系本体 `direction/WRITING_SYSTEM_JA_2026-08.md` は53,707字・C番号で引く） |
| 英語を公開してよいか | `direction/WRITING_SYSTEM_EN_2026-08.md` §9（EN_GATE） |
| Web Marketingの一次調査・生データ | `direction/WEB_MARKETING_INTELLIGENCE_2026-08.md` / `research/INDEX.md`（109,174字・§A〜§Nを質問キーで引く） |
| 実験の一覧と状態 | `experiments/INDEX.md` |
| 過去作の中に再利用できる部品はあるか（所在と重複本数のみ。コードは持たない） | `ops/COMPONENT_INDEX.md`（再利用の**実績**は `experiments/desire-to-game/LEDGER.md` Evolution Transfer Log） |
| 新しくアプリ・サービス・自動化・大型独立機能を作る依頼 | `.claude/skills/reuse-before-build/SKILL.md` |

**この表を引く義務がいつ発生するかは `OS.md` HI-4 F10（既出の再発明）が定める。** 本ファイルは表を持つだけで、規則を持たない。
