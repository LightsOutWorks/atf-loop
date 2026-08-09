# ENV PREFLIGHT — 2026-08-08

Session class: Claude Code / Execution Readiness(市場非依存)

Provenance: 本文書は 2026-08-08 の CURRENT STATE OVERRIDE(Human提供・会話レベル指示。観測時点でリポジトリ未収載)の Task A / C / D / E に対する実測証拠である。市場候補・Demand Scan結果・Contact文面・Ledger具体値・Route裁定・CURRENT_STATEの最終判断を一切含まない。並行中のFable市場探索とは対象ファイル・対象領域が重複しない。

Evidence分類の語彙: `FACT_REACHABLE` / `AUTH_REQUIRED` / `RATE_LIMITED` / `HARNESS_BLOCKED` / `UNKNOWN`。

HARNESS_BLOCKED は「このHarness・このegressから到達できない」ことのみを意味し、需要不存在・Evidence不存在を意味しない。

---

## 1. Canonical State(観測: 2026-08-08 07:00Z 前後)

- main HEAD: `5e31133e09c8c6dfb0bf4bb3298441fda7a4c103`(PR #29 merge)
- 正本文書(main上): `OS.md` / `CURRENT_STATE.md` / `ROADMAP.md` / `JOURNAL.md` / `CONSTRAINTS.md`
- **Stale判定**: `CURRENT_STATE.md` 先頭 canonical block の `base_sha` は `ee85650…` で、main HEAD より 1 merge(PR #29)古い。F3 readerのstaleness検知の対象であり、更新はCommit後のExecutor一系統が行う(本セッションでは触れない)
- 2026-08-08 OVERRIDE 文書自体はリポジトリ未収載。正本化(commit)はヒロの裁可事項

### Open PR

| PR | 状態 | branch | 変更ファイル | 備考 |
|---|---|---|---|---|
| #30 | open / draft | `claude/genome-factory-design-538h9e`(main+3, behind 0) | `GENOME_FACTORY.md`, `RESEARCH.md`(追加のみ) | OVERRIDE以前のRoute提案文書。衝突時はOVERRIDE優先。処置はヒロ裁可 |
| #24 | open / draft | `claude/w0-distribution-preregistration-mzs3eq`(behind 28) | `experiments/w0/*`(追加のみ) | W0 precursor、HOLD中 |

### Stale branch(open PRなし・mainへ未merge)

| branch | behind/ahead vs main | 最終commit |
|---|---|---|
| `claude/browser-fps-toy-game-g0ipp9` | 85 / 2 | 2026-07-27 |
| `claude/factory-gate-fix-run2` | 85 / 8 | 2026-07-28 |
| `claude/root-catalog-address-unify` | 85 / 27 | 2026-08-01 |
| `claude/workflow-dispatch-pipeline-c8n7zm` | 85 / 6 | 2026-07-28 |

削除は不可逆のため実施しない(処置はヒロ裁可)。

### Fable成果物と競合し得るファイル(本セッション不可触)

- `CURRENT_STATE.md` / `ROADMAP.md` / `JOURNAL.md`(Route裁定・最終判断の書き込み先になり得る)
- 市場候補・Experiment Ledger・Contact Pack等の新規ファイル(schema UNKNOWN。推測実装をしない)

### CI状態

直近12 runすべて success(2026-08-06)。main HEAD `5e31133` 上で `evolution-control-plane-canary`(run 31093913088)および Pages deploy(run 31093875683)success。既知の赤なし。

---

## 2. Environment Preflight — Sensor到達性(実測 2026-08-08 06:53–07:04Z)

経路の前提: 本環境のoutboundは agent proxy 経由。Network access = Custom(許可7ドメイン+default package managers)。egressはcloud datacenter IP。**origin側ブロックは許可ドメイン設定の変更では解消しない。**

| Domain / endpoint | HTTP実測 | 分類 | 備考 |
|---|---|---|---|
| `public.api.bsky.app` `getProfile` | 200 | FACT_REACHABLE | 無認証AppView読み取り可 |
| `public.api.bsky.app` `searchPosts` | 403(UA非依存、BunnyCDNブロックページ) | **HARNESS_BLOCKED**(origin側) | proxy CONNECTは成功。検索のみorigin側で拒否 |
| `bsky.social` `describeServer` | 200 | FACT_REACHABLE | 認証route(createSession)は未試行=credential必要 → AUTH_REQUIRED / UNKNOWN。credential投入はHuman Gate |
| `hn.algolia.com` search / search_by_date | 200 | FACT_REACHABLE | 日付フィルタ(`numericFilters=created_at_i>…`)動作確認済み。tags指定・全文検索可 |
| `news.ycombinator.com` `/` `/item?id=1` | 200 / 200 | FACT_REACHABLE | 閲覧可。書き込みは対象外(第三者接触はHuman Gate) |
| `api.stackexchange.com` | 200 | FACT_REACHABLE + **RATE_LIMITED注記** | 無key時 quota 300/day/IP(実測 quota_remaining=299)。key登録(無料・要アカウント=Human Gate)で10k/day |
| `www.reddit.com` HTML(`robots.txt`, `/r/programming/`) | 200 / 200 | FACT_REACHABLE(HTML面のみ) | |
| `www.reddit.com` `*.json` | 403(originブロックページ) | **HARNESS_BLOCKED**(origin側) | datacenter IP拒否。UA変更・許可ドメイン設定では解消せず |
| `oauth.reddit.com` `/api/v1/me` | 403(HTMLブロックページ。正常時は401 JSONが期待値) | **HARNESS_BLOCKED**(origin側) | 無認証要求が401ではなくブロックページ=IPレベル拒否の兆候。有効OAuth token通過時の挙動は UNKNOWN |
| (参考)`old.reddit.com` / `api.reddit.com` / `gateway.reddit.com` / `hacker-news.firebaseio.com` / `api.bsky.app` | CONNECT 403 | HARNESS_BLOCKED(proxy側) | 許可ドメイン未登録。必要ならヒロがCustom listへ追加(新環境セッションから適用) |

### Package manager経路

- `registry.npmjs.org` ping 200。`npm view playwright version` → `1.62.1` 取得成功(メタデータ経路正常)
- `pypi.org` 200
- ランタイム: node v22.22.2 / npm 10.9.7 / python3 3.11.15

### 維持事項(本セッションで再検証せず)

- GitHub Issues Sensor = NO-GO(維持)
- Public Real-time Demand Route = HOLD / 検証はFable側
- X = NOT_TESTED — AUTH / PAID ACCESS REQUIRED(契約・credit購入はHuman Commit前)

---

## 3. Execution Readiness(Task D)

| 項目 | 状態 | 証拠 |
|---|---|---|
| repository clone | OK | 本セッションで clone 済み・fetch 正常 |
| branch作成 | OK | `claude/network-access-discovery-lnh3au` がmain HEAD同値で存在。全branch fetch可 |
| test実行(secret不要範囲) | OK | `node smoke.mjs works/seed-001` → PASS 6/6、依存install不要 |
| CI | OK | 直近12 run success(§1) |
| PR作成経路 | OK | 本文書のdraft PR作成で実証(PR番号は本文書commit後に確定) |
| rollback | OK | PRベース運用。mainは直近も通常merge運用であり、`git revert` / PR close / branch削除で可逆 |
| Claudeが自律完遂できる範囲 | 調査・Evidence取得・設計・実装・テスト・修正・branch push・draft PR作成まで | 本セッションで各経路を実測 |
| Human Gateが必要な地点 | 公開 / 支出 / 契約 / 第三者接触(reply・DM含む) / credential・secret投入 / 許可ドメイン変更 / mainへのmerge / Phase移行 | OVERRIDE Boundary・§21による |

---

## 4. Execution Blockers(Fable Commit後の実行を止め得るHard Blockerのみ)

- **B1 — Bluesky検索**: 無認証 `searchPosts` はorigin側で遮断(HARNESS_BLOCKED)。読み取り系(getProfile等)は可。解消候補は (a) 認証route(bsky.social、credential=Human Gate)、(b) 別egress。どちらもHuman裁可なしに実行しない
- **B2 — Reddit**: JSON API・OAuth APIともorigin側遮断(HARNESS_BLOCKED)。HTML面のみ200。有効OAuth token通過時の挙動はUNKNOWN(token取得=アカウント/app登録=Human Gate)。Reddit依存Routeは現harnessから直接実行不可として計画すること
- **B3 — Stack Exchange quota**: 無keyでは300 req/day/IP。大量走査を含むRouteはkey登録(Human Gate)を前提に見積ること
- 上記以外に市場非依存のHard Blockerは検出されなかった(git / CI / PR / test / package manager 全経路正常)

Task E判定: 上記B1〜B3はいずれも「支出ゼロ・第三者接触なし・既存CapabilityのREUSE」では解消不能(credential・環境設定変更=Human Gate)。よって修正対象なし = 本文書の追加以外 **NO_ACTION**。

---

## 5. Handoff(Fable最終出力後、Executorへ渡す最小情報)

1. ヒロのCommit 1件(採用Route・対象・爆風半径の裁可)
2. Fable成果物の正本位置(commit先ファイルパス。schema含む。推測しない)
3. 採用RouteのSensor依存が本文書§2の分類と整合するかの確認(Reddit/Bluesky検索依存なら事前にHuman Gate解消が必要)
4. 第三者接触が含まれる場合: 送信行為はヒロ手動(1行為まで圧縮済みであること)
5. 本文書のstale判定(§1)の解消はExecutorがCURRENT_STATE更新時に一括で行う
