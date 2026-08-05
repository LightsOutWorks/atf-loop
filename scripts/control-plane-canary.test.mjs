// control-plane-canary.test.mjs — F3 precursor canary の決定論テスト(node:test・外部依存なし)。
//
// fixture はすべて os.tmpdir() 配下に作る。repository へは一切書き込まない。

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CONTROL_DOCS,
  EXIT_CODES,
  FACTORY_WORKFLOW,
  GATE_STATUSES,
  ROADMAP_BLOCK,
  SCHEMA_VERSION,
  STATE_BLOCK,
  analyzeControlPlane,
  decide,
  extractJsonBlocks,
  findCycle,
  runCanary,
} from './control-plane-canary.mjs';

// ---------- fixture ----------

const ZERO_SHA = '0'.repeat(40);

// 既定の gate 集合: F0 は PASS 済み、F3 は F0 待ち(充足済み)、F4 は F3 待ち(未達)、W0 / C0 は前提なし
const DEFAULT_GATES = [
  { id: 'F0', lane: 'foundation', status: 'PASS', prerequisites: [] },
  { id: 'F3', lane: 'foundation', status: 'IN_PROGRESS', prerequisites: ['F0'] },
  { id: 'F4', lane: 'foundation', status: 'NOT_STARTED', prerequisites: ['F3'] },
  { id: 'W0', lane: 'world', status: 'NOT_STARTED', prerequisites: [] },
  { id: 'C0', lane: 'capability', status: 'NOT_STARTED', prerequisites: [] },
];

function fence(marker, payload) {
  return ['```json ' + marker, JSON.stringify(payload, null, 2), '```'].join('\n');
}

// reader が読んではならない書式例(より長い fence で包んだ code block)
const EXAMPLE_PROSE = [
  '書式例(reader は読まない):',
  '',
  '````',
  fence(STATE_BLOCK.marker, { schema: STATE_BLOCK.schema, base_sha: 'e'.repeat(40), gates: [] }),
  '````',
].join('\n');

function stateDoc({
  gates = DEFAULT_GATES,
  baseSha = ZERO_SHA,
  schema = STATE_BLOCK.schema,
  marker = STATE_BLOCK.marker,
  extraTop = null,
  mutate = null,
  duplicate = false,
  rawBlock = null,
  withExample = true,
} = {}) {
  const payload = {
    schema,
    base_sha: baseSha,
    gates: gates.map((g) => ({ id: g.id, status: g.status, evidence: g.evidence ?? [`run evidence for ${g.id}`] })),
    ...(extraTop ?? {}),
  };
  if (mutate) mutate(payload);
  const block = rawBlock ?? fence(marker, payload);
  return [
    '# Current State',
    '',
    '人間向けの自由文。ここに「W0: PASS」と書いても reader は読まない。',
    '',
    block,
    ...(duplicate ? ['', block] : []),
    '',
    ...(withExample ? [EXAMPLE_PROSE] : []),
    '',
  ].join('\n');
}

function roadmapDoc({
  gates = DEFAULT_GATES,
  schema = ROADMAP_BLOCK.schema,
  marker = ROADMAP_BLOCK.marker,
  mutate = null,
  duplicate = false,
  rawBlock = null,
} = {}) {
  const payload = {
    schema,
    gates: gates.map((g) => ({ id: g.id, lane: g.lane, prerequisites: g.prerequisites })),
  };
  if (mutate) mutate(payload);
  const block = rawBlock ?? fence(marker, payload);
  return ['# Roadmap', '', '自由文。', '', block, ...(duplicate ? ['', block] : []), ''].join('\n');
}

function makeDocs(opts = {}) {
  return {
    'OS.md': opts.os ?? '# OS\n\nGoal First. Evidence Driven.\n',
    'CURRENT_STATE.md': opts.stateRaw ?? stateDoc(opts.state ?? {}),
    'ROADMAP.md': opts.roadmapRaw ?? roadmapDoc(opts.roadmap ?? {}),
  };
}

function run(opts = {}) {
  const analysis = analyzeControlPlane(makeDocs(opts));
  return { analysis, decision: decide(analysis) };
}

// ---------- block 抽出 ----------

