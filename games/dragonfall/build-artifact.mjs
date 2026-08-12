#!/usr/bin/env node
// build-artifact.mjs — emit the Artifact-ready copy of the game.
//
//   node games/dragonfall/build-artifact.mjs [outfile]
//
// The Artifact host wraps the file it is given in its own
// <!doctype html><head>…</head><body> skeleton, so a full document would
// nest inside another one. This strips the document wrapper and keeps the
// page content — <title>, <style>, the DOM, and the inline <script> — so the
// published page is the same game, byte for byte, minus the shell.
//
// The game itself stays the source of truth: run this again after any edit
// to index.html and republish, rather than editing the artifact copy.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, 'index.html'), 'utf8');
const out = process.argv[2] || path.join(here, 'artifact.html');

function section(re, label){
  const m = src.match(re);
  if (!m) throw new Error('could not find ' + label + ' in index.html');
  return m[1];
}

const title = section(/<title>([\s\S]*?)<\/title>/, '<title>');
const style = section(/<style>([\s\S]*?)<\/style>/, '<style>');
const body  = section(/<body>([\s\S]*?)<\/body>/, '<body>');

// the body already carries the markup and the inline script; take it whole
const page = '<title>' + title + '</title>\n<style>\n' + style.trim() + '\n</style>\n' + body.trim() + '\n';

for (const banned of [/<!doctype/i, /<html[\s>]/i, /<\/html>/i, /<head[\s>]/i, /<body[\s>]/i]){
  if (banned.test(page)) throw new Error('document wrapper survived the strip: ' + banned);
}
if (!/id="startBtn"/.test(page)) throw new Error('start button missing from the stripped page');
if (!/__GAME__/.test(page)) throw new Error('game script missing from the stripped page');

fs.writeFileSync(out, page);
console.log('wrote ' + out + '  (' + Math.round(page.length / 1024) + ' KB, title: ' + title + ')');
