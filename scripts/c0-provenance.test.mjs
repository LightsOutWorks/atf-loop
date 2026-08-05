#!/usr/bin/env node
// c0-provenance.test.mjs — C0 observer の決定論テスト。
// 実行: node --test scripts/c0-provenance.test.mjs
// ネットワーク・Secrets・外部モデルには一切依存しない。fixture は OS の一時領域に
// 実際の git repository として作る(tracked強制・repository同一性・base祖先性を本物のgitで検証)。

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
  OBSERVED_VERIFIERS,
  computeGitBlobSha1,
  computeSha256,
  validateFieldEntry,
  validateBaseline,
  enforceManifest,
  validatePathShape,
  inspectRepoPath,
  extractFactoryFacts,
  extractScopedSecrets,
  verifyObservedFields,
  verifyMaterialSources,
  verifyEvidence,
  scanForSecrets,
  scanKeysForSecretLeaks,
  computeResult,
  isInsideRepo,
  run,
} from './c0-provenance.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ---------- fixture ----------
// fixture の factory.yml は、実物と同じ機械抽出点をすべて最小構成で含む。
// step は実物と同じ `      - name:` 形で区切る(Secret scope 抽出が step 単位のため)。

const FIXTURE_FACTORY = `name: fixture-factory
on:
  workflow_dispatch:
    inputs:
      dry_run:
        type: boolean
  schedule:
    - cron: '0 1 * * 6'
permissions:
  contents: write
concurrency:
  group: factory
  cancel-in-progress: false
jobs:
  factory:
    runs-on: ubuntu-latest
    timeout-minutes: 80
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: \${{ inputs.dry_run != true }}
      - name: Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install
        timeout-minutes: 10
        run: |
          npm install -g @anthropic-ai/claude-code@2.1.220 @openai/codex@0.146.0
          npm install --prefix "$PW_DIR" playwright@1.62.1
          playwright install --with-deps chromium
      - name: Generate
        timeout-minutes: 25
        env:
          CLAUDE_CODE_OAUTH_TOKEN: \${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
        run: |
          PROMPT=$(cat <<'EOF'
          ATF IDEA FUNNEL v1 — read CONSTRAINTS.md and smoke.mjs and works/ first.
          Write __WORK_DIR__/index.html and __WORK_DIR__/devlog.md.
          Write __WORK_DIR__/funnel.json with "seed" "candidates" "finalists" "selected" "reason".
          Write __WORK_DIR__/meta.json with "seed" "title" "description" "primary_input" "success_condition".
          EOF
          )
          claude -p "$PROMPT" --allowedTools "Read,Write,Bash(node:*)" --max-turns 120
      - name: Verify
        timeout-minutes: 35
        env:
          CLAUDE_CODE_OAUTH_TOKEN: \${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
        run: |
          integrity_check() {
            git status --porcelain=v1 -uall
          }
          integrity_check
          MAX_FIX=3
          node smoke.mjs "$WORK_DIR"
          node scripts/interaction-smoke.mjs "$WORK_DIR"
          claude -p "$FIX" --allowedTools "Read,Write,Bash(node:*)" --max-turns 60
      - name: Gate
        timeout-minutes: 10
        env:
          CODEX_AUTH_JSON: \${{ secrets.CODEX_AUTH_JSON }}
        run: |
          GATE_PROMPT=$(cat scripts/gate-prompt.txt)
          iconv -f UTF-8 -t UTF-8 "$WORK_DIR/index.html" > "$GATE_DIR/index.html"
          codex exec --cd "$GATE_DIR" --sandbox read-only --skip-git-repo-check --output-last-message "$LAST" "$GATE_INPUT"
          FIRST_LINE=$(head -n 1 "$LAST")
          if [ "$FIRST_LINE" = "PUBLISH" ]; then echo ok; fi
      - name: Publish
        timeout-minutes: 5
        run: |
          node scripts/build-catalog.mjs
          if [ "$DRY_RUN" = "true" ]; then exit 0; fi
          for i in 1 2 3 4; do
            git push origin HEAD:main && break
          done
      - name: Save
        if: always()
        uses: actions/upload-artifact@v4
        with:
          path: \${{ runner.temp }}/factory-log
`;

