'use strict';
/* Permanent image storage on Cloudinary (free plan, no credit card).
   Why: on hosts without a persistent disk (Render free, Vercel, Heroku...) every file written to the server is deleted
   when the site restarts, so photos uploaded in the admin panel vanish. Cloudinary keeps them forever.
   Switch it on by setting ONE environment variable on your host:  CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
   Without it the site keeps using local files exactly as before. */
const crypto = require('crypto');

const m = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec((process.env.CLOUDINARY_URL || '').trim());
const enabled = !!m;
const API = (process.env.CLOUDINARY_API_BASE || 'https://api.cloudinary.com').replace(/\/+$/, '');
const [, KEY, SECRET, CLOUD] = m || [];
const urls = new Map();                                   // image key ("logo", "hero", "main-goa-tour-package") -> https url
let lastError = '';

const idOf = key => 'uravi/' + (key === 'logo' || key === 'hero' ? key : 'photos/' + key);
const keyOf = id => id.startsWith('uravi/photos/') ? id.slice(13) : id.startsWith('uravi/') ? id.slice(6) : null;
const sign = p => crypto.createHash('sha1').update(Object.keys(p).sort().map(k => k + '=' + p[k]).join('&') + SECRET).digest('hex');
const endpoint = path => API + '/v1_1/' + CLOUD + path;

async function refresh() {
  if (!enabled) return;
  try {
    const next = new Map(); let cursor = '';
    do {
      const r = await fetch(endpoint('/resources/image/upload?prefix=uravi/&max_results=500' + (cursor ? '&next_cursor=' + encodeURIComponent(cursor) : '')),
        { headers: { Authorization: 'Basic ' + Buffer.from(KEY + ':' + SECRET).toString('base64') } });
      if (!r.ok) throw new Error('Cloudinary list failed (' + r.status + ')');
      const j = await r.json();
      (j.resources || []).forEach(x => { const k = keyOf(x.public_id); if (k) next.set(k, x.secure_url); });
      cursor = j.next_cursor || '';
    } while (cursor);
    urls.clear(); next.forEach((v, k) => urls.set(k, v)); lastError = '';
  } catch (e) { lastError = e.message; console.error('Image storage:', e.message); }   // keep what we already know
}

async function save(key, buffer, mime) {
  const p = { invalidate: 'true', overwrite: 'true', public_id: idOf(key), timestamp: Math.floor(Date.now() / 1000) };
  const f = new FormData();
  Object.keys(p).forEach(k => f.append(k, String(p[k])));
  f.append('api_key', KEY); f.append('signature', sign(p));
  f.append('file', new Blob([buffer], { type: mime || 'application/octet-stream' }), key);
  const r = await fetch(endpoint('/image/upload'), { method: 'POST', body: f });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.secure_url) throw new Error((j.error && j.error.message) || 'Image storage rejected the upload');
  urls.set(key, j.secure_url);
  return j.secure_url;
}

async function remove(key) {
  const p = { invalidate: 'true', public_id: idOf(key), timestamp: Math.floor(Date.now() / 1000) };
  const body = new URLSearchParams(Object.assign({}, p, { api_key: KEY, signature: sign(p) }));
  const r = await fetch(endpoint('/image/destroy'), { method: 'POST', body });
  if (!r.ok) throw new Error('Image storage could not delete the image');
  urls.delete(key);
}

if (enabled) { refresh(); setInterval(refresh, 60e3).unref(); }

module.exports = { enabled, get: k => (enabled && urls.get(k)) || null, save, remove, refresh, error: () => lastError };
