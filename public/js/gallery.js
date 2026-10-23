(function () {
  'use strict';
  var A = window.UH, grid = A.$('#gGrid'), all = [], region = 'All';
  var lb = A.$('#lb'), lbImg = A.$('#lbImg'), lbCap = A.$('#lbCap');

  function paint() {
    var list = all.filter(function (p) { return region === 'All' || p.region === region; });
    grid.innerHTML = list.length ? list.map(function (p, i) {
      return '<figure class="gallery__item"><button type="button" data-i="' + i + '" aria-label="View ' + A.esc(p.name) + '">' +
        '<img src="' + A.esc(p.img) + '" alt="' + A.esc(p.name) + '" loading="lazy"></button><figcaption>' + A.esc(p.name) + '</figcaption></figure>';
    }).join('') : '<p class="empty">No photos yet.</p>';
    grid._list = list;
  }
  grid.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-i]'); if (!b) return;
    var p = grid._list[+b.getAttribute('data-i')];
    lbImg.src = p.img; lbImg.alt = p.name; lbCap.innerHTML = '<a href="' + A.esc(p.href) + '">' + A.esc(p.name) + ' &rarr; view package</a>';
    lb.hidden = false; document.body.style.overflow = 'hidden';
  });
  function close() { lb.hidden = true; lbImg.src = ''; document.body.style.overflow = ''; }
  A.$('#lbX').addEventListener('click', close);
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) close(); });

  A.api('/api/gallery').then(function (d) {
    all = d.photos;
    var regs = []; all.forEach(function (p) { if (regs.indexOf(p.region) < 0) regs.push(p.region); });
    if (regs.length > 1) {
      A.$('#gTools').hidden = false;
      var chips = A.$('#gChips');
      chips.innerHTML = ['All'].concat(regs).map(function (r) { return '<button type="button" class="chip' + (r === 'All' ? ' is-active' : '') + '" data-r="' + A.esc(r) + '">' + A.esc(r) + '</button>'; }).join('');
      chips.addEventListener('click', function (e) {
        var b = e.target.closest('.chip'); if (!b) return;
        region = b.getAttribute('data-r');
        A.$$('.chip', chips).forEach(function (c) { c.classList.toggle('is-active', c === b); });
        paint();
      });
    }
    paint();
  }).catch(function () { grid.innerHTML = '<p class="empty">Could not load the gallery. Please refresh.</p>'; });
})();
