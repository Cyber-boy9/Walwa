/* ===== sprites: Mochi (customizable cat), the girl (dress-up), Theo ===== */
(() => {
'use strict';
const INK = '#5b3f94';

/* ---------- generic pixel helpers ---------- */
function spr(ctx, rows, x, y, s, pal) {
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === '.' || !pal[ch]) continue;
      ctx.fillStyle = pal[ch];
      ctx.fillRect(x + c * s, y + r * s, s, s);
    }
  }
}
// outlined box in grid units
function box(ctx, O, x, y, w, h, c) {
  const s = O.s;
  ctx.fillStyle = INK; ctx.fillRect(O.x + (x - 1) * s, O.y + (y - 1) * s, (w + 2) * s, (h + 2) * s);
  ctx.fillStyle = c; ctx.fillRect(O.x + x * s, O.y + y * s, w * s, h * s);
}
function px(ctx, O, x, y, w, h, c) {
  ctx.fillStyle = c; ctx.fillRect(O.x + x * O.s, O.y + y * O.s, w * O.s, h * O.s);
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = v => Math.max(0, Math.min(255, v + amt));
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join('');
}

/* ================= MOCHI THE CAT ================= */
const CAT = [
  '..oo........oo..', '.oppo......oppo.', '.offfoooooofffo.', '.offffffffffffo.',
  'offffffffffffffo', 'offweffffffweffo', 'offeeffffffeeffo', 'ofbbfffppfffbbfo',
  'offfffoffofffffo', '.offffffffffffo.', '..offffffffffo..', '..offsffffsffo..',
  '..offffffffffo..', '..ofppffffppfo..', '..oooooooooooo..'
];
const FUR = [
  { n: 'Cream', f: '#fff0e1', s: '#ffc9a0' }, { n: 'Cocoa', f: '#c9956b', s: '#a8714d' },
  { n: 'Midnight', f: '#5a4d78', s: '#3f3459' }, { n: 'Snow', f: '#ffffff', s: '#e6dcf5' },
  { n: 'Ginger', f: '#ffb070', s: '#e58a4a' }, { n: 'Lavender', f: '#d9c6ff', s: '#b59cf0' },
  { n: 'Mint', f: '#c3f2dc', s: '#8fd9b8' }, { n: 'Bubblegum', f: '#ffc2dc', s: '#ff9ebb' }
];
const CAT_EYES = [{ n: 'Classic', c: '#2a1d44' }, { n: 'Ocean', c: '#3a79d8' }, { n: 'Emerald', c: '#2f8f5a' }, { n: 'Gold', c: '#e8a800' }, { n: 'Violet', c: '#8a4fd8' }];
const HP = { h: '#ff7eb6', i: '#ffe36e', y: '#ffd23f', r: '#ff5c8a', k: '#2a1d44', w: '#fff' };
const HATS = [
  { n: 'None', rows: [], dy: 0 },
  { n: 'Party hat', dy: -2, rows: ['.......ii.......', '......hhhh......', '.....hhihhh.....', '....hhhhhhhh....'] },
  { n: 'Crown', dy: -1, rows: ['....y..yy..y....', '....yyyyyyyy....', '....yryyyyry....'] },
  { n: 'Big bow', dy: 0, rows: ['.........rr.rr..', '.........rrkrr..', '.........rr.rr..'] },
  { n: 'Beanie', dy: -1, rows: ['.....hhhhhh.....', '...hhhhhhhhhh...', '..hhihihihihhh..', '..hhhhhhhhhhhh..'] },
  { n: 'Flower', dy: 0, rows: ['.r.r............', '..y.............', '.r.r............'] }
];
const ACCS = [
  { n: 'None', rows: [], dy: 0 },
  { n: 'Scarf', dy: 10, rows: ['..ohhhhhhhhhho..', '..ohhihhhhhhho..', '...hih..........'] },
  { n: 'Glasses', dy: 4, rows: ['..kkkk....kkkk..', '..k..k.kk.k..k..', '..k..k....k..k..', '..kkkk....kkkk..'] },
  { n: 'Shades', dy: 5, rows: ['..kkkk.kk.kkkk..', '..kkkk....kkkk..', '...kk......kk...'] },
  { n: 'Bell collar', dy: 10, rows: ['..orrrrrrrrrro..', '.......yy.......'] },
  { n: 'Bowtie', dy: 10, rows: ['......rrkrr.....', '.....rrr.rrr....'] },
  { n: 'Headphones', dy: 1, rows: ['.....kkkkkk.....', '...k........k...', '..k..........k..', 'kk............kk', 'kk............kk', 'kk............kk', 'kk............kk'] }
];
// HAT colors vary by pick so the studio feels alive
const HAT_COLORS = ['#ff7eb6', '#8fd3ff', '#b49aff', '#7be0a8', '#ffb070'];

