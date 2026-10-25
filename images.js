'use strict';
/* Generates a unique illustrated SVG for every package so no image is ever missing.
   Drop a real photo at public/images/photos/<imgKey>.jpg to override it automatically. */
const fs = require('fs');
const path = require('path');

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

const SCENES = [
  ['jungle', /safari|bandhavgarh|sunderban|kenya|tanzania|zimbabwe|tadoba|pench|kanha|navegaon|umred|camp|groves|corbett/],
  ['temple', /shivthirth|ramdham|dham|yatra|amritsar|varanasi/],
  ['train', /railway|museum/],
  ['park', /fun-|fun |planet|highland|traffic|flamingo|farms|amusement|dwarka|agro/],
  ['beach', /goa|andaman|maldives|mauritius|seychelles|indonesia|thailand|fiji|philippines|phillippines|kerala|srilanka|sri-lanka|brazil|vietnam|cambodia|bali/],
  ['desert', /rajasthan|rann|dubai|qatar|oman|jordan|egypt|israel|uzbekistan|gujarat|morocco/],
  ['mountain', /himachal|kashmir|leh|uttarakhand|auli|sikkim|nepal|bhutan|austria|europe|ooty|kodai|karnataka-tamilnadu|north-east|bengal|iceland|norway|northern|zealand|argentina|america|canada|switzerland|denmark|scotland|china|japan|korea|taiwan/],
  ['city', /.*/]
];

function sceneOf(key) { for (const s of SCENES) if (s[1].test(key)) return s[0]; return 'city'; }

function palette(h, scene) {
  const base = { beach: 195, desert: 28, jungle: 128, mountain: 215, temple: 30, train: 8, park: 285, city: 235 }[scene];
  const hue = (base + (h % 40) - 20 + 360) % 360;
  return {
    sky1: `hsl(${hue},75%,${scene === 'city' ? 28 : 62}%)`, sky2: `hsl(${(hue + 25) % 360},85%,${scene === 'city' ? 55 : 82}%)`,
    far: `hsl(${hue},40%,52%)`, mid: `hsl(${(hue + 10) % 360},45%,38%)`, near: `hsl(${(hue + 20) % 360},50%,25%)`,
    sun: `hsl(${(hue + 150) % 360},95%,85%)`
  };
}

