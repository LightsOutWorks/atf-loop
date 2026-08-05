// control-plane-canary.test.mjs — F3 カナリアの決定論テスト(node:test / 外部依存なし)。
//
// 方針:
//   - 合成 fixture(synthetic docs)で解析・選定・fail-closed を検証する。
//     W0 のハードコードが無いことは「次 gate を変えた fixture で提案が変わる」ことで示す。
//   - E2E は一時領域に実 git repo(upstream + clone)を作り、runCanary が
//     origin/main の git object だけを読むこと・worktree を変えないこと・
//     失敗時にも artifact を残すこと・STALE 規則を検証する。
//   - repository 本体には一切書き込まない(fixture はすべて os.tmpdir() 配下)。

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { fileURLToPath } from 'node:url';

import {
  CONTROL_DOCS,
  FACTORY_WORKFLOW,
  SCHEMA_VERSION,
  analyzeControlPlane,
  blobSha,
  compareForStaleness,
  decide,
  materialSignature,
  parseExplicitPrereqs,
  parsePrereqBlocks,
  runCanary,
} from './control-plane-canary.mjs';

// ---------- 合成 fixture ----------

function makeOs({ goalFirstLine = '最初から理想を作らない。最短でゴールへ到達する。', extra = '' } = {}) {
  return `# Test OS

## Layer1 — Core Principles

### 5. Goal First

${goalFirstLine}

### 11. Evidence Driven Governance

Evidence creates governance.

### 15. Review Algorithm

1. 最短でゴールへ近付くか

### 18. Operating Rule

When in doubt, do not add.
${extra}`;
}

function makeState({
  nextGate = 'W0',
  nextGateTitle = 'Synthetic distribution canary',
  declarations = null, // 明示指定時は nextGate を無視して太字宣言行をそのまま並べる
  passLines = ['OS正本化F0はPASS。'],
  pins = null, // { os: sha, factory: sha }
  duplicateSection = false,
  extraStatusLine = '',
} = {}) {
  const decl = declarations ?? [`**${nextGate} — ${nextGateTitle}.**`];
  const pinBlock = pins
    ? `
## 13. Evidence Index

| Evidence | Revision |
|---|---|
| canonical \`OS.md\` | blob \`${pins.os}\` |
| \`.github/workflows/factory.yml\` | blob \`${pins.factory}\` |
`
    : '';
  const dup = duplicateSection
    ? `
## 14. Smallest Next Gate

**W0 — Duplicated definition.**
`
    : '';
  return `# Test Current State

Base SHA: \`synthetic\`

## 11. Gate status

${passLines.join('\n')}
${extraStatusLine}

## 12. Smallest Next Gate

${decl.join('\n')}

説明文。

C0とF3は独立laneとして候補になる。1 runで選ぶgateは1件だけとする。
${pinBlock}${dup}`;
}

// 依存順序 section は実 ROADMAP の形状(矢印連鎖 + Foundation の散文依存)を模す
const REAL_FOUNDATION_PROSE =
  'F3は3文書がdefault branchへ揃った後にだけ実行する。F4はF3の後、F5はF4の反復成功後。';

function makeRoadmap({
  duplicateW0 = false,
  w0PassBody = '- compare channels',
  foundationProse = REAL_FOUNDATION_PROSE,
  w0aPrereqBlocks = '',
  omitC0 = false,
} = {}) {
  return `# Test Roadmap

## 5. Gates

### Foundation

#### F0 — OS on default branch

PASS:

- merged

#### F3 — Runtime reads control plane

PASS:

- reads docs

#### F4 — Autonomous evolution PR

PASS:

- unattended draft PR

#### F5 — Bounded auto-merge

Prerequisite:

- F4の反復成功
- deterministic acceptance contract

PASS:

- bounded merge

### World

#### W0 — Comparable distribution canary

PASS:

${w0PassBody}
${duplicateW0 ? '\n#### W0 — Duplicated gate\n\nPASS:\n\n- dup\n' : ''}
#### W0A — Distribution automation
${w0aPrereqBlocks}
PASS:

- automation works

### Capability
${omitC0 ? '' : `
#### C0 — Configuration provenance

PASS:

- provenance recorded
`}
## 8. Dependency-Safe Routing

Gateの現在statusと次の1件はCURRENT_STATE.mdだけに置く。

依存順序:

1. FoundationはF0 → F1 → F2。${foundationProse}
2. World LearningはW0 → W0A → W1。
3. Capability EvolutionはC0 → C1。
4. C0とF3は独立canaryとして並行候補になりうる。ただし1 runにつき選ぶgateは1件。
`;
}

