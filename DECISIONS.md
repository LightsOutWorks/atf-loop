# DECISIONS.md — Direction Decision Records

North Star / Major Desire / Route / Canonical Architecture等の**重要なDirection変更**だけを記録する（Source of Truth Priority第7位）。能力進化の証拠は `JOURNAL.md`、日々の観測は `CURRENT_STATE.md` が持つ。ここは「なぜ方向を変えたか」の台帳である。

Record形式（最小）: id / date / decision / why / supersedes / rollback。

---

## D-012 — 長期実証済みの他系統をArchitecture仕様ではなくPriorとして扱う。Factoryは独立に探索し、Realityが判定する

- **Date**: 2026-08-14
- **Authority**: ヒロのTask Contract「今後のArchitecture探索の方針」（2026-08-14。同日、対象をBrainのみからCross-Systemへ拡張する追加裁定を受けて本recordの範囲を広げた。**採択前の提案段階での範囲拡大であり、確定した判断の事後変更ではない**——D-recordの採択はヒロの本PR mergeである）。**Architectureの探索範囲＝戦略レベルの前提であり、決定権はHumanが持つ**（`OS.md` HI-11 Humanリスト: 戦略の探索範囲 / 対象範囲とNon-goals）。
- **Decision**: `OS.md` Layer2 へ **「Architecture候補の探索 — Cross-System Priors」1節だけ**を置く。要点は次の7つで、いずれも既存規則の**適用**であり新原則ではない。
  1. **長期実証済みの系統は解法ライブラリとして参照してよいが、設計図としては使わない。** 或る分野に或る仕組みが存在することは、それ自体では導入理由にならない。**Prior / Factory = Independent Search / Reality = Judge。優先順位は常に Reality > Cross-System Prior > Internal elegance。**
  2. **探索順序**: Factory Problem → Abstract Problem → Cross-System Priors → AI-native Alternatives → Smallest Test → Reality Selection → Retain / Prune。**関係する系統だけを必要時に使い、毎回全分野を調べない。どれもDefaultにせず、AI・Software-nativeと新規異種の候補を常に1つずつ残す。**
  3. **参照する系統と借りるもの**を1つの表で持つ（Evolution / Ecology・Control Theory / Cybernetics・Markets / Economics・Immune Systems・Distributed Systems・Information Theory / Compression・Collective Intelligence / Swarm・Brain / Cognitive・AI / Software-native）。**表は参照先の索引であって、チェックリストではない。**
  4. **Cross-System Convergence を強いPriorとして扱う。** 制約も媒体も異なる複数系統が同じ抽象問題へ似た解を採っている場合（例: forgetting / tolerance / extinction / garbage collection / sunset →「価値を失った構造を永続保持しない」）、単一分野の模倣より強い。**ただしScoreにせず、「N分野が一致したら採用」のような固定判定規則を作らない。Reality判定の代わりにはならない。**
  5. **分野名ではなく問いとして持つ4点**: ①「今もっとも性能が高いか」だけでなく**「次に安全に変異できるか」** ②**その状態を観測できているか / Factory側からその変数を動かせるか**（観測不能・操作不能な対象を内部推論だけで最適化しない）③**一部が壊れても全体が止まらないか**（全stateの常時完全同期を前提にしない。**ただし支払い・permission・公開・credential・破壊的操作は既存のHuman Gateと強い一貫性を維持する** — `CONSTRAINTS.md` §4）④**Agent同士を大量に会話させる必要が本当にあるか**（artifact / state change経由で成立するなら直接通信を増やさない）。
  6. **分野固有の制約まで模倣しない。** Biology（エネルギー / 身体 / 繁殖 / 寿命）/ Markets（貨幣 / 誘因 / 所有）/ Distributed systems（レイテンシ / 機械故障）/ Immune（生物学的生存）/ Organizations（人間の誘因 / 政治）はFactoryに無い制約を含む。導入前に**一般的な知能・適応問題への解か / その系統固有の制約への妥協か**を必ず分ける。
  7. **独立収束はSignalであり、因果順序を逆転させない。** Factory側の実測から独立に必要になった構造が後から他系統にも見つかった場合はコピーではなく収束として扱い、**その場合に限り**追加探索してよい。既に採用した機構へ後から他分野の理由づけを与えない。