test('marker 付き block だけを抽出し、書式例 code block は読まない', () => {
  const doc = stateDoc();
  const blocks = extractJsonBlocks(doc, STATE_BLOCK.marker);
  assert.equal(blocks.length, 1);
  assert.match(blocks[0], /"base_sha": "0{40}"/);
  assert.doesNotMatch(blocks[0], /e{40}/);
});

test('block が無ければ HOLD(FAIL ではない)', () => {
  const { decision } = run({ stateRaw: '# Current State\n\n自由文だけ。W0: PASS\n' });
  assert.equal(decision.result, 'HOLD');
  assert.match(decision.failureReason, /機械可読 block/);
});

test('正本が読めなければ HOLD', () => {
  const docs = makeDocs();
  docs['OS.md'] = null;
  assert.equal(decide(analyzeControlPlane(docs)).result, 'HOLD');
});

test('block 重複は FAIL', () => {
  assert.equal(run({ state: { duplicate: true } }).decision.result, 'FAIL');
  assert.equal(run({ roadmap: { duplicate: true } }).decision.result, 'FAIL');
});

// ---------- 正常系と dependency-ready ----------

test('正常な block から PRECURSOR と dependency-ready 集合を出す(PASS は出さない)', () => {
  const { analysis, decision } = run();
  assert.equal(decision.result, 'PRECURSOR');
  assert.notEqual(decision.result, 'PASS');
  // F0 は PASS 済みなので除外、F4 は前提 F3 が未達なので除外
  assert.deepEqual(analysis.dependencyReadyGateIds, ['F3', 'W0', 'C0']);
  const f4 = analysis.gates.find((g) => g.id === 'F4');
  assert.deepEqual(f4.unmet_prerequisites, ['F3']);
  assert.equal(f4.dependency_ready, false);
  assert.equal(analysis.blocks['CURRENT_STATE.md'].digest.startsWith('sha256:'), true);
});

test('prerequisite 未達は FAIL ではなく dependency-ready からの除外だけ', () => {
  const gates = [
    { id: 'F3', lane: 'foundation', status: 'NOT_STARTED', prerequisites: [] },
    { id: 'F4', lane: 'foundation', status: 'NOT_STARTED', prerequisites: ['F3'] },
  ];
  const { analysis, decision } = run({ state: { gates }, roadmap: { gates } });
  assert.equal(decision.result, 'PRECURSOR');
  assert.equal(decision.failureReason, null);
  assert.deepEqual(analysis.dependencyReadyGateIds, ['F3']);
});

test('dependency-ready が 0 件 / 1 件 / 複数件のいずれでも PRECURSOR', () => {
  const allPass = DEFAULT_GATES.map((g) => ({ ...g, status: 'PASS' }));
  const zero = run({ state: { gates: allPass }, roadmap: { gates: allPass } });
  assert.equal(zero.decision.result, 'PRECURSOR');
  assert.deepEqual(zero.analysis.dependencyReadyGateIds, []);

  const oneGates = [
    { id: 'F0', lane: 'foundation', status: 'PASS', prerequisites: [] },
    { id: 'F3', lane: 'foundation', status: 'NOT_STARTED', prerequisites: ['F0'] },
  ];
  const one = run({ state: { gates: oneGates }, roadmap: { gates: oneGates } });
  assert.equal(one.decision.result, 'PRECURSOR');
  assert.deepEqual(one.analysis.dependencyReadyGateIds, ['F3']);

  const many = run();
  assert.equal(many.decision.result, 'PRECURSOR');
  assert.equal(many.analysis.dependencyReadyGateIds.length, 3);
});

// ---------- 構造矛盾 = FAIL ----------

test('gate status の欠落は FAIL', () => {
  const { decision } = run({
    state: { mutate: (p) => { delete p.gates[1].status; } },
  });
  assert.equal(decision.result, 'FAIL');
  assert.match(decision.failureReason, /必須 field "status"/);
});

test('status の許可外の値は FAIL', () => {
  const { decision } = run({ state: { mutate: (p) => { p.gates[1].status = 'DONE'; } } });
  assert.equal(decision.result, 'FAIL');
  assert.match(decision.failureReason, /status "DONE"/);
});

