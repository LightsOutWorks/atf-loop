#!/usr/bin/env node
// control-plane-canary.mjs — F3「Runtime Reads Control Plane」の read-only カナリア。
//
// 目的:
//   実行時に origin/<default branch>(通常 main)から 3 正本
//   (OS.md / CURRENT_STATE.md / ROADMAP.md)を読み、blob SHA を証拠として記録し、
//   prerequisite 済みで矛盾のない「実行可能な次 gate」を正確に 1 件だけ提案する。
//
// このカナリアは提案だけを行う。コード変更・branch 作成・PR 作成・merge・
// Production 実行は一切行わない(それらは後続 gate F4/F5 の能力)。
//
// fail-closed 規約(成功偽装の禁止):
//   - PASS  : 3 正本を読み、機械的矛盾なく提案を正確に 1 件導出できた
//   - FAIL  : 機械的矛盾(文書欠落・同一 field の多重定義・存在しない gate・
//             prerequisite 未達・evidence pin 不一致・提案が 0 件または 2 件以上)
//   - VOID  : repository / origin が読めず評価そのものが不能
//   - STALE : run 開始後に判断が依存する箇所が materially に変化した
//             (main SHA が動いただけでは STALE にしない)
//   - HOLD  : 意味判断が必要で決定論的に解決できない(散文 prerequisite、
//             未解釈 routing 文に現れる主候補、否定・矛盾を含む曖昧な PASS 記述、
//             materiality 判定不能 等)
//
// 意味理解の偽装をしない: この実装が検出するのは機械的矛盾だけである。
// 正規表現で解決できない意味判断が必要になった時点で HOLD へ倒す。
//
// 制御文書は常に git object(origin/<default branch> の commit)から読む。
// worktree のファイルは読まない。PR 上で実行しても PR 側の改変版は判断に使わせない。
//
// artifact は repository 外(既定: OS の一時領域、CI では $RUNNER_TEMP 配下)へ
// JSON で書く。成功・失敗にかかわらず必ず書く。

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const SCHEMA_VERSION = 'atf.control-plane-canary/1.1.0';
export const CONTROL_DOCS = ['OS.md', 'CURRENT_STATE.md', 'ROADMAP.md'];
export const FACTORY_WORKFLOW = '.github/workflows/factory.yml';
export const WATCHED_FILES = [...CONTROL_DOCS, FACTORY_WORKFLOW];

export const EXIT_CODES = { PASS: 0, FAIL: 1, VOID: 2, STALE: 3, HOLD: 4 };

// gate ID の表記(W0 / W0A / F3 / C0 / X1 …)。ダッシュは — – - の 3 種を許容する。
const GATE_ID_SRC = '[A-Z]\\d+[A-Z]?';
const DASH_SRC = '[—–-]';

// PASS 証拠の判定に使う否定語(deny-list・heuristic)。
// 明示宣言(下記の厳密文法)と否定語入り共起行が同居する gate は矛盾として扱う。
const NEGATION_TOKENS = [
  'していない', 'してない', 'ではない', 'ではありません', 'せず', '未',
  'not yet', 'has not', "hasn't", 'NOT PASS',
];

// ---------- 汎用 ----------

export function blobSha(content) {
  const buf = Buffer.from(content, 'utf8');
  return createHash('sha1')
    .update(`blob ${buf.length}\0`)
    .update(buf)
    .digest('hex');
}

function normalizeBody(text) {
  return text
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .join('\n')
    .trim();
}

// ---------- Markdown 解析(決定論・heading ベース) ----------

export function parseHeadings(text) {
  const lines = text.split('\n');
  const headings = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{1,6})\s+(.*?)\s*$/.exec(line);
    if (m) headings.push({ index: i, level: m[1].length, text: m[2] });
  }
  return { lines, headings };
}

// predicate に一致する heading と、その配下 body(次の同レベル以下 heading まで)を返す。
export function extractSections(text, predicate) {
  const { lines, headings } = parseHeadings(text);
  return headings
    .filter((h) => predicate(h))
    .map((h) => {
      const next = headings.find((h2) => h2.index > h.index && h2.level <= h.level);
      const end = next ? next.index : lines.length;
      return {
        heading: h.text,
        level: h.level,
        line: h.index + 1,
        body: lines.slice(h.index + 1, end).join('\n'),
      };
    });
}

function gateIdsIn(text) {
  return [...text.matchAll(new RegExp(`(?<![A-Za-z0-9])(${GATE_ID_SRC})(?![A-Za-z0-9])`, 'g'))].map(
    (m) => m[1],
  );
}

// ---------- ROADMAP.md ----------

// 「#### F0 — タイトル」形式の gate 定義を列挙する。多重定義は機械的矛盾。
export function parseRoadmapGates(roadmapText) {
  const re = new RegExp(`^(${GATE_ID_SRC})\\s*${DASH_SRC}\\s*(.+)$`);
  const sections = extractSections(roadmapText, (h) => re.test(h.text));
  const gates = new Map();
  const duplicates = [];
  for (const s of sections) {
    const m = re.exec(s.heading);
    const id = m[1];
    const title = m[2].trim();
    if (gates.has(id)) duplicates.push(id);
    else gates.set(id, { id, title, body: s.body, line: s.line });
  }
  return { gates, duplicates };
}

// gate 定義配下の明示的な「Prerequisite:」ブロックを解析する。
// 「Prerequisite:」単独行 + リスト、太字、「Prerequisite: <本文>」の inline 形式を許容する。
const PREREQ_HEADER_RE = /^(?:\*\*)?Prerequisites?(?:\*\*)?\s*[::]?\s*(.*)$/i;

// 同一 gate に複数の Prerequisite ブロックがあっても全件を返す(最初のブロックだけを
// 読んで後続の未達条件を無視しない)。加えて、header にもリスト項目にも属さないのに
// prerequisite に言及する行(解析不能な言及)を unconsumedMentionLines として返す。
export function parsePrereqBlocks(gateBody) {
  const lines = gateBody.split('\n');
  const blocks = [];
  const consumed = new Set();
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!PREREQ_HEADER_RE.test(t)) continue;
    consumed.add(i);
    const items = [];
    const inline = PREREQ_HEADER_RE.exec(t)[1].trim();
    if (inline !== '') items.push(inline);
    for (let j = i + 1; j < lines.length; j++) {
      const u = lines[j].trim();
      if (u === '') continue;
      if (/^[-*]\s+/.test(u)) {
        items.push(u.replace(/^[-*]\s+/, ''));
        consumed.add(j);
      } else break;
    }
    blocks.push({ header: t, items });
  }
  const unconsumedMentionLines = lines
    .map((l, i) => ({ line: l.trim(), i }))
    .filter(({ line, i }) => !consumed.has(i) && /\bPrerequisites?\b/i.test(line))
    .map(({ line }) => line);
  return { blocks, unconsumedMentionLines };
}

