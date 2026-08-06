#!/usr/bin/env node
// control-plane-canary.mjs — F3 precursor canary(read-only)。
//
// 制御平面の機械項目は CURRENT_STATE.md / ROADMAP.md の **1 行目**に置いた versioned JSON
// block を正本とする。canonical と認めるのはファイル byte 0 から始まる
// 「```json <marker>」の 1 行目だけで、前置き文字・BOM・見出し・HTML・別 fence が
// 1 文字でもあれば block 未設置として扱う(汎用 Markdown 解析はしない)。
// reader はその block だけを判断入力にし、以降の人間向け自由文は読まない。したがって
// 本 reader が検出する「矛盾」は schema・参照・status・dependency の構造矛盾だけであり、
// 自由文との意味矛盾を検出するとは主張しない。
//
// 本 reader は PASS を出さない。gate を「実行可能」「選択可能」とも主張しない。
// 出力する dependency_ready_gate_ids は「宣言された依存が満たされている未完了 gate」の
// 集合にすぎず、権限(identity / credentials)、Goal First、HOLD 理由の判断は含まない。
// OS 基準による意味的順位付けは別 step であり、未実装・未検証のため F3 は PRECURSOR に留まる。
//
// 結果状態(fail-closed):
//   PRECURSOR … block を読み、構造検証を通し、dependency-ready 集合を確定できた
//   FAIL      … 構造矛盾(schema 不正 / status 欠落・不正 / 未知 gate 参照 / 自己参照 /
//                依存 cycle / gate 集合の cross-doc 不整合 / block 重複)
//   HOLD      … 機械可読 block・正本・Factory 証拠(factory.yml)が default branch に無い、
//                または鮮度を再確認できない
//   STALE     … run 中に block が変化した、または base_sha が検査 head の祖先でない
//   VOID      … repository / origin を読めず評価不能
//
// prerequisite 未達は FAIL ではない。dependency-ready 集合から除外するだけである。

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const SCHEMA_VERSION = 'atf.control-plane-canary/2.0.0';
export const CONTROL_DOCS = ['OS.md', 'CURRENT_STATE.md', 'ROADMAP.md'];
export const FACTORY_WORKFLOW = '.github/workflows/factory.yml';

export const STATE_BLOCK = {
  file: 'CURRENT_STATE.md',
  marker: 'atf-control-state-v1',
  schema: 'atf.control-state/1',
};
export const ROADMAP_BLOCK = {
  file: 'ROADMAP.md',
  marker: 'atf-control-roadmap-v1',
  schema: 'atf.control-roadmap/1',
};

export const GATE_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'PASS', 'FAIL', 'VOID', 'STALE', 'HOLD'];
export const EXIT_CODES = { PRECURSOR: 0, FAIL: 1, VOID: 2, STALE: 3, HOLD: 4 };

const SHA_RE = /^[0-9a-f]{40}$/;

// ---------- block 抽出 ----------

// canonical block はファイルの byte 0 から始まる 1 行目だけを認める。
// 1 行目が正確に「```json <marker>」でなければ block 未設置として扱う。
// 前置き文字・BOM・見出し・HTML(pre / div / details 等)・別 fence が 1 文字でもあれば
// 一致しない。汎用 Markdown 解析は行わない。
export function extractCanonicalBlock(text, marker) {
  const lines = String(text ?? '').split('\n');
  if (lines[0] !== '```json ' + marker) return { present: false, terminated: false, text: null };
  const end = lines.indexOf('```', 1); // 行頭 0 列・完全一致の閉じ fence
  if (end === -1) return { present: true, terminated: false, text: null };
  return { present: true, terminated: true, text: lines.slice(1, end).join('\n') };
}

export function digestOf(text) {
  return `sha256:${createHash('sha256').update(Buffer.from(String(text), 'utf8')).digest('hex')}`;
}

// ---------- strict schema 検証 ----------

