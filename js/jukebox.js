/* ===== jukebox: styled dropdown, play/pause, next/prev, volume, pixel equalizer ===== */
(() => {
'use strict';
const songs = CONFIG.songs;
const audio = new Audio();
audio.preload = 'auto';
audio.volume = S.volume;
let playing = false, bars = Array.from({ length: 24 }, () => 0);

function label(i) { return i < 0 ? 'pick a song…' : songs[i].emoji + '  ' + songs[i].title; }
function refresh() {
  $('#selLabel').textContent = label(S.song);
  $('#playBtn').textContent = playing ? '⏸' : '▶';
  document.querySelectorAll('#selList li').forEach((li, i) => li.classList.toggle('on', i === S.song));
  $('#songHint').textContent = S.song < 0 ? 'tap the box to choose 🎧' : (playing ? 'now playing: ' + songs[S.song].title + ' · ' + songs[S.song].artist : 'paused');
}
async function play(i) {
  if (i < 0 || i >= songs.length) return;
  if (i !== S.song || !audio.src) { S.song = i; audio.src = songs[i].file; save(); }
  try { await audio.play(); playing = true; }
  catch (e) { playing = false; $('#songHint').textContent = "can't play that one yet. is " + songs[i].file + ' in the songs folder?'; }
  refresh();
}
function pause() { audio.pause(); playing = false; refresh(); }
function step(d) { play(((S.song < 0 ? 0 : S.song) + d + songs.length) % songs.length); Sfx.tick(); }

audio.addEventListener('ended', () => step(1));
audio.addEventListener('error', () => { if (audio.src) { playing = false; $('#songHint').textContent = "hmm, couldn't load " + songs[S.song].file; refresh(); } });

// build the dropdown
const list = $('#selList');
songs.forEach((s, i) => {
  const li = document.createElement('li');
  li.innerHTML = '<span>' + s.emoji + '</span><div>' + s.title + '<small>' + s.artist + '</small></div>';
  li.addEventListener('click', () => { list.classList.add('hidden'); Sfx.pop(); play(i); });
  list.appendChild(li);
});
$('#selBtn').addEventListener('click', e => { e.stopPropagation(); list.classList.toggle('hidden'); Sfx.tick(); });
document.addEventListener('click', () => list.classList.add('hidden'));
$('#playBtn').addEventListener('click', () => { Sfx.pop(); if (playing) pause(); else play(S.song < 0 ? 0 : S.song); });
$('#nextBtn').addEventListener('click', () => step(1));
$('#prevBtn').addEventListener('click', () => step(-1));
$('#vol').value = Math.round(S.volume * 100);
$('#vol').addEventListener('input', e => { S.volume = e.target.value / 100; audio.volume = S.volume; save(); });

// mute + tab-hidden handling
$('#mute').addEventListener('click', () => {
  A.muted = !A.muted; audio.muted = A.muted;
  $('#mute').textContent = A.muted ? '🔇' : '🔊';
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (playing) audio.pause(); }
  else if (playing) audio.play().catch(() => {});
});

// pixel equalizer
const cv = $('#jukeCv'), c = cv.getContext('2d');
World.draw['s-music'] = t => {
  c.clearRect(0, 0, cv.width, cv.height);
  const cols = ['#ff7eb6', '#ffb88c', '#ffe36e', '#8fe3c0', '#8fd3ff', '#b49aff'];
  bars.forEach((v, i) => {
    const target = playing ? 0.2 + 0.8 * Math.abs(Math.sin(t / (140 + i * 17) + i)) * (0.6 + 0.4 * Math.random()) : 0.06;
    bars[i] += (target - v) * 0.3;
    const h = Math.max(4, Math.round(bars[i] * 80 / 4) * 4);
    c.fillStyle = cols[i % cols.length];
    c.fillRect(i * 13 + 4, 86 - h, 10, h);
    c.fillStyle = INKC; c.fillRect(i * 13 + 4, 86 - h, 10, 3);
  });
  c.fillStyle = INKC; c.fillRect(0, 86, 320, 3);
};
const INKC = '#5b3f94';
World.onShow['s-music'] = refresh;

window.Juke = {
  play, pause, step, refresh,
  isPlaying: () => playing,
  // called after the first tap on START (browsers need a gesture before audio)
  resume() { if (S.song >= 0) play(S.song); }
};
})();
