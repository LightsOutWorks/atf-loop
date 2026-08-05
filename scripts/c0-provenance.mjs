#!/usr/bin/env node
// c0-provenance.mjs — C0 Configuration Provenance observer (read-only canary).
//
// ROADMAP.md C0: 現行Production構成を「後から再検査・比較できる形」で記録する。
// このスクリプトは観測者であり、Factory本体・モデル・prompt・Secretsには一切触れない。
//
// C0 evidence contract (schema atf-configuration-provenance/v1):
//   1. exact schema — capability group / field / material path は固定manifestと完全一致。
//      欠落も未定義の追加も FAIL(追加したければ schema version を上げる)。
//   2. verifier registry — 全OBSERVED fieldは OBSERVED_VERIFIERS に登録された検証器で
//      「値が証拠内容を正しく表すこと」を検証される。登録のないfieldをOBSERVEDにするとFAIL。
//      検証は (a) sourceから決定論的に抽出した値との exact compare、または
//      (b) source内に verbatim に存在する token の照合、のいずれかのみ。
//   3. secret scope — Secret宣言名は「全Secret集合に在るか」ではなく、
//      claude -p / codex exec を実行する step の env 参照へ scope して照合する。
//   4. repository / history binding — base.repository は実行中repositoryと一致し、
//      base_sha は実在commitかつ検査対象HEADの祖先でなければならない。
//      material blob は base tree と照合する。
//   5. path confinement — 宣言pathはrepo内・git tracked・regular fileのみ。
//      `..`遡行・絶対path・symlink・realpath脱出は読み取りもhash化もせず拒否。
//   6. separation — production material の変化のみ STALE。
//      control-plane snapshot(OS.md 等)の drift は情報として記録する。
//   7. PASS条件 — verified OBSERVED coverage = 100%(全OBSERVEDがverifier検証済み)。
//
// 結果状態(fail-closed 優先順位: HOLD > FAIL > VOID > STALE > PASS):
//   PASS  — 上記契約をすべて満たし、残る全項目が理由付きUNKNOWN
//   FAIL  — schema/manifest違反、verifier不一致、証拠不整合、path違反、
//           repository不一致、架空/非祖先base、Secretらしい値の混入
//   VOID  — material欠落・git work treeでない等、観測自体が成立しない
//   STALE — production material の内容が baseline宣言から変化
//   HOLD  — schema版数不一致など、人間判断なしに解消できない曖昧さ
//
// Secrets: 値・hash・prefix・長さを一切出力しない。Secret「宣言名」の記録のみ許可。
//
// 使い方: node scripts/c0-provenance.mjs [--repo <dir>] [--out <dir>] [--baseline <path>]

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SCHEMA_VERSION = 'atf-configuration-provenance/v1';
export const SHA1_RE = /^[0-9a-f]{40}$/;
export const SHA256_RE = /^[0-9a-f]{64}$/;
export const RESULT_STATES = ['PASS', 'FAIL', 'VOID', 'STALE', 'HOLD'];

// ---------- 固定 manifest(exact schema) ----------

export const CLASSIFICATIONS = ['production_material', 'control_plane_snapshot'];

export const REQUIRED_MATERIALS = {
  '.github/workflows/factory.yml': 'production_material',
  'CONSTRAINTS.md': 'production_material',
  'smoke.mjs': 'production_material',
  'scripts/interaction-smoke.mjs': 'production_material',
  'scripts/gate-prompt.txt': 'production_material',
  'scripts/build-catalog.mjs': 'production_material',
  'OS.md': 'control_plane_snapshot',
  'CURRENT_STATE.md': 'control_plane_snapshot',
  'ROADMAP.md': 'control_plane_snapshot',
};

export const REQUIRED_FIELDS = {
  generation: [
    'provider_integration', 'cli_version', 'effective_model_id', 'provider_model_revision',
    'reasoning_configuration', 'provider_routing', 'hidden_system_prompt', 'prompt_cache_state',
    'prompt_source', 'context_sources', 'output_schema', 'allowed_tools', 'turn_budget',
    'permissions_and_sandbox', 'auth_mechanism', 'token_usage', 'marginal_cost', 'latency',
  ],
  semantic_gate: [
    'provider_integration', 'cli_version', 'effective_model_id', 'provider_model_revision',
    'reasoning_configuration', 'provider_routing', 'hidden_system_prompt', 'prompt_cache_state',
    'prompt_source', 'invocation', 'verdict_contract', 'input_scope', 'auth_mechanism',
    'token_usage', 'marginal_cost', 'latency',
  ],
  deterministic_verification: [
    'node_version_declared', 'runner_os', 'static_smoke', 'interaction_smoke',
    'browser_engine', 'catalog_builder', 'constraints_contract', 'integrity_check',
    'effective_node_version', 'runner_image_revision', 'browser_revision',
  ],
  publish_runtime: [
    'triggers', 'workflow_permissions', 'concurrency_and_timeout', 'checkout_configuration',
    'declared_action_refs', 'step_timeouts', 'publish_mechanism', 'dry_run_canary',
    'artifact_persistence', 'resolved_action_commits', 'pages_reachability_verification',
  ],
};

// ---------- ハッシュ ----------