test('余分な gate は両方向とも FAIL', () => {
  const extraInState = run({
    state: { gates: [...DEFAULT_GATES, { id: 'X9', lane: 'x', status: 'NOT_STARTED', prerequisites: [] }] },
  });
  assert.equal(extraInState.decision.result, 'FAIL');
  assert.match(extraInState.decision.failureReason, /"X9".*ROADMAP\.md に定義が無い/s);

  const extraInRoadmap = run({
    roadmap: { gates: [...DEFAULT_GATES, { id: 'X9', lane: 'x', status: 'NOT_STARTED', prerequisites: [] }] },
  });
  assert.equal(extraInRoadmap.decision.result, 'FAIL');
  assert.match(extraInRoadmap.decision.failureReason, /"X9".*CURRENT_STATE\.md に status が無い/s);
});

test('未知 gate の参照は FAIL', () => {
  const { decision } = run({ roadmap: { mutate: (p) => { p.gates[3].prerequisites = ['Z9']; } } });
  assert.equal(decision.result, 'FAIL');
  assert.match(decision.failureReason, /未知の gate "Z9"/);
});

test('self-cycle は FAIL', () => {
  const { decision } = run({ roadmap: { mutate: (p) => { p.gates[3].prerequisites = ['W0']; } } });
  assert.equal(decision.result, 'FAIL');
  assert.match(decision.failureReason, /自己参照/);
});

test('2-node cycle は FAIL', () => {
  const { decision } = run({
    roadmap: {
      mutate: (p) => {
        p.gates[1].prerequisites = ['F4']; // F3 → F4
        p.gates[2].prerequisites = ['F3']; // F4 → F3
      },
    },
  });
  assert.equal(decision.result, 'FAIL');
  assert.match(decision.failureReason, /依存 cycle/);
});

test('findCycle は 3-node cycle も検出し、非循環では null', () => {
  assert.equal(findCycle(new Map([['A', ['B']], ['B', ['C']], ['C', []]])), null);
  const cycle = findCycle(new Map([['A', ['B']], ['B', ['C']], ['C', ['A']]]));
  assert.ok(cycle && cycle.length >= 3);
});

test('gate ID の重複は FAIL', () => {
  const { decision } = run({ state: { mutate: (p) => { p.gates.push({ ...p.gates[0] }); } } });
  assert.equal(decision.result, 'FAIL');
  assert.match(decision.failureReason, /重複/);
});

test('schema 不一致・未知 field・型不正・JSON 構文エラーは FAIL', () => {
  assert.match(run({ state: { schema: 'atf.control-state/2' } }).decision.failureReason, /schema が/);
  assert.match(run({ state: { extraTop: { next_gate_candidates: ['W0'] } } }).decision.failureReason, /未知の field/);
  assert.match(run({ state: { mutate: (p) => { p.gates[0].evidence = 'x'; } } }).decision.failureReason, /型が array/);
  assert.match(run({ roadmap: { mutate: (p) => { p.gates[0].prerequisites = [''] } } }).decision.failureReason, /非空文字列/);
  const broken = run({ state: { rawBlock: '```json ' + STATE_BLOCK.marker + '\n{ not json\n```' } });
  assert.equal(broken.decision.result, 'FAIL');
  assert.match(broken.decision.failureReason, /JSON として不正/);
});

test('base_sha の形式不正は FAIL(schema 不正)', () => {
  const { decision } = run({ state: { baseSha: 'not-a-sha' } });
  assert.equal(decision.result, 'FAIL');
  assert.match(decision.failureReason, /base_sha/);
});

// ---------- PASS を生成しないこと ----------

