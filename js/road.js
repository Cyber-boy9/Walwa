/* ===== Road Trip: 3-lane driving game, one city at a time. Addis Ababa first. ===== */
(() => {
'use strict';
const P = Sprites;
const W = 360, H = 470, HZ = 170, CARY = 396, GOAL = 8;
const cv = $('#drive'), c = cv.getContext('2d');
cv.width = W; cv.height = H; c.imageSmoothingEnabled = false;
if (!S.road) S.road = {};
if (!S.postcards) S.postcards = {};

/* ---------- cities (add more here later) ---------- */
const CITIES = [
  { id: 'addis', name: 'ADDIS ABABA', flag: '🇪🇹', open: true, blurb: 'minibus taxis, sheep, buna ☕',
    intro: ["Addis. Bole to Piassa. Traffic's a vibe and the taxis think they own the road.", "Collect 8 buna ☕, dodge the minibuses, and please respect the sheep."] },
  { id: 'dubai', name: 'DUBAI', flag: '🇦🇪', open: false, blurb: 'neon, towers, sand' },
  { id: 'paris', name: 'PARIS', flag: '🇫🇷', open: false, blurb: 'croissants, cobblestones' },
  { id: 'tokyo', name: 'TOKYO', flag: '🇯🇵', open: false, blurb: 'neon rain, vending machines' },
  { id: 'zanzibar', name: 'ZANZIBAR', flag: '🇹🇿', open: false, blurb: 'coast road, spice, sun' }
];
let city = CITIES[0];

function buildList() {
  const box = $('#cityList'); box.innerHTML = '';
  CITIES.forEach(ct => {
    const b = document.createElement('button'); b.className = 'city' + (ct.open ? '' : ' locked');
    const best = S.road[ct.id];
    b.innerHTML = '<b>' + ct.flag + '</b><div>' + ct.name + '<small>' + ct.blurb + '</small></div><span class="tag">' + (ct.open ? (best && best.done ? '✅ DONE' : 'PLAY ▶') : 'SOON') + '</span>';
    b.onclick = () => { if (!ct.open) { Sfx.tick(); return; } Sfx.pop(); city = ct; startCity(); };
    box.appendChild(b);
  });
}
World.onShow['s-road'] = buildList;

/* ---------- state ---------- */
let running = false, last = 0, t0 = 0, dist = 0, speed = 0, coffee = 0, lives = 3, flash = 0, shake = 0, hearts = 0;
let lane = 0, carL = 0, objs = [], parts = [], spawnT = 0, sceneT = 0, hitUntil = 0, mood = 'idle', moodUntil = 0, done = null, fails = 0;
const keys = {};

const hud = () => { $('#dCoffee').textContent = '☕ ' + coffee + '/' + GOAL; $('#dLives').textContent = '❤'.repeat(lives) + '🖤'.repeat(3 - lives); };
let toastTimer;
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.remove('hidden'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.add('hidden'), 1500); }

/* ---------- perspective helpers ---------- */
const yAt = z => HZ + (CARY - HZ) * z;
const halfAt = z => 20 + 138 * z;
const xAt = (ln, z) => W / 2 + ln * halfAt(z) * 0.62;
const scAt = z => 0.12 + 0.88 * z;

/* ---------- Addis scenery ---------- */
function sky(t) {
  const h = new Date().getHours(), night = h >= 18 || h < 6, dusk = (h >= 17 && h < 19) || (h >= 5 && h < 7);
  const g = c.createLinearGradient(0, 0, 0, HZ);
  if (night) { g.addColorStop(0, '#1c1448'); g.addColorStop(1, '#7a4a98'); }
  else if (dusk) { g.addColorStop(0, '#7a6ad8'); g.addColorStop(1, '#ffb88c'); }
  else { g.addColorStop(0, '#6fcfff'); g.addColorStop(1, '#ffe9b8'); }
  c.fillStyle = g; c.fillRect(0, 0, W, HZ + 2);
  if (night) { for (let i = 0; i < 26; i++) { const on = ((t / 600 + i) | 0) % 3; R(c, (i * 47) % W, (i * 23) % 120, on ? 2 : 3, on ? 2 : 3, '#fff6a8'); } c.fillStyle = '#fff6b0'; c.beginPath(); c.arc(290, 40, 15, 0, 7); c.fill(); c.fillStyle = '#7a4a98'; c.beginPath(); c.arc(296, 36, 13, 0, 7); c.fill(); }
  else { c.fillStyle = dusk ? '#ffd06a' : '#fff6b0'; c.beginPath(); c.arc(290, dusk ? 118 : 50, 22, 0, 7); c.fill(); [[10, 40, 46], [140, 24, 34], [230, 66, 40]].forEach(([ox, y, w], i) => { const x = Math.round(((ox + t / (60 + i * 11)) % (W + 80)) - 40); c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(x, y, w, 9); c.fillRect(x + 7, y - 7, w - 16, 8); }); }
  // Entoto hills
  const hill = night ? '#3a2a68' : '#7aa8d8', hill2 = night ? '#2c2058' : '#5f9a8a';
  c.fillStyle = hill; c.beginPath(); c.moveTo(0, HZ); for (let x = 0; x <= W; x += 10) c.lineTo(x, HZ - 34 - Math.sin(x / 55) * 16 - Math.sin(x / 21) * 4); c.lineTo(W, HZ); c.fill();
  c.fillStyle = hill2; c.beginPath(); c.moveTo(0, HZ); for (let x = 0; x <= W; x += 10) c.lineTo(x, HZ - 16 - Math.sin(x / 37 + 2) * 9); c.lineTo(W, HZ); c.fill();
  // skyline: CBE tower + blocks
  const bl = night ? '#2a2058' : '#9a86c8';
  [[40, 28, 22], [70, 42, 16], [100, 20, 18], [250, 30, 20], [275, 46, 14], [300, 24, 22], [330, 36, 18]].forEach(([x, hh, w]) => { R(c, x, HZ - hh - 6, w, hh + 6, bl); for (let k = 0; k < hh; k += 8) R(c, x + 3, HZ - hh - 2 + k, 3, 3, night ? '#ffe36e' : 'rgba(255,255,255,.55)'); });
  R(c, 172, HZ - 78, 16, 78, night ? '#3a2e78' : '#b5a6e0'); R(c, 176, HZ - 90, 8, 14, night ? '#3a2e78' : '#b5a6e0'); R(c, 179, HZ - 100, 2, 12, night ? '#3a2e78' : '#b5a6e0');
  for (let k = 0; k < 78; k += 6) R(c, 174, HZ - 76 + k, 12, 2, night ? '#ffe36e' : 'rgba(255,255,255,.5)');
  return night;
}
function ground(night) {
  // verge (grass + sidewalk) and asphalt, row by row for the scrolling stripes
  for (let y = HZ; y < H; y++) {
    const z = (y - HZ) / (CARY - HZ), zz = Math.max(0.001, z), half = halfAt(Math.min(z, 1.15));
    const depth = 1 / (zz + 0.12), band = Math.floor(depth * 2.2 - dist * 9) & 1;
    c.fillStyle = night ? (band ? '#1f5a3a' : '#1a4e32') : (band ? '#7bd88a' : '#6ecb7e'); c.fillRect(0, y, W, 1);
    c.fillStyle = band ? '#e8dcc8' : '#f4ead8'; c.fillRect(W / 2 - half - 14 * scAt(z), y, 14 * scAt(z), 1); c.fillRect(W / 2 + half, y, 14 * scAt(z), 1);
    c.fillStyle = night ? (band ? '#3a3a52' : '#34344a') : (band ? '#6a6a82' : '#62627a'); c.fillRect(W / 2 - half, y, half * 2, 1);
    c.fillStyle = band ? '#ffe36e' : 'rgba(0,0,0,0)';
    if (band) { const lw = Math.max(1, 3 * scAt(z)); c.fillStyle = '#fff'; c.fillRect(W / 2 - half * 0.31 - lw / 2, y, lw, 1); c.fillRect(W / 2 + half * 0.31 - lw / 2, y, lw, 1); }
  }
}

/* ---------- object drawing (scaled by depth) ---------- */
function rc(x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); }
function drawObj(o) {
  const z = o.z, sc = scAt(z), y = yAt(z), x = o.side ? W / 2 + o.side * (halfAt(z) + 30 * sc + o.off * sc) : xAt(o.lane, z), u = sc;
  if (o.t === 'bus') {
    const w = 46 * u, hh = 38 * u; const bx = x - w / 2, by = y - hh;
    rc(bx, by, w, hh, '#fff'); rc(bx, by + hh * .55, w, hh * .22, '#2b6bd8'); rc(bx + w * .1, by + hh * .1, w * .8, hh * .32, '#3a4a6a');
    rc(bx + w * .1, by + hh * .1, w * .8, hh * .08, 'rgba(255,255,255,.4)');
    rc(bx, by + hh * .8, w, hh * .1, '#2b6bd8'); rc(bx + w * .05, by + hh * .62, w * .12, hh * .1, '#ff3d3d'); rc(bx + w * .83, by + hh * .62, w * .12, hh * .1, '#ff3d3d');
    rc(bx + w * .12, by + hh * .9, w * .18, hh * .1, '#222'); rc(bx + w * .7, by + hh * .9, w * .18, hh * .1, '#222');
    rc(bx + w * .35, by + hh * .66, w * .3, hh * .1, '#ffe36e');
  } else if (o.t === 'sheep') {
    const w = 26 * u, hh = 20 * u, bx = x - w / 2, by = y - hh, wob = Math.sin(performance.now() / 120 + o.k) * 1.5 * u;
    rc(bx, by + hh * .1, w, hh * .65, '#fffaf0'); rc(bx + w * .08, by, w * .84, hh * .35, '#fffaf0');
    rc(bx + w * .3, by + hh * .05 + wob, w * .4, hh * .3, '#3a2a44'); rc(bx + w * .22, by + hh * .75, w * .1, hh * .25, '#3a2a44'); rc(bx + w * .66, by + hh * .75, w * .1, hh * .25, '#3a2a44');
  } else if (o.t === 'pothole') {
    const w = 34 * u, hh = 10 * u; c.fillStyle = '#1a1a28'; c.beginPath(); c.ellipse(x, y - hh / 2, w / 2, hh / 2, 0, 0, 7); c.fill();
    c.strokeStyle = '#8a8aa0'; c.lineWidth = Math.max(1, 2 * u); c.stroke();
  } else if (o.t === 'cone') {
    const w = 14 * u, hh = 20 * u; c.fillStyle = '#ff7a2a'; c.beginPath(); c.moveTo(x, y - hh); c.lineTo(x + w / 2, y); c.lineTo(x - w / 2, y); c.fill();
    rc(x - w * .3, y - hh * .5, w * .6, hh * .15, '#fff'); rc(x - w * .6, y - hh * .06, w * 1.2, hh * .08, '#c9501a');
  } else if (o.t === 'coffee') {
    const bob = Math.sin(performance.now() / 200 + o.k) * 3 * u, w = 20 * u, hh = 18 * u, by = y - hh - 14 * u + bob;
    c.fillStyle = 'rgba(255,230,120,.35)'; c.beginPath(); c.arc(x, by + hh / 2, 18 * u, 0, 7); c.fill();
    rc(x - w / 2, by, w, hh, '#fff'); rc(x - w / 2, by, w, hh * .45, '#7a4a2a'); rc(x + w / 2, by + hh * .2, w * .25, hh * .45, '#fff');
    rc(x - w * .55, by + hh, w * 1.1, hh * .12, '#ffb3d1');
    for (let k = 0; k < 2; k++) { const s = (performance.now() / 700 + k * .5) % 1; c.globalAlpha = 1 - s; rc(x - w * .2 + k * w * .35, by - s * 14 * u, 2 * u + 1, 6 * u, '#fff'); c.globalAlpha = 1; }
  } else if (o.t === 'heart') {
    const bob = Math.sin(performance.now() / 190 + o.k) * 3 * u, s = Math.max(2, Math.round(3.5 * u));
    P.spr(c, P.HEART, Math.round(x - 4.5 * s), Math.round(y - 30 * u + bob), s, { r: '#ff4f8e' });
  } else if (o.t === 'tree') {
    const hh = 90 * u; rc(x - 3 * u, y - hh * .6, 6 * u, hh * .6, '#a8714d');
    c.fillStyle = '#3f9a5a'; c.beginPath(); c.ellipse(x, y - hh * .78, 16 * u, hh * .36, 0, 0, 7); c.fill(); c.fillStyle = '#58b872'; c.beginPath(); c.ellipse(x - 4 * u, y - hh * .85, 9 * u, hh * .24, 0, 0, 7); c.fill();
  } else if (o.t === 'bldg') {
    const w = 52 * u, hh = (70 + o.k * 6) * u, bx = x - w / 2; rc(bx, y - hh, w, hh, o.col);
    for (let r = 0; r < 4; r++) for (let q = 0; q < 3; q++) rc(bx + w * (.12 + q * .3), y - hh + hh * (.1 + r * .22), w * .18, hh * .1, 'rgba(255,255,255,.6)');
    rc(bx, y - hh, w, hh * .06, 'rgba(0,0,0,.15)');
  } else if (o.t === 'flower') {
    // Meskel daisies
    for (let k = 0; k < 3; k++) { const fx = x + (k - 1) * 9 * u; rc(fx - u, y - 10 * u, 2 * u, 10 * u, '#4fa86a'); rc(fx - 4 * u, y - 15 * u, 8 * u, 6 * u, '#ffd23f'); rc(fx - u, y - 13 * u, 2 * u, 2 * u, '#a8641a'); }
  }
}