const FIXTURE_FILES = {
  '.github/workflows/factory.yml': FIXTURE_FACTORY,
  'CONSTRAINTS.md': '# fixture 最優先ルール\n検証項目は次の 6 つに固定\n',
  'smoke.mjs': 'console.log("PASS (6/6)");\n',
  'scripts/interaction-smoke.mjs': "const VALID_INPUTS = ['tap', 'hold', 'drag'];\nconsole.log(VALID_INPUTS);\n",
  'scripts/gate-prompt.txt': 'fixture gate prompt\n',
  'scripts/build-catalog.mjs': 'const bad = false;\nif (bad) process.exit(1);\n',
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
      Object.keys(REQUIRED_MATERIALS).map((p) => [
        p,
        { classification: REQUIRED_MATERIALS[p], ...hashesOf(files[p]), role: `fixture material ${p}` },
      ])
    ),
    capabilities: {
      generation: {
        provider_integration: O({ vendor: 'Anthropic', npm_package: '@anthropic-ai/claude-code' }, FY),
        cli_version: O({ name: '@anthropic-ai/claude-code', version: '2.1.220' }, FY),
        effective_model_id: U(),
        provider_model_revision: U(),
        reasoning_configuration: U(),
        provider_routing: U(),
        hidden_system_prompt: U(),
        prompt_cache_state: U(),
        prompt_source: O({ container: FY, heredoc_marker: "PROMPT=$(cat <<'EOF'", funnel_marker: 'ATF IDEA FUNNEL v1' }, FY),
        context_sources: O({ declared_reads: ['CONSTRAINTS.md', 'smoke.mjs', 'works/'] }, FY),
        output_schema: O(
          {
            files: ['index.html', 'devlog.md', 'funnel.json', 'meta.json'],
            funnel_keys: ['seed', 'candidates', 'finalists', 'selected', 'reason'],
            meta_keys: ['seed', 'title', 'description', 'primary_input', 'success_condition'],
          },
          FY
        ),
        allowed_tools: O('Read,Write,Bash(node:*)', FY),
        turn_budget: O({ generate_max_turns: 120, fix_max_turns: 60, max_fix_rounds: 3 }, FY),
        permissions_and_sandbox: O({ policing_function: 'integrity_check' }, FY),
        auth_mechanism: O({ secret_declaration: 'CLAUDE_CODE_OAUTH_TOKEN' }, FY),
        token_usage: U(),
        marginal_cost: U(),
        latency: U(),
      },
      semantic_gate: {
        provider_integration: O({ vendor: 'OpenAI', npm_package: '@openai/codex' }, FY),
        cli_version: O({ name: '@openai/codex', version: '0.146.0' }, FY),
        effective_model_id: U(),
        provider_model_revision: U(),
        reasoning_configuration: U(),
        provider_routing: U(),
        hidden_system_prompt: U(),
        prompt_cache_state: U(),
        prompt_source: O({ path: 'scripts/gate-prompt.txt', load_marker: 'cat scripts/gate-prompt.txt' }, 'scripts/gate-prompt.txt'),
        invocation: O({ command: 'codex exec', flags: ['--cd', '--sandbox read-only', '--skip-git-repo-check', '--output-last-message'] }, FY),
        verdict_contract: O({ pass_token: 'PUBLISH', comparison_marker: '[ "$FIRST_LINE" = "PUBLISH" ]' }, FY),
        input_scope: O({ copied_file: 'index.html', utf8_marker: 'iconv -f UTF-8 -t UTF-8', copy_marker: '"$WORK_DIR/index.html" > "$GATE_DIR/index.html"' }, FY),
        auth_mechanism: O({ secret_declaration: 'CODEX_AUTH_JSON' }, FY),
        token_usage: U(),
        marginal_cost: U(),
        latency: U(),
      },
      deterministic_verification: {
        node_version_declared: O({ declared: '22' }, FY),
        runner_os: O({ label: 'ubuntu-latest' }, FY),
        static_smoke: O({ entrypoint: 'node smoke.mjs', pass_marker: 'PASS (6/6)' }, 'smoke.mjs'),
        interaction_smoke: O({ entrypoint: 'node scripts/interaction-smoke.mjs', contract_inputs: ['tap', 'hold', 'drag'] }, 'scripts/interaction-smoke.mjs'),
        browser_engine: O({ package: 'playwright', version: '1.62.1', browser: 'chromium' }, FY),
        catalog_builder: O({ entrypoint: 'node scripts/build-catalog.mjs', fail_closed_marker: 'process.exit(1)' }, 'scripts/build-catalog.mjs'),
        constraints_contract: O({ markers: ['最優先ルール', '検証項目は次の 6 つに固定'] }, 'CONSTRAINTS.md'),
        integrity_check: O({ policing_function: 'integrity_check' }, FY),
        effective_node_version: U(),
        runner_image_revision: U(),
        browser_revision: U(),
      },
      publish_runtime: {
        triggers: O({ events: ['workflow_dispatch', 'schedule'], cron: '0 1 * * 6' }, FY),
        workflow_permissions: O({ contents: 'write' }, FY),
        concurrency_and_timeout: O({ concurrency_group: 'factory', cancel_in_progress: false, job_timeout_minutes: 80 }, FY),
        checkout_configuration: O({ action: 'actions/checkout@v4', fetch_depth: 0, persist_credentials_expression: '${{ inputs.dry_run != true }}' }, FY),
        declared_action_refs: O({ refs: ['actions/checkout@v4', 'actions/setup-node@v4', 'actions/upload-artifact@v4'] }, FY),
        step_timeouts: O({ job: 80, steps: [10, 25, 35, 10, 5] }, FY),
        publish_mechanism: O({ push_command: 'git push origin HEAD:main', max_attempts: 4 }, FY),
        dry_run_canary: O({ input_name: 'dry_run', guard_marker: 'if [ "$DRY_RUN" = "true" ]' }, FY),
        artifact_persistence: O({ action: 'actions/upload-artifact@v4', condition: 'always()', path_expression: '${{ runner.temp }}/factory-log' }, FY),
        resolved_action_commits: U(),
        pages_reachability_verification: U(),
      },
    },
  };
}

