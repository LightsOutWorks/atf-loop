# atf-loop — Human Desire → Reality Factory

> **This repository is not currently a game factory.**
>
> Its current mission is to improve a system that transforms Human Desire into Reality using the best available external intelligence, capabilities, tools, services, humans, and execution routes. Games, browser toys, and previous routes are historical experiments unless explicitly reactivated by a current approved decision.

本リポジトリは、Human Desireを世界で現在利用可能な最良の知能・Capability・Tool・Service・Human・Execution RouteでRealityへ変換し、その変換能力自体をWorld Signalから自己改善する機関のCanonical Repositoryである（2026-08-08 D-001で移行。`DECISIONS.md` 参照）。

## 新しいセッションの起動手順（Boot Protocol）

以下の順で読む。過去のGame成果物・古いbranch・commit messageからMissionを推測しない。

1. [`CONSTRAINTS.md`](CONSTRAINTS.md) — Boundary / Hard Constraints / Human Gates（最優先）
2. [`OS.md`](OS.md) — Identity / Mission / Operating Philosophy / Source of Truth Priority
3. [`DESIRES.md`](DESIRES.md) — North Star / Major Desire Portfolio
4. [`CURRENT_STATE.md`](CURRENT_STATE.md) — 現在の実測状態
5. 今回のTask Contract
6. 必要な場合のみ [`ROADMAP.md`](ROADMAP.md) / [`DECISIONS.md`](DECISIONS.md) / [`experiments/INDEX.md`](experiments/INDEX.md) / [`JOURNAL.md`](JOURNAL.md)

## リポジトリ構成

| Path | 責務 |
|---|---|
| `CONSTRAINTS.md` | Boundary / Budget / Risk Tiers / Human Gates（+ 旧Browser-Toy契約をPart IIに保存） |
| `OS.md` | Factory Identity / Mission / Operating Philosophy（IOS） |
| `DESIRES.md` | North Star / Major Desire Portfolio |
| `CURRENT_STATE.md` | 実測状態のみ（canonical control block + 本文） |
| `ROADMAP.md` | Direction / Current Horizons / evidence-gated roadmap |
| `DECISIONS.md` | Direction変更のDecision Records |
| `JOURNAL.md` | Capability Evolution Log（証拠の層） |
| `experiments/INDEX.md` | 全Reality Experimentのstatus台帳 |
| `works/`, `factory.yml`, `smoke.mjs`, `index.html` | **Historical Experiment（HOLD）**: Browser-Toy Production Route |

---

## Historical: 無人生成ブラウザトイ集（2026-07 〜 2026-08、status: HOLD）

以下は旧Mission（Game Factory）の成果物である。Decision Historyとして保存されており、現在の指示ではない。

- ルートの `index.html` は全作品（SEED 001〜024）を一覧できるカタログ（英語表記）。GitHub Pagesで公開。
- 各作品は `works/seed-<連番>/` に単一 `index.html` で完結（外部通信・外部ライブラリ・外部素材ゼロ）。ルールは `CONSTRAINTS.md` Part II。
- 生成パイプライン: [.github/workflows/factory.yml](.github/workflows/factory.yml)（生成→smoke→interaction smoke→Codex gate→公開）。
- 遊び方: カタログの **Play** リンクから各作品を開く → **START** → 60秒プレイ → **REPLAY**。
- 動作検証: `node smoke.mjs works/seed-001`（固定6項目。カタログ自体は静的ページのため対象ディレクトリ指定が必要）。
- `works/seed-<連番>/devlog.md` に各作品の開発ログ、`JOURNAL.md` にFactory能力進化の記録がある。seed-009は既知のVerification Failureとして意図的に未修正で保存。
