/* ===== Mochi Studio + Wardrobe ===== */
(() => {
'use strict';
const P = Sprites;
const wrap = (v, n) => (v + n) % n;

/* a row with ◀ name ▶ */
function arrowRow(parent, label, get, count, nameOf, set) {
  const row = document.createElement('div'); row.className = 'optrow';
  row.innerHTML = '<span class="lbl">' + label + '</span><button class="btn small ghost">◀</button><span class="val"></span><button class="btn small ghost">▶</button>';
  const [prev, next] = row.querySelectorAll('button'), val = row.querySelector('.val');
  const paint = () => { val.textContent = nameOf(get()); };
  prev.onclick = () => { set(wrap(get() - 1, count)); Sfx.tick(); paint(); };
  next.onclick = () => { set(wrap(get() + 1, count)); Sfx.tick(); paint(); };
  paint(); parent.appendChild(row);
  return paint;
}
/* a row of color swatches */
function swatchRow(parent, label, colors, get, set) {
  const row = document.createElement('div'); row.className = 'optrow';
  row.innerHTML = '<span class="lbl">' + label + '</span><div class="swatches"></div>';
  const box = row.querySelector('.swatches'), els = [];
  colors.forEach((c, i) => {
    const d = document.createElement('div'); d.className = 'sw'; d.style.background = c;
    d.onclick = () => { set(i); Sfx.tick(); paint(); };
    box.appendChild(d); els.push(d);
  });
  const paint = () => els.forEach((d, i) => d.classList.toggle('on', i === get()));
  paint(); parent.appendChild(row);
  return paint;
}

/* ---------------- MOCHI STUDIO ---------------- */
const mCv = $('#mochiCv'), mc = mCv.getContext('2d'); mc.imageSmoothingEnabled = false;
let mochiBuilt = false, mochiMood = 'idle', moodUntil = 0;
function buildMochi() {
  if (mochiBuilt) return; mochiBuilt = true;
  const box = $('#mochiOpts'), m = S.mochi;
  const poke = () => { mochiMood = 'happy'; moodUntil = performance.now() + 900; save(); };
  swatchRow(box, 'FUR', P.FUR.map(f => f.f), () => m.fur, v => { m.fur = v; poke(); });
  arrowRow(box, 'EYES', () => m.eyes, P.CAT_EYES.length, i => P.CAT_EYES[i].n, v => { m.eyes = v; poke(); });
  arrowRow(box, 'HAT', () => m.hat, P.HATS.length, i => P.HATS[i].n, v => { m.hat = v; poke(); });
  arrowRow(box, 'EXTRA', () => m.accessory, P.ACCS.length, i => P.ACCS[i].n, v => { m.accessory = v; poke(); });
  const inp = $('#mochiName');
  inp.addEventListener('input', () => { S.mochi.name = inp.value.trim() || 'Mochi'; save(); });
  $('#mochiDone').onclick = () => { S.mochi.name = inp.value.trim() || 'Mochi'; save(); Sfx.win(); burst(60); Hub.say('MOCHI', S.mochi.name + ' looks amazing 😭 I mean… I look amazing.'); show('s-hub'); };
  mCv.addEventListener('pointerdown', () => { mochiMood = 'happy'; moodUntil = performance.now() + 900; Sfx.meow(); });
}
World.onShow['s-mochi'] = () => { buildMochi(); $('#mochiName').value = S.mochi.name === 'Mochi' ? '' : S.mochi.name; };
World.draw['s-mochi'] = t => {
  mc.clearRect(0, 0, mCv.width, mCv.height);
  if (t > moodUntil) mochiMood = 'idle';
  const s = 9, x = Math.round((mCv.width - 16 * s) / 2), i = P.idle(t);
  const bounce = mochiMood === 'happy' ? -Math.abs(Math.sin(t / 170)) * 10 : i.bob * 2;
  mc.fillStyle = 'rgba(150,100,220,.18)'; mc.fillRect(x + s, mCv.height - 12, 14 * s, 5);
  P.drawCat(mc, x, Math.round(mCv.height - 15 * s - 14 + bounce), s, { mood: mochiMood, blink: i.blink });
};

/* ---------------- WARDROBE ---------------- */
const wCv = $('#wardCv'), wc = wCv.getContext('2d'); wc.imageSmoothingEnabled = false;
let wardBuilt = false, repaints = [], wardMood = 'idle', wardUntil = 0;
function applyPreset(key) {
  const p = P.PRESETS[key]; if (!p) return;
  Object.assign(S.avatar, { hairStyle: p.hairStyle, hairColor: p.hairColor, top: p.top, bottom: p.bottom, shoes: p.shoes, extra: p.extra, preset: key });
  save(); repaints.forEach(f => f()); paintChips();
}
function paintChips() { document.querySelectorAll('#presetChips .chip').forEach(c => c.classList.toggle('on', c.dataset.k === S.avatar.preset)); }
function buildWard() {
  if (wardBuilt) return; wardBuilt = true;
  const a = S.avatar, box = $('#wardOpts');
  const poke = () => { a.preset = 'custom'; wardMood = 'happy'; wardUntil = performance.now() + 700; save(); paintChips(); };
  Object.entries(P.PRESETS).forEach(([k, p]) => {
    const c = document.createElement('button'); c.className = 'chip'; c.dataset.k = k; c.textContent = p.n;
    c.onclick = () => { applyPreset(k); Sfx.pop(); wardMood = 'happy'; wardUntil = performance.now() + 900; };
    $('#presetChips').appendChild(c);
  });
  repaints.push(swatchRow(box, 'SKIN', P.SKIN, () => a.skin, v => { a.skin = v; poke(); }));
  repaints.push(arrowRow(box, 'HAIR', () => a.hairStyle, P.HAIRS.length, i => P.HAIRS[i], v => { a.hairStyle = v; poke(); }));
  repaints.push(swatchRow(box, 'COLOR', P.HAIRC, () => a.hairColor, v => { a.hairColor = v; poke(); }));
  repaints.push(swatchRow(box, 'EYES', P.EYEC, () => a.eyes, v => { a.eyes = v; poke(); }));
  repaints.push(arrowRow(box, 'TOP', () => a.top, P.TOPS.length, i => P.TOPS[i].n, v => { a.top = v; poke(); }));
  repaints.push(arrowRow(box, 'BOTTOM', () => a.bottom, P.BOTS.length, i => P.BOTS[i].n, v => { a.bottom = v; poke(); }));
  repaints.push(arrowRow(box, 'SHOES', () => a.shoes, P.SHOES.length, i => P.SHOES[i].n, v => { a.shoes = v; poke(); }));
  repaints.push(arrowRow(box, 'EXTRA', () => a.extra, P.EXTRAS.length, i => P.EXTRAS[i], v => { a.extra = v; poke(); }));

  $('#shuffleBtn').onclick = () => {
    const r = n => Math.floor(Math.random() * n);
    Object.assign(a, { hairStyle: r(P.HAIRS.length), hairColor: r(P.HAIRC.length), eyes: r(P.EYEC.length), top: r(P.TOPS.length), bottom: r(P.BOTS.length), shoes: r(P.SHOES.length), extra: r(P.EXTRAS.length) });
    poke(); repaints.forEach(f => f()); Sfx.coin();
  };
  $('#snapBtn').onclick = snap;
  $('#wardDone').onclick = () => { save(); Sfx.win(); burst(60); Hub.say('THEO', 'Okay. ' + S.name + ' came to PLAY 🔥'); show('s-hub'); };
  paintChips();
}
World.onShow['s-ward'] = buildWard;
World.draw['s-ward'] = t => {
  wc.clearRect(0, 0, wCv.width, wCv.height);
  if (t > wardUntil) wardMood = 'idle';
  const s = 6, x = Math.round((wCv.width - 16 * s) / 2), i = P.idle(t, 420);
  const bounce = wardMood === 'happy' ? -Math.abs(Math.sin(t / 150)) * 8 : i.bob * 1.5;
  wc.fillStyle = 'rgba(150,100,220,.2)'; wc.fillRect(x + s, wCv.height - 14, 14 * s, 5);
  P.drawGirl(wc, S.avatar, x, Math.round(24 + bounce), s, { mood: wardMood, blink: i.blink });
};

/* photo booth: she + Mochi on a pastel card, saved as a PNG */
function snap() {
  const cv = document.createElement('canvas'); cv.width = 360; cv.height = 420;
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  const g = c.createLinearGradient(0, 0, 360, 420); g.addColorStop(0, '#ffd1e6'); g.addColorStop(0.5, '#e2d1ff'); g.addColorStop(1, '#b8e1ff');
  c.fillStyle = g; c.fillRect(0, 0, 360, 420);
  c.fillStyle = 'rgba(255,255,255,.35)';
  for (let y = 12; y < 420; y += 24) for (let x = ((y / 24) % 2) * 12 + 8; x < 360; x += 24) c.fillRect(x, y, 4, 4);
  c.fillStyle = '#fff6ea'; c.fillRect(20, 20, 320, 380);
  c.strokeStyle = '#5b3f94'; c.lineWidth = 6; c.strokeRect(20, 20, 320, 380);
  c.fillStyle = '#ffe9f3'; c.fillRect(26, 26, 308, 300);
  c.fillStyle = '#ffdcb8'; c.fillRect(26, 270, 308, 56);
  P.drawGirl(c, S.avatar, 86, 70, 8, { mood: 'happy' });
  P.drawCat(c, 214, 214, 5, { mood: 'happy' });
  c.fillStyle = '#5b3f94'; c.textAlign = 'center';
  c.font = '16px "Press Start 2P", monospace'; c.fillText(S.name.toUpperCase(), 180, 366);
  c.font = '8px "Press Start 2P", monospace'; c.fillStyle = '#7a5fb8'; c.fillText('& ' + S.mochi.name + ' · Mochi\'s World', 180, 386);
  const a = document.createElement('a'); a.download = 'mochis-world-' + S.name.toLowerCase() + '.png'; a.href = cv.toDataURL('image/png'); a.click();
  Sfx.coin(); burst(50);
}
})();
