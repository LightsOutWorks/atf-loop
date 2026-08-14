---
name: preregister-experiment
description: 新しいReality Experiment（E-xxx）・Canary・Reality Testの実験契約の起草と判定基準の事前登録、および既存契約案の事前登録検査を行うスキル。「新しい実験を設計して」「Canaryを組みたい」「Reality Testの契約を書いて」「PASS/FAIL/VOID条件を決めて」「判定基準を事前登録して」「この契約案を検査して」のいずれでも、実験・検証の設計や判定基準の話が出た時点で必ず使用する。E-013とBatch 1で実行後のHuman amendmentを要した契約欠陥（未定義verdict語への下流決定の紐づけ・判定窓起点の誤り・小さいNでは作れないSignalへの依存・Human Gate行為の自動連動）を実行前に検査する。出力はbranch・commit・draft PRまでで停止し、実験の開始・第三者送信・公開・支出・main mergeは行わない。
argument-hint: "[draft|check] [実験の概要 または 契約ファイルパス]"
---

# preregister-experiment

新しいReality Experimentの契約を、実行前に判定可能な形で固定するスキル。役割は2つ——**draft**（契約の起草）と**check**（既存契約案の検査）。どちらか不明なら対象から判断する: 概要・アイデアが来たらdraft、既存の契約文書が来たらcheck。

## 位置づけ（最初に確認する）

- **このスキルは「実験を始めてよいか」を判断しない。** 着手判断は `OS.md` HI-10（`NO_ACTION` 既定・7条件）とHI-11（権限分界）の管轄であり、スキルの外にある。**このスキルの存在を、新しい実験を始める理由にしない。**
- **正本を複製しない。** 検査項目・判定語彙・Boundary・Budget規律の正本は下記の文書が持つ。本ファイルと正本が矛盾したら**常に正本が勝ち**、矛盾の存在自体を欠陥として報告する。
- 承認はHumanのPR mergeである。このスキルが作るのは**契約案**であり、承認済み契約ではない。

## 実行時に読む正本（この順で。`OS.md` HI-12 取得規律に従う）

1. `CONSTRAINTS.md` Part I 全文（Human Gates・Budget・検証の誠実性）
2. `experiments/INDEX.md` — 運用規則と**「契約の事前登録検査」**（検査項目の正本）、既存実験の採番・status
3. `OS.md` HI-5（判定語彙）。契約が対象範囲・非目標に触れる場合のみ HI-10 / HI-11 も引く
4. `CURRENT_STATE.md` §7-0・§7（現在の戦略・律速。契約の「着手の因果1文」はここへ接続する）
5. 形の参照として、直近の承認済み契約1本（2026-08-13時点の最新: `direction/EVAL_DESIRE_TO_GAME_2026-08.md` §5。以後はexperiments/INDEX.mdで最新のACTIVE実験の契約を引く）
6. 対象実験に関係する既存台帳（あれば）

## draft — 契約の起草

1. 上記の正本を読む。`experiments/INDEX.md` 検査項目1が列挙する事前登録フィールドを**全て**埋める形で契約を起草する。書けないフィールドは `UNKNOWN` と明記して残し、**それらしい値を発明して埋めない**。埋められないフィールドの存在は、実験がまだ設計可能な段階にないことのSignalであり、隠すものではない。
2. 台帳の列（world_signalの記録形式）を契約と同時に確定する（E-014契約の着手条件「1件目の納品前に列を確定する」と同じ理由——構造化は観測開始前にしかできない）。
3. 起草した契約へ、下記checkを自分で実行し、所見を潰してから出す。
4. `experiments/INDEX.md` への行追加は status **PROPOSED** で起草する。ACTIVE化はmerge後の別作業であり、このスキルは行わない。
5. branch → commit → **draft PR** を作成して停止する。PR本文に「merge = 本契約が事前登録するHuman Gateの通過」と明記する。

## check — 契約案の検査

`experiments/INDEX.md` の「契約の事前登録検査」を読み、対象契約へ**全項目**を適用する。所見は「検査項目番号 / 該当箇所の引用 / 何が欠けているか・何と矛盾するか」の3点で返す。修正はしない（修正を依頼された場合もdraft PRでの提案止まり）。

特に見落としやすい形（いずれも実行後のHuman amendmentを要した実害。原文と経緯は検査項目の括弧内citation先が持つ）:

- 下流の決定（支出・拡大）だけが書かれ、その条件になっているverdict語がどこにも定義されていない
- 判定窓が絶対時刻だけで書かれ、起点事象が書かれていない。特に、送信がHuman Gateで未実行なのに、受信時刻起点で窓が切られている
- 契約のNと既知の実測率では「発生ゼロ」が最頻結果になるSignalが、PASSや資源決定の必須条件に置かれている
- verdict成立と同時に、支出などのHuman Gate行為が自動発火する設計になっている

所見ゼロの場合は「所見なし」とだけ返し、無理に指摘を作らない。**検査の通過は契約の形式的な下限の確認であり、実験の価値や着手可否の保証ではない**（`CONSTRAINTS.md` Part I §6の精神——検査を「見かけ上の成功」の道具にしない）。

## 停止線（常に適用）

行ってよいのはR2まで: branch作成・commit・draft PR。次は**行わない**——実験の開始 / 第三者への送信 / 公開 / 支出・チャージ / `experiments/INDEX.md` のstatus ACTIVE化 / mainへのmerge / Budget・Boundary文書の変更。これらは `CONSTRAINTS.md` Part I §3–§4のHuman Gate / Human Commitであり、このスキルの成果物はすべてHumanのmerge判断の材料である。
