(function () {
  'use strict';

  /* Everything on the site (destinations, phones, address, services) comes from the admin panel via api.php. */
  var S = {}, places = [], PHONE_WA = '', PHONES = [], BUSINESS = 'Uravi Holidays';
  var TAGS = { nagpur: 'From Nagpur', india: 'India', world: 'International' };
  var SERVICE_ICONS = ['fa-plane', 'fa-train', 'fa-suitcase', 'fa-id-card-o', 'fa-globe', 'fa-shield'];

  /* ================= Helpers ================= */
  var $ = function (id) { return document.getElementById(id); };
  var page = document.body.getAttribute('data-page');
  var params = new URLSearchParams(location.search);

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function wa(text) { return 'https://api.whatsapp.com/send?phone=' + PHONE_WA + '&text=' + encodeURIComponent(text); }
  function find(id) { return places.filter(function (p) { return p.id === id; })[0]; }
  function lines(t) { return String(t || '').split(/\r?\n/).filter(Boolean); }
  function photo(p, cls) {
    return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="images/' + esc(p.img) + '"' + (p.fallback ? ' data-fallback="' + esc(p.fallback) + '"' : '') + ' alt="' + esc(p.name) + '" loading="lazy">';
  }
  function quoteLink(p) {
    return wa('Hi ' + BUSINESS + ', I want details and a quote for the ' + p.name + ' tour.');
  }
  function card(p) {
    return '<article class="card">' +
      '<a class="card__img" href="destination.html?p=' + encodeURIComponent(p.id) + '" data-name="' + esc(p.name) + '">' +
        '<span class="card__tag">' + TAGS[p.type] + '</span>' + photo(p) +
      '</a>' +
      '<div class="card__body">' +
        '<h3><a href="destination.html?p=' + encodeURIComponent(p.id) + '">' + esc(p.name) + '</a></h3>' +
        '<p>' + esc(p.text) + '</p>' +
        '<div class="card__foot">' +
          '<span class="card__days"><i class="fa fa-clock-o"></i>' + esc(p.days) + '</span>' +
          '<a class="btn btn--sm" href="' + quoteLink(p) + '" target="_blank" rel="noopener">Get Quote</a>' +
        '</div>' +
      '</div></article>';
  }
  function banner(p, title, sub) {
    var bg = p ? '<div class="banner__bg">' + photo(p) + '</div>' : '';
    return bg + '<div class="container banner__text"><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>';
  }
  function cards(list) { return list.map(card).join('') || '<p class="note">No trips to show yet.</p>'; }

  /* Image fallback: uploaded/local file -> illustration -> gradient */
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (img.tagName !== 'IMG') return;
    var fb = img.getAttribute('data-fallback');
    if (fb) { img.removeAttribute('data-fallback'); img.src = fb; }
    else { img.style.display = 'none'; }
  }, true);

  /* ================= Load data, then build the page ================= */
  fetch('api.php?action=bootstrap', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('bad response'); return r.json(); })
    .then(function (d) {
      S = d.settings || {}; places = d.places || [];
      BUSINESS = S.business || BUSINESS;
      PHONE_WA = S.whatsapp || '';
      PHONES = [S.phone1, S.phone2].filter(Boolean).map(function (n) { return [n, n.replace(/[^0-9+]/g, '')]; });
      shell();
      if (pages[page]) pages[page]();
    })
    .catch(function () {
      var m = document.querySelector('main');
      if (m) m.innerHTML = '<div class="container section"><h2>We could not load this page.</h2><p>Please refresh, or call us directly.</p></div>';
    });

  /* ================= Shared header, footer, WhatsApp ================= */
  function shell() {
    var nav = [['home', 'index.html', 'Home'], ['destinations', 'destinations.html', 'Destinations'], ['contact', 'contact.html', 'Contact']];
    var phoneLinks = PHONES.map(function (p) { return '<a href="tel:' + p[1] + '"><i class="fa fa-phone"></i> ' + esc(p[0]) + '</a>'; }).join('');
    var addr = lines(S.address).map(esc).join('<br>');

    $('site-header').innerHTML =
      '<div class="topbar"><div class="container topbar__inner"><span>' + esc(S.tagline || '') + '</span><span class="topbar__phones">' + phoneLinks + '</span></div></div>' +
      '<header class="header"><div class="container header__inner">' +
        '<a class="wordmark" href="index.html" aria-label="' + esc(BUSINESS) + '"><b>URAVI</b><span>Holidays</span></a>' +
        '<button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="mainNav"><i class="fa fa-bars"></i></button>' +
        '<nav class="nav" id="mainNav" aria-label="Main">' +
          nav.map(function (n) { return '<a href="' + n[1] + '"' + (n[0] === page || (page === 'destination' && n[0] === 'destinations') ? ' class="is-active" aria-current="page"' : '') + '>' + n[2] + '</a>'; }).join('') +
          '<a class="btn btn--sm" href="' + wa('Hi ' + BUSINESS + ', I want a tour quote.') + '" target="_blank" rel="noopener">Get Quote</a>' +
        '</nav></div></header>';

    $('site-footer').innerHTML =
      '<footer class="footer"><div class="container footer__grid">' +
        '<div><a class="wordmark wordmark--light" href="index.html"><b>URAVI</b><span>Holidays</span></a><p>' + esc(S.slogan || S.tagline || '') + '</p>' +
          (S.website ? '<p><i class="fa fa-globe"></i> ' + esc(S.website) + '</p>' : '') + '</div>' +
        '<div><h4>Explore</h4>' + nav.map(function (n) { return '<a href="' + n[1] + '">' + n[2] + '</a>'; }).join('') + '</div>' +
        '<div><h4>Talk to us</h4><p>' + esc(S.consultant_name || '') + '<br>' + esc(S.consultant_title || '') + '</p>' + phoneLinks +
          (S.email ? '<a href="mailto:' + esc(S.email) + '"><i class="fa fa-envelope"></i> ' + esc(S.email) + '</a>' : '') +
          (addr ? '<p class="footer__addr"><i class="fa fa-map-marker"></i> ' + addr + '</p>' : '') + '</div>' +
      '</div><div class="copyright">&copy; ' + new Date().getFullYear() + ' ' + esc(BUSINESS) + '. All rights reserved.</div></footer>' +
      '<a class="whatsapp" href="' + wa('Hi ' + BUSINESS + ', I need help planning a trip.') + '" target="_blank" rel="noopener" aria-label="Chat on WhatsApp"><i class="fa fa-whatsapp"></i></a>';

    var navEl = $('mainNav'), toggle = $('navToggle');
    function setNav(open) {
      navEl.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open);
      toggle.querySelector('i').className = open ? 'fa fa-times' : 'fa fa-bars';
    }
    toggle.addEventListener('click', function () { setNav(!navEl.classList.contains('is-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });
  }

  /* ================= Pages ================= */
  var pages = {

    home: function () {
      var heroes = places.filter(function (p) { return p.hero; });
      if (!heroes.length) heroes = places.slice(0, 3);
      var slides = $('heroSlides'), caption = $('heroCaption');
      slides.innerHTML = heroes.map(function (p, i) {
        return '<img class="' + (i === 0 ? 'is-on' : '') + '" src="images/' + esc(p.img) + '" data-fallback="' + esc(p.fallback) + '" alt="' + esc(p.name) + '">';
      }).join('');
      var imgs = slides.querySelectorAll('img'), cur = 0;
      function show(i) {
        cur = i;
        imgs.forEach(function (im, n) { im.classList.toggle('is-on', n === i); });
        var p = heroes[i];
        caption.innerHTML = p ? 'Now showing: <a href="destination.html?p=' + encodeURIComponent(p.id) + '">' + esc(p.name) + '</a>' : '';
      }
      show(0);
      if (heroes.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setInterval(function () { show((cur + 1) % heroes.length); }, 6000);
      }

      var services = lines(S.services);
      $('services').innerHTML = services.map(function (s, i) {
        return '<li><i class="fa ' + SERVICE_ICONS[i % SERVICE_ICONS.length] + '"></i><span>' + esc(s) + '</span></li>';
      }).join('');
      $('servicesBox').hidden = !services.length;

      $('nagpurTrips').innerHTML = cards(places.filter(function (p) { return p.type === 'nagpur'; }).slice(0, 4));
      var featured = places.filter(function (p) { return p.featured; }).slice(0, 8);
      $('featured').innerHTML = cards(featured.length ? featured : places.slice(0, 4));
    },

    destinations: function () {
      $('banner').innerHTML = banner(places[0], 'All destinations', 'Pick a place to see highlights and a day-wise plan.');
      var list = $('cards'), filter = TAGS[params.get('type')] ? params.get('type') : 'all';
      function render() {
        document.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('is-active', c.getAttribute('data-filter') === filter); });
        list.innerHTML = cards(places.filter(function (p) { return filter === 'all' || p.type === filter; }));
      }
      $('filters').addEventListener('click', function (e) {
        var chip = e.target.closest('.chip');
        if (!chip) return;
        filter = chip.getAttribute('data-filter');
        render();
      });
      render();
    },

    destination: function () {
      var p = find(params.get('p'));
      var box = $('detail');
      if (!p) {
        $('banner').innerHTML = '<div class="container banner__text"><h1>Destination not found</h1></div>';
        box.innerHTML = '<div class="container"><p>We could not find that destination. <a class="link" href="destinations.html">See all destinations</a>.</p></div>';
        return;
      }
      document.title = p.name + ' Tour Package | ' + BUSINESS;
      $('banner').innerHTML = banner(p, esc(p.name),
        (p.days ? '<span class="pill"><i class="fa fa-clock-o"></i> ' + esc(p.days) + '</span>' : '') +
        (p.dist ? '<span class="pill"><i class="fa fa-map-marker"></i> ' + esc(p.dist) + ' from Nagpur</span>' : '') +
        (p.best ? '<span class="pill"><i class="fa fa-sun-o"></i> Best time: ' + esc(p.best) + '</span>' : ''));
      var others = places.filter(function (x) { return x.id !== p.id && x.type === p.type; }).slice(0, 3);
      box.innerHTML =
        '<div class="container detail">' +
          '<div class="detail__main">' +
            (p.highlights.length ? '<h2>Trip highlights</h2><ul class="ticks">' + p.highlights.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul>' : '') +
            (p.plan.length ? '<h2>Sample plan</h2><ol class="days">' + p.plan.map(function (d, i) { return '<li><b>Day ' + (i + 1) + '</b><span>' + esc(d) + '</span></li>'; }).join('') + '</ol>' : '') +
            '<p class="note">This is a sample plan. We change days, hotels and budget to suit you.</p>' +
          '</div>' +
          '<aside class="quote">' +
            '<h3>Plan this trip</h3><p>' + esc(p.text) + '</p>' +
            '<a class="btn" href="' + quoteLink(p) + '" target="_blank" rel="noopener">Get Quote on WhatsApp</a>' +
            '<a class="btn btn--outline" href="contact.html?p=' + encodeURIComponent(p.id) + '">Send enquiry</a>' +
            (PHONES[0] ? '<a class="quote__call" href="tel:' + PHONES[0][1] + '"><i class="fa fa-phone"></i> ' + esc(PHONES[0][0]) + '</a>' : '') +
          '</aside>' +
        '</div>' +
        (others.length ? '<div class="container more"><h2>More ' + (p.type === 'nagpur' ? 'trips from Nagpur' : p.type === 'india' ? 'India trips' : 'international trips') + '</h2><div class="cards">' + others.map(card).join('') + '</div></div>' : '');
    },

    contact: function () {
      var pick = find('dubai') || places[0];
      $('banner').innerHTML = banner(pick, 'Plan your trip', 'Send your details and we reply on WhatsApp with a plan and price.');

      var addr = lines(S.address).map(esc).join('<br>');
      $('contactInfo').innerHTML =
        '<div class="consultant"><i class="fa fa-user-circle"></i><div><strong>' + esc(S.consultant_name || '') + '</strong><span>' + esc(S.consultant_title || '') + '</span></div></div>' +
        PHONES.map(function (p) { return '<p><a class="contact__line" href="tel:' + p[1] + '"><i class="fa fa-phone"></i> ' + esc(p[0]) + '</a></p>'; }).join('') +
        (S.email ? '<p><a class="contact__line" href="mailto:' + esc(S.email) + '"><i class="fa fa-envelope"></i> ' + esc(S.email) + '</a></p>' : '') +
        (S.website ? '<p><span class="contact__line"><i class="fa fa-globe"></i> ' + esc(S.website) + '</span></p>' : '') +
        (addr ? '<p class="contact__line contact__addr"><i class="fa fa-map-marker"></i><span>' + addr + '</span></p>' : '') +
        '<p class="note">' + esc(BUSINESS) + ' plans domestic and international holidays: ' + esc(lines(S.services).join(', ').toLowerCase()) + '.</p>';

      var sel = $('fPlace');
      sel.innerHTML = ['nagpur', 'india', 'world'].map(function (t) {
        return '<optgroup label="' + TAGS[t] + '">' + places.filter(function (p) { return p.type === t; }).map(function (p) {
          return '<option value="' + esc(p.id) + '">' + esc(p.name) + '</option>';
        }).join('') + '</optgroup>';
      }).join('') + '<option value="">Other / Not sure yet</option>';
      if (find(params.get('p'))) sel.value = params.get('p');

      $('enquiry').addEventListener('submit', function (e) {
        e.preventDefault();
        var name = $('fName'), msg = $('formMsg'), people = parseInt($('fPeople').value, 10);
        name.classList.remove('is-error');
        if (!name.value.trim()) { name.classList.add('is-error'); msg.textContent = 'Please enter your name.'; name.focus(); return; }
        if (!people || people < 1) { msg.textContent = 'Enter at least 1 traveller.'; $('fPeople').focus(); return; }
        msg.textContent = '';
        var where = sel.value ? find(sel.value).name : 'a destination I have not decided yet';
        var phone = $('fPhone').value.trim();
        var text = 'Hi ' + BUSINESS + ', my name is ' + name.value.trim() + '. I want to travel to ' + where +
          ' in ' + ($('fMonth').value || 'a month not decided') + ' with ' + people + ' traveller(s).' +
          (phone ? ' My number: ' + phone + '.' : '') + ' Please share a plan and price.';
        /* Save the enquiry in the admin panel, then open WhatsApp. WhatsApp opens even if saving fails. */
        fetch('api.php?action=enquiry', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
          body: JSON.stringify({ name: name.value.trim(), phone: phone, place: sel.value, month: $('fMonth').value, people: people, website: $('fWebsite').value })
        }).catch(function () {});
        window.open(wa(text), '_blank', 'noopener');
      });
    }
  };
})();