function git(repo, ...args) {
  return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' });
}

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
    git(repo, 'remote', 'add', 'origin', 'https://github.com/fixture/repo.git');
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

function rewriteBaseline(fix, mutate) {
  const p = path.join(fix.repo, 'config', 'champion-baseline.json');
  const doc = JSON.parse(fs.readFileSync(p, 'utf8'));
  mutate(doc);
  fs.writeFileSync(p, JSON.stringify(doc, null, 2), 'utf8');
  fix.baseline = doc;
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

// ---------- 正常な OBSERVED / UNKNOWN と fixture の健全性 ----------

test('valid OBSERVED field passes validation', () => {
  const entry = observedField({ x: 'v' }, FY, FIXTURE_FILES);
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

test('a full fixture run PASSes with 100% verified OBSERVED coverage', (t) => {
  const fix = makeFixture(t);
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'PASS', outcome.reasons.join('\n'));
  assert.equal(outcome.provenance.verification.performed, true);
  assert.equal(outcome.provenance.verification.coverage_percent, 100);
});

// ---------- 必須 field 欠落・schema形状 ----------

test('missing status is rejected', () => {
  assert.ok(validateFieldEntry('f', { value: 'x' }).some((p) => p.includes('status')));
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

test('OBSERVED without evidence is rejected', () => {
  assert.ok(validateFieldEntry('f', { status: 'OBSERVED', value: 'x' }).some((p) => p.includes('evidence')));
});

test('OBSERVED with empty value is rejected (no blanks, no implicit values)', () => {
  const entry = observedField('v', FY, FIXTURE_FILES);
  entry.value = '';
  assert.ok(validateFieldEntry('f', entry).some((p) => p.includes('non-empty value')));
});

test('UNKNOWN without reason or resolution is rejected; non-null UNKNOWN value is rejected', () => {
  const a = unknownField();
  delete a.reason;
  assert.ok(validateFieldEntry('f', a).some((p) => p.includes('reason')));
  const b = unknownField();
  b.resolution = ' ';
  assert.ok(validateFieldEntry('f', b).some((p) => p.includes('resolution')));
  const c = unknownField();
  c.value = 'claude-something (guessed)';
  assert.ok(validateFieldEntry('f', c).some((p) => p.includes('value: null')));
});

test('malformed SHAs are rejected', () => {
  const entry = observedField('v', FY, FIXTURE_FILES);
  entry.evidence.git_blob_sha1 = 'not-a-sha';
  assert.ok(validateFieldEntry('f', entry).some((p) => p.includes('git_blob_sha1')));
  const doc = buildBaseline(FIXTURE_FILES, 'a'.repeat(40));
  doc.material_sources['smoke.mjs'].sha256 = 'zz'.repeat(32);
  assert.ok(validateBaseline(doc).some((p) => p.includes('sha256')));
});

// ---------- exact schema: 削除も未定義の追加も FAIL ----------

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

test('adding a fictitious capability group FAILs (exact schema)', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => { doc.capabilities.telemetry = { sensor: unknownField() }; },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('capability group not defined by schema') && r.includes('telemetry')));
});

test('adding a fictitious OBSERVED field FAILs (exact schema + no verifier)', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => {
      doc.capabilities.generation.magic_capability = observedField({ level: 'maximum' }, FY, FIXTURE_FILES);
    },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('field not defined by schema') && r.includes('magic_capability')));
});

