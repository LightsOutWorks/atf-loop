---
name: complexity-gardener
description: Factoryが現在地を理解しRealityへ次のActionを返すまでに負担する「認知面積（Operational Complexity）」が再び肥大していないかをread-onlyで監査し、KEEP / SLIM / RETIRE の削減候補だけを返す。週1回の定期監査のほか、「Factoryが重くなっていないか」「認知面積・Boot Surfaceを測って」「Skill / hook / workflow が増えすぎていないか」「正本が肥大していないか」「取得規律（HI-12）を守れているか」と言われた時に使う。ファイル容量の最小化には使わない——works/ や research/raw のような普段読まれないHistorical artifactのバイト数を理由に削除提案をしない。検出器であり、削除・書き換え・archive移動・PR作成・status変更・Mechanism追加は一切行わない。
---

# Complexity Gardener

> **Reality compounds. Mechanisms must earn the right to remain.**

**蓄積してよいもの**（Reality由来）: Human Desire / 実際の利用 / 継続利用 / verbatim reaction / Continuation Desire / 紹介 / 価格質問 / 支払い / 反証 / 次回の判断を実際に変えたLearning。

**原則として代謝対象**（Reality価値が未証明の内部Mechanism）: framework / governance / agent / Skill / hook / workflow / schema / routing system / dashboard / evaluator / internal score / 重複した説明。

測るのはバイト数ではない。**Claudeが現在地を理解し、Realityへ次のActionを返すまでに負担する認知面積**である。

## 観測する7つ

1. **Current Task Surface** — **`CURRENT_STATE.md` が示す現在TARGETを判断するために、実際に取得する最小anchorの総量。** 基準は **6,000字**（HI-12。**新しい上限を作らない**。Hard BoundaryではなくEvidenceで変更可能な運用基準である）
   - **Reality記録の総量ではない。** Realityを蓄積することと、現在の判断のためにReality全件を取得することは別である。**実験台帳の全文を毎回読む前提を作らない**
   - **anchorはその時のTARGETから決める。特定の実験をこのSkillへhardcodeしない**（下の測り方は2026-08-14時点の calibration case であって恒久定義ではない）
   - **必要anchorを特定できず全文Readが要る場合、それはReality量の問題ではなく `retrieval defect` である。** 当該文書を `SLIM` 候補として報告する。**新しいindex / schema / summary ledgerは作らない**
2. **Boot Surface** — 新規sessionが現在地を得るまでに読む字数。**Historical本文を読まずに済んでいるか**を優先して見る
3. **Layering Depth** — 現在値1つを得るために通過する層数（`不変更で保持` / `正本はこの追記側` / `訂正追記`）
4. **Duplicate Governance** — 同一規則が複数の正本 / Skill / hook / workflow に重複していないか。**wording差によるdriftも見る**
5. **Stale State** — 過去deadline / 期限切れACTIVE文書 / 現在値と矛盾するREADME / Historical RouteなのにCurrent instructionとして読める記述 / dead path・orphan reference
6. **Mechanism Growth** — 前回以降に増えた Skill / hook / agent / workflow / script / control mechanism
7. **Reality Connection** — 恒久Mechanismが World Signal / Reality Funnel / Human負荷削減 のいずれかへ寄与した**実測**があるか。**「便利そう」「将来使うかも」は価値証明に数えない**

## Hot / Cold の分離

Historical artifactが大量に存在すること自体は問題にしない。`works/` や `research/raw/` の**バイト数を理由に削除提案をしない**。問題にするのは **hot path（上の1・2）への混入**だけである。

**Reality履歴の本体は Cold Memory として保持する** — 実験台帳の過去行 / Retrospective Seed Corpus / verbatim reaction / raw evidence。**削除も要約も提案しない**（要約は情報損失であり、`OS.md` HI-4 F5 の取得記録保持と衝突する）。Coldが厚いことは健全であり、**問題はColdをhotとして毎回読ませている retrieval 側にある**。

## 測り方

