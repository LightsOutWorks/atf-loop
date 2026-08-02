#!/usr/bin/env node
// interaction-smoke.mjs — 生成契約の Interaction Contract(meta.json の primary_input /
// success_condition)を実ブラウザ(Playwright Chromium)の本物のポインタイベントで駆動し、
// window.__GAME__.checkSuccess() が真になることを確認する。
//
// smoke.mjs は Node の vm 上の最小 DOM シムでゲームロジックを検証するが、
// pointerdown/pointermove/pointerup の実配線(例: ホールド開始処理が実際に呼ばれるか)までは
// 検証しない。そのため「smoke 6/6 かつゲート PUBLISH だが、実ブラウザでは主要操作が
// 一度も成立しない」という欠陥が smoke をすり抜けうる。本スクリプトはその隙間を専任で埋める。
//
// 使い方: node scripts/interaction-smoke.mjs <対象ディレクトリ>
//
// meta.json が読めない・primary_input が tap/hold/drag のいずれでもない・
// success_condition が空・window.__GAME__.checkSuccess が存在しない・
// 制限時間内に checkSuccess() が真にならない、のいずれでも exit 1(fail-closed)。

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

// NODE_PATH は CommonJS の require() 解決アルゴリズムだけが参照し、ESM の import 文からは
// 一切見えない。playwright をリポジトリ外(NODE_PATH 経由)に置く運用のため、ESM の
// 静的 import ではなく createRequire 経由の require() で解決する。
const { chromium } = createRequire(import.meta.url)('playwright');

const VALID_INPUTS = ['tap', 'hold', 'drag'];
const TIME_BUDGET_MS = 25000;
const HOLD_MS = 2800;
const HOLD_POLL_MS = 150;
const DRAG_DIST = 90;
const VIEWPORT = { width: 960, height: 600 };

function fail(msg) {
  console.error('interaction-smoke: NG — ' + msg);
  process.exit(1);
}

const targetDir = process.argv[2];
if (!targetDir) fail('対象ディレクトリを第1引数で指定してください。');
const dir = path.resolve(targetDir);
const htmlPath = path.join(dir, 'index.html');
const metaPath = path.join(dir, 'meta.json');

if (!fs.existsSync(htmlPath)) fail(htmlPath + ' が見つかりません。');
if (!fs.existsSync(metaPath)) fail(metaPath + ' が見つかりません。');

let meta;
try {
  meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
} catch (e) {
  fail('meta.json が正しい JSON ではありません: ' + e.message);
}

const primaryInput = meta.primary_input;
const successCondition = meta.success_condition;
if (!VALID_INPUTS.includes(primaryInput)) {
  fail('meta.json の primary_input が tap/hold/drag のいずれでもありません: ' + JSON.stringify(primaryInput));
}
if (typeof successCondition !== 'string' || !successCondition.trim()) {
  fail('meta.json の success_condition が文字列として存在しません。');
}

function gridPoints(cols, rows) {
  const pts = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      pts.push({
        x: VIEWPORT.width * ((c + 0.5) / cols),
        y: VIEWPORT.height * ((r + 0.5) / rows),
      });
    }
  }
  return pts;
}

async function checkSuccess(page) {
  return page.evaluate(() => {
    return !!(window.__GAME__ && typeof window.__GAME__.checkSuccess === 'function' && window.__GAME__.checkSuccess());
  });
}

async function main() {
  const browser = await chromium.launch();
  let succeeded = false;
  try {
    const page = await browser.newPage({ viewport: VIEWPORT });
    await page.goto('file://' + htmlPath);

    const hasHook = await page.evaluate(() => {
      return !!(window.__GAME__ && typeof window.__GAME__.start === 'function' && typeof window.__GAME__.checkSuccess === 'function');
    });
    if (!hasHook) fail('window.__GAME__.start() または checkSuccess() が公開されていません。');

    await page.evaluate(() => { window.__GAME__.start(); });
    await page.waitForTimeout(200);

    const points = gridPoints(5, 4);
    const deadline = Date.now() + TIME_BUDGET_MS;
    let i = 0;
    while (Date.now() < deadline && !succeeded) {
      const p = points[i % points.length];
      i++;

      if (primaryInput === 'tap') {
        await page.mouse.move(p.x, p.y);
        await page.mouse.down();
        await page.mouse.up();
      } else if (primaryInput === 'hold') {
        await page.mouse.move(p.x, p.y);
        await page.mouse.down();
        const holdDeadline = Date.now() + HOLD_MS;
        while (Date.now() < holdDeadline) {
          await page.waitForTimeout(HOLD_POLL_MS);
          succeeded = await checkSuccess(page);
          if (succeeded) break;
        }
        await page.mouse.up();
      } else if (primaryInput === 'drag') {
        const p2 = {
          x: Math.min(VIEWPORT.width, p.x + DRAG_DIST),
          y: Math.min(VIEWPORT.height, p.y + DRAG_DIST),
        };
        await page.mouse.move(p.x, p.y);
        await page.mouse.down();
        await page.mouse.move(p2.x, p2.y, { steps: 6 });
        await page.mouse.up();
      }

      if (!succeeded) succeeded = await checkSuccess(page);
    }
  } finally {
    await browser.close();
  }

  if (!succeeded) {
    fail(
      `primary_input="${primaryInput}" を実ポインタ操作で ${TIME_BUDGET_MS / 1000} 秒間試しましたが、` +
      `success_condition="${successCondition}"(checkSuccess())が一度も真になりませんでした。`
    );
  }
  console.log(`interaction-smoke: OK — primary_input="${primaryInput}" で success_condition="${successCondition}" を確認しました。`);
  process.exit(0);
}

main().catch((e) => {
  fail('検証中に例外が発生しました: ' + (e && e.stack ? e.stack : String(e)));
});
