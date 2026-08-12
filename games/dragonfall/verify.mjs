#!/usr/bin/env node
// verify.mjs — machine verification for games/dragonfall/index.html
//
// Usage: node games/dragonfall/verify.mjs
//
// This game is NOT a Browser-Toy seed, so the repository's 60-second
// smoke contract (smoke.mjs / CONSTRAINTS.md Part II) is not its
// contract and is deliberately not reused here. What is reused is the
// honest part of that method: run the real inline script on a minimal
// DOM shim and assert on observable game state, never on the source text.
//
// Checks:
//   1  index.html exists
//   2  no external requests or external URL references
//   3  the inline script parses
//   4  it loads, initialises, and 30 frames run without throwing
//   5  START moves title -> play, in stage 1, with the starting weapon
//   6  weapons fire on their own and actually kill things
//   7  item tiers are gated: stage 1 never offers anything above tier 1
//   8  stage 1 boss is the zombie horde, and its horde armour engages
//   9  the stage chain is horde -> frost -> storm -> dragon
//  10  the ultimate items exist ONLY in the final stage, and are offered there
//  11  the dragon changes phase as it loses health
//  12  replay resets stage, level, kills and build
//
// Weakening a check, deleting one, or relaxing an expectation to force a
// pass is forbidden (CONSTRAINTS.md Part I §6).

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(here, 'index.html');

const results = [];
function record(no, name, ok, detail){ results.push({ no, name, ok: !!ok, detail: detail || '' }); }
function assert(cond, msg){ if (!cond) throw new Error(msg); }

// ---------- 1. exists ----------
let html = null;
{
  const ok = fs.existsSync(htmlPath);
  if (ok) html = fs.readFileSync(htmlPath, 'utf8');
  record(1, 'index.html exists', ok, ok ? '' : 'not found: ' + htmlPath);
}