function rng(seed) { let a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function ridge(h, y, amp, fill, seed) {
  const r = rng(h + seed * 7919);
  let d = `M0 ${y}`, x = 0;
  while (x < 800) {
    const w = 70 + Math.floor(r() * 90), px = x + w / 2, py = Math.round(y - amp * (0.35 + r() * 0.65));
    d += ` Q${px} ${py} ${x + w} ${y - Math.floor(r() * 12)}`; x += w;
  }
  return `<path d="${d} L800 600 L0 600Z" fill="${fill}"/>`;
}

function scene(kind, p, h) {
  const o = [];
  const sx = 120 + (h % 560), sy = 90 + (h % 70);
  o.push(`<circle cx="${sx}" cy="${sy}" r="46" fill="${p.sun}" opacity=".9"/>`);
  if (kind === 'mountain') {
    o.push(ridge(h, 420, 220, p.far, 3), ridge(h, 480, 170, p.mid, 7));
    o.push(`<path d="M0 560 Q200 510 400 550 T800 520 V600H0Z" fill="${p.near}"/>`);
    for (let i = 0; i < 9; i++) { const x = 40 + i * 90 + (h % 30); o.push(`<path d="M${x} 560 l14 -46 l14 46Z M${x + 2} 536 l12 -38 l12 38Z" fill="#0b3d2e" opacity=".85"/>`); }
  } else if (kind === 'beach') {
    o.push(`<rect y="380" width="800" height="220" fill="${p.mid}"/>`);
    for (let i = 0; i < 6; i++) o.push(`<path d="M0 ${410 + i * 22} q50 -14 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0" stroke="#fff" stroke-opacity=".35" fill="none" stroke-width="3"/>`);
    o.push(`<path d="M0 520 Q300 470 800 540 V600H0Z" fill="#f2d49b"/>`);
    o.push(`<path d="M600 540 Q610 430 585 340" stroke="#5b3a1e" stroke-width="12" fill="none"/>`);
    [-70, -35, 0, 35, 70].forEach(a => o.push(`<path d="M585 340 q${a} -60 ${a * 1.7} -10" stroke="#1f7a3a" stroke-width="14" fill="none" stroke-linecap="round"/>`));
  } else if (kind === 'desert') {
    o.push(`<path d="M0 430 Q200 340 400 440 T800 400 V600H0Z" fill="#e2a95b"/>`, `<path d="M0 500 Q250 410 520 510 T800 480 V600H0Z" fill="#c98a3f"/>`);
    o.push(`<path d="M120 470 l70 -110 l70 110Z M190 470 l90 -140 l90 140Z" fill="#b87333" opacity=".0"/>`);
    o.push(`<path d="M560 520 l60 -100 l60 100Z" fill="#a8672a"/><path d="M620 420 l60 100 h-60Z" fill="#8a5220"/>`);
  } else if (kind === 'jungle') {
    o.push(ridge(h, 440, 90, p.far, 5));
    for (let i = 0; i < 12; i++) { const x = 30 + i * 65 + (h % 20), th = 150 + ((h >>> i) % 90); o.push(`<rect x="${x}" y="${540 - th}" width="12" height="${th}" fill="#3b2a1a"/><circle cx="${x + 6}" cy="${540 - th}" r="${42 + (i % 3) * 10}" fill="hsl(${120 + (i * 7) % 30},55%,${24 + (i % 3) * 6}%)"/>`); }
    o.push(`<rect y="540" width="800" height="60" fill="${p.near}"/>`);
  } else if (kind === 'temple') {
    o.push(`<rect y="500" width="800" height="100" fill="${p.near}"/>`, `<path d="M300 500 V380 h200 V500Z" fill="#f4d9a7"/>`);
    o.push(`<path d="M320 380 l80 -120 l80 120Z" fill="#e8590c"/><rect x="396" y="226" width="8" height="34" fill="#c24a08"/><circle cx="400" cy="222" r="10" fill="#ffd166"/>`);
    o.push(`<path d="M370 500 v-70 a30 30 0 0 1 60 0 v70Z" fill="#7a3b12"/>`);
    [180, 620].forEach(x => o.push(`<rect x="${x}" y="430" width="14" height="70" fill="#f4d9a7"/><path d="M${x - 8} 430 l15 -34 l15 34Z" fill="#e8590c"/>`));
  } else if (kind === 'train') {
    o.push(`<rect y="500" width="800" height="100" fill="${p.near}"/><rect y="520" width="800" height="8" fill="#888"/>`);
    o.push(`<rect x="150" y="380" width="330" height="120" rx="14" fill="#c0392b"/><rect x="480" y="340" width="130" height="160" rx="10" fill="#222"/><rect x="520" y="300" width="30" height="44" fill="#333"/>`);
    [210, 300, 400, 540].forEach(x => o.push(`<circle cx="${x}" cy="505" r="26" fill="#111"/><circle cx="${x}" cy="505" r="9" fill="#bbb"/>`));
    o.push(`<rect x="180" y="405" width="80" height="40" fill="#ffe9a8"/><rect x="290" y="405" width="80" height="40" fill="#ffe9a8"/>`);
  } else if (kind === 'park') {
    o.push(`<rect y="520" width="800" height="80" fill="${p.near}"/>`);
    o.push(`<circle cx="400" cy="330" r="150" fill="none" stroke="#fff" stroke-width="8"/><path d="M400 180 V480 M250 330 H550 M294 224 L506 436 M506 224 L294 436" stroke="#fff" stroke-width="5"/>`);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; o.push(`<rect x="${400 + 150 * Math.cos(a) - 16}" y="${330 + 150 * Math.sin(a) - 12}" width="32" height="24" rx="6" fill="hsl(${i * 45},85%,60%)"/>`); }
    o.push(`<path d="M360 520 l40 -190 l40 190Z" fill="#ddd"/>`);
  } else {
    const cols = [[60, 220], [150, 300], [240, 180], [330, 340], [430, 250], [520, 310], [610, 200], [700, 270]];
    cols.forEach((c, i) => { const hh = c[1] + ((h >>> i) % 60); o.push(`<rect x="${c[0]}" y="${540 - hh}" width="70" height="${hh}" fill="${i % 2 ? p.mid : p.near}"/>`); for (let r = 0; r < hh / 28; r++) for (let q = 0; q < 3; q++) if (((h >>> ((r + q + i) % 31)) & 3) !== 0) o.push(`<rect x="${c[0] + 9 + q * 20}" y="${552 - hh + r * 28}" width="10" height="14" fill="#ffe9a8" opacity=".85"/>`); });
    o.push(`<rect y="540" width="800" height="60" fill="#10151f"/>`);
  }
  return o.join('');
}

function svg(key, title) {
  const h = hash(key), kind = sceneOf(key), p = palette(h, kind);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(title || key)}">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky1}"/><stop offset="1" stop-color="${p.sky2}"/></linearGradient></defs>
