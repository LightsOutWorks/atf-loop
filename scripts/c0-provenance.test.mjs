#!/usr/bin/env node
// c0-provenance.test.mjs — C0 observer の決定論テスト。
// 実行: node --test scripts/c0-provenance.test.mjs
// ネットワーク・Secrets・外部モデルには一切依存しない。fixture は OS の一時領域に
// 実際の git repository として作る。fixture baseline の OBSERVED 値は、実装と同じ
// canonical 抽出器で宣言時に生成する(宣言 = canonical の deep exact contract)。

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
  canonicalObservedValues,
  stableStringify,
  computeGitBlobSha1,
  computeSha256,
  validateFieldEntry,
  validateBaseline,
  enforceManifest,
  validatePathShape,
  inspectRepoPath,
  extractFactoryFacts,
  extractScopedSecrets,
  extractHeredoc,
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
const FY = '.github/workflows/factory.yml';

// ---------- fixture ----------
// 実物と同じ抽出点をすべて持つ最小 workflow。DECOY_SECRET は
// コメント・run本文にのみ現れ、env mapping には現れない(scope除外の回帰対象)。

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
      - name: Prep
        run: |
          cat > "$LOG_DIR/lib.sh" <<'LIB'
          fail() {
            echo "fail-closed"
          }
          integrity_check() {
            git status --porcelain=v1 -uall
          }
          LIB
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
          # secrets.DECOY_SECRET must never enter the scope (comment decoy)
          DECOY_NOTE="secrets.DECOY_SECRET"
          # codex exec is referenced here only in a comment (invocation decoy)
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
          FIX_TMPL=$(cat <<'EOF'
          fixture fix prompt
          EOF
          )
          MAX_FIX=3
          node smoke.mjs "$WORK_DIR"
          node scripts/interaction-smoke.mjs "$WORK_DIR"
          claude -p "$FIX_TMPL" --allowedTools "Read,Write,Bash(node:*)" --max-turns 60
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
  [FY]: FIXTURE_FACTORY,
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

function hashesOf(content) {
  return { git_blob_sha1: computeGitBlobSha1(content), sha256: computeSha256(content) };
}

function ctxFor(files) {
  const factory = files[FY];
  const sources = {};
  for (const [rel, cls] of Object.entries(REQUIRED_MATERIALS)) {
    if (cls === 'production_material') sources[rel] = files[rel];
  }
  return { factory, sources, facts: extractFactoryFacts(factory), scoped: extractScopedSecrets(factory) };
}

function unknownField() {
  return {
    status: 'UNKNOWN',
    value: null,
    reason: 'not machine-extractable from the fixture workflow as a canonical value',
    resolution: 'declare it in a machine-readable form or capture it from run output',
  };
}

