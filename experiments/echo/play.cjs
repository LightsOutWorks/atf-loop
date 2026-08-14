/**
 * ECHO AI Player — 実ブラウザでplayerとして操作し、3層で観測する。
 *   A. Build Health        : 壊れていないか（runtime error / 起動 / 進行 / ending到達 / replay）
 *   B. Interactive Usability: 説明なしで操作・進行できるか（tap target / overflow / 初動反応の速さ）
 *   C. Intent Alignment    : 接し方が蓄積し最後の自律判断として返るか
 *                            （選択→可視反応 / memory callback / 同一命令で結末が割れる）
 *
 * 使い方: NODE_PATH=/opt/node22/lib/node_modules node play.cjs <file.html> [--json]
 * 判定はしない。観測値を出すだけ。採否はEvaluatorが決める。
 */
const { chromium } = require('playwright');
const path = require('path');

const MOBILE = { width: 390, height: 844 };

// 接し方の型。index は「その場の選択肢のうち何番目を選ぶか」の優先順。
const STRATEGIES = {
  kind_free:  { label: '優しく・自由を渡す', pref: [0, 2, 1] },
  cold_ctrl:  { label: '冷たく・支配する',   pref: [1, 0, 2] },
  honest_mid: { label: '正直・中庸',         pref: [2, 0, 1] },
};