test('misclassifying a snapshot document as production material FAILs', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => { doc.material_sources['CURRENT_STATE.md'].classification = 'production_material'; },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('CURRENT_STATE.md must be classified as control_plane_snapshot')));
});

// ---------- verifier registry: 値と証拠内容の照合 ----------

test('every OBSERVED field in the fixture has a registered verifier and verifies', (t) => {
  const fix = makeFixture(t);
  const sources = {};
  for (const [rel, cls] of Object.entries(REQUIRED_MATERIALS)) {
    if (cls === 'production_material') sources[rel] = fs.readFileSync(path.join(fix.repo, rel), 'utf8');
  }
  const ctx = {
    factory: sources[FY],
    sources,
    facts: extractFactoryFacts(sources[FY]),
    scoped: extractScopedSecrets(sources[FY]),
  };
  const res = verifyObservedFields(fix.baseline, ctx);
  assert.deepEqual(res.problems, []);
  assert.equal(res.missingVerifier.length, 0);
  assert.equal(res.verifiedOk, res.observedTotal);
});

test('swapping the fictional output_schema keeps the same evidence but FAILs the verifier', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => {
      doc.capabilities.generation.output_schema.value = {
        files: ['masterpiece.html'],
        funnel_keys: ['brilliance'],
        meta_keys: ['genius_score'],
      };
    },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('output_schema') && r.includes('not found verbatim')));
});

test('swapping generation and gate secret declarations FAILs the scoped check', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => {
      doc.capabilities.generation.auth_mechanism.value.secret_declaration = 'CODEX_AUTH_JSON';
      doc.capabilities.semantic_gate.auth_mechanism.value.secret_declaration = 'CLAUDE_CODE_OAUTH_TOKEN';
    },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('auth_mechanism.secret_declaration is not among the secrets referenced by')));
});

test('swapping generation provider_integration to OpenAI FAILs against factory.yml', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => {
      doc.capabilities.generation.provider_integration.value = { vendor: 'OpenAI', npm_package: '@openai/codex' };
    },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('generation.provider_integration')));
});

test('lying about the pinned CLI version FAILs against factory.yml', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => { doc.capabilities.generation.cli_version.value.version = '9.9.9'; },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('cli_version.version')));
});

test('extractFactoryFacts and extractScopedSecrets pull the machine-readable facts from the fixture workflow', () => {
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
  assert.equal(f.cancel_in_progress, false);
  assert.deepEqual(f.timeouts, [80, 10, 25, 35, 10, 5]);
  assert.equal(f.cron, '0 1 * * 6');
  assert.equal(f.fetch_depth, 0);
  assert.deepEqual(f.action_refs, ['actions/checkout@v4', 'actions/setup-node@v4', 'actions/upload-artifact@v4']);
  assert.equal(f.push_attempts, 4);
  const s = extractScopedSecrets(FIXTURE_FACTORY);
  assert.deepEqual([...s.generation].sort(), ['CLAUDE_CODE_OAUTH_TOKEN']);
  assert.deepEqual([...s.gate].sort(), ['CODEX_AUTH_JSON']);
});

// ---------- STALE / snapshot 分離 / 証拠不整合 ----------

test('production material change in the working tree is STALE', (t) => {
  const fix = makeFixture(t);
  fs.writeFileSync(path.join(fix.repo, 'smoke.mjs'), 'console.log("changed after declaration");\n', 'utf8');
  const materials = verifyMaterialSources(fix.baseline, fix.repo);
  assert.equal(materials.productionMismatched.length, 1);
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'STALE');
  assert.ok(outcome.reasons.some((r) => r.includes('production material changed')));
});

test('a changed factory.yml yields STALE and skips the verifier phase', (t) => {
  const fix = makeFixture(t);
  fs.appendFileSync(path.join(fix.repo, FY), '# drift\n', 'utf8');
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'STALE');
  assert.equal(outcome.provenance.verification.performed, false);
});