function typeOf(v) {
  if (Array.isArray(v)) return 'array';
  if (v === null) return 'null';
  return typeof v;
}

// 宣言した field だけを許す(未知 field は FAIL)。欠落・型不一致も FAIL。
function checkFields(obj, spec, where, problems) {
  for (const [key, want] of Object.entries(spec)) {
    if (!Object.hasOwn(obj, key)) {
      problems.push(`${where}: 必須 field "${key}" が無い`);
      continue;
    }
    const got = typeOf(obj[key]);
    if (got !== want) problems.push(`${where}: field "${key}" の型が ${want} でない(${got})`);
  }
  for (const key of Object.keys(obj)) {
    if (!Object.hasOwn(spec, key)) problems.push(`${where}: 未知の field "${key}"(strict schema)`);
  }
}

function checkStringArray(value, where, problems) {
  if (typeOf(value) !== 'array') return;
  value.forEach((v, i) => {
    if (typeof v !== 'string' || v.trim() === '') problems.push(`${where}[${i}] が非空文字列でない`);
  });
}

export function parseControlBlock(docText, def) {
  const found = extractCanonicalBlock(docText, def.marker);
  if (!found.present) return { def, present: false, problems: [], data: null, digest: null };
  if (!found.terminated) {
    return {
      def,
      present: true,
      problems: [`${def.file}: 1 行目の canonical block が閉じ fence(\`\`\`)で終わっていない`],
      data: null,
      digest: null,
    };
  }
  const text = found.text;
  const digest = digestOf(text);
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { def, present: true, problems: [`${def.file}: block が JSON として不正(${e.message})`], data: null, digest };
  }
  if (typeOf(data) !== 'object') {
    return { def, present: true, problems: [`${def.file}: block の最上位が object でない(${typeOf(data)})`], data: null, digest };
  }
  return { def, present: true, problems: [], data, digest };
}

// ---------- 各 block の構造検証 ----------

function validateStateBlock(data, problems) {
  const where = STATE_BLOCK.file;
  checkFields(data, { schema: 'string', base_sha: 'string', gates: 'array' }, where, problems);
  if (data.schema !== undefined && data.schema !== STATE_BLOCK.schema) {
    problems.push(`${where}: schema が "${STATE_BLOCK.schema}" でない("${data.schema}")`);
  }
  if (typeof data.base_sha === 'string' && !SHA_RE.test(data.base_sha)) {
    problems.push(`${where}: base_sha が 40 桁の commit SHA 形式でない("${data.base_sha}")`);
  }
  const gates = new Map();
  if (typeOf(data.gates) !== 'array') return gates;
  data.gates.forEach((g, i) => {
    const at = `${where}.gates[${i}]`;
    if (typeOf(g) !== 'object') {
      problems.push(`${at}: object でない(${typeOf(g)})`);
      return;
    }
    checkFields(g, { id: 'string', status: 'string', evidence: 'array' }, at, problems);
    checkStringArray(g.evidence, `${at}.evidence`, problems);
    if (typeof g.status === 'string' && !GATE_STATUSES.includes(g.status)) {
      problems.push(`${at}: status "${g.status}" が許可値(${GATE_STATUSES.join(' / ')})でない`);
    }
    if (typeof g.id !== 'string' || g.id.trim() === '') return;
    if (gates.has(g.id)) problems.push(`${where}: gate ID "${g.id}" が重複している`);
    else gates.set(g.id, { status: g.status, evidence: g.evidence });
  });
  return gates;
}