function makeDocs(overrides = {}) {
  return {
    'OS.md': overrides['OS.md'] ?? makeOs(overrides.os ?? {}),
    'CURRENT_STATE.md': overrides['CURRENT_STATE.md'] ?? makeState(overrides.state ?? {}),
    'ROADMAP.md': overrides['ROADMAP.md'] ?? makeRoadmap(overrides.roadmap ?? {}),
  };
}

function analyzeAndDecide(overrides = {}, actualBlobs = null) {
  const analysis = analyzeControlPlane(makeDocs(overrides), actualBlobs);
  return { analysis, decision: decide(analysis) };
}

// ---------- 解析・選定(純関数) ----------

test('正常な3文書から正確に1件だけ提案して PASS', () => {
  const { analysis, decision } = analyzeAndDecide();
  assert.equal(decision.result, 'PASS');
  assert.equal(decision.proposalCount, 1);
  assert.equal(decision.proposal.gate, 'W0');
  assert.ok(analysis.eligible.includes('W0'));
  // 独立 lane 候補が列挙される(主候補は含まない)
  assert.deepEqual([...analysis.independentLaneCandidates].sort(), ['C0', 'F3']);
  // OS 上の選定根拠(Goal First / Evidence Driven)と停止条件が記録される
  const principles = analysis.rationale.map((r) => r.principle).join(' ');
  assert.match(principles, /Goal First/);
  assert.match(principles, /Evidence Driven/);
  assert.ok(analysis.stopConditions.length >= 4);
});

test('文書不足は fail-closed で FAIL(提案なし)', () => {
  const docs = makeDocs();
  docs['ROADMAP.md'] = null;
  const decision = decide(analyzeControlPlane(docs));
  assert.equal(decision.result, 'FAIL');
  assert.equal(decision.proposal, null);
  assert.match(decision.failureReason, /ROADMAP\.md/);
});

test('Smallest Next Gate section の多重定義は FAIL', () => {
  const { decision } = analyzeAndDecide({ state: { duplicateSection: true } });
  assert.equal(decision.result, 'FAIL');
  assert.match(decision.failureReason, /多重定義/);
});

test('gate 宣言が 2 件以上(提案 2 件)は FAIL', () => {
  const { decision } = analyzeAndDecide({
    state: { declarations: ['**W0 — First.**', '**C0 — Second.**'] },
  });
  assert.equal(decision.result, 'FAIL');
  assert.equal(decision.proposal, null);
  assert.match(decision.failureReason, /多重定義|1 件/);
});

test('gate 宣言が 0 件(提案 0 件)は FAIL', () => {
  const { decision } = analyzeAndDecide({ state: { declarations: ['(宣言なし)'] } });
  assert.equal(decision.result, 'FAIL');
  assert.match(decision.failureReason, /0 件|無い/);
});

test('ROADMAP に存在しない gate の指名は FAIL', () => {
  const { decision } = analyzeAndDecide({ state: { nextGate: 'Z9' } });
  assert.equal(decision.result, 'FAIL');
  assert.match(decision.failureReason, /存在しない gate/);
  assert.match(decision.failureReason, /Z9/);
});

test('ROADMAP の gate 多重定義は FAIL', () => {
  const { decision } = analyzeAndDecide({ roadmap: { duplicateW0: true } });
  assert.equal(decision.result, 'FAIL');
  assert.match(decision.failureReason, /gate 定義が多重/);
});

