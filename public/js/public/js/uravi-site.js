/* Shows the verified Uravi Holidays details in the top bar, footer and WhatsApp button.
   All values come from SITE in data.js (served by /api/menus), so edit them there. */
(function () {
  var site = null, stop = Date.now() + 10000;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function digits(p) { return String(p).replace(/[^\d+]/g, ''); }
  function socials(cls) {
    var s = site.social || {}, out = '';
    if (s.instagram) out += '<a href="' + esc(s.instagram) + '" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa fa-instagram"></i></a>';
    if (s.facebook) out += '<a href="' + esc(s.facebook) + '" target="_blank" rel="noopener" aria-label="Facebook"><i class="fa fa-facebook"></i></a>';
    if (s.whatsapp) out += '<a href="' + esc(s.whatsapp) + '" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fa fa-whatsapp"></i></a>';
    return '<div class="social ' + (cls || '') + '">' + out + '</div>';
  }
  function topbar() {
    var t = document.querySelector('.topbar');
    if (!t || t.getAttribute('data-uravi')) return;
    t.setAttribute('data-uravi', '1');
    t.innerHTML = '<div class="container topbar__inner"><div class="topbar__info">' +
      '<a href="tel:' + esc(digits(site.phone)) + '"><i class="fa fa-phone"></i> ' + esc(site.phone) + '</a>' +
      '<a href="mailto:' + esc(site.email) + '"><i class="fa fa-envelope"></i> ' + esc(site.email) + '</a></div>' + socials('') + '</div>';
  }
  function footer() {
    var f = document.getElementById('site-footer');
    if (!f || f.querySelector('[data-uravi-footer]')) return;
    var a = site.address || {}, ph = (site.phones || [site.phone]).map(function (p) {
      return '<a href="tel:' + esc(digits(p)) + '">' + esc(p) + '</a>';
    }).join('<br>');
    var links = [['Home', '/index.php'], ['India Tours', '/india-tour-packages.php'], ['World Tours', '/world-tour-packages.php'],
      ['Jungle Safari', '/main-jungle-safari.php'], ['Day Tours from Nagpur', '/main-one-day-tour.php'],
      ['Customized Holidays', '/customized-holidays.php'], ['Corporate Travel', '/corporate-travel.php'],
      ['Contact Us', '/contact.php'], ['Privacy Policy', '/privacy-policy.php']];
    f.innerHTML = '<footer class="footer" data-uravi-footer><div class="container footer__grid">' +
      '<div><h4>' + esc(site.name) + '</h4><p>' + esc(site.tagline) + '</p><p><em>' + esc(site.slogan) + '</em></p>' + socials('social--footer') + '</div>' +
      '<div><h4>Quick Links</h4>' + links.map(function (l) { return '<p><a href="' + l[1] + '">' + l[0] + '</a></p>'; }).join('') + '</div>' +
      '<div><h4>Our Services</h4>' + (site.services || []).map(function (s) { return '<p>' + esc(s) + '</p>'; }).join('') + '</div>' +
      '<div><h4>Contact</h4>' +
      '<p><i class="fa fa-map-marker"></i> ' + esc(a.full || '') + (site.mapUrl ? '<br><a href="' + esc(site.mapUrl) + '" target="_blank" rel="noopener">Open in Google Maps</a>' : '') + '</p>' +
      '<p><i class="fa fa-phone"></i> ' + ph + '</p>' +
      '<p><i class="fa fa-envelope"></i> <a href="mailto:' + esc(site.email) + '">' + esc(site.email) + '</a></p>' +
      '<p><i class="fa fa-globe"></i> ' + esc(site.website) + '</p></div>' +
      '</div><div class="copyright"><p>&copy; ' + new Date().getFullYear() + ' ' + esc(site.name) + '. All rights reserved.</p></div></footer>';
  }
  function whatsapp() {
    document.querySelectorAll('a.whatsapp').forEach(function (a) {
      a.href = 'https://api.whatsapp.com/send?phone=' + site.whatsapp + '&text=Hi';
    });
  }
  function logo() { document.querySelectorAll('.logo img').forEach(function (i) { i.alt = site.name; }); }
  function run() { if (!site) return; topbar(); footer(); whatsapp(); logo(); }

  fetch('/api/menus').then(function (r) { return r.json(); }).then(function (d) {
    site = d.site; run();
    new MutationObserver(function (_, o) { if (Date.now() > stop) return o.disconnect(); run(); })
      .observe(document.body, { childList: true, subtree: true });
  }).catch(function () { /* keep whatever common.js drew */ });
})();