- **Why**: 本方針の実質的な新規性は**「特定分野へのアンカリングを禁じること」と「Cross-System Convergenceを単一分野より強いPriorとして扱うこと」の2点**である。それ以外は既存正本が既に持っている——**Reality > Prior は §12 No Teacher**、**Variation → Reality Test → Selection は §7 Evolution**、**問題先・提案後の順序は Operating Philosophy 2**、**優位構造への置換は Operating Philosophy 7 / §6 Capability First**、**先回り建造の禁止は HI-10 Non-goals と `ROADMAP.md` §6**、**Need未確認での機構着手は HI-4 F1**、**単発の失敗やHuman修正1件で恒久ルールを増やさない（Factory版の自己免疫回避）は HI-4 F6**、**蓄積するのはログ量ではなく次の意思決定を変えるRealityは D-010 Decision 2**、**市場Signalの階層と内部指標の扱いは `DESIRES.md` §5 / HI-4 F2 / D-002**。したがって新設したのは1節のみで、これらは節内で**参照するだけで再掲していない**。
- **発火条件**: Factory自身で具体的なArchitecture問題が観測された時のみ。**常時Researchテーマにしない。「面白そうだから脳・免疫・市場を研究する」は禁止**で、問題が無ければ `NO_ACTION`（HI-10）。
- **設計上の選択（何を追加しなかったか）**: 新しい正本ファイル・管理文書・Skill・Research lane・Agent・評価機構・Capability・schema・恒久語彙・Experiment IDをいずれも作っていない。同節に**先回りで作らないもの**として次を明記した——Brain Architecture framework / Cognitive module一覧 / 記憶分類体系 / 人工海馬・人工前頭前野 / Sleep cycle automation / Neuroscience dashboard / Brain-inspired agent群 / **Genome System / pricing engine / agent swarm / Learning Compression Ratio 等の新KPI / Cross-System判定の恒久checklist・Score** / 新しいcanonical layer / 各分野の用語を使った恒久schema。
- **Complexity Gardener（D-011 Decision 6）への適用**: 同Skillの導入理由は**Factory自身の実測**（正本肥大 → Current Task Surface 37,174字 → HI-12 実行不能 → Operational Complexity増大）であり、**生物のforgetting / pruningやその他分野の存在ではない。** 本recordはその因果順序を確認するだけで、**Skill本体には他分野由来の理由づけを一切書き加えていない。** 今後、forgetting / tolerance / extinction / garbage collection / sunset との独立収束から改善候補を得ることは、本節の順序に従う限り認める。
- **Supersedes**: 無し。`CONSTRAINTS.md` / Layer1 / HI-1〜HI-12 / `DESIRES.md` North Star・MD-1〜MD-3 / `CURRENT_STATE.md` §7-0 の戦略・ベット・優位・位相 / D-001〜D-011 / E-014契約 / `ROADMAP.md` §0 の事前登録はいずれも変更していない。Layer2の既存節（Current Route Status / 能力 / 境界 / 移譲の現在地 / Cadence / 探索と固定 / Open Questions）も変更していない。
- **Rollback**: 本PRのrevertで `OS.md` の当該1節と本recordが戻る。物理削除・外部作用・支出を伴わないため単一revertで完結する。

---

## D-011 — Current Surfaceを畳む。Boundaryを凍結Routeのprovenanceから切り離す

- **Date**: 2026-08-14
- **Authority**: ヒロのTask Contract（2026-08-14。A-1〜A-4の実施指示とA-3のGO）。採択はヒロの本PR merge。
- **決定を可能にした実測**（本セッションの一次計測）:
  1. `OS.md` HI-12 の取得上限は **anchor 5件・計6,000字**。参照タスク「E-014の次の一手を決める」の必読セットは **37,174字＝6.2倍**（`CONSTRAINTS.md` Part I 2,109 + `CURRENT_STATE.md` §7-0/§7 16,036 + `experiments/desire-to-game/LEDGER.md` 19,029）。**制定日の2026-08-10時点で既に10,389字＝1.7倍**であり、規律は最初から未達だった。
  2. `CURRENT_STATE.md` は「原文は不変更で保持する／正本はこの追記側」型の追記が8箇所。E-013の現在値 `VOID` を得るには**原文＋5層＝6層**を通過する必要があった。
  3. C0 baseline は `CONSTRAINTS.md` を**ファイル全体**で production_material としてpinしており、他5件の production_material はすべてBrowser-Toy Route（HOLD）の資産だった。**現Missionの最優先Sourceを編集するとC0がSTALEに倒れる**構造で、2026-08-10に実際に発生している（`OS.md` HI-4 R1注釈）。
