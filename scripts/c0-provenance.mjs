#!/usr/bin/env node
// c0-provenance.mjs — C0 Configuration Provenance observer (read-only canary).
//
// ROADMAP.md C0: 現行Production構成を「後から再検査・比較できる形」で記録する。
// このスクリプトは観測者であり、Factory本体・モデル・prompt・Secretsには一切触れない。
//
// 動作:
//   1. config/champion-baseline.json(baseline declaration)を読み、schema検証する。
//   2. baselineが宣言する material source を working tree から再ハッシュし、
//      宣言値(git blob SHA-1 / SHA-256)と照合する。
//   3. 各 capability field の OBSERVED evidence(repository path + hash)を再検証する。
//   4. 実行環境(OS / arch / kernel / Node / run ID / attempt / SHA / 時刻 / 観測者自身の
//      latency)を runtime facts として記録する。観測できないものは UNKNOWN(理由+解消方法)。
//   5. provenance.json / result.json / verification.log をリポジトリ外の出力先へ書く。
//      リポジトリ内部への出力は拒否する(read-only 保証)。
//
// 結果状態(fail-closed 優先順位: HOLD > FAIL > VOID > STALE > PASS):
//   PASS  — baseline整合・全fieldがOBSERVED(証拠付き)またはUNKNOWN(理由付き)
//   FAIL  — schema違反、証拠不整合、Secretらしい値の混入
//   VOID  — material source欠落など、観測自体が成立しない
//   STALE — material sourceの内容が baseline宣言から変化(main SHAの変化だけではSTALEにしない)
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
  ['anthropic-key-like', /sk-ant-[A-Za-z0-9_-]{8,}/],
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

// ---------- working tree との照合 ----------

export function verifyMaterialSources(baseline, repoRoot) {
  const verified = [];
  const mismatched = [];
  const missing = [];
  const observed = {};
  for (const [rel, decl] of Object.entries(baseline.material_sources || {})) {
    const abs = path.join(repoRoot, rel);
    if (!fs.existsSync(abs)) {
      missing.push(rel);
      observed[rel] = null;
      continue;
    }
    const buf = fs.readFileSync(abs);
    const got = { git_blob_sha1: computeGitBlobSha1(buf), sha256: computeSha256(buf) };
    observed[rel] = got;
    if (got.git_blob_sha1 === decl.git_blob_sha1 && got.sha256 === decl.sha256) {
      verified.push(rel);
    } else {
      mismatched.push({ path: rel, declared: { git_blob_sha1: decl.git_blob_sha1, sha256: decl.sha256 }, observed: got });
    }
  }
  return { verified, mismatched, missing, observed };
}

// 各OBSERVED fieldのrepository evidenceを再検証する。
// - evidence hash が baseline 自身の material_sources 宣言と矛盾 → baseline内部不整合 = FAIL
// - evidence hash は宣言と一致するが working tree が変化 → 構成変化 = STALE
// - material source でない path の不一致 → 証拠整合の破壊 = FAIL
// - material source の欠落は verifyMaterialSources が VOID として扱うため、ここでは重複報告しない
export function verifyEvidence(baseline, repoRoot) {
  const materials = baseline.material_sources || {};
  const materialMismatches = [];
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
      const abs = path.join(repoRoot, ev.path);
      if (!fs.existsSync(abs)) {
        if (!decl) brokenEvidence.push({ field: ref, path: ev.path, problem: 'evidence file missing from working tree' });
        continue;
      }
      const got = computeGitBlobSha1(fs.readFileSync(abs));
      if (got !== ev.git_blob_sha1) {
        const rec = { field: ref, path: ev.path, declared: ev.git_blob_sha1, observed: got };
        (decl ? materialMismatches : brokenEvidence).push(rec);
      }
    }
  }
  return { materialMismatches, brokenEvidence };
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
    const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim();
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

  let materials = { verified: [], mismatched: [], missing: [], observed: {} };
  let evidence = { materialMismatches: [], brokenEvidence: [] };

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
        materials = verifyMaterialSources(baseline, repoRoot);
        evidence = verifyEvidence(baseline, repoRoot);
        for (const rel of materials.missing) {
          voidReasons.push(`material source missing from working tree: ${rel} — observation cannot be established (VOID, not FAIL)`);
        }
        for (const mm of materials.mismatched) {
          staleReasons.push(
            `material source changed: ${mm.path} (declared blob ${mm.declared.git_blob_sha1}, observed ${mm.observed.git_blob_sha1}) — baseline assertions referencing it are materially STALE`
          );
        }
        for (const mm of evidence.materialMismatches) {
          staleReasons.push(`evidence for ${mm.field} points at changed material source ${mm.path}`);
        }
        for (const be of evidence.brokenEvidence) {
          failReasons.push(
            `evidence integrity broken for ${be.field}: ${be.path} ${be.problem ?? `declared ${be.declared}, observed ${be.observed}`}`
          );
        }
        log(`material sources verified: ${materials.verified.length}, changed: ${materials.mismatched.length}, missing: ${materials.missing.length}`);
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
      policy: 'A default-branch head change alone does not invalidate this observation; only material-source content changes do (STALE).',
    },
    material_sources: Object.fromEntries(
      Object.entries(baseline?.material_sources ?? {}).map(([rel, decl]) => [
        rel,
        {
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