test('あらゆる入力で PASS を返さない', () => {
  const inputs = [
    {},
    { state: { gates: DEFAULT_GATES.map((g) => ({ ...g, status: 'PASS' })) }, roadmap: { gates: DEFAULT_GATES.map((g) => ({ ...g, status: 'PASS' })) } },
    { state: { duplicate: true } },
    { state: { mutate: (p) => { delete p.gates[1].status; } } },
    { state: { mutate: (p) => { p.gates[1].status = 'PASS'; } } },
    { state: { extraTop: { result: 'PASS' } } },
    { state: { baseSha: 'not-a-sha' } },
    { stateRaw: '# no block\nW0: PASS\n' },
    { roadmap: { mutate: (p) => { p.gates[3].prerequisites = ['W0']; } } },
  ];
  for (const input of inputs) {
    const { result } = decide(analyzeControlPlane(makeDocs(input)));
    assert.notEqual(result, 'PASS');
    assert.ok(['PRECURSOR', 'FAIL', 'HOLD'].includes(result), `想定外の result: ${result}`);
  }
  // 各 gate status を総当りしても PASS は出ない
  for (const status of GATE_STATUSES) {
    const gates = DEFAULT_GATES.map((g) => ({ ...g, status }));
    assert.notEqual(decide(analyzeControlPlane(makeDocs({ state: { gates }, roadmap: { gates } }))).result, 'PASS');
  }
  assert.ok(!Object.hasOwn(EXIT_CODES, 'PASS'));
});

// ---------- E2E(実 git repo・一時領域のみ) ----------

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cpc-test-'));
test.after(() => fs.rmSync(tmpRoot, { recursive: true, force: true }));

function git(dir, ...args) {
  return execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], {
    cwd: dir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, GIT_CONFIG_SYSTEM: '/dev/null', GIT_CONFIG_GLOBAL: '/dev/null' },
  });
}

const FACTORY_STUB = 'name: factory-stub\n';

function writeDocs(dir, docs) {
  for (const [file, content] of Object.entries(docs)) {
    if (content == null) continue;
    fs.writeFileSync(path.join(dir, file), content);
  }
  fs.mkdirSync(path.join(dir, '.github', 'workflows'), { recursive: true });
  fs.writeFileSync(path.join(dir, FACTORY_WORKFLOW), FACTORY_STUB);
}

// commit1(base) → commit2(制御文書。base_sha は commit1 を指す)という履歴を作る。
// 追加で、main の祖先ではない side commit も置く(base_sha 非祖先テスト用)。
function makeRepos(name, { docsFor = () => makeDocs(), sideBranch = false } = {}) {
  const upstream = path.join(tmpRoot, `${name}-up`);
  const clone = path.join(tmpRoot, `${name}-clone`);
  fs.mkdirSync(upstream, { recursive: true });
  git(upstream, 'init', '-q', '-b', 'main');
  fs.writeFileSync(path.join(upstream, 'README.md'), '# fixture\n');
  git(upstream, 'add', '-A');
  git(upstream, 'commit', '-q', '-m', 'base');
  const baseSha = git(upstream, 'rev-parse', 'HEAD').trim();

  let sideSha = null;
  if (sideBranch) {
    git(upstream, 'checkout', '-q', '-b', 'side');
    fs.writeFileSync(path.join(upstream, 'side.txt'), 'side\n');
    git(upstream, 'add', '-A');
    git(upstream, 'commit', '-q', '-m', 'side');
    sideSha = git(upstream, 'rev-parse', 'HEAD').trim();
    git(upstream, 'checkout', '-q', 'main');
  }

  writeDocs(upstream, docsFor({ baseSha, sideSha }));
  git(upstream, 'add', '-A');
  git(upstream, 'commit', '-q', '-m', 'control plane');
  git(tmpRoot, 'clone', '-q', upstream, clone);
  return { upstream, clone, baseSha, sideSha };
}

function commitUpstream(upstream, mutate, message) {
  mutate(upstream);
  git(upstream, 'add', '-A');
  git(upstream, 'commit', '-q', '-m', message);
  return git(upstream, 'rev-parse', 'HEAD').trim();
}

const worktree = (dir) => ({ head: git(dir, 'rev-parse', 'HEAD').trim(), status: git(dir, 'status', '--porcelain=v1', '-uall') });