const catCache = {};
function catRows(mood, blink) {
  const key = mood + (blink ? 'b' : '');
  if (catCache[key]) return catCache[key];
  const g = CAT.map(r => r.split(''));
  const eyes = (r5, r6) => [[3, 4], [11, 12]].forEach(([a, b]) => {
    g[5][a] = r5[0]; g[5][b] = r5[1]; g[6][a] = r6[0]; g[6][b] = r6[1];
  });
  if (mood === 'happy') { eyes('ff', 'oo'); g[8][7] = 'p'; g[8][8] = 'p'; }
  else if (blink) eyes('ff', 'oo');
  if (mood === 'sad') { g[7][3] = 'a'; g[8][7] = 'o'; g[8][8] = 'o'; }
  return (catCache[key] = g.map(r => r.join('')));
}
function drawCat(ctx, x, y, s, o = {}) {
  const m = o.cfg || S.mochi, fur = FUR[m.fur] || FUR[0];
  let eye = (CAT_EYES[m.eyes] || CAT_EYES[0]).c;
  if (m.fur === 2 && m.eyes === 0) eye = '#ffe36e';
  const pal = { o: INK, f: fur.f, p: '#ff9ebb', e: eye, w: '#ffffff', s: fur.s, b: '#ffb3c7', a: '#8fd3ff' };
  spr(ctx, catRows(o.mood || 'idle', o.blink), x, y, s, pal);
  const hat = HATS[m.hat] || HATS[0];
  if (hat.rows.length) spr(ctx, hat.rows, x, y + hat.dy * s, s, { ...HP, h: HAT_COLORS[m.fur % 5], r: HP.r });
  const acc = ACCS[m.accessory] || ACCS[0];
  if (acc.rows.length) spr(ctx, acc.rows, x, y + acc.dy * s, s, { ...HP, h: HAT_COLORS[(m.fur + 2) % 5] });
}

