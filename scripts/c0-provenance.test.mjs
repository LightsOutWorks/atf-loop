#!/usr/bin/env node
// c0-provenance.test.mjs — C0 observer の決定論テスト。
// 実行: node --test scripts/c0-provenance.test.mjs
// ネットワーク・Secrets・外部モデルには一切依存しない。fixture は OS の一時領域に
// 実際の git repository として作る(tracked強制・base commit照合を本物のgitで検証する)。

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  SCHEMA_VERSION,
  REQUIRED_MATERIALS,
  REQUIRED_FIELDS,
  computeGitBlobSha1,
  computeSha256,
  validateFieldEntry,
  validateBaseline,
  enforceManifest,
  validatePathShape,
  inspectRepoPath,
  extractFactoryFacts,
  crossCheckAgainstFactory,
  verifyMaterialSources,
  verifyEvidence,
  scanForSecrets,
  scanKeysForSecretLeaks,
  computeResult,
  isInsideRepo,
  run,
} from './c0-provenance.mjs';

// ---------- fixture ----------
// fixture の factory.yml は、実物と同じ機械抽出点(CLI固定・allowedTools・max-turns・
// MAX_FIX・node-version・playwright・runs-on・permissions・concurrency・timeout・cron・
// secrets宣言・gate prompt参照・sandbox)を最小構成で含む。

const FIXTURE_FACTORY = `name: fixture-factory
on:
  workflow_dispatch:
  schedule:
    - cron: '0 1 * * 6'
permissions:
  contents: write
concurrency:
  group: factory
jobs:
  factory:
    runs-on: ubuntu-latest
    timeout-minutes: 80
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm install -g @anthropic-ai/claude-code@2.1.220 @openai/codex@0.146.0
      - run: npm install --prefix "$PW_DIR" playwright@1.62.1
      - env:
          HAS_CLAUDE_TOKEN: \${{ secrets.CLAUDE_CODE_OAUTH_TOKEN != '' }}
          CODEX_AUTH_JSON: \${{ secrets.CODEX_AUTH_JSON }}
        run: |
          claude -p "$PROMPT" --allowedTools "Read,Write,Bash(node:*)" --max-turns 120
          MAX_FIX=3
          claude -p "$FIX" --allowedTools "Read,Write,Bash(node:*)" --max-turns 60
          GATE_PROMPT=$(cat scripts/gate-prompt.txt)
          codex exec --cd "$GATE_DIR" --sandbox read-only "$GATE_INPUT"
`;

const FIXTURE_FILES = {
  '.github/workflows/factory.yml': FIXTURE_FACTORY,
  'CONSTRAINTS.md': '# fixture constraints\n- single file\n',
  'smoke.mjs': 'console.log("fixture smoke");\n',
  'scripts/interaction-smoke.mjs': 'console.log("fixture interaction smoke");\n',
  'scripts/gate-prompt.txt': 'fixture gate prompt\n',
  'scripts/build-catalog.mjs': 'console.log("fixture catalog");\n',
  'OS.md': '# fixture OS\n',
  'CURRENT_STATE.md': '# fixture current state\n',
  'ROADMAP.md': '# fixture roadmap\n',
  'notes.txt': 'non-material evidence target\n',
};

const FY = '.github/workflows/factory.yml';

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

