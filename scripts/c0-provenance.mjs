#!/usr/bin/env node
// c0-provenance.mjs — C0 Configuration Provenance observer (read-only canary).
//
// ROADMAP.md C0: 現行Production構成を「後から再検査・比較できる形」で記録する。
// このスクリプトは観測者であり、Factory本体・モデル・prompt・Secretsには一切触れない。
//
// 動作:
//   1. config/champion-baseline.json(baseline declaration)を読み、schema検証する。
//   2. 固定manifest(必須capability group / 必須field / 必須material path)を強制する。
//      group・field・materialを1件でも削除した baseline は FAIL。
//   3. 全宣言path(material + evidence)を検査する: 絶対path・`..`遡行・symlink・
//      regular file以外・untracked file・realpathでのrepo外脱出をすべて拒否(FAIL)。
//   4. base_sha が実在するcommitであることを git cat-file で確認し、宣言された
//      material blob SHA-1 をそのbase treeと照合する(架空SHA・不一致は FAIL)。
//   5. material source を working tree から再ハッシュし宣言値と照合する。
//      - production material の変化 → STALE
//      - control-plane snapshot(OS.md 等)の変化 → 情報として記録するだけ(STALEにしない)
//   6. 機械抽出可能なOBSERVED値(CLI版数・allowedTools・turn budget・Node版数・
//      Playwright版数・runner label・permissions・cron・Secret宣言名など)を
//      factory.yml の実体から抽出して照合する。宣言と実体の矛盾は FAIL。
//   7. 実行環境(OS / arch / kernel / Node / run ID / attempt / SHA / 時刻 / 観測者自身の
//      latency)を runtime facts として記録する。観測できないものは UNKNOWN(理由+解消方法)。
//   8. provenance.json / result.json / verification.log をリポジトリ外の出力先へ書く。
//      リポジトリ内部への出力は拒否する(read-only 保証)。
//
// 結果状態(fail-closed 優先順位: HOLD > FAIL > VOID > STALE > PASS):
//   PASS  — baseline整合・全fieldがOBSERVED(証拠付き)またはUNKNOWN(理由付き)
//   FAIL  — schema/manifest違反、証拠不整合、factory.ymlとの値矛盾、path違反、
//           架空base SHA、Secretらしい値の混入
//   VOID  — material source欠落・git work treeでない等、観測自体が成立しない
//   STALE — production material の内容が baseline宣言から変化
//           (main SHAの変化やsnapshot文書の更新だけではSTALEにしない)
//   HOLD  — schema版数不一致など、人間判断なしに解消できない曖昧さ
//
// Secrets: 値・hash・prefix・長さを一切出力しない。Secret「宣言名」の記録のみ許可。
//
// 使い方: node scripts/c0-provenance.mjs [--repo <dir>] [--out <dir>] [--baseline <path>]
//   --out 省略時は $RUNNER_TEMP/c0-provenance を使う(未設定ならエラー)。

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

// ---------- 固定 manifest ----------
// baseline が名乗る schema atf-configuration-provenance/v1 の必須構成。
// ここから1件でも欠けた baseline は FAIL(黙って縮小したschemaを受け入れない)。

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
  ],
  publish_runtime: [
    'triggers', 'workflow_permissions', 'concurrency_and_timeout', 'checkout_configuration',
    'publish_mechanism', 'dry_run_canary', 'artifact_persistence', 'pages_reachability_verification',
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
// マッチした本文は絶対に出力しない(labelと位置のみ返す)。
// 値パターンに加え、「Secretのhash/prefix/長さ」を示唆するkey名も禁止する。

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
// 各fieldは OBSERVED(値+証拠+由来)または UNKNOWN(null+理由+解消方法)のどちらか。
// 空欄・推測・暗黙値は禁止。

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
    // 実際の値はエラー文へ載せない(Secretらしい値が status に紛れても artifact へ漏れないように)
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
  } else if (typeof doc.base.base_sha !== 'string' || !SHA1_RE.test(doc.base.base_sha)) {
    problems.push('base.base_sha must be a 40-hex commit SHA');
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

// ---------- manifest 強制 ----------
// 必須group・必須field・必須material pathの削除、classificationの誤りは FAIL。

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
  }
  return problems;
}