- **Decision**:
  1. **`CONSTRAINTS.md` Part II を `CONSTRAINTS_BROWSER_TOY_ROUTE.md` へ本文無改変で分離する**（契約本文のSHA-256一致を確認済み）。**効力・scope・status（HOLD）はいずれも不変。** 分離は所在の変更である。
  2. **C0 baseline の production_material から `CONSTRAINTS.md` を外し、pin対象を分離先へ移す。C0 canary は廃止しない。** `REQUIRED_MATERIALS` の件数（9件）とschema形状は不変で、1件のpath付け替えのみ。`base_sha` は分離後のcommitへ移し、全材料を再宣言する。
  3. **`CURRENT_STATE.md` を現在値だけへ畳む。** 訂正の経緯・棄却した仮説・過去の観測値は**git historyと該当D-record・実験台帳が持ち、本文へ積層させない**。**過去観測のために新しいD-recordを作らない**（本recordは構造変更の記録であって、畳んだ観測の退避先ではない）。§1〜§9の節番号は外部参照61件があるため維持する。
  4. **harnessの重複を除去する。** `.claude/settings.json` の2本目 UserPromptSubmit hook（`[routing]` echo）は `model-dispatch` skill の `description` と同内容のため削除。`.claude/hooks/context-brief.py` の `DEADLINES` は全件が過去日で出力ゼロだったため削除し、F10再注入のみ残す。**新しいhookは追加しない。**
  5. **`README.md` の「schedule triggerは現在も稼働中」を `disabled_manually` の実測へ訂正する。** これは整理ではなく事実誤記の修正である。
  6. **`complexity-gardener` Skillを1本だけ置く**（`.claude/skills/complexity-gardener/SKILL.md`）。役割は**read-onlyの検出器**——認知面積が再び肥大していないかを監査し、`KEEP` / `SLIM` / `RETIRE` の候補と最小修正までを返して停止する。**判定語彙は3語だけで、新しいSeverity・Score体系を作らない。** 基準は HI-12 を再利用し（Current Task Surface 6,000字）、**6,000をHard Boundaryへ昇格させない。** 削除・書換え・archive移動・PR作成・status変更・Mechanism追加はいずれも禁止で、**異常のない監査結果をrepoへ蓄積しない**。本Skill自身の退役条件（4回連続で候補0 → 月1へ / 3か月実質的な発見なし → `RETIRE` 候補）を内包するが、**専用のledger・counterは作らない**——既存の実行履歴で判断し、判断不能なら `UNKNOWN` のままにする。
     - **定期実行は成立していない（実測 2026-08-14）。** repo側の既存schedule機構は `factory.yml` の cron のみで当該workflowは `disabled_manually`（re-enableはHuman Gate・Browser-Toy Route専用）、他2 workflowはscheduleを持たず、session側Routineは0件かつprivate session state（**E-013を `VOID` にした欠陥と同型**）。**REUSEできる既存機構が無いため新設せず、制約そのものをHumanへ返す。** 加えて、read-onlyのcron workflowを新設しても本Task Contractが禁じる範囲（PR・issue・comment・external communication）を守る限りHumanへの到達経路が無く、**Reality Connectionを持たないMechanismになる**——それは本Skill自身が `RETIRE` と判定する対象である。
     - **恒久Mechanismの純増は0**: Skill +1（complexity-gardener）/ hook −1（`[routing]` echo）。新規のworkflow・script・agent・schema・ledger・dashboardはいずれも作っていない。
- **Why**: 内部Mechanismが増える速度に対し、現在地を得るための認知面積を抑える規律（HI-12）が機能していなかった。**上限の数字を緩めれば規律は形式的に満たせるが、読む量は減らない。** 本decisionは上限を変えず、読む対象そのものを薄くする。
- **HI-12の6,000字上限を変更しない理由**: 上限を緩めるより正本肥大を直すほうが根本解だから。**「`CONSTRAINTS.md` §6により変更不能」ではない**——上限はEvidenceで将来変更可能な運用基準であり、Hard Boundaryではない。
- **Supersedes**: `CURRENT_STATE.md` 本文の過去観測レイヤ（git historyが保持）と、C0 baseline の旧宣言のみ。**次のいずれも変更しない**——`CONSTRAINTS.md` の全条項（Hard Boundary / Budget JPY 50,000 / Risk Tiers / Human Gates / Data Boundary / 検証の誠実性）/ `OS.md` Layer1・HI-1〜HI-12の規律本体 / `DESIRES.md` North Star・MD-1〜MD-3 / `CURRENT_STATE.md` §7-0 の戦略・ベット・優位・位相（探索期）/ D-001〜D-010 / E-014契約 / `ROADMAP.md` §0 の事前登録。**D-001のBrowser-Toy Route HOLDも不変**——本recordは旧Routeの再稼働根拠にならない。
- **残った超過（隠さない）**: 畳んだ後の参照タスク実測は **25,303字**（`CONSTRAINTS.md` 2,106 + §7 4,168 + E-014台帳 19,029）で、**6,000字上限には戻っていない**。残差の75%は E-014 台帳であり、これはReality由来の記録（参加者・利用・継続利用・verbatim反応）で**代謝対象ではない**。台帳の畳み込みは本Task Contractの承認範囲外のため実施していない。
- **Rollback**: 本PRのrevertで全ファイルと本recordが旧stateへ戻る。物理削除・外部作用・支出を伴わない（分離元の本文はgit historyに残る）ため単一revertで完結する。

---

## D-010 — Factoryの価値主張を「生成能力」から外す。最有力候補をReality-learning（＝Factory私有の複利prior）へ移す

- **Date**: 2026-08-14
- **Authority**: ヒロのTask Contract（2026-08-14）。**Factoryの価値の所在＝戦略レベルの前提であり、決定権はHumanが持つ**（`OS.md` HI-11 Humanリスト: 戦略 / 対象範囲とNon-goals）。採択はヒロの本PR merge。
- **決定を可能にしたReality**（推測ではなく実測）:
  1. **Human-confirmed（FACT）**: G1〜G7の生成時、atf-loopのファイル・過去ゲーム・Factory規律を**一切見せていない**。入力は雑なHuman Desire / 指示のみ。**Corpus 7件はFactory文脈なしのClaude出力である。**
  2. そのうち **G1はHuman Desire → Playable Artifact → 外部2名の利用 → 2名とも別日・促しなし再プレイ → P1「売れるね」まで到達**（`experiments/desire-to-game/LEDGER.md`）。
  3. **一次実測（本セッション・FACT）**: Factory経由の `works/` 24作でも WebAudio 22/24・ポインタ入力 24/24・Canvas 2D 24/24 が独立に成立している。土台の一致は**移転ではなく収束**。なお safe-area（0/24 対 7/7）・localStorage（0/24 対 5/7）の差は**計数がFACTであり、原因は `INFERENCE`**——対象端末というHuman側入力で説明可能だが、生成モデル差・時期差・様式差が同時に効きうるため**因果は未確定**とする。
  4. Factory経由24作の外部信号は **0**（`eval.json` スコア9件すべて `world: null`）。Factory側の累積学習も **移転実績0**（同台帳 Evolution Transfer Log）。