function buildBaseline(files, baseSha) {
  const O = (value, p) => observedField(value, p, files);
  const U = unknownField;
  const M = (p, role) => ({
    classification: REQUIRED_MATERIALS[p],
    ...hashesOf(files[p]),
    role,
  });
  return {
    schema: SCHEMA_VERSION,
    kind: 'champion-baseline',
    declared_at: '2026-08-05',
    base: {
      repository: 'fixture/repo',
      default_branch: 'main',
      base_sha: baseSha,
      base_sha_policy: 'informational; STALE only via production material changes',
    },
    material_sources: Object.fromEntries(
      Object.keys(REQUIRED_MATERIALS).map((p) => [p, M(p, `fixture material ${p}`)])
    ),
    capabilities: {
      generation: {
        provider_integration: O('Anthropic — @anthropic-ai/claude-code npm package', FY),
        cli_version: O({ name: '@anthropic-ai/claude-code', version: '2.1.220' }, FY),
        effective_model_id: U(),
        provider_model_revision: U(),
        reasoning_configuration: U(),
        provider_routing: U(),
        hidden_system_prompt: U(),
        prompt_cache_state: U(),
        prompt_source: O('fixture inline prompt', FY),
        context_sources: O('fixture context assembly', FY),
        output_schema: O('fixture output contract', FY),
        allowed_tools: O('Read,Write,Bash(node:*)', FY),
        turn_budget: O({ generate_max_turns: 120, fix_max_turns: 60, max_fix_rounds: 3 }, FY),
        permissions_and_sandbox: O('fixture workspace policing', FY),
        auth_mechanism: O({ mechanism: 'OAuth token via secret declaration', secret_declaration: 'CLAUDE_CODE_OAUTH_TOKEN' }, FY),
        token_usage: U(),
        marginal_cost: U(),
        latency: U(),
      },
      semantic_gate: {
        provider_integration: O('OpenAI — @openai/codex npm package', FY),
        cli_version: O({ name: '@openai/codex', version: '0.146.0' }, FY),
        effective_model_id: U(),
        provider_model_revision: U(),
        reasoning_configuration: U(),
        provider_routing: U(),
        hidden_system_prompt: U(),
        prompt_cache_state: U(),
        prompt_source: O('fixture gate prompt', 'scripts/gate-prompt.txt'),
        invocation: O('codex exec --sandbox read-only, executed exactly once', FY),
        verdict_contract: O('first line must equal PUBLISH', FY),
        input_scope: O('candidate index.html only', FY),
        auth_mechanism: O({ mechanism: 'CLI credential restored from secret declaration', secret_declaration: 'CODEX_AUTH_JSON' }, FY),
        token_usage: U(),
        marginal_cost: U(),
        latency: U(),
      },
      deterministic_verification: {
        node_version_declared: O({ declared: '22', note: 'major version only' }, FY),
        runner_os: O({ label: 'ubuntu-latest', note: 'runner label, not a fixed OS version' }, FY),
        static_smoke: O('node smoke.mjs', 'smoke.mjs'),
        interaction_smoke: O('node scripts/interaction-smoke.mjs', 'scripts/interaction-smoke.mjs'),
        browser_engine: O({ package: 'playwright', version: '1.62.1', browser: 'chromium' }, FY),
        catalog_builder: O('node scripts/build-catalog.mjs', 'scripts/build-catalog.mjs'),
        constraints_contract: O('fixture constraints contract', 'CONSTRAINTS.md'),
        integrity_check: O('fixture integrity check', FY),
      },
      publish_runtime: {
        triggers: O({ events: ['workflow_dispatch', 'schedule'], cron: '0 1 * * 6', note: 'fixture' }, FY),
        workflow_permissions: O({ contents: 'write', note: 'fixture' }, FY),
        concurrency_and_timeout: O({ concurrency_group: 'factory', cancel_in_progress: false, job_timeout_minutes: 80 }, FY),
        checkout_configuration: O('fixture checkout', FY),
        publish_mechanism: O('fixture publish to main', FY),
        dry_run_canary: O('fixture dry run skips push', FY),
        artifact_persistence: O('fixture artifact upload always()', FY),
        pages_reachability_verification: U(),
      },
    },
  };
}

function git(repo, ...args) {
  return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' });
}

