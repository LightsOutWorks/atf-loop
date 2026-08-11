#!/usr/bin/env node
// verify.mjs — sandbox/prism-arena/index.html の機械検証
//
//   node sandbox/prism-arena/verify.mjs [--shots <dir>]
//
// 静的検査（外部参照なし・構文）はNodeだけで実行し、
// 動的検査（実際に起動して遊ぶ）はPlaywright+Chromiumがある場合のみ実行する。
// Playwrightが無い環境では動的検査を SKIP と表示する。SKIPをPASSとして数えない。
//
// 期待値をゆるめる・項目を削ることで見かけ上通すことは禁止（CONSTRAINTS.md Part I §6）。

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const TARGET = path.join(HERE, 'index.html');

const results = [];
const record = (name, status, detail) => {
  results.push({ name, status, detail: detail || '' });
  const mark = status === 'PASS' ? 'PASS' : status === 'SKIP' ? 'SKIP' : 'FAIL';
  console.log(`[${mark}] ${name}${detail ? ' — ' + detail : ''}`);
};
const check = (name, cond, detail) => record(name, cond ? 'PASS' : 'FAIL', detail);

// ---------------------------------------------------------------- 静的検査
if (!fs.existsSync(TARGET)) {
  record('01 index.html が存在する', 'FAIL', TARGET);
  process.exit(1);
}
record('01 index.html が存在する', 'PASS', `${(fs.statSync(TARGET).size / 1024).toFixed(1)} KB`);

const html = fs.readFileSync(TARGET, 'utf8');