- **Decision**:
  1. **「良いゲームを生成できる」ことをFactoryの価値主張に置かない。** 単一HTMLの実装品質・スマホ対応・コード生成音・UIといった能力の主要因は、現時点の実測ではClaude本体にある。**これはFactoryの失敗ではなく、モデル側で足りている能力をFactory側で再実装・再発明・管理しない根拠として使う。**
  2. **最有力候補を Reality-learning へ移す**——Realityとの接触を重ねるほど「誰が何を本当に欲し、何を使い続け、何に価値を感じ、何なら支払うか」の理解が蓄積し、次回の変換精度が上がること。**蓄積するのはログ量ではなく、次の意思決定を変えるRealityだけ。**
  3. **語彙は `moat` を使わず「Factory私有の複利prior」を用いる**（`ops/OWNERSHIP_AUDIT_2026-08-08.md` H-1 の推奨。理由は「moat語はdataset infraの過剰建設への入口」であり、本decisionの主旨と一致する）。**本decisionはその監査の再発明ではなく、独立経路からの追認である**——監査は2026-08-08に「North Starが要求するのはmoatではなくFactory私有の複利prior」と裁定済みで、その反転条件③「実測lift（自前履歴がfrontier prior を上回ること）」は、今回の相乗り検証が測ろうとしている量と同型である。
  4. **判定は既存機構だけで行う。** 既存のReality Funnel（`CURRENT_STATE.md` §7）と既存台帳の列で読む。**新しい正本・Capability・schema・dashboard・agent・評価システム・Experiment IDをいずれも作らない。**
  5. **検証は相乗り限定。** 新しい自然なDesireが発生した時にだけ、最小条件で実施する（条件の事前登録は `experiments/desire-to-game/LEDGER.md`「Reality-learning検証の相乗り条件」）。**E-014 §6 trigger取得を止めない。**
  6. **どこまで削っても残る因果価値を探す。** 相乗り検証でFactory側が勝った場合、**観測メモ3行だけを渡した裸のClaudeで再現できるかを必ず追試する**。再現できたなら、価値はrepoではなくメモ1枚にあり、**repo全体を私有priorと呼ばない**。
- **Why**: この前提が未記録のままだと、次のセッションが「良いゲームができるのはFactoryのおかげ」という暗黙の前提から**部品化・共通ライブラリ・恒久索引の再建設へ戻る**。同型の再発明は**2026-08-14に現に1度発生し、Human裁定で撤回されている**（部品索引 — commit `c66a94a`）。本recordはその再発を止めるために置く。
- **Supersedes**: 「生成能力＝Factoryの価値」という**未記録の暗黙前提**のみを降格する。**次のいずれも変更しない**——`CONSTRAINTS.md` 全項 / `OS.md` Layer1・HI-1〜HI-12 / `DESIRES.md` North Star・MD-1〜MD-3 / `CURRENT_STATE.md` §7-0（戦略・ベット・優位・探索期）/ D-001〜D-009 / E-014契約のhypothesis・PASS・FAIL・VOID・判定点・budget_cap・Human時間上限・非目標・§6解除trigger / `ROADMAP.md` §0 の事前登録。**D-001（Browser-Toy RouteのHOLD）も不変**——本recordは旧Routeの再稼働根拠にならない。
- **等級の限界（隠さない）**: 「生成モート未検出」は**未検出であって不在の証明ではない**。比較した2母集団は最低4変数（Desireの起点 / 受け手の実在 / 成果物様式 / 配布形態）と生成モデル差の可能性（`UNKNOWN`）を同時に含み、**現時点で因果は確定していない**。Reality-learningの側も**仮説であり実測0**（移転実績0）。**どちらの側も「証明済み」と書かない。**
- **Rollback**: 本PRのrevertで本recordと台帳追記が戻る。外部作用・支出・物理削除を伴わないため単一revertで完結する。

---

## D-009 — Current Operational Priority を Reality Funnel（外部ユーザー → 利用 → 継続利用 → 価値確認 → 売上）へ差し替える