function validateRoadmapBlock(data, problems) {
  const where = ROADMAP_BLOCK.file;
  checkFields(data, { schema: 'string', gates: 'array' }, where, problems);
  if (data.schema !== undefined && data.schema !== ROADMAP_BLOCK.schema) {
    problems.push(`${where}: schema が "${ROADMAP_BLOCK.schema}" でない("${data.schema}")`);
  }
  const gates = new Map();
  if (typeOf(data.gates) !== 'array') return gates;
  data.gates.forEach((g, i) => {
    const at = `${where}.gates[${i}]`;
    if (typeOf(g) !== 'object') {
      problems.push(`${at}: object でない(${typeOf(g)})`);
      return;
    }
    checkFields(g, { id: 'string', lane: 'string', prerequisites: 'array' }, at, problems);
    checkStringArray(g.prerequisites, `${at}.prerequisites`, problems);
    if (typeof g.lane === 'string' && g.lane.trim() === '') problems.push(`${at}: lane が空`);
    if (typeof g.id !== 'string' || g.id.trim() === '') return;
    if (gates.has(g.id)) problems.push(`${where}: gate ID "${g.id}" が重複している`);
    else gates.set(g.id, { lane: g.lane, prerequisites: typeOf(g.prerequisites) === 'array' ? g.prerequisites : [] });
  });
  return gates;
}

// 依存グラフの cycle を 1 件返す(無ければ null)。self-cycle も検出する。
export function findCycle(edges) {
  const state = new Map(); // 0=未訪問 1=探索中 2=完了
  const stack = [];
  let found = null;
  const visit = (id) => {
    if (found) return;
    if (state.get(id) === 2) return;
    if (state.get(id) === 1) {
      found = [...stack.slice(stack.indexOf(id)), id];
      return;
    }
    state.set(id, 1);
    stack.push(id);
    for (const next of edges.get(id) ?? []) {
      if (edges.has(next)) visit(next);
      if (found) return;
    }
    stack.pop();
    state.set(id, 2);
  };
  for (const id of edges.keys()) {
    visit(id);
    if (found) break;
  }
  return found;
}

// ---------- 統合解析(純関数) ----------

export function analyzeControlPlane(docs) {
  const problems = []; // 構造矛盾 → FAIL
  const holds = []; // 制御平面が未設置・読めない → HOLD
  const result = {
    problems,
    holds,
    blocks: {},
    baseShaDeclared: null,
    gates: [],
    dependencyReadyGateIds: [],
  };

  for (const file of CONTROL_DOCS) {
    if (typeof docs?.[file] !== 'string' || docs[file].trim() === '') holds.push(`正本 ${file} を読めない`);
  }

  const state = parseControlBlock(docs?.[STATE_BLOCK.file], STATE_BLOCK);
  const roadmap = parseControlBlock(docs?.[ROADMAP_BLOCK.file], ROADMAP_BLOCK);
  for (const b of [state, roadmap]) {
    result.blocks[b.def.file] = { marker: b.def.marker, present: b.present, digest: b.digest };
    if (!b.present) holds.push(`${b.def.file}: 1 行目に canonical block(\`\`\`json ${b.def.marker})が無い`);
    problems.push(...b.problems);
  }
  if (holds.length > 0 || problems.length > 0 || !state.data || !roadmap.data) return result;

  const stateGates = validateStateBlock(state.data, problems);
  const roadmapGates = validateRoadmapBlock(roadmap.data, problems);
  result.baseShaDeclared = typeof state.data.base_sha === 'string' ? state.data.base_sha : null;
  if (problems.length > 0) return result;

  // cross-doc: gate ID 集合の完全一致(両方向の差分を FAIL)
  const onlyState = [...stateGates.keys()].filter((id) => !roadmapGates.has(id));
  const onlyRoadmap = [...roadmapGates.keys()].filter((id) => !stateGates.has(id));
  for (const id of onlyRoadmap) problems.push(`cross-doc 不整合: gate "${id}" が ${ROADMAP_BLOCK.file} にあるが ${STATE_BLOCK.file} に status が無い`);
  for (const id of onlyState) problems.push(`cross-doc 不整合: gate "${id}" が ${STATE_BLOCK.file} にあるが ${ROADMAP_BLOCK.file} に定義が無い`);

  // prerequisite の参照検証(未知 gate 参照 / 自己参照)
  for (const [id, g] of roadmapGates) {
    for (const p of g.prerequisites) {
      if (p === id) problems.push(`gate "${id}": prerequisite が自己参照している`);
      else if (!roadmapGates.has(p)) problems.push(`gate "${id}": 未知の gate "${p}" を prerequisite に参照している`);
    }
  }
  if (problems.length > 0) return result;

  const cycle = findCycle(new Map([...roadmapGates].map(([id, g]) => [id, g.prerequisites])));
  if (cycle) {
    problems.push(`依存 cycle を検出: ${cycle.join(' → ')}`);
    return result;
  }

  // dependency-ready: status が PASS でなく、全 prerequisite の status が PASS の gate。
  // prerequisite 未達は FAIL ではなく、この集合からの除外にすぎない。
  const gates = [...roadmapGates].map(([id, g]) => {
    const status = stateGates.get(id).status;
    const unmet = g.prerequisites.filter((p) => stateGates.get(p).status !== 'PASS');
    return {
      id,
      lane: g.lane,
      status,
      prerequisites: g.prerequisites,
      unmet_prerequisites: unmet,
      dependency_ready: status !== 'PASS' && unmet.length === 0,
    };
  });
  result.gates = gates;
  result.dependencyReadyGateIds = gates.filter((g) => g.dependency_ready).map((g) => g.id);
  return result;
}