// fixture baseline: OBSERVED 値は実装と同じ canonical 抽出器から生成する。
function buildBaseline(files, baseSha) {
  const canonical = canonicalObservedValues(ctxFor(files));
  const O = (key) => {
    const reg = OBSERVED_VERIFIERS[key];
    const value = canonical[key];
    if (value === null || value === undefined) throw new Error(`fixture canonical missing for ${key}`);
    return {
      status: 'OBSERVED',
      value,
      evidence: {
        kind: 'repository',
        path: reg.evidence,
        git_blob_sha1: computeGitBlobSha1(files[reg.evidence]),
        derived_from: `fixture canonical extraction from ${reg.evidence}`,
      },
    };
  };
  const U = unknownField;
  const cap = (group, fieldBuilders) =>
    Object.fromEntries(REQUIRED_FIELDS[group].map((f) => [f, fieldBuilders[f] ?? (OBSERVED_VERIFIERS[`${group}.${f}`] ? O(`${group}.${f}`) : U())]));
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
      generation: cap('generation', {}),
      semantic_gate: cap('semantic_gate', {}),
      deterministic_verification: cap('deterministic_verification', {}),
      publish_runtime: cap('publish_runtime', {}),
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

// ---------- fixture の健全性と正常 PASS ----------

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

// ---------- schema 形状 ----------

test('field entry shape violations are rejected', () => {
  assert.ok(validateFieldEntry('f', { value: 'x' }).some((p) => p.includes('status')));
  assert.ok(validateFieldEntry('f', { status: 'OBSERVED', value: 'x' }).some((p) => p.includes('evidence')));
  const empty = { status: 'OBSERVED', value: '', evidence: { kind: 'repository', path: FY, git_blob_sha1: 'a'.repeat(40), derived_from: 'x' } };
  assert.ok(validateFieldEntry('f', empty).some((p) => p.includes('non-empty value')));
  const badSha = { status: 'OBSERVED', value: 'v', evidence: { kind: 'repository', path: FY, git_blob_sha1: 'nope', derived_from: 'x' } };
  assert.ok(validateFieldEntry('f', badSha).some((p) => p.includes('git_blob_sha1')));
  const u1 = unknownField();
  delete u1.reason;
  assert.ok(validateFieldEntry('f', u1).some((p) => p.includes('reason')));
  const u2 = unknownField();
  u2.value = 'guessed';
  assert.ok(validateFieldEntry('f', u2).some((p) => p.includes('value: null')));
});

test('baseline structure violations are rejected', () => {
  const a = buildBaseline(FIXTURE_FILES, 'a'.repeat(40));
  delete a.material_sources;
  assert.ok(validateBaseline(a).some((p) => p.includes('material_sources')));
  const b = buildBaseline(FIXTURE_FILES, 'a'.repeat(40));
  delete b.material_sources['smoke.mjs'].classification;
  assert.ok(validateBaseline(b).some((p) => p.includes('classification')));
  const c = buildBaseline(FIXTURE_FILES, 'a'.repeat(40));
  c.material_sources['smoke.mjs'].sha256 = 'zz'.repeat(32);
  assert.ok(validateBaseline(c).some((p) => p.includes('sha256')));
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

test('adding a fictitious capability group or field FAILs (exact schema)', (t) => {
  const a = makeFixture(t, { mutateBaseline: (doc) => { doc.capabilities.telemetry = { sensor: unknownField() }; } });
  const oa = runFixture(a);
  assert.equal(oa.result, 'FAIL');
  assert.ok(oa.reasons.some((r) => r.includes('capability group not defined by schema') && r.includes('telemetry')));

  const b = makeFixture(t, {
    mutateBaseline: (doc) => {
      doc.capabilities.generation.magic_capability = {
        status: 'OBSERVED',
        value: { level: 'maximum' },
        evidence: { kind: 'repository', path: FY, git_blob_sha1: computeGitBlobSha1(FIXTURE_FILES[FY]), derived_from: 'fiction' },
      };
    },
  });
  const ob = runFixture(b);
  assert.equal(ob.result, 'FAIL');
  assert.ok(ob.reasons.some((r) => r.includes('field not defined by schema') && r.includes('magic_capability')));
});

test('misclassifying a snapshot document as production material FAILs', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => { doc.material_sources['CURRENT_STATE.md'].classification = 'production_material'; },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('CURRENT_STATE.md must be classified as control_plane_snapshot')));
});

// ---------- 監査再現 6 件(すべて非PASSに固定) ----------

test('audit-1: reducing context_sources to a subset cannot PASS (field is UNKNOWN; OBSERVED has no verifier)', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => {
      doc.capabilities.generation.context_sources = {
        status: 'OBSERVED',
        value: { declared_reads: ['CONSTRAINTS.md'] },
        evidence: { kind: 'repository', path: FY, git_blob_sha1: computeGitBlobSha1(FIXTURE_FILES[FY]), derived_from: 'subset claim' },
      };
    },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('no registered verifier') && r.includes('context_sources')));
});

test('audit-2: reducing output_schema to a subset FAILs the canonical deep compare', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => {
      doc.capabilities.generation.output_schema.value = { files: ['index.html'], funnel_keys: ['seed'], meta_keys: ['seed'] };
    },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('output_schema') && r.includes('does not deep-equal')));
});