// 後方互換 wrapper: 全ブロックの項目を平坦化して返す(ブロックが無ければ null)。
export function parseExplicitPrereqs(gateBody) {
  const { blocks } = parsePrereqBlocks(gateBody);
  if (blocks.length === 0) return null;
  return blocks.flatMap((b) => b.items);
}

// 「独立lane / 独立canary として候補」と明記された文か(candidacy 指定として解釈済み扱い)
function isIndependentDesignation(text) {
  return /独立\s*(lane|レーン|canary|カナリア)/i.test(text) && /候補/.test(text);
}

// 依存順序 section(Dependency-Safe Routing)から「A → B → C」の矢印連鎖を
// 機械的に読む。「W2 / W3 → W4」のような並記は保守的に「両方とも前提」とみなす。
//
// 矢印の無い散文(例:「F4はF3の後」)は意味解釈しない。代わりに、gate ID を含むのに
// 連鎖としても candidacy 指定としても解釈できなかった文を「未解釈 routing 文」として
// 全件収集する。そこに現れる gate は前提を決定論的に検証できないため、主候補なら
// HOLD、候補なら eligible から除外する(fail-closed。散文を無視して PASS しない)。
export function parseDependencyChains(roadmapText) {
  const sections = extractSections(roadmapText, (h) => /Dependency-Safe Routing|依存順序/i.test(h.text));
  const chains = [];
  const skippedArrowSentences = [];
  const proseSentences = []; // { sentence, ids } — 未解釈 routing 文
  for (const sec of sections) {
    for (const rawLine of sec.body.split('\n')) {
      for (const rawSentence of rawLine.split('。')) {
        const sentence = rawSentence.trim();
        if (sentence === '') continue;
        const ids = [...new Set(gateIdsIn(sentence))];
        if (sentence.includes('→')) {
          const positions = sentence.split('→').map((seg) => gateIdsIn(seg));
          if (positions.some((p) => p.length === 0)) {
            // gate ID を含まない区間が混ざる連鎖は位置が揃わないため使わない(fail-safe)。
            skippedArrowSentences.push(sentence);
            if (ids.length > 0) proseSentences.push({ sentence, ids });
            continue;
          }
          chains.push(positions);
          continue;
        }
        if (ids.length === 0) continue;
        if (isIndependentDesignation(sentence)) continue; // candidacy 指定として解釈済み
        proseSentences.push({ sentence, ids });
      }
    }
  }
  return { chains, sectionCount: sections.length, skippedArrowSentences, proseSentences };
}

// 矢印連鎖から「gate → その直前段の gate 群(=前提)」を引く。
export function chainPrereqsOf(chains, gateId) {
  const prereqs = new Set();
  for (const chain of chains) {
    for (let i = 1; i < chain.length; i++) {
      if (chain[i].includes(gateId)) for (const p of chain[i - 1]) prereqs.add(p);
    }
  }
  return [...prereqs];
}

// ---------- CURRENT_STATE.md ----------

// Smallest Next Gate section から主候補(太字宣言 **W0 — …**)と
// 独立 lane 候補(「独立」を含む行の gate ID)を読む。
export function parseSmallestNextGate(currentStateText) {
  const sections = extractSections(currentStateText, (h) => /smallest next gate/i.test(h.text));
  const declRe = new RegExp(`^\\*\\*(${GATE_ID_SRC})\\s*${DASH_SRC}\\s*(.+?)\\*\\*$`);
  const parsed = sections.map((sec) => {
    const declarations = [];
    const independentLines = [];
    let singleGateRuleQuote = null;
    for (const rawLine of sec.body.split('\n')) {
      const line = rawLine.trim();
      const m = declRe.exec(line);
      if (m) declarations.push({ id: m[1], title: m[2].replace(/[。.]+$/, '').trim() });
      // 「独立lane / 独立canary として候補」と明記された行だけを拾う(「独立した〜」等の散文は対象外)
      if (isIndependentDesignation(line)) independentLines.push(line);
      if (/1\s*件/.test(line) || /1件/.test(line)) singleGateRuleQuote = line;
    }
    return { section: sec, declarations, independentLines, singleGateRuleQuote };
  });
  return { sections: parsed, sectionCount: sections.length };
}

// PASS 証拠として認める厳密文法: gate result/status の明示宣言だけ。
//   <gate ID> + 接続子(は / : / ： / = / — / – / - / | / 空白)+ PASS +
//   直後が行末または区切り記号(。 . 、 , ) ） 」 』 ] | *)のもの。
//   例: 「OS正本化F0はPASS。」「W0: PASS」「| F0 | PASS |」
// 「W0 PASS条件は計測中」のような同一行の単なる文字列共起は証拠にしない。
const STRICT_PASS_RE = new RegExp(
  `(?<![A-Za-z0-9])(${GATE_ID_SRC})\\s*(?:は|:|：|=|—|–|-|\\|)?\\s*(?:\\*\\*)?PASS(?:\\*\\*)?(?=\\s*(?:$|[。.、,)）」』\\]|*]))`,
  'g',
);

