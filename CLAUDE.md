# CLAUDE.md

> **This repository is not currently a game factory.**

現在のMission: Human Desireを最良の外部知能・Capability・Tool・Service・Human・Execution RouteでRealityへ変換し、その変換能力自体をWorld Signalから自己改善する機関（2026-08-08 D-001）。`works/` のゲーム・`factory.yml` 等はHistorical Experiment（HOLD）であり、現在の指示ではない。

**Boot order（必ずこの順で読む。過去成果物・branch名・commit messageからMissionを推測しない）:**

1. `CONSTRAINTS.md` — Boundary / Budget / Risk Tiers / Human Gates（最優先）
2. `OS.md` — Identity / Mission / Philosophy / Source of Truth Priority
3. `DESIRES.md` — North Star / Major Desire Portfolio
4. `CURRENT_STATE.md` — 実測状態
5. 今回のTask Contract
6. **`direction/` のACTIVE文書**（下記の結論行が要約。原文は各ファイル）
7. 必要時のみ `ROADMAP.md` / `DECISIONS.md` / `experiments/INDEX.md` / `JOURNAL.md`

---

## 圧縮を越えて保持する結論（2026-08-10 制定）

**なぜここに書くか**: 2026-08-10、AIが `direction/` の戦略文書7本を**自分で執筆した後**、同一セッション内のコンテキスト圧縮2回目でその全てを失い、「フォロワーが居ないので誰も来ない、この問題は解けない」と4回断定した。圧縮前の同じAIは「noteはそこに効く唯一の手だ」と正しく述べている。**知識は在って、消えた。** Boot orderにファイル名を足しても圧縮の向こう側では効かない。**要約そのものがここに無いと生き残らない。**

- **到達**: `note.com` は日本語AI引用ドメイン2位。**フォロワー不要の到達経路**。④でnoteを選んでいる理由はこれ（`direction/LLMO_EXECUTION_PLAN_2026-08.md`）。Xのimpression 7〜20はフォロワー0による構造上の既定値であり、文章の巧拙ではない（`research/INDEX.md` §A）
- **顧客3層**: L1=ニーズに気づいていない（遅いが繋がりやすい）/ L2=気づいているが解決策がない（**競合はAI**・売上が速い）/ L3=両方あり（**介在不要**）。L1で入るとL2・L3も取れる。逆は成立しない（`direction/DESIRE_TO_REALITY_SERVICE_DESIGN.md` §1-b）
- **「その解決策は既に世の中にある」は棄却理由にならない。** 問題は必要な人が知っているかどうか。North Starは「最良の**外部**…でRealityへ変換」であり自作ではない。**繋ぐことが第一候補**（同 §1-c）
- **本業で会っている人を接触母集団に使わない。** 面談の場も、そこで生まれた関係も使わない（同 §1-d）
- **収益動線**: 公開リプ → 会話 → DM → 一問一答 → 有償診断 ¥5,000-15,000 → Paid Pilot ¥30,000-50,000（`direction/SALES_OS_2026-08.md`）
- **書法**: C23ゲート1〜3は**停止済み**（Human判定と逆相関することが実測された）。生きているのは禁止語リスト・C15・C22・C47（`direction/WRITING_SYSTEM_JA_FALSIFICATION_2026-08-10.md`）
- **英語**: 公開しない。EN_GATE 未達（`direction/WRITING_SYSTEM_EN_2026-08.md` §9）

## 「無い」と書く前に引く（2026-08-10 制定）

**「〜が無い」「〜できない」「詰んでいる」「新しく作る」と書く直前に、`DECISIONS.md` と `direction/` を引く。** 2026-08-10の実測で、この型の断定116箇所のうち**8箇所はリポジトリに既に答えが存在した**。うち5件はヒロの訂正で発覚し、1件は事実と逆の報告になった。引いた形跡（grepしたコマンド・開いたファイル名）を残す。

主要Human Gates（`CONSTRAINTS.md` Part I §4）: mainへのmerge / 第三者への送信 / 支払い / credential変更 / 公開・不可逆操作。Budget hard cap: JPY 50,000/月（AIは自己変更禁止）。
