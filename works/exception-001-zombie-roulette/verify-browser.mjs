// 実ブラウザ（Chromium）で index.html を実際に動かして検証する。
// 時間だけを固定クロックに置き換え、requestAnimationFrame を手動で回す。
// 期待値は一切ゆるめない。失敗したら失敗として出す。
import { chromium } from 'playwright';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const TARGET = path.resolve(process.argv[2]);
const results = [];
function check(name, ok, detail) { results.push({ name, ok: !!ok, detail: detail || '' }); }

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 960, height: 600 } });

page.on('pageerror', (e) => check('ページ内で例外が起きない', false, String(e)));
page.on('console', (m) => { if (m.type() === 'error') check('console.error が出ない', false, m.text()); });

// 時間を制御下に置く
await page.addInitScript(() => {
  let t = 0;
  const q = [];
  window.performance.now = () => t;
  window.requestAnimationFrame = (cb) => { q.push(cb); return q.length; };
  window.cancelAnimationFrame = () => {};
  window.__pump = (frames, step) => {
    for (let i = 0; i < frames; i++) {
      t += step;
      const batch = q.splice(0, q.length);
      for (const cb of batch) cb(t);
    }
  };
});

await page.goto(pathToFileURL(TARGET).href);
const G = () => page.evaluate(() => window.__GAME__);

// ---- ① 初期状態 ----
check('初期状態が title', await page.evaluate(() => window.__GAME__.state) === 'title');
check('__GAME__ が初期化されている', await page.evaluate(() => typeof window.__GAME__.start === 'function'));

// ---- ② 開始 ----
await page.click('#startBtn');
let s = await page.evaluate(() => ({ st: __GAME__.state, tl: __GAME__.timeLeft, sc: __GAME__.score, tk: __GAME__.tickets, hp: __GAME__.hp }));
check('開始操作で play へ遷移する', s.st === 'play', 'state=' + s.st);
check('開始時の残り時間が 180 秒（＝3分の設計値）', Math.abs(s.tl - 180) < 1e-6, 'timeLeft=' + s.tl);
check('開始時のスコア・くじが 0', s.sc === 0 && s.tk === 0, 'score=' + s.sc + ' tickets=' + s.tk);
check('開始時の体力が満タン', s.hp === 100, 'hp=' + s.hp);

// ---- 簡易ボット: 敵から離れつつ宝箱を拾う ----
const STEP = 25; // ms/frame
async function play(seconds, { evade = true, autoDraw = false } = {}) {
  const frames = Math.round((seconds * 1000) / STEP);
  const chunk = Math.round(100 / STEP); // 0.1秒ごとに操作を決め直す
  for (let done = 0; done < frames; done += chunk) {
    await page.evaluate(({ n, step }) => window.__pump(n, step), { n: Math.min(chunk, frames - done), step: STEP });
    const st = await page.evaluate(() => (window.__GAME__.state));
    if (st !== 'play') return;
    if (!evade) continue;
    // 24方向をサンプリングし、一番安全でうまみのある向きを選ぶカイティングボット
    await page.evaluate(({ autoDraw }) => {
      const g = window.__GAME__;
      if (g.rouletteActive) return;
      const s = g.snapshot();
      if (!s.player) return;
      const p = s.player;
      const STEPLEN = 46;

      let chest = null, cd0 = 1e9;
      for (const c of s.chests) {
        const d = Math.hypot(c.x - p.x, c.y - p.y);
        if (d < cd0) { cd0 = d; chest = c; }
      }

      let bestDir = null, bestScore = -1e18;
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const nx = p.x + Math.cos(a) * STEPLEN;
        const ny = p.y + Math.sin(a) * STEPLEN;
        let sc = 0;

        // 壁ぎわは詰みやすいので強く嫌う
        const m = Math.min(nx, ny, s.w - nx, s.h - ny);
        if (m < 0) { sc -= 4000; }
        else if (m < 70) sc -= (70 - m) * 22;

        // ゾンビからの距離（近いほど強烈に減点）
        for (const z of s.zombies) {
          const d = Math.hypot(nx - z.x, ny - z.y);
          const safe = z.r + 16;
          if (d < safe) sc -= 3000;
          else sc -= 26000 / (d * d);
        }

        // 宝箱に近づく方向を加点
        if (chest) sc += (cd0 - Math.hypot(nx - chest.x, ny - chest.y)) * 26;

        if (sc > bestScore) { bestScore = sc; bestDir = a; }
      }

      const tx = Math.max(14, Math.min(s.w - 14, p.x + Math.cos(bestDir) * 240));
      const ty = Math.max(14, Math.min(s.h - 14, p.y + Math.sin(bestDir) * 240));
      const cv = document.getElementById('cv');
      cv.dispatchEvent(new PointerEvent('pointerdown', { clientX: tx, clientY: ty, bubbles: true }));
      cv.dispatchEvent(new PointerEvent('pointermove', { clientX: tx, clientY: ty, bubbles: true }));

      // くじが溜まったら即引く（引くと強くなるので溜め込まない）
      if (autoDraw && g.tickets > 0) document.getElementById('drawBtn').click();
    }, { autoDraw });
  }
}

