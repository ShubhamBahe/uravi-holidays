'use strict';
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const D = require('./data');
const db = require('./db');
const IMG = require('./images');

const PORT = process.env.PORT || 3000;
const PUB = path.join(__dirname, 'public');
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

/* ---------- secrets ---------- */
function persisted(file, make) {
  const p = path.join(DATA_DIR, file);
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8').trim();
  const v = make(); fs.writeFileSync(p, v + '\n', { mode: 0o600 }); return v;
}
const SECRET = process.env.SESSION_SECRET || persisted('session.secret', () => crypto.randomBytes(32).toString('hex'));
let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
let generatedPw = false;
if (!ADMIN_PASSWORD) {
  const had = fs.existsSync(path.join(DATA_DIR, 'admin-password.txt'));
  ADMIN_PASSWORD = persisted('admin-password.txt', () => crypto.randomBytes(9).toString('base64url'));
  generatedPw = !had;
}
const sha = s => crypto.createHash('sha256').update(String(s)).digest();
function sign(p) { return crypto.createHmac('sha256', SECRET).update(p).digest('base64url'); }
function makeToken() { const p = Buffer.from(JSON.stringify({ exp: Date.now() + 8 * 3600e3 })).toString('base64url'); return p + '.' + sign(p); }
function checkToken(t) {
  if (!t || t.indexOf('.') < 0) return false;
  const [p, s] = t.split('.');
  const good = sign(p);
  if (s.length !== good.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(good))) return false;
  try { return JSON.parse(Buffer.from(p, 'base64url').toString()).exp > Date.now(); } catch (e) { return false; }
}
function cookie(req, name) {
  const m = (req.headers.cookie || '').split(/;\s*/).find(c => c.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : '';
}
function requireAdmin(req, res, next) {
  if (!checkToken(cookie(req, 'uravi_admin'))) return res.status(401).json({ error: 'Not signed in' });
  if (req.method !== 'GET' && req.get('X-Requested-With') !== 'fetch') return res.status(403).json({ error: 'Bad request' });
  next();
}

/* ---------- tiny rate limiter ---------- */
function limiter(max, windowMs) {
  const hits = new Map();
  return function (req, res, next) {
    const k = req.ip, now = Date.now();
    const arr = (hits.get(k) || []).filter(t => now - t < windowMs);
    if (arr.length >= max) return res.status(429).json({ error: 'Too many requests. Please try again in a few minutes.' });
    arr.push(now); hits.set(k, arr);
    if (hits.size > 5000) hits.clear();
    next();
  };
}

const app = express();

/* ---------- deployment: proxy, health check, HTTPS ---------- */
// Behind Render / Railway / Fly / Caddy / nginx the visitor's real IP arrives in X-Forwarded-For. Without this every
// visitor would share the proxy's IP and the rate limiters would lock everyone out together.
// TRUST_PROXY: a hop count (1), "false", or Express subnet names. Default trusts private/loopback proxies only.
(function () {
  const t = process.env.TRUST_PROXY;
  app.set('trust proxy', t === undefined || t === '' ? 'loopback, linklocal, uniquelocal' : /^\d+$/.test(t) ? Number(t) : t === 'false' ? false : t === 'true' ? true : t);
})();
app.disable('x-powered-by');
app.get('/healthz', (req, res) => {           // used by the host's health check; stays on plain HTTP
  try { db.ping(); res.set('Cache-Control', 'no-store').json({ ok: true }); } catch (e) { res.status(503).json({ ok: false }); }
});
if (process.env.FORCE_HTTPS === '1') {
  app.use((req, res, next) => {
    if (req.secure) { res.set('Strict-Transport-Security', 'max-age=31536000'); return next(); }
    res.redirect(301, 'https://' + req.get('host') + req.originalUrl);
  });
}
// One address only: uraviholidays.in -> www.uraviholidays.in (otherwise Google sees two copies of every page).
if (process.env.NODE_ENV === 'production') {
  const canon = (() => { try { return new URL(process.env.SITE_URL || D.SITE.url).host; } catch (e) { return ''; } })();
  app.use((req, res, next) => {
    if (canon && req.hostname === canon.replace(/^www\./, '') && req.hostname !== canon) return res.redirect(301, 'https://' + canon + req.originalUrl);
    next();
  });
}
app.disable('x-powered-by');
app.use(function (req, res, next) {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'SAMEORIGIN', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
  next();
});
app.use(express.json({ limit: '20kb' }));

/* ---------- helpers ---------- */
function card(it) {
  return { slug: it.slug, href: '/' + it.file, name: it.name, kind: it.kind, region: it.region, scope: it.scope, days: it.days,
    score: it.score, tagline: it.tagline, img: IMG.imgFor(it), highlights: it.highlights.slice(0, 4) };
}
function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

function itinerary(it) {
  if (it.kind === 'tour' || it.days === 1) {
    return [
      { day: 'Morning', title: 'Pickup from Nagpur', text: 'Board the vehicle at the agreed pickup point and travel to ' + it.name + '.' },
      { day: 'Midday', title: it.name, text: 'Enjoy ' + it.highlights.join(', ').toLowerCase() + '.' },
      { day: 'Afternoon', title: 'Lunch & leisure', text: 'Lunch break followed by free time for the activities you like best.' },
      { day: 'Evening', title: 'Return to Nagpur', text: 'Head back and drop-off at the pickup point.' }
    ];
  }
  const n = it.days, h = it.highlights, out = [];
  if (n === 2) {
    return [
      { day: 'Day 1', title: 'Arrival & ' + h[0], text: 'Arrive, check in and settle down, then enjoy ' + h[0].toLowerCase() + '. Evening briefing on the next day.' },
      { day: 'Day 2', title: h.slice(1, 3).join(' & ') + ' & departure', text: 'Enjoy ' + h.slice(1, 3).join(' and ').toLowerCase() + ', then check out and head for your onward journey.' }
    ];
  }
  out.push({ day: 'Day 1', title: 'Arrival', text: 'Arrive, meet your Uravi Holidays representative, transfer to the hotel and rest. Evening briefing on the days ahead.' });
  const mid = Math.max(0, n - 2);
  for (let d = 0; d < mid; d++) {
    let text, title;
    if (d < h.length && !(d === mid - 1 && h.length > mid)) { title = h[d]; text = 'Full-day sightseeing and experiences around ' + h[d] + '.'; }
    else if (d < h.length) { title = h.slice(d).join(' & '); text = 'Cover ' + h.slice(d).join(', ') + ' at a relaxed pace.'; }
    else { title = 'Leisure & local exploration'; text = 'A flexible day for shopping, local food or optional activities.'; }
    out.push({ day: 'Day ' + (d + 2), title, text });
  }
  if (n > 1) out.push({ day: 'Day ' + n, title: 'Departure', text: 'Breakfast, check-out and transfer for your onward journey.' });
  return out;
}

function detail(it) {
  const related = D.items.filter(x => x !== it && x.kind === it.kind && (x.region === it.region || it.kind !== 'destination')).slice(0, 3);
  const fill = D.items.filter(x => x !== it && x.kind === it.kind && !related.includes(x)).slice(0, 3 - related.length);
  const isTour = it.kind === 'tour';
  return {
    item: Object.assign(card(it), { highlights: it.highlights, duration: (isTour || it.days === 1) ? '1 Day' : plural(it.days, 'Day') + ' / ' + plural(it.days - 1, 'Night') }),
    itinerary: itinerary(it),
    sampleNote: isTour ? null : 'Sample itinerary. We customise every plan to your dates, budget and group size.',
    inclusions: isTour
      ? ['Pickup and drop in Nagpur', 'Sightseeing as per plan', 'Group, school and corporate bookings welcome', 'Final inclusions confirmed in your quote']
      : ['Accommodation as per the chosen package', 'Local sightseeing and transfers', 'Assistance from a friendly Uravi driver or guide', 'Final inclusions confirmed in your quote'],
    exclusions: ['Personal expenses', 'Anything not mentioned in your confirmed quote', 'Travel insurance, unless added on request'],
    related: related.concat(fill).map(card)
  };
}

const LISTINGS = {
  'main-one-day-tour.php': { title: 'Nagpur Special Tours Packages', tag: 'Uravi Holidays offers you a unique adventure.',
    text: 'Nagpur, often called Maharashtra\'s "winter capital", is surrounded by picturesque locations. They make some of the best picnic spots near Nagpur, loved by tourists and locals alike, especially on a sunny winter day. Here are the places you should consider the next time you plan a leisurely, fun day out in the city.',
    pick: () => D.items.filter(i => i.kind === 'tour') },
  'main-jungle-safari.php': { title: 'Jungle Safari Packages', tag: 'Meet the wild, close to home.',
    text: 'Central India is home to some of the finest tiger reserves in the country. Choose a safari package from Nagpur and let us take care of the stay, jeep safari and transfers.',
    pick: () => D.items.filter(i => i.kind === 'safari').concat([D.bySlug['bandhavgarh']]) },
  'india-tour-packages.php': { title: 'Domestic Tour Packages', tag: 'From the Himalayas to the backwaters.',
    text: 'Browse our domestic holidays across North, South, East, West and Central India.', filters: true,
    pick: () => D.items.filter(i => i.scope === 'india') },
  'world-tour-packages.php': { title: 'International Tour Packages', tag: 'Over 1000 tour packages worldwide.',
    text: 'Explore international holidays across Asia, Europe, the Middle East, Africa, the Americas and Australia.', filters: true,
    pick: () => D.items.filter(i => i.scope === 'world') }
};

/* ---------- public API ---------- */
app.get('/api/menus', (req, res) => res.json({ site: D.SITE, menus: D.menus }));

app.get('/api/listing/:file', (req, res) => {
  const L = LISTINGS[req.params.file.toLowerCase()];
  if (!L) return res.status(404).json({ error: 'Not found' });
  res.json({ title: L.title, tag: L.tag, text: L.text, filters: !!L.filters, items: L.pick().map(card) });
});

app.get('/api/search', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase().slice(0, 60);
  if (!q) return res.json({ q, items: [] });
  const terms = q.split(/\s+/);
  const scored = D.items.map(it => {
    const hay = (it.name + ' ' + it.region + ' ' + it.highlights.join(' ')).toLowerCase();
    if (!terms.every(t => hay.includes(t))) return null;
    return { it, s: (it.name.toLowerCase().startsWith(q) ? 0 : it.name.toLowerCase().includes(q) ? 1 : 2) };
  }).filter(Boolean).sort((a, b) => a.s - b.s);
  res.json({ q, items: scored.slice(0, 40).map(x => card(x.it)) });
});

