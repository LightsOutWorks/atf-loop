#!/usr/bin/env node
// smoke.mjs — index.html の機械検証(検証項目は CONSTRAINTS.md で 6 つに固定)
// 使い方: node smoke.mjs [対象ディレクトリ]
//   第1引数に作品ディレクトリ(例: works/seed-002)を指定すると、その中の index.html を検証する。
//   省略時は従来どおり、このスクリプトと同じ階層(ルート作品)の index.html を検証する。
//   ① index.html が存在する
//   ② 外部通信・外部URL参照がない
//   ③ script が構文エラーを起こさない
//   ④ 読み込みが成功する(スクリプトが例外なく実行され、ゲームが初期化される)
//   ⑤ 開始操作が存在する(開始操作で play 状態へ遷移する)
//   ⑥ リセットまたは再プレイができる(タイムアップ後に再プレイでき、スコア・時間が初期化される)
//
// 検証は最小限の DOM シム上でインラインスクリプトを「実際に実行」して行う。
// 期待値をゆるめる・項目を削るなどの改変で見かけ上通すことは CONSTRAINTS.md で禁止。

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : root;
const htmlPath = path.join(targetDir, 'index.html');

const results = [];
function record(no, name, ok, detail){
  results.push({ no, name, ok, detail: detail || '' });
}

// ---------- ① 存在チェック ----------
let html = null;
{
  const ok = fs.existsSync(htmlPath);
  if (ok) html = fs.readFileSync(htmlPath, 'utf8');
  record(1, 'index.htmlが存在する', ok, ok ? '' : 'index.html が見つからない: ' + htmlPath);
}

