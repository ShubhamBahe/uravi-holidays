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
function uploadedPhoto(key) {
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
    const hit = files.find(f => f.toLowerCase() === n + '.' + e);
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
function hero() {   // default home page background: a sunset over sea and mountains with a plane
  const waves = [0, 1, 2, 3, 4, 5].map(i => `<path d="M0 ${452 + i * 26} q50 -14 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0" stroke="#fff" stroke-opacity="${(0.22 - i * 0.025).toFixed(3)}" fill="none" stroke-width="3"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Travel scene">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b3b3a"/><stop offset=".45" stop-color="#12807d"/><stop offset=".78" stop-color="#f0b45c"/><stop offset="1" stop-color="#ffd99a"/></linearGradient>
<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a9b96"/><stop offset="1" stop-color="#0a4a48"/></linearGradient>
<radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff3d1" stop-opacity=".95"/><stop offset="1" stop-color="#fff3d1" stop-opacity="0"/></radialGradient>
</defs>
<rect width="1600" height="600" fill="url(#sky)"/>
<circle cx="1180" cy="420" r="230" fill="url(#glow)"/><circle cx="1180" cy="420" r="80" fill="#fff0c4"/>
<ellipse cx="260" cy="130" rx="150" ry="22" fill="#fff" opacity=".10"/><ellipse cx="420" cy="165" rx="110" ry="16" fill="#fff" opacity=".08"/><ellipse cx="1380" cy="110" rx="170" ry="24" fill="#fff" opacity=".09"/>
<path d="M0 430 L120 350 L230 405 L360 310 L520 410 L640 360 L760 430 L900 450 H0Z" fill="#0e5f5c" opacity=".75"/>
<path d="M880 450 L1010 380 L1100 420 L1230 345 L1380 415 L1480 372 L1600 430 V450 H880Z" fill="#0e5f5c" opacity=".7"/>
<path d="M0 450 L160 395 L300 440 L470 385 L620 450Z" fill="#0a3f3d"/><path d="M1000 450 L1180 400 L1320 445 L1450 405 L1600 450Z" fill="#0a3f3d"/>
<rect y="448" width="1600" height="152" fill="url(#sea)"/>
<path d="M1120 452 h120 M1090 470 h180 M1060 492 h240 M1030 518 h300" stroke="#fff3d1" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/>
${waves}
<path d="M120 250 C 360 220, 560 130, 760 110" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-dasharray="2 12" stroke-linecap="round" fill="none"/>
<g transform="translate(790 100) rotate(-12)" fill="#fff"><path d="M0 0 L60 -8 L92 0 L60 8Z"/><path d="M30 -2 L52 -34 L62 -34 L52 -2Z"/><path d="M30 2 L52 34 L62 34 L52 2Z"/><path d="M6 0 L0 -14 L10 -14 L18 0Z"/></g>
</svg>`;
}
function sourceOf(item) { return uploadedPhoto(item.imgKey) ? 'upload' : photoFor(item) ? 'file' : 'illustration'; }
function photoFor(item) {
  const up = uploadedPhoto(item.imgKey);
  if (up) return up;
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

module.exports = { svg, imgFor, logo, favicon, hero, heroFile, UPLOAD_DIR, EXTS, uploadedPhoto, logoFile, sourceOf };
