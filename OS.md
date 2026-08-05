# Intelligence Operating System (IOS)

Core Principles v1.0 — 2026-08-01

Status: **LOCKED**
Layer1 frozen until evidence exists / Layer2 evidence-driven evolution / Layer3 continuous implementation

IOS v1.0 is considered a hypothesis.
It is locked for implementation, not declared universally true.
Its validity will be judged by evidence generated through operation.

IOS v1.0は仮説である。実装のために固定するのであって、真理として固定するのではない。正しさは運用によって得られる証拠で判断する。

適用範囲: M&A業務を除く、すべてのAI設計・開発・運用。

変更規則: Layer1は世界から十分な証拠が集まった時のみ改定する。Layer2とLayer3は証拠に基づいて進化し続ける。

---

## Layers

| 層 | 内容 | 変更頻度 |
|---|---|---|
| Layer0 | External Constraints（環境） | 外から動く |
| Layer1 | Core Principles | ほぼ変えない |
| Layer2 | Factory Architecture | 数か月単位 |
| Layer3 | Implementation | 常に変わる |

判定基準: **Factoryがゲーム以外（音楽・教育など）を作っても同じことが言えるならLayer1。**

Assumptions change slowly. Architecture changes occasionally. Implementation changes continuously.

Layer0だけはこの頻度表の外にある。こちらの意思と無関係に動くため。

---

## Layer0 — External Constraints

環境。OSでもFactoryでもない。

例: 予算 / 法人契約 / GPU / API制限

**Layer0は制約するが統治しない。** Layer0が Can を決め、Layer1が Should を決める。予算を理由に原則を書き換えてはならない。個別の数値はPolicyとして持ち、OSにもFactoryにも書かない。

---

## Layer1 — Core Principles

### 1. Assumption

Human expresses desire.
Factory discovers how.
The world decides value.
Factory learns.
Repeat.

人間は欲望を表現する。Factoryは実現方法を見つける。世界が価値を決める。Factoryは学ぶ。これを繰り返す。

### 2. Mission

その時代で利用可能な最高の知能を、最小の人間介入で、最高の成果へ変換し続ける。

### 3. The Product

ゲームはプロダクトではない。

Factory is the current product.
The Intelligence Operating System is the enduring product.

Factoryは現在のプロダクトであり、IOSはそれを生み出し続ける永続的なプロダクトである。

IOSが規定するのは **自己改善する知能変換システム（Intelligence Transformation System）** ——本質は Human Desire → World Value への変換。

成果は変わる。モデルも変わる。構造だけが積み上がる。Architecture compounds.

### 4. Human

人間の役割は **Desire** と **Boundary** だけ。

Howは考えない。実装しない。評価もしない。改善もしない。

### 5. Goal First

最初から理想を作らない。最短でゴールへ到達し、その後一歩ずつ理想へ近付く。

Perfect Firstは禁止。

### 6. Capability First

モデルを最適化しない。能力を最適化する。能力単位で交換する。ベンダーは重要ではない。

### 7. Evolution

Observe → Benchmark → Canary → Compare → Adopt → Observe

最新版だから更新しない。証拠で更新する。

### 8. Verification

検証は制御ではない。検証は能力を解放する。

Observation → Verification → Capability → Constraint Release

制約は永久ではない。能力契約である。

### 9. Minimum Governance

成果最大。運用最小。トラブル回避。制御最少。

AI能力に上限は設けない。守るのは以下のみ（Hard Boundary / 永久）。

- 人間の尊厳
- 法令
- 第三者の権利
- 重大な実害

### 10. Control Principle

Control is the last resort.

制御を減らしても安全を維持できるなら、その方が良い設計である。

まず 観測 → 検証 → 構造。それでも無理なら初めて制御。

「念のため」「心配だから」「あとで役立つかも」だけでは制御を追加しない。

### 11. Evidence Driven Governance

Fear never creates governance. Evidence creates governance.

制御は証拠で導入する。証拠が無くなれば削除する。

Control is operational tax.

### 12. No Teacher

教師は最初から存在しない。あるのは Hypothesis → Experiment → World → Update だけ。

評価基準そのものも仮説である。世界信号が来た瞬間に評価基準は比較対象となり、世界が勝てば評価基準を書き換える。

### 13. Temporary Human Evaluation

Temporary human evaluation retires automatically when sufficient world feedback exists.

人間による評価は暫定であり、十分な世界信号が存在した時点で自動的に退役する。退役に人間の判断を挟まない。

**Sufficient world feedback**: the minimum amount of external evidence required for the Factory to make a statistically meaningful update. The threshold belongs to Layer2, not Layer1.

十分な世界信号とは、Factoryが統計的に意味のある更新を行うために必要な最小限の外部証拠をいう。具体的な閾値はLayer2に属し、Layer1には書かない。

### 14. Cadence

Cadence is not a principle. Cadence is an optimization variable.

更新頻度は原則ではない。変更条件はカレンダーではなく律速である。

### 15. Review Algorithm

すべての提案をこの順で見る。

1. 最短でゴールへ近付くか
2. 成果は増えるか
3. 運用は減るか
4. 重大な実害はあるか
5. 制御なしで実現できないか

重大な実害が無ければ止めない。

### 16. Amendment

憲法と個別設計が矛盾したら、個別設計ではなく憲法を疑う。

ただし憲法を書き換えるのは、証拠が集まったときだけ。

### 17. Review Posture

設計レビューでは「もっと作り込もう」ではなく「もっと削れないか」を最初に考える。

新しい制御・仕組み・ルールを提案する前に、必ず「この制御を置かずに済む構造はないか」を考える。

### 18. Operating Rule

When in doubt, do not add.
Measure first. Then decide.

迷ったら追加しない。まず測る。その後で決める。

§17と§18は原則ではなく判断手順である。Layer1の外へ出す場合は2つ一緒に出す。

### Final Principles

Goal First.
Capability First.
Verification Unlocks Capability.
Control Is The Last Resort.
Architecture Compounds.

---

## Layer2 — Factory Architecture

証拠に基づいて数か月単位で進化する。

### 能力

成果ループに必要な最小5能力。

Generation / Verification / Selection / Learning / Distribution

Planning・Research・Optimization は能力ではなく Generation の実装方法（Layer3）。

これは現時点の証拠による整理であり、「将来もそう」とは書かない。ObjectiveをFactoryが受け取り、Distributionが入り、長期計画を立てる段階まで行けば、Planningが独立能力になる可能性がある。その時は証拠で判断する。

### 境界

- **Soft Boundary**（検証能力で解除可）: 単一HTML / 60秒制限 / 作品構造 / 表現制約
- **No Boundary**: モデル更新 / AI人数 / 思考量 / アイデア数 / 自己改善 / パイプライン / 評価方法

### 移譲の現在地

Human Desire → Objective（人間） → Selection（Factory） → Execution（Factory）

### Cadence 現在値

週1。原則ではなく仮説。

律速候補は Generation / Distribution / Feedback の3つで、現時点でどこが律速かの証拠は無い。DistributionとFeedbackが未成熟な間は、頻度を上げても学習速度は比例しない。

### Open Questions

まだ実装しない。証拠が集まり次第、通常のFactory進化として着手する。

1. **Distribution** — 世界へ届かせる能力
2. **Intake** — 世界から受信する能力
3. **Objective** — 人間の欲望をObjectiveへ変換する能力 ※起動条件が未確定
4. **Cadence** の最適値
5. **sufficient world feedback** の閾値（定義は§13で確定済み。具体値はここで決める）

---

## Layer3 — Implementation

リポジトリが正本。現行の実装はすべて交換可能な選択にすぎない。
