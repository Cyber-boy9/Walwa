/* ===== core: helpers, saved state, sfx, effects, screens ===== */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

/* ---------- saved state (localStorage, no backend) ---------- */
const KEY = 'mochiworld.v1';
const DEFAULTS = {
  name: '',
  song: -1,
  volume: 0.7,
  mochi: { name: 'Mochi', fur: 0, hat: 0, accessory: 0, eyes: 0 },
  avatar: { skin: 2, hairStyle: 1, hairColor: 0, eyes: 0, top: 0, bottom: 0, shoes: 0, extra: 0, preset: 'casual' },
  visits: 0
};
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {
      ...DEFAULTS, ...raw,
      mochi: { ...DEFAULTS.mochi, ...(raw.mochi || {}) },
      avatar: { ...DEFAULTS.avatar, ...(raw.avatar || {}) }
    };
  } catch (e) { return JSON.parse(JSON.stringify(DEFAULTS)); }
}
const S = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

/* ---------- audio: synthesized sfx ---------- */
const A = { ctx: null, master: null, sfx: null, muted: false };
function initAudio() {
  if (A.ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = A.ctx = new AC();
  A.master = ctx.createGain(); A.master.gain.value = 0.9; A.master.connect(ctx.destination);
  A.sfx = ctx.createGain(); A.sfx.gain.value = 0.8; A.sfx.connect(A.master);
}
const Sfx = {
  tone(f, d = 0.1, type = 'square', v = 0.08, slide = 0, when = 0) {
    if (!A.ctx || A.muted) return;
    const t = A.ctx.currentTime + when;
    const o = A.ctx.createOscillator(), g = A.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(A.sfx); o.start(t); o.stop(t + d + 0.02);
  },
  type()  { this.tone(600 + Math.random() * 200, 0.035, 'square', 0.025); },
  pop()   { this.tone(500, 0.1, 'sine', 0.1, 500); },
  tick()  { this.tone(900, 0.04, 'square', 0.05); },
  coin()  { this.tone(988, 0.07, 'square', 0.07); this.tone(1319, 0.25, 'square', 0.07, 0, 0.07); },
  win()   { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.16, 'triangle', 0.1, 0, i * 0.1)); },
  meow()  { this.tone(700, 0.16, 'triangle', 0.09, 350); this.tone(1050, 0.2, 'triangle', 0.07, -450, 0.14); }
};

/* ---------- confetti + floating sky ---------- */
const fx = $('#fx'), fxc = fx.getContext('2d');
let fxP = [], fxRun = false;
function sizeFx() { fx.width = innerWidth; fx.height = innerHeight; }
function fxLoop() {
  fxc.clearRect(0, 0, fx.width, fx.height);
  fxP = fxP.filter(p => p.l > 0);
  for (const p of fxP) {
    p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.l -= 0.008;
    fxc.globalAlpha = Math.max(0, p.l); fxc.fillStyle = p.c;
    fxc.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
  }
  fxc.globalAlpha = 1;
  if (fxP.length) requestAnimationFrame(fxLoop); else fxRun = false;
}
function burst(n = 150) {
  const cols = ['#ff7eb6', '#ffe36e', '#b8e1ff', '#cdb4ff', '#ffffff', '#ffb88c'];
  for (let i = 0; i < n; i++) fxP.push({ x: innerWidth / 2, y: innerHeight * 0.45, vx: (Math.random() - 0.5) * 15, vy: -Math.random() * 15 - 4, s: 4 + Math.random() * 6, c: cols[i % cols.length], l: 1 });
  if (!fxRun) { fxRun = true; requestAnimationFrame(fxLoop); }
}
(function sky() {
  const el = $('#sky'), gl = ['✦', '✧', '♡', '☆', '✨', '☁'];
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('span');
    s.className = 'twinkle'; s.textContent = gl[i % gl.length];
    s.style.left = rand(0, 100) + '%'; s.style.top = rand(60, 120) + '%';
    s.style.fontSize = rand(10, 28) + 'px';
    s.style.animationDuration = rand(14, 34) + 's'; s.style.animationDelay = -rand(0, 30) + 's';
    el.appendChild(s);
  }
})();
window.addEventListener('resize', sizeFx); sizeFx();

/* ---------- screen manager + per-screen draw loops ---------- */
const World = { screen: 's-boot', draw: {}, onShow: {} };
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('#' + id).classList.add('active');
  World.screen = id;
  $('#homeBtn').classList.toggle('hidden', id === 's-boot' || id === 's-name' || id === 's-hub');
  if (World.onShow[id]) World.onShow[id]();
}
function frame(t) {
  const d = World.draw[World.screen];
  if (d) d(t);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

Object.assign(window, { $, sleep, rand, pick, R, S, save, A, initAudio, Sfx, burst, show, World });
})();