// ---------- path 検査 ----------
// 宣言された全path(material + evidence)は、repo相対・遡行なし・symlinkでない
// regular fileで、realpath解決後もrepo内に留まらなければならない。

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

// base commit の tree に含まれる path → blob SHA-1 の対応表
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

// ---------- factory.yml からの機械抽出と照合 ----------
// baseline の OBSERVED 値のうち機械抽出可能なものは、宣言の書き写しではなく
// factory.yml の実体から抽出した値と照合する。矛盾(例: provider を OpenAI へ
// 改変)は FAIL。material が変化している場合は STALE が先に立つため照合しない。

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
    job_timeout_minutes: num(one(/timeout-minutes:\s*(\d+)/)),
    cron: one(/cron:\s*'([^']+)'/),
    secret_declarations: [...new Set(all(/secrets\.([A-Z0-9_]+)/))],
    sandbox: one(/--sandbox ([^\s"']+)/),
    gate_prompt_reference: /scripts\/gate-prompt\.txt/.test(text),
  };
}

export function crossCheckAgainstFactory(baseline, factoryText) {
  const problems = [];
  const f = extractFactoryFacts(factoryText);
  const caps = baseline.capabilities || {};
  const gen = caps.generation || {};
  const gate = caps.semantic_gate || {};
  const det = caps.deterministic_verification || {};
  const pub = caps.publish_runtime || {};
  // 宣言側の値はエラー文へ載せない(Secretらしい値の混入経路を作らない)。抽出値のみ示す。
  const bad = (ref, expected) =>
    problems.push(`cross-check: ${ref} contradicts factory.yml (expected from factory.yml: ${JSON.stringify(expected)}; declared value withheld)`);
  const need = (label, fact) => {
    const missing = fact === null || fact === undefined || (Array.isArray(fact) && fact.length === 0);
    if (missing) problems.push(`cross-check: ${label} is not machine-extractable from factory.yml`);
    return !missing;
  };

  if (need('generation CLI pin', f.generation_cli_version)) {
    if (gen.cli_version?.value?.name !== f.generation_cli_package) bad('generation.cli_version.name', f.generation_cli_package);
    if (gen.cli_version?.value?.version !== f.generation_cli_version) bad('generation.cli_version.version', f.generation_cli_version);
    if (typeof gen.provider_integration?.value !== 'string' || !gen.provider_integration.value.includes(f.generation_cli_package)) {
      bad('generation.provider_integration', `a value referencing ${f.generation_cli_package}`);
    }
  }
  if (need('gate CLI pin', f.gate_cli_version)) {
    if (gate.cli_version?.value?.name !== f.gate_cli_package) bad('semantic_gate.cli_version.name', f.gate_cli_package);
    if (gate.cli_version?.value?.version !== f.gate_cli_version) bad('semantic_gate.cli_version.version', f.gate_cli_version);
    if (typeof gate.provider_integration?.value !== 'string' || !gate.provider_integration.value.includes(f.gate_cli_package)) {
      bad('semantic_gate.provider_integration', `a value referencing ${f.gate_cli_package}`);
    }
  }
  if (need('--allowedTools', f.allowed_tools_occurrences)) {
    for (const occ of f.allowed_tools_occurrences) {
      if (gen.allowed_tools?.value !== occ) bad('generation.allowed_tools', occ);
    }
  }
  if (need('--max-turns', f.max_turns_occurrences)) {
    if (f.max_turns_occurrences.length !== 2) {
      problems.push(`cross-check: expected exactly 2 --max-turns declarations in factory.yml, found ${f.max_turns_occurrences.length}`);
    } else {
      if (gen.turn_budget?.value?.generate_max_turns !== f.max_turns_occurrences[0]) bad('generation.turn_budget.generate_max_turns', f.max_turns_occurrences[0]);
      if (gen.turn_budget?.value?.fix_max_turns !== f.max_turns_occurrences[1]) bad('generation.turn_budget.fix_max_turns', f.max_turns_occurrences[1]);
    }
  }
  if (need('MAX_FIX', f.max_fix_rounds) && gen.turn_budget?.value?.max_fix_rounds !== f.max_fix_rounds) {
    bad('generation.turn_budget.max_fix_rounds', f.max_fix_rounds);
  }
  if (need('node-version', f.node_version) && det.node_version_declared?.value?.declared !== f.node_version) {
    bad('deterministic_verification.node_version_declared.declared', f.node_version);
  }
  if (need('playwright pin', f.playwright_version)) {
    if (det.browser_engine?.value?.package !== 'playwright') bad('deterministic_verification.browser_engine.package', 'playwright');
    if (det.browser_engine?.value?.version !== f.playwright_version) bad('deterministic_verification.browser_engine.version', f.playwright_version);
  }
  if (need('runs-on', f.runner_label) && det.runner_os?.value?.label !== f.runner_label) {
    bad('deterministic_verification.runner_os.label', f.runner_label);
  }
  if (need('permissions.contents', f.permissions_contents) && pub.workflow_permissions?.value?.contents !== f.permissions_contents) {
    bad('publish_runtime.workflow_permissions.contents', f.permissions_contents);
  }
  if (need('concurrency.group', f.concurrency_group) && pub.concurrency_and_timeout?.value?.concurrency_group !== f.concurrency_group) {
    bad('publish_runtime.concurrency_and_timeout.concurrency_group', f.concurrency_group);
  }
  if (need('job timeout-minutes', f.job_timeout_minutes) && pub.concurrency_and_timeout?.value?.job_timeout_minutes !== f.job_timeout_minutes) {
    bad('publish_runtime.concurrency_and_timeout.job_timeout_minutes', f.job_timeout_minutes);
  }
  if (need('schedule cron', f.cron) && pub.triggers?.value?.cron !== f.cron) {
    bad('publish_runtime.triggers.cron', f.cron);
  }
  if (need('secret declarations', f.secret_declarations)) {
    const genSecret = gen.auth_mechanism?.value?.secret_declaration;
    const gateSecret = gate.auth_mechanism?.value?.secret_declaration;
    if (typeof genSecret !== 'string' || !f.secret_declarations.includes(genSecret)) {
      bad('generation.auth_mechanism.secret_declaration', `one of the secret names actually declared in factory.yml`);
    }
    if (typeof gateSecret !== 'string' || !f.secret_declarations.includes(gateSecret)) {
      bad('semantic_gate.auth_mechanism.secret_declaration', `one of the secret names actually declared in factory.yml`);
    }
  }
  if (need('--sandbox', f.sandbox)) {
    if (typeof gate.invocation?.value !== 'string' || !gate.invocation.value.includes(`--sandbox ${f.sandbox}`)) {
      bad('semantic_gate.invocation', `a value referencing --sandbox ${f.sandbox}`);
    }
  }
  if (!f.gate_prompt_reference) {
    problems.push('cross-check: factory.yml does not reference scripts/gate-prompt.txt');
  } else if (gate.prompt_source?.evidence?.path !== 'scripts/gate-prompt.txt') {
    bad('semantic_gate.prompt_source.evidence.path', 'scripts/gate-prompt.txt');
  }
  return problems;
}

// ---------- working tree との照合 ----------

export function verifyMaterialSources(baseline, repoRoot) {
  const verified = [];
  const productionMismatched = [];
  const snapshotDrift = [];
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
    if (got.git_blob_sha1 === decl.git_blob_sha1 && got.sha256 === decl.sha256) {
      verified.push(rel);
    } else if (decl.classification === 'control_plane_snapshot') {
      // control-plane文書の通常更新はbaselineをSTALEにしない。情報として記録する。
      snapshotDrift.push({ path: rel, declared: { git_blob_sha1: decl.git_blob_sha1 }, observed: got });
    } else {
      productionMismatched.push({ path: rel, declared: { git_blob_sha1: decl.git_blob_sha1, sha256: decl.sha256 }, observed: got });
    }
  }
  return { verified, productionMismatched, snapshotDrift, missing, rejected, observed };
}