/* ================= HER (dress-up avatar) ================= */
const SKIN = ['#ffe3cf', '#f6caa3', '#e0a878', '#c68642', '#8d5524', '#5c3a1e'];
const HAIRC = ['#2a1d2e', '#4a2c1f', '#7a4a2a', '#8a1f3d', '#e8c46a', '#ff7eb6', '#b49aff', '#5aa9ff', '#e9e6f0'];
const HAIRC_N = ['Jet black', 'Espresso', 'Chestnut', 'Burgundy', 'Honey blonde', 'Bubblegum', 'Lavender', 'Sky blue', 'Silver'];
const EYEC = ['#2a1d44', '#5a3418', '#8a6d2a', '#2f8f5a', '#3a79d8', '#8a4fd8'];
const EYEC_N = ['Midnight', 'Brown', 'Hazel', 'Green', 'Blue', 'Violet'];
const HAIRS = ['Top bun', 'Long & sleek', 'Afro puffs', 'Braids', 'Bob', 'High pony'];
const TOPS = [
  { n: 'Basic tee', c: '#ffffff', a: '#ffb3d1', long: 0, d: 'none' },
  { n: 'Cozy hoodie', c: '#b49aff', a: '#8a6fd8', long: 1, d: 'hood' },
  { n: 'Black crop tee', c: '#2a2438', a: '#ff7eb6', long: 0, d: 'none' },
  { n: 'Navy blazer', c: '#27355e', a: '#ffffff', long: 1, d: 'lapel' },
  { n: 'Knit sweater', c: '#e8d5b0', a: '#c9ae80', long: 1, d: 'knit' },
  { n: 'Lace top', c: '#1c1a24', a: '#6b5b95', long: 0, d: 'lace' },
  { n: 'Baby tee', c: '#ff9ec7', a: '#ffe36e', long: 0, d: 'star' },
  { n: 'Varsity jacket', c: '#2f4d8a', a: '#ffffff', long: 1, d: 'varsity' },
  { n: 'Silk blouse', c: '#f5d6e0', a: '#ffffff', long: 1, d: 'collar' }
];
const BOTS = [
  { n: 'Blue jeans', c: '#5b86d6', t: 'pants', l: 8 }, { n: 'Mini skirt', c: '#ff7eb6', t: 'skirt', l: 4 },
  { n: 'Pleated skirt', c: '#3a3a5c', t: 'skirt', l: 5, p: 1 }, { n: 'Black cargo', c: '#2a2438', t: 'pants', l: 8, k: 1 },
  { n: 'Tailored trousers', c: '#e8dcc2', t: 'pants', l: 8 }, { n: 'Long skirt', c: '#7a5fb8', t: 'skirt', l: 8 },
  { n: 'Denim shorts', c: '#7ea6e8', t: 'pants', l: 4 }, { n: 'Leather pants', c: '#1c1a24', t: 'pants', l: 8, sh: 1 }
];
const SHOES = [
  { n: 'Sneakers', c: '#ffffff', h: 2 }, { n: 'Combat boots', c: '#2a2438', h: 5 }, { n: 'Heels', c: '#ff3d7f', h: 2, heel: 1 },
  { n: 'Loafers', c: '#7a4a2a', h: 2 }, { n: 'Platforms', c: '#1c1a24', h: 3 }, { n: 'Ballet flats', c: '#ffb3d1', h: 1 }
];
const EXTRAS = ['None', 'Round glasses', 'Sunnies', 'Gold hoops', 'Choker', 'Cap', 'Beret', 'Headphones', 'Heart bag', 'Pearl necklace'];
const PRESETS = {
  casual:     { n: 'Casual', hairStyle: 2, hairColor: 0, top: 1, bottom: 0, shoes: 0, extra: 0 },
  baddie:     { n: 'Baddie', hairStyle: 1, hairColor: 0, top: 2, bottom: 7, shoes: 2, extra: 2 },
  goth:       { n: 'Goth', hairStyle: 1, hairColor: 0, top: 5, bottom: 2, shoes: 1, extra: 4 },
  classy:     { n: 'Classy', hairStyle: 0, hairColor: 1, top: 8, bottom: 4, shoes: 2, extra: 3 },
  oldmoney:   { n: 'Old money', hairStyle: 4, hairColor: 2, top: 4, bottom: 4, shoes: 3, extra: 9 },
  y2k:        { n: 'Y2K', hairStyle: 5, hairColor: 5, top: 6, bottom: 1, shoes: 4, extra: 3 },
  street:     { n: 'Streetwear', hairStyle: 3, hairColor: 0, top: 7, bottom: 3, shoes: 0, extra: 5 }
};