test('audit-3: repointing verdict_contract at the DRY_RUN comparison FAILs', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => {
      doc.capabilities.semantic_gate.verdict_contract.value = {
        pass_token: 'true',
        comparison_marker: '[ "$DRY_RUN" = "true" ]',
      };
    },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('verdict_contract') && r.includes('does not deep-equal')));
});

test('audit-4: subsetting interaction inputs, trigger events, or the constraints contract FAILs', (t) => {
  const a = makeFixture(t, {
    mutateBaseline: (doc) => { doc.capabilities.deterministic_verification.interaction_smoke.value.contract_inputs = ['tap']; },
  });
  assert.equal(runFixture(a).result, 'FAIL');

  const b = makeFixture(t, {
    mutateBaseline: (doc) => { doc.capabilities.publish_runtime.triggers.value.events = ['schedule']; },
  });
  assert.equal(runFixture(b).result, 'FAIL');

  const c = makeFixture(t, {
    mutateBaseline: (doc) => { doc.capabilities.deterministic_verification.constraints_contract.value = { markers: ['最優先ルール'] }; },
  });
  assert.equal(runFixture(c).result, 'FAIL');
});

test('audit-5: adding an undeclared nested key to an OBSERVED value FAILs', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => { doc.capabilities.generation.cli_version.value.undeclared_extra = 'x'; },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('cli_version') && r.includes('does not deep-equal')));
});

test('audit-6: DECOY_SECRET in comments and run bodies never enters the secret scope', (t) => {
  const scoped = extractScopedSecrets(FIXTURE_FACTORY);
  assert.deepEqual([...scoped.generation].sort(), ['CLAUDE_CODE_OAUTH_TOKEN']);
  assert.deepEqual([...scoped.gate].sort(), ['CODEX_AUTH_JSON']);
  // baseline が DECOY を主張したら FAIL
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => {
      doc.capabilities.generation.auth_mechanism.value.secret_declarations = ['CLAUDE_CODE_OAUTH_TOKEN', 'DECOY_SECRET'];
    },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('auth_mechanism') && r.includes('does not deep-equal')));
});

// ---------- verifier registry ----------

test('every fixture OBSERVED field verifies against its canonical extraction', () => {
  const doc = buildBaseline(FIXTURE_FILES, 'a'.repeat(40));
  const res = verifyObservedFields(doc, ctxFor(FIXTURE_FILES));
  assert.deepEqual(res.problems, []);
  assert.equal(res.verifiedOk, res.observedTotal);
});

test('swapping generation and gate secret declarations FAILs the step-scoped check', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => {
      doc.capabilities.generation.auth_mechanism.value.secret_declarations = ['CODEX_AUTH_JSON'];
      doc.capabilities.semantic_gate.auth_mechanism.value.secret_declarations = ['CLAUDE_CODE_OAUTH_TOKEN'];
    },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('auth_mechanism')));
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

