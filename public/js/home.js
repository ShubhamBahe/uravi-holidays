(function () {
  'use strict';
  var A = window.UH;
  A.api('/api/featured').then(function (d) {
    A.$('#homeTours').innerHTML = d.tours.map(A.cardHTML).join('');
    A.$('#homeDest').innerHTML = d.destinations.map(A.cardHTML).join('');
  }).catch(function () {});
  A.enquiryForm(A.$('#homeForm'), { type: 'quick', title: 'Request a call back', fields: ['name', 'phone', 'destination', 'travel_date', 'message'], submit: 'Call me back' });

  /* live search */
  var form = A.$('#searchForm'), input = A.$('#q'), box = A.$('#results'), timer;
  function hide() { box.hidden = true; box.innerHTML = ''; }
  input.addEventListener('input', function () {
    clearTimeout(timer);
    var v = input.value.trim();
    if (v.length < 2) return hide();
    timer = setTimeout(function () {
      A.api('/api/search?q=' + encodeURIComponent(v)).then(function (d) {
        if (input.value.trim() !== v) return;
        if (!d.items.length) { box.innerHTML = '<li class="none">No match. <a href="/customized-holidays.php">Ask for a custom plan</a></li>'; box.hidden = false; return; }
        box.innerHTML = d.items.slice(0, 6).map(function (t) {
          return '<li><a href="' + A.esc(t.href) + '"><img src="' + A.esc(t.img) + '" alt=""><span>' + A.esc(t.name) + '<small>' + A.esc(t.region) + ' · ' + t.days + (t.days === 1 ? ' day' : ' days') + '</small></span></a></li>';
        }).join('');
        box.hidden = false;
      }).catch(hide);
    }, 200);
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('#searchForm')) hide(); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim(); if (v) location.href = '/search.php?q=' + encodeURIComponent(v);
  });
})();