/* ---------- her car (rear view, convertible: you can see her + Mochi) ---------- */
function drawCar(now) {
  const x = W / 2 + carL * halfAt(1) * 0.62, y = CARY, i = P.idle(now), bounce = Math.sin(now / 90) * (running ? 0.8 : 0);
  c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(x, y + 4, 44, 7, 0, 0, 7); c.fill();
  // seat back + her + Mochi
  rc(x - 26, y - 54, 52, 30, '#7a4a6a'); rc(x - 26, y - 54, 52, 4, '#9a6a8a');
  P.drawGirl(c, S.avatar, Math.round(x - 17), Math.round(y - 96 + bounce), 2, { blink: i.blink, mood: mood === 'happy' ? 'happy' : 'idle' });
  P.drawCat(c, Math.round(x + 14), Math.round(y - 56 + bounce), 1, { cfg: S.mochi, mood: mood === 'happy' ? 'happy' : 'idle' });
  // car body (hides her legs)
  rc(x - 40, y - 30, 80, 22, '#ff7eb6'); rc(x - 40, y - 30, 80, 5, '#ffb3d1'); rc(x - 44, y - 12, 88, 12, '#d95a92');
  rc(x - 34, y - 26, 14, 7, '#ff3d3d'); rc(x + 20, y - 26, 14, 7, '#ff3d3d'); rc(x - 34, y - 26, 14, 2, '#ffb0b0'); rc(x + 20, y - 26, 14, 2, '#ffb0b0');
  rc(x - 12, y - 24, 24, 10, '#fff6ea'); rc(x - 10, y - 22, 20, 6, '#ffe36e');
  rc(x - 44, y - 2, 18, 9, '#2a2040'); rc(x + 26, y - 2, 18, 9, '#2a2040');
  rc(x - 44, y - 12, 88, 2, '#5b3f94');
  if (hitUntil > now && ((now / 70) | 0) % 2) { c.fillStyle = 'rgba(255,80,120,.5)'; c.fillRect(x - 46, y - 100, 92, 112); }
}

