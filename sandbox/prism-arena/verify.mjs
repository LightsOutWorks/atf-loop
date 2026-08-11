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
import os from 'node:os';
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
  record('06-21 動的検査（起動・操作・状態遷移・iOS適合）', 'SKIP', 'playwright が見つからない');
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

    // --- セーフエリア（ノッチ / ホームインジケータ）分だけHUDが内側へ寄るか ---
    // env() の実値はブラウザ側が決めるためヘッドレスでは常に0になる。
    // そこで env() をCSS変数で一段受けておき、変数を上書きして追従を実測する。
    const sa = await page.evaluate(() => {
      const before = window.__ARENA.superButton;
      const st = document.documentElement.style;
      st.setProperty('--sa-b', '34px'); st.setProperty('--sa-r', '48px');
      window.__ARENA.relayout();
      const after = window.__ARENA.superButton;
      const read = window.__ARENA.safeArea;
      st.removeProperty('--sa-b'); st.removeProperty('--sa-r');
      window.__ARENA.relayout();
      return { dx: before.x - after.x, dy: before.y - after.y, read, restored: window.__ARENA.safeArea };
    });
    check('17 セーフエリア分だけHUDが内側へ寄る',
      sa.read.b === 34 && sa.read.r === 48 &&
      Math.round(sa.dx) === 48 && Math.round(sa.dy) === 34 &&
      sa.restored.b === 0 && sa.restored.r === 0,
      `読取=${sa.read.r}/${sa.read.b} 移動=${Math.round(sa.dx)}/${Math.round(sa.dy)}`);

    // --- バックグラウンドで停止し、復帰後はタップで再開するか ---
    const pauseRes = await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
      return { paused: window.__ARENA.paused, t: window.__ARENA.matchT };
    });
    await page.waitForTimeout(900);
    const whilePaused = await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
      return { paused: window.__ARENA.paused, t: window.__ARENA.matchT };
    });
    await page.waitForTimeout(200);
    await page.mouse.click(420, 420);
    await page.waitForTimeout(250);
    const afterTap = await page.evaluate(() => ({ paused: window.__ARENA.paused, t: window.__ARENA.matchT }));
    check('18 バックグラウンドで一時停止し、復帰後はタップで再開する',
      pauseRes.paused === true &&
      Math.abs(whilePaused.t - pauseRes.t) < 0.05 &&     // 停止中は試合時間が進まない
      whilePaused.paused === true &&                     // 復帰しただけでは再開しない
      afterTap.paused === false && afterTap.t < whilePaused.t,
      `停止中の経過=${(whilePaused.t - pauseRes.t).toFixed(3)}s 再開後=${afterTap.t.toFixed(1)}s`);

    // --- iPhone / iPad 相当の各ビューポートで起動・操作でき、アリーナが画面を覆うか ---
    const DEVICES = [
      { name: 'iPhone SE 縦', w: 375, h: 667 },
      { name: 'iPhone 14 Pro 縦', w: 393, h: 852 },
      { name: 'iPhone 14 Pro 横', w: 852, h: 393 },
      { name: 'iPad 縦', w: 820, h: 1180 },
      { name: 'iPad 横', w: 1180, h: 820 }
    ];
    const devFails = [];
    for (const d of DEVICES) {
      const dp = await browser.newPage({
        viewport: { width: d.w, height: d.h }, hasTouch: true, isMobile: true
      });
      const de = [];
      dp.on('pageerror', e => de.push(e.message));
      dp.on('console', m => { if (m.type() === 'error') de.push(m.text()); });
      await dp.goto(pathToFileURL(TARGET).href, { waitUntil: 'load' });
      await dp.waitForFunction(() => !!window.__ARENA, null, { timeout: 8000 });
      await dp.tap('#startBtn');
      await dp.waitForTimeout(350);
      await dp.touchscreen.tap(Math.round(d.w * 0.22), Math.round(d.h * 0.72));
      await dp.touchscreen.tap(Math.round(d.w * 0.72), Math.round(d.h * 0.45));
      await dp.waitForTimeout(500);
      const s = await dp.evaluate(() => ({
        state: window.__ARENA.state, vp: window.__ARENA.viewport,
        world: window.__ARENA.world, q: window.__ARENA.quality, btn: window.__ARENA.superButton
      }));
      // 黒帯が出ない = 拡大率がアリーナで画面を覆う下限を満たしている
      const covers = s.vp.scale * s.world.w >= s.vp.w - 1 && s.vp.scale * s.world.h >= s.vp.h - 1;
      const btnInside = s.btn.x + s.btn.r <= d.w && s.btn.y + s.btn.r <= d.h;
      if (s.state !== 'play' || !covers || !btnInside || !s.q.mobile || de.length) {
        devFails.push(`${d.name}(state=${s.state} covers=${covers} btn=${btnInside} mobileQ=${s.q.mobile} err=${de.length})`);
      }
      if (shotDir) await dp.screenshot({ path: path.join(shotDir, `dev-${d.name.replace(/[ /]/g, '_')}.png`) });
      await dp.close();
    }
    check('19 iPhone / iPad 相当の5ビューポートで起動・操作でき、アリーナが画面を覆う',
      devFails.length === 0, devFails.join(' | ') || `${DEVICES.length} 構成を実行`);

    // --- 外側に <head> を持つ土台へ本文として埋め込まれても成立するか ---
    // 公開ホスティングによっては、このファイルが <head> 済みの雛形の body 側へ差し込まれる。
    // そのときビューポート指定が body に落ちるとiOSのレイアウトが崩れるため、実際に包んで確かめる。
    const wrapPath = path.join(os.tmpdir(), 'prism-arena-embedded-check.html');
    fs.writeFileSync(wrapPath,
      '<!doctype html><html><head><meta charset="utf-8"><title>host page</title>' +
      '<style>*{box-sizing:border-box}body{margin:0}</style></head><body>' + html + '</body></html>');
    const ep = await browser.newPage({ viewport: { width: 393, height: 852 }, hasTouch: true, isMobile: true });
    const embErrors = [];
    ep.on('pageerror', e => embErrors.push(e.message));
    ep.on('console', m => { if (m.type() === 'error') embErrors.push(m.text()); });
    await ep.goto(pathToFileURL(wrapPath).href, { waitUntil: 'load' });
    await ep.waitForFunction(() => !!window.__ARENA, null, { timeout: 8000 });
    const emb = await ep.evaluate(() => {
      const vp = document.head.querySelector('meta[name="viewport"]');
      return {
        headViewport: !!vp && /width=device-width/.test(vp.content) && /viewport-fit=cover/.test(vp.content),
        strayInBody: document.body.querySelectorAll('meta').length,
        title: document.title
      };
    });
    await ep.tap('#startBtn');
    await ep.waitForTimeout(450);
    const embPlay = await ep.evaluate(() => ({ state: window.__ARENA.state, vp: window.__ARENA.viewport }));
    check('20 外側に <head> を持つ土台へ埋め込んでも成立する',
      emb.headViewport && emb.strayInBody === 0 && emb.title === 'PRISM ARENA — 3v3 クリスタルラッシュ' &&
      embPlay.state === 'play' && embErrors.length === 0,
      `head内viewport=${emb.headViewport} body残り=${emb.strayInBody} title=${JSON.stringify(emb.title)} state=${embPlay.state} err=${embErrors.length}`);
    await ep.close();
    fs.unlinkSync(wrapPath);

    check('21 実行中にJavaScript例外が発生しない', errors.length === 0,
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