- **Date**: 2026-08-14
- **Authority**: ヒロのTask Contract「Factory / ATF-loop の当面の最優先を更新する」（2026-08-14 Human裁定）。**戦略レベルの裁定であり、決定権はHumanが持つ**（`OS.md` HI-11 Humanリスト: 戦略 / 主要な資源配分 / 対象範囲とNon-goals）。採択はヒロの本PR merge。
- **Decision**:
  1. **`CURRENT_STATE.md` §7 の Current Operational Priority を、5段のReality Funnelの通過へ差し替える**——`外部ユーザー → 利用 → 継続利用 → 価値確認 → 売上`。2026-08-09原文（接点候補の毎日供給）は E-013 の `VOID` 終了に伴い最優先の座を失っており、`ROADMAP.md` §0 の2026-08-14追記が後継を指名しなかったため**本節の最優先は空席だった**。本decisionはその空席を埋めるものであって、E-013 の再開ではない。
  2. **上流だけの前進を前進と数えない。** 優先は上流から下流の順とする。**ただしhardな直列ゲートではない**——5段は**Reality Signalの深まりを観測するファネル**であり、全案件が各段を順番に通過することを要求しない。**とくに継続利用をhard gateにせず、段4・段5の発生条件にしない**（初回利用の時点で第三者から自発的な「自分にも作ってほしい」「いくら？」等の強い価値確認が発生した場合、別日の再利用を待つことを理由に進行を止めない）。継続利用は重要な強Signalとして観測する。どの段にも直接つながらない作業は原則 `NO_ACTION`（`OS.md` HI-10 の既定の適用であり、新しい既定ではない）。
  3. **段の読みを確定する**: 段1〜4は家族・友人・知人を外部ユーザーに数え、**段5だけが第三者からの支払いを要求する**（裁定原文が「第三者」を段5にのみ書いたため）。
  4. **現在値を `UNKNOWN` として記録する**（`CURRENT_STATE.md` §7）。段1〜4はいずれも `UNKNOWN`、段5は JPY 0（FACT）。**既存ゲームが5本以上あることは、外部ユーザーが1人以上いる証拠ではない**——「誰かに渡した」「誰かが触れた」がHuman-confirmedになるまで0超を推論しない。**段2〜4に一度も実測値が入ったことがない一方、入りうる実体（既存ゲーム）は既に手元にある。**
- **Why**: 既存正本にファネルは2本あるが、**いずれも「使われたか」を測っていない**。`direction/SALES_OS_2026-08.md` 7行目（公開リプ → 会話 → DM → 一問一答 → 有償診断 → Paid Pilot）と `ROADMAP.md` §0 の③1円までの経路（公開リプ → 会話 → DM → 一問一答 → 無料で繋ぐ → 依頼 → 有償）は**接触ファネルであり、会話から直接有償へ跳んでいる**。`DESIRES.md` §5 World Signal Hierarchy は tool usage / recurring use を持つが、**価値確認の段を持たない**。本decisionの新規性は**「利用 → 継続利用 → 価値確認」の3段を接触と売上の間に観測段として置くこと**、ただ1点である。
- **設計上の選択（何を追加しなかったか）**: 新しい節・恒久語彙・管理文書・Experiment IDをいずれも作らない。裁定に含まれた要素のうち、内部指標を成果としない規律は `OS.md` HI-6 が同一リストを既に持ち（HI-4 F2 が発生Signal）、内部改善・管理層追加・先回り実装の禁止は HI-10 Non-goals と `ROADMAP.md` §6 が既に持ち、「作る」以外のRouteは Operating Philosophy 3 のラダーが既に持つ。着手前判定（TARGET / EXPECTED SIGNAL / SHORTEST ROUTE / VERDICT）は HI-10 の7条件と因果1文の圧縮版であり、**新ゲートを置かず HI-10 条件3・4 を当面この5段で読む**運用判断とした。段2〜4の記録欄は `experiments/desire-to-game/LEDGER.md` に既に存在するため E-015 を起こさない。`CLAUDE.md` は §7 を指すだけで内容を持たないため変更不要（`CURRENT_STATE.md` §7-0 末尾の規定どおり）。
- **Supersedes**: `CURRENT_STATE.md` §7 の2026-08-09 Current Operational Priority を最優先の座から外す（原文は不変更で保持）。**次のいずれも変更しない**——`CONSTRAINTS.md`（Hard Boundary / Budget JPY 50,000 / Risk Tiers / Human Gates / Data Boundary / 検証の誠実性）/ `OS.md` Layer1・HI-1〜HI-12 / `DESIRES.md` North Star・MD-1〜MD-3・§5 World Signal Hierarchy / `CURRENT_STATE.md` §7-0 の現在の戦略・現在のベット・現在の優位・**位相（探索期）**/ D-001〜D-008 / E-014契約（`direction/EVAL_DESIRE_TO_GAME_2026-08.md`）のhypothesis・PASS・FAIL・VOID・判定点・budget_cap・Human時間上限・非目標 / `ROADMAP.md` §0 の事前登録（律速「会話の本数」・2026-11-10の失敗判定）——**結果を見てから判定基準を変更しない**（`CONSTRAINTS.md` Part I §6）。段3（継続利用）は外部ベースレート（**二次情報**: AIアプリ月次リテンション6.1%・非AI 9.5% / コンパニオン・セラピー系 Day30 8〜18% — `research/INDEX.md`）の下でN 3〜5では発生ゼロが最頻になりうるため、**PASS必須条件へ格上げしない**（`experiments/INDEX.md` 事前登録検査4 検出力）。
- **Rollback**: 本PRのrevertで `CURRENT_STATE.md` / `DECISIONS.md` / `ROADMAP.md` と本recordが旧stateへ戻る。物理移動・削除・外部作用・支出を伴わないため単一revertで完結する。

---

## D-008 — 取得規律（HI-12）を置く。Contextの上限と字数境界を正本化する