test('control-plane snapshot drift is recorded but does NOT make the baseline STALE', (t) => {
  const fix = makeFixture(t);
  fs.appendFileSync(path.join(fix.repo, 'CURRENT_STATE.md'), '\nnormal update\n', 'utf8');
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'PASS');
  assert.equal(outcome.provenance.material_sources['CURRENT_STATE.md'].match, false);
  assert.ok(outcome.provenance.snapshot_drift.some((d) => d.path === 'CURRENT_STATE.md'));
  assert.equal(outcome.provenance.verification.coverage_percent, 100);
});

test('a declared SHA-256 that alone contradicts the blob is FAIL (internal inconsistency), not STALE', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => { doc.material_sources['smoke.mjs'].sha256 = 'f'.repeat(64); },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('disagree about the same content')));
  assert.ok(!outcome.reasons.some((r) => r.includes('materially STALE')));
});

test('verifyEvidence detects broken and internally inconsistent evidence', (t) => {
  const fix = makeFixture(t);
  const doc = structuredClone(fix.baseline);
  doc.capabilities.generation.extra = {
    status: 'OBSERVED',
    value: 'x',
    evidence: { kind: 'repository', path: 'notes.txt', git_blob_sha1: 'd'.repeat(40), derived_from: 'fixture' },
  };
  doc.capabilities.deterministic_verification.static_smoke.evidence.git_blob_sha1 = 'e'.repeat(40);
  const ev = verifyEvidence(doc, fix.repo);
  assert.equal(ev.brokenEvidence.length, 2);
  assert.ok(ev.brokenEvidence.some((b) => b.path === 'notes.txt'));
  assert.ok(ev.brokenEvidence.some((b) => String(b.problem).includes('internally inconsistent')));
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

// ---------- repository / history binding ----------

test('a baseline declaring a different repository FAILs', (t) => {
  const fix = makeFixture(t, { mutateBaseline: (doc) => { doc.base.repository = 'EvilOrg/other-repo'; } });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('does not match the executing repository')));
});

test('a fictitious base_sha FAILs', (t) => {
  const fix = makeFixture(t, { mutateBaseline: (doc) => { doc.base.base_sha = 'a'.repeat(40); } });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('does not exist as a commit')));
});

test('a base commit with the same tree but outside the history (non-ancestor) FAILs', (t) => {
  const fix = makeFixture(t);
  const tree = git(fix.repo, 'rev-parse', 'HEAD^{tree}').trim();
  const orphan = git(fix.repo, '-c', 'user.name=c0-test', '-c', 'user.email=c0@test.invalid', 'commit-tree', tree, '-m', 'orphan').trim();
  rewriteBaseline(fix, (doc) => { doc.base.base_sha = orphan; });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('not an ancestor of the inspected HEAD')));
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

test('a non-git observed tree yields VOID (identity, tracking and base cannot be verified)', (t) => {
  const fix = makeFixture(t, { gitInit: false });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'VOID');
  assert.ok(outcome.reasons.some((r) => r.includes('not a git work tree')));
});

test('a head SHA differing from base_sha alone stays PASS (not STALE)', (t) => {
  const fix = makeFixture(t);
  const outcome = runFixture(fix, { env: { GITHUB_SHA: 'b'.repeat(40) } });
  assert.equal(outcome.result, 'PASS');
  assert.equal(outcome.provenance.runtime.checkout_sha.value, 'b'.repeat(40));
  assert.equal(outcome.provenance.runtime.head_sha.value, fix.baseSha);
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
  assert.equal(outcome.provenance.material_sources['../../etc/passwd'].observed, null);
});

test('an absolute evidence path FAILs', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => { doc.capabilities.generation.prompt_source.evidence.path = '/etc/passwd'; },
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

// ---------- Secret 混入 ----------

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
      doc.capabilities.generation.prompt_source.value.funnel_marker = 'sk-ant-' + 'x1y2z3w4v5'.repeat(2);
    },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.equal(outcome.provenance, null);
  assert.ok(!fs.existsSync(path.join(fix.out, 'provenance.json')));
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
});

test('a secret-shaped prefix in a malformed baseline never reaches result.json', (t) => {
  const fix = makeFixture(t);
  fs.writeFileSync(path.join(fix.repo, 'config', 'champion-baseline.json'), 'sk-ant-' + 'a1s2d3f4g5'.repeat(2) + '{', 'utf8');
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  const written = fs.readFileSync(path.join(fix.out, 'result.json'), 'utf8');
  assert.ok(!written.includes('sk-ant-'));
});