app.get('/api/featured', (req, res) => {
  const pick = ['main-goa-tour-package', 'main-kashmir-tour-package', 'main-kerala-tour-package', 'main-rajasthan-tour-package',
    'dubai-delight-tour-6d', 'simply-singapore-4-days', 'main-thailand-tour-package', 'main-maldives-package'];
  res.json({
    tours: D.items.filter(i => i.kind === 'tour').slice(0, 6).map(card),
    destinations: pick.map(s => D.bySlug[s]).filter(Boolean).map(card)
  });
});

app.get('/api/gallery', (req, res) => {          // every package that has a real photo (uploaded or committed)
  const photos = D.items.filter(it => IMG.sourceOf(it) !== 'illustration')
    .map(it => ({ name: it.name, region: it.region, href: '/' + it.file, img: IMG.imgFor(it) }));
  res.set('Cache-Control', 'public, max-age=60').json({ photos });
});

app.get('/api/suggested', (req, res) =>
  res.json(D.suggested.map(s => Object.assign(card(D.bySlug[s]), { tagline: D.suggestedTaglines[s] }))));
app.get('/api/reviews/:src', (req, res) => {
  const r = D.reviews[req.params.src];
  if (!r) return res.status(404).json({ error: 'Not found' });
  res.json(r.map(x => ({ name: x[0], rating: x[1], text: x[2] })));
});
app.get('/api/page/:file', (req, res) => {
  const it = D.bySlug[D.slugOf(req.params.file)];
  if (!it) return res.status(404).json({ error: 'Not found' });
  res.json(detail(it));
});