test('prerequisite 未達(W0A の前提 W0 に PASS 記録なし)は FAIL', () => {
  const { decision } = analyzeAndDecide({ state: { nextGate: 'W0A' } });
  assert.equal(decision.result, 'FAIL');
  assert.match(decision.failureReason, /prerequisite 未達/);
  assert.match(decision.failureReason, /W0/);
});

test('prerequisite が PASS 記録で満たされれば提案できる', () => {
  const { decision } = analyzeAndDecide({
    state: { nextGate: 'W0A', passLines: ['OS正本化F0はPASS。', 'W0はPASS。'] },
  });
  assert.equal(decision.result, 'PASS');
  assert.equal(decision.proposal.gate, 'W0A');
});

test('否定文は PASS 証拠にならない(前提は未達として FAIL)', () => {
  // 「PASSしていない」は明示的な非 PASS の記述 = 証拠なし → 未達 FAIL。
  // 明示 PASS 宣言と否定文が同居する「矛盾」の HOLD は別テストで検証する。
  const { decision } = analyzeAndDecide({
    state: { nextGate: 'W0A', passLines: ['OS正本化F0はPASS。', 'W0はまだPASSしていない。'] },
  });
  assert.equal(decision.result, 'FAIL');
  assert.match(decision.failureReason, /prerequisite 未達/);
  assert.notEqual(decision.result, 'PASS');
});

test('散文 prerequisite(機械検証不能)は HOLD', () => {
  const { decision } = analyzeAndDecide({
    state: { nextGate: 'F5', passLines: ['OS正本化F0はPASS。', 'F4はPASS。'] },
  });
  assert.equal(decision.result, 'HOLD');
  assert.match(decision.failureReason, /機械検証不能/);
});

test('主候補が既に PASS 記録済みなら矛盾として FAIL', () => {
  const { decision } = analyzeAndDecide({
    state: { nextGate: 'W0', passLines: ['OS正本化F0はPASS。', 'W0はPASS。'] },
  });
  assert.equal(decision.result, 'FAIL');
  assert.match(decision.failureReason, /既に PASS/);
});

test('synthetic な次 gate 変更に提案が追従する(W0 ハードコードなし)', () => {
  const a = analyzeAndDecide().decision;
  const b = analyzeAndDecide({ state: { nextGate: 'C0', nextGateTitle: 'Configuration provenance' } }).decision;
  assert.equal(a.result, 'PASS');
  assert.equal(b.result, 'PASS');
  assert.equal(a.proposal.gate, 'W0');
  assert.equal(b.proposal.gate, 'C0');
  assert.notEqual(a.proposal.gate, b.proposal.gate);
});

test('evidence pin 不一致は FAIL、一致なら PASS', () => {
  const osText = makeOs();
  const factoryText = 'name: factory-stub\n';
  const pins = { os: blobSha(osText), factory: blobSha(factoryText) };
  const docs = makeDocs({ 'OS.md': osText, state: { pins } });
  const okBlobs = {
    'OS.md': blobSha(osText),
    'CURRENT_STATE.md': blobSha(docs['CURRENT_STATE.md']),
    'ROADMAP.md': blobSha(docs['ROADMAP.md']),
    [FACTORY_WORKFLOW]: blobSha(factoryText),
  };
  assert.equal(decide(analyzeControlPlane(docs, okBlobs)).result, 'PASS');

  const badBlobs = { ...okBlobs, 'OS.md': blobSha(osText + '\nchanged') };
  const bad = decide(analyzeControlPlane(docs, badBlobs));
  assert.equal(bad.result, 'FAIL');
  assert.match(bad.failureReason, /evidence pin 不一致/);
});

test('ROADMAP §8 の散文依存(F4はF3の後)を無視して PASS しない(HOLD)', () => {
  // 敵対的レビューで確認された fail-open の再現ケース: 実 ROADMAP と同形の散文依存の下で
  // 次 gate を F4 にしても、F3 の PASS 記録なしに提案してはならない
  const { decision } = analyzeAndDecide({
    state: { nextGate: 'F4', nextGateTitle: 'Autonomous evolution PR' },
  });
  assert.equal(decision.result, 'HOLD');
  assert.equal(decision.proposal, null);
  assert.match(decision.failureReason, /未解釈 routing 文/);
  assert.match(decision.failureReason, /F4/);
});