// ---------- 2. no external references ----------
if (html !== null){
  const rules = [
    [/https?:\/\//i, 'absolute http(s) URL'],
    [/\bfetch\s*\(/, 'fetch()'],
    [/XMLHttpRequest/, 'XMLHttpRequest'],
    [/\bWebSocket\b/, 'WebSocket'],
    [/\bEventSource\b/, 'EventSource'],
    [/sendBeacon/, 'sendBeacon'],
    [/<script[^>]+src=/i, '<script src>'],
    [/<link\b/i, '<link>'],
    [/@import/i, '@import'],
    [/\burl\s*\(/i, 'CSS url()'],
    [/\bimport\s*\(/, 'dynamic import()']
  ];
  const hits = rules.filter(function(r){ return r[0].test(html); }).map(function(r){ return r[1]; });
  record(2, 'no external requests or URL references', hits.length === 0, hits.join(', '));
}

// ---------- extract inline script ----------
let jsCode = '';
if (html !== null){
  const m = html.match(/<script>([\s\S]*?)<\/script>/);
  jsCode = m ? m[1] : '';
}

// ---------- 3. parses ----------
{
  let ok = false, detail = '';
  try { new vm.Script(jsCode, { filename: 'dragonfall-inline.js' }); ok = true; }
  catch (e){ detail = String(e && e.message || e); }
  record(3, 'inline script parses', ok, detail);
}

// ---------- DOM shim ----------
function makeCtx(){
  const store = {};
  return new Proxy(store, {
    get(t, k){
      if (k in t) return t[k];
      if (k === 'createLinearGradient' || k === 'createRadialGradient'){
        return function(){ return { addColorStop: function(){} }; };
      }
      if (k === 'measureText') return function(){ return { width: 10 }; };
      if (typeof k === 'symbol') return undefined;
      return function(){};
    },
    set(t, k, v){ t[k] = v; return true; }
  });
}

function makeEl(id, childCount){
  const classes = new Set();
  const el = {
    id: id,
    listeners: {},
    children: [],
    className: '',
    _text: '',
    style: {
      setProperty: function(){},
      removeProperty: function(){},
      getPropertyValue: function(){ return ''; }
    },
    classList: {
      add: function(c){ classes.add(c); },
      remove: function(c){ classes.delete(c); },
      contains: function(c){ return classes.has(c); },
      toggle: function(c){ if (classes.has(c)) classes.delete(c); else classes.add(c); }
    },
    addEventListener: function(type, fn){ (this.listeners[type] || (this.listeners[type] = [])).push(fn); },
    removeEventListener: function(){},
    appendChild: function(){},
    getContext: function(){ return el._ctx || (el._ctx = makeCtx()); },
    getBoundingClientRect: function(){ return { left: 0, top: 0, width: 900, height: 600 }; },
    clientWidth: 900,
    clientHeight: 600,
    width: 900,
    height: 600
  };
  Object.defineProperty(el, 'textContent', {
    get: function(){ return el._text; },
    set: function(v){ el._text = String(v); }
  });
  for (let i = 0; i < (childCount || 0); i++) el.children.push(makeEl(id + ':' + i, 0));
  return el;
}

function makeSandbox(){
  const els = {};
  const CARD_CHILDREN = 4;
  function el(id){
    if (!els[id]) els[id] = makeEl(id, /^card\d$/.test(id) ? CARD_CHILDREN : 0);
    return els[id];
  }
  const rafQueue = [];
  const clock = { t: 0 };
  const documentEl = makeEl('html', 0);

  const doc = {
    getElementById: function(id){ return el(id); },
    createElement: function(tag){ return makeEl('created:' + tag, 0); },
    documentElement: documentEl,
    body: makeEl('body', 0),
    addEventListener: function(){}
  };

  const win = {
    innerWidth: 900,
    innerHeight: 600,
    devicePixelRatio: 1,
    listeners: {},
    addEventListener: function(type, fn){ (this.listeners[type] || (this.listeners[type] = [])).push(fn); },
    removeEventListener: function(){}
  };

  const sandbox = {
    window: win,
    document: doc,
    performance: { now: function(){ return clock.t; } },
    requestAnimationFrame: function(cb){ rafQueue.push(cb); return rafQueue.length; },
    cancelAnimationFrame: function(){},
    setTimeout: function(fn){ return 0; },      // the game must not depend on timers
    clearTimeout: function(){},
    console: console
  };
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;

  function pump(frames, msPerFrame){
    const step = msPerFrame == null ? 16.7 : msPerFrame;
    for (let i = 0; i < frames; i++){
      clock.t += step;
      const cbs = rafQueue.splice(0, rafQueue.length);
      for (let j = 0; j < cbs.length; j++) cbs[j](clock.t);
    }
  }
  function fire(target, type, ev){
    const list = target.listeners[type] || [];
    for (let i = 0; i < list.length; i++) list[i](ev || {});
  }
  return { sandbox, el, win, doc, pump, fire, clock };
}

function stubEvent(over){
  const e = { clientX: 400, clientY: 300, pointerId: 1,
    preventDefault: function(){}, stopPropagation: function(){} };
  return Object.assign(e, over || {});
}

// ---------- 4. loads ----------
let env = null, G = null;
{
  let ok = false, detail = '';
  if (results[2].ok){
    try {
      env = makeSandbox();
      vm.createContext(env.sandbox);
      vm.runInContext(jsCode, env.sandbox, { filename: 'dragonfall-inline.js' });
      G = env.sandbox.window.__GAME__;
      assert(G && typeof G.start === 'function' && typeof G.state === 'string',
        '__GAME__ hook not initialised');
      assert(G.state === 'title', 'initial state is not title: ' + G.state);
      env.pump(30);
      ok = true;
    } catch (e){
      detail = e && e.stack ? String(e.stack).split('\n').slice(0, 4).join(' | ') : String(e);
    }
  } else detail = 'skipped (check 3 failed)';
  record(4, 'loads and runs 30 frames without throwing', ok, detail);
}

// ---------- movement driver: uses the real keyboard path ----------
const DIRS = ['d', 's', 'a', 'w'];
let dirIndex = 0, held = null;
function holdDir(k){
  if (held === k) return;
  if (held) env.fire(env.win, 'keyup', { key: held });
  held = k;
  env.fire(env.win, 'keydown', { key: k, preventDefault: function(){} });
}
function pumpMoving(seconds){
  // Reposition in short bursts and then stand, the way a person plays.
  // Never holding a direction forever matters: an agent that runs in a
  // straight line at full speed outruns the whole game and proves nothing.
  const frames = Math.round(seconds * 60);
  let done = 0;
  while (done < frames){
    holdDir(DIRS[(dirIndex++) % DIRS.length]);
    const move = Math.min(16, frames - done);
    env.pump(move); done += move;
    if (done >= frames) break;
    releaseAll();
    const rest = Math.min(20, frames - done);
    env.pump(rest); done += rest;
  }
}
function releaseAll(){ if (held) { env.fire(env.win, 'keyup', { key: held }); held = null; } }

function startGame(){
  env.fire(env.el('startBtn'), 'click', stubEvent());
  env.pump(2);
}

// ---------- 5. start ----------
if (results[3].ok){
  let ok = false, detail = '';
  try {
    startGame();
    assert(G.state === 'play', 'state after START is not play: ' + G.state);
    assert(G.stageIndex === 0, 'did not begin at stage 1: ' + G.stageIndex);
    assert(G.stageName === 'ROTTING FIELDS', 'stage 1 name wrong: ' + G.stageName);
    assert(G.level === 1 && G.kills === 0, 'run did not start clean');
    assert(G.build.weapons.blade === 1, 'starting weapon missing: ' + JSON.stringify(G.build));
    assert(G.phase === 'survive', 'stage 1 did not begin in survive phase: ' + G.phase);
    ok = true;
  } catch (e){ detail = String(e && e.message || e); }
  record(5, 'START enters stage 1 with the starting weapon', ok, detail);
} else record(5, 'START enters stage 1 with the starting weapon', false, 'skipped');

// ---------- 6. auto-attack actually kills ----------
if (results[4].ok){
  let ok = false, detail = '';
  try {
    pumpMoving(14);
    const snap = 'state=' + G.state + ' enemies=' + G.enemyCount + ' kills=' + G.kills +
      ' level=' + G.level + ' hp=' + Math.round(G.hp);
    assert(G.enemyCount > 0, 'no enemies spawned in 14s — ' + snap);
    assert(G.kills > 0, 'weapons fired for 14s without a single kill — ' + snap);
    assert(G.level > 1, 'no experience gained in 14s — ' + snap);
    ok = true;
  } catch (e){ detail = String(e && e.message || e); }
  record(6, 'weapons fire on their own and kill', ok, detail);
} else record(6, 'weapons fire on their own and kill', false, 'skipped');

// ---------- helper: clear any pending choice screen ----------
function resolveChoices(collector){
  let guard = 0;
  while (G.state === 'levelup' && guard++ < 400){
    if (collector) collector(G.choices.slice(), G.offeredTiers().slice());
    G.choose(0);
    env.pump(1);
  }
  return guard;
}

// ---------- 7. tier gating in stage 1 ----------
if (results[5].ok){
  let ok = false, detail = '';
  try {
    const seenTiers = new Set(), seenIds = new Set();
    for (let i = 0; i < 40; i++){
      G.grantLevels(1);
      env.pump(2);
      resolveChoices(function(ids, tiers){
        ids.forEach(function(x){ seenIds.add(x); });
        tiers.forEach(function(t){ seenTiers.add(t); });
      });
      pumpMoving(0.2);
    }
    const above = Array.from(seenTiers).filter(function(t){ return t > 1; });
    assert(seenTiers.size > 0, 'no level-up choices were ever offered');
    assert(above.length === 0, 'stage 1 offered tier(s) ' + above.join(',') + ' — ' + Array.from(seenIds).join(','));
    assert(!seenIds.has('fang') && !seenIds.has('ancient'), 'ultimate offered in stage 1');
    ok = true;
  } catch (e){ detail = String(e && e.message || e); }
  record(7, 'stage 1 offers tier 1 only', ok, detail);
} else record(7, 'stage 1 offers tier 1 only', false, 'skipped');

// ---------- 8. the zombie horde boss ----------
if (results[6].ok){
  let ok = false, detail = '';
  try {
    G.skipToBoss();
    env.pump(2);
    assert(G.phase === 'warning', 'no warning phase before the boss: ' + G.phase);
    pumpMoving(4);
    assert(G.phase === 'boss', 'boss phase never began: ' + G.phase);
    assert(G.bossAlive && G.bossId === 'horde', 'stage 1 boss is not the horde: ' + G.bossId);
    // horde armour: it summons its own crowd, and that crowd protects it
    let armoured = false, maxMinions = 0, samples = 0;
    for (let i = 0; i < 40 && G.bossAlive; i++){
      pumpMoving(0.5);
      resolveChoices();
      if (!G.bossAlive) break;
      samples++;
      maxMinions = Math.max(maxMinions, G.bossMinions);
      if (G.bossArmorMul < 1) armoured = true;
    }
    assert(samples > 0, 'the boss was never observed alive');
    assert(maxMinions > 0, 'the horde boss never had minions near it');
    assert(armoured, 'horde armour never engaged despite ' + maxMinions + ' minions');
    ok = true;
  } catch (e){ detail = String(e && e.message || e); }
  record(8, 'stage 1 boss is the zombie horde with horde armour', ok, detail);
} else record(8, 'stage 1 boss is the zombie horde with horde armour', false, 'skipped');

// ---------- 9 + 10. the stage chain and the ultimate gate ----------
const EXPECT = [
  { idx: 0, boss: 'horde',  name: 'ROTTING FIELDS' },
  { idx: 1, boss: 'frost',  name: 'FROZEN EXPANSE' },
  { idx: 2, boss: 'storm',  name: 'THUNDER PEAK' },
  { idx: 3, boss: 'dragon', name: "DRAGON'S ROOST" }
];
let chainOk = false, chainDetail = '', ultOk = false, ultDetail = '';
let ultOfferedAtStage = null, ultIds = [];
if (results[7].ok){
  try {
    // fresh run, so this check never depends on how check 8 happened to end
    G.start();
    env.pump(3);
    for (let s = 0; s < EXPECT.length; s++){
      const want = EXPECT[s];
      assert(G.stageIndex === want.idx, 'expected stage ' + want.idx + ', got ' + G.stageIndex);
      assert(G.stageName === want.name, 'stage ' + want.idx + ' name: ' + G.stageName);

      if (!G.bossAlive){
        G.skipToBoss();
        env.pump(2);
        for (let g = 0; g < 40 && !G.bossAlive; g++){ pumpMoving(0.4); resolveChoices(); }
      }
      // entering the final stage must hand over the ultimate, before anything else
      if (want.idx === 3 && ultOfferedAtStage === null){
        throw new Error('final stage began without offering the ultimate');
      }
      assert(G.bossAlive, 'boss never spawned in stage ' + want.idx);
      assert(G.bossId === want.boss, 'stage ' + want.idx + ' boss is ' + G.bossId + ', expected ' + want.boss);

      if (want.boss === 'dragon') break;

      G.killBoss();
      pumpMoving(2);
      resolveChoices();
      assert(G.state === 'clear', 'boss death did not clear the stage: ' + G.state);
      G.next();
      env.pump(4);
      // the ultimate choice fires a moment into the final stage
      for (let w = 0; w < 30 && G.state === 'play' && G.stageIndex === 3 && ultOfferedAtStage === null; w++){
        pumpMoving(0.2);
        if (G.state === 'levelup'){
          ultIds = G.choices.slice();
          ultOfferedAtStage = G.stageIndex;
          resolveChoices();
        }
      }
      resolveChoices(function(ids){
        if (ids.indexOf('fang') >= 0 || ids.indexOf('ancient') >= 0){
          ultIds = ids; ultOfferedAtStage = G.stageIndex;
        }
      });
    }
    chainOk = true;
  } catch (e){ chainDetail = String(e && e.message || e); }

  try {
    assert(ultOfferedAtStage === 3, 'the ultimate was offered at stage ' + ultOfferedAtStage + ', not the final stage');
    assert(ultIds.indexOf('fang') >= 0, 'DRAGONFANG was not in the final offer: ' + ultIds.join(','));
    assert(ultIds.indexOf('ancient') >= 0, 'ANCIENT CORE was not in the final offer: ' + ultIds.join(','));
    assert(G.itemTier('fang') === 4 && G.itemTier('ancient') === 4, 'ultimate items are not tier 4');
    ultOk = true;
  } catch (e){ ultDetail = String(e && e.message || e); }
}
record(9, 'stage chain is horde -> frost -> storm -> dragon', chainOk, chainDetail || (results[7].ok ? '' : 'skipped'));
record(10, 'the ultimate items appear only in the final stage', ultOk, ultDetail || (results[7].ok ? '' : 'skipped'));

// ---------- 11. the dragon changes phase ----------
{
  let ok = false, detail = '';
  try {
    assert(chainOk, 'skipped (stage chain failed)');
    assert(G.bossId === 'dragon' && G.bossAlive, 'the dragon is not in play');
    const seen = new Set([G.bossPhase]);
    for (let i = 0; i < 260 && G.bossAlive; i++){
      G.hurtBoss(600);
      pumpMoving(0.12);
      resolveChoices();
      seen.add(G.bossPhase);
      if (G.state !== 'play') break;
    }
    assert(seen.has(1) && seen.has(2) && seen.has(3),
      'the dragon did not pass through all three phases: saw ' + Array.from(seen).join(','));
    ok = true;
  } catch (e){ detail = String(e && e.message || e); }
  record(11, 'the dragon fights in three phases', ok, detail);
}

// ---------- 12. replay resets ----------
{
  let ok = false, detail = '';
  try {
    assert(G, 'no game');
    // whatever state the run ended in, REPLAY must rebuild it from zero
    G.start();
    env.pump(3);
    assert(G.state === 'play', 'replay did not enter play: ' + G.state);
    assert(G.stageIndex === 0, 'replay did not return to stage 1: ' + G.stageIndex);
    assert(G.stageName === 'ROTTING FIELDS', 'replay stage name: ' + G.stageName);
    assert(G.level === 1, 'replay kept the old level: ' + G.level);
    assert(G.kills === 0, 'replay kept the old kills: ' + G.kills);
    assert(G.bossAlive === false, 'replay kept a boss alive');
    const b = G.build;
    assert(Object.keys(b.weapons).length === 1 && b.weapons.blade === 1,
      'replay kept the old build: ' + JSON.stringify(b.weapons));
    assert(Object.keys(b.passives).length === 0, 'replay kept old relics: ' + JSON.stringify(b.passives));
    pumpMoving(3);
    assert(G.state === 'play' || G.state === 'levelup', 'replayed run did not progress: ' + G.state);
    ok = true;
  } catch (e){ detail = String(e && e.message || e); }
  record(12, 'replay resets stage, level, kills and build', ok, detail);
}

releaseAll();

// ---------- report ----------
let failed = 0;
console.log('\nDRAGONFALL — verification\n');
for (const r of results){
  if (!r.ok) failed++;
  console.log((r.ok ? '  PASS  ' : '  FAIL  ') + String(r.no).padStart(2, ' ') + '  ' + r.name +
    (r.detail ? '\n          ' + r.detail : ''));
}
console.log('\n' + (failed === 0 ? 'all ' + results.length + ' checks passed' : failed + ' of ' + results.length + ' checks failed') + '\n');
process.exit(failed === 0 ? 0 : 1);
