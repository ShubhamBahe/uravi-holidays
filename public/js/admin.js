(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function api(url, method, body) {
    var init = { method: method || 'GET', credentials: 'same-origin', headers: { 'X-Requested-With': 'fetch' } };
    if (body) { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(body); }
    return fetch(url, init).then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) { var e = new Error(d.error || 'Error'); e.status = r.status; throw e; } return d; }); });
  }
  var page = 1, limit = 25, total = 0, timer;

  function show(signedIn) { $('#loginBox').hidden = signedIn; $('#panel').hidden = !signedIn; if (signedIn) { load(); } }

  function load() {
    api('/api/admin/stats').then(function (s) {
      $('#stats').innerHTML = ['total', 'new', 'contacted', 'booked', 'closed'].map(function (k) { return '<div class="stat"><strong>' + (s[k] || 0) + '</strong><span>' + k + '</span></div>'; }).join('');
    }).catch(authFail);
    var qs = '?page=' + page + '&limit=' + limit + '&q=' + encodeURIComponent($('#aq').value.trim()) + '&status=' + encodeURIComponent($('#astatus').value);
    api('/api/admin/enquiries' + qs).then(function (d) {
      total = d.total;
      $('#rows').innerHTML = d.rows.length ? d.rows.map(row).join('') : '<tr><td colspan="8" class="empty">No enquiries yet.</td></tr>';
      var pages = Math.max(1, Math.ceil(total / limit));
      $('#pageInfo').textContent = 'Page ' + page + ' of ' + pages + ' (' + total + ')';
      $('#prev').disabled = page <= 1; $('#next').disabled = page >= pages;
    }).catch(authFail);
  }
  function authFail(e) { if (e.status === 401) show(false); }
  function row(r) {
    var when = new Date(r.created_at).toLocaleString();
    var wa = 'https://api.whatsapp.com/send?phone=' + String(r.phone).replace(/[^0-9]/g, '').replace(/^(\d{10})$/, '91$1');
    var details = [r.travel_date && ('Date: ' + r.travel_date), r.travelers && ('Pax: ' + r.travelers), r.budget && ('Budget: ' + r.budget), r.message].filter(Boolean).map(esc).join('<br>');
    return '<tr data-id="' + r.id + '"><td>' + r.id + '</td><td>' + esc(when) + '</td><td><strong>' + esc(r.name) + '</strong><br><small>' + esc(r.type) + '</small></td>' +
      '<td><a href="tel:' + esc(r.phone) + '">' + esc(r.phone) + '</a>' + (r.email ? '<br><a href="mailto:' + esc(r.email) + '">' + esc(r.email) + '</a>' : '') + '<br><a href="' + esc(wa) + '" target="_blank" rel="noopener">WhatsApp</a></td>' +
      '<td>' + esc(r.package_name || '—') + '</td><td class="details">' + (details || '—') + '</td>' +
      '<td><select class="st" aria-label="Status">' + ['new', 'contacted', 'booked', 'closed'].map(function (s) { return '<option' + (s === r.status ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></td>' +
      '<td><button class="btn btn--sm btn--red del" type="button">Delete</button></td></tr>';
  }

  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var st = $('#loginStatus'); st.textContent = '';
    api('/api/admin/login', 'POST', { password: e.target.elements.password.value }).then(function () { e.target.reset(); show(true); })
      .catch(function (err) { st.textContent = err.message; st.className = 'form__status is-error'; });
  });
  $('#logout').addEventListener('click', function () { api('/api/admin/logout', 'POST', {}).then(function () { show(false); }); });
  $('#rows').addEventListener('change', function (e) {
    if (!e.target.classList.contains('st')) return;
    var id = e.target.closest('tr').getAttribute('data-id');
    api('/api/admin/enquiries/' + id, 'PATCH', { status: e.target.value }).then(load).catch(function (err) { alert(err.message); load(); });
  });
  $('#rows').addEventListener('click', function (e) {
    if (!e.target.classList.contains('del')) return;
    var id = e.target.closest('tr').getAttribute('data-id');
    if (confirm('Delete enquiry #' + id + '? This cannot be undone.')) api('/api/admin/enquiries/' + id, 'DELETE').then(load).catch(function (err) { alert(err.message); });
  });
  $('#aq').addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { page = 1; load(); }, 250); });
  $('#astatus').addEventListener('change', function () { page = 1; load(); });
  $('#prev').addEventListener('click', function () { page--; load(); });
  $('#next').addEventListener('click', function () { page++; load(); });

  api('/api/admin/me').then(function () { show(true); }).catch(function () { show(false); });
})();