test('散文 routing 制約を持つ gate(F3)が主候補でも HOLD(fail-closed)', () => {
  const { decision } = analyzeAndDecide({
    state: { nextGate: 'F3', nextGateTitle: 'Runtime reads control plane' },
  });
  assert.equal(decision.result, 'HOLD');
  assert.equal(decision.proposal, null);
});

test('散文 routing 文に現れる候補は eligible から除外される', () => {
  const { analysis, decision } = analyzeAndDecide();
  assert.equal(decision.result, 'PASS');
  assert.ok(!analysis.eligible.includes('F4'));
  assert.ok(!analysis.eligible.includes('F3'));
  assert.ok(analysis.eligible.includes('C0'));
  assert.ok(analysis.uninterpretedRoutingSentences.length >= 2);
});

test('肯定と否定が同居する PASS 記録は矛盾として前提充足に使わない(HOLD)', () => {
  const { decision } = analyzeAndDecide({
    state: { nextGate: 'W0A', passLines: ['OS正本化F0はPASS。', 'W0はPASS。', 'W0はまだPASSしていない。'] },
  });
  assert.equal(decision.result, 'HOLD');
  assert.notEqual(decision.result, 'PASS');
});

test('Prerequisite の inline 形式は解析され、言及のみ(解析不能)は fail-closed に HOLD', () => {
  assert.deepEqual(parseExplicitPrereqs('Prerequisite: F9の完了\n\nPASS:\n\n- x'), ['F9の完了']);
  const { decision } = analyzeAndDecide({
    roadmap: { w0PassBody: '- compare channels\n- prerequisite handling is defined elsewhere' },
  });
  assert.equal(decision.result, 'HOLD');
  assert.match(decision.failureReason, /prerequisite/i);
});

// ---------- EL 監査対応の敵対的テスト ----------

test('「W0 PASS条件は計測中」の文字列共起を W0 PASS と誤認しない', () => {
  // prerequisite 側: 共起は証拠にならず、W0A の前提 W0 は未達 → FAIL(fail-open しない)
  const a = analyzeAndDecide({
    state: { nextGate: 'W0A', passLines: ['OS正本化F0はPASS。', 'W0 PASS条件は計測中。'] },
  });
  assert.equal(a.decision.result, 'FAIL');
  assert.match(a.decision.failureReason, /prerequisite 未達/);
  assert.match(a.decision.failureReason, /W0/);
  // 主候補側: 共起で「W0 は既に PASS 済み」とも誤認しない(W0 の提案は正常に通る)
  const b = analyzeAndDecide({
    state: { nextGate: 'W0', passLines: ['OS正本化F0はPASS。', 'W0 PASS条件は計測中。'] },
  });
  assert.equal(b.decision.result, 'PASS');
  assert.equal(b.decision.proposal.gate, 'W0');
});

test('明示的な gate result/status 宣言だけを PASS 証拠として認める', () => {
  // 認める形式: 「W0はPASS。」「W0: PASS」「| W0 | PASS |」
  for (const passLine of ['W0はPASS。', 'W0: PASS', '| W0 | PASS |']) {
    const { decision } = analyzeAndDecide({
      state: { nextGate: 'W0A', passLines: ['OS正本化F0はPASS。', passLine] },
    });
    assert.equal(decision.result, 'PASS', `明示宣言 "${passLine}" は証拠になるべき`);
    assert.equal(decision.proposal.gate, 'W0A');
  }
  // 認めない形式: 文字列共起・後続に本文が続く形
  for (const proseLine of ['W0 PASS条件は計測中。', 'W0のPASS条件を事前登録した。', 'PASS報告にW0を含める。']) {
    const { decision } = analyzeAndDecide({
      state: { nextGate: 'W0A', passLines: ['OS正本化F0はPASS。', proseLine] },
    });
    assert.equal(decision.result, 'FAIL', `共起 "${proseLine}" を証拠にしてはならない`);
  }
});