test('keys implying secret hashes or prefixes are rejected; declaration names are allowed', (t) => {
  for (const key of ['token_sha256', 'secret_prefix', 'auth_hash', 'api_key_len', 'credential-fingerprint']) {
    assert.ok(scanKeysForSecretLeaks({ meta: { [key]: 'deadbeef' } }).length >= 1, `expected key-name hit for ${key}`);
  }
  assert.equal(scanKeysForSecretLeaks({ auth: { secret_declaration: 'CLAUDE_CODE_OAUTH_TOKEN' } }).length, 0);
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => { doc.capabilities.generation.cli_version.token_sha256 = 'ab'.repeat(32); },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('secret-like content')));
});

// ---------- repository 内部への artifact 出力 / read-only 保証 ----------

test('writing artifacts inside the repository is refused before any write', (t) => {
  const fix = makeFixture(t);
  const before = snapshotTree(fix.repo);
  assert.throws(
    () => run({ repoRoot: fix.repo, outDir: path.join(fix.repo, 'artifacts'), env: {} }),
    /refusing to write artifacts inside the repository/
  );
  assert.deepEqual(snapshotTree(fix.repo), before);
  assert.ok(isInsideRepo(path.join(fix.repo, '..artifacts'), fix.repo));
  assert.throws(
    () => run({ repoRoot: fix.repo, outDir: path.join(fix.repo, '..artifacts'), env: {} }),
    /refusing to write artifacts inside the repository/
  );
  assert.ok(!isInsideRepo(fix.out, fix.repo));
});

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

// ---------- material source 不足 / 安定schema / 結果規則 ----------

test('a missing material source yields VOID (observation cannot be established)', (t) => {
  const fix = makeFixture(t);
  fs.rmSync(path.join(fix.repo, 'CONSTRAINTS.md'));
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'VOID');
  assert.ok(outcome.reasons.some((r) => r.includes('CONSTRAINTS.md')));
});

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
  assert.deepEqual(stripVolatile(first.provenance), stripVolatile(second.provenance));
});

