#!/usr/bin/env node
// c0-provenance.test.mjs — C0 observer の決定論テスト。
// 実行: node --test scripts/c0-provenance.test.mjs
// ネットワーク・Secrets・外部モデルには一切依存しない。fixture は OS の一時領域に作る。

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  SCHEMA_VERSION,
  computeGitBlobSha1,
  computeSha256,
  validateFieldEntry,
  validateBaseline,
  verifyMaterialSources,
  verifyEvidence,
  scanForSecrets,
  scanKeysForSecretLeaks,
  computeResult,
  isInsideRepo,
  run,
} from './c0-provenance.mjs';

// ---------- fixture ----------

const FIXTURE_FILES = {
  'factory.yml': 'name: fixture-factory\nsteps:\n  - run: echo observed\n',
  'CONSTRAINTS.md': '# fixture constraints\n- single file\n',
  'smoke.mjs': 'console.log("fixture smoke");\n',
  'notes.txt': 'non-material evidence target\n',
};

function hashesOf(content) {
  return { git_blob_sha1: computeGitBlobSha1(content), sha256: computeSha256(content) };
}

function observedField(value, evidencePath, files) {
  return {
    status: 'OBSERVED',
    value,
    evidence: {
      kind: 'repository',
      path: evidencePath,
      git_blob_sha1: computeGitBlobSha1(files[evidencePath]),
      derived_from: `fixture declaration in ${evidencePath}`,
    },
  };
}

function unknownField() {
  return {
    status: 'UNKNOWN',
    value: null,
    reason: 'not declared anywhere in the fixture workflow',
    resolution: 'declare it explicitly or capture it from run output',
  };
}

function buildBaseline(files) {
  return {
    schema: SCHEMA_VERSION,
    kind: 'champion-baseline',
    declared_at: '2026-08-05',
    base: {
      repository: 'fixture/repo',
      default_branch: 'main',
      base_sha: 'a'.repeat(40),
      base_sha_policy: 'informational only',
    },
    material_sources: {
      'factory.yml': { ...hashesOf(files['factory.yml']), role: 'fixture workflow' },
      'CONSTRAINTS.md': { ...hashesOf(files['CONSTRAINTS.md']), role: 'fixture constraints' },
      'smoke.mjs': { ...hashesOf(files['smoke.mjs']), role: 'fixture smoke' },
    },
    capabilities: {
      generation: {
        cli_version: observedField({ name: 'fixture-cli', version: '1.0.0' }, 'factory.yml', files),
        effective_model_id: unknownField(),
      },
      deterministic_verification: {
        static_smoke: observedField('node smoke.mjs', 'smoke.mjs', files),
      },
    },
  };
}

function makeFixture(t, { files = FIXTURE_FILES, baseline } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'c0-fixture-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const repo = path.join(root, 'repo');
  const out = path.join(root, 'out');
  fs.mkdirSync(path.join(repo, 'config'), { recursive: true });
  for (const [rel, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(repo, rel)), { recursive: true });
    fs.writeFileSync(path.join(repo, rel), content, 'utf8');
  }
  const doc = baseline ?? buildBaseline(files);
  fs.writeFileSync(path.join(repo, 'config', 'champion-baseline.json'), JSON.stringify(doc, null, 2), 'utf8');
  return { root, repo, out, baseline: doc };
}

function snapshotTree(dir) {
  const acc = new Map();
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const abs = path.join(d, e.name);
      if (e.isDirectory()) walk(abs);
      else acc.set(path.relative(dir, abs), computeSha256(fs.readFileSync(abs)));
    }
  };
  walk(dir);
  return acc;
}

function runFixture(fix, overrides = {}) {
  return run({ repoRoot: fix.repo, outDir: fix.out, env: {}, ...overrides });
}

// ---------- 1–2. 正常な OBSERVED / UNKNOWN ----------

test('valid OBSERVED field passes validation', () => {
  const entry = observedField('v', 'factory.yml', FIXTURE_FILES);
  assert.deepEqual(validateFieldEntry('f', entry), []);
});

