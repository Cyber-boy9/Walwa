/* ===== Cafe & Beach: a table, an umbrella, and talking (built-in dialogue with choices) ===== */
(() => {
'use strict';
const P = Sprites;
const cv = $('#cafeCv'), c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
const INKC = '#5b3f94';
const DRINKS = [
  { n: 'Iced latte', col: '#d9b48f', ice: 1 }, { n: 'Macchiato', col: '#8a5a3a' },
  { n: 'Strawberry milk', col: '#ff9ec7', ice: 1 }, { n: 'Mango juice', col: '#ffb830', ice: 1 },
  { n: 'Hot chocolate', col: '#5a3418' }, { n: 'Spris (layered juice)', col: '#ff7a59', ice: 1 }
];
if (S.scene == null) S.scene = 'cafe';
if (S.drink == null) S.drink = 0;
if (S.vibe == null) S.vibe = 0;
let noteShown = !!S.noteShown, session = 0;
let moodHer = 'idle', moodHim = 'idle', speaker = '', hearts = [];

/* ---------- scene ---------- */
const isNight = () => { const h = new Date().getHours(); return h >= 18 || h < 6; };
function sky(ctx, night) {
  const g = ctx.createLinearGradient(0, 0, 0, 150);
  if (night) { g.addColorStop(0, '#2a1d5a'); g.addColorStop(1, '#8a4fa8'); } else { g.addColorStop(0, '#8fd8ff'); g.addColorStop(1, '#ffe3a8'); }
  ctx.fillStyle = g; ctx.fillRect(0, 0, 360, 150);
  if (night) { for (let i = 0; i < 22; i++) { const on = ((performance.now() / 600 + i) | 0) % 3; R(ctx, (i * 53) % 360, (i * 29) % 90, on ? 2 : 3, on ? 2 : 3, '#fff6a8'); } ctx.fillStyle = '#fff6b0'; ctx.beginPath(); ctx.arc(300, 40, 16, 0, 7); ctx.fill(); ctx.fillStyle = '#8a4fa8'; ctx.beginPath(); ctx.arc(306, 36, 14, 0, 7); ctx.fill(); }
  else { ctx.fillStyle = '#fff6b0'; ctx.beginPath(); ctx.arc(300, 44, 20, 0, 7); ctx.fill(); }
}
function bg(t) {
  const night = isNight();
  if (S.scene === 'beach') {
    sky(c, night);
    [[20, 40, 40], [150, 24, 30], [230, 58, 36]].forEach(([ox, y, w], i) => { const x = Math.round(((ox + t / (50 + i * 9)) % 440) - 40); c.fillStyle = night ? 'rgba(255,255,255,.25)' : '#fff'; c.fillRect(x, y, w, 8); c.fillRect(x + 6, y - 6, w - 14, 7); });
    R(c, 0, 108, 360, 52, night ? '#3a3a8a' : '#5ec8e8');
    for (let i = 0; i < 18; i++) { const x = (i * 24 + t / 30) % 384 - 12; R(c, Math.round(x), 112 + (i % 3) * 14 + Math.sin(t / 400 + i) * 2, 14, 2, 'rgba(255,255,255,.7)'); }
    R(c, 0, 150, 360, 80, night ? '#b89868' : '#ffe0a0');
    for (let i = 0; i < 40; i++) R(c, (i * 37) % 360, 158 + (i * 17) % 66, 2, 2, night ? '#9a7a50' : '#f0c880');
    // shell + starfish
    P.spr(c, ['..y..', '.yyy.', 'yyyyy', '.yyy.', '.y.y.'], 30, 200, 3, { y: '#ff9ebb' });
    // palm
    R(c, 330, 90, 8, 110, '#a8714d'); for (let k = 0; k < 5; k++) { c.fillStyle = '#4fc98a'; c.save(); c.translate(334, 90); c.rotate(-1.2 + k * 0.6 + Math.sin(t / 700) * 0.04); c.fillRect(0, -4, 50, 8); c.restore(); }
  } else {
    // cafe interior + patio
    c.fillStyle = night ? '#4a3560' : '#ffd9ec'; c.fillRect(0, 0, 360, 150);
    c.fillStyle = 'rgba(255,255,255,.14)'; for (let y = 8; y < 150; y += 16) for (let x = (y / 16 % 2) * 8; x < 360; x += 16) c.fillRect(x, y, 3, 3);
    // storefront window with the street
    R(c, 20, 20, 120, 80, '#fff0e1'); R(c, 25, 25, 110, 70, night ? '#2a1d5a' : '#a8e0ff');
    if (night) for (let i = 0; i < 8; i++) R(c, 30 + i * 13, 30 + (i * 11) % 40, 2, 2, '#fff6a8');
    R(c, 78, 25, 3, 70, '#fff0e1');
    // sign
    R(c, 160, 22, 110, 34, INKC); R(c, 164, 26, 102, 26, '#fff6ea');
    c.fillStyle = INKC; c.font = '10px "Press Start 2P", monospace'; c.textAlign = 'center'; c.fillText('MOCHI CAFE', 215, 44);
    P.spr(c, P.HEART, 276, 30, 3, { r: '#ff7eb6' });
    // fairy lights
    for (let i = 0; i < 16; i++) { const x = 8 + i * 22, y = 8 + Math.sin(i) * 4; R(c, x, y, 2, 4, INKC); c.fillStyle = ['#ff7eb6', '#ffe36e', '#8fd3ff'][i % 3]; c.globalAlpha = 0.6 + 0.4 * Math.sin(t / 300 + i); c.fillRect(x - 1, y + 4, 4, 4); c.globalAlpha = 1; }
    // plants
    R(c, 296, 120, 30, 8, '#c9795a'); R(c, 300, 128, 22, 24, '#d98c6a'); R(c, 308, 96, 6, 26, '#6fcf97'); R(c, 298, 104, 6, 18, '#6fcf97'); R(c, 318, 102, 6, 20, '#6fcf97');
    R(c, 0, 150, 360, 80, '#ffdcb8'); for (let x = 0; x < 360; x += 36) R(c, x, 150, 2, 80, '#f7c8a0');
  }
}
function umbrella(t) {
  const cx = 180, top = 58, night = isNight();
  R(c, cx - 2, top + 20, 5, 100, '#8a7aa8');
  for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fff6ea' : '#ff7eb6'; c.beginPath(); c.moveTo(cx, top - 8); c.lineTo(cx - 92 + i * 23, top + 22); c.lineTo(cx - 92 + (i + 1) * 23, top + 22); c.closePath(); c.fill(); }
  c.strokeStyle = INKC; c.lineWidth = 3; c.beginPath(); c.moveTo(cx, top - 8); c.lineTo(cx - 92, top + 22); c.lineTo(cx + 92, top + 22); c.closePath(); c.stroke();
  for (let i = 0; i < 8; i++) R(c, cx - 92 + i * 23 + 6, top + 22, 8, 4, i % 2 ? '#ff7eb6' : '#fff6ea');
  if (night) { c.fillStyle = 'rgba(255,227,110,' + (0.18 + 0.05 * Math.sin(t / 250)) + ')'; c.beginPath(); c.moveTo(cx - 40, top + 26); c.lineTo(cx - 100, 190); c.lineTo(cx + 100, 190); c.lineTo(cx + 40, top + 26); c.fill(); }
}
function table(t) {
  const d = DRINKS[S.drink] || DRINKS[0];
  // chairs
  R(c, 62, 130, 8, 70, '#a8714d'); R(c, 290, 130, 8, 70, '#a8714d');
  // table top covers legs of characters
  R(c, 90, 168, 180, 8, '#c98f68'); R(c, 90, 176, 180, 3, '#a8714d'); R(c, 174, 179, 12, 38, '#8a5a3a'); R(c, 150, 215, 60, 6, '#8a5a3a');
  R(c, 92, 169, 176, 2, '#ffd9a8');
  // drinks
  [[120, d], [226, DRINKS[(S.drink + 2) % DRINKS.length]]].forEach(([x, dr], i) => {
    R(c, x, 150, 18, 18, INKC); R(c, x + 3, 153, 12, 15, dr.col); R(c, x + 3, 153, 12, 3, 'rgba(255,255,255,.5)');
    if (dr.ice) { R(c, x + 5, 158, 3, 3, 'rgba(255,255,255,.7)'); R(c, x + 10, 162, 3, 3, 'rgba(255,255,255,.7)'); }
    R(c, x + 12, 144, 2, 12, '#ff7eb6');
    if (!dr.ice) for (let k = 0; k < 2; k++) { const o = (t / 900 + k / 2 + i * .3) % 1; c.globalAlpha = 1 - o; R(c, x + 6 + k * 5 + Math.sin(o * 6) * 2, 144 - o * 20, 2, 5, '#fff'); c.globalAlpha = 1; }
  });
  // little vase
  R(c, 168, 152, 8, 16, '#8fd3ff'); R(c, 170, 142, 2, 10, '#6fcf97'); R(c, 166, 138, 6, 6, '#ff7eb6'); R(c, 172, 140, 5, 5, '#ffe36e');
}
function draw(t) {
  bg(t);
  const i = P.idle(t), s = 3, floor = 205;
  const hb = moodHer === 'happy' ? -Math.abs(Math.sin(t / 150)) * 5 : i.bob * 1.2;
  const tb = moodHim === 'happy' ? -Math.abs(Math.sin(t / 160)) * 5 : Math.sin(t / 520) * 1.2;
  P.drawGirl(c, S.avatar, 100, Math.round(floor - 30 * s + 6 + hb), s, { blink: i.blink, mood: moodHer });
  P.drawTheo(c, 212, Math.round(floor - 30 * s + 6 + tb), s, { blink: i.blink, mood: moodHim === 'happy' ? 'happy' : 'idle' });
  umbrella(t); table(t);
  P.drawCat(c, 174, Math.round(133 + i.bob), 2, { cfg: S.mochi, mood: moodHer === 'happy' || moodHim === 'happy' ? 'happy' : 'idle', blink: i.blink });
  if ((moodHer === 'happy' || moodHim === 'happy') && Math.random() < 0.12) hearts.push({ x: rand(120, 250), y: 110, v: rand(.4, .9), a: 1 });
  for (let k = hearts.length - 1; k >= 0; k--) { const h = hearts[k]; h.y -= h.v; h.a -= .01; h.x += Math.sin(h.y / 9) * .4; if (h.a <= 0) { hearts.splice(k, 1); continue; } c.globalAlpha = h.a; P.spr(c, P.HEART, Math.round(h.x), Math.round(h.y), 2, { r: '#ff7eb6' }); c.globalAlpha = 1; }
}
World.draw['s-cafe'] = draw;

/* ---------- dialogue engine ---------- */
let tapResolve = null, typing = null;
const box = $('#cafeSay'), textEl = $('#cafeText'), nextEl = $('#cafeNext'), whoEl = $('#cafeWho');
box.addEventListener('pointerdown', () => { if (typing) typing(); else if (tapResolve) { const r = tapResolve; tapResolve = null; r(); } });

function setWho(who) {
  speaker = who;
  const him = who === 'THEO', cat = who === 'MOCHI', n = S.name || 'You';
  whoEl.textContent = him ? CONFIG.hisName.toUpperCase() + ' 😎' : cat ? S.mochi.name.toUpperCase() + ' 🐱' : who === 'HER' ? n.toUpperCase() + ' 💬' : '☕';
  whoEl.classList.toggle('him', him || who === 'HER');
  moodHim = him ? 'happy' : 'idle'; moodHer = who === 'HER' ? 'happy' : 'idle';
}
function say(who, text, token) {
  return new Promise(res => {
    if (token !== session) return;
    setWho(who);
    const chars = Array.from(text.replace(/\{n\}/g, S.name).replace(/\{t\}/g, CONFIG.hisName).replace(/\{m\}/g, S.mochi.name));
    let pos = 0; nextEl.style.visibility = 'hidden'; textEl.textContent = '';
    const finish = () => { clearInterval(iv); typing = null; textEl.textContent = chars.join(''); nextEl.style.visibility = 'visible'; tapResolve = () => { if (token === session) res(); }; };
    const iv = setInterval(() => { pos++; textEl.textContent = chars.slice(0, pos).join(''); if (pos % 3 === 0) Sfx.type(); if (pos >= chars.length) finish(); }, 22);
    typing = finish;
  });
}
function ask(options, token) {
  return new Promise(res => {
    const wrap = $('#choices'); wrap.innerHTML = '';
    options.forEach((o, idx) => {
      const b = document.createElement('button'); b.className = 'btn ghost'; b.textContent = o.replace(/\{n\}/g, S.name).replace(/\{t\}/g, CONFIG.hisName);
      b.onclick = () => { if (token !== session) return; Sfx.pop(); wrap.innerHTML = ''; res(idx); };
      wrap.appendChild(b);
    });
  });
}
function vibe(n = 1) {
  S.vibe += n; save(); $('#vibePill').textContent = '💗 ' + S.vibe; Sfx.coin();
  for (let i = 0; i < 4; i++) hearts.push({ x: rand(130, 240), y: 130, v: rand(.5, 1), a: 1 });
}
/* her reply: she picks what to say, and it is spoken back as her line */
async function reply(token, options, vibes = []) {
  const k = await ask(options, token);
  await say('HER', options[k].replace(/^\S+\s/, m => m), token);
  if (vibes[k]) vibe(vibes[k]);
  return k;
}

/* ---------- topics ---------- */
async function orderDrinks(tk) {
  await say('THEO', "Welcome to {m}'s Cafe. I'm the waiter, the barista, and the owner. Very cool. What are you drinking, {n}?", tk);
  const k = await ask(DRINKS.map(d => '☕ ' + d.n), tk);
  S.drink = k; save();
  await say('THEO', k === 5 ? "Spris. Layered. Respectable. Ethiopia approves." : pick(['Good taste. I\'ll have the same. No, wait, copying is lame. Fine, I\'ll copy.', 'Coming right up. That\'ll be one smile.', 'Excellent choice. You\'re clearly a person of culture.']), tk);
}
async function topicSpicy(tk) {
  await say('THEO', "Okay, game time. 🌶️ Spicy Questions. You can skip any of them, no penalty. Deal?", tk);
  const d = await reply(tk, ['Deal 🤝', 'Depends how spicy 👀'], [1, 1]);
  await say('THEO', d ? "Medium. Maybe a little hot sauce. Not the ghost pepper." : "Perfect. We start mild.", tk);
  const qs = [
    { q: 'First question. Be honest: what was your first impression of me?', o: ['Annoying but funny 😂', 'Kinda cute ngl', 'Pass 🙈'], r: ['Annoying but funny. That is literally my brand.', "Hold on, say that again. Slowly. I'm writing it down.", "Pass accepted. Mysterious. I respect it."], v: [1, 2, 0] },
    { q: 'Who texts first, {n}?', o: ['Me, always', 'Him, obviously', 'Whoever misses the other 😌'], r: ['A boss. Noted.', "I'm okay with that. I'm very available. Too available.", "Dangerous answer. I'll think about it for three days."], v: [1, 1, 2] },
    { q: 'Rate my drip, 1 to 10. Brutal.', o: ['10/10, no notes', '7. Fix the shoes', 'Drip? Where?? 💀'], r: ["Screenshotting this for later.", "The shoes are fine. The shoes are LEGENDARY. But okay.", "Ouch. Fine. I will be in my room."], v: [2, 1, 1] },
    { q: 'Last one: would you let me pick the song for our next road trip?', o: ['Only if the vibe is right 🎧', 'No. I pick.', 'Maybe. Impress me.'], r: ["The vibe is always right. I'm the vibe.", "Fair. Co-pilot privileges for me then.", "Challenge accepted. I'm cooking."], v: [2, 1, 1] }
  ];
  for (const q of qs) {
    await say('THEO', q.q, tk);
    const k = await reply(tk, q.o, q.v);
    await say('THEO', q.r[k], tk);
  }
  await say('MOCHI', 'mrrp. (translation: they\'re both blushing.)', tk);
}
async function topicSong(tk) {
  const song = S.song >= 0 ? CONFIG.songs[S.song] : null;
  if (!song) { await say('THEO', "You haven't picked a song at the jukebox yet. Go choose one, then come back and tell me what it says about you. 🎧", tk); return; }
  await say('THEO', "I see you picked '" + song.title + "'. Interesting. Very interesting. What does that song say about you?", tk);
  const k = await reply(tk, ['It matches my mood', 'It reminds me of someone 👀', "It's just good, don't read into it"], [1, 2, 1]);
  await say('THEO', ["Mood: validated.", "Someone? I'm going to pretend that's me. Don't correct me.", "Good music doesn't need analysis. But I'm analyzing it anyway."][k], tk);
}
async function topicTrip(tk) {
  await say('THEO', "Dream trip. Money and time are not a problem. Where do we go?", tk);
  const k = await reply(tk, ['🗼 Tokyo', '🏝️ Zanzibar', '🌆 Paris', '🏜️ Dubai'], [1, 1, 1, 1]);
  const lines = ["Tokyo. Neon, ramen, vending machines. I'd get lost with you and not mind.", "Zanzibar. Beach, spice, no signal. I'd bring one speaker and one cat.", "Paris. Cliché? Yes. Do I care? Also no.", "Dubai. Okay, fancy. I'll bring a clean outfit and a bigger ego."];
  await say('THEO', lines[k], tk);
  await say('THEO', "Okay, written down. I'll build that level, so keep an eye on the Road Trip door. 🚗", tk);
}
async function topicDrawing(tk) {
  await say('THEO', "You complimented my drawing, and I said I'd 'cash you up'. For a COMPLIMENT.", tk);
  const k = await reply(tk, ['That was generous 😭', 'Still waiting on my money 💸', 'The drawing really was good'], [1, 1, 2]);
  await say('THEO', ["Generous and broke. The best combination.", "Okay okay. 5 birr, and a whole website. That's a fair deal.", "That means more than the money would have, honestly. Thank you."][k], tk);
}
async function topicAbroad(tk) {
  await say('THEO', "Okay, serious for a minute, {n}. I'm leaving this year. It's the plan, and I'm excited. But I'd be lying if I said it didn't feel weird.", tk);
  const k = await reply(tk, ["That's amazing, I'm proud of you 🥹", "Don't forget us 😭", "We'll keep in touch, right?"], [2, 2, 2]);
  await say('THEO', ["That one landed. Thank you. I'll take it with me.", "Forget? I built a whole world with your name in it. Not happening.", "Always. That's why I made this place. It stays, wherever I go."][k], tk);
  await say('MOCHI', 'mrrp. (translation: i will guard the jukebox.)', tk);
}

async function secret(tk) {
  if (noteShown || S.vibe < 8) return;
  noteShown = true; S.noteShown = true; save();
  burst(120); Sfx.win();
  await say('MOCHI', '🎉 SECRET UNLOCKED: a note from ' + CONFIG.hisName, tk);
  await say('THEO', CONFIG.secretNote, tk);
}

async function run() {
  const tk = ++session;
  $('#choices').innerHTML = ''; $('#vibePill').textContent = '💗 ' + S.vibe;
  $('#sceneBtn').textContent = S.scene === 'beach' ? '☕ CAFE' : '🏖️ BEACH';
  if (!S.visitedCafe) { await orderDrinks(tk); S.visitedCafe = true; save(); }
  else await say('THEO', pick(["Back again. Your table's still warm, {n}.", "Hey, {n}. Same drink? I already started it.", "Perfect timing. I was getting bored of talking to the cat."]), tk);
  for (;;) {
    if (tk !== session) return;
    const k = await ask(['🌶️ Spicy questions', '🎧 Our song', '✈️ Dream trip', '🎨 The drawing', '🌍 The leaving thing', '☕ New drink', '↩ Back to the room'], tk);
    if (k === 0) await topicSpicy(tk);
    else if (k === 1) await topicSong(tk);
    else if (k === 2) await topicTrip(tk);
    else if (k === 3) await topicDrawing(tk);
    else if (k === 4) await topicAbroad(tk);
    else if (k === 5) await orderDrinks(tk);
    else { await say('THEO', 'Come back whenever. The table is yours.', tk); show('s-hub'); Hub.say('MOCHI', 'that was cute. just saying. 🐱'); return; }
    await secret(tk);
    if (tk === session) await say('THEO', pick(['Okay, what next?', 'Another one?', "I've got more. Pick."]), tk);
  }
}
$('#sceneBtn').onclick = () => { S.scene = S.scene === 'beach' ? 'cafe' : 'beach'; save(); $('#sceneBtn').textContent = S.scene === 'beach' ? '☕ CAFE' : '🏖️ BEACH'; Sfx.pop(); };
World.onShow['s-cafe'] = () => { run(); };
// leaving the screen ends the current conversation
const _show = window.show;
document.addEventListener('click', e => { if (e.target.closest('#homeBtn')) session++; });
})();