test('result precedence is HOLD > FAIL > VOID > STALE > PASS', () => {
  const all = { holdReasons: ['h'], failReasons: ['f'], voidReasons: ['v'], staleReasons: ['s'] };
  assert.equal(computeResult(all).result, 'HOLD');
  assert.equal(computeResult({ ...all, holdReasons: [] }).result, 'FAIL');
  assert.equal(computeResult({ ...all, holdReasons: [], failReasons: [] }).result, 'VOID');
  assert.equal(computeResult({ ...all, holdReasons: [], failReasons: [], voidReasons: [] }).result, 'STALE');
  assert.equal(computeResult({ holdReasons: [], failReasons: [], voidReasons: [], staleReasons: [] }).result, 'PASS');
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

// ---------- runtime facts ----------

test('runtime facts record the actual observer environment and separated SHAs', (t) => {
  const fix = makeFixture(t);
  const env = {
    GITHUB_RUN_ID: '12345',
    GITHUB_RUN_ATTEMPT: '2',
    RUNNER_OS: 'Linux',
    GITHUB_SHA: 'c'.repeat(40),
    ImageVersion: '20260801.1.0',
  };
  const rt = runFixture(fix, { env }).provenance.runtime;
  assert.equal(rt.os_platform.value, process.platform);
  assert.equal(rt.architecture.value, os.arch());
  assert.equal(rt.kernel.value, os.release());
  assert.equal(rt.node_version.value, process.version);
  assert.equal(rt.workflow_run_id.value, '12345');
  assert.equal(rt.workflow_run_attempt.value, '2');
  assert.equal(rt.runner_os_label.value, 'Linux');
  assert.equal(rt.runner_image_version.value, '20260801.1.0');
  assert.equal(rt.checkout_sha.value, 'c'.repeat(40));
  assert.equal(rt.head_sha.value, fix.baseSha);
  assert.match(rt.head_tree_sha.value, /^[0-9a-f]{40}$/);
  assert.equal(rt.pr_head_sha.status, 'UNKNOWN');
  assert.ok(!Number.isNaN(Date.parse(rt.started_at.value)));
  assert.ok(!Number.isNaN(Date.parse(rt.finished_at.value)));
  assert.equal(typeof rt.observer_latency_ms.value, 'number');
  assert.ok(rt.observer_latency_ms.evidence.derived_from.includes('NOT production factory latency'));

  const rtLocal = runFixture(fix, { outDir: path.join(fix.root, 'out-local'), env: {} }).provenance.runtime;
  assert.equal(rtLocal.workflow_run_id.status, 'UNKNOWN');
  assert.equal(rtLocal.checkout_sha.status, 'UNKNOWN');
  assert.equal(rtLocal.runner_image_version.status, 'UNKNOWN');
});

// ---------- ハッシュ既知ベクトル ----------

test('hash functions match well-known external vectors', () => {
  assert.equal(computeGitBlobSha1(Buffer.alloc(0)), 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391');
  assert.equal(computeGitBlobSha1('hello world\n'), '3b18e512dba79e4c8300dd08aeb37f8e728b8dad');
  assert.equal(computeSha256(Buffer.alloc(0)), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(computeSha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

// ---------- CLI entrypoint ----------

const CLI = path.join(path.dirname(fileURLToPath(import.meta.url)), 'c0-provenance.mjs');

function runCli(args) {
  const env = {
    ...process.env,
    RUNNER_TEMP: '',
    GITHUB_REPOSITORY: '',
    GITHUB_SHA: '',
    GITHUB_RUN_ID: '',
    GITHUB_RUN_ATTEMPT: '',
    GITHUB_EVENT_PATH: '',
    RUNNER_OS: '',
    ImageVersion: '',
  };
  return spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', env });
}

test('CLI exits 0 on PASS and writes all three artifacts', (t) => {
  const fix = makeFixture(t);
  const res = runCli(['--repo', fix.repo, '--out', fix.out]);
  assert.equal(res.status, 0, res.stderr + res.stdout);
  for (const name of ['provenance.json', 'result.json', 'verification.log']) {
    assert.ok(fs.existsSync(path.join(fix.out, name)), `${name} missing`);
  }
});

test('CLI exits 1 on a non-PASS observation (fail-closed)', (t) => {
  const fix = makeFixture(t);
  fs.rmSync(path.join(fix.repo, 'smoke.mjs'));
  const res = runCli(['--repo', fix.repo, '--out', fix.out]);
  assert.equal(res.status, 1);
  assert.equal(JSON.parse(fs.readFileSync(path.join(fix.out, 'result.json'), 'utf8')).result, 'VOID');
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
  const wf = fs.readFileSync(path.join(REPO_ROOT, '.github', 'workflows', 'c0-provenance.yml'), 'utf8');
  for (const [p, cls] of Object.entries(REQUIRED_MATERIALS)) {
    if (cls === 'production_material') {
      assert.ok(wf.includes(`- '${p}'`), `c0-provenance.yml pull_request paths must include ${p}`);
    }
  }
});

// ---------- verifier registry の完全性 ----------

test('every OBSERVED field in the real baseline has a registered verifier, and the registry stays inside the manifest', () => {
  const real = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'config', 'champion-baseline.json'), 'utf8'));
  const observedKeys = [];
  for (const [cap, fields] of Object.entries(real.capabilities)) {
    for (const [name, entry] of Object.entries(fields)) {
      if (entry.status === 'OBSERVED') observedKeys.push(`${cap}.${name}`);
    }
  }
  assert.deepEqual(observedKeys.sort(), Object.keys(OBSERVED_VERIFIERS).sort(), 'OBSERVED fields and verifier registry must match 1:1');
  for (const key of Object.keys(OBSERVED_VERIFIERS)) {
    const [cap, name] = key.split('.');
    assert.ok(REQUIRED_FIELDS[cap]?.includes(name), `verifier ${key} must be inside the fixed manifest`);
  }
});

// ---------- 実リポジトリ: schema / manifest / verifier 三重照合と end-to-end PASS ----------

test('the real config/champion-baseline.json conforms to schema, manifest and every verifier', () => {
  const real = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'config', 'champion-baseline.json'), 'utf8'));
  assert.equal(real.schema, SCHEMA_VERSION);
  assert.deepEqual(validateBaseline(real), []);
  assert.deepEqual(enforceManifest(real), []);
  assert.equal(scanKeysForSecretLeaks(real).length, 0);
  assert.equal(scanForSecrets(JSON.stringify(real)).length, 0);
  const sources = {};
  for (const [rel, cls] of Object.entries(REQUIRED_MATERIALS)) {
    if (cls === 'production_material') sources[rel] = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
  }
  const ctx = {
    factory: sources[FY],
    sources,
    facts: extractFactoryFacts(sources[FY]),
    scoped: extractScopedSecrets(sources[FY]),
  };
  const res = verifyObservedFields(real, ctx);
  assert.deepEqual(res.problems, []);
  assert.equal(res.verifiedOk, res.observedTotal);
});

test('the real repository PASSes end-to-end with coverage 100%', (t) => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'c0-real-'));
  t.after(() => fs.rmSync(out, { recursive: true, force: true }));
  const outcome = run({ repoRoot: REPO_ROOT, outDir: out, env: process.env });
  assert.equal(outcome.result, 'PASS', outcome.reasons.join('\n'));
  assert.equal(outcome.provenance.verification.coverage_percent, 100);
});

