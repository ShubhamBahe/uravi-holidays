(function () {
  'use strict';
  var A = window.UH, esc = A.esc, root = A.$('#detail');
  var file = A.currentFile();
  var listFor = { tour: ['/main-one-day-tour.php', 'Nagpur Special Tours'], safari: ['/main-jungle-safari.php', 'Jungle Safari'] };

  A.api('/api/page/' + encodeURIComponent(file)).then(function (d) {
    var it = d.item;
    document.title = it.name + ' | Uravi Holidays';
    var md = document.querySelector('meta[name=description]'); if (md) md.content = it.name + ' - ' + it.tagline;
    A.$('#pageH1').textContent = it.name;
    var parent = listFor[it.kind] || (it.scope === 'world' ? ['/world-tour-packages.php', 'International Tours'] : ['/india-tour-packages.php', 'Domestic Tours']);
    A.$('#crumbs').innerHTML = '<li><a href="/index.php">Home</a></li><li><a href="' + parent[0] + '">' + parent[1] + '</a></li><li aria-current="page">' + esc(it.name) + '</li>';

    root.innerHTML =
      '<div class="detail__main">' +
        '<img class="detail__hero" src="' + esc(it.img) + '" alt="' + esc(it.name) + '">' +
        '<ul class="card__meta detail__meta"><li><i class="fa fa-clock-o"></i> ' + esc(it.duration) + '</li><li><i class="fa fa-map-marker"></i> ' + esc(it.region) + '</li>' +
          (it.score ? '<li>' + it.score.toFixed(1) + ' ★ rated</li>' : '') + '<li>Price on request</li></ul>' +
        '<h2>Overview</h2><p>' + esc(it.tagline) + '</p>' +
        '<h2>Highlights</h2><ul class="ticks">' + it.highlights.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul>' +
        '<h2>Itinerary</h2>' + (d.sampleNote ? '<p class="note">' + esc(d.sampleNote) + '</p>' : '') +
        '<div class="acc">' + d.itinerary.map(function (s, i) {
          return '<details' + (i === 0 ? ' open' : '') + '><summary><span class="acc__day">' + esc(s.day) + '</span> ' + esc(s.title) + '</summary><p>' + esc(s.text) + '</p></details>';
        }).join('') + '</div>' +
        '<div class="two-col"><div><h2>Inclusions</h2><ul class="ticks">' + d.inclusions.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
        '<div><h2>Exclusions</h2><ul class="crosses">' + d.exclusions.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div>' +
      '</div>' +
      '<aside class="detail__side"><div class="side-card" id="enqBox"></div>' +
        '<a class="btn btn--wa" href="' + A.waLink(it.name) + '" target="_blank" rel="noopener"><i class="fa fa-whatsapp"></i> Chat on WhatsApp</a>' +
        '<a class="btn btn--ghost" href="tel:+918329056457"><i class="fa fa-phone"></i> Call +91 83290 56457</a></aside>';

    var type = it.kind === 'tour' ? 'tour' : it.kind === 'safari' ? 'safari' : 'package';
    A.enquiryForm(A.$('#enqBox'), { type: type, slug: it.slug, title: 'Enquire about ' + it.name, submit: 'Get a Free Quote' });

    if (d.related.length) {
      var sec = document.createElement('section');
      sec.className = 'container related';
      sec.innerHTML = '<h2 class="section-title">You may also like</h2><div class="cards">' + d.related.map(A.cardHTML).join('') + '</div>';
      root.parentNode.insertBefore(sec, root.nextSibling);
    }
  }).catch(function () {
    root.innerHTML = '<p class="empty">We could not load this package. <a href="/index.php">Back to home</a></p>';
  });
})();