/* ---------- enquiries ---------- */
const TYPES = ['package', 'tour', 'safari', 'contact', 'custom', 'corporate', 'quick'];
function clean(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max); }

app.post('/api/enquiries', limiter(6, 10 * 60e3), (req, res) => {
  const b = req.body || {};
  if (b.website) return res.json({ ok: true, id: 0 });       // honeypot: bots fill this in
  const errors = {};
  const type = TYPES.includes(b.type) ? b.type : 'contact';
  const name = clean(b.name, 80), phone = clean(b.phone, 20), email = clean(b.email, 120);
  const message = clean(b.message, 1000), budget = clean(b.budget, 40);
  if (name.length < 2) errors.name = 'Please enter your name.';
  if (!/^\+?[0-9][0-9\s-]{6,17}$/.test(phone)) errors.phone = 'Please enter a valid phone number.';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Please enter a valid email address.';
  let date = clean(b.travel_date, 10);
  if (date) {
    const t = Date.parse(date + 'T00:00:00Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(t)) errors.travel_date = 'Please choose a valid date.';
    else if (t < Date.now() - 86400e3) errors.travel_date = 'Travel date cannot be in the past.';
  }
  let travelers = null;
  if (b.travelers !== undefined && b.travelers !== '' && b.travelers !== null) {
    travelers = parseInt(b.travelers, 10);
    if (!(travelers >= 1 && travelers <= 500)) errors.travelers = 'Travellers must be between 1 and 500.';
  }
  if (type === 'contact' && message.length < 3) errors.message = 'Please write a short message.';
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please fix the highlighted fields.', errors });

  const it = b.package_slug ? D.bySlug[D.slugOf(String(b.package_slug))] : null;
  const id = db.insert({ type, package_slug: it ? it.slug : null, package_name: it ? it.name : clean(b.destination, 100) || null,
    name, phone, email: email || null, travel_date: date || null, travelers, budget: budget || null, message: message || null, ip: req.ip });
  const wa = 'https://api.whatsapp.com/send?phone=' + D.SITE.whatsapp + '&text=' + encodeURIComponent(
    'Hi, I am ' + name + '. I just sent enquiry #' + id + (it ? ' about ' + it.name : '') + '.');
  res.status(201).json({ ok: true, id, whatsapp: wa });
});

/* ---------- admin ---------- */
const loginLimit = limiter(8, 15 * 60e3);
app.post('/api/admin/login', loginLimit, (req, res) => {
  const pw = String((req.body || {}).password || '');
  if (!crypto.timingSafeEqual(sha(pw), sha(ADMIN_PASSWORD))) return res.status(401).json({ error: 'Wrong password' });
  const secure = req.secure || req.get('x-forwarded-proto') === 'https';
  res.set('Set-Cookie', 'uravi_admin=' + makeToken() + '; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800' + (secure ? '; Secure' : ''));
  res.json({ ok: true });
});
app.post('/api/admin/logout', (req, res) => { res.set('Set-Cookie', 'uravi_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'); res.json({ ok: true }); });
app.get('/api/admin/me', requireAdmin, (req, res) => res.json({ ok: true }));
app.get('/api/admin/stats', requireAdmin, (req, res) => res.json(db.stats()));
app.get('/api/admin/enquiries', requireAdmin, (req, res) => {
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const r = db.list({ status: String(req.query.status || ''), q: String(req.query.q || '').slice(0, 60), limit, offset: (page - 1) * limit });
  res.json({ total: r.total, page, limit, rows: r.rows });
});
app.patch('/api/admin/enquiries/:id', requireAdmin, (req, res) => {
  const s = (req.body || {}).status;
  if (!db.STATUSES.includes(s)) return res.status(400).json({ error: 'Invalid status' });
  if (!db.setStatus(parseInt(req.params.id, 10), s)) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});
app.delete('/api/admin/enquiries/:id', requireAdmin, (req, res) => {
  if (!db.remove(parseInt(req.params.id, 10))) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});
app.get('/api/admin/export.csv', requireAdmin, (req, res) => {
  const cols = ['id', 'created_at', 'status', 'type', 'package_name', 'name', 'phone', 'email', 'travel_date', 'travelers', 'budget', 'message'];
  const q = v => { v = v == null ? '' : String(v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
  const lines = [cols.join(',')].concat(db.all().map(r => cols.map(c => q(r[c])).join(',')));
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="enquiries.csv"' }).send(lines.join('\n'));
});
/* ---------- admin: photos & logo ---------- */
fs.mkdirSync(path.join(IMG.UPLOAD_DIR, 'photos'), { recursive: true });
const rawImage = express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '10mb' });
function sniffImage(b) {
  if (b.length < 12) return null;
  if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return 'jpg';
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return 'png';
  if (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP') return 'webp';
  return null;
}
const itemByKey = k => D.items.find(i => i.imgKey === k);
const SPECIAL = ['logo', 'hero'];
const validKey = k => SPECIAL.includes(k) || !!itemByKey(k);
const upFile = (key, ext) => SPECIAL.includes(key) ? path.join(IMG.UPLOAD_DIR, key + '.' + ext) : path.join(IMG.UPLOAD_DIR, 'photos', key + '.' + ext);
function clearUploads(key) { IMG.EXTS.forEach(e => { try { fs.unlinkSync(upFile(key, e)); } catch (_) { /* not there */ } }); }
function photoUrl(key) { return key === 'logo' ? '/images/logo.svg?v=' + Date.now() : key === 'hero' ? '/img/hero-scene.svg?v=' + Date.now() : IMG.imgFor(itemByKey(key)); }

// Uploads are files in DATA_DIR. On hosts without a persistent disk (Render free, Heroku, Vercel...) they are wiped on every
// restart/redeploy, which looks like "my changes reset". Tell the admin when we suspect that.
const onRootDisk = (() => { try { return fs.statSync(DATA_DIR).dev === fs.statSync('/').dev; } catch (e) { return false; } })();   // not a separate mounted disk
const STORAGE_WARNING = process.env.NODE_ENV === 'production' && !IMG.STORE.enabled && onRootDisk
  ? 'Photos uploaded here are stored on a temporary disk and will disappear when the site restarts. Fix: add the CLOUDINARY_URL setting on your host (free, see DEPLOY.md) or attach a persistent disk.' : '';
app.get('/api/admin/photos', requireAdmin, (req, res) => {
  const f = IMG.logoFile();
  res.json({
    storageWarning: STORAGE_WARNING,
    logo: { url: '/images/logo.svg?v=' + Date.now(), source: IMG.STORE.get('logo') || f && f.startsWith(IMG.UPLOAD_DIR) ? 'upload' : f ? 'file' : 'illustration' },
    hero: { url: '/img/hero-scene.svg?v=' + Date.now(), source: (h => IMG.STORE.get('hero') || h && h.startsWith(IMG.UPLOAD_DIR) ? 'upload' : h ? 'file' : 'illustration')(IMG.heroFile()) },
    items: D.items.map(it => ({ key: it.imgKey, name: it.name, region: it.region, kind: it.kind, url: IMG.imgFor(it), source: IMG.sourceOf(it) }))
  });
});
app.put('/api/admin/photos/:key', requireAdmin, rawImage, async (req, res, next) => {
  const key = req.params.key;
  if (!validKey(key)) return res.status(404).json({ error: 'Unknown package' });
  const ext = Buffer.isBuffer(req.body) && req.body.length ? sniffImage(req.body) : null;
  if (!ext) return res.status(415).json({ error: 'Please choose a JPG, PNG or WebP image.' });
  try {
    if (IMG.STORE.enabled) { await IMG.STORE.save(key, req.body, { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[ext]); clearUploads(key); }
    else {
      clearUploads(key);
      const dest = upFile(key, ext);
      fs.writeFileSync(dest + '.tmp', req.body);
      fs.renameSync(dest + '.tmp', dest);
    }
  } catch (e) { console.error(e); return res.status(502).json({ error: 'Could not save the image: ' + e.message }); }
  res.json({ ok: true, key, url: photoUrl(key), source: 'upload' });
});
app.delete('/api/admin/photos/:key', requireAdmin, async (req, res) => {
  const key = req.params.key;
  if (!validKey(key)) return res.status(404).json({ error: 'Unknown package' });
  clearUploads(key);
  if (IMG.STORE.get(key)) { try { await IMG.STORE.remove(key); } catch (e) { return res.status(502).json({ error: e.message }); } }
  res.json({ ok: true });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

/* ---------- only the website's own scripts are public ---------- */
// Without this, any stray file under public/js (server code, data/uravi.db, admin-password.txt ...) could be downloaded by anyone.
const PUBLIC_JS = ['common.js', 'home.js', 'listing.js', 'detail.js', 'admin.js', 'uravi-site.js', 'gallery.js'];
app.use('/js', (req, res, next) => PUBLIC_JS.includes(req.path.slice(1)) ? next() : res.status(404).sendFile(path.join(PUB, '404.html')));

/* ---------- leftover old branding safety net ---------- */
app.use(require('./rebrand')(PUB));

/* ---------- images ---------- */
app.get('/img/hero-scene.svg', (req, res) => {   // home page background: your uploaded photo, or the default scene
  const f = IMG.heroFile();
  res.set('Cache-Control', 'no-cache');
  if (IMG.STORE.get('hero')) return res.redirect(302, IMG.STORE.get('hero'));
  return f ? res.sendFile(f) : res.type('image/svg+xml').send(IMG.hero());
});
app.get('/img/:key.svg', (req, res) => {
  const key = req.params.key.toLowerCase().replace(/[^a-z0-9-]/g, '');
  res.set({ 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' }).send(IMG.svg(key, key.replace(/-/g, ' ')));
});
// logo: upload one from the admin page (Photos & Logo), or drop public/images/logo.png
app.get('/images/logo.svg', (req, res) => {
  const f = IMG.logoFile();
  res.set('Cache-Control', 'no-cache');
  if (IMG.STORE.get('logo')) return res.redirect(302, IMG.STORE.get('logo'));
  return f ? res.sendFile(f) : res.type('image/svg+xml').send(IMG.logo());
});
app.use('/uploads', express.static(IMG.UPLOAD_DIR, { index: false, maxAge: '30d' }));
app.get('/images/favicon.svg', (req, res) => res.type('image/svg+xml').send(IMG.favicon()));

/* ---------- pages ---------- */
const send = f => (req, res) => res.sendFile(path.join(PUB, f));
const PAGES = {
  'index.php': 'index.html', 'contact.php': 'contact.html', 'privacy-policy.php': 'privacy.html',
  'main-one-day-tour.php': 'tour.html', 'main-jungle-safari.php': 'tour.html', 'india-tour-packages.php': 'tour.html',
  'world-tour-packages.php': 'tour.html', 'search.php': 'tour.html',
  'customized-holidays.php': 'enquiry.html', 'corporate-travel.php': 'enquiry.html',
  'services.php': 'services.html', 'our-services.php': 'services.html', 'service.php': 'services.html', 'gallery.php': 'gallery.html'
};
/* ---------- search engines: robots.txt, sitemap.xml, old URLs ---------- */
const BASE = (process.env.SITE_URL || D.SITE.url || '').replace(/\/+$/, '');
app.get('/robots.txt', (req, res) => res.type('text/plain').send(
  'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ' + BASE + '/sitemap.xml\n'));
app.get('/sitemap.xml', (req, res) => {
  const base = BASE || (req.protocol + '://' + req.get('host'));
  const urls = ['/', '/gallery', '/india-tour-packages.php', '/world-tour-packages.php', '/main-jungle-safari.php', '/main-one-day-tour.php',
    '/customized-holidays.php', '/corporate-travel.php', '/services.php', '/contact.php', '/privacy-policy.php'].concat(D.items.map(i => '/' + i.file));
  res.type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(u => '<url><loc>' + base + u.replace(/&/g, '&amp;') + '</loc></url>').join('\n') + '\n</urlset>');
});
// Addresses that Google or old links may still use (old website versions). Each one is sent permanently (301) to the matching page.
const OLD_URLS = {
  '/index.html': '/', '/home': '/', '/index': '/',
  '/gallery.php': '/gallery', '/gallery.html': '/gallery', '/photos': '/gallery', '/photo-gallery': '/gallery', '/gallery/index.php': '/gallery',
  '/contact': '/contact.php', '/contact-us': '/contact.php', '/contact-us.php': '/contact.php', '/contactus': '/contact.php', '/contactus.php': '/contact.php',
  '/about': '/contact.php', '/about-us': '/contact.php', '/about-us.php': '/contact.php', '/aboutus.php': '/contact.php',
  '/services': '/services.php', '/our-services': '/services.php',
  '/privacy-policy': '/privacy-policy.php', '/privacy': '/privacy-policy.php',
  '/india': '/india-tour-packages.php', '/domestic': '/india-tour-packages.php', '/domestic-tour-packages.php': '/india-tour-packages.php',
  '/india-tour-packages': '/india-tour-packages.php', '/tour-packages': '/india-tour-packages.php', '/packages': '/india-tour-packages.php',
  '/world': '/world-tour-packages.php', '/international': '/world-tour-packages.php', '/international-tour-packages.php': '/world-tour-packages.php',
  '/world-tour-packages': '/world-tour-packages.php',
  '/jungle-safari': '/main-jungle-safari.php', '/jungle-safari.php': '/main-jungle-safari.php',
  '/one-day-tour': '/main-one-day-tour.php', '/day-tours': '/main-one-day-tour.php',
  '/customized-holidays': '/customized-holidays.php', '/corporate-travel': '/corporate-travel.php', '/enquiry': '/customized-holidays.php'
};
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const key = req.path.toLowerCase().replace(/\/+$/, '') || '/';
  const to = OLD_URLS[key];
  if (to && to !== key) return res.redirect(301, to + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''));
  next();
});
app.get('/gallery', send('gallery.html'));
app.get('/', send('index.html'));
app.get('/admin', send('admin.html'));
app.get('/1/index.php', (req, res) => res.redirect(301, '/customized-holidays.php'));
app.get(/\.php$/i, (req, res, next) => {
  const file = D.decode(req.path.slice(1)).toLowerCase();
  if (PAGES[file]) return res.sendFile(path.join(PUB, PAGES[file]));
  if (D.bySlug[D.slugOf(file)]) return res.sendFile(path.join(PUB, 'detail.html'));
  next();
});
app.use(express.static(PUB, { extensions: ['html'], index: false }));
app.use((req, res) => res.status(404).sendFile(path.join(PUB, '404.html')));
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
  if (err && err.type === 'entity.too.large') return res.status(413).json({ error: 'Image is too large (max 10 MB).' });
  console.error(err);
  res.status(500).json(req.path.startsWith('/api') ? { error: 'Server error' } : { error: 'Something went wrong' });
});

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log('Uravi Holidays running at http://localhost:' + PORT);
    console.log('Admin panel: http://localhost:' + PORT + '/admin');
    console.log('Database: ' + db.DB_FILE);
    if (generatedPw) console.log('Generated admin password (also saved in ' + path.join(DATA_DIR, 'admin-password.txt') + '): ' + ADMIN_PASSWORD);
    else if (!process.env.ADMIN_PASSWORD) console.log('Admin password is in ' + path.join(DATA_DIR, 'admin-password.txt'));
    if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_PASSWORD) console.warn('Tip: set the ADMIN_PASSWORD environment variable in production.');
  });
  // finish in-flight requests and close the database cleanly when the host stops or redeploys the app
  let stopping = false;
  function stop(sig) {
    if (stopping) return; stopping = true;
    console.log(sig + ' received, shutting down');
    server.close(() => { db.close(); process.exit(0); });
    setTimeout(() => { db.close(); process.exit(0); }, 10000).unref();
  }
  process.on('SIGTERM', () => stop('SIGTERM'));
  process.on('SIGINT', () => stop('SIGINT'));
  process.on('unhandledRejection', e => console.error('Unhandled rejection:', e));
}
module.exports = app;