test('extractFactoryFacts pulls the complete canonical facts from the fixture workflow', () => {
  const f = extractFactoryFacts(FIXTURE_FACTORY);
  assert.equal(f.generation_cli_version, '2.1.220');
  assert.equal(f.gate_cli_version, '0.146.0');
  assert.deepEqual(f.allowed_tools_occurrences, ['Read,Write,Bash(node:*)', 'Read,Write,Bash(node:*)']);
  assert.deepEqual(f.max_turns_occurrences, [120, 60]);
  assert.equal(f.max_fix_rounds, 3);
  assert.equal(f.node_version, '22');
  assert.equal(f.playwright_version, '1.62.1');
  assert.equal(f.browser, 'chromium');
  assert.equal(f.runner_label, 'ubuntu-latest');
  assert.equal(f.permissions_contents, 'write');
  assert.equal(f.concurrency_group, 'factory');
  assert.equal(f.cancel_in_progress, false);
  assert.deepEqual(f.timeouts, [80, 10, 25, 35, 10, 5]);
  assert.equal(f.cron, '0 1 * * 6');
  assert.equal(f.fetch_depth, 0);
  assert.equal(f.persist_credentials_expression, '${{ inputs.dry_run != true }}');
  assert.deepEqual(f.action_refs, ['actions/checkout@v4', 'actions/setup-node@v4', 'actions/upload-artifact@v4']);
  assert.equal(f.push_attempts, 4);
  assert.equal(f.push_target, 'HEAD:main');
  assert.equal(f.verdict_pass_token, 'PUBLISH');
  assert.equal(f.gate_prompt_path, 'scripts/gate-prompt.txt');
  assert.equal(f.input_scope_copy, 'index.html');
  assert.equal(f.dry_run_guard_value, 'true');
  assert.deepEqual(f.output_files, ['devlog.md', 'funnel.json', 'index.html', 'meta.json']);
  assert.deepEqual(f.codex_invocation, {
    command: 'codex exec',
    flags: ['--cd', '--sandbox read-only', '--skip-git-repo-check', '--output-last-message'],
  });
  assert.deepEqual(f.on_block, { events: ['workflow_dispatch', 'schedule'], inputs: ['dry_run'] });
  assert.deepEqual(f.upload_step, { action: 'actions/upload-artifact@v4', condition: 'always()', path_expression: '${{ runner.temp }}/factory-log' });
  assert.ok(f.generate_prompt.includes('ATF IDEA FUNNEL v1'));
  assert.ok(f.fix_prompt.includes('fixture fix prompt'));
  assert.ok(f.lib_source.includes('integrity_check() {'));
});

