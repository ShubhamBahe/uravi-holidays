'use strict';
const os = require('os'), path = require('path'), fs = require('fs');
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'uravi-'));
process.env.ADMIN_PASSWORD = 'test-pass';
const app = require('../server');
const D = require('../data');

let pass = 0, fail = 0;
function ok(c, msg) { if (c) pass++; else { fail++; console.log('FAIL:', msg); } }

const srv = app.listen(0, async () => {
  const base = 'http://127.0.0.1:' + srv.address().port;
  const get = (p, h) => fetch(base + p, { headers: h, redirect: 'manual' });
  const send = (p, method, body, h) => fetch(base + p, { method, headers: Object.assign({ 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' }, h), body: body && JSON.stringify(body) });
  try {
    // every page
    for (const p of ['/', '/contact.php', '/privacy-policy.php', '/main-one-day-tour.php', '/main-jungle-safari.php', '/india-tour-packages.php',
      '/world-tour-packages.php', '/search.php?q=goa', '/customized-holidays.php', '/corporate-travel.php', '/services.php', '/admin', '/style.css', '/js/common.js', '/images/logo.svg', '/images/favicon.svg']) {
      const r = await get(p); ok(r.status === 200, p + ' -> ' + r.status);
    }
    ok((await get('/1/index.php')).status === 301, '/1/index.php redirect');
    for (const p of ['/gallery', '/robots.txt', '/sitemap.xml', '/api/gallery']) { const r = await get(p); ok(r.status === 200, p + ' -> ' + r.status); }
    ok((await get('/gallery.php')).status === 301 && (await get('/gallery.php')).headers.get('location') === '/gallery', 'gallery.php redirect');
    ok((await get('/about-us')).status === 301, 'old about-us redirect');
    ok(/Sitemap:/.test(await (await get('/robots.txt')).text()), 'robots has sitemap');
    ok(!/<loc>.*\/gallery<\/loc>/.test(await (await get('/sitemap.xml')).text()), 'sitemap leaves out the gallery');
    ok((await get('/index.php')).status === 301 && (await get('/index.php')).headers.get('location') === '/', '/index.php redirects to /');
    ok((await get('/gallery/')).status === 301 && (await get('/gallery/')).headers.get('location') === '/gallery', '/gallery/ redirects to /gallery');
    { const h = await (await get('/')).text(); ok(/class="card"/.test(h) && /application\/ld\+json/.test(h), 'home page has cards and structured data in the HTML'); }
    ok(/name="robots" content="noindex/.test(await (await get('/gallery')).text()), 'gallery asks Google not to list it');
    ok((await get('/nope.php')).status === 404, 'unknown php 404');
    ok((await get('/api/nope')).status === 404, 'unknown api 404');

    // every item: page, api, image
    for (const it of D.items) {
      const r = await get('/' + it.file); ok(r.status === 200, it.file + ' page ' + r.status);
      const a = await get('/api/page/' + it.file); ok(a.status === 200, it.file + ' api ' + a.status);
      const j = await a.json(); ok(j.itinerary.length >= 2 && j.item.img, it.file + ' content');
      const im = await get(j.item.img); ok(im.status === 200 && /svg|image/.test(im.headers.get('content-type')), it.file + ' image');
    }
    ok(D.items.length > 100, 'items count ' + D.items.length);
    // every menu link maps to an item
    D.menus.india.concat(D.menus.world).forEach(g => g.links.forEach(l => ok(D.bySlug[D.slugOf(l[1])], 'menu link missing ' + l[1])));
    // listings
    for (const f of ['main-one-day-tour.php', 'main-jungle-safari.php', 'india-tour-packages.php', 'world-tour-packages.php']) {
      const j = await (await get('/api/listing/' + f)).json(); ok(j.items.length > 0, f + ' listing');
    }
    ok((await (await get('/api/listing/main-one-day-tour.php')).json()).items.length === 13, '13 day tours');
    ok((await (await get('/api/search?q=dubai')).json()).items.length >= 2, 'search dubai');
    ok((await (await get('/api/featured')).json()).destinations.length === 8, 'featured');
    ok((await (await get('/api/suggested')).json()).length === 5, 'suggested');

    // enquiries
    let r = await send('/api/enquiries', 'POST', { type: 'package', package_slug: 'main-goa-tour-package', name: 'Test User', phone: '+91 98765 43210', email: 'a@b.co', travelers: 4, travel_date: '2099-01-01', message: 'Hi' });
    ok(r.status === 201, 'enquiry ok ' + r.status); const e1 = await r.json(); ok(e1.id > 0 && /whatsapp/.test(e1.whatsapp), 'enquiry id');
    r = await send('/api/enquiries', 'POST', { type: 'contact', name: 'X', phone: 'abc', email: 'bad', travelers: 0, travel_date: '2001-01-01' });
    const bad = await r.json(); ok(r.status === 400 && bad.errors.name && bad.errors.phone && bad.errors.email && bad.errors.travelers && bad.errors.travel_date, 'validation errors');
    r = await send('/api/enquiries', 'POST', { name: 'Bot', phone: '9999999999', website: 'spam.com' }); ok((await r.json()).id === 0, 'honeypot');
    r = await fetch(base + '/api/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' }); ok(r.status === 400, 'bad json');
    r = await send('/api/enquiries', 'POST', { type: 'quick', name: '<script>alert(1)</script>', phone: '9876543210' }); ok(r.status === 201, 'xss stored as text');

    // admin
    ok((await get('/api/admin/enquiries')).status === 401, 'admin needs auth');
    r = await send('/api/admin/login', 'POST', { password: 'wrong' }); ok(r.status === 401, 'wrong password');
    r = await send('/api/admin/login', 'POST', { password: 'test-pass' }); ok(r.status === 200, 'login');
    const ck = r.headers.get('set-cookie').split(';')[0]; ok(/HttpOnly/.test(r.headers.get('set-cookie')), 'httponly');
    const H = { Cookie: ck };
    let d = await (await get('/api/admin/enquiries', H)).json(); ok(d.total === 2, 'list total ' + d.total);
    ok((await (await get('/api/admin/enquiries?q=Goa', H)).json()).total === 1, 'search by package');
    ok((await (await get('/api/admin/stats', H)).json()).new === 2, 'stats');
    r = await send('/api/admin/enquiries/' + e1.id, 'PATCH', { status: 'contacted' }, H); ok(r.status === 200, 'patch');
    r = await send('/api/admin/enquiries/' + e1.id, 'PATCH', { status: 'nope' }, H); ok(r.status === 400, 'patch invalid');
    r = await fetch(base + '/api/admin/enquiries/' + e1.id, { method: 'DELETE', headers: H }); ok(r.status === 403, 'csrf header required');
    const csv = await (await get('/api/admin/export.csv', H)).text(); ok(csv.split('\n').length === 3 && csv.includes('Test User'), 'csv');
    r = await send('/api/admin/enquiries/' + e1.id, 'DELETE', null, H); ok(r.status === 200, 'delete');
    ok((await (await get('/api/admin/enquiries', H)).json()).total === 1, 'after delete');
    ok((await get('/api/admin/enquiries', { Cookie: 'uh_admin=forged.token' })).status === 401, 'forged token');
    await send('/api/admin/logout', 'POST', {}, H);
  } catch (e) { fail++; console.log('ERROR', e); }
  console.log(`\n${pass} passed, ${fail} failed`);
  srv.close(); process.exit(fail ? 1 : 0);
});