// makeFixture: 実gitリポジトリとしてfixtureを作る。
//   preCommit(repo)  — commit前に実行(symlink等、trackedにしたい追加物)
//   postCommit(repo) — commit後に実行(untracked file等)
//   mutateBaseline(doc) — baseline書き出し前の改変
//   gitInit: false   — git repoにしない(VOID経路の検証用)
function makeFixture(t, { files = FIXTURE_FILES, preCommit, postCommit, mutateBaseline, gitInit = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'c0-fixture-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const repo = path.join(root, 'repo');
  const out = path.join(root, 'out');
  fs.mkdirSync(path.join(repo, 'config'), { recursive: true });
  for (const [rel, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(repo, rel)), { recursive: true });
    fs.writeFileSync(path.join(repo, rel), content, 'utf8');
  }
  preCommit?.(repo);
  let baseSha = 'a'.repeat(40);
  if (gitInit) {
    git(repo, 'init', '-q');
    git(repo, 'add', '-A');
    git(repo, '-c', 'user.name=c0-test', '-c', 'user.email=c0@test.invalid', 'commit', '-qm', 'fixture');
    baseSha = git(repo, 'rev-parse', 'HEAD').trim();
  }
  postCommit?.(repo);
  const doc = buildBaseline(files, baseSha);
  mutateBaseline?.(doc);
  fs.writeFileSync(path.join(repo, 'config', 'champion-baseline.json'), JSON.stringify(doc, null, 2), 'utf8');
  return { root, repo, out, baseline: doc, baseSha };
}

function snapshotTree(dir) {
  const acc = new Map();
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const abs = path.join(d, e.name);
      if (e.isSymbolicLink()) acc.set(path.relative(dir, abs), 'symlink:' + fs.readlinkSync(abs));
      else if (e.isDirectory()) walk(abs);
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
  const entry = observedField('v', FY, FIXTURE_FILES);
  assert.deepEqual(validateFieldEntry('f', entry), []);
});

test('valid UNKNOWN field passes validation', () => {
  assert.deepEqual(validateFieldEntry('f', unknownField()), []);
});

test('a well-formed fixture baseline passes schema validation and manifest enforcement', () => {
  const doc = buildBaseline(FIXTURE_FILES, 'a'.repeat(40));
  assert.deepEqual(validateBaseline(doc), []);
  assert.deepEqual(enforceManifest(doc), []);
});

// ---------- 3. 必須 field 欠落(schema形状) ----------

test('missing status is rejected', () => {
  const problems = validateFieldEntry('f', { value: 'x' });
  assert.ok(problems.some((p) => p.includes('status')));
});

test('baseline without material_sources is rejected', () => {
  const doc = buildBaseline(FIXTURE_FILES, 'a'.repeat(40));
  delete doc.material_sources;
  assert.ok(validateBaseline(doc).some((p) => p.includes('material_sources')));
});

test('a material source without classification is rejected', () => {
  const doc = buildBaseline(FIXTURE_FILES, 'a'.repeat(40));
  delete doc.material_sources['smoke.mjs'].classification;
  assert.ok(validateBaseline(doc).some((p) => p.includes('classification')));
});

// ---------- 4. OBSERVED なのに証拠がない ----------

test('OBSERVED without evidence is rejected', () => {
  const problems = validateFieldEntry('f', { status: 'OBSERVED', value: 'x' });
  assert.ok(problems.some((p) => p.includes('evidence')));
});

test('OBSERVED without derived_from is rejected', () => {
  const entry = observedField('v', FY, FIXTURE_FILES);
  delete entry.evidence.derived_from;
  assert.ok(validateFieldEntry('f', entry).some((p) => p.includes('derived_from')));
});

test('OBSERVED with empty value is rejected (no blanks, no implicit values)', () => {
  const entry = observedField('v', FY, FIXTURE_FILES);
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
  const entry = observedField('v', FY, FIXTURE_FILES);
  entry.evidence.git_blob_sha1 = 'not-a-sha';
  assert.ok(validateFieldEntry('f', entry).some((p) => p.includes('git_blob_sha1')));
});

test('malformed material source sha256 is rejected', () => {
  const doc = buildBaseline(FIXTURE_FILES, 'a'.repeat(40));
  doc.material_sources['smoke.mjs'].sha256 = 'zz'.repeat(32);
  assert.ok(validateBaseline(doc).some((p) => p.includes('sha256')));
});

// ---------- manifest 強制: group / field / material の削除は FAIL ----------

test('deleting a required capability group FAILs', (t) => {
  const fix = makeFixture(t, { mutateBaseline: (doc) => { delete doc.capabilities.semantic_gate; } });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('required capability group missing: semantic_gate')));
});