// 各OBSERVED fieldのrepository evidenceを再検証する。
// - evidence hash が baseline 自身の material_sources 宣言と矛盾 → baseline内部不整合 = FAIL
// - evidence hash は宣言と一致するが working tree が変化 → production は STALE / snapshot は情報記録
// - material source でない path の不一致・欠落 → 証拠整合の破壊 = FAIL
// - material source の欠落は verifyMaterialSources が VOID として扱うため、ここでは重複報告しない
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

export function observeHeadSha(env, repoRoot) {
  if (env.GITHUB_SHA && SHA1_RE.test(env.GITHUB_SHA)) {
    return observedRuntimeField(env.GITHUB_SHA, 'env:GITHUB_SHA', 'GitHub Actions checkout context');
  }
  try {
    const sha = execFileSync('git', ['-C', repoRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    if (SHA1_RE.test(sha)) {
      return observedRuntimeField(sha, 'git rev-parse HEAD (read-only)', 'local git metadata of the observed working tree');
    }
  } catch {
    // fall through to UNKNOWN
  }
  return unknownRuntimeField(
    'Neither GITHUB_SHA nor a readable git HEAD is available for the observed tree.',
    'Run inside a git checkout or a GitHub Actions workflow.'
  );
}

// ---------- 結果判定 ----------

export function computeResult({ holdReasons, failReasons, voidReasons, staleReasons }) {
  if (holdReasons.length) return { result: 'HOLD', reasons: holdReasons };
  if (failReasons.length) return { result: 'FAIL', reasons: failReasons };
  if (voidReasons.length) return { result: 'VOID', reasons: voidReasons };
  if (staleReasons.length) return { result: 'STALE', reasons: staleReasons };
  return {
    result: 'PASS',
    reasons: ['All operator-controllable fields and published provenance recorded; every remaining gap is an explicit UNKNOWN with reason and resolution. PASS covers the C0 canary only — not C1 benchmarks, model comparison, or Champion adoption.'],
  };
}

// ---------- 出力(リポジトリ外のみ) ----------

// 存在する最深の祖先まで symlink を実体解決し、未作成の末尾は字面のまま連結する。
// (lexical 比較だけだと、リポ内の "..foo" ディレクトリや symlink 経由でリポ内へ
//  書き込める抜け道ができる)
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

  // read-only 保証: 出力先がリポジトリ内なら何も書かずに拒否する。
  if (isInsideRepo(outDir, repoRoot)) {
    throw new Error(
      `refusing to write artifacts inside the repository: out=${outDir} repo=${repoRoot} — use a runner temp directory (e.g. $RUNNER_TEMP)`
    );
  }

  log(`C0 observer start: repo=${repoRoot}`);
  log(`baseline: ${baselinePath}`);
  log(`out: ${outDir} (outside repository: verified)`);

  // baseline 読み込み
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
      // V8のparseエラー文は入力冒頭を引用するため、Secretらしい「短い断片」でも漏れうる。
      // 引用部は一切採用せず、位置情報だけを残す。
      const pos = /at position (\d+)/.exec(String(e.message));
      failReasons.push(
        `baseline is not valid JSON${pos ? ` (error near position ${pos[1]})` : ''} — parse details withheld to avoid quoting file content`
      );
    }
  }

  let materials = { verified: [], productionMismatched: [], snapshotDrift: [], missing: [], rejected: [], observed: {} };
  let evidence = { materialMismatches: [], snapshotDrift: [], brokenEvidence: [] };
  let crossCheckPerformed = false;

  if (baseline) {
    if (baseline.schema !== SCHEMA_VERSION) {
      // 版数不一致は意味上の曖昧さ: 観測者が解釈してよいか人間判断が要る。
      holdReasons.push(
        `baseline declares schema ${JSON.stringify(baseline.schema)} but this observer implements ${SCHEMA_VERSION}; human decision required before comparison`
      );
    } else {
      const schemaProblems = validateBaseline(baseline);
      if (schemaProblems.length) {
        failReasons.push(...schemaProblems.map((s) => `baseline schema violation: ${s}`));
      } else {
        // manifest 強制(group / field / material の削除・誤分類は FAIL)
        const manifestProblems = enforceManifest(baseline);
        failReasons.push(...manifestProblems);

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
          else usablePaths.add(rel); // 'ok' と 'missing'(missing は VOID/FAIL を後段が分類)
        }

        // git 照会: tracked 強制と base commit / base tree 照合
        const git = gitTrackedFiles(repoRoot);
        if (!git.isRepo) {
          voidReasons.push('observed tree is not a git work tree — tracked-file and base-commit verification cannot be established');
        } else {
          for (const rel of [...usablePaths].sort()) {
            if (inspectRepoPath(repoRoot, rel).state === 'ok' && !git.tracked.has(rel)) {
              failReasons.push(`declared path rejected: ${rel} — untracked files are forbidden as provenance sources`);
            }
          }
          const baseSha = baseline.base.base_sha;
          if (!gitCommitExists(repoRoot, baseSha)) {
            failReasons.push(`base.base_sha ${baseSha} does not exist as a commit in this repository (fictitious base)`);
          } else {
            const baseTree = gitTreeBlobs(repoRoot, baseSha);
            for (const [rel, decl] of Object.entries(baseline.material_sources)) {
              if (validatePathShape(rel)) continue; // 既にFAIL済み
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

        // working tree 照合(production → STALE / snapshot → 情報記録 / 欠落 → VOID)
        materials = verifyMaterialSources(baseline, repoRoot);
        evidence = verifyEvidence(baseline, repoRoot);
        for (const rel of materials.missing) {
          voidReasons.push(`material source missing from working tree: ${rel} — observation cannot be established (VOID, not FAIL)`);
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

        // factory.yml が宣言どおり不変のときだけ、宣言値を実体と照合する
        // (material が変化しているなら STALE が正しい結果であり、値照合は行わない)
        const FACTORY = '.github/workflows/factory.yml';
        if (materials.verified.includes(FACTORY)) {
          const factoryText = fs.readFileSync(path.join(repoRoot, FACTORY), 'utf8');
          failReasons.push(...crossCheckAgainstFactory(baseline, factoryText));
          crossCheckPerformed = true;
        }

        log(
          `material sources — verified: ${materials.verified.length}, production changed: ${materials.productionMismatched.length}, snapshot drift: ${materials.snapshotDrift.length}, missing: ${materials.missing.length}`
        );
        log(`cross-check against factory.yml: ${crossCheckPerformed ? 'performed' : 'skipped (factory.yml not verified unchanged)'}`);
      }
    }
  }

  // runtime facts(観測者自身の実行環境)
  const runtime = collectRuntime(env, startedAtIso);
  runtime.head_sha = observeHeadSha(env, repoRoot);

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
      declared_base_sha: baseline?.base?.base_sha ?? null,
      policy:
        'Only production-material content changes make this baseline STALE. Control-plane snapshot drift (OS.md / CURRENT_STATE.md / ROADMAP.md) is recorded as information, and a default-branch head change alone never invalidates the observation.',
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
    cross_check_performed: crossCheckPerformed,
    capabilities: baseline?.capabilities ?? null,
    runtime,
  };

  // Secret 混入検査(生成した全成果物とログに対して)
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
    generated_at: new Date().toISOString(),
    scope: 'PASS means the C0 provenance canary only. It does not imply C1 benchmark results, model comparison, or Champion adoption.',
    artifacts: secretHits.length ? ['result.json', 'verification.log'] : ['provenance.json', 'result.json', 'verification.log'],
  };

  fs.mkdirSync(outDir, { recursive: true });
  // Secret検出時はprovenance.json自体を保留する(混入値をartifactへ書かない)。
  if (!secretHits.length) {
    fs.writeFileSync(path.join(outDir, 'provenance.json'), provenanceJson + '\n', 'utf8');
  } else {
    log('provenance.json withheld: secret-like content detected (values not written)');
  }

  // 最終バックストップ: result.json 自体にも Secret らしい断片が残っていないか検査してから書く。
  let resultJson = JSON.stringify(resultDoc, null, 2);
  if (scanForSecrets(resultJson).length) {
    resultDoc.reasons = ['reasons withheld: secret-like content detected in result reasons'];
    resultDoc.sanitized = true;
    resultJson = JSON.stringify(resultDoc, null, 2);
    log('result.json reasons withheld: secret-like content detected');
  }
  fs.writeFileSync(path.join(outDir, 'result.json'), resultJson + '\n', 'utf8');

  // verification.log は追記する(workflow 側がテスト出力を同じファイルへ先に書いている)。
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