// ---------- ② 外部参照チェック ----------
if (html !== null){
  const rules = [
    [/https?:\/\//i, 'http(s):// のURL記述'],
    [/<script\b[^>]*\bsrc\s*=/i, '<script src>(外部スクリプト)'],
    [/<link\b/i, '<link>(外部CSS/フォント等)'],
    [/<img\b/i, '<img>(外部画像の可能性)'],
    [/<(iframe|frame|embed|object|source|track|audio|video)\b/i, '外部リソースを持ち得るタグ'],
    [/url\s*\(/i, 'CSS url()'],
    [/@import/i, 'CSS @import'],
    [/srcset/i, 'srcset'],
    [/\bfetch\s*\(/, 'fetch()'],
    [/XMLHttpRequest/, 'XMLHttpRequest'],
    [/WebSocket/, 'WebSocket'],
    [/EventSource/, 'EventSource'],
    [/sendBeacon/, 'sendBeacon'],
    [/importScripts/, 'importScripts'],
    [/\bimport\s*\(/, '動的import()'],
  ];
  const hitLabels = rules.filter(([re]) => re.test(html)).map(([, label]) => label);
  record(2, '外部通信・外部URL参照がない', hitLabels.length === 0, hitLabels.join(' / '));
} else {
  record(2, '外部通信・外部URL参照がない', false, '前提不成立(①で失敗)');
}

// ---------- ③ 構文チェック ----------
let jsCode = '';
{
  let ok = false, detail = '';
  if (html !== null){
    const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    const bodies = [];
    let m;
    while ((m = re.exec(html))){
      if (!/\bsrc\s*=/i.test(m[1])) bodies.push(m[2]);
    }
    jsCode = bodies.join('\n;\n');
    if (!jsCode.trim()){
      detail = 'インラインscriptが見つからない';
    } else {
      try {
        new vm.Script(jsCode, { filename: 'index-inline.js' });
        ok = true;
      } catch (e){
        detail = String(e);
      }
    }
  } else {
    detail = '前提不成立(①で失敗)';
  }
  record(3, 'scriptが構文エラーを起こさない', ok, detail);
}

// ---------- 最小 DOM シム ----------
function makeSandbox(){
  const rafQ = [];
  let simTime = 0;
  const registry = new Map();

  const ctxStub = new Proxy({}, {
    get(t, p){
      if (p === 'measureText') return () => ({ width: 0 });
      if (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createConicGradient'){
        return () => ({ addColorStop(){} });
      }
      if (p === 'createPattern') return () => null;
      if (p === 'getImageData') return () => ({ data: [0, 0, 0, 0], width: 1, height: 1 });
      if (p in t) return t[p];
      return () => undefined;
    },
    set(t, p, v){ t[p] = v; return true; },
  });

  function makeEl(id){
    const elObj = {
      id,
      listeners: Object.create(null),
      style: {},
      width: 0,
      height: 0,
      textContent: '',
      title: '',
      classList: {
        _set: new Set(),
        add(...cs){ cs.forEach(c => this._set.add(c)); },
        remove(...cs){ cs.forEach(c => this._set.delete(c)); },
        toggle(c){ this._set.has(c) ? this._set.delete(c) : this._set.add(c); },
        contains(c){ return this._set.has(c); },
      },
      addEventListener(type, fn){ (elObj.listeners[type] ??= []).push(fn); },
      removeEventListener(type, fn){
        const a = elObj.listeners[type];
        if (a){ const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); }
      },
      getBoundingClientRect(){ return { left: 0, top: 0, width: 960, height: 600, right: 960, bottom: 600 }; },
      getContext(){ return ctxStub; },
      setAttribute(){},
      focus(){},
      appendChild(child){ return child; },
    };
    return elObj;
  }
  function el(id){
    if (!registry.has(id)) registry.set(id, makeEl(id));
    return registry.get(id);
  }

  const documentStub = {
    getElementById: (id) => el(id),
    querySelector: () => null,
    createElement: (tag) => makeEl('created:' + tag),
    addEventListener(){},
    removeEventListener(){},
    body: makeEl('body'),
    documentElement: makeEl('html'),
    hidden: false,
    visibilityState: 'visible',
  };

  const sandbox = {
    console,
    document: documentStub,
    navigator: { maxTouchPoints: 0, userAgent: 'smoke-test' },
    performance: { now: () => simTime },
    innerWidth: 960,
    innerHeight: 600,
    devicePixelRatio: 1,
    requestAnimationFrame(cb){ rafQ.push(cb); return rafQ.length; },
    cancelAnimationFrame(){},
    setTimeout(){ return 0; },
    clearTimeout(){},
    setInterval(){ return 0; },
    clearInterval(){},
    addEventListener(){},
    removeEventListener(){},
    alert(){},
    getComputedStyle(){ return {}; },
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.top = sandbox;
  sandbox.parent = sandbox;

  function pump(n, stepMs = 16.7){
    for (let i = 0; i < n; i++){
      simTime += stepMs;
      const q = rafQ.splice(0, rafQ.length);
      for (const cb of q) cb(simTime);
    }
  }
  return { sandbox, pump, el };
}

function stubEvent(){
  return {
    preventDefault(){},
    stopPropagation(){},
    clientX: 480,
    clientY: 300,
    pointerType: 'mouse',
    pointerId: 1,
    isPrimary: true,
    key: '',
  };
}

// ---------- ④ 読み込みチェック ----------
let game = null, pump = null, el = null;
{
  let ok = false, detail = '';
  const syntaxOk = results[2].ok;
  if (syntaxOk){
    try {
      const env = makeSandbox();
      pump = env.pump;
      el = env.el;
      vm.createContext(env.sandbox);
      vm.runInContext(jsCode, env.sandbox, { filename: 'index-inline.js' });
      game = env.sandbox.__GAME__;
      if (!game || typeof game.start !== 'function' || typeof game.state !== 'string'){
        throw new Error('__GAME__ フック(検証用API)が初期化されていない');
      }
      pump(12); // 描画・更新ループが例外なく回ることを確認
      ok = true;
    } catch (e){
      detail = e && e.stack ? String(e.stack).split('\n').slice(0, 4).join(' | ') : String(e);
    }
  } else {
    detail = '前提不成立(③で失敗)';
  }
  record(4, '読み込みが成功する', ok, detail);
}

// ---------- ⑤ 開始操作チェック ----------
{
  let ok = false, detail = '';
  if (results[3].ok){
    try {
      if (game.state !== 'title') throw new Error('初期状態が title でない: ' + game.state);
      const clicks = el('startBtn').listeners['click'] || [];
      if (clicks.length === 0) throw new Error('startBtn に click リスナーがない(開始操作が存在しない)');
      for (const fn of clicks) fn(stubEvent());
      if (game.state !== 'play') throw new Error('開始操作後に play へ遷移しない: ' + game.state);
      if (Math.abs(game.timeLeft - 60) > 0.001) throw new Error('開始時の残り時間が60秒でない: ' + game.timeLeft);
      ok = true;
    } catch (e){
      detail = String((e && e.message) || e);
    }
  } else {
    detail = '前提不成立(④で失敗)';
  }
  record(5, '開始操作が存在する', ok, detail);
}

// ---------- ⑥ 再プレイチェック ----------
{
  let ok = false, detail = '';
  if (results[4].ok){
    try {
      pump(3800); // 約63秒ぶん進め、自然にタイムアップさせる
      if (game.state !== 'over'){
        throw new Error('60秒経過後に over へ遷移しない: state=' + game.state + ' 残り=' + game.timeLeft);
      }
      pump(90); // TIME UP 直後の誤タップ防止ガード(0.6秒)を越える
      const clicks = el('replayBtn').listeners['click'] || [];
      if (clicks.length === 0) throw new Error('replayBtn に click リスナーがない(再プレイ操作が存在しない)');
      for (const fn of clicks) fn(stubEvent());
      if (game.state !== 'play') throw new Error('再プレイで play へ戻らない: ' + game.state);
      if (game.score !== 0) throw new Error('再プレイでスコアが初期化されない: ' + game.score);
      if (Math.abs(game.timeLeft - 60) > 0.001) throw new Error('再プレイで残り時間が初期化されない: ' + game.timeLeft);
      pump(30);
      if (game.state !== 'play' || !(game.timeLeft < 60)) throw new Error('再プレイ後にゲームが進行しない');
      ok = true;
    } catch (e){
      detail = String((e && e.message) || e);
    }
  } else {
    detail = '前提不成立(⑤で失敗)';
  }
  record(6, 'リセットまたは再プレイができる', ok, detail);
}

// ---------- 結果出力 ----------
const marks = ['①', '②', '③', '④', '⑤', '⑥'];
console.log('=== smoke.mjs — ' + htmlPath + ' の機械検証 ===');
let pass = 0;
for (const r of results){
  const head = r.ok ? 'OK ' : 'NG ';
  console.log(marks[r.no - 1] + ' ' + head + r.name + (r.detail ? '  … ' + r.detail : ''));
  if (r.ok) pass++;
}
console.log('---');
console.log(pass === 6 ? 'PASS (6/6)' : 'FAIL (' + pass + '/6)');
process.exit(pass === 6 ? 0 : 1);