async function playOnce(page, url, strat, collect, forceFinal) {
  const errors = [];
  page.removeAllListeners('pageerror');
  page.removeAllListeners('console');
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(250);

  const obs = { strategy: strat.label, errors, steps: [], memoryCallback: null,
                firstReactionMs: null, firstReactionPixels: null, ending: null,
                endingName: null, hasRoad: false, replayOk: null, overflowPx: 0, smallTargets: [] };

  // --- 起動 ---
  const hook = await page.evaluate(() => !!window.__ECHO__);
  if (!hook) { obs.fatal = 'window.__ECHO__ が無い（起動失敗）'; return obs; }

  const startBtn = page.locator('#start');
  if (await startBtn.count() === 0) { obs.fatal = 'start操作が無い'; return obs; }
  await startBtn.click();
  await page.waitForTimeout(200);

  // --- 初動: 選択→可視反応（canvasのピクセル差分と経過時間） ---
  const shot = async () => (await page.locator('#eye').screenshot()).toString('base64');
  const before = await shot();
  const t0 = Date.now();
  const firstChoices = page.locator('button.ch');
  if (await firstChoices.count() === 0) { obs.fatal = '選択肢が出ない'; return obs; }
  await firstChoices.nth(0).click();
  await page.waitForTimeout(600);
  const after = await shot();
  obs.firstReactionMs = Date.now() - t0;
  obs.firstReactionPixels = before === after ? 0 : 1; // 1 = 見た目が変わった

  // 1手目を消費済みなので state を読んでから続行
  let guard = 0;
  while (guard++ < 40) {
    const st = await page.evaluate(() => window.__ECHO__.state);
    if (!st) break;
    if (st.over) { obs.ending = st; break; }

    // memory callback の実測: 画面に過去の自分の言葉が引用されているか
    const memHtml = await page.locator('#say .mem').count();
    if (memHtml > 0 && obs.memoryCallback === null) {
      const quoted = (await page.locator('#say .mem').innerText()).replace(/[「」]/g, '').trim();
      obs.memoryCallback = { quoted, isRealMemory: st.mem.includes(quoted) };
    }

    const n = await page.locator('button.ch').count();
    if (n === 0) break;
    // 【命令】が並ぶ場面 = final。ここだけは人格戦略ではなく forceFinal で振る。
    const isFinal = (await page.locator('button.ch').allInnerTexts())
      .some(t => t.indexOf('【命令】') === 0);
    let idx;
    if (isFinal && typeof forceFinal === 'number') idx = Math.min(forceFinal, n - 1);
    else { idx = strat.pref.find(i => i < n); if (idx === undefined) idx = 0; }
    const stBefore = { w: st.warmth, a: st.autonomy, h: st.honesty };
    await page.locator('button.ch').nth(idx).click();
    await page.waitForTimeout(160);
    const stAfter = await page.evaluate(() => window.__ECHO__.state);
    obs.steps.push({
      scene: st.i, picked: idx,
      moved: !!stAfter && (stAfter.warmth !== stBefore.w || stAfter.autonomy !== stBefore.a || stAfter.honesty !== stBefore.h),
    });
  }

  // --- ending ---
  const nameEl = page.locator('#ending .name');
  obs.endingName = (await nameEl.count()) ? (await nameEl.innerText()).trim() : null;
  obs.hasRoad = (await page.locator('#ending .road').count()) > 0;
  obs.endingText = (await page.locator('#ending').count()) ? (await page.locator('#ending').innerText()).replace(/\s+/g,' ').trim() : '';

  // --- replay ---
  const rep = page.locator('#replay');
  if (await rep.count()) {
    await rep.click();
    await page.waitForTimeout(200);
    const st = await page.evaluate(() => window.__ECHO__.state);
    obs.replayOk = !!st && st.over === false && st.i === 0 && st.warmth === 0;
  } else obs.replayOk = false;

  // --- mobile usability ---
  obs.overflowPx = await page.evaluate(() =>
    Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
  obs.smallTargets = await page.evaluate(() =>
    [...document.querySelectorAll('button.ch')]
      .map(b => ({ t: b.textContent.slice(0, 14), h: Math.round(b.getBoundingClientRect().height) }))
      .filter(x => x.h < 44));

  if (collect) collect.push(obs);
  return obs;
}

(async () => {
  const file = process.argv[2];
  if (!file) { console.error('usage: node play.cjs <file.html>'); process.exit(2); }
  const url = 'file://' + path.resolve(file);
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium/chrome-linux/chrome' })
    .catch(() => chromium.launch());
  const ctx = await browser.newContext({ viewport: MOBILE, isMobile: true, hasTouch: true,
    deviceScaleFactor: 2, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148' });
  const page = await ctx.newPage();

  const runs = [];
  for (const k of Object.keys(STRATEGIES))
    for (const cmd of [0, 1, 2])
      { const o = await playOnce(page, url, STRATEGIES[k], null, cmd); o.cmd = cmd; o.strat = k; runs.push(o); }

  // 同一人格 × 命令違い で結末/文面が変わるか = 改善仮説H1の直接指標
  const bySt = {};
  runs.forEach(r => { (bySt[r.strat] = bySt[r.strat] || []).push(r); });
  const cmdSensitivity = Object.keys(bySt).map(k => ({
    personality: k,
    endingsByCommand: bySt[k].map(r => r.endingName),
    distinctEndings: [...new Set(bySt[k].map(r => r.endingName))].length,
    distinctEndingTexts: [...new Set(bySt[k].map(r => r.endingText))].length,
  }));

  const endings = runs.map(r => r.endingName);
  const report = {
    file: path.basename(file),
    A_build: {
      runtimeErrors: runs.flatMap(r => r.errors),
      fatal: runs.map(r => r.fatal).filter(Boolean),
      reachedEnding: runs.every(r => !!r.endingName),
      replayOk: runs.every(r => r.replayOk === true),
      allChoicesMovedState: runs.every(r => r.steps.every(s => s.moved)),
    },
    B_usability: {
      firstReactionMs: runs.map(r => r.firstReactionMs),
      firstChoiceChangedVisual: runs.map(r => r.firstReactionPixels === 1),
      mobileOverflowPx: runs.map(r => r.overflowPx),
      tapTargetsUnder44px: runs.flatMap(r => r.smallTargets),
      scenesPerRun: runs.map(r => r.steps.length + 1),
    },
    C_intent: {
      commandSensitivity: cmdSensitivity,
      commandChangesEnding: cmdSensitivity.some(x => x.distinctEndings > 1),
      commandChangesEndingText: cmdSensitivity.every(x => x.distinctEndingTexts > 1),
      memoryCallbackShown: runs.map(r => !!r.memoryCallback),
      memoryCallbackIsRealChoice: runs.map(r => r.memoryCallback ? r.memoryCallback.isRealMemory : null),
      endings,
      distinctEndings: [...new Set(endings.filter(Boolean))],
      endingsDiverge: new Set(endings.filter(Boolean)).size > 1,
      hasNotTakenRoad: runs.every(r => r.hasRoad),
      finalPersonality: runs.map(r => r.ending ? { w: r.ending.warmth, a: r.ending.autonomy, h: r.ending.honesty } : null),
    },
  };
  await browser.close();
  console.log(JSON.stringify(report, null, 2));
})().catch(e => { console.error('PLAYER_CRASH: ' + e.message); process.exit(1); });