function drawGirl(ctx, a, x, y, s, o = {}) {
  a = a || S.avatar;
  const O = { x, y, s };
  const skin = SKIN[a.skin] || SKIN[2], hair = HAIRC[a.hairColor] || HAIRC[0], hd = shade(hair, -30);
  const top = TOPS[a.top] || TOPS[0], bot = BOTS[a.bottom] || BOTS[0], shoe = SHOES[a.shoes] || SHOES[0];
  const eyeC = EYEC[a.eyes] || EYEC[0], hs = a.hairStyle, ex = a.extra;
  const blink = o.blink, happy = o.mood === 'happy';

  // 1) hair behind
  if (hs === 1) box(ctx, O, 3, 3, 10, 17, hair);
  else if (hs === 2) { box(ctx, O, 1, 0, 6, 6, hair); box(ctx, O, 9, 0, 6, 6, hair); box(ctx, O, 3, 2, 10, 4, hair); }
  else if (hs === 3) { box(ctx, O, 2, 8, 2, 15, hair); box(ctx, O, 12, 8, 2, 15, hair); for (let i = 0; i < 7; i++) { px(ctx, O, 2, 9 + i * 2, 2, 1, hd); px(ctx, O, 12, 9 + i * 2, 2, 1, hd); } }
  else if (hs === 4) box(ctx, O, 3, 3, 10, 10, hair);
  else if (hs === 5) { box(ctx, O, 12, 3, 3, 12, hair); px(ctx, O, 12, 6, 3, 1, hd); px(ctx, O, 12, 10, 3, 1, hd); }
  else if (hs === 0) box(ctx, O, 6, -2, 4, 4, hair);
  if (ex === 8) box(ctx, O, 11, 17, 4, 4, '#ff5c8a'); // bag strap/body drawn behind arm

  // 2) legs + shoes
  px(ctx, O, 5, 18, 2, 10, skin); px(ctx, O, 9, 18, 2, 10, skin);
  const sy = 29 - shoe.h;
  box(ctx, O, 4, sy, 4, shoe.h, shoe.c); box(ctx, O, 8, sy, 4, shoe.h, shoe.c);
  if (shoe.heel) { px(ctx, O, 4, 29, 1, 1, '#2a1d44'); px(ctx, O, 11, 29, 1, 1, '#2a1d44'); }
  if (shoe.h >= 5) { px(ctx, O, 4, sy + 1, 4, 1, shade(shoe.c, 25)); px(ctx, O, 8, sy + 1, 4, 1, shade(shoe.c, 25)); }

  // 3) bottoms
  if (bot.t === 'pants') {
    box(ctx, O, 5, 18, 3, bot.l, bot.c); box(ctx, O, 8, 18, 3, bot.l, bot.c);
    if (bot.k) { px(ctx, O, 5, 21, 1, 2, shade(bot.c, 30)); px(ctx, O, 10, 21, 1, 2, shade(bot.c, 30)); }
    if (bot.sh) { px(ctx, O, 6, 19, 1, bot.l - 2, shade(bot.c, 45)); px(ctx, O, 9, 19, 1, bot.l - 2, shade(bot.c, 45)); }
  } else {
    box(ctx, O, 4, 18, 8, bot.l, bot.c);
    if (bot.p) for (let i = 0; i < 4; i++) px(ctx, O, 5 + i * 2, 19, 1, bot.l - 1, shade(bot.c, -25));
  }

  // 4) torso + arms
  const tl = top.long ? 8 : 6;
  box(ctx, O, 5, 11, 6, 7, top.c);
  box(ctx, O, 3, 12, 2, top.long ? 6 : 3, top.long ? top.c : skin);
  box(ctx, O, 11, 12, 2, top.long ? 6 : 3, top.long ? top.c : skin);
  if (!top.long) { px(ctx, O, 3, 15, 2, 3, skin); px(ctx, O, 11, 15, 2, 3, skin); }
  else { px(ctx, O, 3, 17, 2, 1, skin); px(ctx, O, 11, 17, 2, 1, skin); }
  if (top.d === 'hood') { px(ctx, O, 5, 11, 6, 1, top.a); px(ctx, O, 7, 13, 1, 3, top.a); px(ctx, O, 9, 13, 1, 3, top.a); }
  if (top.d === 'lapel') { px(ctx, O, 6, 11, 1, 4, top.a); px(ctx, O, 9, 11, 1, 4, top.a); px(ctx, O, 7, 11, 2, 1, '#e8e4f0'); }
  if (top.d === 'knit') for (let i = 0; i < 3; i++) px(ctx, O, 5, 12 + i * 2, 6, 1, top.a);
  if (top.d === 'lace') { for (let i = 0; i < 6; i += 2) px(ctx, O, 5 + i, 12, 1, 1, top.a); px(ctx, O, 5, 17, 6, 1, top.a); }
  if (top.d === 'star') px(ctx, O, 7, 13, 2, 2, top.a);
  if (top.d === 'varsity') { px(ctx, O, 7, 11, 2, 7, '#fff'); px(ctx, O, 3, 14, 2, 1, top.a); px(ctx, O, 11, 14, 2, 1, top.a); }
  if (top.d === 'collar') { px(ctx, O, 6, 11, 1, 2, top.a); px(ctx, O, 9, 11, 1, 2, top.a); px(ctx, O, 8, 14, 1, 1, '#d9a9b9'); px(ctx, O, 8, 16, 1, 1, '#d9a9b9'); }
  if (ex === 8) px(ctx, O, 12, 17, 2, 2, '#ff9ec7');
  if (ex === 9) for (let i = 0; i < 4; i++) px(ctx, O, 6 + i, 11 + (i === 1 || i === 2 ? 1 : 0), 1, 1, '#fffaf0');
  if (ex === 4) px(ctx, O, 6, 10, 4, 1, '#1c1a24');

  // 5) head
  box(ctx, O, 4, 3, 8, 8, skin);
  px(ctx, O, 5, 9, 1, 1, '#ff9eb8'); px(ctx, O, 10, 9, 1, 1, '#ff9eb8');
  if (blink || happy) { px(ctx, O, 5, 8, 2, 1, eyeC); px(ctx, O, 9, 8, 2, 1, eyeC); }
  else { px(ctx, O, 5, 7, 2, 2, eyeC); px(ctx, O, 9, 7, 2, 2, eyeC); px(ctx, O, 5, 7, 1, 1, '#fff'); px(ctx, O, 9, 7, 1, 1, '#fff'); }
  px(ctx, O, 7, 9, 2, 1, '#c0506f');
  if (happy) px(ctx, O, 6, 9, 4, 1, '#c0506f');

  // 6) hair front
  if (hs === 2) { box(ctx, O, 3, 2, 10, 3, hair); }
  else if (hs === 5) { box(ctx, O, 3, 2, 10, 3, hair); px(ctx, O, 3, 5, 1, 3, hair); }
  else if (hs === 4) { box(ctx, O, 3, 2, 10, 4, hair); px(ctx, O, 3, 6, 1, 4, hair); px(ctx, O, 12, 6, 1, 4, hair); }
  else if (hs === 1) { box(ctx, O, 3, 2, 10, 3, hair); px(ctx, O, 3, 5, 1, 6, hair); px(ctx, O, 12, 5, 1, 6, hair); px(ctx, O, 7, 5, 2, 1, hair); }
  else if (hs === 3) { box(ctx, O, 3, 2, 10, 3, hair); for (let i = 0; i < 4; i++) px(ctx, O, 4 + i * 2, 2, 1, 3, hd); }
  else { box(ctx, O, 3, 2, 10, 3, hair); px(ctx, O, 3, 5, 1, 2, hair); px(ctx, O, 12, 5, 1, 2, hair); }

  // 7) head extras
  if (ex === 1) { px(ctx, O, 4, 6, 4, 1, '#2a1d44'); px(ctx, O, 8, 6, 4, 1, '#2a1d44'); px(ctx, O, 4, 9, 4, 1, '#2a1d44'); px(ctx, O, 8, 9, 4, 1, '#2a1d44'); px(ctx, O, 4, 6, 1, 4, '#2a1d44'); px(ctx, O, 7, 6, 2, 1, '#2a1d44'); px(ctx, O, 11, 6, 1, 4, '#2a1d44'); }
  if (ex === 2) { px(ctx, O, 4, 6, 8, 3, '#1c1a24'); px(ctx, O, 5, 6, 1, 1, '#6b5b95'); px(ctx, O, 9, 6, 1, 1, '#6b5b95'); }
  if (ex === 3) { px(ctx, O, 3, 9, 1, 3, '#ffd23f'); px(ctx, O, 12, 9, 1, 3, '#ffd23f'); }
  if (ex === 5) { box(ctx, O, 3, 1, 10, 2, '#1c1a24'); box(ctx, O, 9, 2, 6, 1, '#1c1a24'); }
  if (ex === 6) { box(ctx, O, 2, 1, 11, 2, '#8a1f3d'); px(ctx, O, 7, 0, 1, 1, '#8a1f3d'); }
  if (ex === 7) { box(ctx, O, 2, 6, 2, 4, '#ff7eb6'); box(ctx, O, 12, 6, 2, 4, '#ff7eb6'); px(ctx, O, 3, 1, 10, 1, '#ff7eb6'); }
}