- **Date**: 2026-08-10
- **Authority**: ヒロのTask Contract「Just-in-time Context Router v0を設計監査せよ」および同日のRed Team指示（外部Agent Skillとの比較監査を経てGO）。採択はヒロの本PR merge。
- **Decision**: `OS.md` HI-12 として **①取得上限（anchor 5件・計6,000字）②取得順序（先頭は `CONSTRAINTS.md` Part I 全文2,109字。第1位Sourceは節を選ばない）③過去の棄却は同一の市場・Route・候補・Experiment・戦術仮説が一致する時だけ引く ④全文Readは6,000字未満のファイルのみ・20,000字以上は `grep` / anchor のみ** の4つだけを置く。`CLAUDE.md` §3 へは**routing行を2本足すだけ**とし（棄却の参照点 / HI-12 への導線）、規則は一切持たせない。既存行には anchor と字数を書き足す。**新規ファイル・新規script・新規語彙・hook変更は無し。**
- **Why**: 取得量に上限を課す規則が正本のどこにも無く、`research/INDEX.md`（109,174字）は497行のため `Read` 1回で全文が返る。一方、Fingerprint書式・Manifestフィールド・Execution Contract 8項目・STOP 6件のうち5件は HI-9 / HI-10 / HI-11 / `CLAUDE.md` §2 / `ROADMAP.md` §3 step 5 から導出でき、置けば再掲になる（§17 / §18 / HI-4 F3）。**新規なのは上記4つだけだった。**
- **Supersedes**: 無し。HI-10の7条件・HI-11の分界・Layer2「探索と固定」・D-001〜D-007・`CONSTRAINTS.md`・`DESIRES.md`・`CURRENT_STATE.md` §7-0 は変更していない。設計監査で検討した depth mode・tie-break・omission_reason・Execution Contractは**未実測または再掲のため採用しない**（`OS.md` §11 / §18 / HI-4 F6）。
- **Rollback**: 本PRのrevertで `OS.md` / `CLAUDE.md` / 本record が旧stateへ戻る。物理移動・削除・外部作用を伴わないため単一revertで完結する。

---

## D-007 — 戦略の探索範囲を3条件の交差とし、現在の優位を確定する

- **Date**: 2026-08-10
- **Authority**: ヒロのTask Contract「Human Earned Edgeを戦略的な探索範囲へ統合せよ」および同日のHuman裁定（2026-08-10）。採択はヒロの本PR merge。**North Star / Major Desire / 現在の戦略 / 現在のベットは変更しない。**
- **Decision**:
  1. **戦略候補として探索してよい範囲を `North Star × 現在優先中のMajor Desire × Humanの実戦由来の優位` の交差とし、外側は探索せず `NO_ACTION` とする**（`OS.md` Layer2「探索と固定」A）。これは範囲判断であって実行判断ではない（実行可否は HI-10 の7条件のまま）。範囲の決定権はHumanが持つ（HI-11 のHumanリストへ「戦略の探索範囲」を追加）。
  2. **現在の優位を確定する**（`CURRENT_STATE.md` §7-0）: 「Human自身が実際の営業現場で反復し、結果を見ながら磨いてきた、人の判断・欲求・迷いを捉え、相手の現実を尊重したまま意思決定を前に進める力」。裏づけの既存Evidenceは `direction/SALES_OS_2026-08.md` 冒頭 / `experiments/batch-1/LEARNINGS.md` L4 / `direction/DESIRE_TO_REALITY_SERVICE_DESIGN.md` §1〜§2。**D-005 の禁止語はこれに含めず、制約・学習結果として分離する。**
  3. **これはHard Boundaryではない。** この力に直接関係する商品しか作れないという意味ではなく、Reality Evidenceが強い候補は範囲外でも1つのCommitとしてHumanへ上げてよい。
  - ※**2026-08-10 訂正追記**: Decision 2 の一文は同日のHuman裁定により表現精度を修正した（「捉え」→「引き出し、本人の言葉として返しながら」／「進む・進まない・手放す」を明示）。**現在値の正本は `CURRENT_STATE.md` §7-0 であり、上の文はDecision時点の記録として不変更で残す**（追記のみ規律）。範囲の交差条件・Hard Boundaryでないこと・D-005 の分離はいずれも変更していない。
- **Why**: 現在のベットは「既に収益を生んでいて日本にまだ来ていない事業から選ぶ」であり、このままでは探索の母集団が外部市場全体になる。HI-10（着手してよいか）とHI-11（誰が決めるか）はあったが、**その上流の「どの範囲を探索してよいか」を定める規則が正本に無かった**。D-006 の2候補がいずれも「North Starへ接続できる」ところまでは説明できたのは、この欠落の実例である。
- **設計上の選択**: 本decisionは新しい節・新しい恒久語彙・新しい管理文書を作らない。Earned Edgeの一般的な定義（判定基準の列挙・`UNKNOWN` 規則・機密境界の再掲）はいずれも `CONSTRAINTS.md` §5 / §6・`OS.md` HI-4 F5 / F9・HI-11 から導けるため置かない（§10 Control Principle / §17 Review Posture / §18）。**必要なのは現在値ひとつと、それを参照する規律1段落である。**
- **Supersedes**: 無し。HI-10 の7条件・HI-11 の分界・Layer2 B の成立条件・D-001〜D-006・`DESIRES.md`・`CONSTRAINTS.md`・`CURRENT_STATE.md` §7-0 の現在の戦略と現在のベットは、いずれも変更していない。実行中の Strategy Committed 済み Experiment（E-013 等）は Layer2 C により判定点まで固定されており、本decisionは遡及しない。
- **Rollback**: 本PRのrevertで `OS.md` / `CURRENT_STATE.md` / `CLAUDE.md` / 本record が旧stateへ戻る。物理移動・削除・外部作用を伴わないため単一revertで完結する。