test('同一 gate の複数 Prerequisite ブロックを全件解析する(後続の未達を無視しない)', () => {
  // parsePrereqBlocks が 2 ブロックとも返すこと
  const { blocks } = parsePrereqBlocks(
    'Prerequisite:\n\n- A1の完了\n\nPrerequisite:\n\n- B2の完了\n\nPASS:\n\n- x',
  );
  assert.equal(blocks.length, 2);
  assert.deepEqual(blocks.map((b) => b.items), [['A1の完了'], ['B2の完了']]);

  // 第 1 ブロック(W0)は充足済み・第 2 ブロック(W9)が未達 → PASS してはならない
  const twoBlocks = 'Prerequisite:\n\n- W0の反復成功\n\nPrerequisite:\n\n- W9の完了\n';
  const { decision } = analyzeAndDecide({
    roadmap: { w0aPrereqBlocks: `\n${twoBlocks}` },
    state: { nextGate: 'W0A', passLines: ['OS正本化F0はPASS。', 'W0はPASS。'] },
  });
  assert.equal(decision.result, 'FAIL');
  assert.match(decision.failureReason, /W9/);
});

test('候補資格の変化(独立 lane 候補の定義削除)も materially stale', () => {
  // C0 の gate 定義だけを削除: 旧署名の対象(主候補 section・chains・散文・SNG)は不変のまま
  // C0 が eligible から落ちる。この変化を materially stale として検出できること
  const base = analyzeControlPlane(makeDocs());
  const changed = analyzeControlPlane(makeDocs({ roadmap: { omitC0: true } }));

  // 変化が「候補資格のみ」であることを確認(主候補まわりの署名要素は同一)
  assert.equal(base.signatureParts.smallestNextGateSection, changed.signatureParts.smallestNextGateSection);
  assert.equal(base.signatureParts.primaryRoadmapSection, changed.signatureParts.primaryRoadmapSection);
  assert.deepEqual(base.signatureParts.dependencyChains, changed.signatureParts.dependencyChains);
  assert.ok(base.eligible.includes('C0'));
  assert.ok(!changed.eligible.includes('C0'));

  const cmp = compareForStaleness(base, changed);
  assert.equal(cmp.materiallyStale, true);
  assert.ok(cmp.diffKeys.some((k) => ['eligible', 'prerequisitesByGate', 'independentLaneCandidates'].includes(k)));
});

// ---------- materiality 署名 ----------

test('無関係な追記では署名が変わらず、次 gate・PASS 条件の変更では変わる', () => {
  const base = analyzeControlPlane(makeDocs());
  const unrelated = analyzeControlPlane(makeDocs({ state: { extraStatusLine: '備考: 作品追加のみ。' } }));
  assert.equal(materialSignature(base), materialSignature(unrelated));
  assert.equal(compareForStaleness(base, unrelated).materiallyStale, false);

  const gateChanged = analyzeControlPlane(makeDocs({ state: { nextGate: 'C0' } }));
  const cmp1 = compareForStaleness(base, gateChanged);
  assert.equal(cmp1.materiallyStale, true);

  const passCondChanged = analyzeControlPlane(makeDocs({ roadmap: { w0PassBody: '- 強化された PASS 条件' } }));
  const cmp2 = compareForStaleness(base, passCondChanged);
  assert.equal(cmp2.materiallyStale, true);
});

test('散文 routing 文(未解釈の依存)の変更も materially stale', () => {
  const base = analyzeControlPlane(makeDocs());
  const proseChanged = analyzeControlPlane(
    makeDocs({ roadmap: { foundationProse: 'F4とF5はいつでも実行できる。' } }),
  );
  const cmp = compareForStaleness(base, proseChanged);
  assert.equal(cmp.materiallyStale, true);
});

test('変更後文書が解析不能なら materiality 判定不能 → stale 扱い(fail-closed)', () => {
  const base = analyzeControlPlane(makeDocs());
  const broken = analyzeControlPlane({ 'OS.md': null, 'CURRENT_STATE.md': null, 'ROADMAP.md': null });
  const cmp = compareForStaleness(base, broken);
  assert.equal(cmp.materiallyStale, true);
});