```bash
# 1. Current Task Surface
#    手順: ①CURRENT_STATE §7 で現在TARGETを読む ②そのTARGETを判断するために実際に
#    要るanchorだけを列挙する ③その合計を測る。台帳やcontractの全文を入れない。
#    下の ANCHORS は 2026-08-14 の calibration case（TARGET = E-014 §6 trigger の発火）。
#    TARGETが変われば書き換える。ここに実験名を固定しない。
#    字数は Python len。wc -m はPOSIXロケールでバイト数を返すので使わない。
python3 - <<'EOF'
def sec(p, start, end=None):
    s = open(p, encoding='utf-8').read()
    i = s.index(start)
    return len(s[i:s.index(end, i+1)] if end else s[i:])
ANCHORS = [
  ('CONSTRAINTS.md 全文（HI-12 順序①）',
   len(open('CONSTRAINTS.md', encoding='utf-8').read())),
  ('CURRENT_STATE.md §7-0・§7（戦略と現在TARGET）',
   sec('CURRENT_STATE.md', '## 7. Structural Bottleneck', '## 8. Routing Facts')),
  ('EVAL_DESIRE_TO_GAME §6（現在TARGETの定義）',
   sec('direction/EVAL_DESIRE_TO_GAME_2026-08.md', '## 6. 商品仮説のHOLD', '## 7. 正本との緊張点')),
  ('LEDGER「G1 第三者Exposure — 実行メモ」（次Actionの手順・分岐・禁止）',
   sec('experiments/desire-to-game/LEDGER.md', '### G1 第三者Exposure — 実行メモ', '### 7作品の一次確認から')),
]
t = 0
for k, v in ANCHORS: t += v; print(f"{k:56s} {v:6d}")
print(f"{'合計（最小anchor）':56s} {t:6d}  / 基準 6000")
EOF

# 3. Layering Depth（検出語を持つ本Skill自身とraw archiveは除く）
grep -rn '不変更で保持\|正本はこの追記側\|訂正追記' --include='*.md' . \
  | grep -v '^./research/raw/' | grep -v 'complexity-gardener'

# 5. Stale State（過去日付・期限切れACTIVE）
grep -rln 'Status: \*\*ACTIVE' --include='*.md' direction/ experiments/

# 6. Mechanism Growth
ls .claude/skills .claude/agents .claude/hooks .github/workflows scripts
git log --since='<前回監査日>' --name-only --format='' -- .claude/ .github/ scripts/ | sort -u
```

## 判定

出力は **`KEEP` / `SLIM` / `RETIRE` の3語だけ**。根拠は1〜3行。**新しいSeverity体系・Score体系を作らない。**

基準を超過した時は、数字を合わせにいく前に **「なぜ大量に読む必要があるか」を特定する**。**上限を緩めるより Current Surface を薄くできないかを先に見る。** 数字を達成するために重要情報を削らない。

## 自動実行禁止

ファイル削除 / 正本の自動書換え / archive移動 / cleanup PRの自動作成 / mainへの変更 / Skill・hook・agent・workflowの自動追加 / Experiment statusの自動変更 / Human Gate行為 / 新しい管理文書の作成。

**監査結果をrepoへ蓄積しない。** 異常が無ければ出力は次の1行だけで終える。

```
VERDICT: KEEP — 変更不要
```

**「監査をしたので記録を残す」は禁止。** 異常のない監査結果をrepoへ残さない。

## 出力

問題があれば、項目ごとに **対象 / `KEEP`・`SLIM`・`RETIRE` / 理由 / 最小修正** まで返して**停止する**。実行はしない。

## 定期実行の現在の成立状況（2026-08-14 実測）

週1回が基本。**ただし本Skillは自動実行能力を持たない。Skillが存在することを「定期実行済み」と表現しない。**

実測: repo側の既存schedule機構は `.github/workflows/factory.yml` の cron のみで、当該workflowは `disabled_manually`（re-enableはHuman Gate、かつBrowser-Toy Route専用）。他2 workflowは `workflow_dispatch` と path-filter付き `pull_request` のみでscheduleを持たない。session側のRoutine（CronCreate）は0件で、かつprivate session stateのためrepositoryから検証できない——**これはE-013を `VOID` にした欠陥と同型**である。

したがって **REUSEできる既存schedule機構は無い**。新設は保留とし、**この制約自体をHumanへ返す**（`OS.md` HI-11）。当面はHumanまたはセッション開始時の手動起動で運用する。

## 本Skill自身の退役条件

Complexity Gardener自身もComplexityである。**専用のledger・counter systemを作らない。** 既存の実行履歴（会話・`git log`）から判断できる範囲でよく、判断不能なら `UNKNOWN` のままにする。

- 4回連続で `SLIM` / `RETIRE` 候補が0 → 週1から月1への変更候補
- 3か月連続で実質的な問題を発見しない → **本Skill自体が `RETIRE` 候補**
- 維持コストが削減効果を上回った → `RETIRE` 候補

## 再掲しないもの

実行してよいかは `OS.md` HI-10、誰が決めるかは HI-11、取得規律と字数境界は HI-12、失敗の型は HI-4、Human Gateは `CONSTRAINTS.md` §4 が正本。**本Skillはそれらを再掲せず、参照する。**
