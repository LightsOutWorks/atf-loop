/**
 * ECHO v2 AI Player — Machine Evaluation は4項目だけを見る（D-015 / EXPERIENCE_BRIEF §2）。
 *   ①壊れていない ②操作できる ③意図したMechanicが存在する ④variant差分が実際に入っている
 * 「面白い」「かわいい」「愛着が湧く」は判定しない。それは Human Taste Gate。
 * 使い方: NODE_PATH=/opt/node22/lib/node_modules node v2/play2.cjs <file.html> [...]
 */
const { chromium } = require('playwright');
const path = require('path');
const MOBILE = { width: 390, height: 844 };

async function run(page, file) {
  const errs = [];
  page.removeAllListeners('pageerror'); page.removeAllListeners('console');
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.goto('file://' + path.resolve(file), { waitUntil: 'load' });
  await page.waitForTimeout(400);

  const o = { file: path.basename(file), errors: errs, mechanics: {}, diff: {} };
  const hook = await page.evaluate(() => !!window.__ECHO2__);
  if (!hook) { o.fatal = 'window.__ECHO2__ が無い'; return o; }
  o.variant = await page.evaluate(() => window.__ECHO2__.variant);
  o.cfg = await page.evaluate(() => { const c = window.__ECHO2__.cfg();
    return { size:c.size, earLen:c.earLen, earRest:c.earRest, accel:c.accel, maxv:c.maxv,
             voiceBase:c.voice.base, voiceTy:c.voice.ty, chirps:c.voice.chirps, eventEvery:c.eventEvery }; });

  const snap = () => page.evaluate(() => window.__ECHO2__.state);
  const shot = async () => (await page.locator('#c').screenshot()).toString('base64');

  // ② 操作できる: 実タッチで撫でる
  const s0 = await snap(), pix0 = await shot();
  const box = { x: s0.x, y: s0.y };
  await page.mouse.move(box.x - 30, box.y);
  await page.mouse.down();
  for (let i = -30; i <= 30; i += 6) { await page.mouse.move(box.x + i, box.y + Math.sin(i/8)*4); await page.waitForTimeout(16); }
  await page.mouse.up();
  await page.waitForTimeout(300);
  const s1 = await snap(), pix1 = await shot();
  o.mechanics.L1_stroke = { touchesUp: s1.touches > s0.touches, trustUp: s1.trust > s0.trust };
  o.mechanics.visualChangedOnTouch = pix0 !== pix1;

  // ① 反応の即時性（入力→見た目が変わるまで）
  const t0 = Date.now();
  await page.evaluate(() => window.__ECHO2__.api.poke(innerWidth/2, innerHeight/2));
  await page.waitForTimeout(120);
  o.mechanics.reactionMs = Date.now() - t0;

  // L-2 呼ぶ: 純関数を軸ごとに独立に振る（Round 1 Learning 3 の適用）
  o.mechanics.L2_call = await page.evaluate(() => {
    const f = window.__ECHO2__.pure.decideCall, grid = [];
    for (const trust of [-0.8,-0.3,0,0.3,0.8]) for (const indep of [-0.6,0,0.6]) {
      let came = 0; for (let i=0;i<200;i++) if (f(trust,indep,i/200)) came++;
      grid.push({trust,indep,comeRate:came/200});
    }
    return { grid, everComes: grid.some(g=>g.comeRate>0.05),
             everRefuses: grid.some(g=>g.comeRate<0.95),
             trustMatters: Math.abs(grid.find(g=>g.trust===0.8&&g.indep===0).comeRate
                                  - grid.find(g=>g.trust===-0.8&&g.indep===0).comeRate) > 0.3,
             indepMatters: Math.abs(grid.find(g=>g.trust===0&&g.indep===-0.6).comeRate
                                  - grid.find(g=>g.trust===0&&g.indep===0.6).comeRate) > 0.2 };
  });
  // 実操作でも呼べるか（純関数だけで満足しない）
  o.mechanics.L2_liveCall = await page.evaluate(async () => {
    const b = window.__ECHO2__.state.called;
    for (let i=0;i<10;i++){ window.__ECHO2__.api.callEcho(innerWidth*0.15, innerHeight*0.7);
      await new Promise(r=>setTimeout(r,60)); }
    const s = window.__ECHO2__.state;
    return { calls: s.called-b, answered: s.answered, sawEarOnly: s.log.includes('耳だけ向いた') };
  });

  // L-3 与える: 3種すべて渡して 好き/嫌い が分かれるか
  const eat = await page.evaluate(async () => {
    const A = window.__ECHO2__.api, res = [];
    for (const f of A.foods().slice()) {
      const b = window.__ECHO2__.state;
      f.x = window.__ECHO2__.state.x; f.y = window.__ECHO2__.state.y;
      A.offerFood(f);
      await new Promise(r => setTimeout(r, 40));
      res.push({ k: f.k, gone: !!f.gone, rejected: !!f.rejected });
    }
    return res; });
  o.mechanics.L3_feed = { offered: eat.length, accepted: eat.filter(e=>e.gone).length,
                          rejected: eat.filter(e=>!e.gone).length };

  // L-4 遊ぶ: 実ポインタで地面のボールを掴んで投げる（座標は決め打ちせず実測値を使う）
  o.mechanics.L4_play = await page.evaluate(async () => {
    const A = window.__ECHO2__.api;
    if (typeof ball === 'undefined' || !ball) return { ballOnGroundAtBoot: false };
    const bx = ball.x, by = ball.y, b0 = window.__ECHO2__.state.played;
    A.down(bx, by); await new Promise(r=>setTimeout(r,30));
    for (let i=1;i<=8;i++){ A.move(bx+i*16, by-i*7); await new Promise(r=>setTimeout(r,16)); }
    A.up(bx+128, by-56);
    await new Promise(r=>setTimeout(r,2600));
    const s = window.__ECHO2__.state;
    return { ballOnGroundAtBoot: true, grabbableFromGround: s.played > b0,
             chased: s.log.includes('ボールを捕まえた') || ['chase','bring','keep'].includes(s.st),
             log: s.log.filter(l=>l.indexOf('ボール')>=0) };
  });

  // L-5 邪魔する / L-6 助ける: 状態を直接立ててから叩く（軸を独立に振る）
  const inter = await page.evaluate(async () => {
    const A = window.__ECHO2__.api, out = {};
    A.forceState('mischief'); await new Promise(r=>setTimeout(r,60));
    const b1 = window.__ECHO2__.state.interfered; out.interrupted = A.interrupt();
    out.interferedCounted = window.__ECHO2__.state.interfered > b1;
    A.forceState('stuck'); await new Promise(r=>setTimeout(r,60));
    const b2 = window.__ECHO2__.state.helped; out.helped = A.help();
    out.helpedCounted = window.__ECHO2__.state.helped > b2;
    // 自発行動を止めなければ完遂するか（完遂直後に次の自発行動が始まるので log で見る）
    A.forceState('play_alone'); const t=Date.now(); let done=false;
    while(Date.now()-t<9000){ if(window.__ECHO2__.state.log.includes('ひとり遊びを終えた')){done=true;break;}
      await new Promise(r=>setTimeout(r,100)); }
    out.completesIfLeftAlone = done;
    return out; });
  o.mechanics.L5_interfere = inter;

  // L-8 自発行動が実際に起きるか
  const auto = await page.evaluate(async () => {
    const seen = new Set(); const t = Date.now();
    while (Date.now() - t < 22000) { seen.add(window.__ECHO2__.state.st); await new Promise(r=>setTimeout(r,120)); }
    return [...seen]; });
  o.mechanics.L8_autonomousStates = auto.filter(s => s !== 'idle');

  // L-9 音: AudioContext が起きているか + 個体差パラメータ
  const st9 = await snap();
  o.mechanics.L9_audio = { contextCreated: st9.audio, voiceBase: st9.voiceBase };

  // L-7 育ちが体に出る
  o.mechanics.L7_bodyGrew = st9.bodyGrow > 0;

  // L-10 最後のお願い: 3分岐すべてが到達可能か（純関数で軸を振る）+ 実際に発火するか
  o.mechanics.L10_ask = await page.evaluate(async () => {
    const f = window.__ECHO2__.pure.decideAsk, seen = {};
    for (const trust of [-0.9,-0.3,0.3,0.9]) for (const indep of [-0.8,-0.2,0.2,0.8])
      for (const r1 of [0.2,0.8]) for (const r2 of [0.2,0.8]) {
        const d = f({trust,indep,helped:2,interfered:2}, r1, r2); seen[d]=(seen[d]||0)+1; }
    window.__ECHO2__.api.forceAsk(); await new Promise(r=>setTimeout(r,150));
    const armed = window.__ECHO2__.state.askPhase === 1;
    window.__ECHO2__.api.resolveAsk(); await new Promise(r=>setTimeout(r,9000));
    const s = window.__ECHO2__.state;
    // 'go' は歩いて向かう分岐。体格が育っても目的地へ到達できるかを直接確かめる。
    window.__ECHO2__.api.forceState('ask_go');
    let goDone = false; const t0 = Date.now();
    while (Date.now() - t0 < 12000) { if (window.__ECHO2__.state.askPhase === 3) { goDone = true; break; }
      await new Promise(r => setTimeout(r, 200)); }
    return { branchesReachable: Object.keys(seen).sort(), branchCounts: seen,
             armed, liveDecision: s.askDone, reachedFinalPhase: s.askPhase === 3,
             goBranchCompletes: goDone };
  });

  // ④ variant差分が実際に入っているか — 挙動で測る
  o.diff = await page.evaluate(async () => {
    const A = window.__ECHO2__.api, R = {};
    const S0 = () => window.__ECHO2__.state;
    // (a) 指を体の外に置いて押さえ続けた時の平均距離（近づく / 逃げる / 無関心）
    const px = innerWidth*0.5, py = innerHeight*0.55;
    A.down(px, py); let acc=0, n=0;
    for (let i=0;i<40;i++){ A.move(px,py); await new Promise(r=>setTimeout(r,50));
      const s=S0(); acc+=Math.hypot(s.x-px, s.y-py); n++; }
    A.up(px,py); R.meanDistToHeldFinger = Math.round(acc/n);
    await new Promise(r=>setTimeout(r,400));
    // (b) 体を100pxドラッグして離した後の跳ね（変位）
    let s1=S0(); A.down(s1.x, s1.y);
    for (let i=1;i<=10;i++){ A.move(s1.x, s1.y-i*10); await new Promise(r=>setTimeout(r,20)); }
    A.up(s1.x, s1.y-100);
    const yAt = []; for (let i=0;i<24;i++){ await new Promise(r=>setTimeout(r,40)); yAt.push(S0().y); }
    R.dragReleaseRise = Math.round(Math.max(0, s1.y - Math.min(...yAt)));
    // (c) 無操作60フレームでの自発移動量
    await new Promise(r=>setTimeout(r,600));
    let s2=S0(), mv=0, prev=s2.x;
    for (let i=0;i<50;i++){ await new Promise(r=>setTimeout(r,60)); const s=S0(); mv+=Math.abs(s.x-prev); prev=s.x; }
    R.idleTravelPx = Math.round(mv);
    return R;
  });

  const fin = await snap();
  o.log = fin.log.slice(-14);
  o.overflowPx = await page.evaluate(() =>
    Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
  return o;
}

(async () => {
  const files = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium/chrome-linux/chrome' })
    .catch(() => chromium.launch());
  const ctx = await browser.newContext({ viewport: MOBILE, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const out = [];
  for (const f of files) out.push(await run(page, f));
  await browser.close();
  console.log(JSON.stringify(out, null, 2));
})().catch(e => { console.error('PLAYER_CRASH: ' + e.message); process.exit(1); });