test('deleting a required field FAILs', (t) => {
  const fix = makeFixture(t, { mutateBaseline: (doc) => { delete doc.capabilities.generation.effective_model_id; } });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('required field missing: generation.effective_model_id')));
});

test('deleting a required material source FAILs', (t) => {
  const fix = makeFixture(t, { mutateBaseline: (doc) => { delete doc.material_sources['smoke.mjs']; } });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('required material source missing from baseline: smoke.mjs')));
});

test('misclassifying a snapshot document as production material FAILs', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => { doc.material_sources['CURRENT_STATE.md'].classification = 'production_material'; },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('CURRENT_STATE.md must be classified as control_plane_snapshot')));
});

// ---------- factory.yml 実体との照合: 誤値は FAIL ----------

test('swapping generation provider_integration to OpenAI FAILs against factory.yml', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => {
      doc.capabilities.generation.provider_integration.value = 'OpenAI — @openai/codex npm package';
    },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('cross-check') && r.includes('generation.provider_integration')));
});

test('lying about the pinned CLI version FAILs against factory.yml', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => { doc.capabilities.generation.cli_version.value.version = '9.9.9'; },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('cross-check') && r.includes('cli_version.version')));
});

test('extractFactoryFacts pulls the machine-readable facts out of the fixture workflow', () => {
  const f = extractFactoryFacts(FIXTURE_FACTORY);
  assert.equal(f.generation_cli_version, '2.1.220');
  assert.equal(f.gate_cli_version, '0.146.0');
  assert.deepEqual(f.allowed_tools_occurrences, ['Read,Write,Bash(node:*)', 'Read,Write,Bash(node:*)']);
  assert.deepEqual(f.max_turns_occurrences, [120, 60]);
  assert.equal(f.max_fix_rounds, 3);
  assert.equal(f.node_version, '22');
  assert.equal(f.playwright_version, '1.62.1');
  assert.equal(f.runner_label, 'ubuntu-latest');
  assert.equal(f.permissions_contents, 'write');
  assert.equal(f.concurrency_group, 'factory');
  assert.equal(f.job_timeout_minutes, 80);
  assert.equal(f.cron, '0 1 * * 6');
  assert.deepEqual([...f.secret_declarations].sort(), ['CLAUDE_CODE_OAUTH_TOKEN', 'CODEX_AUTH_JSON']);
  assert.equal(f.sandbox, 'read-only');
  assert.equal(f.gate_prompt_reference, true);
});

// ---------- 7. 証拠 hash 不一致 ----------

test('production material change in the working tree is STALE, and cross-check is skipped for changed factory.yml', (t) => {
  const fix = makeFixture(t);
  fs.writeFileSync(path.join(fix.repo, 'smoke.mjs'), 'console.log("changed after declaration");\n', 'utf8');
  const materials = verifyMaterialSources(fix.baseline, fix.repo);
  assert.equal(materials.productionMismatched.length, 1);
  assert.equal(materials.productionMismatched[0].path, 'smoke.mjs');
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'STALE');
  assert.ok(outcome.reasons.some((r) => r.includes('production material changed')));
});

test('a changed factory.yml yields STALE, not a cross-check FAIL', (t) => {
  const fix = makeFixture(t);
  fs.appendFileSync(path.join(fix.repo, FY), '# drift\n', 'utf8');
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'STALE');
  assert.equal(outcome.provenance.cross_check_performed, false);
});

test('evidence hash mismatch on a non-material path breaks evidence integrity (FAIL path)', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => {
      doc.capabilities.generation.extra = {
        status: 'OBSERVED',
        value: 'x',
        evidence: { kind: 'repository', path: 'notes.txt', git_blob_sha1: 'd'.repeat(40), derived_from: 'fixture' },
      };
    },
  });
  const ev = verifyEvidence(fix.baseline, fix.repo);
  assert.equal(ev.brokenEvidence.length, 1);
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('evidence integrity broken')));
});

test('evidence hash contradicting the baseline own material declaration is FAIL, not STALE', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => {
      doc.capabilities.deterministic_verification.static_smoke.evidence.git_blob_sha1 = 'e'.repeat(40);
    },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('internally inconsistent')));
});