// gate ごとの PASS 記録を 3 区分で列挙する。
//   explicitLines … 厳密文法に一致する明示宣言(否定語を含む行は除く)= 唯一の PASS 証拠
//   negatedLines  … gate ID と PASS が共起し否定語を含む行(証拠にならない。明示宣言と同居すれば矛盾)
//   proseLines    … その他の共起行(証拠にならない。監査用に記録のみ)
export function parsePassMarkers(currentStateText) {
  const markers = new Map();
  const get = (id) => {
    if (!markers.has(id)) markers.set(id, { explicitLines: [], negatedLines: [], proseLines: [] });
    return markers.get(id);
  };
  for (const rawLine of currentStateText.split('\n')) {
    if (!/(?<![A-Za-z])PASS(?![A-Za-z])/.test(rawLine)) continue;
    const line = rawLine.trim();
    const negated = NEGATION_TOKENS.some((t) => rawLine.includes(t));
    const explicitIds = new Set([...rawLine.matchAll(STRICT_PASS_RE)].map((m) => m[1]));
    for (const id of new Set(gateIdsIn(rawLine))) {
      const m = get(id);
      if (negated) m.negatedLines.push(line);
      else if (explicitIds.has(id)) m.explicitLines.push(line);
      else m.proseLines.push(line);
    }
  }
  return markers;
}

// Evidence Index 等の「blob `…`」pin を OS.md / factory.yml について読む。
// 同一ファイルへ異なる pin が 2 つ以上あれば多重定義として矛盾扱い。
export function parseEvidencePins(currentStateText) {
  const pins = { 'OS.md': new Set(), [FACTORY_WORKFLOW]: new Set() };
  for (const line of currentStateText.split('\n')) {
    const m = /blob[:\s]*`([0-9a-f]{40})`/.exec(line);
    if (!m) continue;
    if (/OS\.md/.test(line)) pins['OS.md'].add(m[1]);
    else if (line.includes('factory.yml')) pins[FACTORY_WORKFLOW].add(m[1]);
  }
  return {
    'OS.md': [...pins['OS.md']],
    [FACTORY_WORKFLOW]: [...pins[FACTORY_WORKFLOW]],
  };
}

// ---------- OS.md ----------

// 選定根拠と停止条件の anchor になる section。存在と一意性を必須とする。
const OS_REQUIRED_ANCHORS = [
  { key: 'goalFirst', pattern: /goal first/i, label: 'Goal First' },
  { key: 'evidenceDriven', pattern: /evidence driven/i, label: 'Evidence Driven' },
  { key: 'reviewAlgorithm', pattern: /review algorithm/i, label: 'Review Algorithm' },
];

export function parseOsAnchors(osText) {
  const anchors = {};
  const counts = {};
  for (const { key, pattern } of OS_REQUIRED_ANCHORS) {
    const sections = extractSections(osText, (h) => pattern.test(h.text));
    counts[key] = sections.length;
    anchors[key] = sections[0] ?? null;
  }
  // Operating Rule(§18)は停止条件の引用元。任意(無くても FAIL にしない)。
  const op = extractSections(osText, (h) => /operating rule/i.test(h.text));
  anchors.operatingRule = op[0] ?? null;
  counts.operatingRule = op.length;
  return { anchors, counts };
}

// ---------- 統合解析(純関数) ----------

function firstMeaningfulLine(sectionOrNull) {
  if (!sectionOrNull) return null;
  return sectionOrNull.body.split('\n').map((l) => l.trim()).find((l) => l !== '') ?? null;
}

