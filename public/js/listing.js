(function () {
  'use strict';
  var A = window.UH, file = A.currentFile().toLowerCase();
  var cardsEl = A.$('#tourCards'), all = [], region = 'All', text = '';

  function paint() {
    var list = all.filter(function (t) {
      return (region === 'All' || t.region === region) && (!text || (t.name + ' ' + t.region + ' ' + t.highlights.join(' ')).toLowerCase().indexOf(text) >= 0);
    });
    cardsEl.innerHTML = list.length ? list.map(A.cardHTML).join('') : '<p class="empty">No packages match. <a href="/customized-holidays.php">Ask us for a custom plan</a>.</p>';
  }
  function setHeader(title, tag, txt) {
    document.title = title + ' | Uravi Holidays';
    A.$('#pageH1').textContent = title; A.$('#introTitle').textContent = title;
    A.$('#introTag').textContent = tag || ''; A.$('#introText').textContent = txt || '';
    A.$('#crumbs').innerHTML = '<li><a href="/index.php">Home</a></li><li aria-current="page">' + A.esc(title) + '</li>';
  }
  function showFilters(items) {
    var regs = []; items.forEach(function (t) { if (regs.indexOf(t.region) < 0) regs.push(t.region); });
    A.$('#toolbar').hidden = false;
    var chips = A.$('#chips');
    chips.innerHTML = ['All'].concat(regs).map(function (r) { return '<button type="button" class="chip' + (r === 'All' ? ' is-active' : '') + '" data-r="' + A.esc(r) + '">' + A.esc(r) + '</button>'; }).join('');
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      region = b.getAttribute('data-r');
      A.$$('.chip', chips).forEach(function (c) { c.classList.toggle('is-active', c === b); });
      paint();
    });
    A.$('#filterBox').addEventListener('input', function (e) { text = e.target.value.trim().toLowerCase(); paint(); });
  }

  A.loadSuggested(A.$('#suggest'));

  var req;
  if (file === 'search.php') {
    var q = new URLSearchParams(location.search).get('q') || '';
    setHeader('Search results', q ? 'Showing results for “' + q + '”' : 'Type a destination to search', '');
    req = A.api('/api/search?q=' + encodeURIComponent(q)).then(function (d) { return { items: d.items, filters: false }; });
  } else {
    req = A.api('/api/listing/' + encodeURIComponent(file)).then(function (d) { setHeader(d.title, d.tag, d.text); return d; });
  }
  req.then(function (d) { all = d.items; if (d.filters) showFilters(all); paint(); })
    .catch(function () { cardsEl.innerHTML = '<p class="empty">Could not load packages. Please refresh or call +91 83290 56457.</p>'; });
})();