---

## D-006 — Action Default を `NO_ACTION` とし、戦術をClaudeへ委任する。2候補を確定判定する

- **Date**: 2026-08-10
- **Authority**: ヒロのTask Contract「NO_ACTION原則・戦術委任・今回の候補判定を正本へ反映せよ」（2026-08-10）。Decision 5 の2候補は **Human Commit済み**であり、**再提案・再審理しない**。採択はヒロの本PR merge。
- **Decision**:
  1. **行動のDefaultを実行ではなく `NO_ACTION` とする**（`OS.md` HI-10）。7条件を**すべて**満たした作業だけを実行し、着手前に「この作業 → 取得または変化させるReality → 動かす現在の律速 → 接続する現在優先中のMajor Desire → North Star」を1文で言えることを要求する。**North Star接続だけでは実行を正当化できない。** 「将来役立つ」「品質が上がる」「Factoryが強くなる」「自動化できる」「念のため」「より良い案かもしれない」を実行理由として認めない。恒常的なNon-goals 12件を同節に置く。
  2. **HI-2「既定はやる」の適用範囲を、着手すると決めた後のHandoff規律へ限定する**（`OS.md` HI-2）。着手するかどうかの既定はその逆であり `NO_ACTION`。2つを混同すると、7条件を満たさない作業を「既定はやる」で正当化できてしまう。
  3. **HumanとClaudeの権限分界を明文化する**（`OS.md` HI-11）。Humanが保持するのは North Star / Major Desire / Hard Boundary / 戦略 / Major Bet / 対象範囲とNon-goals / 主要な資源配分 / 次の判定点 / 戦略のKILL・早期解除条件 / 戦略的Taste / Human Gate。**Strategy Committed後の戦術（タスク分解 / Experiment設計 / 承認済み対象内の優先順位 / チャネル / 訴求 / メッセージ / 導線 / ツール / 実装方法 / 戦術の継続・修正・KILL / 計測 / 分析 / 次の一手）はClaudeがOwnerであり、Humanへ選択肢を返さず1案を選んで実行・検証する。** Humanへ戻してよい9件を限定列挙する（D-003 Decision 4の実装規則であり、Human Positionを変更しない）。
  4. **Strategy Committedの成立条件へ3件を追加する**（`OS.md` Layer2「探索と固定」B-10〜12）: この戦略に固有のNon-goals / 今回明示的にやらないこと / **`NO_ACTION` を解除する具体的なtrigger**（「内部でより良い案が出たこと」はtriggerではない）。「採用しなかった主要な代替案」は既存条件5であり重複させない。
  5. **2026-08-10 の商品候補2件を確定判定する。**
     - **就労選択支援の指定申請書式パック = `KILL`。** 理由: ①公的指定申請に関わる高影響領域 ②指定権者による様式・要件差がある ③HumanにもClaudeにも当該制度の専門性がない ④Claudeの現環境では一次資料を安定取得・検証できない（本日 `mhlw.go.jp` / `e-gov.go.jp` は CONNECT 403）⑤誤った成果物が第三者へ重大な実害を与えうる ⑥現在のNon-goalおよびHard Boundaryに反する。**「競合が存在したから」はKILL理由ではない**（`direction/DESIRE_TO_REALITY_SERVICE_DESIGN.md` §1-c）。再検討は、Humanが戦略レベルで規制領域への参入を明示的にCommitし、かつ §4-a の解除4条件（一次資料への安定アクセス / 版管理 / 管轄差への対応 / 適格な専門家レビュー）が揃った場合に限る。**現在は再検討しない。**
     - **創業融資の3年収支計画Excel = `KILL`（現在の候補として）/ Routing: `NO_ACTION`。** 理由: ①North StarおよびMD-1への抽象的な接続は説明できても、現在の律速を十分に動かす証拠がない ②60日後の成否から得られるRealityの識別力が低い ③無名出品者としてのdistribution advantageがない ④強い既存出品者が存在する ⑤Human固有知見を投入しても購入意図がある証拠にはならない ⑥Humanの時間と注意を投入する優先順位として弱い。**Humanへ25分の音声メモを要求しない。商品の作成・出品・追加調査・差別化案の検討を開始しない。**
  6. **創業融資Excelの再検討trigger（B-12の実例）**: 再検討triggerは**内部でより良い商品案が出たことではない**。次の**外部証拠**のいずれかが得られた場合だけ候補として再登録できる——①対象顧客からの具体的な購入意図 ②既存商品で解消されていない反復的な不満 ③予約・事前購入・依頼など金銭に近いSignal ④無名出品者でも到達可能なdistribution advantage ⑤現在より短期間で判定可能なExperiment設計。
  7. **証拠水準 `Observed` / `Derived` を分離する**（`research/INDEX.md` 凡例 / `OS.md` HI-4 F5）。**raw dataまたは再現可能な取得記録がworktreeに存在しない数値は、正本を上書きせず `HOLD` として報告する。** 本日のココナラ調査（0件率 / 中央値 / 総流通推計 / **「60日以内に確定1円が出る確率 2.2%」** / 各関門の積算 / Indie Hackersとの整合評価）は取得記録が worktree に無いため**全て `HOLD`。判断の前提・結論欄・数値表のいずれへも取り込まない**（`HOLD` 対象として名指しすることと、正本化することは別である）。D-005 の「ココナラ170件の93.5%が実績0」も同じ扱いとし、他の判断の前提として引用しない（D-005 の決定内容そのものは変更しない）。
  8. **`direction/DESIRE_TO_REALITY_SERVICE_DESIGN.md` §4 の2語を明確化する**（同 §4-a / §4-b）。「法規制のかかる領域」= 公的申請 / 指定・許認可 / 資格判定 / 法的適否 / 公的報酬・給付の計算など、誤りが第三者の権利・事業・金銭へ重大な影響を与える成果物。**単なる免責文では解除できない。** 「他社サービスの模倣」= コピー・近似再現・出所の混同・業種名だけの差し替え・他社固有価値の流用は禁止。市場の存在を証拠として使うこと・価格帯や納品形式を市場構造として観測すること・同カテゴリへ独立設計の商品を出すこと・他社の成功失敗から需要仮説を作ることは許可。**ただし独自の因果価値が説明できない場合は、模倣禁止への抵触有無にかかわらず `NO_ACTION`。**
  9. **Encounter Queue Day 2（E-013 / 2026-08-10 18:30 JST）は予定どおり継続する。** 判定: Day 2 は**独立したStrategy Committed済みExperiment**であり、本日 `KILL` した2候補のいずれにも依存しない（E-013の対象clusterは「一人事業・反復事務」「Creator」で、Day 1 実測がその範囲内 — `experiments/encounter-queue/LEDGER.md`）。よって**変更しない**。
