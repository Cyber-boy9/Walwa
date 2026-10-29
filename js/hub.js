/* ===== hub room, boot, name pick, navigation ===== */
(() => {
'use strict';
const P = Sprites;
const roomCv = $('#room'), rc = roomCv.getContext('2d'); rc.imageSmoothingEnabled = false;
const hearts = [];
let hubMood = 'idle', hubUntil = 0, theoMood = 'idle';

/* ---------- mini cat canvases on boot / name / soon screens ---------- */
const minis = { 's-boot': 'bootCat', 's-name': 'nameCat', 's-soon': 'soonCat' };
Object.keys(minis).forEach(sc => {
  const cv = $('#' + minis[sc]), c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  World.draw[sc] = t => {
    c.clearRect(0, 0, cv.width, cv.height);
    const s = Math.floor((cv.width - 32) / 16), x = Math.round((cv.width - 16 * s) / 2), i = P.idle(t);
    const happy = sc !== 's-boot' || window.__bootDone;
    const bounce = happy ? -Math.abs(Math.sin(t / 170)) * s : i.bob * s * 0.25;
    c.fillStyle = 'rgba(150,100,220,.18)'; c.fillRect(x + s, cv.height - 10, 14 * s, 4);
    P.drawCat(c, x, Math.round(cv.height - 15 * s - 8 + bounce), s, { mood: happy ? 'happy' : 'idle', blink: i.blink });
  };
});

/* ---------- the room ---------- */
function drawHeart(x, y, s, a) { rc.globalAlpha = a; P.spr(rc, P.HEART, x, y, s, { r: '#ff7eb6' }); rc.globalAlpha = 1; }
function drawRoom(t) {
  const W = 360, ctx = rc;
  let g = ctx.createLinearGradient(0, 0, 0, 170); g.addColorStop(0, '#dcc8ff'); g.addColorStop(1, '#ffd0e8');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 170);
  ctx.fillStyle = 'rgba(255,255,255,.18)';
  for (let y = 10; y < 170; y += 20) for (let x = ((y / 20) % 2) * 10 + 6; x < W; x += 20) ctx.fillRect(x, y, 3, 3);
  R(ctx, 0, 170, W, 60, '#ffdcb8');
  for (let x = 0; x < W; x += 40) R(ctx, x, 170, 2, 60, '#f7c8a0');
  R(ctx, 0, 170, W, 6, '#f2bd90');

  // window with drifting clouds
  R(ctx, 140, 18, 92, 72, '#fff0e1');
  ctx.save(); ctx.beginPath(); ctx.rect(145, 23, 82, 62); ctx.clip();
  const sg = ctx.createLinearGradient(0, 23, 0, 85); sg.addColorStop(0, '#8fd8ff'); sg.addColorStop(0.6, '#ffc9e6'); sg.addColorStop(1, '#ffe3a8');
  ctx.fillStyle = sg; ctx.fillRect(145, 23, 82, 62);
  ctx.fillStyle = '#fff6b0'; ctx.beginPath(); ctx.arc(205, 70, 14, 0, 7); ctx.fill();
  [[0, 36, 28], [40, 50, 22]].forEach(([ox, y, w]) => { const x = 140 + ((ox + t / 45) % 110) - 10; R(ctx, Math.round(x), y, w, 7, '#fff'); R(ctx, Math.round(x) + 5, y - 5, w - 12, 6, '#fff'); });
  ctx.restore();
  R(ctx, 184, 23, 3, 62, '#fff0e1'); R(ctx, 145, 52, 82, 3, '#fff0e1');

  // poster
  R(ctx, 20, 26, 52, 64, INKC); R(ctx, 24, 30, 44, 56, '#fffaf0');
  P.spr(ctx, P.HEART, 32, 38, 3, { r: '#ff7eb6' });
  R(ctx, 30, 68, 32, 2, '#8a7aa8'); R(ctx, 30, 74, 24, 2, '#8a7aa8');

  // jukebox (glows while music plays)
  const jx = 262, jy = 70;
  if (Juke.isPlaying()) { ctx.fillStyle = 'rgba(255,126,182,' + (0.15 + 0.1 * Math.sin(t / 160)) + ')'; ctx.fillRect(jx - 12, jy - 12, 74, 120); }
  R(ctx, jx, jy, 50, 94, INKC); R(ctx, jx + 4, jy + 4, 42, 86, '#ff9ec7');
  R(ctx, jx + 8, jy + 8, 34, 30, '#2a1d44');
  const cols = ['#ff7eb6', '#ffe36e', '#8fd3ff', '#8fe3c0'];
  for (let i = 0; i < 4; i++) { const h = Juke.isPlaying() ? 6 + Math.abs(Math.sin(t / (110 + i * 30) + i)) * 20 : 4; R(ctx, jx + 11 + i * 8, jy + 36 - h, 6, h, cols[i]); }
  R(ctx, jx + 8, jy + 44, 34, 8, '#ffe36e'); R(ctx, jx + 8, jy + 58, 34, 4, '#fff0e1'); R(ctx, jx + 8, jy + 68, 34, 4, '#fff0e1');
  R(ctx, jx + 18, jy + 78, 14, 6, INKC);
  if (Juke.isPlaying()) for (let i = 0; i < 3; i++) { const o = (t / 700 + i / 3) % 1; ctx.globalAlpha = 1 - o; ctx.fillStyle = '#fff'; ctx.font = '12px monospace'; ctx.fillText('♪', jx - 8 - i * 3, jy - o * 30 + 10); ctx.globalAlpha = 1; }

  // rug + plant
  R(ctx, 70, 184, 200, 36, '#ff9ebb'); R(ctx, 76, 188, 188, 28, '#ffc2d6');
  for (let x = 82; x < 252; x += 16) R(ctx, x, 200, 8, 3, '#ff9ebb');
  R(ctx, 8, 150, 26, 6, '#c9795a'); R(ctx, 11, 156, 20, 20, '#d98c6a');
  R(ctx, 18, 128, 6, 24, '#6fcf97'); R(ctx, 8, 136, 6, 16, '#6fcf97'); R(ctx, 28, 134, 6, 18, '#6fcf97');

  // characters, all standing on the floor line (y=214)
  const i = P.idle(t), floor = 214, s = 4;
  if (t > hubUntil) hubMood = 'idle';
  const hb = hubMood === 'happy' ? -Math.abs(Math.sin(t / 150)) * 6 : i.bob * 1.2;
  P.drawGirl(rc, S.avatar, 104, Math.round(floor - 30 * s + hb), s, { blink: i.blink, mood: hubMood });
  P.drawCat(rc, 176, Math.round(floor - 15 * 3 + i.bob), 3, { cfg: S.mochi, mood: hubMood, blink: i.blink });
  const tb = theoMood === 'happy' ? -Math.abs(Math.sin(t / 160)) * 5 : Math.sin(t / 500) * 1.2;
  P.drawTheo(rc, 214, Math.round(floor - 30 * s + tb), s, { blink: i.blink, mood: 'happy' });

  // hearts when excited
  if (hubMood === 'happy' && Math.random() < 0.15) hearts.push({ x: rand(104, 270), y: 100, v: rand(.4, .9), a: 1 });
  for (let k = hearts.length - 1; k >= 0; k--) {
    const h = hearts[k]; h.y -= h.v; h.a -= .01; h.x += Math.sin(h.y / 9) * .4;
    if (h.a <= 0) { hearts.splice(k, 1); continue; }
    drawHeart(Math.round(h.x), Math.round(h.y), 2, h.a);
  }
}
const INKC = '#5b3f94';
World.draw['s-hub'] = drawRoom;

/* tap a character to hear them */
roomCv.addEventListener('pointerdown', e => {
  const r = roomCv.getBoundingClientRect(), x = (e.clientX - r.left) * (360 / r.width);
  hubMood = 'happy'; hubUntil = performance.now() + 900;
  if (x > 200 && x < 262) { Sfx.pop(); Hub.say('THEO', pick(THEO_LINES)); }
  else if (x > 170 && x <= 200) { Sfx.meow(); Hub.say('MOCHI', pick(MOCHI_LINES)); }
  else if (x > 255) { Sfx.coin(); show('s-music'); }
  else { Sfx.pop(); Hub.say('MOCHI', pick(HER_LINES)); }
});

/* ---------- dialogue strip ---------- */
const MOCHI_LINES = ['mrrp. (translation: pet me.)', 'i am a very serious cat with very serious drip.', "i've been told i'm the main character. i did not argue.", 'purr purr. that\'s all you get.'];
const THEO_LINES = [
  "Don't mind me, I'm just standing here looking this good.",
  "Honestly? Best room in the world. Fight me.",
  'I built this at midnight. Skipped sleep for you, no big deal. (It was a big deal.)',
  "Pick a song. I'll pretend I'm not judging your taste. 😏",
  'Wait till you see what I add next…'
];
const HER_LINES = ['that fit?? clean.', 'main character energy, confirmed.', 'the room just got prettier.', "okay but you're glowing today."];
const Hub = {
  say(who, text) {
    const w = $('#hubWho');
    w.textContent = (who === 'THEO' ? CONFIG.hisName.toUpperCase() + ' 😎' : (S.mochi.name.toUpperCase() + ' 🐱'));
    w.classList.toggle('him', who === 'THEO');
    typeInto($('#hubText'), text);
    theoMood = who === 'THEO' ? 'happy' : 'idle';
  }
};
let typeTimer;
function typeInto(el, text) {
  clearInterval(typeTimer); let n = 0; el.textContent = '';
  const chars = Array.from(text);
  typeTimer = setInterval(() => { n++; el.textContent = chars.slice(0, n).join(''); if (n % 3 === 0) Sfx.type(); if (n >= chars.length) clearInterval(typeTimer); }, 22);
}
window.Hub = Hub;

/* ---------- menu ---------- */
const MENU = [
  { icon: '🎵', label: 'JUKEBOX', go: () => show('s-music') },
  { icon: '👗', label: 'WARDROBE', go: () => show('s-ward') },
  { icon: '🐱', label: 'STYLE MOCHI', go: () => show('s-mochi') },
  { icon: '☕', label: 'CAFE & BEACH', go: () => show('s-cafe') },
  { icon: '🚗', label: 'ROAD TRIP', go: () => show('s-road') },
  { icon: '💌', label: 'POSTCARDS', soon: ['POSTCARDS', 'little notes from far away.\nthey are being written ✉️'] }
];
MENU.forEach(m => {
  const b = document.createElement('button');
  b.className = 'btn' + (m.soon ? ' ghost locked' : '');
  b.innerHTML = '<b>' + m.icon + '</b>' + m.label + (m.soon ? '<span style="font-size:7px;opacity:.7">SOON</span>' : '');
  b.onclick = () => { Sfx.pop(); if (m.soon) { $('#soonTitle').textContent = m.soon[0]; $('#soonText').textContent = m.soon[1]; show('s-soon'); } else m.go(); };
  $('#menu').appendChild(b);
});
$('#soonBack').onclick = () => { Sfx.pop(); show('s-hub'); };
$('#homeBtn').onclick = () => { Sfx.pop(); show('s-hub'); };

/* ---------- boot + first-time name ---------- */
function greet() {
  const h = new Date().getHours();
  const part = h < 5 ? 'Up late, ' : h < 12 ? 'Good morning, ' : h < 18 ? 'Hey, ' : 'Good evening, ';
  S.visits++; save();
  const first = S.visits === 1;
  show('s-hub');
  Hub.say('MOCHI', first
    ? 'welcome home, ' + S.name + '! 🐱 tap me, tap Theo, tap the jukebox. or just use the buttons below.'
    : part + S.name + '! ' + S.mochi.name + ' missed you. (Theo too. he says "whatever".)');
}
async function boot() {
  const msgs = ['loading cuteness…', 'tuning the jukebox…', 'ironing the outfits…', 'feeding the cat…', 'ready.'];
  const bar = $('#bootBar'), m = $('#bootMsg');
  for (let i = 0; i < msgs.length; i++) { m.textContent = msgs[i]; bar.style.width = Math.round((i + 1) / msgs.length * 100) + '%'; await sleep(450); }
  window.__bootDone = true;
  $('#startBtn').classList.remove('hidden');
  await new Promise(r => $('#startBtn').addEventListener('click', r, { once: true }));
  initAudio(); Sfx.pop();
  if (!S.name) { await pickName(); }
  Juke.resume();
  greet();
}
function pickName() {
  return new Promise(res => {
    show('s-name');
    const chips = $('#nameChips'); chips.innerHTML = '';
    CONFIG.nameOptions.forEach(n => {
      const c = document.createElement('button'); c.className = 'chip'; c.textContent = n;
      c.onclick = () => { $('#nameInput').value = n; Sfx.tick(); document.querySelectorAll('#nameChips .chip').forEach(x => x.classList.toggle('on', x === c)); };
      chips.appendChild(c);
    });
    const go = () => {
      const v = $('#nameInput').value.trim().slice(0, 16);
      if (!v) { $('#nameInput').focus(); Sfx.tick(); return; }
      S.name = v; save(); Sfx.win(); burst(80); res();
    };
    $('#nameGo').onclick = go;
    $('#nameInput').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  });
}
document.title = "Mochi's World 🐱";
boot();
})();