/* ---------- loop ---------- */
function render(now) {
  c.save(); if (shake > 0) c.translate(rand(-shake, shake) * 8, rand(-shake, shake) * 8);
  const night = sky(now); ground(night);
  objs.slice().sort((a, b) => a.z - b.z).forEach(drawObj);
  drawCar(now);
  parts.forEach(p => { c.globalAlpha = Math.max(0, p.l * 2); c.fillStyle = p.c; c.fillRect(Math.round(p.x), Math.round(p.y), 4, 4); }); c.globalAlpha = 1;
  if (flash > 0) { c.fillStyle = 'rgba(255,100,140,' + flash + ')'; c.fillRect(0, 0, W, H); }
  c.restore();
  // progress bar
  c.fillStyle = 'rgba(255,246,234,.9)'; c.fillRect(10, 10, W - 20, 10); c.fillStyle = '#5b3f94'; c.fillRect(10, 10, W - 20, 2); c.fillRect(10, 18, W - 20, 2);
  c.fillStyle = '#ff7eb6'; c.fillRect(12, 12, Math.round((W - 24) * Math.min(1, coffee / GOAL)), 6);
}
function burstP(x, y, col) { for (let i = 0; i < 14; i++) parts.push({ x, y, vx: rand(-110, 110), vy: rand(-180, -30), l: 0.5, c: col }); }
const COFFEE_LINES = ['Buna time ☕', 'Fresh jebena pour!', 'Caffeinated. Dangerous.', 'Ethiopia gave the world coffee. You\'re welcome.', 'Cheers to that ☕'];
const HIT = { bus: ['Minibus taxi says hi 🚕', 'Taxi driver: "Piassa Piassa Piassa!"'], sheep: ['That was one of my sheep 😭', 'Sheep has the right of way, always.'], pothole: ['Addis potholes, undefeated 🕳️', 'Ouch. That pothole has seniority.'], cone: ['Road works. Of course.'] };
function spawnRow() {
  const r = Math.random(), L = [-1, 0, 1], free = L[Math.floor(Math.random() * 3)];
  const types = ['bus', 'bus', 'sheep', 'pothole', 'cone'];
  L.forEach(ln => {
    if (ln === free) { if (Math.random() < 0.8) objs.push({ t: Math.random() < 0.82 ? 'coffee' : 'heart', lane: ln, z: 0, k: Math.random() * 6 }); }
    else if (Math.random() < 0.65) objs.push({ t: types[Math.floor(Math.random() * types.length)], lane: ln, z: 0, k: Math.random() * 6, bad: true });
  });
}
function spawnSide() {
  const t = ['tree', 'tree', 'bldg', 'flower', 'bldg'], cols = ['#e8a3c0', '#ffd19a', '#a7d3f2', '#c9b6ff', '#ffb59a'];
  [-1, 1].forEach(sd => { if (Math.random() < 0.8) objs.push({ t: t[Math.floor(Math.random() * t.length)], side: sd, off: Math.random() * 40, z: 0, k: Math.floor(Math.random() * 5), col: cols[Math.floor(Math.random() * 5)] }); });
}
let sideT = 0;
function finish(r) { running = false; render(performance.now()); const d = done; done = null; if (d) d(r); }
function loop(now) {
  if (!running) return;
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (keys.ArrowLeft || keys.a) { /* handled on keydown for lane steps */ }
  carL += (lane - carL) * Math.min(1, dt * 12);
  speed = 0.5 + Math.min(0.3, (now - t0) / 1000 * 0.006);
  dist += speed * dt;
  spawnT -= dt; sideT -= dt;
  if (spawnT <= 0) { spawnT = 1.15 - Math.min(.35, (now - t0) / 1000 * 0.008); spawnRow(); }
  if (sideT <= 0) { sideT = 0.38; spawnSide(); }
  for (let i = objs.length - 1; i >= 0; i--) {
    const o = objs[i]; o.z += speed * dt * (0.4 + o.z * 0.9);
    if (!o.side && !o.done && o.z > 0.86 && o.z < 1.02 && Math.abs(o.lane - carL) < 0.6) {
      o.done = true;
      if (o.bad) { if (hitUntil < now) { lives--; flash = 0.35; shake = 0.5; hitUntil = now + 900; mood = 'sad'; moodUntil = now + 800; toast(HIT[o.t][Math.floor(Math.random() * HIT[o.t].length)]); Sfx.tone(180, 0.25, 'sawtooth', 0.09, -120); burstP(xAt(o.lane, 1), CARY - 30, '#8a7aa8'); hud(); } }
      else if (o.t === 'coffee') { coffee++; mood = 'happy'; moodUntil = now + 500; Sfx.coin(); burstP(xAt(o.lane, 1), CARY - 40, '#ffe36e'); if (coffee % 3 === 1) toast(COFFEE_LINES[Math.floor(Math.random() * COFFEE_LINES.length)]); hud(); }
      else if (o.t === 'heart') { hearts++; S.vibe = (S.vibe || 0) + 1; save(); mood = 'happy'; moodUntil = now + 700; Sfx.win(); burstP(xAt(o.lane, 1), CARY - 40, '#ff7eb6'); toast('+1 💗 vibe'); }
      objs.splice(i, 1); continue;
    }
    if (o.z > 1.25) objs.splice(i, 1);
  }
  for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.vy += 500 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.l -= dt; if (p.l <= 0) parts.splice(i, 1); }
  if (flash > 0) flash = Math.max(0, flash - dt); if (shake > 0) shake = Math.max(0, shake - dt * 2);
  if (now > moodUntil) mood = 'idle';
  render(now);
  if (coffee >= GOAL) return finish('win');
  if (lives <= 0) return finish('lose');
  requestAnimationFrame(loop);
}
function runDrive() {
  return new Promise(res => {
    done = res; objs = []; parts = []; lane = 0; carL = 0; dist = 0; coffee = 0; hearts = 0; lives = fails >= 2 ? 5 : 3; flash = 0; shake = 0; hitUntil = 0; mood = 'idle';
    spawnT = 0.6; sideT = 0; $('#toast').classList.add('hidden'); hud();
    for (let k = 0; k < 8; k++) { objs.push({ t: ['tree', 'bldg'][k % 2], side: k % 4 < 2 ? -1 : 1, off: 10, z: 0.1 + k * 0.1, k: k % 5, col: ['#e8a3c0', '#ffd19a', '#a7d3f2', '#c9b6ff', '#ffb59a'][k % 5] }); }
    running = true; last = t0 = performance.now(); requestAnimationFrame(loop);
  });
}