export function computeGitBlobSha1(buf) {
  const body = Buffer.isBuffer(buf) ? buf : Buffer.from(buf, 'utf8');
  const header = Buffer.from(`blob ${body.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(Buffer.concat([header, body])).digest('hex');
}

export function computeSha256(buf) {
  const body = Buffer.isBuffer(buf) ? buf : Buffer.from(buf, 'utf8');
  return crypto.createHash('sha256').update(body).digest('hex');
}

// ---------- Secret 検出 ----------

const SECRET_VALUE_PATTERNS = [
  ['anthropic-key-like', /sk-ant-[A-Za-z0-9_-]{2,}/],
  ['openai-key-like', /sk-[A-Za-z0-9]{20,}/],
  ['github-token-like', /\b(?:ghp|gho|ghs|ghu|ghr)_[A-Za-z0-9]{20,}/],
  ['github-pat-like', /github_pat_[A-Za-z0-9_]{20,}/],
  ['slack-token-like', /xox[baprs]-[A-Za-z0-9-]{10,}/],
  ['aws-key-like', /\bAKIA[0-9A-Z]{16}\b/],
  ['private-key-block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['jwt-like', /\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}\./],
  ['bearer-header-like', /\bBearer\s+[A-Za-z0-9._~+/=-]{25,}/],
];

const SECRET_LEAK_KEY_RE =
  /(secret|token|credential|password|api[-_]?key|auth)[-_ ]?(hash|sha\d*|digest|fingerprint|prefix|hint|length|len)\b/i;

export function scanForSecrets(text) {
  const hits = [];
  for (const [label, re] of SECRET_VALUE_PATTERNS) {
    const m = re.exec(text);
    if (m) hits.push({ kind: 'value-pattern', label, index: m.index });
  }
  return hits;
}

export function scanKeysForSecretLeaks(doc, keyPath = '$') {
  const hits = [];
  if (Array.isArray(doc)) {
    doc.forEach((v, i) => hits.push(...scanKeysForSecretLeaks(v, `${keyPath}[${i}]`)));
  } else if (doc && typeof doc === 'object') {
    for (const [k, v] of Object.entries(doc)) {
      if (SECRET_LEAK_KEY_RE.test(k)) {
        hits.push({ kind: 'key-name', label: 'secret-derivative-key', keyPath: `${keyPath}.${k}` });
      }
      hits.push(...scanKeysForSecretLeaks(v, `${keyPath}.${k}`));
    }
  }
  return hits;
}

// ---------- field schema 検証 ----------

export function validateFieldEntry(name, entry) {
  const problems = [];
  const p = (msg) => problems.push(`${name}: ${msg}`);
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    p('field entry must be an object');
    return problems;
  }
  if (entry.status === 'OBSERVED') {
    if (entry.value === undefined || entry.value === null || entry.value === '') {
      p('OBSERVED requires a non-empty value');
    }
    const ev = entry.evidence;
    if (!ev || typeof ev !== 'object') {
      p('OBSERVED requires evidence');
      return problems;
    }
    if (typeof ev.derived_from !== 'string' || !ev.derived_from.trim()) {
      p('evidence.derived_from (どの宣言・出力から取得したか) is required');
    }
    if (ev.kind === 'repository') {
      if (typeof ev.path !== 'string' || !ev.path.trim()) p('repository evidence requires path');
      if (typeof ev.git_blob_sha1 !== 'string' || !SHA1_RE.test(ev.git_blob_sha1)) {
        p('repository evidence requires a valid 40-hex git_blob_sha1');
      }
      if (ev.sha256 !== undefined && !SHA256_RE.test(String(ev.sha256))) {
        p('evidence.sha256 must be 64-hex when present');
      }
    } else if (ev.kind === 'runtime') {
      if (typeof ev.source !== 'string' || !ev.source.trim()) p('runtime evidence requires source');
    } else {
      p('evidence.kind must be "repository" or "runtime" (actual value withheld)');
    }
  } else if (entry.status === 'UNKNOWN') {
    if (entry.value !== null) p('UNKNOWN requires value: null');
    if (typeof entry.reason !== 'string' || !entry.reason.trim()) {
      p('UNKNOWN requires a concrete reason');
    }
    if (typeof entry.resolution !== 'string' || !entry.resolution.trim()) {
      p('UNKNOWN requires a resolution (何が得られれば解消できるか)');
    }
  } else {
    p('status must be "OBSERVED" or "UNKNOWN" (actual value withheld)');
  }
  return problems;
}

export function validateBaseline(doc) {
  const problems = [];
  if (!doc || typeof doc !== 'object') return ['baseline is not an object'];
  if (doc.kind !== 'champion-baseline') problems.push('kind must be "champion-baseline" (actual value withheld)');
  if (!doc.base || typeof doc.base !== 'object') {
    problems.push('base section is required');
  } else {
    if (typeof doc.base.base_sha !== 'string' || !SHA1_RE.test(doc.base.base_sha)) {
      problems.push('base.base_sha must be a 40-hex commit SHA');
    }
    if (typeof doc.base.repository !== 'string' || !/^[^/\s]+\/[^/\s]+$/.test(doc.base.repository)) {
      problems.push('base.repository must be an owner/name string');
    }
  }
  if (!doc.material_sources || typeof doc.material_sources !== 'object' || Object.keys(doc.material_sources).length === 0) {
    problems.push('material_sources must be a non-empty object');
  } else {
    for (const [p, m] of Object.entries(doc.material_sources)) {
      if (!m || typeof m !== 'object') { problems.push(`material_sources[${p}] must be an object`); continue; }
      if (typeof m.git_blob_sha1 !== 'string' || !SHA1_RE.test(m.git_blob_sha1)) {
        problems.push(`material_sources[${p}].git_blob_sha1 must be 40-hex`);
      }
      if (typeof m.sha256 !== 'string' || !SHA256_RE.test(m.sha256)) {
        problems.push(`material_sources[${p}].sha256 must be 64-hex`);
      }
      if (typeof m.role !== 'string' || !m.role.trim()) {
        problems.push(`material_sources[${p}].role is required`);
      }
      if (!CLASSIFICATIONS.includes(m.classification)) {
        problems.push(`material_sources[${p}].classification must be one of: ${CLASSIFICATIONS.join(', ')}`);
      }
    }
  }
  if (!doc.capabilities || typeof doc.capabilities !== 'object' || Object.keys(doc.capabilities).length === 0) {
    problems.push('capabilities must be a non-empty object');
  } else {
    for (const [cap, fields] of Object.entries(doc.capabilities)) {
      if (!fields || typeof fields !== 'object' || Object.keys(fields).length === 0) {
        problems.push(`capabilities.${cap} must be a non-empty object`);
        continue;
      }
      for (const [fieldName, entry] of Object.entries(fields)) {
        problems.push(...validateFieldEntry(`capabilities.${cap}.${fieldName}`, entry));
      }
    }
  }
  return problems;
}

// ---------- manifest 強制(exact schema: 欠落も未定義追加も FAIL) ----------

export function enforceManifest(baseline) {
  const problems = [];
  const mats = baseline.material_sources || {};
  for (const [p, cls] of Object.entries(REQUIRED_MATERIALS)) {
    const m = mats[p];
    if (!m) {
      problems.push(`manifest: required material source missing from baseline: ${p}`);
      continue;
    }
    if (m.classification !== cls) {
      problems.push(`manifest: ${p} must be classified as ${cls}`);
    }
  }
  for (const p of Object.keys(mats)) {
    if (!REQUIRED_MATERIALS[p]) {
      problems.push(`manifest: material source not defined by schema ${SCHEMA_VERSION}: ${p} (adding sources requires a schema version bump)`);
    }
  }
  const caps = baseline.capabilities || {};
  for (const [group, fields] of Object.entries(REQUIRED_FIELDS)) {
    const g = caps[group];
    if (!g || typeof g !== 'object') {
      problems.push(`manifest: required capability group missing: ${group}`);
      continue;
    }
    for (const fieldName of fields) {
      if (!g[fieldName]) problems.push(`manifest: required field missing: ${group}.${fieldName}`);
    }
    for (const fieldName of Object.keys(g)) {
      if (!fields.includes(fieldName)) {
        problems.push(`manifest: field not defined by schema ${SCHEMA_VERSION}: ${group}.${fieldName} (adding fields requires a schema version bump)`);
      }
    }
  }
  for (const group of Object.keys(caps)) {
    if (!REQUIRED_FIELDS[group]) {
      problems.push(`manifest: capability group not defined by schema ${SCHEMA_VERSION}: ${group} (adding groups requires a schema version bump)`);
    }
  }
  return problems;
}

// ---------- path 検査 ----------

export function validatePathShape(rel) {
  if (typeof rel !== 'string' || !rel.trim()) return 'path must be a non-empty string';
  if (path.isAbsolute(rel) || /^[A-Za-z]:[\\/]/.test(rel)) return 'absolute paths are forbidden';
  if (rel.includes('\\')) return 'backslashes are forbidden';
  const segments = rel.split('/');
  if (segments.some((s) => s === '..')) return 'parent traversal (..) is forbidden';
  if (segments.some((s) => s === '' || s === '.')) return 'empty or "." path segments are forbidden';
  return null;
}

// 戻り値 state: 'ok' | 'missing' | 'symlink' | 'not-regular' | 'escapes'
export function inspectRepoPath(repoRoot, rel) {
  const abs = path.join(repoRoot, rel);
  let st;
  try {
    st = fs.lstatSync(abs);
  } catch {
    return { state: 'missing' };
  }
  if (st.isSymbolicLink()) return { state: 'symlink' };
  if (!st.isFile()) return { state: 'not-regular' };
  let rootReal = path.resolve(repoRoot);
  try {
    rootReal = fs.realpathSync(rootReal);
  } catch {
    // repoRoot が実体解決できないケースは isInsideRepo 側の拒否に委ねる
  }
  let real;
  try {
    real = fs.realpathSync(abs);
  } catch {
    return { state: 'missing' };
  }
  const relReal = path.relative(rootReal, real);
  if (relReal === '' || relReal === '..' || relReal.startsWith('..' + path.sep) || path.isAbsolute(relReal)) {
    return { state: 'escapes' };
  }
  return { state: 'ok' };
}

// ---------- git 照会(すべて read-only) ----------

export function gitTrackedFiles(repoRoot) {
  try {
    const out = execFileSync('git', ['-C', repoRoot, 'ls-files', '-z'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    return { isRepo: true, tracked: new Set(out.split('\0').filter(Boolean)) };
  } catch {
    return { isRepo: false, tracked: new Set() };
  }
}

export function gitCommitExists(repoRoot, sha) {
  try {
    execFileSync('git', ['-C', repoRoot, 'cat-file', '-e', `${sha}^{commit}`], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function gitIsAncestor(repoRoot, ancestor, descendant) {
  try {
    execFileSync('git', ['-C', repoRoot, 'merge-base', '--is-ancestor', ancestor, descendant], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function gitRevParse(repoRoot, ref) {
  try {
    const out = execFileSync('git', ['-C', repoRoot, 'rev-parse', ref], { encoding: 'utf8' }).trim();
    return SHA1_RE.test(out) ? out : null;
  } catch {
    return null;
  }
}

export function gitTreeBlobs(repoRoot, sha) {
  const out = execFileSync('git', ['-C', repoRoot, 'ls-tree', '-r', '-z', sha], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  const map = new Map();
  for (const entry of out.split('\0')) {
    if (!entry) continue;
    const tab = entry.indexOf('\t');
    if (tab < 0) continue;
    const [, , blobSha] = entry.slice(0, tab).split(' ');
    map.set(entry.slice(tab + 1), blobSha);
  }
  return map;
}

// 実行中の repository 識別子(owner/name)。env優先、無ければ origin remote から。
export function resolveRepoIdentity(env, repoRoot) {
  if (env.GITHUB_REPOSITORY) return { id: env.GITHUB_REPOSITORY, source: 'env:GITHUB_REPOSITORY' };
  try {
    const url = execFileSync('git', ['-C', repoRoot, 'remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
    const m = /[:/]([^/:\s]+\/[^/:\s]+?)(?:\.git)?$/.exec(url);
    if (m) return { id: m[1], source: 'git remote origin' };
  } catch {
    // fall through
  }
  return null;
}

// ---------- factory.yml からの決定論抽出 ----------

export function extractFactoryFacts(text) {
  const one = (re) => {
    const m = re.exec(text);
    return m ? m[1] : null;
  };
  const all = (re) => {
    const out = [];
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    let m;
    while ((m = g.exec(text))) out.push(m[1]);
    return out;
  };
  const num = (v) => (v === null ? null : Number(v));
  const pushLoop = one(/for i in ([\d ]+); do/);
  return {
    generation_cli_package: '@anthropic-ai/claude-code',
    generation_cli_version: one(/@anthropic-ai\/claude-code@([0-9][^\s"']*)/),
    gate_cli_package: '@openai/codex',
    gate_cli_version: one(/@openai\/codex@([0-9][^\s"']*)/),
    allowed_tools_occurrences: all(/--allowedTools "([^"]+)"/),
    max_turns_occurrences: all(/--max-turns (\d+)/).map(Number),
    max_fix_rounds: num(one(/MAX_FIX=(\d+)/)),
    node_version: one(/node-version:\s*'([^']+)'/),
    playwright_version: one(/playwright@([0-9][^\s"']*)/),
    runner_label: one(/runs-on:\s*([^\s]+)/),
    permissions_contents: one(/permissions:\s*\n\s*contents:\s*([a-z]+)/),
    concurrency_group: one(/concurrency:\s*\n\s*group:\s*([^\s]+)/),
    cancel_in_progress: (v => (v === null ? null : v === 'true'))(one(/cancel-in-progress:\s*(true|false)/)),
    timeouts: all(/timeout-minutes:\s*(\d+)/).map(Number),
    cron: one(/cron:\s*'([^']+)'/),
    fetch_depth: num(one(/fetch-depth:\s*(\d+)/)),
    action_refs: [...new Set(all(/uses:\s*(\S+)/))].sort(),
    push_attempts: pushLoop === null ? null : pushLoop.trim().split(/\s+/).length,
    sandbox: one(/--sandbox ([^\s"']+)/),
  };
}

// Secret宣言のstep scope抽出: claude -p を実行するstepと codex exec を実行するstepの
// env 参照だけを、それぞれ generation / gate の Secret集合とする。
export function extractScopedSecrets(text) {
  const chunks = text.split(/\n(?= {6}- name: )/);
  const secretsIn = (chunk) => new Set([...chunk.matchAll(/secrets\.([A-Z0-9_]+)/g)].map((m) => m[1]));
  const generation = new Set();
  const gate = new Set();
  for (const chunk of chunks) {
    if (/\bclaude -p\b/.test(chunk)) for (const s of secretsIn(chunk)) generation.add(s);
    if (/\bcodex exec\b/.test(chunk)) for (const s of secretsIn(chunk)) gate.add(s);
  }
  return { generation, gate };
}

// ---------- OBSERVED verifier registry ----------
// 全OBSERVED fieldはここに登録された検証器を持たなければならない(fix 2)。
// 検証器は「宣言値が証拠内容を正しく表すこと」を、抽出factとのexact compareか
// source内verbatim tokenの照合で確かめる。宣言値はエラー文に出さない(token名のみ)。

const VENDOR_BY_PACKAGE = {
  '@anthropic-ai/claude-code': 'Anthropic',
  '@openai/codex': 'OpenAI',
};

const FACTORY_PATH = '.github/workflows/factory.yml';

function needFact(probs, label, fact) {
  const missing = fact === null || fact === undefined || (Array.isArray(fact) && fact.length === 0);
  if (missing) probs.push(`${label} is not machine-extractable from ${FACTORY_PATH}`);
  return !missing;
}

function needToken(probs, source, sourceName, token, label) {
  if (typeof source !== 'string') {
    probs.push(`${label}: source ${sourceName} is unavailable for verification`);
    return false;
  }
  if (typeof token !== 'string' || !token.trim()) {
    probs.push(`${label} must be a non-empty verbatim token`);
    return false;
  }
  if (!source.includes(token)) {
    probs.push(`${label}: declared token not found verbatim in ${sourceName}`);
    return false;
  }
  return true;
}

function needEq(probs, label, declared, extracted) {
  if (JSON.stringify(declared) !== JSON.stringify(extracted)) {
    probs.push(`${label} contradicts the extracted source value (expected: ${JSON.stringify(extracted)}; declared value withheld)`);
    return false;
  }
  return true;
}

function nonEmptyStringArray(probs, label, arr) {
  if (!Array.isArray(arr) || arr.length === 0 || arr.some((x) => typeof x !== 'string' || !x.trim())) {
    probs.push(`${label} must be a non-empty array of strings`);
    return false;
  }
  return true;
}

function verifyCliIntegration(which) {
  return (v, ctx) => {
    const probs = [];
    const pkg = which === 'generation' ? ctx.facts.generation_cli_package : ctx.facts.gate_cli_package;
    const ver = which === 'generation' ? ctx.facts.generation_cli_version : ctx.facts.gate_cli_version;
    if (!needFact(probs, `${which} CLI pin`, ver)) return probs;
    needEq(probs, `${which}.provider_integration.npm_package`, v?.npm_package, pkg);
    needEq(probs, `${which}.provider_integration.vendor`, v?.vendor, VENDOR_BY_PACKAGE[pkg]);
    return probs;
  };
}

function verifyCliVersion(which) {
  return (v, ctx) => {
    const probs = [];
    const pkg = which === 'generation' ? ctx.facts.generation_cli_package : ctx.facts.gate_cli_package;
    const ver = which === 'generation' ? ctx.facts.generation_cli_version : ctx.facts.gate_cli_version;
    if (!needFact(probs, `${which} CLI pin`, ver)) return probs;
    needEq(probs, `${which}.cli_version.name`, v?.name, pkg);
    needEq(probs, `${which}.cli_version.version`, v?.version, ver);
    return probs;
  };
}

function verifyScopedSecret(which) {
  return (v, ctx) => {
    const probs = [];
    const scoped = ctx.scoped[which === 'generation' ? 'generation' : 'gate'];
    if (scoped.size === 0) {
      probs.push(`${which} secret scope is not machine-extractable from ${FACTORY_PATH} (no secrets referenced by the invoking step)`);
      return probs;
    }
    if (typeof v?.secret_declaration !== 'string' || !scoped.has(v.secret_declaration)) {
      probs.push(
        `${which}.auth_mechanism.secret_declaration is not among the secrets referenced by the ${which === 'generation' ? 'claude -p' : 'codex exec'} step(s) (scoped set: ${[...scoped].sort().join(', ')})`
      );
    }
    return probs;
  };
}

export const OBSERVED_VERIFIERS = {
  'generation.provider_integration': { evidence: FACTORY_PATH, verify: verifyCliIntegration('generation') },
  'generation.cli_version': { evidence: FACTORY_PATH, verify: verifyCliVersion('generation') },
  'generation.prompt_source': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      needEq(probs, 'generation.prompt_source.container', v?.container, FACTORY_PATH);
      needToken(probs, ctx.factory, FACTORY_PATH, v?.heredoc_marker, 'generation.prompt_source.heredoc_marker');
      needToken(probs, ctx.factory, FACTORY_PATH, v?.funnel_marker, 'generation.prompt_source.funnel_marker');
      return probs;
    },
  },
  'generation.context_sources': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      if (!nonEmptyStringArray(probs, 'generation.context_sources.declared_reads', v?.declared_reads)) return probs;
      for (const t of v.declared_reads) needToken(probs, ctx.factory, FACTORY_PATH, t, `generation.context_sources.declared_reads[${t}]`);
      return probs;
    },
  },
  'generation.output_schema': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      if (nonEmptyStringArray(probs, 'generation.output_schema.files', v?.files)) {
        for (const f of v.files) needToken(probs, ctx.factory, FACTORY_PATH, `__WORK_DIR__/${f}`, `generation.output_schema.files[${f}]`);
      }
      if (nonEmptyStringArray(probs, 'generation.output_schema.funnel_keys', v?.funnel_keys)) {
        for (const k of v.funnel_keys) needToken(probs, ctx.factory, FACTORY_PATH, `"${k}"`, `generation.output_schema.funnel_keys[${k}]`);
      }
      if (nonEmptyStringArray(probs, 'generation.output_schema.meta_keys', v?.meta_keys)) {
        for (const k of v.meta_keys) needToken(probs, ctx.factory, FACTORY_PATH, `"${k}"`, `generation.output_schema.meta_keys[${k}]`);
      }
      return probs;
    },
  },
  'generation.allowed_tools': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      if (!needFact(probs, '--allowedTools', ctx.facts.allowed_tools_occurrences)) return probs;
      for (const occ of ctx.facts.allowed_tools_occurrences) {
        if (v !== occ) {
          probs.push(`generation.allowed_tools contradicts an --allowedTools declaration in ${FACTORY_PATH} (declared value withheld)`);
          break;
        }
      }
      return probs;
    },
  },
  'generation.turn_budget': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      const mt = ctx.facts.max_turns_occurrences;
      if (!needFact(probs, '--max-turns', mt)) return probs;
      if (mt.length !== 2) {
        probs.push(`expected exactly 2 --max-turns declarations in ${FACTORY_PATH}, found ${mt.length}`);
        return probs;
      }
      needEq(probs, 'generation.turn_budget.generate_max_turns', v?.generate_max_turns, mt[0]);
      needEq(probs, 'generation.turn_budget.fix_max_turns', v?.fix_max_turns, mt[1]);
      if (needFact(probs, 'MAX_FIX', ctx.facts.max_fix_rounds)) {
        needEq(probs, 'generation.turn_budget.max_fix_rounds', v?.max_fix_rounds, ctx.facts.max_fix_rounds);
      }
      return probs;
    },
  },
  'generation.permissions_and_sandbox': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      if (!needToken(probs, ctx.factory, FACTORY_PATH, v?.policing_function ? `${v.policing_function}() {` : v?.policing_function, 'generation.permissions_and_sandbox.policing_function definition')) return probs;
      if (ctx.factory.split(v.policing_function).length - 1 < 2) {
        probs.push('generation.permissions_and_sandbox.policing_function is defined but never invoked');
      }
      return probs;
    },
  },
  'generation.auth_mechanism': { evidence: FACTORY_PATH, verify: verifyScopedSecret('generation') },
  'semantic_gate.provider_integration': { evidence: FACTORY_PATH, verify: verifyCliIntegration('gate') },
  'semantic_gate.cli_version': { evidence: FACTORY_PATH, verify: verifyCliVersion('gate') },
  'semantic_gate.prompt_source': {
    evidence: 'scripts/gate-prompt.txt',
    verify: (v, ctx) => {
      const probs = [];
      needEq(probs, 'semantic_gate.prompt_source.path', v?.path, 'scripts/gate-prompt.txt');
      if (needToken(probs, ctx.factory, FACTORY_PATH, v?.load_marker, 'semantic_gate.prompt_source.load_marker')) {
        if (typeof v?.path === 'string' && !v.load_marker.includes(v.path)) {
          probs.push('semantic_gate.prompt_source.load_marker does not reference the declared path');
        }
      }
      return probs;
    },
  },
  'semantic_gate.invocation': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      needToken(probs, ctx.factory, FACTORY_PATH, v?.command, 'semantic_gate.invocation.command');
      if (nonEmptyStringArray(probs, 'semantic_gate.invocation.flags', v?.flags)) {
        for (const f of v.flags) needToken(probs, ctx.factory, FACTORY_PATH, f, `semantic_gate.invocation.flags[${f}]`);
      }
      return probs;
    },
  },
  'semantic_gate.verdict_contract': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      if (needToken(probs, ctx.factory, FACTORY_PATH, v?.comparison_marker, 'semantic_gate.verdict_contract.comparison_marker')) {
        if (typeof v?.pass_token !== 'string' || !v.comparison_marker.includes(`"${v.pass_token}"`)) {
          probs.push('semantic_gate.verdict_contract.pass_token is not the token compared by comparison_marker');
        }
      }
      return probs;
    },
  },
  'semantic_gate.input_scope': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      needToken(probs, ctx.factory, FACTORY_PATH, v?.utf8_marker, 'semantic_gate.input_scope.utf8_marker');
      if (needToken(probs, ctx.factory, FACTORY_PATH, v?.copy_marker, 'semantic_gate.input_scope.copy_marker')) {
        if (typeof v?.copied_file !== 'string' || !v.copy_marker.includes(v.copied_file)) {
          probs.push('semantic_gate.input_scope.copied_file is not referenced by copy_marker');
        }
      }
      return probs;
    },
  },
  'semantic_gate.auth_mechanism': { evidence: FACTORY_PATH, verify: verifyScopedSecret('gate') },
  'deterministic_verification.node_version_declared': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      if (needFact(probs, 'node-version', ctx.facts.node_version)) {
        needEq(probs, 'deterministic_verification.node_version_declared.declared', v?.declared, ctx.facts.node_version);
      }
      return probs;
    },
  },
  'deterministic_verification.runner_os': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      if (needFact(probs, 'runs-on', ctx.facts.runner_label)) {
        needEq(probs, 'deterministic_verification.runner_os.label', v?.label, ctx.facts.runner_label);
      }
      return probs;
    },
  },
  'deterministic_verification.static_smoke': {
    evidence: 'smoke.mjs',
    verify: (v, ctx) => {
      const probs = [];
      needToken(probs, ctx.factory, FACTORY_PATH, v?.entrypoint, 'deterministic_verification.static_smoke.entrypoint');
      needToken(probs, ctx.sources['smoke.mjs'], 'smoke.mjs', v?.pass_marker, 'deterministic_verification.static_smoke.pass_marker');
      return probs;
    },
  },
  'deterministic_verification.interaction_smoke': {
    evidence: 'scripts/interaction-smoke.mjs',
    verify: (v, ctx) => {
      const probs = [];
      needToken(probs, ctx.factory, FACTORY_PATH, v?.entrypoint, 'deterministic_verification.interaction_smoke.entrypoint');
      if (nonEmptyStringArray(probs, 'deterministic_verification.interaction_smoke.contract_inputs', v?.contract_inputs)) {
        for (const i of v.contract_inputs) {
          needToken(probs, ctx.sources['scripts/interaction-smoke.mjs'], 'scripts/interaction-smoke.mjs', `'${i}'`, `deterministic_verification.interaction_smoke.contract_inputs[${i}]`);
        }
      }
      return probs;
    },
  },
  'deterministic_verification.browser_engine': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      if (needFact(probs, 'playwright pin', ctx.facts.playwright_version)) {
        needEq(probs, 'deterministic_verification.browser_engine.package', v?.package, 'playwright');
        needEq(probs, 'deterministic_verification.browser_engine.version', v?.version, ctx.facts.playwright_version);
      }
      needToken(probs, ctx.factory, FACTORY_PATH, v?.browser ? `--with-deps ${v.browser}` : v?.browser, 'deterministic_verification.browser_engine.browser');
      return probs;
    },
  },
  'deterministic_verification.catalog_builder': {
    evidence: 'scripts/build-catalog.mjs',
    verify: (v, ctx) => {
      const probs = [];
      needToken(probs, ctx.factory, FACTORY_PATH, v?.entrypoint, 'deterministic_verification.catalog_builder.entrypoint');
      needToken(probs, ctx.sources['scripts/build-catalog.mjs'], 'scripts/build-catalog.mjs', v?.fail_closed_marker, 'deterministic_verification.catalog_builder.fail_closed_marker');
      return probs;
    },
  },
  'deterministic_verification.constraints_contract': {
    evidence: 'CONSTRAINTS.md',
    verify: (v, ctx) => {
      const probs = [];
      if (nonEmptyStringArray(probs, 'deterministic_verification.constraints_contract.markers', v?.markers)) {
        for (const m of v.markers) needToken(probs, ctx.sources['CONSTRAINTS.md'], 'CONSTRAINTS.md', m, 'deterministic_verification.constraints_contract.markers[]');
      }
      return probs;
    },
  },
  'deterministic_verification.integrity_check': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      if (!needToken(probs, ctx.factory, FACTORY_PATH, v?.policing_function ? `${v.policing_function}() {` : v?.policing_function, 'deterministic_verification.integrity_check.policing_function definition')) return probs;
      if (ctx.factory.split(v.policing_function).length - 1 < 2) {
        probs.push('deterministic_verification.integrity_check.policing_function is defined but never invoked');
      }
      return probs;
    },
  },
  'publish_runtime.triggers': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      if (nonEmptyStringArray(probs, 'publish_runtime.triggers.events', v?.events)) {
        for (const e of v.events) needToken(probs, ctx.factory, FACTORY_PATH, `${e}:`, `publish_runtime.triggers.events[${e}]`);
      }
      if (needFact(probs, 'schedule cron', ctx.facts.cron)) {
        needEq(probs, 'publish_runtime.triggers.cron', v?.cron, ctx.facts.cron);
      }
      return probs;
    },
  },
  'publish_runtime.workflow_permissions': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      if (needFact(probs, 'permissions.contents', ctx.facts.permissions_contents)) {
        needEq(probs, 'publish_runtime.workflow_permissions.contents', v?.contents, ctx.facts.permissions_contents);
      }
      return probs;
    },
  },
  'publish_runtime.concurrency_and_timeout': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      if (needFact(probs, 'concurrency.group', ctx.facts.concurrency_group)) {
        needEq(probs, 'publish_runtime.concurrency_and_timeout.concurrency_group', v?.concurrency_group, ctx.facts.concurrency_group);
      }
      if (ctx.facts.cancel_in_progress !== null) {
        needEq(probs, 'publish_runtime.concurrency_and_timeout.cancel_in_progress', v?.cancel_in_progress, ctx.facts.cancel_in_progress);
      }
      if (needFact(probs, 'timeout-minutes', ctx.facts.timeouts)) {
        needEq(probs, 'publish_runtime.concurrency_and_timeout.job_timeout_minutes', v?.job_timeout_minutes, ctx.facts.timeouts[0]);
      }
      return probs;
    },
  },
  'publish_runtime.checkout_configuration': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      if (typeof v?.action !== 'string' || !v.action.startsWith('actions/checkout@') || !ctx.facts.action_refs.includes(v.action)) {
        probs.push('publish_runtime.checkout_configuration.action is not a checkout ref actually used by factory.yml');
      }
      if (needFact(probs, 'fetch-depth', ctx.facts.fetch_depth)) {
        needEq(probs, 'publish_runtime.checkout_configuration.fetch_depth', v?.fetch_depth, ctx.facts.fetch_depth);
      }
      needToken(
        probs, ctx.factory, FACTORY_PATH,
        typeof v?.persist_credentials_expression === 'string' ? `persist-credentials: ${v.persist_credentials_expression}` : v?.persist_credentials_expression,
        'publish_runtime.checkout_configuration.persist_credentials_expression'
      );
      return probs;
    },
  },
  'publish_runtime.declared_action_refs': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      if (!nonEmptyStringArray(probs, 'publish_runtime.declared_action_refs.refs', v?.refs)) return probs;
      needEq(probs, 'publish_runtime.declared_action_refs.refs', [...v.refs].sort(), ctx.facts.action_refs);
      return probs;
    },
  },
  'publish_runtime.step_timeouts': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      if (!needFact(probs, 'timeout-minutes', ctx.facts.timeouts)) return probs;
      needEq(probs, 'publish_runtime.step_timeouts.job', v?.job, ctx.facts.timeouts[0]);
      needEq(probs, 'publish_runtime.step_timeouts.steps', v?.steps, ctx.facts.timeouts.slice(1));
      return probs;
    },
  },
  'publish_runtime.publish_mechanism': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      needToken(probs, ctx.factory, FACTORY_PATH, v?.push_command, 'publish_runtime.publish_mechanism.push_command');
      if (needFact(probs, 'push retry loop', ctx.facts.push_attempts)) {
        needEq(probs, 'publish_runtime.publish_mechanism.max_attempts', v?.max_attempts, ctx.facts.push_attempts);
      }
      return probs;
    },
  },
  'publish_runtime.dry_run_canary': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      needToken(probs, ctx.factory, FACTORY_PATH, typeof v?.input_name === 'string' ? `${v.input_name}:` : v?.input_name, 'publish_runtime.dry_run_canary.input_name');
      if (needToken(probs, ctx.factory, FACTORY_PATH, v?.guard_marker, 'publish_runtime.dry_run_canary.guard_marker')) {
        if (!v.guard_marker.includes('"$DRY_RUN"')) {
          probs.push('publish_runtime.dry_run_canary.guard_marker does not test the DRY_RUN variable');
        }
      }
      return probs;
    },
  },
  'publish_runtime.artifact_persistence': {
    evidence: FACTORY_PATH,
    verify: (v, ctx) => {
      const probs = [];
      if (typeof v?.action !== 'string' || !v.action.startsWith('actions/upload-artifact@') || !ctx.facts.action_refs.includes(v.action)) {
        probs.push('publish_runtime.artifact_persistence.action is not an upload-artifact ref actually used by factory.yml');
      }
      needToken(probs, ctx.factory, FACTORY_PATH, typeof v?.condition === 'string' ? `if: ${v.condition}` : v?.condition, 'publish_runtime.artifact_persistence.condition');
      needToken(probs, ctx.factory, FACTORY_PATH, v?.path_expression, 'publish_runtime.artifact_persistence.path_expression');
      return probs;
    },
  },
};

// 全OBSERVED fieldを registry で検証する。
// 戻り値: {problems, observedTotal, verifiedOk, missingVerifier}
export function verifyObservedFields(baseline, ctx) {
  const problems = [];
  const missingVerifier = [];
  let observedTotal = 0;
  let verifiedOk = 0;
  for (const [cap, fields] of Object.entries(baseline.capabilities || {})) {
    for (const [fieldName, entry] of Object.entries(fields || {})) {
      if (!entry || entry.status !== 'OBSERVED') continue;
      observedTotal++;
      const key = `${cap}.${fieldName}`;
      const reg = OBSERVED_VERIFIERS[key];
      if (!reg) {
        missingVerifier.push(key);
        problems.push(`no registered verifier for OBSERVED field ${key} — schema ${SCHEMA_VERSION} forbids unverifiable OBSERVED values`);
        continue;
      }
      if (entry.evidence?.kind !== 'repository' || entry.evidence?.path !== reg.evidence) {
        problems.push(`evidence for ${key} must be repository evidence at ${reg.evidence}`);
        continue;
      }
      const fieldProblems = reg.verify(entry.value, ctx);
      if (fieldProblems.length) {
        problems.push(...fieldProblems.map((p) => `verifier[${key}]: ${p}`));
      } else {
        verifiedOk++;
      }
    }
  }
  return { problems, observedTotal, verifiedOk, missingVerifier };
}

// ---------- working tree との照合 ----------

export function verifyMaterialSources(baseline, repoRoot) {
  const verified = [];
  const productionMismatched = [];
  const snapshotDrift = [];
  const internallyInconsistent = [];
  const missing = [];
  const rejected = [];
  const observed = {};
  for (const [rel, decl] of Object.entries(baseline.material_sources || {})) {
    // 不正なpath(遡行・絶対・symlink・repo外脱出)は読み取り自体を拒否する。
    // ここで読んでhashを記録すると、repo外ファイル内容の確認oracleになってしまう。
    if (validatePathShape(rel)) {
      rejected.push(rel);
      observed[rel] = null;
      continue;
    }
    const st = inspectRepoPath(repoRoot, rel).state;
    if (st === 'missing') {
      missing.push(rel);
      observed[rel] = null;
      continue;
    }
    if (st !== 'ok') {
      rejected.push(rel);
      observed[rel] = null;
      continue;
    }
    const buf = fs.readFileSync(path.join(repoRoot, rel));
    const got = { git_blob_sha1: computeGitBlobSha1(buf), sha256: computeSha256(buf) };
    observed[rel] = got;
    const blobMatch = got.git_blob_sha1 === decl.git_blob_sha1;
    const shaMatch = got.sha256 === decl.sha256;
    if (blobMatch && shaMatch) {
      verified.push(rel);
    } else if (blobMatch !== shaMatch) {
      // 片方だけ一致 = 宣言された2つのdigestが同じ内容を指していない。
      // これは構成変化(STALE)ではなく baseline 内部不整合(FAIL)。
      internallyInconsistent.push({ path: rel, blob_matches: blobMatch, sha256_matches: shaMatch });
    } else if (decl.classification === 'control_plane_snapshot') {
      snapshotDrift.push({ path: rel, declared: { git_blob_sha1: decl.git_blob_sha1 }, observed: got });
    } else {
      productionMismatched.push({ path: rel, declared: { git_blob_sha1: decl.git_blob_sha1, sha256: decl.sha256 }, observed: got });
    }
  }
  return { verified, productionMismatched, snapshotDrift, internallyInconsistent, missing, rejected, observed };
}

// 各OBSERVED fieldのrepository evidenceを再検証する。
export function verifyEvidence(baseline, repoRoot) {
  const materials = baseline.material_sources || {};
  const materialMismatches = [];
  const snapshotDrift = [];
  const brokenEvidence = [];
  for (const [cap, fields] of Object.entries(baseline.capabilities || {})) {
    for (const [fieldName, entry] of Object.entries(fields || {})) {
      if (!entry || entry.status !== 'OBSERVED') continue;
      const ev = entry.evidence;
      if (!ev || ev.kind !== 'repository') continue;
      const ref = `capabilities.${cap}.${fieldName}`;
      const decl = materials[ev.path];
      if (decl && ev.git_blob_sha1 !== decl.git_blob_sha1) {
        brokenEvidence.push({
          field: ref,
          path: ev.path,
          problem: 'evidence hash contradicts the baseline material_sources declaration for the same path (baseline internally inconsistent)',
        });
        continue;
      }
      // 不正なpathは読まない(run() が path 検査で FAIL を記録する。内容確認oracle化を防ぐ)。
      if (validatePathShape(ev.path)) continue;
      const st = inspectRepoPath(repoRoot, ev.path).state;
      if (st === 'missing') {
        if (!decl) brokenEvidence.push({ field: ref, path: ev.path, problem: 'evidence file missing from working tree' });
        continue;
      }
      if (st !== 'ok') continue;
      const got = computeGitBlobSha1(fs.readFileSync(path.join(repoRoot, ev.path)));
      if (got !== ev.git_blob_sha1) {
        const rec = { field: ref, path: ev.path, declared: ev.git_blob_sha1, observed: got };
        if (!decl) brokenEvidence.push(rec);
        else if (decl.classification === 'control_plane_snapshot') snapshotDrift.push(rec);
        else materialMismatches.push(rec);
      }
    }
  }
  return { materialMismatches, snapshotDrift, brokenEvidence };
}

// ---------- runtime facts ----------

function observedRuntimeField(value, source, derivedFrom) {
  return {
    status: 'OBSERVED',
    value,
    evidence: { kind: 'runtime', source, derived_from: derivedFrom },
  };
}

function unknownRuntimeField(reason, resolution) {
  return { status: 'UNKNOWN', value: null, reason, resolution };
}

export function collectRuntime(env, startedAtIso) {
  const rt = {};
  rt.os_platform = observedRuntimeField(process.platform, 'node:process.platform', 'C0 observer process at run time');
  rt.architecture = observedRuntimeField(os.arch(), 'node:os.arch()', 'C0 observer process at run time');
  rt.kernel = observedRuntimeField(os.release(), 'node:os.release()', 'C0 observer process at run time');
  rt.os_version = observedRuntimeField(`${os.type()} ${os.release()}`, 'node:os.type()+os.release()', 'C0 observer process at run time');
  rt.node_version = observedRuntimeField(process.version, 'node:process.version', 'C0 observer process at run time');
  rt.runner_os_label = env.RUNNER_OS
    ? observedRuntimeField(env.RUNNER_OS, 'env:RUNNER_OS', 'GitHub Actions runner environment')
    : unknownRuntimeField(
        'RUNNER_OS is not set; the observer is not running on a GitHub Actions runner.',
        'Run via .github/workflows/c0-provenance.yml to observe the runner label.'
      );
  rt.runner_image_version = env.ImageVersion
    ? observedRuntimeField(env.ImageVersion, 'env:ImageVersion', 'GitHub-hosted runner image environment')
    : unknownRuntimeField(
        'ImageVersion is not set; runner image revision is only exposed on GitHub-hosted runners.',
        'Run via .github/workflows/c0-provenance.yml on a GitHub-hosted runner.'
      );
  rt.workflow_run_id = env.GITHUB_RUN_ID
    ? observedRuntimeField(env.GITHUB_RUN_ID, 'env:GITHUB_RUN_ID', 'GitHub Actions run context')
    : unknownRuntimeField(
        'GITHUB_RUN_ID is not set; not running inside a GitHub Actions workflow.',
        'Run via .github/workflows/c0-provenance.yml.'
      );
  rt.workflow_run_attempt = env.GITHUB_RUN_ATTEMPT
    ? observedRuntimeField(env.GITHUB_RUN_ATTEMPT, 'env:GITHUB_RUN_ATTEMPT', 'GitHub Actions run context')
    : unknownRuntimeField(
        'GITHUB_RUN_ATTEMPT is not set; not running inside a GitHub Actions workflow.',
        'Run via .github/workflows/c0-provenance.yml.'
      );
  rt.started_at = observedRuntimeField(startedAtIso, 'observer clock (Date.toISOString)', 'C0 observer start');
  return rt;
}

// checkout SHA / HEAD SHA / HEAD tree SHA / PR head SHA を別々に記録する(fix: history binding)。
export function observeShas(env, repoRoot) {
  const out = {};
  out.checkout_sha = env.GITHUB_SHA && SHA1_RE.test(env.GITHUB_SHA)
    ? observedRuntimeField(env.GITHUB_SHA, 'env:GITHUB_SHA', 'GitHub Actions checkout context (merge commit for pull_request events)')
    : unknownRuntimeField('GITHUB_SHA is not set or malformed.', 'Run via .github/workflows/c0-provenance.yml.');
  const head = gitRevParse(repoRoot, 'HEAD');
  out.head_sha = head
    ? observedRuntimeField(head, 'git rev-parse HEAD (read-only)', 'local git metadata of the observed working tree')
    : unknownRuntimeField('No readable git HEAD in the observed tree.', 'Run inside a git checkout.');
  const tree = gitRevParse(repoRoot, 'HEAD^{tree}');
  out.head_tree_sha = tree
    ? observedRuntimeField(tree, 'git rev-parse HEAD^{tree} (read-only)', 'local git metadata of the observed working tree')
    : unknownRuntimeField('No readable git HEAD tree in the observed tree.', 'Run inside a git checkout.');
  let prHead = null;
  if (env.GITHUB_EVENT_PATH) {
    try {
      const payload = JSON.parse(fs.readFileSync(env.GITHUB_EVENT_PATH, 'utf8'));
      const sha = payload?.pull_request?.head?.sha;
      if (typeof sha === 'string' && SHA1_RE.test(sha)) prHead = sha;
    } catch {
      // fall through to UNKNOWN
    }
  }
  out.pr_head_sha = prHead
    ? observedRuntimeField(prHead, 'GITHUB_EVENT_PATH payload pull_request.head.sha', 'GitHub Actions pull_request event payload')
    : unknownRuntimeField(
        'No pull_request event payload with a head SHA is available (not a pull_request-triggered run).',
        'Available only on pull_request-triggered workflow runs.'
      );
  return out;
}

// ---------- 結果判定 ----------

export function computeResult({ holdReasons, failReasons, voidReasons, staleReasons }) {
  if (holdReasons.length) return { result: 'HOLD', reasons: holdReasons };
  if (failReasons.length) return { result: 'FAIL', reasons: failReasons };
  if (voidReasons.length) return { result: 'VOID', reasons: voidReasons };
  if (staleReasons.length) return { result: 'STALE', reasons: staleReasons };
  return {
    result: 'PASS',
    reasons: ['All OBSERVED fields verified against their evidence sources (coverage 100%); every remaining gap is an explicit UNKNOWN with reason and resolution. PASS covers the C0 canary only — not C1 benchmarks, model comparison, or Champion adoption.'],
  };
}

// ---------- 出力(リポジトリ外のみ) ----------

function resolveWithExistingAncestor(p) {
  let cur = path.resolve(p);
  const tail = [];
  while (!fs.existsSync(cur)) {
    const parent = path.dirname(cur);
    if (parent === cur) break;
    tail.unshift(path.basename(cur));
    cur = parent;
  }
  let real = cur;
  try {
    real = fs.realpathSync(cur);
  } catch {
    // 実体解決できない場合は lexical のまま比較する(fail-closed 側は呼び出し元の拒否)
  }
  return path.join(real, ...tail);
}

export function isInsideRepo(candidate, repoRoot) {
  let root = path.resolve(repoRoot);
  try {
    root = fs.realpathSync(root);
  } catch {
    // repoRoot が未存在でも lexical 比較は成立する
  }
  const rel = path.relative(root, resolveWithExistingAncestor(candidate));
  if (rel === '') return true;
  if (path.isAbsolute(rel)) return false;
  return rel !== '..' && !rel.startsWith('..' + path.sep);
}

// ---------- 本体 ----------

export function run({ repoRoot, outDir, baselinePath, env = process.env, log: echo = () => {} }) {
  const startedMs = Date.now();
  const startedAtIso = new Date(startedMs).toISOString();
  const holdReasons = [];
  const failReasons = [];
  const voidReasons = [];
  const staleReasons = [];
  const logLines = [];
  const log = (line) => {
    const stamped = `[c0] ${line}`;
    logLines.push(stamped);
    echo(stamped);
  };

  repoRoot = path.resolve(repoRoot);
  outDir = path.resolve(outDir);
  baselinePath = path.resolve(baselinePath ?? path.join(repoRoot, 'config', 'champion-baseline.json'));

  if (isInsideRepo(outDir, repoRoot)) {
    throw new Error(
      `refusing to write artifacts inside the repository: out=${outDir} repo=${repoRoot} — use a runner temp directory (e.g. $RUNNER_TEMP)`
    );
  }

  log(`C0 observer start: repo=${repoRoot}`);
  log(`baseline: ${baselinePath}`);
  log(`out: ${outDir} (outside repository: verified)`);

  let baseline = null;
  let baselineHashes = null;
  if (!fs.existsSync(baselinePath)) {
    failReasons.push(`baseline not found: ${baselinePath}`);
  } else {
    const raw = fs.readFileSync(baselinePath);
    baselineHashes = { git_blob_sha1: computeGitBlobSha1(raw), sha256: computeSha256(raw) };
    try {
      baseline = JSON.parse(raw.toString('utf8'));
    } catch (e) {
      const pos = /at position (\d+)/.exec(String(e.message));
      failReasons.push(
        `baseline is not valid JSON${pos ? ` (error near position ${pos[1]})` : ''} — parse details withheld to avoid quoting file content`
      );
    }
  }

  let materials = { verified: [], productionMismatched: [], snapshotDrift: [], internallyInconsistent: [], missing: [], rejected: [], observed: {} };
  let evidence = { materialMismatches: [], snapshotDrift: [], brokenEvidence: [] };
  let verification = { performed: false, observed_fields: null, verified_fields: null, coverage_percent: null };

  if (baseline) {
    if (baseline.schema !== SCHEMA_VERSION) {
      holdReasons.push(
        `baseline declares schema ${JSON.stringify(baseline.schema)} but this observer implements ${SCHEMA_VERSION}; human decision required before comparison`
      );
    } else {
      const schemaProblems = validateBaseline(baseline);
      if (schemaProblems.length) {
        failReasons.push(...schemaProblems.map((s) => `baseline schema violation: ${s}`));
      } else {
        // exact manifest(欠落・未定義追加・誤分類は FAIL)
        failReasons.push(...enforceManifest(baseline));

        // 全宣言 path の検査(material + evidence)
        const declaredPaths = new Set(Object.keys(baseline.material_sources));
        for (const fields of Object.values(baseline.capabilities)) {
          for (const entry of Object.values(fields)) {
            if (entry?.status === 'OBSERVED' && entry.evidence?.kind === 'repository' && typeof entry.evidence.path === 'string') {
              declaredPaths.add(entry.evidence.path);
            }
          }
        }
        const usablePaths = new Set();
        for (const rel of [...declaredPaths].sort()) {
          const shapeProblem = validatePathShape(rel);
          if (shapeProblem) {
            failReasons.push(`declared path rejected: ${rel} — ${shapeProblem}`);
            continue;
          }
          const st = inspectRepoPath(repoRoot, rel).state;
          if (st === 'symlink') failReasons.push(`declared path rejected: ${rel} — symlinks are forbidden`);
          else if (st === 'not-regular') failReasons.push(`declared path rejected: ${rel} — only regular files are allowed`);
          else if (st === 'escapes') failReasons.push(`declared path rejected: ${rel} — realpath resolves outside the repository`);
          else usablePaths.add(rel);
        }

        // git 照会: tracked 強制、repository 同一性、base commit の実在・祖先性・tree 照合
        const git = gitTrackedFiles(repoRoot);
        if (!git.isRepo) {
          voidReasons.push('observed tree is not a git work tree — tracked-file, repository-identity and base-commit verification cannot be established');
        } else {
          for (const rel of [...usablePaths].sort()) {
            if (inspectRepoPath(repoRoot, rel).state === 'ok' && !git.tracked.has(rel)) {
              failReasons.push(`declared path rejected: ${rel} — untracked files are forbidden as provenance sources`);
            }
          }

          const ident = resolveRepoIdentity(env, repoRoot);
          if (!ident) {
            voidReasons.push('executing repository identity cannot be established (no GITHUB_REPOSITORY and no origin remote)');
          } else if (baseline.base.repository.toLowerCase() !== ident.id.toLowerCase()) {
            failReasons.push(`base.repository does not match the executing repository (${ident.id} via ${ident.source})`);
          }

          const baseSha = baseline.base.base_sha;
          if (!gitCommitExists(repoRoot, baseSha)) {
            failReasons.push(`base.base_sha ${baseSha} does not exist as a commit in this repository (fictitious base)`);
          } else {
            const headSha = gitRevParse(repoRoot, 'HEAD');
            if (headSha && !gitIsAncestor(repoRoot, baseSha, headSha)) {
              failReasons.push(
                `base.base_sha ${baseSha} is not an ancestor of the inspected HEAD — the declared base is outside this repository's history`
              );
            }
            const baseTree = gitTreeBlobs(repoRoot, baseSha);
            for (const [rel, decl] of Object.entries(baseline.material_sources)) {
              if (validatePathShape(rel)) continue;
              const atBase = baseTree.get(rel);
              if (!atBase) {
                failReasons.push(`material source ${rel} is absent from the declared base commit ${baseSha}`);
              } else if (atBase !== decl.git_blob_sha1) {
                failReasons.push(
                  `material source ${rel}: declared git_blob_sha1 does not match the blob recorded in the declared base commit ${baseSha} (declaration is not anchored to its own base)`
                );
              }
            }
          }
        }

        // working tree 照合
        materials = verifyMaterialSources(baseline, repoRoot);
        evidence = verifyEvidence(baseline, repoRoot);
        for (const rel of materials.missing) {
          voidReasons.push(`material source missing from working tree: ${rel} — observation cannot be established (VOID, not FAIL)`);
        }
        for (const ic of materials.internallyInconsistent) {
          failReasons.push(
            `material source ${ic.path}: declared git_blob_sha1 and sha256 disagree about the same content (blob match=${ic.blob_matches}, sha256 match=${ic.sha256_matches}) — baseline internally inconsistent`
          );
        }
        for (const mm of materials.productionMismatched) {
          staleReasons.push(
            `production material changed: ${mm.path} (declared blob ${mm.declared.git_blob_sha1}, observed ${mm.observed.git_blob_sha1}) — baseline assertions referencing it are materially STALE`
          );
        }
        for (const d of materials.snapshotDrift) {
          log(`control-plane snapshot drift (not STALE): ${d.path} observed blob ${d.observed.git_blob_sha1}`);
        }
        for (const mm of evidence.materialMismatches) {
          staleReasons.push(`evidence for ${mm.field} points at changed production material ${mm.path}`);
        }
        for (const be of evidence.brokenEvidence) {
          failReasons.push(
            `evidence integrity broken for ${be.field}: ${be.path} ${be.problem ?? `declared ${be.declared}, observed ${be.observed}`}`
          );
        }

        // verifier phase: 全production materialが宣言どおり不変のときだけ実行する
        // (materialが変化しているなら STALE が正しい結果であり、値検証はしない)
        if (
          materials.productionMismatched.length === 0 &&
          materials.internallyInconsistent.length === 0 &&
          materials.missing.length === 0 &&
          materials.rejected.length === 0
        ) {
          const sources = {};
          for (const [rel, cls] of Object.entries(REQUIRED_MATERIALS)) {
            if (cls === 'production_material' && baseline.material_sources[rel] && inspectRepoPath(repoRoot, rel).state === 'ok') {
              sources[rel] = fs.readFileSync(path.join(repoRoot, rel), 'utf8');
            }
          }
          const factoryText = sources[FACTORY_PATH] ?? '';
          const ctx = {
            factory: factoryText,
            sources,
            facts: extractFactoryFacts(factoryText),
            scoped: extractScopedSecrets(factoryText),
          };
          const vres = verifyObservedFields(baseline, ctx);
          failReasons.push(...vres.problems);
          verification = {
            performed: true,
            observed_fields: vres.observedTotal,
            verified_fields: vres.verifiedOk,
            coverage_percent: vres.observedTotal === 0 ? 100 : Math.floor((vres.verifiedOk / vres.observedTotal) * 100),
          };
          if (verification.coverage_percent < 100) {
            failReasons.push(
              `verified OBSERVED coverage ${verification.coverage_percent}% (${vres.verifiedOk}/${vres.observedTotal}) < 100% — PASS requires every OBSERVED field to be verified against its source`
            );
          }
          log(`observed-field verification: ${vres.verifiedOk}/${vres.observedTotal} verified (coverage ${verification.coverage_percent}%)`);
        } else {
          log('observed-field verification skipped: production materials are not verified unchanged');
        }

        log(
          `material sources — verified: ${materials.verified.length}, production changed: ${materials.productionMismatched.length}, snapshot drift: ${materials.snapshotDrift.length}, inconsistent: ${materials.internallyInconsistent.length}, missing: ${materials.missing.length}`
        );
      }
    }
  }

  // runtime facts(観測者自身の実行環境)
  const runtime = collectRuntime(env, startedAtIso);
  Object.assign(runtime, observeShas(env, repoRoot));

  const finishedMs = Date.now();
  runtime.finished_at = observedRuntimeField(new Date(finishedMs).toISOString(), 'observer clock (Date.toISOString)', 'C0 observer end');
  runtime.observer_latency_ms = observedRuntimeField(
    finishedMs - startedMs,
    'observer clock delta',
    'Latency of the C0 observer itself. This is NOT production factory latency and must never be compared against it.'
  );

  const provenance = {
    schema: SCHEMA_VERSION,
    kind: 'provenance-observation',
    generated_at: new Date(finishedMs).toISOString(),
    baseline: baseline
      ? { path: path.relative(repoRoot, baselinePath), ...baselineHashes }
      : { path: path.relative(repoRoot, baselinePath), error: 'baseline unreadable' },
    base: {
      declared_repository: baseline?.base?.repository ?? null,
      declared_base_sha: baseline?.base?.base_sha ?? null,
      policy:
        'base_sha must be a real commit and an ancestor of the inspected HEAD, with material blobs anchored to its tree. Only production-material content changes make this baseline STALE; control-plane snapshot drift is recorded as information, and a default-branch head change alone never invalidates the observation.',
    },
    material_sources: Object.fromEntries(
      Object.entries(baseline?.material_sources ?? {}).map(([rel, decl]) => [
        rel,
        {
          classification: decl.classification,
          declared: { git_blob_sha1: decl.git_blob_sha1, sha256: decl.sha256 },
          observed: materials.observed[rel] ?? null,
          match: !!(
            materials.observed[rel] &&
            materials.observed[rel].git_blob_sha1 === decl.git_blob_sha1 &&
            materials.observed[rel].sha256 === decl.sha256
          ),
        },
      ])
    ),
    snapshot_drift: [...materials.snapshotDrift, ...evidence.snapshotDrift].map((d) => ({
      path: d.path,
      observed_git_blob_sha1: d.observed?.git_blob_sha1 ?? d.observed,
      note: 'control-plane snapshot drift; recorded for information, does not invalidate the baseline',
    })),
    verification,
    capabilities: baseline?.capabilities ?? null,
    runtime,
  };

  const provenanceJson = JSON.stringify(provenance, null, 2);
  const secretHits = [
    ...scanForSecrets(provenanceJson),
    ...scanKeysForSecretLeaks(provenance),
    ...(baseline ? scanKeysForSecretLeaks(baseline) : []),
  ];
  if (secretHits.length) {
    for (const h of secretHits) {
      failReasons.push(`secret-like content detected (${h.kind}: ${h.label}${h.keyPath ? ` at ${h.keyPath}` : ''}) — value withheld`);
    }
  }

  const { result, reasons } = computeResult({ holdReasons, failReasons, voidReasons, staleReasons });
  log(`result: ${result}`);
  for (const r of reasons) log(`  - ${r}`);

  const resultDoc = {
    schema: SCHEMA_VERSION,
    kind: 'c0-result',
    result,
    reasons,
    verification,
    generated_at: new Date().toISOString(),
    scope: 'PASS means the C0 provenance canary only. It does not imply C1 benchmark results, model comparison, or Champion adoption.',
    artifacts: secretHits.length ? ['result.json', 'verification.log'] : ['provenance.json', 'result.json', 'verification.log'],
  };

  fs.mkdirSync(outDir, { recursive: true });
  if (!secretHits.length) {
    fs.writeFileSync(path.join(outDir, 'provenance.json'), provenanceJson + '\n', 'utf8');
  } else {
    log('provenance.json withheld: secret-like content detected (values not written)');
  }

  let resultJson = JSON.stringify(resultDoc, null, 2);
  if (scanForSecrets(resultJson).length) {
    resultDoc.reasons = ['reasons withheld: secret-like content detected in result reasons'];
    resultDoc.sanitized = true;
    resultJson = JSON.stringify(resultDoc, null, 2);
    log('result.json reasons withheld: secret-like content detected');
  }
  fs.writeFileSync(path.join(outDir, 'result.json'), resultJson + '\n', 'utf8');

  const logText = logLines.join('\n') + '\n';
  fs.appendFileSync(
    path.join(outDir, 'verification.log'),
    scanForSecrets(logText).length ? '[c0] observer log withheld: secret-like content detected\n' : logText,
    'utf8'
  );

  return { result, reasons: resultDoc.reasons, provenance: secretHits.length ? null : provenance, resultDoc, outDir };
}