// ---------- mutation test: 実baselineの全OBSERVED fieldを1件ずつ改変 → 必ず非PASS ----------

function mutateLeaves(v) {
  if (typeof v === 'string') return v + 'X';
  if (typeof v === 'number') return v + 1;
  if (typeof v === 'boolean') return !v;
  if (Array.isArray(v)) return v.map(mutateLeaves);
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, mutateLeaves(x)]));
  }
  return v;
}

test('mutating any single OBSERVED value in the real baseline never PASSes', (t) => {
  const real = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'config', 'champion-baseline.json'), 'utf8'));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'c0-mutate-'));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  const observedKeys = [];
  for (const [cap, fields] of Object.entries(real.capabilities)) {
    for (const [name, entry] of Object.entries(fields)) {
      if (entry.status === 'OBSERVED') observedKeys.push([cap, name]);
    }
  }
  assert.ok(observedKeys.length >= 30, 'expected a substantial OBSERVED field set');
  const failures = [];
  observedKeys.forEach(([cap, name], i) => {
    const doc = structuredClone(real);
    doc.capabilities[cap][name].value = mutateLeaves(doc.capabilities[cap][name].value);
    const baselinePath = path.join(tmp, `mutated-${i}.json`);
    fs.writeFileSync(baselinePath, JSON.stringify(doc, null, 2), 'utf8');
    const outcome = run({ repoRoot: REPO_ROOT, outDir: path.join(tmp, `out-${i}`), baselinePath, env: process.env });
    if (outcome.result === 'PASS') failures.push(`${cap}.${name}`);
  });
  assert.deepEqual(failures, [], `mutated OBSERVED fields must never PASS: ${failures.join(', ')}`);
  // 監査で名指しされた field が対象に含まれていることを固定する
  const keys = observedKeys.map(([c, n]) => `${c}.${n}`);
  for (const required of [
    'generation.output_schema',
    'deterministic_verification.static_smoke',
    'deterministic_verification.interaction_smoke',
    'publish_runtime.publish_mechanism',
    'generation.auth_mechanism',
    'semantic_gate.auth_mechanism',
  ]) {
    assert.ok(keys.includes(required), `mutation set must include ${required}`);
  }
});

// ---------- 実 baseline の no-model-guessing 規則 ----------

test('the real baseline never guesses provider-side or runtime-resolved configuration', () => {
  const real = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'config', 'champion-baseline.json'), 'utf8'));
  const REQUIRED_UNKNOWN = {
    generation: ['effective_model_id', 'provider_model_revision', 'reasoning_configuration', 'provider_routing', 'hidden_system_prompt', 'prompt_cache_state', 'token_usage', 'marginal_cost'],
    semantic_gate: ['effective_model_id', 'provider_model_revision', 'reasoning_configuration', 'provider_routing', 'hidden_system_prompt', 'prompt_cache_state', 'token_usage', 'marginal_cost'],
    deterministic_verification: ['effective_node_version', 'runner_image_revision', 'browser_revision'],
    publish_runtime: ['resolved_action_commits'],
  };
  for (const [cap, fields] of Object.entries(REQUIRED_UNKNOWN)) {
    for (const field of fields) {
      const entry = real.capabilities[cap]?.[field];
      assert.ok(entry, `capabilities.${cap}.${field} must exist (omission is an implicit blank)`);
      assert.equal(entry.status, 'UNKNOWN', `capabilities.${cap}.${field} must be UNKNOWN, not guessed`);
      assert.equal(entry.value, null);
      assert.ok(entry.reason.length > 0 && entry.resolution.length > 0);
      assert.ok(REQUIRED_FIELDS[cap].includes(field), `${cap}.${field} must be part of the fixed manifest`);
    }
  }
});