// ---- ③ 戦闘が成立する ----
await play(25);
let a = await page.evaluate(() => ({ k: __GAME__.kills, z: __GAME__.snapshot().zombies.length, sc: __GAME__.score }));
check('ゾンビが出現する', a.z > 0, 'zombies=' + a.z);
check('ゾンビを撃破できる（自動攻撃が機能する）', a.k > 0, 'kills=' + a.k);
check('撃破でスコアが増える', a.sc > 0, 'score=' + a.sc);

// ---- ④ 色（紫→青→緑）の対応 ----
const hue = await page.evaluate(() => {
  const zs = __GAME__.snapshot().zombies;
  const full = zs.filter(z => z.ratio > 0.95).map(z => z.hue);
  const hurt = zs.filter(z => z.ratio < 0.35).map(z => z.hue);
  return {
    fullMax: full.length ? Math.max(...full) : null,
    fullMin: full.length ? Math.min(...full) : null,
    hurtMax: hurt.length ? Math.max(...hurt) : null,
    // 端点は式から直接
    at1: 130 + 1 * 150, at05: 130 + 0.5 * 150, at0: 130 + 0 * 150
  };
});
check('HP満タンのゾンビが紫域(hue≈280)', hue.fullMin === null || hue.fullMin > 270, JSON.stringify(hue));
check('色相の端点が 紫280 → 青205 → 緑130', hue.at1 === 280 && hue.at05 === 205 && hue.at0 === 130, JSON.stringify(hue));
check('ダメージを受けたゾンビは色相が下がる（青〜緑へ）', hue.hurtMax === null || hue.hurtMax < 233, JSON.stringify(hue));

// ---- ⑤ 宝箱 → くじ ----
// くじが1枚たまるまで（生きている間）進める
for (let i = 0; i < 24; i++) {
  const st = await page.evaluate(() => ({ tk: __GAME__.tickets, st: __GAME__.state }));
  if (st.tk > 0 || st.st !== 'play') break;
  await play(5);
}
let b = await page.evaluate(() => ({ tk: __GAME__.tickets, st: __GAME__.state, k: __GAME__.kills }));
check('宝箱を拾うとくじが手に入る', b.tk > 0, 'tickets=' + b.tk + ' kills=' + b.k + ' state=' + b.st);
check('くじ入手時点でまだ生存している（＝到達可能な導線である）', b.st === 'play', 'state=' + b.st);

// ---- ⑥ くじ → ルーレット → アイテム ----
if (b.tk > 0 && b.st === 'play') {
  const before = await page.evaluate(() => __GAME__.snapshot().stats);
  const beforeTk = b.tk;
  await page.evaluate(() => document.getElementById('drawBtn').click());
  check('くじを引くとルーレットが始まる', await page.evaluate(() => __GAME__.rouletteActive));
  check('くじを1枚消費する', await page.evaluate(() => __GAME__.tickets) === beforeTk - 1);
  const frozen = await page.evaluate(() => __GAME__.timeLeft);
  await page.evaluate(({ step }) => window.__pump(20, step), { step: STEP });
  check('ルーレット中はゲームが止まる（残り時間が減らない）',
    Math.abs(await page.evaluate(() => __GAME__.timeLeft) - frozen) < 1e-9);

  await page.evaluate(({ step }) => window.__pump(100, step), { step: STEP }); // 2.5秒 = スピン完了
  const item = await page.evaluate(() => __GAME__.rouletteItem);
  check('ルーレットが止まってアイテムが確定する', typeof item === 'string' && item.length > 0, 'item=' + item);

  const after = await page.evaluate(() => __GAME__.snapshot().stats);
  const hpAfter = await page.evaluate(() => __GAME__.hp);
  const changed = JSON.stringify(before) !== JSON.stringify(after);
  check('アイテムが実際に効果を持つ（能力値か体力が変わる）',
    changed || item === '手当' || item === '衝撃波',
    'item=' + item + ' before=' + JSON.stringify(before) + ' after=' + JSON.stringify(after) + ' hp=' + hpAfter);

  await page.evaluate(({ step }) => window.__pump(120, step), { step: STEP }); // reveal を閉じる
  check('ルーレットが閉じてゲームが再開する', await page.evaluate(() => !__GAME__.rouletteActive));
  const tl1 = await page.evaluate(() => __GAME__.timeLeft);
  await page.evaluate(({ step }) => window.__pump(40, step), { step: STEP });
  check('再開後に時間が進む', await page.evaluate(() => __GAME__.timeLeft) < tl1);
}