// ---------- production / snapshot の分離 ----------

test('control-plane snapshot drift is recorded but does NOT make the baseline STALE', (t) => {
  const fix = makeFixture(t);
  fs.appendFileSync(path.join(fix.repo, 'CURRENT_STATE.md'), '\nnormal update\n', 'utf8');
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'PASS');
  assert.equal(outcome.provenance.material_sources['CURRENT_STATE.md'].match, false);
  assert.ok(outcome.provenance.snapshot_drift.some((d) => d.path === 'CURRENT_STATE.md'));
  assert.ok(!outcome.reasons.some((r) => r.includes('STALE')));
});

// ---------- path 検査: 遡行・絶対path・symlink・untracked ----------

test('../../etc/passwd as a material path FAILs and is never read or hashed', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => {
      doc.material_sources['../../etc/passwd'] = {
        classification: 'production_material',
        git_blob_sha1: 'a'.repeat(40),
        sha256: 'b'.repeat(64),
        role: 'escape attempt',
      };
    },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('../../etc/passwd') && r.includes('parent traversal')));
  // 内容確認oracle化の防止: repo外ファイルはハッシュすら記録されない
  assert.equal(outcome.provenance.material_sources['../../etc/passwd'].observed, null);
});

test('an absolute evidence path FAILs', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => {
      doc.capabilities.generation.prompt_source.evidence.path = '/etc/passwd';
    },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('absolute paths are forbidden')));
});

test('a symlinked material path FAILs', (t) => {
  const fix = makeFixture(t, {
    preCommit: (repo) => fs.symlinkSync('CONSTRAINTS.md', path.join(repo, 'link.md')),
    mutateBaseline: (doc) => {
      doc.material_sources['link.md'] = {
        classification: 'production_material',
        git_blob_sha1: 'a'.repeat(40),
        sha256: 'b'.repeat(64),
        role: 'symlink attempt',
      };
    },
  });
  assert.equal(inspectRepoPath(fix.repo, 'link.md').state, 'symlink');
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('link.md') && r.includes('symlink')));
});

test('an untracked file as a provenance source FAILs', (t) => {
  const extra = 'untracked content\n';
  const fix = makeFixture(t, {
    postCommit: (repo) => fs.writeFileSync(path.join(repo, 'extra.txt'), extra, 'utf8'),
    mutateBaseline: (doc) => {
      doc.material_sources['extra.txt'] = {
        classification: 'production_material',
        ...hashesOf(extra),
        role: 'untracked attempt',
      };
    },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('extra.txt') && r.includes('untracked')));
});

test('path shape validation rejects traversal, absolute and irregular shapes', () => {
  assert.ok(validatePathShape('../../etc/passwd'));
  assert.ok(validatePathShape('/etc/passwd'));
  assert.ok(validatePathShape('a/../b'));
  assert.ok(validatePathShape('a//b'));
  assert.ok(validatePathShape('./a'));
  assert.ok(validatePathShape('a\\b'));
  assert.equal(validatePathShape('scripts/gate-prompt.txt'), null);
});

// ---------- base commit の実在と anchor 照合 ----------

test('a fictitious base_sha FAILs', (t) => {
  const fix = makeFixture(t, { mutateBaseline: (doc) => { doc.base.base_sha = 'a'.repeat(40); } });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('does not exist as a commit')));
});

test('a declared material hash that is not anchored to the base commit FAILs', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => {
      doc.material_sources['smoke.mjs'].git_blob_sha1 = 'e'.repeat(40);
      doc.material_sources['smoke.mjs'].sha256 = 'f'.repeat(64);
      doc.capabilities.deterministic_verification.static_smoke.evidence.git_blob_sha1 = 'e'.repeat(40);
    },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('not anchored to its own base')));
});