// 構造検証の結果だけから result state を決める(PASS は生成しない)。
export function decide(analysis) {
  if (analysis.problems.length > 0) return { result: 'FAIL', failureReason: analysis.problems.join(' / ') };
  if (analysis.holds.length > 0) return { result: 'HOLD', failureReason: analysis.holds.join(' / ') };
  return { result: 'PRECURSOR', failureReason: null };
}

// ---------- git 層 ----------

function tryGit(repoDir, args) {
  try {
    const out = execFileSync('git', args, {
      cwd: repoDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 64 * 1024 * 1024,
    });
    return { ok: true, out };
  } catch (e) {
    return { ok: false, error: String(e.stderr || e.message || e).trim() };
  }
}

export function detectDefaultBranch(repoDir, envv) {
  if (envv?.CONTROL_PLANE_CANARY_BRANCH) return { branch: envv.CONTROL_PLANE_CANARY_BRANCH, how: 'env CONTROL_PLANE_CANARY_BRANCH' };
  const ls = tryGit(repoDir, ['ls-remote', '--symref', 'origin', 'HEAD']);
  if (ls.ok) {
    const m = /^ref:\s+refs\/heads\/(\S+)\s+HEAD/m.exec(ls.out);
    if (m) return { branch: m[1], how: 'git ls-remote --symref origin HEAD' };
  }
  const sym = tryGit(repoDir, ['symbolic-ref', '--quiet', 'refs/remotes/origin/HEAD']);
  if (sym.ok) {
    const m = /refs\/remotes\/origin\/(.+)/.exec(sym.out.trim());
    if (m) return { branch: m[1], how: 'refs/remotes/origin/HEAD' };
  }
  if (tryGit(repoDir, ['rev-parse', '--verify', '--quiet', 'refs/remotes/origin/main']).ok) {
    return { branch: 'main', how: 'fallback: refs/remotes/origin/main' };
  }
  return null;
}

// path 欠落と、それ以外の読み取り不能(評価不能)を分ける。
const MISSING_PATH_RE = /(does not exist|exists on disk, but not in|invalid object name|bad revision)/i;

function snapshotAt(repoDir, commitSha) {
  const docs = {};
  const blobs = {};
  const hardErrors = []; // 3 正本の読み取り不能(評価不能 → VOID)
  for (const file of CONTROL_DOCS) {
    const content = tryGit(repoDir, ['show', `${commitSha}:${file}`]);
    const sha = tryGit(repoDir, ['rev-parse', '--verify', '--quiet', `${commitSha}:${file}`]);
    docs[file] = content.ok ? content.out : null;
    blobs[file] = sha.ok ? sha.out.trim() : null;
    if (!content.ok && !MISSING_PATH_RE.test(content.error)) hardErrors.push(`${file}: ${content.error}`);
  }
  return { docs, blobs, hardErrors };
}