// ---------- E2E(実 git repo・一時領域のみ) ----------

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'control-plane-canary-test-'));
test.after(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

function runGit(dir, ...args) {
  return execFileSync('git', ['-c', 'user.name=test', '-c', 'user.email=test@example.com', ...args], {
    cwd: dir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, GIT_CONFIG_SYSTEM: '/dev/null', GIT_CONFIG_GLOBAL: '/dev/null' },
  });
}

const FACTORY_STUB = 'name: factory-stub\n# E2E fixture。本物の factory.yml ではない。\n';

function writeUpstreamFiles(dir, docs, { withFactory = true } = {}) {
  for (const [file, content] of Object.entries(docs)) {
    if (content == null) continue;
    fs.writeFileSync(path.join(dir, file), content);
  }
  if (withFactory) {
    fs.mkdirSync(path.join(dir, '.github', 'workflows'), { recursive: true });
    fs.writeFileSync(path.join(dir, FACTORY_WORKFLOW), FACTORY_STUB);
  }
}

function makeFixtureRepos(name, docs, opts = {}) {
  const upstream = path.join(tmpRoot, `${name}-upstream`);
  const clone = path.join(tmpRoot, `${name}-clone`);
  fs.mkdirSync(upstream, { recursive: true });
  runGit(upstream, 'init', '-q', '-b', 'main');
  writeUpstreamFiles(upstream, docs, opts);
  runGit(upstream, 'add', '-A');
  runGit(upstream, 'commit', '-q', '-m', 'fixture: initial control plane');
  runGit(tmpRoot, 'clone', '-q', upstream, clone);
  return { upstream, clone };
}

function commitUpstreamChange(upstream, mutate, message) {
  mutate(upstream);
  runGit(upstream, 'add', '-A');
  runGit(upstream, 'commit', '-q', '-m', message);
  return runGit(upstream, 'rev-parse', 'HEAD').trim();
}

function worktreeState(dir) {
  return {
    head: runGit(dir, 'rev-parse', 'HEAD').trim(),
    status: runGit(dir, 'status', '--porcelain=v1', '-uall'),
  };
}

function pinnedDocs() {
  const osText = makeOs();
  const pins = { os: blobSha(osText), factory: blobSha(FACTORY_STUB) };
  return makeDocs({ 'OS.md': osText, state: { pins } });
}

test('E2E: origin/main を読んで PASS し、artifact に SHA 証拠を残し、worktree を変えない', async () => {
  const docs = pinnedDocs();
  const { upstream, clone } = makeFixtureRepos('pass', docs);
  const before = worktreeState(clone);
  const artifactPath = path.join(tmpRoot, 'pass-artifact.json');

  const { artifact, exitCode } = await runCanary({ repoDir: clone, artifactPath, env: {} });

  assert.equal(exitCode, 0);
  assert.equal(artifact.schema, SCHEMA_VERSION);
  assert.equal(artifact.result, 'PASS');
  assert.equal(artifact.proposalCount, 1);
  assert.equal(artifact.proposal.gate, 'W0');
  assert.equal(artifact.git.defaultBranch, 'main');
  assert.equal(artifact.git.mainShaAtStart, runGit(upstream, 'rev-parse', 'HEAD').trim());
  assert.equal(artifact.git.mainShaAtFinalFetch, artifact.git.mainShaAtStart);
  for (const f of CONTROL_DOCS) assert.equal(artifact.blobs[f], blobSha(docs[f]));
  assert.equal(artifact.blobs[FACTORY_WORKFLOW], blobSha(FACTORY_STUB));
  assert.equal(artifact.staleness.materiallyStale, false);
  assert.ok(artifact.generatedAtUtc);
  assert.ok(Array.isArray(artifact.unknowns) && artifact.unknowns.length > 0);

  // artifact は repo 外に書かれ、JSON として読める
  const onDisk = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  assert.equal(onDisk.result, 'PASS');
  assert.ok(!artifactPath.startsWith(clone + path.sep));

  // worktree・HEAD は実行前後で不変(read-only)
  const after = worktreeState(clone);
  assert.deepEqual(after, before);
  assert.equal(after.status, '');
});