test('E2E: origin/main の block を読んで PRECURSOR。証拠を記録し worktree を変えない', async () => {
  const { clone, baseSha } = makeRepos('ok', { docsFor: ({ baseSha }) => makeDocs({ state: { baseSha } }) });
  const before = worktree(clone);
  const artifactPath = path.join(tmpRoot, 'ok.json');
  const { artifact, exitCode } = await runCanary({ repoDir: clone, artifactPath, env: {} });

  assert.equal(exitCode, 0);
  assert.equal(artifact.schema, SCHEMA_VERSION);
  assert.equal(artifact.result, 'PRECURSOR');
  assert.deepEqual(artifact.dependency_ready_gate_ids, ['F3', 'W0', 'C0']);
  assert.equal(artifact.baseSha.declared, baseSha);
  assert.equal(artifact.baseSha.exists, true);
  assert.equal(artifact.baseSha.isAncestorOfInspectedHead, true);
  for (const f of CONTROL_DOCS) assert.match(artifact.blobs[f], /^[0-9a-f]{40}$/);
  assert.match(artifact.blobs[FACTORY_WORKFLOW], /^[0-9a-f]{40}$/);
  assert.match(artifact.blocks['CURRENT_STATE.md'].digest, /^sha256:/);
  assert.equal(artifact.staleness.materiallyStale, false);
  assert.ok(artifact.doesNotProve.some((s) => /PASS/.test(s)));
  assert.equal(JSON.parse(fs.readFileSync(artifactPath, 'utf8')).result, 'PRECURSOR');
  assert.deepEqual(worktree(clone), before);
});

test('E2E: base_sha が検査 head の祖先でなければ STALE', async () => {
  const { clone } = makeRepos('nonancestor', {
    sideBranch: true,
    docsFor: ({ sideSha }) => makeDocs({ state: { baseSha: sideSha } }),
  });
  const artifactPath = path.join(tmpRoot, 'nonancestor.json');
  const { artifact, exitCode } = await runCanary({ repoDir: clone, artifactPath, env: {} });
  assert.equal(artifact.result, 'STALE');
  assert.equal(exitCode, EXIT_CODES.STALE);
  assert.equal(artifact.baseSha.exists, true);
  assert.equal(artifact.baseSha.isAncestorOfInspectedHead, false);
  assert.match(artifact.failureReason, /祖先でない/);
});

test('E2E: base_sha が実在しない commit なら STALE', async () => {
  const { clone } = makeRepos('nocommit', { docsFor: () => makeDocs({ state: { baseSha: 'f'.repeat(40) } }) });
  const { artifact } = await runCanary({ repoDir: clone, artifactPath: path.join(tmpRoot, 'nocommit.json'), env: {} });
  assert.equal(artifact.result, 'STALE');
  assert.equal(artifact.baseSha.exists, false);
});

test('E2E: block 未設置(実 main と同じ状態)は HOLD で、artifact は必ず残る', async () => {
  const { clone } = makeRepos('noblock', {
    docsFor: () => ({ ...makeDocs(), 'CURRENT_STATE.md': '# Current State\n\n自由文のみ。W0: PASS\n' }),
  });
  const before = worktree(clone);
  const artifactPath = path.join(tmpRoot, 'noblock.json');
  const { artifact, exitCode } = await runCanary({ repoDir: clone, artifactPath, env: {} });
  assert.equal(artifact.result, 'HOLD');
  assert.equal(exitCode, EXIT_CODES.HOLD);
  assert.equal(artifact.blocks['CURRENT_STATE.md'].present, false);
  assert.equal(JSON.parse(fs.readFileSync(artifactPath, 'utf8')).result, 'HOLD');
  assert.deepEqual(worktree(clone), before);
});

test('E2E: 構造矛盾でも artifact を残して FAIL', async () => {
  const { clone } = makeRepos('fail', {
    docsFor: ({ baseSha }) =>
      makeDocs({ state: { baseSha, mutate: (p) => { delete p.gates[1].status; } } }),
  });
  const artifactPath = path.join(tmpRoot, 'fail.json');
  const { artifact, exitCode } = await runCanary({ repoDir: clone, artifactPath, env: {} });
  assert.equal(artifact.result, 'FAIL');
  assert.equal(exitCode, EXIT_CODES.FAIL);
  assert.deepEqual(artifact.dependency_ready_gate_ids, []);
  assert.ok(fs.existsSync(artifactPath));
});