<rect width="800" height="600" fill="url(#g)"/>${scene(kind, p, h)}</svg>`;
}

const PUB = path.join(__dirname, 'public');
/* Photos uploaded from the admin page live here (set DATA_DIR / UPLOAD_DIR to a persistent disk on your host). */
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.env.DATA_DIR || path.join(__dirname, 'data'), 'uploads');
const EXTS = ['jpg', 'jpeg', 'png', 'webp'];
const STORE = require('./storage');
function uploadedPhoto(key) {
  const remote = STORE.get(key); if (remote) return remote;
  for (const e of EXTS) {
    const f = path.join(UPLOAD_DIR, 'photos', key + '.' + e);
    if (fs.existsSync(f)) return '/uploads/photos/' + key + '.' + e + '?v=' + Math.floor(fs.statSync(f).mtimeMs);
  }
  return null;
}
/* Finds "<name>.<ext>" in a folder ignoring upper/lower case, so LOGO.png works on Linux hosts as well as Windows. */
function findCI(dir, names, exts) {
  let files; try { files = fs.readdirSync(dir); } catch (e) { return null; }
  for (const n of names) for (const e of exts) {
    const hit = files.find(f => f === n + '.' + e) || files.find(f => f.toLowerCase() === n + '.' + e);   // exact name wins
    if (hit) return path.join(dir, hit);
  }
  return null;
}
/* Order: 1) what the admin uploaded  2) a logo/hero file you committed in public/images (any capitalisation)  3) built-in illustration */
function logoFile() {
  return findCI(UPLOAD_DIR, ['logo'], EXTS) || findCI(path.join(PUB, 'images'), ['logo'], EXTS.concat('svg'));
}
function heroFile() {
  return findCI(UPLOAD_DIR, ['hero'], EXTS) || findCI(path.join(PUB, 'images'), ['hero'], EXTS);
}
function hero() {   // default home page background: a glowing twilight over snow mountains and sea, with drifting clouds, balloons and a plane
  const r = rng(20261026);
  const stars = Array.from({ length: 70 }, (_, i) => {
    const x = Math.round(r() * 1600), y = Math.round(r() * 230), s = (0.8 + r() * 1.6).toFixed(1), d = (2 + r() * 4).toFixed(1), b = (r() * 5).toFixed(1);
    return `<circle class="tw" cx="${x}" cy="${y}" r="${s}" fill="#fff" style="animation-duration:${d}s;animation-delay:-${b}s"/>`;
  }).join('');
  const waves = Array.from({ length: 7 }, (_, i) => `<path class="wv" d="M-100 ${470 + i * 20} q50 -12 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0" stroke="#fff" stroke-opacity="${(0.32 - i * 0.03).toFixed(2)}" stroke-width="${2 + i * 0.4}" fill="none" style="animation-duration:${7 + i * 1.5}s;animation-direction:${i % 2 ? 'reverse' : 'normal'}"/>`).join('');
  const balloon = (x, y, s, c1, c2, dur, dl) => `<g class="fl" style="animation-duration:${dur}s;animation-delay:-${dl}s"><g transform="translate(${x} ${y}) scale(${s})">
<path d="M0 -60 C-46 -60 -52 -8 -18 34 L18 34 C52 -8 46 -60 0 -60Z" fill="${c1}"/><path d="M0 -60 C-18 -50 -22 -6 -8 34 L8 34 C22 -6 18 -50 0 -60Z" fill="${c2}"/>
<path d="M-18 34 L-9 56 M18 34 L9 56 M-6 34 L-5 56 M6 34 L5 56" stroke="#3a2a22" stroke-width="1.4"/><rect x="-10" y="56" width="20" height="13" rx="2.5" fill="#6b4226"/></g></g>`;
  const cloud = (x, y, s, o, dur, dl) => `<g class="cl" style="animation-duration:${dur}s;animation-delay:-${dl}s" opacity="${o}"><g transform="translate(${x} ${y}) scale(${s})" fill="#fff">
<ellipse cx="0" cy="0" rx="90" ry="20"/><ellipse cx="-40" cy="-14" rx="42" ry="22"/><ellipse cx="14" cy="-24" rx="50" ry="28"/><ellipse cx="58" cy="-8" rx="34" ry="18"/></g></g>`;
  const bird = (x, y, s, dl) => `<path class="bd" d="M0 0 q8 -9 16 0 q8 -9 16 0" transform="translate(${x} ${y}) scale(${s})" stroke="#1d2f4f" stroke-width="2.2" fill="none" stroke-linecap="round" style="animation-delay:-${dl}s"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Travel scene">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1a3f"/><stop offset=".30" stop-color="#2a2f7a"/><stop offset=".52" stop-color="#b24a8c"/><stop offset=".72" stop-color="#ff7a59"/><stop offset=".88" stop-color="#ffc46b"/><stop offset="1" stop-color="#ffe7a8"/></linearGradient>