test('extractHeredoc returns the exact body between opener and delimiter', () => {
  const body = extractHeredoc(FIXTURE_FACTORY, "PROMPT=$(cat <<'EOF'", 'EOF');
  assert.ok(body.startsWith('          ATF IDEA FUNNEL v1'));
  assert.ok(!body.includes('EOF'));
  assert.equal(extractHeredoc('no heredoc here', "X=$(cat <<'EOF'", 'EOF'), null);
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

test('a non-git observed tree yields VOID', (t) => {
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

// ---------- path 検査 ----------

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

test('absolute, symlinked and untracked provenance paths FAIL', (t) => {
  const a = makeFixture(t, {
    mutateBaseline: (doc) => { doc.capabilities.generation.prompt_source.evidence.path = '/etc/passwd'; },
  });
  const oa = runFixture(a);
  assert.equal(oa.result, 'FAIL');
  assert.ok(oa.reasons.some((r) => r.includes('absolute paths are forbidden')));

  const b = makeFixture(t, {
    preCommit: (repo) => fs.symlinkSync('CONSTRAINTS.md', path.join(repo, 'link.md')),
    mutateBaseline: (doc) => {
      doc.material_sources['link.md'] = { classification: 'production_material', git_blob_sha1: 'a'.repeat(40), sha256: 'b'.repeat(64), role: 'symlink attempt' };
    },
  });
  assert.equal(inspectRepoPath(b.repo, 'link.md').state, 'symlink');
  const ob = runFixture(b);
  assert.equal(ob.result, 'FAIL');
  assert.ok(ob.reasons.some((r) => r.includes('link.md') && r.includes('symlink')));

  const extra = 'untracked content\n';
  const c = makeFixture(t, {
    postCommit: (repo) => fs.writeFileSync(path.join(repo, 'extra.txt'), extra, 'utf8'),
    mutateBaseline: (doc) => {
      doc.material_sources['extra.txt'] = { classification: 'production_material', ...hashesOf(extra), role: 'untracked attempt' };
    },
  });
  const oc = runFixture(c);
  assert.equal(oc.result, 'FAIL');
  assert.ok(oc.reasons.some((r) => r.includes('extra.txt') && r.includes('untracked')));
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
    assert.ok(!JSON.stringify(hits).includes(fake));
  }
});

test('run FAILs and withholds provenance.json when a secret-shaped value appears', (t) => {
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => { doc.capabilities.generation.allowed_tools.value = 'sk-ant-' + 'x1y2z3w4v5'.repeat(2); },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.equal(outcome.provenance, null);
  assert.ok(!fs.existsSync(path.join(fix.out, 'provenance.json')));
  for (const name of ['result.json', 'verification.log']) {
    assert.ok(!fs.readFileSync(path.join(fix.out, name), 'utf8').includes('sk-ant-'), `${name} must not leak`);
  }
});

test('a secret-shaped status value or malformed baseline never leaks into artifacts', (t) => {
  const a = makeFixture(t, {
    mutateBaseline: (doc) => { doc.capabilities.generation.cli_version.status = 'sk-ant-' + 'q1w2e3r4t5'.repeat(2); },
  });
  const oa = runFixture(a);
  assert.equal(oa.result, 'FAIL');
  for (const name of ['result.json', 'verification.log']) {
    assert.ok(!fs.readFileSync(path.join(a.out, name), 'utf8').includes('sk-ant-'));
  }
  const b = makeFixture(t);
  fs.writeFileSync(path.join(b.repo, 'config', 'champion-baseline.json'), 'sk-ant-' + 'a1s2d3f4g5'.repeat(2) + '{', 'utf8');
  const ob = runFixture(b);
  assert.equal(ob.result, 'FAIL');
  assert.ok(!fs.readFileSync(path.join(b.out, 'result.json'), 'utf8').includes('sk-ant-'));
});

test('keys implying secret hashes or prefixes are rejected; declaration names are allowed', (t) => {
  for (const key of ['token_sha256', 'secret_prefix', 'auth_hash', 'api_key_len', 'credential-fingerprint']) {
    assert.ok(scanKeysForSecretLeaks({ meta: { [key]: 'deadbeef' } }).length >= 1, `expected key-name hit for ${key}`);
  }
  assert.equal(scanKeysForSecretLeaks({ auth: { secret_declarations: ['CLAUDE_CODE_OAUTH_TOKEN'] } }).length, 0);
  const fix = makeFixture(t, {
    mutateBaseline: (doc) => { doc.capabilities.generation.cli_version.token_sha256 = 'ab'.repeat(32); },
  });
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'FAIL');
  assert.ok(outcome.reasons.some((r) => r.includes('secret-like content')));
});

// ---------- read-only 保証 / artifact 出力 ----------

test('writing artifacts inside the repository is refused before any write', (t) => {
  const fix = makeFixture(t);
  const before = snapshotTree(fix.repo);
  assert.throws(() => run({ repoRoot: fix.repo, outDir: path.join(fix.repo, 'artifacts'), env: {} }), /refusing to write artifacts inside the repository/);
  assert.deepEqual(snapshotTree(fix.repo), before);
  assert.ok(isInsideRepo(path.join(fix.repo, '..artifacts'), fix.repo));
  assert.throws(() => run({ repoRoot: fix.repo, outDir: path.join(fix.repo, '..artifacts'), env: {} }), /refusing to write artifacts inside the repository/);
  assert.ok(!isInsideRepo(fix.out, fix.repo));
});

test('a full run never modifies the observed tree', (t) => {
  const fix = makeFixture(t);
  const before = snapshotTree(fix.repo);
  const outcome = runFixture(fix);
  assert.equal(outcome.result, 'PASS');
  assert.deepEqual(snapshotTree(fix.repo), before);
  for (const name of ['provenance.json', 'result.json', 'verification.log']) {
    assert.ok(fs.existsSync(path.join(fix.out, name)), `${name} must be written to the out dir`);
  }
});

// ---------- VOID / 安定schema / 結果規則 ----------

test('a missing material source yields VOID', (t) => {
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

test('an unrecognized baseline schema version yields HOLD', (t) => {
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
  const env = { GITHUB_RUN_ID: '12345', GITHUB_RUN_ATTEMPT: '2', RUNNER_OS: 'Linux', GITHUB_SHA: 'c'.repeat(40), ImageVersion: '20260801.1.0' };
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

test('CLI exit code contract: 0 on PASS, 1 on non-PASS, 2 on pre-observation errors', (t) => {
  const a = makeFixture(t);
  const ra = runCli(['--repo', a.repo, '--out', a.out]);
  assert.equal(ra.status, 0, ra.stderr + ra.stdout);
  for (const name of ['provenance.json', 'result.json', 'verification.log']) {
    assert.ok(fs.existsSync(path.join(a.out, name)), `${name} missing`);
  }

  const b = makeFixture(t);
  fs.rmSync(path.join(b.repo, 'smoke.mjs'));
  const rb = runCli(['--repo', b.repo, '--out', b.out]);
  assert.equal(rb.status, 1);
  assert.equal(JSON.parse(fs.readFileSync(path.join(b.out, 'result.json'), 'utf8')).result, 'VOID');

  const c = makeFixture(t);
  const before = snapshotTree(c.repo);
  const rc = runCli(['--repo', c.repo, '--out', path.join(c.repo, 'artifacts')]);
  assert.equal(rc.status, 2);
  assert.ok(rc.stderr.includes('refusing to write artifacts inside the repository'));
  assert.deepEqual(snapshotTree(c.repo), before);

  assert.equal(runCli(['--repo', c.repo, '--out', c.out, '--bogus']).status, 2);
  assert.equal(runCli(['--repo', c.repo, '--out']).status, 2);
});

// ---------- workflow paths ----------

test('the C0 workflow triggers on production-material-only changes', () => {
  const wf = fs.readFileSync(path.join(REPO_ROOT, '.github', 'workflows', 'c0-provenance.yml'), 'utf8');
  for (const [p, cls] of Object.entries(REQUIRED_MATERIALS)) {
    if (cls === 'production_material') {
      assert.ok(wf.includes(`- '${p}'`), `c0-provenance.yml pull_request paths must include ${p}`);
    }
  }
});

// ---------- verifier registry の完全性(1:1) ----------

test('every OBSERVED field in the real baseline has a registered verifier, 1:1, inside the manifest', () => {
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

// ---------- 実リポジトリ: canonical照合と end-to-end PASS ----------

function realCtx() {
  const sources = {};
  for (const [rel, cls] of Object.entries(REQUIRED_MATERIALS)) {
    if (cls === 'production_material') sources[rel] = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
  }
  return { factory: sources[FY], sources, facts: extractFactoryFacts(sources[FY]), scoped: extractScopedSecrets(sources[FY]) };
}

test('the real baseline deep-equals every canonical extraction from the real sources', () => {
  const real = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'config', 'champion-baseline.json'), 'utf8'));
  assert.equal(real.schema, SCHEMA_VERSION);
  assert.deepEqual(validateBaseline(real), []);
  assert.deepEqual(enforceManifest(real), []);
  assert.equal(scanKeysForSecretLeaks(real).length, 0);
  assert.equal(scanForSecrets(JSON.stringify(real)).length, 0);
  const res = verifyObservedFields(real, realCtx());
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

// ---------- 構造 mutation test ----------
// 実baselineの全OBSERVED fieldに対し、leaf改変・要素/キー削除・キー追加・
// source内に実在する別tokenへの置換、をそれぞれ適用し、verifier が全mutantを
// 拒否することを固定する。

function mutateLeaves(v) {
  if (typeof v === 'string') return v + 'X';
  if (typeof v === 'number') return v + 1;
  if (typeof v === 'boolean') return !v;
  if (Array.isArray(v)) return v.map(mutateLeaves);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, mutateLeaves(x)]));
  return v;
}

// source(factory.yml)内に verbatim に実在する別tokenへの置換値
function realTokenSubstitute(current) {
  return current === 'ubuntu-latest' ? 'factory' : 'ubuntu-latest';
}

function structuralMutants(value) {
  const muts = [['leaf-alter', mutateLeaves(value)]];
  if (typeof value === 'string') {
    muts.push(['real-token-substitute', realTokenSubstitute(value)]);
    return muts;
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const keys = Object.keys(value);
    if (keys.length > 0) {
      const clone = { ...value };
      delete clone[keys[0]];
      muts.push([`key-delete:${keys[0]}`, clone]);
    }
    muts.push(['key-add', { ...value, undeclared_extra: 'x' }]);
    for (const [k, v] of Object.entries(value)) {
      if (Array.isArray(v)) {
        if (v.length > 0) muts.push([`array-delete:${k}`, { ...value, [k]: v.slice(0, -1) }]);
        muts.push([`array-add:${k}`, { ...value, [k]: [...v, 'workflow_dispatch'] }]);
      } else if (typeof v === 'string') {
        muts.push([`real-token-substitute:${k}`, { ...value, [k]: realTokenSubstitute(v) }]);
      }
    }
  }
  return muts;
}

test('structural mutations of every OBSERVED value are rejected by the verifier registry', () => {
  const real = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'config', 'champion-baseline.json'), 'utf8'));
  const ctx = realCtx();
  let fieldCount = 0;
  let mutantCount = 0;
  const survivors = [];
  for (const [cap, fields] of Object.entries(real.capabilities)) {
    for (const [name, entry] of Object.entries(fields)) {
      if (entry.status !== 'OBSERVED') continue;
      fieldCount++;
      for (const [label, mutant] of structuralMutants(entry.value)) {
        mutantCount++;
        const doc = { capabilities: { [cap]: { [name]: { ...structuredClone(entry), value: mutant } } } };
        const res = verifyObservedFields(doc, ctx);
        if (res.problems.length === 0) survivors.push(`${cap}.${name} [${label}]`);
      }
    }
  }
  assert.equal(fieldCount, Object.keys(OBSERVED_VERIFIERS).length);
  assert.ok(mutantCount >= fieldCount * 2, `expected structural mutants, got ${mutantCount}`);
  assert.deepEqual(survivors, [], `mutants must never verify: ${survivors.join(', ')}`);
});

test('mutating any single OBSERVED value in the real baseline never PASSes a full run', (t) => {
  const real = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'config', 'champion-baseline.json'), 'utf8'));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'c0-mutate-'));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  const observedKeys = [];
  for (const [cap, fields] of Object.entries(real.capabilities)) {
    for (const [name, entry] of Object.entries(fields)) {
      if (entry.status === 'OBSERVED') observedKeys.push([cap, name]);
    }
  }
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
  const keys = observedKeys.map(([c, n]) => `${c}.${n}`);
  for (const required of [
    'generation.output_schema',
    'deterministic_verification.static_smoke',
    'deterministic_verification.interaction_smoke',
    'publish_runtime.publish_mechanism',
    'generation.auth_mechanism',
    'semantic_gate.auth_mechanism',
    'semantic_gate.verdict_contract',
  ]) {
    assert.ok(keys.includes(required), `mutation set must include ${required}`);
  }
});

// ---------- 実 baseline の no-guessing / UNKNOWN 降格規則 ----------

test('the real baseline never guesses; unverifiable fields are UNKNOWN with reasons', () => {
  const real = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'config', 'champion-baseline.json'), 'utf8'));
  const REQUIRED_UNKNOWN = {
    generation: [
      'effective_model_id', 'provider_model_revision', 'reasoning_configuration', 'provider_routing',
      'hidden_system_prompt', 'prompt_cache_state', 'token_usage', 'marginal_cost',
      'context_sources', 'permissions_and_sandbox',
    ],
    semantic_gate: [
      'effective_model_id', 'provider_model_revision', 'reasoning_configuration', 'provider_routing',
      'hidden_system_prompt', 'prompt_cache_state', 'token_usage', 'marginal_cost',
    ],
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
  // stableStringify がkey順に依存しないことの回帰
  assert.equal(stableStringify({ a: 1, b: [2, 3] }), stableStringify({ b: [2, 3], a: 1 }));
});