- **Why**:
  1. 現在の位相は**探索期**であり（`CURRENT_STATE.md` §7-0）、現在の戦略は「トークンと時間を筋のいい一点を見つけることに集中投下する」である。**探索期に既定が「やる」のままだと、筋の悪い候補へ資源が流れる**。HI-2 の「やる」は本来Handoff規律であって着手判断の規律ではなく、この取り違えが起きうる形で書かれていた。
  2. 2候補はいずれも「North Starへ接続できる」ことは説明できた。**接続の説明可能性が実行の十分条件になっていたこと自体が欠陥**であり、律速（現在は「会話の本数」— `ROADMAP.md` §0）と次のRealityを必須条件へ昇格させることで塞ぐ。
  3. Strategy Committed の成立条件が「何をやるか」側だけを要求しており、**やらないことと、`NO_ACTION` を戻す条件が事前登録されていなかった**。結果として `NO_ACTION` 判定が「良い案が出た」で崩れうる状態だった（`OS.md` Layer2 C が禁じている崩れ方と同型）。
  4. 本日、到達可能ドメインが拡張されて `coconala.com` が取得可能になった一方、取得記録を保存しない数値が canonical へ流入しかけた。**F5（Evidence帰属ミス）と F9（二次記述をEvidence化）の同時発生**であり、Observed / Derived の分離と「取得記録が無ければ `HOLD`」を規則側へ置く。
- **Supersedes**:
  - `OS.md` HI-2 の「したがって既定は『やらない』ではなく『やる』」を、**着手判断の既定としての読み**において supersede する（Handoff規律としての読みは維持）。
  - `direction/COCONALA_VERDICT_2026-08.md` 冒頭の「`coconala.com` は egress 遮断」を、**2026-08-10 時点の環境事実としてのみ** supersede する（同文書 2026-08-10 追記 (1)）。**等級Bの数値は昇格させない。**
  - D-001〜D-005 の決定内容は変更しない。`DESIRES.md` の North Star / Major Desire、`CONSTRAINTS.md` の条文、`CURRENT_STATE.md` §7-0 の現在の戦略・現在のベットのいずれも変更しない。
- **Explicitly NOT decided here**:
  - **「買い切りテンプレは日本で死んでいる」「Claude Code講座が無名個人にとって唯一強い帯」を正本化しない。** どちらも canonical に存在せず、支える取得記録も worktree に無い。
  - ココナラへの出品可否（`ROADMAP.md` §0 の 2026-08-12 判断は `NO_ACTION` のまま）。
  - 規制領域への参入（Decision 5 の解除条件が揃っていない）。
  - 新商品・新Experimentの開始、外部送信、出品、課金、mainへのmerge。**本Task中にいずれも行っていない。**
- **Rollback**: 本PRのrevertで `OS.md` / `DECISIONS.md` / `CURRENT_STATE.md` / `ROADMAP.md` / `CLAUDE.md` / `research/INDEX.md` / `direction/` 2本 / `.claude/hooks/context-brief.py` が旧stateへ戻る。物理移動・削除・外部作用を伴わないため単一revertで完結する。

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
