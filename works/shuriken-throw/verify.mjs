#!/usr/bin/env node
// verify.mjs — works/shuriken-throw/index.html の実ブラウザ検証
//
// 使い方:
//   npm i -D playwright && npx playwright install chromium
//   node works/shuriken-throw/verify.mjs
//
// 環境変数:
//   PW_CHROMIUM  … Chromium 実行ファイルの明示パス(既にブラウザがある環境向け)
//
// 何を確かめるか — DOMシムではなく実際の Chromium で、iPhone相当のビューポートと
// 実タッチイベントを使い、次を確認する。
//   ① 例外なくロードされ、初期状態が title である
//   ② ページがスクロールしない / canvas が DPR 上限2でビューポートに一致する
//   ③ 実タップで play へ遷移し、第1陣が始まる
//   ④ 実タップで敵に当たり、スコアと連撃が増える(頭部狙いも成立する)
//   ⑤ 長押しで手裏剣が消費される
//   ⑥ 休止 / 再開ができる
//   ⑦ 体力0で終了し、再挑戦でスコア・陣・体力が初期化される
//   ⑧ 最高得点が localStorage に残る
//   ⑨ 横持ち / 小画面 / 途中回転で壊れない
//   ⑩ 高負荷(敵42体)と100秒連続プレイでフレームレートが落ちず、例外もリークも出ない
//
// 期待値をゆるめる・項目を削ることで見かけ上通すことは CONSTRAINTS.md で禁止。

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + path.join(HERE, 'index.html');
const SOAK_MS = Number(process.env.SOAK_MS || 100000);

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log((ok ? 'OK  ' : 'NG  ') + name + (detail ? '  … ' + detail : ''));
}

const browser = await chromium.launch(
  process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});

async function open(viewport, dsf = 2) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: dsf, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(FILE);
  await page.waitForTimeout(400);
  return { ctx, page, errors };
}