test('valid UNKNOWN field passes validation', () => {
  assert.deepEqual(validateFieldEntry('f', unknownField()), []);
});

// ---------- 3. 必須 field 欠落 ----------

test('missing status is rejected', () => {
  const problems = validateFieldEntry('f', { value: 'x' });
  assert.ok(problems.some((p) => p.includes('status')));
});

test('baseline without material_sources is rejected', () => {
  const doc = buildBaseline(FIXTURE_FILES);
  delete doc.material_sources;
  assert.ok(validateBaseline(doc).some((p) => p.includes('material_sources')));
});

// ---------- 4. OBSERVED なのに証拠がない ----------

test('OBSERVED without evidence is rejected', () => {
  const problems = validateFieldEntry('f', { status: 'OBSERVED', value: 'x' });
  assert.ok(problems.some((p) => p.includes('evidence')));
});

test('OBSERVED without derived_from is rejected', () => {
  const entry = observedField('v', 'factory.yml', FIXTURE_FILES);
  delete entry.evidence.derived_from;
  assert.ok(validateFieldEntry('f', entry).some((p) => p.includes('derived_from')));
});

test('OBSERVED with empty value is rejected (no blanks, no implicit values)', () => {
  const entry = observedField('v', 'factory.yml', FIXTURE_FILES);
  entry.value = '';
  assert.ok(validateFieldEntry('f', entry).some((p) => p.includes('non-empty value')));
});

// ---------- 5. UNKNOWN なのに理由がない ----------

test('UNKNOWN without reason is rejected', () => {
  const entry = unknownField();
  delete entry.reason;
  assert.ok(validateFieldEntry('f', entry).some((p) => p.includes('reason')));
});

test('UNKNOWN without resolution is rejected', () => {
  const entry = unknownField();
  entry.resolution = ' ';
  assert.ok(validateFieldEntry('f', entry).some((p) => p.includes('resolution')));
});

test('UNKNOWN with a non-null value is rejected (guessing is forbidden)', () => {
  const entry = unknownField();
  entry.value = 'claude-something (guessed)';
  assert.ok(validateFieldEntry('f', entry).some((p) => p.includes('value: null')));
});

// ---------- 6. 不正な SHA ----------

test('malformed evidence SHA is rejected', () => {
  const entry = observedField('v', 'factory.yml', FIXTURE_FILES);
  entry.evidence.git_blob_sha1 = 'not-a-sha';
  assert.ok(validateFieldEntry('f', entry).some((p) => p.includes('git_blob_sha1')));
});

test('malformed material source sha256 is rejected', () => {
  const doc = buildBaseline(FIXTURE_FILES);
  doc.material_sources['smoke.mjs'].sha256 = 'zz'.repeat(32);
  assert.ok(validateBaseline(doc).some((p) => p.includes('sha256')));
});

// ---------- 7. 証拠 hash 不一致 ----------

test('material-source hash mismatch is detected as a material change (STALE path)', (t) => {
  // baseline は元の内容を宣言したまま、working tree のファイルだけが変わる(現実の STALE 経路)
  const fix = makeFixture(t);
  fs.writeFileSync(path.join(fix.repo, 'smoke.mjs'), 'console.log("changed after declaration");\n', 'utf8');
  const materials = verifyMaterialSources(fix.baseline, fix.repo);
  assert.equal(materials.mismatched.length, 1);
  assert.equal(materials.mismatched[0].path, 'smoke.mjs');
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'STALE');
  assert.ok(outcome.reasons.some((r) => r.includes('material source changed')));
});

test('evidence hash mismatch on a non-material path breaks evidence integrity (FAIL path)', (t) => {
  const doc = buildBaseline(FIXTURE_FILES);
  doc.capabilities.generation.extra = {
    status: 'OBSERVED',
    value: 'x',
    evidence: {
      kind: 'repository',
      path: 'notes.txt',
      git_blob_sha1: 'd'.repeat(40),
      derived_from: 'fixture',
    },
  };
  const fix = makeFixture(t, { baseline: doc });
  const ev = verifyEvidence(doc, fix.repo);
  assert.equal(ev.brokenEvidence.length, 1);
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('evidence integrity broken')));
});

