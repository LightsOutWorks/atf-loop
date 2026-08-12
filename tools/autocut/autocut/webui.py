"""スマホで開く画面。

1ファイルに収める（サーバーが文字列として返すだけ）。外部の CSS / JS / フォントは
読み込まない——家庭内LANで完結させるので、外に取りに行く経路を作らない。
"""

PAGE = r"""<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0e0e11">
<meta name="apple-mobile-web-app-capable" content="yes">
<title>autocut</title>
<style>
:root{
  --bg:#0e0e11; --surf:#17171c; --surf2:#1f1f26;
  --ink:#ececf0; --dim:#8e8e99; --line:#2c2c34;
  --acc:#e0be74; --ok:#63e6b0; --bad:#ff6b7f;
  --st:env(safe-area-inset-top,0px); --sb:env(safe-area-inset-bottom,0px);
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{
  margin:0;background:var(--bg);color:var(--ink);
  font:16px/1.6 system-ui,-apple-system,"Hiragino Sans","Noto Sans JP",sans-serif;
  -webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;
}
.wrap{max-width:560px;margin:0 auto;padding:calc(20px + var(--st)) 16px calc(40px + var(--sb))}
header{display:flex;align-items:baseline;gap:10px;margin-bottom:6px}
h1{margin:0;font-size:21px;font-weight:800;letter-spacing:.02em}
header .sub{font-size:11.5px;color:var(--dim);letter-spacing:.14em;text-transform:uppercase}
.lead{color:var(--dim);font-size:13.5px;margin:0 0 22px}
.card{background:var(--surf);border:1px solid var(--line);border-radius:14px;padding:16px;margin:0 0 14px}
.hide{display:none!important}

button,.btn{
  -webkit-appearance:none;appearance:none;display:block;width:100%;
  padding:16px;min-height:56px;border-radius:13px;border:1px solid var(--line);
  background:var(--surf2);color:var(--ink);font:inherit;font-weight:700;
  cursor:pointer;text-align:center;text-decoration:none;
}
button:active,.btn:active{filter:brightness(1.3)}
button:focus-visible,.btn:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
button.primary{background:var(--acc);color:#241a05;border-color:var(--acc)}
button.primary:disabled{opacity:.4;cursor:default}
button.ghost{background:transparent;font-weight:600;font-size:14.5px;min-height:48px}
.row{display:flex;gap:10px}
.row>*{flex:1}

/* 選択 */
#pick{border:1.5px dashed #3a3a45;background:var(--surf);padding:34px 16px;font-weight:700}
#pick .big{font-size:17px}
#pick .hint{display:block;font-size:12.5px;color:var(--dim);font-weight:400;margin-top:6px}
.file{display:flex;gap:12px;align-items:center;margin-bottom:14px}
.file .nm{font-weight:700;font-size:14.5px;word-break:break-all;line-height:1.4}
.file .sz{font-size:12px;color:var(--dim);font-variant-numeric:tabular-nums}

/* 設定 */
.opt{display:flex;align-items:center;justify-content:space-between;gap:14px;
  padding:12px 0;border-top:1px solid var(--line)}
.opt .lb{font-size:14px;font-weight:600}
.opt .hi{font-size:11.5px;color:var(--dim);margin-top:1px}
.step{display:flex;align-items:center;gap:0;flex:0 0 auto}
.step button{width:42px;min-height:42px;padding:0;font-size:20px;border-radius:10px}
.step .v{width:44px;text-align:center;font-weight:800;font-variant-numeric:tabular-nums}
select{
  -webkit-appearance:none;appearance:none;background:var(--surf2);color:var(--ink);
  border:1px solid var(--line);border-radius:10px;padding:10px 30px 10px 12px;font:inherit;
  font-size:14px;background-image:linear-gradient(45deg,transparent 50%,var(--dim) 50%),
  linear-gradient(135deg,var(--dim) 50%,transparent 50%);
  background-position:calc(100% - 16px) 50%,calc(100% - 11px) 50%;
  background-size:5px 5px,5px 5px;background-repeat:no-repeat;
}
.sw{width:52px;height:30px;border-radius:15px;border:1px solid var(--line);background:var(--surf2);
  position:relative;flex:0 0 auto;padding:0;min-height:0}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;
  background:var(--dim);transition:.15s}
.sw.on{background:rgba(224,190,116,.3);border-color:var(--acc)}
.sw.on::after{left:26px;background:var(--acc)}

/* 進捗 */
.bar{height:8px;border-radius:5px;background:var(--surf2);overflow:hidden;margin:12px 0 8px}
.bar i{display:block;height:100%;width:0;border-radius:5px;background:var(--acc);transition:width .35s}
.bar.up i{background:var(--dim)}
.pct{font-size:28px;font-weight:800;font-variant-numeric:tabular-nums}
.msg{font-size:13.5px;color:var(--dim);min-height:1.5em}
.logbox{margin-top:12px;padding:10px 12px;background:#0a0a0d;border-radius:10px;
  border:1px solid var(--line);max-height:150px;overflow-y:auto;
  font:11.5px/1.7 ui-monospace,SFMono-Regular,Menlo,monospace;color:#9a9aa6;white-space:pre-wrap}

/* 結果 */
.res h2{font-size:14px;margin:0 0 8px;font-weight:700;letter-spacing:.04em}
.res h2 small{font-weight:500;color:var(--dim);font-size:11.5px;margin-left:7px;letter-spacing:0}
video{width:100%;border-radius:11px;background:#000;display:block;margin-bottom:8px}
.vgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.vgrid video{margin-bottom:6px}
.dl{font-size:12.5px;color:var(--acc);text-decoration:none;display:inline-block;padding:6px 0}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:9px;margin:4px 0 2px}
.stat{background:var(--surf2);border-radius:10px;padding:10px 11px}
.stat .k{font-size:10px;color:var(--dim);letter-spacing:.1em;text-transform:uppercase}
.stat .v{font-size:18px;font-weight:800;font-variant-numeric:tabular-nums;margin-top:2px}
.stat .v small{font-size:11px;font-weight:600;color:var(--dim)}
.err{border-color:rgba(255,107,127,.5);background:rgba(255,107,127,.07)}
.err .t{color:var(--bad);font-weight:700;font-size:14px;margin-bottom:5px}
.note{font-size:12px;color:var(--dim);margin:10px 0 0}
.foot{margin-top:26px;font-size:11.5px;color:#5e5e69;text-align:center;line-height:1.7}
input[type=file]{display:none}
input[type=tel]{
  width:100%;padding:14px;font:inherit;font-size:22px;text-align:center;letter-spacing:.5em;
  background:var(--surf2);border:1px solid var(--line);border-radius:12px;color:var(--ink);
  font-variant-numeric:tabular-nums;
}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<div class="wrap">

  <header><h1>autocut</h1><span class="sub">video pipeline</span></header>
  <p class="lead">動画を1本選ぶと、YouTube ロング・ショート・TikTok の3種をテロップ付きで作ります。</p>

  <!-- PIN -->
  <section id="secPin" class="card hide">
    <div class="opt" style="border:0;padding-top:0"><div>
      <div class="lb">PIN を入れる</div>
      <div class="hi">母艦の画面に出ている4桁</div>
    </div></div>
    <input type="tel" id="pinIn" inputmode="numeric" maxlength="4" placeholder="････">
    <p class="note" id="pinErr" style="color:var(--bad)"></p>
    <button class="primary" id="pinGo" style="margin-top:10px">つづける</button>
  </section>

  <!-- 選択 -->
  <section id="secPick" class="hide">
    <label class="btn" id="pick" for="file">
      <span class="big">動画を選ぶ</span>
      <span class="hint">カメラロールから / 撮影する</span>
    </label>
    <input type="file" id="file" accept="video/*">
  </section>

  <!-- 確認と設定 -->
  <section id="secConfirm" class="card hide">
    <div class="file"><div>
      <div class="nm" id="fName">—</div>
      <div class="sz" id="fSize">—</div>
    </div></div>

    <div class="opt"><div>
      <div class="lb">短尺の本数</div>
      <div class="hi">ショートと TikTok の本数</div>
    </div>
      <div class="step">
        <button class="ghost" id="sMinus" aria-label="減らす">−</button>
        <span class="v" id="sVal">3</span>
        <button class="ghost" id="sPlus" aria-label="増やす">＋</button>
      </div>
    </div>

    <div class="opt"><div>
      <div class="lb">文字起こしの精度</div>
      <div class="hi">高いほど正確、その分ゆっくり</div>
    </div>
      <select id="model">
        <option value="small">速い</option>
        <option value="medium" selected>ふつう</option>
        <option value="large-v3">正確</option>
      </select>
    </div>

    <div class="opt"><div>
      <div class="lb">言い淀みを強く削る</div>
      <div class="hi">「あの」「まあ」も落とす</div>
    </div>
      <button class="sw" id="aggr" aria-label="強く削る"></button>
    </div>

    <div class="row" style="margin-top:16px">
      <button class="ghost" id="btnCancel">選び直す</button>
      <button class="primary" id="btnGo">編集をはじめる</button>
    </div>
  </section>

  <!-- 進捗 -->
  <section id="secWork" class="card hide">
    <div class="pct" id="pct">0%</div>
    <div class="bar" id="bar"><i id="barI"></i></div>
    <div class="msg" id="msg">準備中</div>
    <div class="logbox" id="log"></div>
    <p class="note" id="workNote">画面を閉じても処理は続きます。同じページを開き直せば戻ってこられます。</p>
  </section>

  <!-- 結果 -->
  <section id="secDone" class="hide">
    <div class="card">
      <div class="stats" id="stats"></div>
      <p class="note" id="doneNote"></p>
    </div>
    <div class="card res" id="resLong"></div>
    <div class="card res" id="resShort"></div>
    <button class="ghost" id="btnAgain" style="margin-top:4px">もう1本つくる</button>
  </section>

  <!-- 失敗 -->
  <section id="secErr" class="card err hide">
    <div class="t">失敗しました</div>
    <div id="errMsg" style="font-size:13.5px;color:var(--dim);word-break:break-word"></div>
    <button class="ghost" id="btnErrBack" style="margin-top:14px">やり直す</button>
  </section>

  <p class="foot">
    動画はこの機械の中だけで処理されます。<br>外部のサービスへは送られません。
  </p>
</div>

<script>
"use strict";
var $ = function(id){ return document.getElementById(id); };
var pin = localStorage.getItem("autocut.pin") || "";
var chosen = null, shorts = 3, aggressive = false, poller = null, jobId = null;

function show(){
  var ids = ["secPin","secPick","secConfirm","secWork","secDone","secErr"];
  var on = Array.prototype.slice.call(arguments);
  ids.forEach(function(id){ $(id).classList.toggle("hide", on.indexOf(id) < 0); });
}
function mb(n){
  if(n >= 1e9) return (n/1e9).toFixed(2) + " GB";
  return (n/1e6).toFixed(0) + " MB";
}
function secs(n){ return n == null ? "—" : (Math.round(n*10)/10) + "秒"; }

function headers(){
  return pin ? { "X-Autocut-Pin": pin } : {};
}

/* ---------- 起動 ---------- */
fetch("/api/pin").then(function(r){ return r.json(); }).then(function(d){
  if(!d.required){ pin = ""; boot(); return; }
  if(pin){
    fetch("/api/jobs", { headers: headers() }).then(function(r){
      if(r.ok){ boot(); } else { localStorage.removeItem("autocut.pin"); pin=""; show("secPin"); }
    });
  } else {
    show("secPin");
  }
}).catch(function(){ show("secPick"); });

function boot(){
  var last = localStorage.getItem("autocut.job");
  if(last){
    fetch("/api/job/" + last, { headers: headers() }).then(function(r){
      return r.ok ? r.json() : null;
    }).then(function(j){
      if(j && (j.state === "running" || j.state === "queued")){ jobId = last; watch(); }
      else if(j && j.state === "done"){ jobId = last; render(j); }
      else { show("secPick"); }
    }).catch(function(){ show("secPick"); });
  } else {
    show("secPick");
  }
}

/* ---------- PIN ---------- */
$("pinGo").onclick = function(){
  var v = $("pinIn").value.trim();
  if(v.length !== 4){ $("pinErr").textContent = "4桁を入れてください。"; return; }
  fetch("/api/jobs", { headers: { "X-Autocut-Pin": v } }).then(function(r){
    if(r.ok){ pin = v; localStorage.setItem("autocut.pin", v); $("pinErr").textContent=""; boot(); }
    else { $("pinErr").textContent = "違います。母艦の画面を確認してください。"; }
  });
};
$("pinIn").addEventListener("keydown", function(e){ if(e.key === "Enter") $("pinGo").click(); });

/* ---------- 選択 ---------- */
$("file").onchange = function(e){
  var f = e.target.files && e.target.files[0];
  if(!f) return;
  chosen = f;
  $("fName").textContent = f.name;
  $("fSize").textContent = mb(f.size);
  show("secConfirm");
};
$("btnCancel").onclick = function(){ chosen = null; $("file").value = ""; show("secPick"); };
$("sMinus").onclick = function(){ shorts = Math.max(1, shorts-1); $("sVal").textContent = shorts; };
$("sPlus").onclick  = function(){ shorts = Math.min(8, shorts+1); $("sVal").textContent = shorts; };
$("aggr").onclick = function(){ aggressive = !aggressive; this.classList.toggle("on", aggressive); };

/* ---------- 送信 ---------- */
$("btnGo").onclick = function(){
  if(!chosen) return;
  var fd = new FormData();
  fd.append("shorts", String(shorts));
  fd.append("model", $("model").value);
  fd.append("aggressive", aggressive ? "1" : "0");
  fd.append("video", chosen, chosen.name);

  show("secWork");
  $("bar").classList.add("up");
  $("msg").textContent = "送っています";
  $("log").textContent = "";
  $("workNote").textContent = "送信中はこの画面を開いたままにしてください。";

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/upload");
  if(pin) xhr.setRequestHeader("X-Autocut-Pin", pin);
  xhr.upload.onprogress = function(ev){
    if(!ev.lengthComputable) return;
    var p = Math.round(ev.loaded / ev.total * 100);
    $("pct").textContent = p + "%";
    $("barI").style.width = p + "%";
    $("msg").textContent = "送っています — " + mb(ev.loaded) + " / " + mb(ev.total);
  };
  xhr.onload = function(){
    $("bar").classList.remove("up");
    var d = {};
    try { d = JSON.parse(xhr.responseText); } catch(e){}
    if(xhr.status !== 200 || !d.id){ fail(d.error || ("送信に失敗しました (" + xhr.status + ")")); return; }
    jobId = d.id;
    localStorage.setItem("autocut.job", jobId);
    $("pct").textContent = "0%";
    $("barI").style.width = "0%";
    $("workNote").textContent = "画面を閉じても処理は続きます。同じページを開き直せば戻ってこられます。";
    watch();
  };
  xhr.onerror = function(){ fail("送信中に切れました。Wi-Fi を確認してください。"); };
  xhr.send(fd);
};

/* ---------- 監視 ---------- */
function watch(){
  show("secWork");
  clearInterval(poller);
  var tick = function(){
    fetch("/api/job/" + jobId, { headers: headers() }).then(function(r){
      return r.ok ? r.json() : null;
    }).then(function(j){
      if(!j) return;
      $("pct").textContent = j.percent + "%";
      $("barI").style.width = j.percent + "%";
      $("msg").textContent = j.message || "";
      $("log").textContent = (j.lines || []).join("\n");
      $("log").scrollTop = $("log").scrollHeight;
      if(j.state === "done"){ clearInterval(poller); render(j); }
      if(j.state === "error"){ clearInterval(poller); fail(j.error || "処理に失敗しました"); }
    }).catch(function(){});
  };
  tick();
  poller = setInterval(tick, 1500);
}

/* ---------- 結果 ---------- */
function vurl(name){ return "/file/" + jobId + "/" + encodeURI(name) + (pin ? "?k=" + pin : ""); }
function durl(name){ return vurl(name) + (pin ? "&" : "?") + "dl=1"; }

function render(j){
  var s = j.summary || {};
  var cut = s.removed_ratio != null ? Math.round(s.removed_ratio * 1000)/10 : null;
  $("stats").innerHTML =
    tile("元の尺", secs(s.input_duration)) +
    tile("編集後", secs(s.output_duration)) +
    tile("削った", cut == null ? "—" : cut + "<small>%</small>") +
    tile("言い淀み", (s.filler_cuts != null ? s.filler_cuts : "—") + "<small>箇所</small>");

  var words = (s.filler_words || []);
  $("doneNote").textContent =
    (words.length ? "落とした言い淀み: " + words.join("・") + "。" : "") +
    " 無音 " + (s.silence_cuts != null ? s.silence_cuts : "—") + " 箇所を詰めました。" +
    " 所要 " + Math.round(j.elapsed) + " 秒。";

  var out = j.outputs || {};
  $("resLong").innerHTML = section("YouTube ロング", "1920×1080", out.youtube_long || []);
  $("resShort").innerHTML =
    section("YouTube ショート", "1080×1920", out.youtube_shorts || [], true) +
    (out.tiktok && out.tiktok.length
      ? '<div style="height:16px"></div>' + section("TikTok", "1080×1920", out.tiktok, true)
      : "");
  show("secDone");
}

function tile(k, v){
  return '<div class="stat"><div class="k">' + k + '</div><div class="v">' + v + "</div></div>";
}

function section(title, spec, files, vertical){
  if(!files.length) return "";
  var head = "<h2>" + title + "<small>" + spec + " · " + files.length + "本</small></h2>";
  // 比率を先に決めておく。読み込み前に枠が横長で出て、あとで縦に飛ぶのを防ぐ。
  var ratio = vertical ? "9/16" : "16/9";
  var body = files.map(function(f){
    var name = f.split("/").pop();
    return '<div>' +
      '<video controls playsinline preload="metadata" style="aspect-ratio:' + ratio +
      '" src="' + vurl(f) + '"></video>' +
      '<a class="dl" href="' + durl(f) + '">保存 — ' + name + "</a></div>";
  }).join("");
  return head + (vertical && files.length > 1 ? '<div class="vgrid">' + body + "</div>" : body);
}

/* ---------- 失敗・やり直し ---------- */
function fail(msg){
  clearInterval(poller);
  $("errMsg").textContent = msg;
  show("secErr");
}
function reset(){
  clearInterval(poller);
  chosen = null; jobId = null;
  $("file").value = "";
  localStorage.removeItem("autocut.job");
  show("secPick");
}
$("btnAgain").onclick = reset;
$("btnErrBack").onclick = reset;
</script>
</body>
</html>
"""
