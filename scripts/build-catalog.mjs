#!/usr/bin/env node
// build-catalog.mjs — works/seed-*/meta.json からルートの index.html(目録)を再生成する。
// 目録の実データは meta.json(seed/title/description の3項目)のみを正とし、
// Release date は各作品の index.html の初出コミット日時を git 履歴から機械的に求める
// (meta.json 自体に日付は持たせない)。
//
// meta.json が存在しない・JSON として壊れている・必須3項目が揃っていない場合は
// 目録を書き換えずに exit 1 する(fail-closed)。呼び出し元(factory.yml)は
// この非ゼロ終了を検知して run を止めること。

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const worksDir = path.join(root, 'works');
const outPath = path.join(root, 'index.html');

function fail(msg) {
  console.error('build-catalog: ' + msg);
  process.exit(1);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------- works/seed-NNN/ の列挙(数値順) ----------
let dirs;
try {
  dirs = fs.readdirSync(worksDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^seed-\d+$/.test(d.name))
    .map((d) => ({ name: d.name, num: parseInt(d.name.slice('seed-'.length), 10) }))
    .sort((a, b) => a.num - b.num);
} catch (e) {
  fail('works/ を読み取れません: ' + e.message);
}
if (dirs.length === 0) fail('works/ 配下に seed-* ディレクトリが1つもありません。');

// ---------- 各 meta.json の読み込み・検証 ----------
const REQUIRED = ['seed', 'title', 'description'];
const entries = [];
for (const d of dirs) {
  const metaPath = path.join(worksDir, d.name, 'meta.json');
  let raw;
  try {
    raw = fs.readFileSync(metaPath, 'utf8');
  } catch (e) {
    fail(`${d.name}/meta.json を読み取れません: ${e.message}`);
  }
  let meta;
  try {
    meta = JSON.parse(raw);
  } catch (e) {
    fail(`${d.name}/meta.json が正しい JSON ではありません: ${e.message}`);
  }
  for (const key of REQUIRED) {
    if (typeof meta[key] !== 'string' || meta[key].trim() === '') {
      fail(`${d.name}/meta.json の "${key}" が文字列として存在しません。`);
    }
  }
  entries.push({
    dirName: d.name,
    seedNum: d.num,
    seed: meta.seed,
    title: meta.title,
    description: meta.description,
  });
}

// ---------- Release date(git 履歴から導出。meta.json には持たせない) ----------
// -M100%: 完全一致の場合のみリネームとして追跡する(住所統一で NEON RANGE が
// works/seed-001/ へ移動した経緯を正しく遡るため)。閾値を下げると、似た構成の
// 別作品同士が誤ってリネームと判定される(実測済み)ため 100% 固定とする。
function releaseDateOf(dirName) {
  const filePath = path.join('works', dirName, 'index.html');
  let out = '';
  try {
    out = execFileSync(
      'git',
      ['log', '-M100%', '--format=%ad', '--date=format:%Y-%m-%d', '--diff-filter=A', '--follow', '--', filePath],
      { cwd: root, encoding: 'utf8' }
    );
  } catch (e) {
    out = '';
  }
  const lines = out.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length > 0) return lines[lines.length - 1];
  // git 履歴に見つからない(このパイプライン実行でまさに生成された直後、
  // まだコミットされていない作品)場合は今日の日付を使う。
  return new Date().toISOString().slice(0, 10);
}
for (const e of entries) {
  e.releaseDate = releaseDateOf(e.dirName);
}

// ---------- SEED 001(旧ルートURLの遷移先)の特定 ----------
const seed001 = entries.find((e) => e.seedNum === 1);
if (!seed001) fail('works/seed-001 が見つかりません(旧ルートURLの導線を作れません)。');

// ---------- HTML 生成 ----------
function entryHtml(e) {
  const isFeatured = e.seedNum === 1;
  const seedLabel = 'SEED ' + String(e.seedNum).padStart(3, '0');
  return `    <li class="entry${isFeatured ? ' featured' : ''}">
      <h2><span class="seed-num">${escapeHtml(seedLabel)} —</span> ${escapeHtml(e.title)}</h2>
      <p class="desc">${escapeHtml(e.description)}</p>
      <div class="meta">
        <span class="date">Release date: ${escapeHtml(e.releaseDate)}</span>
        <a class="play" href="works/${escapeHtml(e.dirName)}/index.html">Play →</a>
      </div>
    </li>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<title>Catalog — Browser FPS-style Toys</title>
<style>
  html, body {
    margin: 0; padding: 0;
    background: #0a0b12; color: #e8ecf6;
    font-family: sans-serif;
  }
  body {
    min-height: 100%;
    padding: 32px 16px 64px;
    box-sizing: border-box;
  }
  main {
    max-width: 760px;
    margin: 0 auto;
  }
  h1 {
    font-size: 1.6rem;
    letter-spacing: 0.04em;
    margin: 0 0 4px;
  }
  .seed-num {
    color: #7f8bc9;
    font-weight: normal;
  }
  p.lede {
    color: #a9b1c6;
    margin: 0 0 32px;
    line-height: 1.5;
  }
  ul.catalog {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  li.entry {
    border: 1px solid #2a2e40;
    border-radius: 10px;
    padding: 16px 18px;
    background: #12141f;
  }
  li.entry.featured {
    border-color: #4a5fd9;
    background: #141a2e;
  }
  h2 {
    font-size: 1.15rem;
    margin: 0 0 6px;
  }
  .desc {
    margin: 0 0 10px;
    color: #c7cce0;
    line-height: 1.45;
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 16px;
    font-size: 0.85rem;
  }
  .date {
    color: #8891ac;
  }
  a.play {
    color: #9db2ff;
    text-decoration: none;
    border: 1px solid #3a4470;
    border-radius: 6px;
    padding: 4px 10px;
  }
  a.play:hover, a.play:focus {
    background: #1f2748;
  }
  .redirect-note {
    margin: 0 0 28px;
    padding: 12px 16px;
    border: 1px solid #3a4470;
    border-radius: 8px;
    background: #10142a;
    color: #c7cce0;
    font-size: 0.9rem;
    line-height: 1.5;
  }
  .redirect-note a {
    color: #9db2ff;
  }
  footer {
    margin-top: 40px;
    padding-top: 16px;
    border-top: 1px solid #2a2e40;
    color: #7f879e;
    font-size: 0.85rem;
  }
  footer a.feedback {
    color: #8891ac;
    text-decoration: none;
    border-bottom: 1px dashed #4a5170;
    cursor: default;
  }
</style>
</head>
<body>
<main>
  <h1>Browser FPS-style Toys — Catalog</h1>
  <p class="lede">Single-file, dependency-free browser toys. Each play is about 60 seconds.</p>

  <p class="redirect-note">
    Looking for the toy that used to live at this address?
    It is now <strong>SEED 001 — ${escapeHtml(seed001.title)}</strong>, listed first below.
    <a href="works/${escapeHtml(seed001.dirName)}/index.html">Play ${escapeHtml(seed001.title)} →</a>
  </p>

  <ul class="catalog">
${entries.map(entryHtml).join('\n')}
  </ul>

  <footer>
    <a class="feedback" href="#feedback">Feedback (coming soon)</a>
  </footer>
</main>
</body>
</html>
`;

fs.writeFileSync(outPath, html, 'utf8');
console.log(`build-catalog: works/ 配下 ${entries.length} 件から index.html を再生成しました。`);