/* ================= THEO (him: taper fade + twists) ================= */
function drawTheo(ctx, x, y, s, o = {}) {
  const O = { x, y, s }, skin = '#8d5524', hair = '#1c1626';
  const blink = o.blink, smirk = o.mood === 'happy';
  // legs, sneakers
  box(ctx, O, 5, 18, 3, 9, '#2a2438'); box(ctx, O, 8, 18, 3, 9, '#2a2438');
  box(ctx, O, 4, 27, 4, 2, '#ffffff'); box(ctx, O, 8, 27, 4, 2, '#ffffff'); px(ctx, O, 4, 28, 8, 1, '#ff7eb6');
  // black bomber jacket
  box(ctx, O, 4, 11, 8, 7, '#23202e');
  box(ctx, O, 2, 12, 2, 6, '#23202e'); box(ctx, O, 12, 12, 2, 6, '#23202e');
  px(ctx, O, 2, 17, 2, 1, '#ff7eb6'); px(ctx, O, 12, 17, 2, 1, '#ff7eb6');
  px(ctx, O, 7, 11, 2, 7, '#3a3550'); px(ctx, O, 4, 17, 8, 1, '#ff7eb6');
  // gold chain
  px(ctx, O, 6, 11, 4, 1, '#ffd23f'); px(ctx, O, 7, 12, 2, 1, '#ffd23f'); px(ctx, O, 7, 13, 2, 1, '#fff3a0');
  // head
  box(ctx, O, 4, 3, 8, 8, skin);
  // taper fade sides
  px(ctx, O, 4, 4, 1, 3, '#3a2a1c'); px(ctx, O, 11, 4, 1, 3, '#3a2a1c');
  // eyes + brows + smirk
  if (blink) { px(ctx, O, 5, 8, 2, 1, '#1c1626'); px(ctx, O, 9, 8, 2, 1, '#1c1626'); }
  else { px(ctx, O, 5, 7, 2, 2, '#1c1626'); px(ctx, O, 9, 7, 2, 2, '#1c1626'); px(ctx, O, 5, 7, 1, 1, '#fff'); px(ctx, O, 9, 7, 1, 1, '#fff'); }
  px(ctx, O, 5, 6, 2, 1, '#1c1626'); px(ctx, O, 9, 6, 2, 1, '#1c1626');
  px(ctx, O, 7, 9, 3, 1, '#4a2410');
  if (smirk) { px(ctx, O, 9, 9, 2, 1, '#fff'); px(ctx, O, 10, 8, 1, 1, '#4a2410'); }
  else px(ctx, O, 9, 9, 1, 1, '#4a2410');
  // twists on top
  box(ctx, O, 4, 1, 8, 3, hair);
  for (let i = 0; i < 4; i++) { px(ctx, O, 4 + i * 2, 0, 1, 2, hair); px(ctx, O, 5 + i * 2, 1, 1, 1, '#3a3050'); }
  px(ctx, O, 4, 3, 8, 1, hair);
  // little stud earring
  px(ctx, O, 3, 8, 1, 1, '#fff3a0');
}

/* idle animation helper used by every screen: returns {blink, bob} */
function idle(t, speed = 380) {
  return { blink: (t % 3300) < 130, bob: Math.sin(t / speed) };
}

window.Sprites = {
  spr, box, px, shade, drawCat, drawGirl, drawTheo, idle,
  FUR, CAT_EYES, HATS, ACCS, SKIN, HAIRC, HAIRC_N, EYEC, EYEC_N, HAIRS, TOPS, BOTS, SHOES, EXTRAS, PRESETS,
  HEART: ['.rr...rr.', 'rrrr.rrrr', 'rrrrrrrrr', 'rrrrrrrrr', '.rrrrrrr.', '..rrrrr..', '...rrr...', '....r....']
};
})();