const FORBIDDEN = [
  [/https?:\/\//i, '外部URL'],
  [/\bfetch\s*\(/, 'fetch'],
  [/XMLHttpRequest/, 'XMLHttpRequest'],
  [/\bWebSocket\b/, 'WebSocket'],
  [/\bEventSource\b/, 'EventSource'],
  [/sendBeacon/, 'sendBeacon'],
  [/<script[^>]+\bsrc\s*=/i, '外部script'],
  [/<link\b/i, '外部link'],
  [/@import/i, 'CSS @import'],
  [/\bimport\s*\(/, '動的import'],
  [/url\s*\(\s*['"]?(?:https?:)?\/\//i, '外部url()'],
  [/<(?:img|audio|video|source|iframe)\b/i, '外部メディア要素']
];
const violations = FORBIDDEN.filter(([re]) => re.test(html)).map(([, label]) => label);
check('02 外部通信・外部アセット参照がない', violations.length === 0, violations.join(' / ') || '違反なし');

const scriptBlocks = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
check('03 インラインscriptが1つ以上ある', scriptBlocks.length > 0, `${scriptBlocks.length} 個`);
let syntaxOk = true, syntaxErr = '';
for (const src of scriptBlocks) {
  try { new vm.Script(src); } catch (e) { syntaxOk = false; syntaxErr = e.message; break; }
}
check('04 scriptが構文エラーを起こさない', syntaxOk, syntaxErr || 'OK');

const thirdParty = ['brawl', 'supercell', 'ブロスタ', 'ブロウルスターズ'];
const lower = html.toLowerCase();
const hits = thirdParty.filter(w => lower.includes(w.toLowerCase()));
check('05 第三者の名称・固有表現が含まれない', hits.length === 0, hits.join(' / ') || '検出なし');

// ---------------------------------------------------------------- Playwright 解決
function loadPlaywright() {
  try { return require('playwright'); } catch { /* ローカル解決に失敗 */ }
  try {
    const g = execSync('npm root -g', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return require(path.join(g, 'playwright'));
  } catch { /* グローバル解決に失敗 */ }
  return null;
}

const pw = loadPlaywright();
if (!pw) {
  record('06-17 動的検査（起動・操作・状態遷移）', 'SKIP', 'playwright が見つからない');
  summarize();
} else {
  await dynamic(pw);
  summarize();
}

// ---------------------------------------------------------------- 動的検査
async function dynamic(playwright) {
  const shotsIdx = process.argv.indexOf('--shots');
  const shotDir = shotsIdx > -1 ? process.argv[shotsIdx + 1] : null;
  if (shotDir) fs.mkdirSync(shotDir, { recursive: true });

  const browser = await playwright.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  try {
    await page.goto(pathToFileURL(TARGET).href, { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__ARENA, null, { timeout: 8000 });

    const initial = await page.evaluate(() => window.__ARENA.state);
    check('06 初期状態がタイトル画面である', initial === 'title', `state=${initial}`);
    const titleVisible = await page.isVisible('#titleScreen');
    check('07 タイトル画面が表示されている', titleVisible === true, `visible=${titleVisible}`);
    if (shotDir) await page.screenshot({ path: path.join(shotDir, '01-title.png') });

    // --- 開始操作 ---
    await page.click('#startBtn');
    await page.waitForTimeout(400);
    const afterStart = await page.evaluate(() => ({
      state: window.__ARENA.state, units: window.__ARENA.units, t: window.__ARENA.matchT
    }));
    check('08 開始操作でプレイ状態へ遷移する',
      afterStart.state === 'play' && afterStart.units === 6,
      `state=${afterStart.state} units=${afterStart.units}`);

    // --- 攻撃入力が弾を生成するか（押下エッジを取りこぼしていないか） ---
    await page.mouse.move(1100, 420);
    await page.mouse.down();
    await page.waitForTimeout(90);
    const shotsAfterClick = await page.evaluate(() => window.__ARENA.shots);
    await page.mouse.up();
    check('09 攻撃入力で弾が生成される', shotsAfterClick > 0, `shots=${shotsAfterClick}`);

    // --- 実際に操作して10秒ほどプレイする ---
    for (const key of ['KeyD', 'KeyS']) await page.keyboard.down(key);
    for (let i = 0; i < 40; i++) {
      await page.mouse.move(640 + Math.sin(i / 2) * 340, 400 + Math.cos(i / 2) * 230);
      await page.mouse.down(); await page.mouse.up();
      await page.waitForTimeout(180);
    }
    for (const key of ['KeyD', 'KeyS']) await page.keyboard.up(key);
    await page.evaluate(() => window.__ARENA.fillSuper());
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(1400);

    const mid = await page.evaluate(() => ({
      state: window.__ARENA.state, t: window.__ARENA.matchT,
      gems: window.__ARENA.fieldGems, alive: window.__ARENA.alive,
      p: window.__ARENA.player, score: window.__ARENA.score,
      dmg: window.__ARENA.totalDamage
    }));
    check('10 プレイ中に時間が進行する', mid.t < afterStart.t - 5, `${afterStart.t.toFixed(1)}s → ${mid.t.toFixed(1)}s`);
    check('11 鉱脈からクリスタルが供給される',
      mid.gems > 0 || mid.score[0] + mid.score[1] > 0,
      `field=${mid.gems} score=${mid.score.join('-')}`);
    check('12 戦闘が成立している（ダメージが発生する）', mid.dmg > 0,
      `総ダメージ=${mid.dmg} 自HP=${Math.round(mid.p.hp)}/${mid.p.maxHp}`);
    if (shotDir) await page.screenshot({ path: path.join(shotDir, '02-play.png') });

    // --- 終了とリザルト ---
    await page.evaluate(() => window.__ARENA.forceFinish(0));
    await page.waitForFunction(() => window.__ARENA.state === 'result', null, { timeout: 6000 });
    const resultVisible = await page.isVisible('#resultScreen');
    check('13 決着後にリザルト画面へ遷移する', resultVisible === true, `visible=${resultVisible}`);
    if (shotDir) await page.screenshot({ path: path.join(shotDir, '03-result.png') });

    // --- 再プレイでスコアと時間が初期化される ---
    await page.click('#rematchBtn');
    await page.waitForTimeout(400);
    const replay = await page.evaluate(() => ({
      state: window.__ARENA.state, t: window.__ARENA.matchT,
      score: window.__ARENA.score, p: window.__ARENA.player
    }));
    check('14 再プレイでスコア・残り時間が初期化される',
      replay.state === 'play' && replay.t > 145 && replay.score[0] === 0 && replay.score[1] === 0 &&
      replay.p.stats.dmg === 0 && replay.p.hp === replay.p.maxHp,
      `t=${replay.t.toFixed(1)}s score=${replay.score.join('-')} dmg=${replay.p.stats.dmg}`);

    // --- 全ファイターの通常攻撃とスーパーが例外なく動く ---
    const ids = await page.evaluate(() => window.__ARENA.fighters);
    for (const id of ids) {
      await page.evaluate(b => window.__ARENA.start(b, 'hard'), id);
      await page.waitForTimeout(300);
      for (let i = 0; i < 10; i++) {
        await page.mouse.move(500 + i * 60, 300 + (i % 3) * 120);
        await page.mouse.down(); await page.mouse.up();
        await page.waitForTimeout(120);
      }
      await page.evaluate(() => window.__ARENA.fillSuper());
      await page.keyboard.press('KeyE');
      await page.waitForTimeout(700);
      const st = await page.evaluate(() => window.__ARENA.state);
      if (st !== 'play') { errors.push(`fighter ${id}: state=${st}`); break; }
    }
    check('15 5ファイター全員の攻撃・スーパーが例外なく動作する', errors.length === 0, `${ids.length} 体を実行`);

    // --- 縦長（スマホ相当）でも起動・操作できる ---
    const mobile = await browser.newPage({
      viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true
    });
    const mobErrors = [];
    mobile.on('pageerror', e => mobErrors.push(e.message));
    await mobile.goto(pathToFileURL(TARGET).href, { waitUntil: 'load' });
    await mobile.waitForFunction(() => !!window.__ARENA, null, { timeout: 8000 });
    await mobile.tap('#startBtn');
    await mobile.waitForTimeout(300);
    await mobile.touchscreen.tap(110, 620);           // 左半分 = 移動スティック
    await mobile.touchscreen.tap(300, 500);           // 右半分 = 攻撃（オートエイム）
    await mobile.touchscreen.tap(330, 780);           // 右下 = スーパーボタン
    await mobile.waitForTimeout(1200);
    const mobState = await mobile.evaluate(() => window.__ARENA.state);
    check('16 縦長ビューポート（タッチ）で起動・操作できる',
      mobState === 'play' && mobErrors.length === 0,
      `state=${mobState} errors=${mobErrors.length}`);
    if (shotDir) await mobile.screenshot({ path: path.join(shotDir, '04-mobile.png') });
    await mobile.close();

    check('17 実行中にJavaScript例外が発生しない', errors.length === 0,
      errors.length ? errors.slice(0, 4).join(' | ') : '例外なし');
  } catch (e) {
    record('動的検査', 'FAIL', e.message);
  } finally {
    await browser.close();
  }
}

function summarize() {
  const fail = results.filter(r => r.status === 'FAIL');
  const skip = results.filter(r => r.status === 'SKIP');
  const pass = results.filter(r => r.status === 'PASS');
  console.log(`\nPASS ${pass.length} / FAIL ${fail.length} / SKIP ${skip.length}`);
  process.exit(fail.length ? 1 : 0);
}