test('a non-git observed tree yields VOID (tracking and base cannot be verified)', (t) => {
  const fix = makeFixture(t, { gitInit: false });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'VOID');
  assert.ok(outcome.reasons.some((r) => r.includes('not a git work tree')));
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
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => {
      doc.capabilities.generation.prompt_source.value = 'installed with sk-ant-' + 'x1y2z3w4v5'.repeat(2);
    },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.equal(outcome.provenance, null);
  assert.ok(!fs.existsSync(path.join(fix.out, 'provenance.json')));
  assert.ok(fs.existsSync(path.join(fix.out, 'result.json')));
  const written = fs.readFileSync(path.join(fix.out, 'result.json'), 'utf8');
  assert.ok(!written.includes('sk-ant-'), 'result.json must not contain the secret-shaped value');
});

test('a secret-shaped status value never reaches result.json or the log', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => {
      doc.capabilities.generation.cli_version.status = 'sk-ant-' + 'q1w2e3r4t5'.repeat(2);
    },
  });
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
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => { doc.capabilities.generation.cli_version.token_sha256 = 'ab'.repeat(32); },
  });
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

test('a ".."-prefixed directory inside the repo is still refused as an out dir', (t) => {
  const fix = makeFixture(t);
  assert.ok(isInsideRepo(path.join(fix.repo, '..artifacts'), fix.repo));
  assert.throws(
    () => run({ repoRoot: fix.repo, outDir: path.join(fix.repo, '..artifacts'), env: {} }),
    /refusing to write artifacts inside the repository/
  );
  assert.ok(!fs.existsSync(path.join(fix.repo, '..artifacts')));
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
  const fix = makeFixture(t, { mutateBaseline: (doc) => { doc.schema = 'atf-configuration-provenance/v999'; } });
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

// ---------- main SHA が進んだだけでは STALE にしない ----------

test('a head SHA differing from base_sha alone stays PASS (not STALE)', (t) => {
  const fix = makeFixture(t);
  const head = 'b'.repeat(40); // baseline の base_sha は fixture HEAD であり、これとは異なる
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

// ---------- ハッシュ関数の既知ベクトル(自己言及でない検証) ----------

test('hash functions match well-known external vectors', () => {
  // git hash-object の既知値
  assert.equal(computeGitBlobSha1(Buffer.alloc(0)), 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391');
  assert.equal(computeGitBlobSha1('hello world\n'), '3b18e512dba79e4c8300dd08aeb37f8e728b8dad');
  // FIPS 180-4 の既知値
  assert.equal(computeSha256(Buffer.alloc(0)), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(computeSha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
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

// ---------- workflow が material-only 変更でも起動すること ----------

test('the C0 workflow triggers on production-material-only changes', () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const wf = fs.readFileSync(path.join(repoRoot, '.github', 'workflows', 'c0-provenance.yml'), 'utf8');
  const productionMaterials = Object.entries(REQUIRED_MATERIALS)
    .filter(([, cls]) => cls === 'production_material')
    .map(([p]) => p);
  for (const p of productionMaterials) {
    assert.ok(wf.includes(`- '${p}'`), `c0-provenance.yml pull_request paths must include ${p}`);
  }
});

// ---------- 実リポジトリの baseline: schema・manifest・factory.yml 実体との三重照合 ----------

test('the real config/champion-baseline.json conforms to schema, manifest, and the real factory.yml', () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const real = JSON.parse(fs.readFileSync(path.join(repoRoot, 'config', 'champion-baseline.json'), 'utf8'));
  assert.equal(real.schema, SCHEMA_VERSION);
  assert.deepEqual(validateBaseline(real), []);
  assert.deepEqual(enforceManifest(real), []);
  assert.equal(scanKeysForSecretLeaks(real).length, 0);
  assert.equal(scanForSecrets(JSON.stringify(real)).length, 0);
  const factoryText = fs.readFileSync(path.join(repoRoot, '.github', 'workflows', 'factory.yml'), 'utf8');
  assert.deepEqual(crossCheckAgainstFactory(real, factoryText), []);
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
  // manifest 側も同じ規則を要求していること(REQUIRED_FIELDS からの削除も検出される)
  for (const cap of ['generation', 'semantic_gate']) {
    for (const field of REQUIRED_UNKNOWN) {
      assert.ok(REQUIRED_FIELDS[cap].includes(field), `${cap}.${field} must be part of the fixed manifest`);
    }
  }
});