// ---------- 8. Secret らしい値の混入 ----------

test('secret-shaped values are detected without echoing the value', () => {
  const fakes = [
    'sk-ant-' + 'a1b2c3d4e5'.repeat(2),
    'ghp_' + 'A1b2C3d4E5f6G7h8I9j0K1l2M3n4',
    'github_pat_' + 'A1b2C3d4E5f6G7h8I9j0_K1l2M3n4',
    '-----BEGIN RSA PRIVATE KEY-----',
  ];
  for (const fake of fakes) {
    const hits = scanForSecrets(`{"value":"${fake}"}`);
    assert.ok(hits.length >= 1, `expected a hit for ${fake.slice(0, 8)}…`);
    assert.ok(!JSON.stringify(hits).includes(fake), 'the matched secret must not be echoed back');
  }
});

test('run FAILs and withholds provenance.json when a secret-shaped value appears', (t) => {
  const doc = buildBaseline(FIXTURE_FILES);
  doc.capabilities.generation.cli_version.value = 'installed with sk-ant-' + 'x1y2z3w4v5'.repeat(2);
  const fix = makeFixture(t, { baseline: doc });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.equal(outcome.provenance, null);
  assert.ok(!fs.existsSync(path.join(fix.out, 'provenance.json')));
  assert.ok(fs.existsSync(path.join(fix.out, 'result.json')));
  const written = fs.readFileSync(path.join(fix.out, 'result.json'), 'utf8');
  assert.ok(!written.includes('sk-ant-'), 'result.json must not contain the secret-shaped value');
});

// ---------- 9. Secret の hash / prefix の混入 ----------

test('keys implying secret hashes or prefixes are rejected', () => {
  for (const key of ['token_sha256', 'secret_prefix', 'auth_hash', 'api_key_len', 'credential-fingerprint']) {
    const hits = scanKeysForSecretLeaks({ meta: { [key]: 'deadbeef' } });
    assert.ok(hits.length >= 1, `expected key-name hit for ${key}`);
  }
  // Secret 宣言「名」の記録は許可(値・派生物ではない)
  assert.equal(scanKeysForSecretLeaks({ auth: { secret_declaration: 'CLAUDE_CODE_OAUTH_TOKEN' } }).length, 0);
});

test('run FAILs when the baseline smuggles a secret-derivative key', (t) => {
  const doc = buildBaseline(FIXTURE_FILES);
  doc.capabilities.generation.cli_version.token_sha256 = 'ab'.repeat(32);
  const fix = makeFixture(t, { baseline: doc });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('secret-like content')));
});

// ---------- 10. repository 内部への artifact 出力 ----------

test('writing artifacts inside the repository is refused before any write', (t) => {
  const fix = makeFixture(t);
  const before = snapshotTree(fix.repo);
  assert.throws(
    () => run({ repoRoot: fix.repo, outDir: path.join(fix.repo, 'artifacts'), env: {} }),
    /refusing to write artifacts inside the repository/
  );
  assert.ok(!fs.existsSync(path.join(fix.repo, 'artifacts')));
  assert.deepEqual(snapshotTree(fix.repo), before);
  assert.ok(isInsideRepo(path.join(fix.repo, 'x'), fix.repo));
  assert.ok(!isInsideRepo(fix.out, fix.repo));
});

// ---------- 11. fixture / worktree の改変なし(read-only 保証) ----------

test('a full run never modifies the observed tree', (t) => {
  const fix = makeFixture(t);
  const before = snapshotTree(fix.repo);
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'PASS');
  assert.deepEqual(snapshotTree(fix.repo), before, 'observed tree must be byte-identical after observation');
  for (const name of ['provenance.json', 'result.json', 'verification.log']) {
    assert.ok(fs.existsSync(path.join(fix.out, name)), `${name} must be written to the out dir`);
  }
});

