(function () {
  'use strict';
  var WA_NUMBER = '918329056457';
  var WA = 'https://api.whatsapp.com/send?phone=' + WA_NUMBER + '&text=';

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function currentFile() { var f = decodeURIComponent(location.pathname.split('/').pop() || 'index.php'); return f || 'index.php'; }

  function api(url, opts) {
    opts = opts || {};
    var init = { method: opts.method || 'GET', credentials: 'same-origin', headers: { 'X-Requested-With': 'fetch' } };
    if (opts.body) { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(opts.body); }
    return fetch(url, init).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        if (!r.ok) { var e = new Error(data.error || 'Request failed'); e.status = r.status; e.data = data; throw e; }
        return data;
      });
    });
  }

  /* ---------- Header / footer ---------- */
  var MAPS = 'https://maps.app.goo.gl/4U8Zeg9DdJ7AswoaA';
  var HEADER = '' +
    '<div class="topbar"><div class="container topbar__inner">' +
      '<ul class="topbar__info">' +
        '<li><a href="' + MAPS + '" target="_blank" rel="noopener"><i class="fa fa-map-marker"></i> Bardi, Nagpur, Maharashtra</a></li>' +
        '<li><a href="tel:+918329056457"><i class="fa fa-phone"></i> +91 83290 56457</a></li>' +
        '<li><a href="tel:+918765043591"><i class="fa fa-phone"></i> +91 87660 43591</a></li>' +
      '</ul>' +
      '<ul class="social">' +
        '<li><a href="mailto:infouraviholidays@gmail.com" aria-label="Email"><i class="fa fa-envelope"></i></a></li>' +
        '<li><a href="' + WA + 'Hi" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fa fa-whatsapp"></i></a></li>' +
      '</ul>' +
    '</div></div>' +
    '<header class="header"><div class="container header__inner">' +
      '<a class="logo" href="/index.php"><img src="/images/logo.svg" alt="Uravi Holidays" height="48"></a>' +
      '<button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="mainNav"><i class="fa fa-bars"></i></button>' +
      '<nav class="nav" id="mainNav" aria-label="Main"><ul class="nav__list">' +
        '<li class="nav__item has-mega"><button class="nav__link" aria-expanded="false">India <i class="fa fa-angle-down"></i></button><div class="mega" id="megaIndia"></div></li>' +
        '<li class="nav__item has-mega"><button class="nav__link" aria-expanded="false">World <i class="fa fa-angle-down"></i></button><div class="mega" id="megaWorld"></div></li>' +
        '<li class="nav__item"><a class="nav__link" data-file="main-jungle-safari.php" href="/main-jungle-safari.php">Jungle Safari</a></li>' +
        '<li class="nav__item"><a class="nav__link" data-file="main-one-day-tour.php" href="/main-one-day-tour.php">Nagpur Special Tours</a></li>' +
        '<li class="nav__item"><a class="nav__link" data-file="customized-holidays.php" href="/customized-holidays.php">Customized Holidays</a></li>' +
        '<li class="nav__item"><a class="nav__link" data-file="corporate-travel.php" href="/corporate-travel.php">Corporate Travel</a></li>' +
        '<li class="nav__item"><a class="nav__link" data-file="services.php" href="/services.php">Services</a></li>' +
        '<li class="nav__item"><a class="nav__link" data-file="contact.php" href="/contact.php">Contact us</a></li>' +
      '</ul></nav>' +
    '</div></header>';

  var FOOTER = '' +
    '<footer class="footer"><div class="container footer__grid">' +
      '<div><h4>Uravi Holidays</h4><p>Your Trusted Travel Partner</p><p><em>Travel Beyond Boundaries</em></p>' +
        '<a class="btn btn--sm" href="/privacy-policy.php">Privacy Policy</a></div>' +
      '<div><h4>Address &amp; Contact</h4>' +
        '<p><i class="fa fa-map-marker"></i> Imperial Plaza, Trenton Business Centre, 5th Floor, Block No. 5, Somwar Bazar Road, Bardi, Nagpur.</p>' +
        '<p><strong>Shankartaj Gaikwad</strong><br>Travel Consultant</p>' +
        '<p><i class="fa fa-phone"></i> <a href="tel:+918329056457">+91 83290 56457</a></p>' +
        '<p><i class="fa fa-phone"></i> <a href="tel:+918765043591">+91 87660 43591</a></p>' +
        '<p><i class="fa fa-envelope"></i> <a href="mailto:infouraviholidays@gmail.com">infouraviholidays@gmail.com</a></p>' +
        '<p><i class="fa fa-globe"></i> URAVIHolidays.in</p></div>' +
      '<div><h4>Our Services</h4><ul class="footer__list">' +
        '<li><a href="/services.php">Flight Ticket</a></li><li><a href="/services.php">Railway Ticket</a></li><li><a href="/india-tour-packages.php">Tour Package</a></li>' +
        '<li><a href="/services.php">Passport Assistance</a></li><li><a href="/services.php">Visa Services</a></li><li><a href="/services.php">Travel Insurance</a></li></ul></div>' +
      '<div><h4>Find Us</h4>' +
        '<iframe title="Uravi Holidays on Google Maps" src="https://www.google.com/maps?q=Imperial+Plaza,+Trenton+Business+Centre,+Somwar+Bazar+Road,+Bardi,+Nagpur&output=embed" width="100%" height="180" style="border:0" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>' +
        '<p><a href="' + MAPS + '" target="_blank" rel="noopener">Open in Google Maps</a></p></div>' +
    '</div>' +
    '<div class="copyright"><div class="container"><p>© <span id="year">2026</span> Uravi Holidays. All rights reserved.</p></div></div>' +
    '</footer>' +
    '<a class="whatsapp" href="' + WA + 'Hi" target="_blank" rel="noopener" aria-label="Chat on WhatsApp"><i class="fa fa-whatsapp"></i></a>';

  function mountLayout() {
    var h = $('#site-header'), f = $('#site-footer');
    if (h) h.outerHTML = HEADER;
    if (f) f.outerHTML = FOOTER;
    var file = currentFile();
    var active = /^odt-/.test(file) ? 'main-one-day-tour.php' : file;
    $$('.nav__link[data-file]').forEach(function (a) { if (a.getAttribute('data-file') === active) a.classList.add('is-active'); });
    var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
    initNav();
    loadMenus();
  }

  function renderMenu(target, groups, allHref) {
    target.innerHTML = groups.map(function (g) {
      return '<div><h4>' + esc(g.title) + '</h4>' + g.links.map(function (l) { return '<a href="/' + esc(l[1]) + '">' + esc(l[0]) + '</a>'; }).join('') + '</div>';
    }).join('') + '<div class="mega__all"><a href="' + allHref + '"><strong>View all packages <i class="fa fa-angle-right"></i></strong></a></div>';
  }
  function loadMenus() {
    var cached = null;
    try { cached = JSON.parse(sessionStorage.getItem('uh-menus')); } catch (e) {}
    function paint(m) { renderMenu($('#megaIndia'), m.india, '/india-tour-packages.php'); renderMenu($('#megaWorld'), m.world, '/world-tour-packages.php'); }
    if (cached) paint(cached);
    api('/api/menus').then(function (d) { paint(d.menus); try { sessionStorage.setItem('uh-menus', JSON.stringify(d.menus)); } catch (e) {} }).catch(function () {});
  }

  function initNav() {
    var nav = $('#mainNav'), toggle = $('#navToggle');
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
      toggle.querySelector('i').className = open ? 'fa fa-times' : 'fa fa-bars';
    });
    var items = $$('.has-mega');
    function closeMega(except) {
      items.forEach(function (li) { if (li !== except) { li.classList.remove('is-open'); li.querySelector('.nav__link').setAttribute('aria-expanded', 'false'); } });
    }
    items.forEach(function (li) {
      var btn = li.querySelector('.nav__link');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = li.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open);
        closeMega(li);
      });
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.has-mega')) closeMega(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMega(); });
  }

  /* ---------- Cards ---------- */
  function waLink(name) { return WA + encodeURIComponent('Hi, I want details for the ' + name + ' tour.'); }
  function cardHTML(t) {
    var badge = t.score ? t.score.toFixed(1) + ' ★' : t.days + (t.days === 1 ? ' Day' : ' Days');
    var meta = t.kind === 'tour' ? ['Sightseeing', 'Transfer', '1 Day', 'Nagpur'] : [t.days + (t.days === 1 ? ' Day' : ' Days'), t.region].concat(t.highlights.slice(0, 1));
    return '<article class="card">' +
      '<a class="card__img" href="' + esc(t.href) + '"><span class="card__score">' + esc(badge) + '</span>' +
      '<img src="' + esc(t.img) + '" alt="' + esc(t.name) + '" loading="lazy" onerror="this.style.display=\'none\'"></a>' +
      '<div class="card__body"><h3><a href="' + esc(t.href) + '">' + esc(t.name) + '</a></h3>' +
      '<ul class="card__meta">' + meta.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>' +
      '<div class="card__foot"><div class="card__price"><small>Price</small><strong>On request</strong></div>' +
      '<div class="card__actions"><a class="btn btn--sm btn--ghost" href="' + esc(t.href) + '">Details</a> ' +
      '<a class="btn btn--sm" href="' + waLink(t.name) + '" target="_blank" rel="noopener">Get Quote</a></div></div></div></article>';
  }

  function suggestedHTML(list) {
    return list.map(function (s) {
      return '<li><a href="' + esc(s.href) + '"><img src="' + esc(s.img) + '" alt="" loading="lazy"><div><h4>' + esc(s.name.replace(/^Indonesia$/, 'Bali, Indonesia')) + '</h4><span>' + esc(s.tagline) + '</span></div></a></li>';
    }).join('');
  }
  function loadSuggested(target) {
    api('/api/suggested').then(function (l) { target.innerHTML = suggestedHTML(l); }).catch(function () {});
  }

  /* ---------- Sliders / reviews ---------- */
  function stars(r) { var full = Math.floor(r), half = r - full >= .5; return '★★★★★'.slice(0, full) + (half ? '½' : ''); }
  function initSlider(slider) {
    var track = slider.querySelector('.slider__track'), slides = track.children;
    var prev = slider.querySelector('.slider__btn--prev'), next = slider.querySelector('.slider__btn--next'), dotsEl = slider.querySelector('.slider__dots');
    var index = 0;
    function perView() { return window.innerWidth >= 992 ? 3 : 1; }
    function maxIndex() { return Math.max(0, slides.length - perView()); }
    function buildDots() {
      dotsEl.innerHTML = '';
      for (var i = 0; i <= maxIndex(); i++) {
        var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Go to review ' + (i + 1));
        b.addEventListener('click', (function (n) { return function () { go(n); }; })(i));
        dotsEl.appendChild(b);
      }
    }
    function go(n) {
      index = Math.min(Math.max(n, 0), maxIndex());
      track.style.transform = 'translateX(' + (-index * (100 / perView())) + '%)';
      prev.disabled = index === 0; next.disabled = index === maxIndex();
      Array.prototype.forEach.call(dotsEl.children, function (d, i) { d.classList.toggle('is-active', i === index); });
    }
    prev.addEventListener('click', function () { go(index - 1); });
    next.addEventListener('click', function () { go(index + 1); });
    window.addEventListener('resize', function () { buildDots(); go(index); });
    buildDots(); go(0);
  }
  function mountReviews() {
    $$('[data-reviews]').forEach(function (box) {
      api('/api/reviews/' + box.getAttribute('data-reviews')).then(function (list) {
        box.innerHTML = '<button class="slider__btn slider__btn--prev" aria-label="Previous review"><i class="fa fa-angle-left"></i></button>' +
          '<div class="slider__viewport"><div class="slider__track">' +
          list.map(function (r) { return '<article class="review"><h4>' + esc(r.name) + '</h4><div class="stars" aria-label="' + r.rating + ' stars">' + stars(r.rating) + '</div><p>' + esc(r.text) + '</p></article>'; }).join('') +
          '</div></div><button class="slider__btn slider__btn--next" aria-label="Next review"><i class="fa fa-angle-right"></i></button><div class="slider__dots"></div>';
        initSlider(box);
      }).catch(function () { box.innerHTML = '<p style="text-align:center">Reviews are unavailable right now.</p>'; });
    });
  }

  /* ---------- Enquiry form ---------- */
  var FIELD = {
    name: '<label>Full name *<input name="name" type="text" autocomplete="name" required minlength="2" maxlength="80"></label>',
    phone: '<label>Phone / WhatsApp *<input name="phone" type="tel" autocomplete="tel" required inputmode="tel" maxlength="20" placeholder="+91 98765 43210"></label>',
    email: '<label>Email<input name="email" type="email" autocomplete="email" maxlength="120"></label>',
    destination: '<label>Destination<input name="destination" type="text" maxlength="100" placeholder="e.g. Kashmir, Dubai, Goa"></label>',
    travel_date: '<label>Travel date<input name="travel_date" type="date"></label>',
    travelers: '<label>Travellers<input name="travelers" type="number" min="1" max="500" inputmode="numeric" placeholder="e.g. 4"></label>',
    budget: '<label>Budget (per person)<select name="budget"><option value="">Select</option><option>Under ₹10,000</option><option>₹10,000 – ₹25,000</option><option>₹25,000 – ₹50,000</option><option>₹50,000 – ₹1,00,000</option><option>Above ₹1,00,000</option></select></label>',
    message: '<label class="full">Message<textarea name="message" rows="4" maxlength="1000" placeholder="Tell us about your plan"></textarea></label>'
  };
  function enquiryForm(box, o) {
    var fields = o.fields || ['name', 'phone', 'email', 'travel_date', 'travelers', 'message'];
    var today = new Date().toISOString().slice(0, 10);
    box.innerHTML = '<form class="form" novalidate>' + (o.title ? '<h3>' + esc(o.title) + '</h3>' : '') +
      '<div class="form__grid">' + fields.map(function (f) { return FIELD[f]; }).join('') + '</div>' +
      '<div class="hp" aria-hidden="true"><label>Leave empty<input name="website" tabindex="-1" autocomplete="off"></label></div>' +
      '<div class="form__status" role="status" aria-live="polite"></div>' +
      '<button class="btn" type="submit">' + esc(o.submit || 'Send Enquiry') + '</button></form>';
    var form = box.querySelector('form'), status = form.querySelector('.form__status'), btn = form.querySelector('button');
    var d = form.elements.travel_date; if (d) d.min = today;
    function fieldError(name, msg) {
      var el = form.elements[name]; if (!el) return;
      var l = el.closest('label'); l.classList.add('has-error');
      var s = l.querySelector('.err'); if (!s) { s = document.createElement('span'); s.className = 'err'; l.appendChild(s); } s.textContent = msg;
    }
    function clearErrors() { $$('.has-error', form).forEach(function (l) { l.classList.remove('has-error'); var s = l.querySelector('.err'); if (s) s.remove(); }); }
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clearErrors(); status.className = 'form__status'; status.textContent = '';
      var data = { type: o.type || 'contact', package_slug: o.slug || undefined };
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      var bad = false;
      if (!data.name || data.name.trim().length < 2) { fieldError('name', 'Please enter your name.'); bad = true; }
      if (!/^\+?[0-9][0-9\s-]{6,17}$/.test(data.phone || '')) { fieldError('phone', 'Please enter a valid phone number.'); bad = true; }
      if (bad) { status.textContent = 'Please fix the highlighted fields.'; status.className = 'form__status is-error'; return; }
      btn.disabled = true; btn.textContent = 'Sending…';
      api('/api/enquiries', { method: 'POST', body: data }).then(function (r) {
        box.innerHTML = '<div class="form__done"><i class="fa fa-check-circle"></i><h3>Thank you, we got your enquiry!</h3>' +
          '<p>Reference <strong>#' + esc(r.id) + '</strong>. Our team will call you shortly.</p>' +
          (r.whatsapp ? '<a class="btn" href="' + esc(r.whatsapp) + '" target="_blank" rel="noopener"><i class="fa fa-whatsapp"></i> Continue on WhatsApp</a>' : '') + '</div>';
      }).catch(function (err) {
        btn.disabled = false; btn.textContent = o.submit || 'Send Enquiry';
        var errs = err.data && err.data.errors;
        if (errs) Object.keys(errs).forEach(function (k) { fieldError(k, errs[k]); });
        status.textContent = err.status === 429 ? err.message : (errs ? err.message : 'Could not send right now. Please call +91 83290 56457 or use WhatsApp.');
        status.className = 'form__status is-error';
      });
    });
  }

  window.UH = { esc: esc, $: $, $$: $$, api: api, cardHTML: cardHTML, suggestedHTML: suggestedHTML, loadSuggested: loadSuggested,
    enquiryForm: enquiryForm, waLink: waLink, WA: WA, currentFile: currentFile, initSlider: initSlider };

  mountLayout();
  mountReviews();
})();