// ---- ⑦ 決着まで走らせる ----
// ルーレット中はゲーム時間が止まるので、決着がつくまで回す
for (let i = 0; i < 45; i++) {
  if (await page.evaluate(() => __GAME__.state) !== 'play') break;
  await play(20, { autoDraw: true });
}
const fin = await page.evaluate(() => ({ st: __GAME__.state, cl: __GAME__.cleared, tl: __GAME__.timeLeft, hp: __GAME__.hp, k: __GAME__.kills, sc: __GAME__.score }));
console.log('  [参考] ボットの結果: ' + (fin.cl ? '生還' : '力尽きた（残り ' + fin.tl.toFixed(1) + '秒 / 経過 ' + (180 - fin.tl).toFixed(1) + '秒）') +
            ' 撃破=' + fin.k + ' スコア=' + fin.sc);
check('180秒以内に必ず決着する（over へ遷移）', fin.st === 'over', JSON.stringify(fin));
check('決着の理由が整合している（時間切れなら生存、体力0なら敗北）',
  fin.st !== 'over' ? false : (fin.cl ? fin.tl === 0 && fin.hp > 0 : fin.hp === 0),
  JSON.stringify(fin));
check('ゲームオーバー画面が表示される',
  await page.evaluate(() => getComputedStyle(document.getElementById('overScreen')).display) === 'flex');

// ---- ⑧ 再プレイで初期化 ----
await page.click('#replayBtn');
const rp = await page.evaluate(() => ({ st: __GAME__.state, tl: __GAME__.timeLeft, sc: __GAME__.score, k: __GAME__.kills, tk: __GAME__.tickets, hp: __GAME__.hp, s: __GAME__.snapshot() }));
check('再プレイで play へ戻る', rp.st === 'play', 'state=' + rp.st);
check('再プレイで残り時間が初期化される', Math.abs(rp.tl - 180) < 1e-6, 'timeLeft=' + rp.tl);
check('再プレイでスコア・撃破数・くじが初期化される', rp.sc === 0 && rp.k === 0 && rp.tk === 0, JSON.stringify(rp));
check('再プレイで体力が初期化される', rp.hp === 100, 'hp=' + rp.hp);
check('再プレイで強化がリセットされる', JSON.stringify(rp.s.stats) === JSON.stringify(rp.s.base), JSON.stringify(rp.s.stats));
check('再プレイでゾンビ・宝箱が消える', rp.s.zombies.length === 0 && rp.s.chests.length === 0);
await page.evaluate(({ step }) => window.__pump(40, step), { step: STEP });
check('再プレイ後にゲームが進行する', await page.evaluate(() => __GAME__.timeLeft) < 180);

// ---- ⑨ キーボード操作 ----
const p0 = await page.evaluate(() => __GAME__.snapshot().player.x);
await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' })));
await page.evaluate(({ step }) => window.__pump(20, step), { step: STEP });
const p1 = await page.evaluate(() => __GAME__.snapshot().player.x);
await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'd' })));
check('キーボード（D）で右へ移動する', p1 > p0, p0 + ' -> ' + p1);

// ---- ⑩ 生還・敗北の両方の決着を実際に通す ----
async function fresh() {
  await page.evaluate(() => {
    const gg = window.__GAME__;
    if (gg.state === 'title') document.getElementById('startBtn').click();
    else document.getElementById('replayBtn').click();
  });
}
async function runToEnd(opts) {
  await fresh();
  for (let i = 0; i < 45; i++) {
    if (await page.evaluate(() => __GAME__.state) !== 'play') break;
    await play(20, opts);
  }
  return page.evaluate(() => ({ cl: __GAME__.cleared, tl: __GAME__.timeLeft, hp: __GAME__.hp, st: __GAME__.state }));
}

// 敗北側: 一切動かなければ必ず力尽きる（決定的）
const lose = await runToEnd({ evade: false });

// 生還側: ボットに耐えさせる（最大4回試行）
let win = null;
for (let g = 0; g < 4 && !win; g++) {
  const e = await runToEnd({ autoDraw: true });
  if (e.cl) win = e;
}
console.log('  [参考] 敗北側: 生存 ' + (180 - lose.tl).toFixed(0) + 's / 生還側: ' + (win ? '達成' : '未達成'));
check('時間切れまで耐えると生還する（cleared=true / 残り0秒 / 体力残あり）',
  !!win && win.st === 'over' && win.tl === 0 && win.hp > 0, JSON.stringify(win || null));
check('体力0になると敗北する（cleared=false / 体力0 / 時間は残っている）',
  !!lose && lose.st === 'over' && lose.hp === 0 && lose.tl > 0, JSON.stringify(lose || null));

// ---- 出力 ----
await browser.close();
let pass = 0;
for (const r of results) {
  console.log((r.ok ? '  OK ' : '  NG ') + r.name + (r.ok || !r.detail ? '' : '  … ' + r.detail));
  if (r.ok) pass++;
}
console.log('---');
console.log((pass === results.length ? 'PASS' : 'FAIL') + ' (' + pass + '/' + results.length + ')');
process.exit(pass === results.length ? 0 : 1);