test('E2E: PR 側 worktree の改変版ではなく origin/main の内容を読む', async () => {
  const docs = pinnedDocs();
  const { clone } = makeFixtureRepos('worktree-tamper', docs);
  // PR 実装者が worktree 上の制御文書を書き換えても判断は origin/main を使う
  fs.writeFileSync(
    path.join(clone, 'CURRENT_STATE.md'),
    makeState({ nextGate: 'C0', nextGateTitle: 'Tampered in worktree' }),
  );
  const artifactPath = path.join(tmpRoot, 'tamper-artifact.json');
  const { artifact, exitCode } = await runCanary({ repoDir: clone, artifactPath, env: {} });
  assert.equal(exitCode, 0);
  assert.equal(artifact.result, 'PASS');
  assert.equal(artifact.proposal.gate, 'W0'); // worktree の C0 改変は無視される
});

test('E2E: 文書欠落でも artifact を必ず生成し FAIL で停止する', async () => {
  const docs = pinnedDocs();
  const broken = { ...docs, 'CURRENT_STATE.md': null };
  const { clone } = makeFixtureRepos('fail', broken);
  const before = worktreeState(clone);
  const artifactPath = path.join(tmpRoot, 'fail-artifact.json');

  const { artifact, exitCode } = await runCanary({ repoDir: clone, artifactPath, env: {} });

  assert.notEqual(exitCode, 0);
  assert.equal(artifact.result, 'FAIL');
  assert.match(artifact.failureReason, /CURRENT_STATE\.md/);
  assert.equal(artifact.proposal, null);
  const onDisk = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  assert.equal(onDisk.result, 'FAIL');
  assert.ok(onDisk.generatedAtUtc);
  assert.deepEqual(worktreeState(clone), before);
});

test('E2E: run 中の material な main 変更(次 gate 変更)は STALE', async () => {
  const docs = pinnedDocs();
  const { upstream, clone } = makeFixtureRepos('stale', docs);
  const artifactPath = path.join(tmpRoot, 'stale-artifact.json');

  const { artifact, exitCode } = await runCanary({
    repoDir: clone,
    artifactPath,
    env: {},
    afterStartSnapshot: async () => {
      commitUpstreamChange(
        upstream,
        (dir) =>
          fs.writeFileSync(
            path.join(dir, 'CURRENT_STATE.md'),
            makeState({ nextGate: 'C0', nextGateTitle: 'Changed mid-run', pins: null }),
          ),
        'material: change smallest next gate',
      );
    },
  });

  assert.equal(artifact.result, 'STALE');
  assert.notEqual(exitCode, 0);
  assert.equal(artifact.staleness.materiallyStale, true);
  assert.notEqual(artifact.git.mainShaAtFinalFetch, artifact.git.mainShaAtStart);
  assert.ok(artifact.staleness.changedWatchedFiles.includes('CURRENT_STATE.md'));
  assert.equal(artifact.proposal, null);
  assert.ok(fs.existsSync(artifactPath));
});

test('E2E: run 中に候補資格が変わる main 変更(C0 定義の削除)は STALE', async () => {
  const docs = pinnedDocs();
  const { upstream, clone } = makeFixtureRepos('candidate-stale', docs);
  const artifactPath = path.join(tmpRoot, 'candidate-stale-artifact.json');

  const { artifact, exitCode } = await runCanary({
    repoDir: clone,
    artifactPath,
    env: {},
    afterStartSnapshot: async () => {
      commitUpstreamChange(
        upstream,
        (dir) => fs.writeFileSync(path.join(dir, 'ROADMAP.md'), makeRoadmap({ omitC0: true })),
        'material: drop C0 gate definition (candidate eligibility change)',
      );
    },
  });

  assert.equal(artifact.result, 'STALE');
  assert.notEqual(exitCode, 0);
  assert.equal(artifact.staleness.materiallyStale, true);
  assert.ok(artifact.staleness.changedWatchedFiles.includes('ROADMAP.md'));
  assert.equal(artifact.proposal, null);
});