<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9d6e"/><stop offset=".18" stop-color="#c8577f"/><stop offset=".55" stop-color="#1b5d8a"/><stop offset="1" stop-color="#082b4d"/></linearGradient>
<radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbe6"/><stop offset=".25" stop-color="#ffe9a6" stop-opacity=".95"/><stop offset=".6" stop-color="#ffb45f" stop-opacity=".35"/><stop offset="1" stop-color="#ff8a4d" stop-opacity="0"/></radialGradient>
<linearGradient id="m1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d5aa6"/><stop offset="1" stop-color="#d98aa0"/></linearGradient>
<linearGradient id="m2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b3a86"/><stop offset="1" stop-color="#a45a8f"/></linearGradient>
<linearGradient id="m3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2d63"/><stop offset="1" stop-color="#43417f"/></linearGradient>
<linearGradient id="refl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a6" stop-opacity=".9"/><stop offset="1" stop-color="#ffb45f" stop-opacity="0"/></linearGradient>
<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc46b" stop-opacity="0"/><stop offset="1" stop-color="#ffd9a0" stop-opacity=".55"/></linearGradient>
<style>
.tw{animation:tw 3s ease-in-out infinite}@keyframes tw{0%,100%{opacity:.15}50%{opacity:1}}
.cl{animation:cl 90s linear infinite}@keyframes cl{from{transform:translateX(-260px)}to{transform:translateX(1900px)}}
.fl{animation:fl 9s ease-in-out infinite}@keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
.wv{animation:wv 8s linear infinite}@keyframes wv{from{transform:translateX(0)}to{transform:translateX(-200px)}}
.pl{animation:pl 38s linear infinite}@keyframes pl{from{transform:translate(-200px,60px)}to{transform:translate(1800px,-40px)}}
.bd{animation:bd 1.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}@keyframes bd{0%,100%{transform:translate(0,0) scaleY(1)}50%{transform:translate(0,-3px) scaleY(.6)}}
.sh{animation:sh 5s ease-in-out infinite}@keyframes sh{0%,100%{opacity:.55}50%{opacity:.95}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
</defs>
<rect width="1600" height="600" fill="url(#sky)"/>
${stars}
<ellipse cx="800" cy="300" rx="900" ry="120" fill="#7a4fd0" opacity=".16"/><ellipse cx="400" cy="210" rx="520" ry="46" fill="#3fd0c9" opacity=".10"/>
<circle cx="1160" cy="440" r="330" fill="url(#sun)"/><circle cx="1160" cy="440" r="64" fill="#fffbe6"/>
${cloud(0, 150, 1.1, 0.16, 110, 20)}${cloud(0, 232, 0.8, 0.22, 85, 55)}${cloud(0, 105, 0.6, 0.12, 140, 90)}${cloud(0, 300, 1.3, 0.26, 100, 35)}
<path d="M0 430 L90 360 L170 400 L290 300 L390 380 L470 340 L600 420 L720 372 L840 430 L900 470 H0Z" fill="url(#m1)" opacity=".9"/>
<path d="M760 470 L880 392 L960 430 L1090 330 L1190 410 L1290 360 L1420 420 L1500 380 L1600 430 V470Z" fill="url(#m1)" opacity=".85"/>
<path d="M0 470 L120 392 L210 440 L340 330 L410 390 L520 350 L650 450 L720 470Z" fill="url(#m2)"/>
<path d="M340 330 L318 360 L336 352 L352 368 L366 350 L388 366Z" fill="#fff" opacity=".7"/>
<path d="M980 470 L1110 395 L1210 445 L1350 350 L1440 420 L1530 392 L1600 440 V470Z" fill="url(#m2)"/>
<path d="M1350 350 L1326 384 L1344 376 L1360 392 L1376 372 L1396 388Z" fill="#fff" opacity=".7"/>
<path d="M0 470 L140 430 L260 462 L380 440 L470 470Z" fill="url(#m3)"/><path d="M1180 470 L1320 432 L1440 460 L1560 436 L1600 452 V470Z" fill="url(#m3)"/>
<rect y="380" width="1600" height="95" fill="url(#haze)"/>
<rect y="468" width="1600" height="132" fill="url(#sea)"/>
<path class="sh" d="M1160 470 h0" stroke="none"/>
<g class="sh"><path d="M1120 472 h80 M1085 486 h150 M1050 502 h220 M1010 520 h300 M975 542 h370 M940 566 h440" stroke="#fff3c9" stroke-width="5" stroke-linecap="round" stroke-opacity=".7"/></g>
${waves}
<g class="pl"><g transform="translate(0 150) rotate(-8)"><path d="M-170 6 H-6" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-dasharray="2 11" stroke-linecap="round"/>
<g fill="#fff"><path d="M0 0 L66 -9 L102 0 L66 9Z"/><path d="M34 -2 L58 -38 L69 -38 L58 -2Z"/><path d="M34 2 L58 38 L69 38 L58 2Z"/><path d="M6 0 L0 -15 L11 -15 L19 0Z"/></g></g></g>
${balloon(250, 330, 0.8, '#ff5d73', '#ffd166', 9, 2)}${balloon(1430, 250, 0.62, '#4cc9f0', '#f72585', 11, 6)}${balloon(110, 215, 0.46, '#ffbe0b', '#fb5607', 10, 4)}
${bird(560, 190, 1.1, 0)}${bird(600, 215, 0.8, 0.5)}${bird(1010, 150, 0.9, 1)}${bird(1050, 168, 0.7, 0.2)}
</svg>`;
}
/* Photos you committed to GitHub in public/images (e.g. "Kashmir.jpeg", "Pench Jungle Safari.jpeg") are part of the code, so they
   survive every restart and redeploy. They are matched to a package by name, ignoring capitals, spaces and punctuation. */
const normName = s => String(s).toLowerCase().replace(/&amp;/g, 'and').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '');
const IMG_RE = /\.(jpe?g|png|webp)$/i;
const RESERVED = /^(logo|hero|bg|favicon.*|apple-touch-icon)$/i;
let committedIdx = null;
function committed() {
  if (committedIdx) return committedIdx;
  committedIdx = new Map();
  let files = [];
  try { files = fs.readdirSync(path.join(PUB, 'images')); } catch (e) { /* no folder */ }
  files.filter(f => IMG_RE.test(f) && !RESERVED.test(f.replace(IMG_RE, ''))).forEach(f => {
    const k = normName(f.replace(IMG_RE, '').replace(/#U([0-9a-f]{4})/gi, (m, h) => String.fromCharCode(parseInt(h, 16))));
    if (k && !committedIdx.has(k)) committedIdx.set(k, f);
  });
  return committedIdx;
}
function committedPhoto(item) {
  const f = committed().get(normName(item.name)) || committed().get(normName(item.imgKey));
  return f ? '/images/' + encodeURIComponent(f) : null;
}
function sourceOf(item) { return uploadedPhoto(item.imgKey) ? 'upload' : photoFor(item) ? 'file' : 'illustration'; }
function photoFor(item) {
  const up = uploadedPhoto(item.imgKey);
  if (up) return up;
  const cp = committedPhoto(item);
  if (cp) return cp;
  const c = [];
  if (item.photo) c.push('/images/one-day-tour/' + item.photo);
  ['jpg', 'jpeg', 'png', 'webp'].forEach(e => c.push('/images/photos/' + item.imgKey + '.' + e));
  for (const u of c) if (fs.existsSync(path.join(PUB, u))) return u;
  return null;
}
function imgFor(item) { return photoFor(item) || '/img/' + item.imgKey + '.svg'; }

function logo() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80" role="img" aria-label="Uravi Holidays"><circle cx="38" cy="42" r="26" fill="#12807d"/><path d="M16 36 q22 -8 44 0 M14 44 q24 -4 48 0 M20 54 q18 -6 36 0" stroke="#c8922b" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M12 56 Q40 70 66 30" stroke="#1d1d1b" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M60 14 l14 4 -10 9 -3 9 -4 -8 -7 -2z" fill="#1d1d1b"/><text x="84" y="44" font-family="Poppins,Verdana,sans-serif" font-size="32" font-weight="700" fill="#1d1d1b">UR<tspan fill="#c8922b">A</tspan>VI</text><text x="85" y="66" font-family="Poppins,Verdana,sans-serif" font-size="16" font-weight="600" fill="#12807d" letter-spacing="3">HOLIDAYS</text></svg>`;
}
function favicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#12807d"/><path d="M14 34 q18 -8 36 0 M14 42 q18 -6 36 0" stroke="#c8922b" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M40 12 l12 4 -9 8 -3 8 -3 -7 -6 -2z" fill="#fff"/></svg>`;
}

module.exports = { STORE, svg, imgFor, logo, favicon, hero, heroFile, UPLOAD_DIR, EXTS, uploadedPhoto, logoFile, sourceOf };