test('E2E: PR 側 worktree の改変版ではなく origin/main を読む', async () => {
  const { clone } = makeRepos('tamper', { docsFor: ({ baseSha }) => makeDocs({ state: { baseSha } }) });
  const tampered = stateDoc({
    gates: [{ id: 'F0', lane: 'foundation', status: 'PASS', prerequisites: [] }],
    baseSha: ZERO_SHA,
  });
  fs.writeFileSync(path.join(clone, 'CURRENT_STATE.md'), tampered);
  const { artifact } = await runCanary({ repoDir: clone, artifactPath: path.join(tmpRoot, 'tamper.json'), env: {} });
  assert.equal(artifact.result, 'PRECURSOR');
  assert.deepEqual(artifact.dependency_ready_gate_ids, ['F3', 'W0', 'C0']);
});

test('E2E: run 中の block 変更は STALE、無関係な変更では継続', async () => {
  const stale = makeRepos('stale', { docsFor: ({ baseSha }) => makeDocs({ state: { baseSha } }) });
  const r1 = await runCanary({
    repoDir: stale.clone,
    artifactPath: path.join(tmpRoot, 'stale.json'),
    env: {},
    afterStartSnapshot: async () => {
      commitUpstream(
        stale.upstream,
        (dir) => {
          const gates = DEFAULT_GATES.map((g) => (g.id === 'F3' ? { ...g, status: 'PASS' } : g));
          fs.writeFileSync(path.join(dir, 'CURRENT_STATE.md'), stateDoc({ gates, baseSha: stale.baseSha }));
        },
        'material: gate status changed',
      );
    },
  });
  assert.equal(r1.artifact.result, 'STALE');
  assert.deepEqual(r1.artifact.staleness.changedBlocks, ['CURRENT_STATE.md']);
  assert.deepEqual(r1.artifact.dependency_ready_gate_ids, []);

  const cont = makeRepos('cont', { docsFor: ({ baseSha }) => makeDocs({ state: { baseSha } }) });
  let newHead = null;
  const r2 = await runCanary({
    repoDir: cont.clone,
    artifactPath: path.join(tmpRoot, 'cont.json'),
    env: {},
    afterStartSnapshot: async () => {
      newHead = commitUpstream(
        cont.upstream,
        (dir) => {
          fs.mkdirSync(path.join(dir, 'works', 'seed-999'), { recursive: true });
          fs.writeFileSync(path.join(dir, 'works', 'seed-999', 'note.txt'), 'unrelated\n');
          // 自由文の追記も block digest を変えない
          fs.appendFileSync(path.join(dir, 'CURRENT_STATE.md'), '\n追記された自由文。W0: PASS\n');
        },
        'non-material: unrelated work and prose',
      );
    },
  });
  assert.equal(r2.artifact.result, 'PRECURSOR');
  assert.equal(r2.artifact.staleness.materiallyStale, false);
  assert.equal(r2.artifact.staleness.checkedHeadSha, newHead);
  assert.deepEqual(r2.artifact.staleness.changedBlocks, []);
});

test('E2E: repository 内の artifact path は拒否して一時領域へ退避する', async () => {
  const { clone } = makeRepos('inside', { docsFor: ({ baseSha }) => makeDocs({ state: { baseSha } }) });
  const runnerTemp = path.join(tmpRoot, 'inside-temp');
  const { artifact, artifactPath } = await runCanary({
    repoDir: clone,
    artifactPath: path.join(clone, 'artifact.json'),
    env: { RUNNER_TEMP: runnerTemp },
  });
  assert.equal(artifact.result, 'PRECURSOR');
  assert.ok(!artifactPath.startsWith(clone + path.sep));
  assert.ok(fs.existsSync(path.join(runnerTemp, 'control-plane-canary', 'artifact.json')));
  assert.equal(worktree(clone).status, '');
});

test('E2E: CLI が JSON を出力し artifact を書く', () => {
  const { clone } = makeRepos('cli', { docsFor: ({ baseSha }) => makeDocs({ state: { baseSha } }) });
  const artifactPath = path.join(tmpRoot, 'cli.json');
  const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'control-plane-canary.mjs');
  const stdout = execFileSync(process.execPath, [script, '--artifact', artifactPath], { cwd: clone, encoding: 'utf8' });
  assert.equal(JSON.parse(stdout).result, 'PRECURSOR');
  assert.equal(JSON.parse(fs.readFileSync(artifactPath, 'utf8')).result, 'PRECURSOR');
});