test('E2E: non-material な main 変更(無関係ファイル追加)では STALE にせず継続', async () => {
  const docs = pinnedDocs();
  const { upstream, clone } = makeFixtureRepos('nonmaterial', docs);
  const artifactPath = path.join(tmpRoot, 'nonmaterial-artifact.json');
  let newHead = null;

  const { artifact, exitCode } = await runCanary({
    repoDir: clone,
    artifactPath,
    env: {},
    afterStartSnapshot: async () => {
      newHead = commitUpstreamChange(
        upstream,
        (dir) => {
          fs.mkdirSync(path.join(dir, 'works', 'seed-999'), { recursive: true });
          fs.writeFileSync(path.join(dir, 'works', 'seed-999', 'note.txt'), 'unrelated work\n');
        },
        'works: unrelated addition',
      );
    },
  });

  assert.equal(exitCode, 0);
  assert.equal(artifact.result, 'PASS');
  assert.equal(artifact.staleness.materiallyStale, false);
  assert.equal(artifact.git.mainShaAtStart !== newHead, true);
  assert.equal(artifact.git.mainShaAtFinalFetch, newHead);
  assert.equal(artifact.staleness.checkedHeadSha, newHead); // 検査済み head を記録して継続
  assert.deepEqual(artifact.staleness.changedWatchedFiles, []);
});

test('E2E: 正本 blob が変わっても判断が依存する要素が不変なら継続(materially stale ではない)', async () => {
  const docs = pinnedDocs();
  const { upstream, clone } = makeFixtureRepos('doctouch', docs);
  const artifactPath = path.join(tmpRoot, 'doctouch-artifact.json');

  const { artifact, exitCode } = await runCanary({
    repoDir: clone,
    artifactPath,
    env: {},
    afterStartSnapshot: async () => {
      commitUpstreamChange(
        upstream,
        (dir) => {
          // Evidence Index の後(署名対象外)への追記。gate・prerequisite・PASS 条件は不変
          fs.appendFileSync(path.join(dir, 'CURRENT_STATE.md'), '\n備考: 表記の微修正のみ。\n');
        },
        'docs: non-material touch to CURRENT_STATE',
      );
    },
  });

  assert.equal(exitCode, 0);
  assert.equal(artifact.result, 'PASS');
  assert.equal(artifact.staleness.materiallyStale, false);
  assert.deepEqual(artifact.staleness.changedWatchedFiles, ['CURRENT_STATE.md']);
});

test('E2E: artifact path が repository 内なら拒否して一時領域へ退避する', async () => {
  const docs = pinnedDocs();
  const { clone } = makeFixtureRepos('inside-artifact', docs);
  const runnerTemp = path.join(tmpRoot, 'inside-artifact-temp');
  const { artifact, artifactPath } = await runCanary({
    repoDir: clone,
    artifactPath: path.join(clone, 'artifact.json'),
    env: { RUNNER_TEMP: runnerTemp },
  });
  assert.equal(artifact.result, 'PASS');
  assert.ok(!artifactPath.startsWith(clone + path.sep));
  assert.ok(fs.existsSync(path.join(runnerTemp, 'control-plane-canary', 'artifact.json')));
  assert.ok(!fs.existsSync(path.join(clone, 'artifact.json')));
  assert.equal(worktreeState(clone).status, '');
});

test('E2E: CLI エントリポイント(node scripts/control-plane-canary.mjs)が JSON を出力する', () => {
  const docs = pinnedDocs();
  const { clone } = makeFixtureRepos('cli', docs);
  const artifactPath = path.join(tmpRoot, 'cli-artifact.json');
  const scriptPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'control-plane-canary.mjs');

  const stdout = execFileSync(process.execPath, [scriptPath, '--artifact', artifactPath], {
    cwd: clone,
    encoding: 'utf8',
  });
  const artifact = JSON.parse(stdout);
  assert.equal(artifact.result, 'PASS');
  assert.equal(JSON.parse(fs.readFileSync(artifactPath, 'utf8')).result, 'PASS');
});