// ---------- 12. material source 不足 ----------

test('a missing material source yields VOID (observation cannot be established)', (t) => {
  const fix = makeFixture(t);
  fs.rmSync(path.join(fix.repo, 'CONSTRAINTS.md'));
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'VOID');
  assert.ok(outcome.reasons.some((r) => r.includes('CONSTRAINTS.md')));
});

// ---------- 13. 同じ入力から安定した schema ----------

function stripVolatile(doc) {
  const clone = structuredClone(doc);
  delete clone.generated_at;
  if (clone.runtime) {
    for (const k of ['started_at', 'finished_at', 'observer_latency_ms']) delete clone.runtime[k];
  }
  return clone;
}

test('the same input produces a stable provenance document', (t) => {
  const fix = makeFixture(t);
  const first = runFixture(fix, { outDir: path.join(fix.root, 'out1') });
  const second = runFixture(fix, { outDir: path.join(fix.root, 'out2') });
  assert.equal(first.result, 'PASS');
  assert.equal(second.result, 'PASS');
  assert.deepEqual(stripVolatile(first.provenance), stripVolatile(second.provenance));
  assert.equal(first.provenance.schema, SCHEMA_VERSION);
  assert.deepEqual(
    Object.keys(first.provenance.runtime).sort(),
    Object.keys(second.provenance.runtime).sort()
  );
});

// ---------- 結果状態の規則 ----------

test('result precedence is HOLD > FAIL > VOID > STALE > PASS', () => {
  const all = { holdReasons: ['h'], failReasons: ['f'], voidReasons: ['v'], staleReasons: ['s'] };
  assert.equal(computeResult(all).result, 'HOLD');
  assert.equal(computeResult({ ...all, holdReasons: [] }).result, 'FAIL');
  assert.equal(computeResult({ ...all, holdReasons: [], failReasons: [] }).result, 'VOID');
  assert.equal(computeResult({ ...all, holdReasons: [], failReasons: [], voidReasons: [] }).result, 'STALE');
  assert.equal(
    computeResult({ holdReasons: [], failReasons: [], voidReasons: [], staleReasons: [] }).result,
    'PASS'
  );
});

test('an unrecognized baseline schema version yields HOLD, not silent reinterpretation', (t) => {
  const doc = buildBaseline(FIXTURE_FILES);
  doc.schema = 'atf-configuration-provenance/v999';
  const fix = makeFixture(t, { baseline: doc });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'HOLD');
  assert.ok(outcome.reasons.some((r) => r.includes('human decision')));
});

test('an unreadable baseline yields FAIL, and artifacts are still written', (t) => {
  const fix = makeFixture(t);
  fs.writeFileSync(path.join(fix.repo, 'config', 'champion-baseline.json'), '{ not json', 'utf8');
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(fs.existsSync(path.join(fix.out, 'result.json')));
});

// ---------- ハッシュ関数の既知ベクトル(自己言及でない検証) ----------