// ---------- CLI ----------

function parseArgs(argv) {
  const opts = {};
  const need = (flag, v) => {
    if (v === undefined) throw new Error(`missing value for ${flag}`);
    return v;
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo') opts.repoRoot = need(a, argv[++i]);
    else if (a === '--out') opts.outDir = need(a, argv[++i]);
    else if (a === '--baseline') opts.baselinePath = need(a, argv[++i]);
    else throw new Error(`unknown argument: ${a}`);
  }
  return opts;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  // exit code 契約: 0 = PASS / 1 = 観測は成立したが PASS ではない / 2 = 観測前エラー(引数・出力先)
  let outcome;
  try {
    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    const opts = parseArgs(process.argv.slice(2));
    const repoRoot = path.resolve(opts.repoRoot ?? path.join(scriptDir, '..'));
    let outDir = opts.outDir;
    if (!outDir) {
      if (!process.env.RUNNER_TEMP) {
        throw new Error('--out is required when RUNNER_TEMP is not set (artifacts must live outside the repository).');
      }
      outDir = path.join(process.env.RUNNER_TEMP, 'c0-provenance');
    }
    outcome = run({ repoRoot, outDir, baselinePath: opts.baselinePath, log: (line) => console.log(line) });
  } catch (e) {
    console.error(`c0-provenance: ${e.message}`);
    process.exit(2);
  }
  process.exit(outcome.result === 'PASS' ? 0 : 1);
}