// docs: { 'OS.md': string|null, … }  actualBlobs: { 'OS.md': sha|null, …, FACTORY_WORKFLOW: sha|null }
export function analyzeControlPlane(docs, actualBlobs = null) {
  const problems = []; // 機械的矛盾 → FAIL
  const holds = []; // 意味判断が必要で解決不能 → HOLD
  const unknowns = [];
  const notes = [];

  const missing = CONTROL_DOCS.filter((d) => typeof docs?.[d] !== 'string' || docs[d].trim() === '');
  if (missing.length > 0) {
    problems.push(`正本が欠落: ${missing.join(', ')}`);
    return {
      problems, holds, unknowns, notes,
      requiredSections: null, primary: null, independentLaneCandidates: [],
      gatesDefined: [], passMarkers: [], prerequisites: {}, eligible: [],
      uninterpretedRoutingSentences: [],
      evidencePins: null, rationale: [], stopConditions: [], signatureParts: null,
    };
  }

  const osText = docs['OS.md'];
  const stateText = docs['CURRENT_STATE.md'];
  const roadmapText = docs['ROADMAP.md'];

  // --- 必須 section の存在・一意性 ---
  const { anchors: osAnchors, counts: osCounts } = parseOsAnchors(osText);
  const sng = parseSmallestNextGate(stateText);
  const { gates, duplicates: dupGates } = parseRoadmapGates(roadmapText);
  const deps = parseDependencyChains(roadmapText);

  const requiredSections = {
    'OS.md': Object.fromEntries(
      OS_REQUIRED_ANCHORS.map(({ key, label }) => [label, { count: osCounts[key], ok: osCounts[key] === 1 }]),
    ),
    'CURRENT_STATE.md': {
      'Smallest Next Gate': { count: sng.sectionCount, ok: sng.sectionCount === 1 },
    },
    'ROADMAP.md': {
      'gate definitions (#### <ID> — …)': { count: gates.size, ok: gates.size >= 1 && dupGates.length === 0 },
      'Dependency-Safe Routing / 依存順序': { count: deps.sectionCount, ok: deps.sectionCount === 1 },
    },
  };
  for (const { key, label } of OS_REQUIRED_ANCHORS) {
    if (osCounts[key] === 0) problems.push(`OS.md に必須 section「${label}」が無い`);
    if (osCounts[key] > 1) problems.push(`OS.md の section「${label}」が多重定義(${osCounts[key]} 箇所)`);
  }
  if (sng.sectionCount === 0) problems.push('CURRENT_STATE.md に「Smallest Next Gate」section が無い');
  if (sng.sectionCount > 1) problems.push(`CURRENT_STATE.md の「Smallest Next Gate」section が多重定義(${sng.sectionCount} 箇所)`);
  if (gates.size === 0) problems.push('ROADMAP.md に gate 定義(#### <ID> — …)が 1 件も無い');
  if (dupGates.length > 0) problems.push(`ROADMAP.md の gate 定義が多重: ${[...new Set(dupGates)].join(', ')}`);
  if (deps.sectionCount === 0) problems.push('ROADMAP.md に依存順序(Dependency-Safe Routing)section が無い');
  if (deps.sectionCount > 1) problems.push(`ROADMAP.md の依存順序 section が多重定義(${deps.sectionCount} 箇所)`);
  if (deps.skippedArrowSentences.length > 0) {
    notes.push(`依存順序内で位置が揃わず解釈しなかった矢印文: ${deps.skippedArrowSentences.join(' / ')}`);
  }

  // --- 主候補(Smallest Next Gate) ---
  let primary = null;
  const sngSection = sng.sections[0] ?? null;
  if (sng.sectionCount === 1) {
    const decls = sngSection.declarations;
    if (decls.length === 0) problems.push('Smallest Next Gate section に gate 宣言(**<ID> — …**)が無い(提案 0 件)');
    else if (decls.length > 1) problems.push(`Smallest Next Gate の gate 宣言が多重定義: ${decls.map((d) => d.id).join(', ')}(提案は正確に 1 件でなければならない)`);
    else primary = decls[0];
  }

  // --- 独立 lane 候補(機械抽出。heuristic のため不整合は soft に扱う) ---
  const independentSet = new Set();
  if (sngSection) for (const line of sngSection.independentLines) for (const id of gateIdsIn(line)) independentSet.add(id);
  // ROADMAP 依存順序側の「独立 … 候補」行も同様に読む。
  const depSec = extractSections(roadmapText, (h) => /Dependency-Safe Routing|依存順序/i.test(h.text))[0];
  if (depSec) {
    for (const rawLine of depSec.body.split('\n')) {
      if (isIndependentDesignation(rawLine)) {
        for (const id of gateIdsIn(rawLine)) independentSet.add(id);
      }
    }
  }
  if (primary) independentSet.delete(primary.id);
  const independentLaneCandidates = [...independentSet];

  // --- PASS 記録・evidence pin ---
  const passMarkers = parsePassMarkers(stateText);
  const pinSets = parseEvidencePins(stateText);
  const evidencePins = {};
  for (const [file, values] of Object.entries(pinSets)) {
    if (values.length > 1) problems.push(`CURRENT_STATE.md の evidence pin が多重定義: ${file}(${values.join(', ')})`);
    evidencePins[file] = values.length === 1 ? values[0] : null;
    if (values.length === 0) unknowns.push(`CURRENT_STATE.md に ${file} の blob pin が見つからない(照合せず継続)`);
  }
  if (actualBlobs) {
    for (const file of ['OS.md', FACTORY_WORKFLOW]) {
      const pin = evidencePins[file];
      const actual = actualBlobs[file] ?? null;
      if (pin && actual && pin !== actual) {
        problems.push(`evidence pin 不一致: ${file} の pin ${pin} ≠ 実 blob ${actual}(CURRENT_STATE.md が main に対して古い)`);
      }
      if (pin && !actual) unknowns.push(`${file} の実 blob を確認できず pin を照合できない`);
    }
  }

  // --- prerequisite 照合(主候補 + 独立候補) ---
  // PASS 記録の状態:
  //   satisfied … 厳密文法の明示宣言があり、否定語入り共起行が無い(唯一の充足根拠)
  //   ambiguous … 明示宣言と否定語入り共起行が同居(矛盾。意味判断が必要 → HOLD)
  //   absent    … 明示宣言なし(否定文・単なる文字列共起は証拠にしない → 未達)
  const markerStateOf = (gid) => {
    const m = passMarkers.get(gid);
    if (!m || m.explicitLines.length === 0) return 'absent';
    if (m.negatedLines.length > 0) return 'ambiguous';
    return 'satisfied';
  };
  const markerLinesOf = (gid) => {
    const m = passMarkers.get(gid);
    return m ? [...m.explicitLines, ...m.negatedLines] : [];
  };

  const prerequisites = {};
  const evalGate = (id) => {
    const entry = {
      definedInRoadmap: gates.has(id),
      chain: chainPrereqsOf(deps.chains, id),
      explicit: null,
      unmetChain: [],
      ambiguousChain: [],
      unverifiableExplicit: [],
      unmetExplicit: [],
      ambiguousExplicit: [],
      proseRoutingMentions: deps.proseSentences.filter((p) => p.ids.includes(id)).map((p) => p.sentence),
      unparsedPrereqMention: false,
      alreadyPassMarked: false,
      selfMarkerAmbiguous: false,
      eligible: false,
    };
    if (gates.has(id)) {
      const body = gates.get(id).body;
      // 複数の Prerequisite ブロックを全件解析する(最初のブロックだけで打ち切らない)
      const { blocks, unconsumedMentionLines } = parsePrereqBlocks(body);
      const ex = blocks.length > 0 ? blocks.flatMap((b) => b.items) : null;
      entry.explicit = ex;
      entry.prereqBlockCount = blocks.length;
      if (ex) {
        for (const item of ex) {
          const ids = gateIdsIn(item);
          if (ids.length === 0) entry.unverifiableExplicit.push(item);
          else for (const pid of ids) {
            const st = markerStateOf(pid);
            if (st === 'satisfied') continue;
            if (st === 'ambiguous') entry.ambiguousExplicit.push(`${pid}(${item})`);
            else entry.unmetExplicit.push(`${pid}(${item})`);
          }
        }
      }
      // 項目ゼロのブロック、またはブロック外での prerequisite 言及は解析不能 → 検証不能扱い
      if (blocks.some((b) => b.items.length === 0) || unconsumedMentionLines.length > 0) {
        entry.unparsedPrereqMention = true;
      }
    }
    for (const pid of entry.chain) {
      const st = markerStateOf(pid);
      if (st === 'satisfied') continue;
      if (st === 'ambiguous') entry.ambiguousChain.push(pid);
      else entry.unmetChain.push(pid);
    }
    const selfState = markerStateOf(id);
    entry.alreadyPassMarked = selfState === 'satisfied';
    entry.selfMarkerAmbiguous = selfState === 'ambiguous';
    entry.eligible =
      entry.definedInRoadmap &&
      !entry.alreadyPassMarked &&
      !entry.selfMarkerAmbiguous &&
      entry.unmetChain.length === 0 &&
      entry.ambiguousChain.length === 0 &&
      entry.unmetExplicit.length === 0 &&
      entry.ambiguousExplicit.length === 0 &&
      entry.unverifiableExplicit.length === 0 &&
      !entry.unparsedPrereqMention &&
      entry.proseRoutingMentions.length === 0;
    prerequisites[id] = entry;
    return entry;
  };

  if (primary) {
    const e = evalGate(primary.id);
    if (!e.definedInRoadmap) problems.push(`存在しない gate: 主候補 ${primary.id} が ROADMAP.md に定義されていない`);
    else {
      if (e.alreadyPassMarked) {
        problems.push(`矛盾: 主候補 ${primary.id} は CURRENT_STATE.md 上で既に PASS と記録されている(該当行: ${markerLinesOf(primary.id).join(' / ')})`);
      }
      if (e.unmetChain.length > 0) problems.push(`prerequisite 未達: 主候補 ${primary.id} の前提 ${e.unmetChain.join(', ')} に PASS 記録が無い`);
      if (e.unmetExplicit.length > 0) problems.push(`prerequisite 未達: 主候補 ${primary.id} の明示前提 ${e.unmetExplicit.join(', ')} に PASS 記録が無い`);
      if (e.selfMarkerAmbiguous) {
        holds.push(`主候補 ${primary.id} の PASS 記録が矛盾または曖昧(該当行: ${markerLinesOf(primary.id).join(' / ')})`);
      }
      if (e.ambiguousChain.length > 0) holds.push(`前提 ${e.ambiguousChain.join(', ')} の PASS 記述が否定語を含むか矛盾しており曖昧(意味判断が必要)`);
      if (e.ambiguousExplicit.length > 0) holds.push(`明示前提 ${e.ambiguousExplicit.join(', ')} の PASS 記述が曖昧(意味判断が必要)`);
      if (e.unverifiableExplicit.length > 0) holds.push(`主候補 ${primary.id} の明示 prerequisite が散文で機械検証不能: ${e.unverifiableExplicit.join(' / ')}`);
      if (e.unparsedPrereqMention) holds.push(`主候補 ${primary.id} の ROADMAP 本文が prerequisite に言及するが機械解析できない(fail-closed)`);
      if (e.proseRoutingMentions.length > 0) {
        holds.push(`主候補 ${primary.id} が依存順序 section の未解釈 routing 文(散文)に現れ、前提を決定論的に検証できない: ${e.proseRoutingMentions.join(' / ')}`);
      }
    }
  }
  for (const id of independentLaneCandidates) {
    const e = evalGate(id);
    if (!e.definedInRoadmap) unknowns.push(`独立 lane 候補 ${id} が ROADMAP.md に未定義(候補から除外。抽出は heuristic のため FAIL にはしない)`);
  }

  const eligible = Object.entries(prerequisites)
    .filter(([, e]) => e.eligible)
    .map(([id]) => id)
    .sort();

  // --- 選定根拠(OS: Goal First / Evidence Driven / 停止条件)。引用は実文書から取る ---
  const rationale = [];
  if (sngSection?.singleGateRuleQuote) {
    rationale.push({ principle: '1 run 1 gate 選択規則', source: 'CURRENT_STATE.md § Smallest Next Gate', quote: sngSection.singleGateRuleQuote });
  }
  const authorityLine = depSec?.body.split('\n').map((l) => l.trim()).find((l) => l.includes('CURRENT_STATE.md') && (l.includes('だけ') || l.includes('only')));
  if (authorityLine) {
    rationale.push({ principle: '次 gate の正本は CURRENT_STATE.md', source: 'ROADMAP.md § Dependency-Safe Routing', quote: authorityLine });
  }
  for (const [key, label, source] of [
    ['goalFirst', 'Goal First', 'OS.md § Goal First'],
    ['evidenceDriven', 'Evidence Driven Governance', 'OS.md § Evidence Driven'],
    ['reviewAlgorithm', 'Review Algorithm (IOS §15)', 'OS.md § Review Algorithm'],
  ]) {
    const q = firstMeaningfulLine(osAnchors[key]);
    if (q) rationale.push({ principle: label, source, quote: q });
  }

  const stopConditions = [
    'FAIL: 機械的矛盾(文書欠落 / 同一 field の多重定義 / 存在しない gate / prerequisite 未達 / evidence pin 不一致 / 提案が 0 件または 2 件以上)',
    'HOLD: 意味判断が必要で決定論的に解決できない(散文 prerequisite / 未解釈 routing 文に現れる主候補 / 否定・矛盾を含む曖昧な PASS 記述 / materiality 判定不能)',
    'STALE: run 開始後の diff が対象 assertion・Smallest Next Gate・prerequisite・PASS 条件・依存 evidence を変えた',
    'VOID: repository または origin/<default branch> を読めず評価不能',
  ];
  const opQuote = firstMeaningfulLine(osAnchors.operatingRule);
  if (opQuote) stopConditions.push(`OS Operating Rule: ${opQuote}`);

  // 恒常的な既知の限界(意味理解の偽装をしない旨の明示)
  unknowns.push('矢印連鎖の無い散文の routing 文は意味解釈しない。gate ID を含む未解釈 routing 文に現れる gate は前提を検証できないため、主候補なら HOLD、候補なら eligible から除外する(fail-closed)');
  unknowns.push('PASS 証拠は「<gate ID> は/:/=/| PASS」形式の明示宣言だけを認める厳密文法。文法外の正当な status 表記(例: PASSした)は証拠と認められず未達側へ倒れる(fail-closed)');
  unknowns.push('独立 lane 候補の列挙は「独立lane/独立canary」明記行からの正規表現抽出(heuristic)であり、意味理解ではない');
  unknowns.push('依存順序の「A / B」並記は保守的に「両方とも前提」と解釈する');
  unknowns.push('提案 gate の実行に人間専権(identity / credentials 等)が必要かは機械判定できない。本カナリアは提案のみで実行しない');

  // --- materiality 署名: 判断が依存する部分だけを取り出す ---
  const primaryGateDef = primary && gates.has(primary.id) ? gates.get(primary.id) : null;
  const signatureParts = {
    primary: primary?.id ?? null,
    smallestNextGateSection: sngSection ? normalizeBody(sngSection.section.body) : null,
    primaryRoadmapSection: primaryGateDef ? normalizeBody(primaryGateDef.body) : null,
    dependencyChains: deps.chains,
    // 未解釈 routing 文(散文の依存)も判断が依存する要素。run 中の書き換えは materially stale
    uninterpretedRoutingSentences: deps.proseSentences,
    primaryPrereqs: primary ? prerequisites[primary.id] ?? null : null,
    // 候補資格も判断が依存する要素: eligible・独立 lane 候補・全 gate の除外理由
    // (prerequisites entry)を含め、run 中に候補資格が変われば materially stale にする
    eligible: [...eligible],
    independentLaneCandidates: [...independentLaneCandidates].sort(),
    prerequisitesByGate: Object.keys(prerequisites)
      .sort()
      .map((id) => [id, prerequisites[id]]),
    passMarkers: [...passMarkers.entries()]
      .map(([id, m]) => ({
        id,
        explicit: m.explicitLines.length > 0,
        negated: m.negatedLines.length > 0,
        prose: m.proseLines.length > 0,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    evidencePins,
    osAnchors: Object.fromEntries(
      ['goalFirst', 'evidenceDriven', 'reviewAlgorithm', 'operatingRule'].map((k) => [
        k,
        osAnchors[k] ? normalizeBody(osAnchors[k].body) : null,
      ]),
    ),
    factoryBlob: actualBlobs?.[FACTORY_WORKFLOW] ?? null,
  };

  return {
    problems, holds, unknowns, notes,
    requiredSections,
    primary,
    independentLaneCandidates,
    gatesDefined: [...gates.keys()],
    passMarkers: signatureParts.passMarkers,
    prerequisites,
    eligible,
    uninterpretedRoutingSentences: deps.proseSentences,
    evidencePins,
    rationale,
    stopConditions,
    signatureParts,
  };
}

export function materialSignature(analysis) {
  return JSON.stringify(analysis.signatureParts);
}

// 解析結果から result を決める。提案は「主候補が eligible な場合のその 1 件」だけ。
// 主候補が使えない時に独立候補へ勝手に乗り換えることはしない(順位付けは意味判断)。
export function decide(analysis) {
  const proposals = [];
  if (
    analysis.primary &&
    analysis.problems.length === 0 &&
    analysis.holds.length === 0 &&
    analysis.prerequisites[analysis.primary.id]?.eligible
  ) {
    proposals.push(analysis.primary);
  }

  let result;
  let failureReason = null;
  if (analysis.problems.length > 0) {
    result = 'FAIL';
    failureReason = analysis.problems.join(' / ');
  } else if (analysis.holds.length > 0) {
    result = 'HOLD';
    failureReason = analysis.holds.join(' / ');
  } else if (proposals.length !== 1) {
    // 提案 0 件・2 件以上は fail-closed(2 件以上は解析段階で problems 化されるが最終ガードを置く)
    result = 'FAIL';
    failureReason = `提案が正確に 1 件でない(${proposals.length} 件)`;
  } else {
    result = 'PASS';
  }

  return {
    result,
    failureReason,
    proposal: result === 'PASS' ? { gate: proposals[0].id, title: proposals[0].title, source: 'CURRENT_STATE.md § Smallest Next Gate' } : null,
    proposalCount: result === 'PASS' ? 1 : proposals.length,
  };
}

// 開始 snapshot と最終 fetch 後の再解析を比較し、materially stale かを決める。
// endAnalysis が解析不能(problems で signature が意味を成さない)なら判定不能 → stale 扱い。
export function compareForStaleness(startAnalysis, endAnalysis) {
  if (!startAnalysis?.signatureParts || !endAnalysis?.signatureParts) {
    return { materiallyStale: true, reason: '開始時または変更後の文書を解析できず materiality を判定できない(fail-closed で STALE)' };
  }
  const a = startAnalysis.signatureParts;
  const b = endAnalysis.signatureParts;
  const diffKeys = Object.keys(a).filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
  if (diffKeys.length === 0) return { materiallyStale: false, reason: null, diffKeys: [] };
  return {
    materiallyStale: true,
    reason: `判断が依存する要素が変化: ${diffKeys.join(', ')}`,
    diffKeys,
  };
}

// ---------- git 層 ----------

function git(repoDir, args) {
  return execFileSync('git', args, {
    cwd: repoDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024,
  });
}

function tryGit(repoDir, args) {
  try {
    return { ok: true, out: git(repoDir, args) };
  } catch (e) {
    return { ok: false, error: String(e.stderr || e.message || e).trim() };
  }
}

export function detectDefaultBranch(repoDir, envv) {
  if (envv?.CONTROL_PLANE_CANARY_BRANCH) {
    return { branch: envv.CONTROL_PLANE_CANARY_BRANCH, how: 'env CONTROL_PLANE_CANARY_BRANCH' };
  }
  const sym = tryGit(repoDir, ['symbolic-ref', '--quiet', 'refs/remotes/origin/HEAD']);
  if (sym.ok) {
    const m = /refs\/remotes\/origin\/(.+)/.exec(sym.out.trim());
    if (m) return { branch: m[1], how: 'refs/remotes/origin/HEAD' };
  }
  const ls = tryGit(repoDir, ['ls-remote', '--symref', 'origin', 'HEAD']);
  if (ls.ok) {
    const m = /^ref:\s+refs\/heads\/(\S+)\s+HEAD/m.exec(ls.out);
    if (m) return { branch: m[1], how: 'git ls-remote --symref origin HEAD' };
  }
  const main = tryGit(repoDir, ['rev-parse', '--verify', '--quiet', 'refs/remotes/origin/main']);
  if (main.ok) return { branch: 'main', how: 'fallback: refs/remotes/origin/main が存在' };
  return null;
}

// git show の失敗を「path が存在しない(= 文書欠落として FAIL 系)」と
// 「それ以外の読み取り不能(= 評価不能 VOID 系)」に分類する。
const MISSING_PATH_RE = /(does not exist|exists on disk, but not in|invalid object name|bad revision|is in commit .* but not)/i;

function readBlobAt(repoDir, commitSha, filePath) {
  const content = tryGit(repoDir, ['show', `${commitSha}:${filePath}`]);
  const sha = tryGit(repoDir, ['rev-parse', '--verify', '--quiet', `${commitSha}:${filePath}`]);
  return {
    content: content.ok ? content.out : null,
    sha: sha.ok ? sha.out.trim() : null,
    hardError: !content.ok && content.error !== '' && !MISSING_PATH_RE.test(content.error) ? content.error : null,
  };
}

function snapshotAt(repoDir, commitSha) {
  const docs = {};
  const blobs = {};
  const hardErrors = [];
  for (const f of CONTROL_DOCS) {
    const r = readBlobAt(repoDir, commitSha, f);
    docs[f] = r.content;
    blobs[f] = r.sha;
    if (r.hardError) hardErrors.push(`${f}: ${r.hardError}`);
  }
  const fy = readBlobAt(repoDir, commitSha, FACTORY_WORKFLOW);
  blobs[FACTORY_WORKFLOW] = fy.sha;
  if (fy.hardError) hardErrors.push(`${FACTORY_WORKFLOW}: ${fy.hardError}`);
  return { docs, blobs, hardErrors };
}

// ---------- artifact ----------

function defaultArtifactPath(envv) {
  const base = envv?.RUNNER_TEMP || os.tmpdir();
  return path.join(base, 'control-plane-canary', 'artifact.json');
}

function writeArtifact(artifactPath, artifact) {
  fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
  fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2) + '\n');
}

// ---------- 本体 ----------

// options:
//   repoDir            … 対象 repo(既定: process.cwd())
//   artifactPath       … artifact JSON の出力先(repo 内は拒否し一時領域へ退避)
//   env                … 環境変数(既定: process.env)
//   fetch              … false で fetch を省略(既定 true)
//   afterStartSnapshot … テスト用 hook。開始 snapshot 取得後・最終 fetch 前に await される
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
      'PASS は「制御文書を origin/<default branch> から読み、機械的矛盾なく次 gate を正確に 1 件提案できた」というカナリア結果だけを意味する。提案 gate 自体の PASS や自動実装能力を意味しない。',
    run: {
      workflowRunId: envv.GITHUB_RUN_ID ?? null,
      runAttempt: envv.GITHUB_RUN_ATTEMPT ?? null,
      workflow: envv.GITHUB_WORKFLOW ?? null,
      eventName: envv.GITHUB_EVENT_NAME ?? null,
      repository: envv.GITHUB_REPOSITORY ?? null,
      nodeVersion: process.version,
    },
    git: {
      remote: 'origin',
      defaultBranch: null,
      defaultBranchDetection: null,
      mainShaAtStart: null,
      mainShaAtFinalFetch: null,
      fetchAtStart: 'skipped',
      fetchAtEnd: 'skipped',
    },
    blobs: { 'OS.md': null, 'CURRENT_STATE.md': null, 'ROADMAP.md': null, [FACTORY_WORKFLOW]: null },
    staleness: {
      materiallyStale: null,
      checkedHeadSha: null,
      changedPaths: null,
      changedWatchedFiles: null,
      reason: null,
    },
    requiredSections: null,
    evidencePins: null,
    gates: null,
    proposal: null,
    proposalCount: 0,
    selectionRationale: [],
    stopConditions: [],
    unknowns: [],
    notes: [],
  };

  // artifact は repository 内へ書かない(Runner の一時領域が既定)。
  let artifactPath = path.resolve(options.artifactPath ?? envv.CANARY_ARTIFACT_PATH ?? defaultArtifactPath(envv));
  if (artifactPath === repoDir || artifactPath.startsWith(repoDir + path.sep)) {
    const fallback = defaultArtifactPath(envv);
    artifact.notes.push(`指定 artifact path が repository 内のため拒否し ${fallback} へ退避`);
    artifactPath = fallback;
  }

  try {
    const isRepo = tryGit(repoDir, ['rev-parse', '--git-dir']);
    if (!isRepo.ok) {
      artifact.result = 'VOID';
      artifact.failureReason = `git repository を読めない: ${isRepo.error}`;
      return finish();
    }

    const det = detectDefaultBranch(repoDir, envv);
    if (!det) {
      artifact.result = 'VOID';
      artifact.failureReason = 'default branch を特定できない(origin/HEAD・ls-remote・origin/main のいずれも不可)';
      return finish();
    }
    const branch = det.branch;
    artifact.git.defaultBranch = branch;
    artifact.git.defaultBranchDetection = det.how;

    if (doFetch) {
      const f = tryGit(repoDir, ['fetch', '--quiet', 'origin', branch]);
      artifact.git.fetchAtStart = f.ok ? 'ok' : 'failed';
      if (!f.ok) artifact.unknowns.push(`開始時 fetch 失敗(既存の origin/${branch} 参照で継続): ${f.error}`);
    }
    const start = tryGit(repoDir, ['rev-parse', '--verify', `refs/remotes/origin/${branch}`]);
    if (!start.ok) {
      artifact.result = 'VOID';
      artifact.failureReason = `origin/${branch} を解決できない: ${start.error}`;
      return finish();
    }
    const startSha = start.out.trim();
    artifact.git.mainShaAtStart = startSha;

    // --- 開始 snapshot(worktree ではなく git object から読む) ---
    const snap = snapshotAt(repoDir, startSha);
    artifact.blobs = { ...snap.blobs };
    if (snap.hardErrors.length > 0) {
      // path 欠落ではない読み取り不能は「欠落 FAIL」に偽装せず評価不能として止める
      artifact.result = 'VOID';
      artifact.failureReason = `git object を読み取れない(評価不能): ${snap.hardErrors.join(' / ')}`;
      return finish();
    }
    const startAnalysis = analyzeControlPlane(snap.docs, snap.blobs);
    const startDecision = decide(startAnalysis);

    artifact.requiredSections = startAnalysis.requiredSections;
    artifact.evidencePins = startAnalysis.evidencePins;
    artifact.gates = {
      definedInRoadmap: startAnalysis.gatesDefined,
      primaryFromCurrentState: startAnalysis.primary,
      independentLaneCandidates: startAnalysis.independentLaneCandidates,
      passMarkers: startAnalysis.passMarkers,
      prerequisites: startAnalysis.prerequisites,
      eligible: startAnalysis.eligible,
      uninterpretedRoutingSentences: startAnalysis.uninterpretedRoutingSentences,
    };
    artifact.proposal = startDecision.proposal;
    artifact.proposalCount = startDecision.proposalCount;
    artifact.selectionRationale = startAnalysis.rationale;
    artifact.stopConditions = startAnalysis.stopConditions;
    artifact.unknowns.push(...startAnalysis.unknowns);
    artifact.notes.push(...startAnalysis.notes);
    artifact.result = startDecision.result;
    artifact.failureReason = startDecision.failureReason;
    if (snap.blobs[FACTORY_WORKFLOW] == null) {
      artifact.unknowns.push(`${FACTORY_WORKFLOW} が origin/${branch} に存在しない(blob 記録なし)`);
    }

    if (options.afterStartSnapshot) {
      await options.afterStartSnapshot({ repoDir, branch, startSha });
    }

    // --- 最終 fetch と staleness 判定 ---
    let endSha = startSha;
    if (doFetch) {
      const f2 = tryGit(repoDir, ['fetch', '--quiet', 'origin', branch]);
      artifact.git.fetchAtEnd = f2.ok ? 'ok' : 'failed';
      if (!f2.ok) {
        // 鮮度を再確認できないまま PASS を出さない(fail-closed)。
        artifact.unknowns.push(`最終 fetch 失敗: ${f2.error}`);
        if (artifact.result === 'PASS') {
          artifact.result = 'HOLD';
          artifact.failureReason = '最終 fetch に失敗し、run 中の main 変化(staleness)を再確認できない';
        }
        artifact.git.mainShaAtFinalFetch = null;
        return finish();
      }
      const end = tryGit(repoDir, ['rev-parse', '--verify', `refs/remotes/origin/${branch}`]);
      if (!end.ok) {
        // fetch は通ったのに参照を解決できない。startSha へ黙って倒さない(fail-closed)。
        artifact.unknowns.push(`最終 fetch 後の origin/${branch} 解決に失敗: ${end.error}`);
        if (artifact.result === 'PASS') {
          artifact.result = 'HOLD';
          artifact.failureReason = '最終 fetch 後に origin/<default branch> を解決できず、staleness を再確認できない';
        }
        artifact.git.mainShaAtFinalFetch = null;
        return finish();
      }
      endSha = end.out.trim();
    } else {
      artifact.git.fetchAtEnd = 'skipped';
    }
    artifact.git.mainShaAtFinalFetch = endSha;

    if (endSha === startSha) {
      artifact.staleness = {
        materiallyStale: false,
        checkedHeadSha: startSha,
        changedPaths: [],
        changedWatchedFiles: [],
        reason: 'run 中に origin/<default branch> は変化していない',
      };
      return finish();
    }

    // main SHA の変化だけでは STALE にしない。監視対象 4 ファイルの blob 変化と
    // materiality 署名(判断が依存する要素)の変化だけを見る。
    const diff = tryGit(repoDir, ['diff', '--name-only', `${startSha}..${endSha}`]);
    const changedPaths = diff.ok ? diff.out.split('\n').filter(Boolean) : null;
    const endSnap = snapshotAt(repoDir, endSha);
    const changedWatched = WATCHED_FILES.filter((f) => snap.blobs[f] !== endSnap.blobs[f]);
    artifact.staleness.changedPaths = changedPaths && changedPaths.length > 200
      ? [...changedPaths.slice(0, 200), `… 他 ${changedPaths.length - 200} 件`]
      : changedPaths;
    artifact.staleness.changedWatchedFiles = changedWatched;

    if (changedWatched.length === 0) {
      artifact.staleness.materiallyStale = false;
      artifact.staleness.checkedHeadSha = endSha;
      artifact.staleness.reason = `head は ${startSha} → ${endSha} へ動いたが、監視対象(3 正本 + factory.yml)の blob は不変。検査済み head を記録して継続`;
      return finish();
    }

    const endAnalysis = analyzeControlPlane(endSnap.docs, endSnap.blobs);
    const endParseFailed = endAnalysis.problems.length > 0 && startAnalysis.problems.length === 0;
    const cmp = endParseFailed
      ? { materiallyStale: true, reason: `変更後の文書に機械的矛盾があり materiality を判定できない: ${endAnalysis.problems.join(' / ')}` }
      : compareForStaleness(startAnalysis, endAnalysis);
    artifact.staleness.materiallyStale = cmp.materiallyStale;
    artifact.staleness.checkedHeadSha = endSha;
    if (cmp.materiallyStale) {
      artifact.staleness.reason = `materially stale: ${cmp.reason}(変更 blob: ${changedWatched.join(', ')})`;
      if (artifact.result === 'PASS') {
        artifact.result = 'STALE';
        artifact.failureReason = artifact.staleness.reason;
        artifact.proposal = null;
        artifact.proposalCount = 0;
      } else {
        artifact.notes.push(`開始時点の結果 ${artifact.result} に加え、run 中に materially stale な変更を検出: ${cmp.reason}`);
      }
    } else {
      artifact.staleness.reason = `監視対象 blob は変化(${changedWatched.join(', ')})したが、判断が依存する要素(materiality 署名)は不変。検査済み head を記録して継続`;
    }
    return finish();
  } catch (err) {
    // 想定外の失敗でも artifact は必ず残す(評価不能 = VOID)。
    artifact.result = 'VOID';
    artifact.failureReason = `想定外の失敗: ${err?.stack ?? String(err)}`;
    return finish();
  }

  function finish() {
    artifact.generatedAtUtc = new Date().toISOString();
    try {
      writeArtifact(artifactPath, artifact);
    } catch (writeErr) {
      // artifact は失敗時にも必ず残す。書けない場合は OS 一時領域へ退避を試みる
      const fallback = path.join(os.tmpdir(), `control-plane-canary-fallback-${process.pid}.json`);
      try {
        writeArtifact(fallback, artifact);
        artifactPath = fallback;
      } catch {
        console.error(`control-plane-canary: artifact を書き込めない(${String(writeErr)})。stdout の JSON を参照`);
      }
    }
    return { artifact, artifactPath, exitCode: EXIT_CODES[artifact.result] ?? 1 };
  }
}

// ---------- CLI ----------

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--artifact') opts.artifactPath = argv[++i];
    else if (argv[i] === '--repo') opts.repoDir = argv[++i];
    else if (argv[i] === '--no-fetch') opts.fetch = false;
  }
  return opts;
}

const isCliEntry =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isCliEntry) {
  const { artifact, artifactPath, exitCode } = await runCanary(parseArgs(process.argv.slice(2)));
  console.log(JSON.stringify(artifact, null, 2));
  console.error(`control-plane-canary: result=${artifact.result} artifact=${artifactPath}`);
  process.exit(exitCode);
}