// Factory 証拠: factory.yml が git object type=blob、mode=100644 または 100755、
// かつ読取可能であることを要求する。directory(tree)・symlink(120000)・欠落は満たさない。
const FACTORY_MODES = ['100644', '100755'];

export function factoryEvidenceAt(repoDir, commitSha) {
  const ev = { path: FACTORY_WORKFLOW, mode: null, type: null, blobSha: null, readable: false, problems: [] };
  const ls = tryGit(repoDir, ['ls-tree', '--full-tree', commitSha, '--', FACTORY_WORKFLOW]);
  if (!ls.ok) {
    ev.problems.push(`${FACTORY_WORKFLOW}: git ls-tree に失敗: ${ls.error}`);
    return ev;
  }
  const line = ls.out.split('\n').find((l) => l.trim() !== '');
  if (!line) {
    ev.problems.push(`${FACTORY_WORKFLOW} が default branch に存在しない`);
    return ev;
  }
  const m = /^(\d{6})\s+(\S+)\s+([0-9a-f]{40})\t/.exec(line);
  if (!m) {
    ev.problems.push(`${FACTORY_WORKFLOW}: git ls-tree の出力を解釈できない`);
    return ev;
  }
  [, ev.mode, ev.type, ev.blobSha] = m;
  if (ev.type !== 'blob') ev.problems.push(`${FACTORY_WORKFLOW}: object type が blob でない(${ev.type})`);
  if (!FACTORY_MODES.includes(ev.mode)) {
    ev.problems.push(`${FACTORY_WORKFLOW}: mode が ${FACTORY_MODES.join(' / ')} でない(${ev.mode})`);
  }
  const content = tryGit(repoDir, ['cat-file', 'blob', ev.blobSha]);
  ev.readable = content.ok;
  if (!content.ok) ev.problems.push(`${FACTORY_WORKFLOW} を読み取れない: ${content.error}`);
  return ev;
}

// 開始時と終了時の Factory 証拠を比較する。削除・type 変更・読取不能・blob SHA 変化は STALE。
export function compareFactoryEvidence(start, end) {
  if (end.problems.length > 0) return `Factory 証拠を再取得できない: ${end.problems.join(' / ')}`;
  if (end.blobSha !== start.blobSha) return `factory.yml の blob SHA が run 中に変化: ${start.blobSha} → ${end.blobSha}`;
  if (end.type !== start.type || end.mode !== start.mode) {
    return `factory.yml の type / mode が run 中に変化: ${start.mode} ${start.type} → ${end.mode} ${end.type}`;
  }
  return null;
}

// ---------- artifact ----------

function defaultArtifactPath(envv) {
  return path.join(envv?.RUNNER_TEMP || os.tmpdir(), 'control-plane-canary', 'artifact.json');
}

// ---------- 本体 ----------