/* ---------- controls ---------- */
const step = d => { if (!running) return; const n = Math.max(-1, Math.min(1, lane + d)); if (n !== lane) { lane = n; Sfx.tick(); } };
window.addEventListener('keydown', e => { if (World.screen !== 's-drive') return; if (e.key === 'ArrowLeft' || e.key === 'a') step(-1); if (e.key === 'ArrowRight' || e.key === 'd') step(1); });
let sx = 0;
cv.addEventListener('pointerdown', e => { sx = e.clientX; });
cv.addEventListener('pointerup', e => {
  const dx = e.clientX - sx;
  if (Math.abs(dx) > 28) step(dx > 0 ? 1 : -1);
  else { const r = cv.getBoundingClientRect(); step(e.clientX - r.left < r.width / 2 ? -1 : 1); }
});

/* ---------- overlay + flow ---------- */
function fit() {
  const st = $('#stage'), wrap = $('#driveWrap'); if (!st) return;
  const availW = st.clientWidth - 24, availH = st.clientHeight - 24 - 30;
  const w = Math.max(220, Math.min(availW, availH * W / H));
  wrap.style.width = w + 'px'; wrap.style.height = (w * H / W) + 'px';
}
window.addEventListener('resize', fit);
function overlay(title, text, btn) {
  return new Promise(res => {
    $('#dmTitle').textContent = title; $('#dmText').textContent = text; const b = $('#dmBtn'); b.textContent = btn;
    $('#driveMsg').classList.remove('hidden');
    b.onclick = () => { $('#driveMsg').classList.add('hidden'); Sfx.pop(); res(); };
  });
}
let flowId = 0;
async function startCity() {
  const id = ++flowId; fails = 0;
  show('s-drive'); fit(); $('#dCity').textContent = city.name; hud(); objs = []; render(performance.now());
  await overlay(city.name + ' ' + city.flag, city.intro.join('\n\n') + '\n\ntap left/right (or swipe) to change lanes', 'START ▶');
  for (;;) {
    if (id !== flowId) return;
    const r = await runDrive();
    if (id !== flowId) return;
    const rec = S.road[city.id] || (S.road[city.id] = { best: 0, done: false });
    if (r === 'win') {
      rec.done = true; rec.best = Math.max(rec.best, lives); S.postcards[city.id] = true; save(); burst(140); Sfx.win();
      await overlay('YOU MADE IT 🎉', 'Addis loved you.\n💗 +' + hearts + ' vibe · ' + lives + ' lives left\n\n' + CONFIG.hisName + ' is writing you a postcard from here ✉️', 'NICE ▶');
      show('s-hub'); Hub.say('THEO', 'You drove through Addis like you own it. Postcard unlocked, soon you can read it. 😎');
      return;
    }
    fails++;
    if (fails >= 2) await overlay('okok 😭', 'Mochi is feeling generous.\nextra lives added. go again.', 'THANKS 🥹');
    else await overlay('TRAFFIC WON 💀', 'jk. Addis does that.\nrun it back.', 'RETRY ↻');
  }
}
World.onShow['s-drive'] = fit;
// leaving mid-drive stops it cleanly
document.addEventListener('click', e => { if (e.target.closest('#homeBtn')) { running = false; flowId++; done = null; } });
World.draw['s-drive'] = t => { if (!running) { /* paused/menu frame is already rendered */ } };
})();