test('hash functions match well-known external vectors', () => {
  // git hash-object の既知値
  assert.equal(computeGitBlobSha1(Buffer.alloc(0)), 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391');
  assert.equal(computeGitBlobSha1('hello world\n'), '3b18e512dba79e4c8300dd08aeb37f8e728b8dad');
  // FIPS 180-4 の既知値
  assert.equal(computeSha256(Buffer.alloc(0)), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(computeSha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

// ---------- read-only 保証の抜け道: リポ内 "..xxx" ディレクトリ ----------

test('a ".."-prefixed directory inside the repo is still refused as an out dir', (t) => {
  const fix = makeFixture(t);
  assert.ok(isInsideRepo(path.join(fix.repo, '..artifacts'), fix.repo));
  assert.throws(
    () => run({ repoRoot: fix.repo, outDir: path.join(fix.repo, '..artifacts'), env: {} }),
    /refusing to write artifacts inside the repository/
  );
  assert.ok(!fs.existsSync(path.join(fix.repo, '..artifacts')));
});

// ---------- baseline 内部不整合は STALE ではなく FAIL ----------

test('evidence hash contradicting the baseline own material declaration is FAIL, not STALE', (t) => {
  const doc = buildBaseline(FIXTURE_FILES);
  // ファイルは material 宣言と一致したまま、field evidence だけが矛盾している
  doc.capabilities.generation.cli_version.evidence.git_blob_sha1 = 'e'.repeat(40);
  const fix = makeFixture(t, { baseline: doc });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('internally inconsistent')));
});

// ---------- Secret 断片が result.json へ漏れない(検証メッセージ経路) ----------

test('a secret-shaped status value never reaches result.json or the log', (t) => {
  const doc = buildBaseline(FIXTURE_FILES);
  doc.capabilities.generation.cli_version.status = 'sk-ant-' + 'q1w2e3r4t5'.repeat(2);
  const fix = makeFixture(t, { baseline: doc });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  for (const name of ['result.json', 'verification.log']) {
    const written = fs.readFileSync(path.join(fix.out, name), 'utf8');
    assert.ok(!written.includes('sk-ant-'), `${name} must not contain the secret-shaped value`);
  }
  assert.ok(!fs.existsSync(path.join(fix.out, 'provenance.json')), 'provenance.json must be withheld');
});

test('a secret-shaped prefix in a malformed baseline never reaches result.json', (t) => {
  const fix = makeFixture(t);
  fs.writeFileSync(
    path.join(fix.repo, 'config', 'champion-baseline.json'),
    'sk-ant-' + 'a1s2d3f4g5'.repeat(2) + '{',
    'utf8'
  );
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  const written = fs.readFileSync(path.join(fix.out, 'result.json'), 'utf8');
  assert.ok(!written.includes('sk-ant-'), 'JSON parse error quoting must not leak the secret-shaped prefix');
});

// ---------- main SHA が進んだだけでは STALE にしない ----------

test('a head SHA differing from base_sha alone stays PASS (not STALE)', (t) => {
  const fix = makeFixture(t);
  const head = 'b'.repeat(40); // baseline の base_sha は 'a'.repeat(40)
  const outcome = runFixture(fix, { env: { GITHUB_SHA: head } });
  assert.equal(outcome.result, 'PASS');
  assert.equal(outcome.provenance.runtime.head_sha.status, 'OBSERVED');
  assert.equal(outcome.provenance.runtime.head_sha.value, head);
});

// ---------- runtime facts の実値 ----------

test('runtime facts record the actual observer environment', (t) => {
  const fix = makeFixture(t);
  const env = { GITHUB_RUN_ID: '12345', GITHUB_RUN_ATTEMPT: '2', RUNNER_OS: 'Linux', GITHUB_SHA: 'c'.repeat(40) };
  const rt = runFixture(fix, { env }).provenance.runtime;
  assert.equal(rt.os_platform.value, process.platform);
  assert.equal(rt.architecture.value, os.arch());
  assert.equal(rt.kernel.value, os.release());
  assert.equal(rt.node_version.value, process.version);
  assert.equal(rt.workflow_run_id.value, '12345');
  assert.equal(rt.workflow_run_attempt.value, '2');
  assert.equal(rt.runner_os_label.value, 'Linux');
  assert.ok(!Number.isNaN(Date.parse(rt.started_at.value)));
  assert.ok(!Number.isNaN(Date.parse(rt.finished_at.value)));
  assert.equal(rt.observer_latency_ms.status, 'OBSERVED');
  assert.equal(typeof rt.observer_latency_ms.value, 'number');
  assert.ok(
    rt.observer_latency_ms.evidence.derived_from.includes('NOT production factory latency'),
    'observer latency must be explicitly separated from production latency'
  );

  const rtLocal = runFixture(fix, { outDir: path.join(fix.root, 'out-local'), env: {} }).provenance.runtime;
  assert.equal(rtLocal.workflow_run_id.status, 'UNKNOWN');
  assert.equal(rtLocal.workflow_run_attempt.status, 'UNKNOWN');
});

// ---------- CLI entrypoint(exit code 契約と artifact 出力) ----------

const CLI = path.join(path.dirname(fileURLToPath(import.meta.url)), 'c0-provenance.mjs');

function runCli(args) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', env: { ...process.env, RUNNER_TEMP: '' } });
}

test('CLI exits 0 on PASS and writes all three artifacts', (t) => {
  const fix = makeFixture(t);
  const res = runCli(['--repo', fix.repo, '--out', fix.out]);
  assert.equal(res.status, 0, res.stderr);
  for (const name of ['provenance.json', 'result.json', 'verification.log']) {
    assert.ok(fs.existsSync(path.join(fix.out, name)), `${name} missing`);
  }
});

test('CLI exits 1 on a non-PASS observation (fail-closed)', (t) => {
  const fix = makeFixture(t);
  fs.rmSync(path.join(fix.repo, 'smoke.mjs'));
  const res = runCli(['--repo', fix.repo, '--out', fix.out]);
  assert.equal(res.status, 1);
  const result = JSON.parse(fs.readFileSync(path.join(fix.out, 'result.json'), 'utf8'));
  assert.equal(result.result, 'VOID');
});

test('CLI exits 2 and writes nothing when the out dir is inside the repo', (t) => {
  const fix = makeFixture(t);
  const before = snapshotTree(fix.repo);
  const res = runCli(['--repo', fix.repo, '--out', path.join(fix.repo, 'artifacts')]);
  assert.equal(res.status, 2);
  assert.ok(res.stderr.includes('refusing to write artifacts inside the repository'));
  assert.deepEqual(snapshotTree(fix.repo), before);
});

test('CLI exits 2 on unknown or dangling arguments', (t) => {
  const fix = makeFixture(t);
  assert.equal(runCli(['--repo', fix.repo, '--out', fix.out, '--bogus']).status, 2);
  assert.equal(runCli(['--repo', fix.repo, '--out']).status, 2);
});

// ---------- 実リポジトリの baseline 自体も schema に適合していること ----------

test('the real config/champion-baseline.json conforms to the schema', () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const real = JSON.parse(fs.readFileSync(path.join(repoRoot, 'config', 'champion-baseline.json'), 'utf8'));
  assert.equal(real.schema, SCHEMA_VERSION);
  assert.deepEqual(validateBaseline(real), []);
  assert.equal(scanKeysForSecretLeaks(real).length, 0);
  assert.equal(scanForSecrets(JSON.stringify(real)).length, 0);
});

// ---------- 実 baseline の no-model-guessing 規則 ----------
// 「Claude Codeだから特定モデル」という推測の混入を、fieldの存在と UNKNOWN 宣言の両方で固定する。

test('the real baseline never guesses provider-side configuration', () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const real = JSON.parse(fs.readFileSync(path.join(repoRoot, 'config', 'champion-baseline.json'), 'utf8'));
  const REQUIRED_UNKNOWN = [
    'effective_model_id',
    'provider_model_revision',
    'reasoning_configuration',
    'provider_routing',
    'hidden_system_prompt',
    'prompt_cache_state',
    'token_usage',
    'marginal_cost',
  ];
  for (const cap of ['generation', 'semantic_gate']) {
    for (const field of REQUIRED_UNKNOWN) {
      const entry = real.capabilities[cap]?.[field];
      assert.ok(entry, `capabilities.${cap}.${field} must exist (omission is an implicit blank)`);
      assert.equal(entry.status, 'UNKNOWN', `capabilities.${cap}.${field} must be UNKNOWN, not guessed`);
      assert.equal(entry.value, null);
    }
    // 費用を証拠なく0円と書いていないこと(UNKNOWN + value null で担保済みだが、理由の存在も確認)
    assert.ok(real.capabilities[cap].marginal_cost.reason.length > 0);
  }
});