export async function runCanary(options = {}) {
  const repoDir = path.resolve(options.repoDir ?? process.cwd());
  const envv = options.env ?? process.env;
  const doFetch = options.fetch !== false;

  const artifact = {
    schema: SCHEMA_VERSION,
    result: 'VOID',
    failureReason: null,
    generatedAtUtc: null,
    meaning:
      'PRECURSOR は「制御平面の JSON block を origin/<default branch> から読み、構造検証を通し、dependency-ready 集合を確定できた」ことだけを意味する。',
    proves: [
      'runtime が default branch から 3 正本を読み、blob SHA と block digest を証拠として記録すること',
      'schema / 重複 / 未知 field / 参照 / status / 依存 cycle / cross-doc 整合の構造検証を fail-closed で行うこと',
      '宣言された依存が満たされている未完了 gate の集合を決定論的に確定すること',
    ],
    doesNotProve: [
      'OS 基準(Goal First / IOS §15)による意味的順位付け — 別 step。未実装・未検証',
      'gate が実行可能・選択可能であること(権限 / identity / credentials / cost の判断を含まない)',
      '自由文と機械項目の意味的整合 — reader は自由文を判断入力にしない',
      'F3 の PASS — 本 reader は PASS を出さない',
    ],
    run: {
      workflowRunId: envv.GITHUB_RUN_ID ?? null,
      runAttempt: envv.GITHUB_RUN_ATTEMPT ?? null,
      eventName: envv.GITHUB_EVENT_NAME ?? null,
      repository: envv.GITHUB_REPOSITORY ?? null,
      nodeVersion: process.version,
    },
    git: {
      remote: 'origin',
      defaultBranch: null,
      defaultBranchDetection: null,
      inspectedHeadShaAtStart: null,
      inspectedHeadShaAtFinalFetch: null,
      fetchAtStart: 'skipped',
      fetchAtEnd: 'skipped',
    },
    blobs: {},
    blocks: {},
    factoryEvidence: { path: FACTORY_WORKFLOW, mode: null, type: null, blobSha: null, readable: false, problems: [], atFinalFetch: null },
    baseSha: { declared: null, exists: null, isAncestorOfInspectedHead: null },
    gates: [],
    dependency_ready_gate_ids: [],
    staleness: { materiallyStale: null, checkedHeadSha: null, changedBlocks: null, reason: null },
    unknowns: [
      '本 reader は JSON block だけを判断入力にする。周辺自由文の意味監査は行わず、自由文との意味矛盾を検出するとは主張しない',
      'dependency_ready_gate_ids は宣言された依存関係だけに基づく。実行可能性・選択可能性・権限・費用は判断していない',
      'gate status は CURRENT_STATE block の自己申告であり、本 reader はその根拠 evidence の妥当性を検証しない',
    ],
    stopConditions: [
      'FAIL: 構造矛盾(schema 不正 / 未知 field / status 欠落・不正 / gate ID 重複 / 未知 gate 参照 / 自己参照 / 依存 cycle / cross-doc の gate 集合不一致 / block 重複)',
      'HOLD: 1 行目の canonical block または正本が default branch に無い / Factory 証拠(type=blob・mode 100644 か 100755・読取可能)を満たさない / 鮮度を再確認できない',
      'STALE: run 中に block または Factory 証拠(削除 / type・mode 変更 / 読取不能 / blob SHA 変化)が変化した、または base_sha が検査 head の祖先でない / 実在しない',
      'VOID: repository または origin/<default branch> を読めず評価不能',
      'PASS は本 reader が生成しない(意味的順位付け step の成果物)',
    ],
    notes: [],
  };

  let artifactPath = path.resolve(options.artifactPath ?? envv.CANARY_ARTIFACT_PATH ?? defaultArtifactPath(envv));
  if (artifactPath === repoDir || artifactPath.startsWith(repoDir + path.sep)) {
    artifactPath = defaultArtifactPath(envv);
    artifact.notes.push(`指定 artifact path が repository 内のため拒否し ${artifactPath} へ退避`);
  }

  try {
    if (!tryGit(repoDir, ['rev-parse', '--git-dir']).ok) {
      artifact.failureReason = 'git repository を読めない';
      return finish();
    }
    const det = detectDefaultBranch(repoDir, envv);
    if (!det) {
      artifact.failureReason = 'default branch を特定できない';
      return finish();
    }
    artifact.git.defaultBranch = det.branch;
    artifact.git.defaultBranchDetection = det.how;

    if (doFetch) {
      const f = tryGit(repoDir, ['fetch', '--quiet', 'origin', det.branch]);
      artifact.git.fetchAtStart = f.ok ? 'ok' : 'failed';
      if (!f.ok) artifact.unknowns.push(`開始時 fetch 失敗(既存参照で継続): ${f.error}`);
    }
    const start = tryGit(repoDir, ['rev-parse', '--verify', `refs/remotes/origin/${det.branch}`]);
    if (!start.ok) {
      artifact.failureReason = `origin/${det.branch} を解決できない: ${start.error}`;
      return finish();
    }
    const startSha = start.out.trim();
    artifact.git.inspectedHeadShaAtStart = startSha;

    // worktree ではなく git object から読む(PR 側の改変版を判断に使わない)
    const snap = snapshotAt(repoDir, startSha);
    artifact.blobs = { ...snap.blobs };
    if (snap.hardErrors.length > 0) {
      artifact.failureReason = `git object を読み取れない(評価不能): ${snap.hardErrors.join(' / ')}`;
      return finish();
    }

    const analysis = analyzeControlPlane(snap.docs);
    const decision = decide(analysis);
    artifact.blocks = analysis.blocks;
    artifact.gates = analysis.gates;
    artifact.dependency_ready_gate_ids = analysis.dependencyReadyGateIds;
    artifact.baseSha.declared = analysis.baseShaDeclared;
    artifact.result = decision.result;
    artifact.failureReason = decision.failureReason;

    // Factory 証拠(type=blob / mode 100644・100755 / 読取可能)が欠ければ PRECURSOR にしない
    const startFactory = factoryEvidenceAt(repoDir, startSha);
    artifact.blobs[FACTORY_WORKFLOW] = startFactory.blobSha;
    artifact.factoryEvidence = { ...startFactory, atFinalFetch: null };
    if (startFactory.problems.length > 0 && artifact.result === 'PRECURSOR') {
      artifact.result = 'HOLD';
      artifact.failureReason = `Factory 証拠を取得できない: ${startFactory.problems.join(' / ')}`;
    }

    // base_sha: 実在 commit かつ検査対象 head の祖先であること(完全一致は求めない)
    if (artifact.result === 'PRECURSOR' && analysis.baseShaDeclared) {
      const declared = analysis.baseShaDeclared;
      const exists = tryGit(repoDir, ['cat-file', '-t', declared]);
      artifact.baseSha.exists = exists.ok && exists.out.trim() === 'commit';
      if (!artifact.baseSha.exists) {
        artifact.baseSha.isAncestorOfInspectedHead = false;
        artifact.result = 'STALE';
        artifact.failureReason = `base_sha ${declared} が実在の commit でない`;
      } else {
        const anc = tryGit(repoDir, ['merge-base', '--is-ancestor', declared, startSha]);
        artifact.baseSha.isAncestorOfInspectedHead = anc.ok;
        if (!anc.ok) {
          artifact.result = 'STALE';
          artifact.failureReason = `base_sha ${declared} が検査対象 head ${startSha} の祖先でない`;
        }
      }
    }

    if (options.afterStartSnapshot) await options.afterStartSnapshot({ repoDir, branch: det.branch, startSha });

    // --- 最終 fetch と staleness(block の変化だけを見る) ---
    let endSha = startSha;
    if (doFetch) {
      const f2 = tryGit(repoDir, ['fetch', '--quiet', 'origin', det.branch]);
      artifact.git.fetchAtEnd = f2.ok ? 'ok' : 'failed';
      const end = f2.ok ? tryGit(repoDir, ['rev-parse', '--verify', `refs/remotes/origin/${det.branch}`]) : { ok: false, error: f2.error };
      if (!end.ok) {
        artifact.unknowns.push(`最終 fetch / 参照解決に失敗: ${end.error}`);
        if (artifact.result === 'PRECURSOR') {
          artifact.result = 'HOLD';
          artifact.failureReason = 'run 中の default branch の変化を再確認できない';
        }
        return finish();
      }
      endSha = end.out.trim();
    }
    artifact.git.inspectedHeadShaAtFinalFetch = endSha;
    artifact.staleness.checkedHeadSha = endSha;

    // Factory 証拠を終了時にも再取得し、削除・type 変更・読取不能・blob SHA 変化を STALE とする
    const endFactory = factoryEvidenceAt(repoDir, endSha);
    artifact.factoryEvidence.atFinalFetch = {
      mode: endFactory.mode,
      type: endFactory.type,
      blobSha: endFactory.blobSha,
      readable: endFactory.readable,
      problems: endFactory.problems,
    };
    const factoryDrift = startFactory.problems.length === 0 ? compareFactoryEvidence(startFactory, endFactory) : null;
    if (factoryDrift) {
      artifact.staleness.materiallyStale = true;
      artifact.staleness.changedBlocks = [];
      artifact.staleness.reason = factoryDrift;
      if (artifact.result === 'PRECURSOR') {
        artifact.result = 'STALE';
        artifact.failureReason = factoryDrift;
        artifact.dependency_ready_gate_ids = [];
      } else {
        artifact.notes.push(`開始時の結果 ${artifact.result} に加え、Factory 証拠の変化を検出: ${factoryDrift}`);
      }
      return finish();
    }

    if (endSha === startSha) {
      artifact.staleness.materiallyStale = false;
      artifact.staleness.changedBlocks = [];
      artifact.staleness.reason = 'run 中に default branch は変化していない';
      return finish();
    }

    // head の移動だけでは STALE にしない。block digest の変化だけを見る。
    const endSnap = snapshotAt(repoDir, endSha);
    const endAnalysis = analyzeControlPlane(endSnap.docs);
    const changed = [STATE_BLOCK.file, ROADMAP_BLOCK.file].filter(
      (f) => analysis.blocks[f]?.digest !== endAnalysis.blocks[f]?.digest,
    );
    artifact.staleness.changedBlocks = changed;
    artifact.staleness.materiallyStale = changed.length > 0;
    if (changed.length === 0) {
      artifact.staleness.reason = `head は ${startSha} → ${endSha} へ動いたが制御 block は不変。検査済み head を記録して継続`;
    } else {
      artifact.staleness.reason = `run 中に制御 block が変化: ${changed.join(', ')}`;
      if (artifact.result === 'PRECURSOR') {
        artifact.result = 'STALE';
        artifact.failureReason = artifact.staleness.reason;
        artifact.dependency_ready_gate_ids = [];
      } else {
        artifact.notes.push(`開始時の結果 ${artifact.result} に加え、run 中に block 変化を検出`);
      }
    }
    return finish();
  } catch (err) {
    artifact.result = 'VOID';
    artifact.failureReason = `想定外の失敗: ${err?.stack ?? String(err)}`;
    return finish();
  }

  function finish() {
    artifact.generatedAtUtc = new Date().toISOString();
    try {
      fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
      fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2) + '\n');
    } catch (writeErr) {
      const fallback = path.join(os.tmpdir(), `control-plane-canary-fallback-${process.pid}.json`);
      try {
        fs.writeFileSync(fallback, JSON.stringify(artifact, null, 2) + '\n');
        artifactPath = fallback;
      } catch {
        console.error(`control-plane-canary: artifact を書き込めない(${String(writeErr)})`);
      }
    }
    return { artifact, artifactPath, exitCode: EXIT_CODES[artifact.result] ?? 1 };
  }
}

// ---------- CLI ----------

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const opts = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--artifact') opts.artifactPath = argv[++i];
    else if (argv[i] === '--repo') opts.repoDir = argv[++i];
    else if (argv[i] === '--no-fetch') opts.fetch = false;
  }
  const { artifact, artifactPath, exitCode } = await runCanary(opts);
  console.log(JSON.stringify(artifact, null, 2));
  console.error(`control-plane-canary: result=${artifact.result} artifact=${artifactPath}`);
  process.exit(exitCode);
}