/* ---------------------------------------------------------------- portrait */
{
  const { ctx, page, errors } = await open({ width: 393, height: 852 }, 3);

  check('① 初期状態が title', await page.evaluate(() => window.__GAME__ && __GAME__.state) === 'title');
  check('② ページがスクロールしない',
    !(await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 1)));
  const cvInfo = await page.evaluate(() => {
    const c = document.getElementById('cv');
    return { w: c.width, h: c.height, cw: c.clientWidth, ch: c.clientHeight };
  });
  check('② canvas がビューポート一致 / DPR上限2',
    cvInfo.cw === 393 && cvInfo.ch === 852 && cvInfo.w === 786 && cvInfo.h === 1704,
    JSON.stringify(cvInfo));

  await page.tap('#startBtn');
  await page.waitForTimeout(150);
  check('③ 開始タップで play へ', await page.evaluate(() => __GAME__.state) === 'play');
  check('③ 第1陣が始まる', await page.evaluate(() => __GAME__.wave) === 1);

  await page.waitForFunction(() => __GAME__.probe().length >= 2, null, { timeout: 10000 });
  await page.waitForTimeout(1200);

  const before = await page.evaluate(() => __GAME__.score);
  for (let i = 0; i < 30; i++) {
    const t = await page.evaluate(() => {
      const p = __GAME__.probe().filter(e => e.z > 3.5 && e.z < 10).sort((a, b) => a.z - b.z)[0];
      return p ? { x: p.bx, y: p.by } : null;
    });
    if (!t) { await page.waitForTimeout(220); continue; }
    await page.touchscreen.tap(t.x, t.y);
    await page.waitForTimeout(200);
    if (await page.evaluate(() => __GAME__.score) > before) break;
  }
  const after = await page.evaluate(() => __GAME__.score);
  check('④ 敵タップで得点が入る', after > before, before + ' -> ' + after);
  check('④ 連撃が計上される', await page.evaluate(() => __GAME__.combo) >= 1);

  const hsBefore = await page.evaluate(() => __GAME__.score);
  for (let i = 0; i < 24; i++) {
    const t = await page.evaluate(() => {
      const p = __GAME__.probe().filter(e => e.z > 3.5 && e.z < 10)[0];
      return p ? { x: p.hx, y: p.hy } : null;
    });
    if (!t) { await page.waitForTimeout(220); continue; }
    await page.touchscreen.tap(t.x, t.y);
    await page.waitForTimeout(190);
    if (await page.evaluate(() => __GAME__.score) > hsBefore) break;
  }
  check('④ 頭部狙いも成立する', await page.evaluate(() => __GAME__.score) > hsBefore);

  const ammo = await page.evaluate(async () => {
    const cv = document.getElementById('cv');
    const ev = (type, x, y) => {
      const t = new Touch({ identifier: 7, target: cv, clientX: x, clientY: y });
      return new TouchEvent(type, { bubbles: true, cancelable: true,
        touches: type === 'touchend' ? [] : [t], changedTouches: [t] });
    };
    const n0 = document.querySelectorAll('#ammo .star:not(.spent)').length;
    cv.dispatchEvent(ev('touchstart', 196, 520));
    await new Promise(r => setTimeout(r, 700));
    const n1 = document.querySelectorAll('#ammo .star:not(.spent)').length;
    cv.dispatchEvent(ev('touchend', 196, 520));
    return { n0, n1 };
  });
  check('⑤ 長押しで手裏剣を消費する', ammo.n1 < ammo.n0, JSON.stringify(ammo));

  await page.tap('#pauseBtn');
  await page.waitForTimeout(120);
  check('⑥ 休止できる', await page.evaluate(() => __GAME__.state) === 'pause');
  await page.tap('#resumeBtn');
  await page.waitForTimeout(150);
  check('⑥ 再開できる', await page.evaluate(() => __GAME__.state) === 'play');

  await page.evaluate(() => __GAME__._kill());
  await page.waitForTimeout(200);
  check('⑦ 体力0で終了する', await page.evaluate(() => __GAME__.state) === 'over');
  const finalTxt = await page.textContent('#finalScore');
  check('⑦ 最終得点が表示される', !!finalTxt && finalTxt !== '0', finalTxt);

  await page.waitForTimeout(900);
  await page.tap('#replayBtn');
  await page.waitForTimeout(220);
  const st = await page.evaluate(() => ({ s: __GAME__.state, sc: __GAME__.score, w: __GAME__.wave, hp: __GAME__.hp }));
  check('⑦ 再挑戦で得点・陣・体力が初期化される',
    st.s === 'play' && st.sc === 0 && st.w === 1 && st.hp === 3, JSON.stringify(st));
  check('⑧ 最高得点が保存される', /最高 [1-9]/.test(await page.textContent('#best')));
  check('   縦持ちで例外が出ない', errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

/* ------------------------------------------------- landscape / small / spin */
for (const c of [
  { name: '⑨ 横持ち', vp: { width: 852, height: 393 } },
  { name: '⑨ 小画面(SE相当)', vp: { width: 320, height: 568 } },
]) {
  const { ctx, page, errors } = await open(c.vp);
  await page.tap('#startBtn');
  await page.waitForTimeout(2500);
  check(c.name + 'でプレイできる', await page.evaluate(() => __GAME__.state) === 'play');
  check(c.name + 'で例外が出ない', errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}
{
  const { ctx, page, errors } = await open({ width: 393, height: 852 });
  await page.tap('#startBtn');
  await page.waitForTimeout(1500);
  await page.setViewportSize({ width: 852, height: 393 }); await page.waitForTimeout(800);
  await page.setViewportSize({ width: 393, height: 852 }); await page.waitForTimeout(800);
  check('⑨ 途中回転に耐える', await page.evaluate(() => __GAME__.state) === 'play');
  check('⑨ 回転で例外が出ない', errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

/* ------------------------------------------------------------- load + soak */
{
  const { ctx, page, errors } = await open({ width: 393, height: 852 });
  await page.tap('#startBtn');
  await page.evaluate(() => { for (let i = 0; i < 40; i++) __GAME__.spawn(); });
  await page.waitForTimeout(1400);
  const heavy = await page.evaluate(async () => {
    let n = 0; const t = performance.now();
    await new Promise(r => { const k = () => { n++; performance.now() - t < 1000 ? requestAnimationFrame(k) : r(); }; requestAnimationFrame(k); });
    return { fps: n, enemies: __GAME__.enemies };
  });
  check('⑩ 高負荷でも 50fps 以上', heavy.fps >= 50, heavy.fps + 'fps / 敵' + heavy.enemies + '体');
  await ctx.close();
  check('⑩ 高負荷で例外が出ない', errors.length === 0, errors.slice(0, 3).join(' | '));
}
{
  const { ctx, page, errors } = await open({ width: 393, height: 852 });
  await page.tap('#startBtn');
  let restarts = 0, maxWave = 0;
  const t0 = Date.now();
  while (Date.now() - t0 < SOAK_MS) {
    const st = await page.evaluate(() => {
      const near = __GAME__.probe().sort((a, b) => a.z - b.z)[0];
      return { s: __GAME__.state, w: __GAME__.wave, t: near ? { x: near.bx, y: near.by } : null };
    });
    maxWave = Math.max(maxWave, st.w);
    if (st.s === 'over') {
      restarts++;
      await page.waitForTimeout(900);
      await page.tap('#replayBtn');
      await page.waitForTimeout(200);
      continue;
    }
    if (st.t) await page.touchscreen.tap(st.t.x, st.t.y);
    await page.waitForTimeout(70);
  }
  const end = await page.evaluate(async () => {
    let n = 0; const t = performance.now();
    await new Promise(r => { const k = () => { n++; performance.now() - t < 1000 ? requestAnimationFrame(k) : r(); }; requestAnimationFrame(k); });
    return { fps: n, heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : -1 };
  });
  check('⑩ 連続プレイ後もフレームレートを維持',
    end.fps >= 50, Math.round(SOAK_MS / 1000) + '秒 / 第' + maxWave + '陣到達 / ' +
    end.fps + 'fps / heap ' + end.heapMB + 'MB / 再挑戦' + restarts + '回');
  check('⑩ 連続プレイで例外が出ない', errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

await browser.close();

const bad = results.filter(r => !r.ok);
console.log('---');
console.log(bad.length === 0
  ? 'PASS (' + results.length + '/' + results.length + ')'
  : 'FAIL (' + (results.length - bad.length) + '/' + results.length + ')');
process.exit(bad.length === 0 ? 0 : 1);
