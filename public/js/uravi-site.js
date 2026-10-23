/* Uravi Holidays site helpers. Loaded right after common.js on every page.
   1. UraviForm: a self-contained enquiry form (works even if common.js helpers are missing).
   2. Shows the verified business details in the top bar / footer only when the old AVM ones are still there.
   3. Fallbacks that fill empty enquiry boxes and empty home/listing cards if the page scripts could not.
   All business details come from SITE in data.js (served by /api/menus). */
(function () {
  var site = null;
  var FALLBACK_PHONE = '+91 83290 56457';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function digits(p) { return String(p).replace(/[^\d+]/g, ''); }
  function legacy(el) { return !!el && /avm|94224|vijay\.avm|avmtours/i.test(el.textContent + ' ' + el.innerHTML); }
  function today() { var d = new Date(), p = function (n) { return String(n).padStart(2, '0'); }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }

  /* ---------- 1. enquiry form ---------- */
  var FIELDS = {
    name: { label: 'Name', type: 'text', ph: 'Your name', auto: 'name' },
    phone: { label: 'Phone', type: 'tel', ph: 'Mobile number', auto: 'tel' },
    email: { label: 'Email (optional)', type: 'email', ph: 'you@example.com', auto: 'email' },
    destination: { label: 'Destination', type: 'text', ph: 'Where do you want to go?' },
    travel_date: { label: 'Travel date', type: 'date' },
    travelers: { label: 'Travellers', type: 'number', ph: 'e.g. 4' },
    budget: { label: 'Budget (optional)', type: 'text', ph: 'e.g. 50,000' },
    message: { label: 'Message', type: 'textarea', full: true, ph: 'Tell us more about your trip' }
  };

  function UraviForm(el, o) {
    if (!el) return;
    o = o || {};
    var names = o.fields || ['name', 'phone', 'email', 'message'];
    var html = '<form class="form" novalidate>' + (o.title ? '<h3>' + esc(o.title) + '</h3>' : '') + '<div class="form__grid">';
    names.forEach(function (n) {
      var f = FIELDS[n]; if (!f) return;
      var req = n === 'name' || n === 'phone' || (n === 'message' && o.type === 'contact');
      html += '<label class="' + (f.full ? 'full' : '') + '" data-f="' + n + '">' + esc(f.label) + (req ? ' *' : '') +
        (f.type === 'textarea'
          ? '<textarea name="' + n + '" rows="3" placeholder="' + esc(f.ph || '') + '"></textarea>'
          : '<input name="' + n + '" type="' + f.type + '" placeholder="' + esc(f.ph || '') + '"' + (f.auto ? ' autocomplete="' + f.auto + '"' : '') +
            (n === 'travel_date' ? ' min="' + today() + '"' : '') + (n === 'travelers' ? ' min="1" max="500"' : '') + '>') +
        '<span class="err"></span></label>';
    });
    html += '</div><label class="hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>' +
      '<div class="form__status" role="status" aria-live="polite"></div>' +
      '<button class="btn" type="submit">' + esc(o.submit || 'Send Enquiry') + '</button></form>';
    el.innerHTML = html;
    el.setAttribute('data-uravi-form', '1');

    var form = el.querySelector('form'), status = el.querySelector('.form__status'), btn = el.querySelector('button[type=submit]');
    function clearErrors() { form.querySelectorAll('label').forEach(function (l) { l.classList.remove('has-error'); var e = l.querySelector('.err'); if (e) e.textContent = ''; }); }
    function say(t, bad) { status.textContent = t || ''; status.classList.toggle('is-error', !!bad); }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault(); clearErrors(); say('');
      var body = { type: o.type || 'contact' };
      if (o.package_slug) body.package_slug = o.package_slug;
      new FormData(form).forEach(function (v, k) { body[k] = String(v).trim(); });
      btn.disabled = true; var label = btn.textContent; btn.textContent = 'Sending…';
      fetch('/api/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok) {
            el.innerHTML = '<div class="form__done"><i class="fa fa-check-circle"></i><h3>Thank you!</h3>' +
              '<p>We have received your enquiry and will contact you soon.</p>' +
              (res.j.whatsapp ? '<p><a class="btn btn--wa" href="' + esc(res.j.whatsapp) + '" target="_blank" rel="noopener"><i class="fa fa-whatsapp"></i> Continue on WhatsApp</a></p>' : '') + '</div>';
            return;
          }
          var errs = res.j.errors || {};
          Object.keys(errs).forEach(function (k) {
            var l = form.querySelector('[data-f="' + k + '"]'); if (!l) return;
            l.classList.add('has-error'); l.querySelector('.err').textContent = errs[k];
          });
          say(res.j.error || 'Something went wrong. Please try again.', true);
        })
        .catch(function () { say('Could not send right now. Please call us on ' + ((site && site.phone) || FALLBACK_PHONE) + '.', true); })
        .then(function () { if (document.body.contains(btn)) { btn.disabled = false; btn.textContent = label; } });
    });
  }
  window.UraviForm = UraviForm;

  /* ---------- 2. business details (only replaces leftovers of the old brand) ---------- */
  function socials(cls) {
    var s = site.social || {}, out = '';
    if (s.instagram) out += '<a href="' + esc(s.instagram) + '" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa fa-instagram"></i></a>';
    if (s.facebook) out += '<a href="' + esc(s.facebook) + '" target="_blank" rel="noopener" aria-label="Facebook"><i class="fa fa-facebook"></i></a>';
    if (s.whatsapp) out += '<a href="' + esc(s.whatsapp) + '" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fa fa-whatsapp"></i></a>';
    return '<div class="social ' + (cls || '') + '">' + out + '</div>';
  }
  function topbar() {
    var t = document.querySelector('.topbar');
    if (!t || t.getAttribute('data-uravi') || !legacy(t)) return;
    t.setAttribute('data-uravi', '1');
    t.innerHTML = '<div class="container topbar__inner"><div class="topbar__info">' +
      '<a href="tel:' + esc(digits(site.phone)) + '"><i class="fa fa-phone"></i> ' + esc(site.phone) + '</a>' +
      '<a href="mailto:' + esc(site.email) + '"><i class="fa fa-envelope"></i> ' + esc(site.email) + '</a></div>' + socials('') + '</div>';
  }
  function footer() {
    var f = document.getElementById('site-footer');
    if (!f || f.querySelector('[data-uravi-footer]')) return;
    if (f.children.length && !legacy(f)) return;          // keep a footer that is already correct
    var a = site.address || {}, ph = (site.phones || [site.phone]).map(function (p) {
      return '<a href="tel:' + esc(digits(p)) + '">' + esc(p) + '</a>';
    }).join('<br>');
    var links = [['Home', '/index.php'], ['Domestic Tours', '/india-tour-packages.php'], ['International Tours', '/world-tour-packages.php'],
      ['Jungle Safari', '/main-jungle-safari.php'], ['Day Tours from Nagpur', '/main-one-day-tour.php'], ['Our Services', '/services.php'],
      ['Customized Holidays', '/customized-holidays.php'], ['Corporate Travel', '/corporate-travel.php'],
      ['Gallery', '/gallery'], ['Contact Us', '/contact.php'], ['Privacy Policy', '/privacy-policy.php']];
    f.innerHTML = '<footer class="footer" data-uravi-footer><div class="container footer__grid">' +
      '<div><h4>' + esc(site.name) + '</h4><p>' + esc(site.tagline) + '</p><p><em>' + esc(site.slogan) + '</em></p>' + socials('social--footer') + '</div>' +
      '<div><h4>Quick Links</h4>' + links.map(function (l) { return '<p><a href="' + l[1] + '">' + l[0] + '</a></p>'; }).join('') + '</div>' +
      '<div><h4>Our Services</h4>' + (site.services || []).map(function (s) { return '<p>' + esc(s) + '</p>'; }).join('') + '</div>' +
      '<div><h4>Contact</h4>' +
      '<p><i class="fa fa-map-marker"></i> ' + esc(a.full || '') + (site.mapUrl ? '<br><a href="' + esc(site.mapUrl) + '" target="_blank" rel="noopener">Open in Google Maps</a>' : '') + '</p>' +
      '<p><i class="fa fa-phone"></i> ' + ph + '</p>' +
      '<p><i class="fa fa-envelope"></i> <a href="mailto:' + esc(site.email) + '">' + esc(site.email) + '</a></p>' +
      '<p><i class="fa fa-globe"></i> ' + esc(site.website) + '</p></div>' +
      '</div><div class="copyright"><p>&copy; ' + new Date().getFullYear() + ' ' + esc(site.name) + '. All rights reserved. &middot; <a href="/admin"><i class="fa fa-lock"></i> Admin Login</a></p></div></footer>';
  }
  function whatsapp() {
    document.querySelectorAll('a.whatsapp').forEach(function (a) { a.href = 'https://api.whatsapp.com/send?phone=' + site.whatsapp + '&text=Hi'; });
  }
  function nav() {                                          // the header menu needs a working "Services" link
    var h = document.getElementById('site-header'); if (!h) return;
    var found = false;
    h.querySelectorAll('a, button').forEach(function (el) {
      if (/^\s*services?\s*$/i.test(el.textContent)) { found = true; if (el.tagName === 'A') el.setAttribute('href', '/services.php'); }
    });
    var list = h.querySelector('.nav__list');
    if (!found && list && !list.querySelector('[data-uravi-services]')) {
      var li = document.createElement('li');
      li.innerHTML = '<a class="nav__link" data-uravi-services href="/services.php">Services</a>';
      list.appendChild(li);
    }
  }
  function logo() { document.querySelectorAll('.logo img').forEach(function (i) { i.alt = site.name; }); }
  function run() { if (!site) return; topbar(); footer(); whatsapp(); nav(); logo(); }

  /* ---------- 3. fallbacks if the page scripts could not draw something ---------- */
  function isEmpty(el) { return el && !el.children.length && !el.textContent.trim(); }
  function fillForms() {
    document.querySelectorAll('.side-card').forEach(function (el) {
      if (!isEmpty(el) || el.getAttribute('data-uravi-form')) return;
      var file = location.pathname.split('/').pop();
      if (el.id === 'homeForm') return UraviForm(el, { type: 'quick', title: 'Plan my trip', fields: ['name', 'phone', 'email', 'destination', 'travel_date', 'message'], submit: 'Send Enquiry' });
      if (el.id === 'enqForm') return;                      // drawn by enquiry.html itself
      if (/\.php$/i.test(file) && document.getElementById('detail'))
        UraviForm(el, { type: 'package', package_slug: file, title: 'Enquire about this package', fields: ['name', 'phone', 'email', 'travel_date', 'travelers', 'message'], submit: 'Send Enquiry' });
    });
  }
  function cardHtml(it) {
    var meta = '';
    if (it.region) meta += '<li>' + esc(it.region) + '</li>';
    if (it.days) meta += '<li>' + esc(typeof it.days === 'number' ? it.days + (it.days === 1 ? ' Day' : ' Days') : it.days) + '</li>';
    return '<article class="card"><div class="card__img"><a href="' + esc(it.href) + '" style="display:block;height:100%"><img src="' + esc(it.img) + '" alt="' + esc(it.name) + '" loading="lazy"></a>' +
      (it.score ? '<span class="card__score">' + esc(it.score) + '</span>' : '') + '</div>' +
      '<div class="card__body"><h3><a href="' + esc(it.href) + '">' + esc(it.name) + '</a></h3>' + (meta ? '<ul class="card__meta">' + meta + '</ul>' : '') +
      '<div class="card__foot"><a class="btn btn--sm" href="' + esc(it.href) + '">View Details</a></div></div></article>';
  }
  function getJson(u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(u); return r.json(); }); }
  function fillCards() {
    var t = document.getElementById('homeTours'), d = document.getElementById('homeDest');
    if (isEmpty(t) || isEmpty(d)) getJson('/api/featured').then(function (j) {
      if (isEmpty(t)) t.innerHTML = j.tours.map(cardHtml).join('');
      if (isEmpty(d)) d.innerHTML = j.destinations.map(cardHtml).join('');
    }).catch(function () {});
    var c = document.getElementById('tourCards');
    if (c && c.querySelector('.empty') && /loading/i.test(c.textContent)) {
      var file = location.pathname.split('/').pop().toLowerCase(), q = new URLSearchParams(location.search).get('q') || '';
      (file === 'search.php' ? getJson('/api/search?q=' + encodeURIComponent(q)) : getJson('/api/listing/' + encodeURIComponent(file))).then(function (j) {
        var set = function (id, v) { var e = document.getElementById(id); if (e && v) e.textContent = v; };
        set('introTitle', j.title); set('introTag', j.tag); set('introText', j.text);
        c.innerHTML = j.items.length ? j.items.map(cardHtml).join('') : '<p class="empty">No packages found.</p>';
      }).catch(function () {});
    }
  }

  fetch('/api/menus').then(function (r) { return r.json(); }).then(function (d) {
    site = d.site; run();
    var n = 0, timer = setInterval(function () { run(); if (++n > 20) clearInterval(timer); }, 500);   // header/footer may be drawn a moment later
  }).catch(function () { /* keep whatever common.js drew */ });

  window.addEventListener('load', function () { setTimeout(function () { fillForms(); fillCards(); }, 1500); });
})();
