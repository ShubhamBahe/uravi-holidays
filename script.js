(function () {
  'use strict';

  /* ================= Settings: edit these ================= */
  var BUSINESS = 'Uravi Holidays';
  var PHONE_WA = '918329056457';
  var PHONES = [['+91 83290 56457', '+918329056457'], ['+91 87660 43591', '+918766043591']];

  /* Destinations. Add a line with add(...) to create a new one.
     type: 'nagpur' (trips from Nagpur), 'india' or 'world'.
     Images: each place has an illustration at images/<id>.svg. To use a real photo, save it as images/<id>.jpg
     (e.g. images/goa.jpg); it is shown automatically instead of the illustration. */
  var places = [];
  function add(id, name, type, days, best, text, highlights, plan, dist) {
    places.push({ id: id, name: name, type: type, days: days, best: best, text: text, dist: dist || '',
      img: id + '.jpg', fallback: 'images/' + id + '.svg',
      highlights: highlights, plan: plan });
  }

  /* ---- From Nagpur ---- */
  add('nagpur-city', 'Nagpur City Tour', 'nagpur', '1 Day', 'Oct to Feb', 'Deekshabhoomi, Futala Lake, Zero Mile and the old fort.',
    ['Deekshabhoomi stupa', 'Futala Lake evening', 'Zero Mile Stone and Sitabuldi Fort', 'Orange city street food'],
    ['Morning at Deekshabhoomi and Ambazari', 'Lunch, then Zero Mile and Sitabuldi Fort', 'Evening at Futala Lake'], 'In the city');
  add('ramtek', 'Ramtek', 'nagpur', '1 Day', 'Jul to Feb', 'Hilltop temple, lake views and Kalidas memorial.',
    ['Ramtek Gad Mandir hilltop temple', 'Kalidas Smarak', 'Khindsi Lake boating', 'Monsoon greenery'],
    ['Leave Nagpur early, reach Ramtek temple', 'Kalidas Smarak and Ambala Lake', 'Khindsi Lake boating, return by evening'], 'About 50 km');
  add('pench', 'Pench Tiger Reserve', 'nagpur', '2 Nights / 3 Days', 'Oct to Jun', 'Jeep safari in the Jungle Book forest.',
    ['Morning and evening jeep safaris', 'Tiger, leopard, sambar and gaur sightings', 'Turia gate and Pench river', 'Jungle resort stay'],
    ['Drive to Pench, check in, evening safari', 'Morning and evening safari', 'Morning safari, return to Nagpur'], 'About 90 km');
  add('tadoba', 'Tadoba Safari', 'nagpur', '2 Nights / 3 Days', 'Oct to Jun', 'Maharashtra\u2019s best known tiger reserve.',
    ['Moharli and Kolara gate safaris', 'Tadoba lake and bamboo forest', 'Good tiger sighting chances', 'Jungle resort stay'],
    ['Drive to Tadoba, check in, evening safari', 'Morning and evening safari', 'Morning safari, return to Nagpur'], 'About 140 km');
  add('chikhaldara', 'Chikhaldara', 'nagpur', '1 Night / 2 Days', 'Jul to Feb', 'Vidarbha\u2019s only hill station with cool air and valleys.',
    ['Bhimkund waterfall', 'Gawilgad Fort', 'Hurricane Point and Devi Point', 'Coffee plantations'],
    ['Drive to Chikhaldara, sightseeing points', 'Gawilgad Fort and Bhimkund, return'], 'About 230 km');
  add('wardha', 'Wardha & Sevagram', 'nagpur', '1 Day', 'Oct to Mar', 'Gandhi Ashram, Vishwa Shanti Stupa and Dhamna.',
    ['Sevagram Ashram', 'Vishwa Shanti Stupa', 'Dhamna lake', 'Paramdham Ashram'],
    ['Drive to Wardha, Sevagram Ashram', 'Shanti Stupa and Paramdham', 'Return to Nagpur'], 'About 75 km');
  add('pachmarhi', 'Pachmarhi', 'nagpur', '2 Nights / 3 Days', 'Sep to Jun', 'Satpura hill station with caves, falls and viewpoints.',
    ['Dhoopgarh sunset point', 'Pandav Caves', 'Bee Falls and Jamuna Prapat', 'Satpura National Park'],
    ['Drive to Pachmarhi, evening at the lake', 'Dhoopgarh, Pandav Caves and Bee Falls', 'Rajat Prapat, return to Nagpur'], 'About 270 km');
  add('kanha', 'Kanha National Park', 'nagpur', '2 Nights / 3 Days', 'Oct to Jun', 'Grasslands, barasingha and tigers in Madhya Pradesh.',
    ['Kanha, Mukki and Sarhi safaris', 'Barasingha (hard ground swamp deer)', 'Bamni Dadar sunset point', 'Forest lodge stay'],
    ['Drive to Kanha, check in, evening safari', 'Morning and evening safari', 'Morning safari, return to Nagpur'], 'About 270 km');

  /* ---- India ---- */
  add('goa', 'Goa', 'india', '4 Nights / 5 Days', 'Nov to Feb', 'Beaches, old churches, seafood and nightlife.',
    ['Baga and Calangute beaches', 'Old Goa churches and Panjim', 'Fort Aguada at sunset', 'Beach shack seafood'],
    ['Arrive, check in, evening at North Goa beaches', 'Old Goa churches and Panjim city', 'South Goa beaches and a sunset cruise', 'Shopping, free time and departure']);
  add('kerala', 'Kerala', 'india', '5 Nights / 6 Days', 'Sep to Mar', 'Houseboats, tea hills and calm backwaters.',
    ['Alleppey houseboat stay', 'Munnar tea gardens', 'Thekkady spice plantations', 'Kerala meals and Ayurveda'],
    ['Arrive in Kochi, drive to Munnar', 'Munnar sightseeing and tea gardens', 'Thekkady wildlife and spice tour', 'Alleppey houseboat, then departure']);
  add('manali', 'Manali & Shimla', 'india', '6 Nights / 7 Days', 'Mar to Jun, Dec to Jan', 'Snow, mountain roads and cool weather.',
    ['Solang Valley activities', 'Atal Tunnel drive', 'Shimla Mall Road and Kufri', 'Hadimba Temple'],
    ['Arrive Chandigarh, drive to Shimla', 'Shimla and Kufri sightseeing', 'Drive to Manali via Kullu', 'Solang Valley and local sightseeing']);
  add('kashmir', 'Kashmir', 'india', '5 Nights / 6 Days', 'Apr to Oct', 'Dal Lake, Gulmarg and Pahalgam.',
    ['Shikara ride on Dal Lake', 'Gulmarg gondola', 'Pahalgam valleys', 'Mughal gardens'],
    ['Arrive Srinagar, Dal Lake shikara', 'Day trip to Gulmarg', 'Drive to Pahalgam, Betaab Valley', 'Mughal gardens and departure']);
  add('rajasthan', 'Rajasthan', 'india', '6 Nights / 7 Days', 'Oct to Mar', 'Forts, palaces and desert camps.',
    ['Amber Fort and Hawa Mahal', 'Udaipur lakes and City Palace', 'Jaisalmer desert camp', 'Rajasthani food and bazaars'],
    ['Arrive Jaipur, city palace and bazaars', 'Amber Fort and drive to Jodhpur', 'Mehrangarh Fort, drive to Jaisalmer', 'Desert camp, then Udaipur and departure']);
  add('andaman', 'Andaman', 'india', '5 Nights / 6 Days', 'Oct to May', 'Clear water, white sand and island hopping.',
    ['Radhanagar Beach, Havelock', 'Snorkelling and scuba', 'Cellular Jail light show', 'Ross and Neil islands'],
    ['Arrive Port Blair, Cellular Jail show', 'Ferry to Havelock, beach evening', 'Radhanagar Beach and water sports', 'Neil Island, return and departure']);
  add('ladakh', 'Leh Ladakh', 'india', '6 Nights / 7 Days', 'May to Sep', 'High passes, Pangong Lake and monasteries.',
    ['Pangong Tso lake', 'Nubra Valley and Khardung La', 'Thiksey and Hemis monasteries', 'Magnetic Hill and Sangam'],
    ['Arrive Leh and rest to adjust to altitude', 'Leh local sightseeing and monasteries', 'Nubra Valley via Khardung La', 'Pangong Lake and return to Leh']);
  add('sikkim-darjeeling', 'Sikkim & Darjeeling', 'india', '6 Nights / 7 Days', 'Mar to Jun, Oct to Dec', 'Tea gardens, toy train and Himalayan views.',
    ['Tiger Hill sunrise', 'Darjeeling toy train', 'Gangtok MG Marg', 'Tsomgo Lake and Nathula'],
    ['Arrive Bagdogra, drive to Gangtok', 'Tsomgo Lake and Baba Mandir', 'Drive to Darjeeling', 'Tiger Hill sunrise and departure']);
  add('meghalaya', 'Meghalaya', 'india', '5 Nights / 6 Days', 'Oct to May', 'Living root bridges, clear rivers and waterfalls.',
    ['Double decker root bridge', 'Dawki and Umngot river', 'Mawlynnong clean village', 'Cherrapunji waterfalls'],
    ['Arrive Guwahati, drive to Shillong', 'Cherrapunji and Nohkalikai Falls', 'Dawki and Mawlynnong', 'Shillong sights and departure']);
  add('uttarakhand', 'Uttarakhand', 'india', '5 Nights / 6 Days', 'Mar to Jun, Sep to Nov', 'Haridwar, Rishikesh and Mussoorie in one trip.',
    ['Ganga Aarti at Haridwar', 'Rishikesh rafting and Laxman Jhula', 'Mussoorie Kempty Falls', 'Dehradun'],
    ['Arrive Haridwar, evening Ganga Aarti', 'Rishikesh sightseeing and rafting', 'Drive to Mussoorie', 'Kempty Falls and departure']);
  add('varanasi', 'Varanasi & Ayodhya', 'india', '4 Nights / 5 Days', 'Oct to Mar', 'Ganga ghats, aarti and Ram Mandir.',
    ['Dashashwamedh Ghat aarti', 'Kashi Vishwanath Temple', 'Sarnath', 'Ram Mandir, Ayodhya'],
    ['Arrive Varanasi, evening Ganga Aarti', 'Boat ride and Kashi Vishwanath', 'Sarnath, drive to Ayodhya', 'Ram Mandir and departure']);
  add('ooty-kodaikanal', 'Ooty & Kodaikanal', 'india', '5 Nights / 6 Days', 'Mar to Jun, Sep to Nov', 'Two hill stations with lakes, gardens and tea estates.',
    ['Ooty Botanical Garden and Nilgiri toy train', 'Doddabetta Peak', 'Kodaikanal Lake', 'Pillar Rocks'],
    ['Arrive Coimbatore, drive to Ooty', 'Ooty sightseeing', 'Drive to Kodaikanal', 'Lake, Coaker\u2019s Walk and departure']);
  add('mysuru-coorg', 'Mysuru & Coorg', 'india', '4 Nights / 5 Days', 'Oct to Mar', 'Palaces, coffee estates and waterfalls.',
    ['Mysore Palace', 'Brindavan Gardens', 'Abbey Falls, Coorg', 'Coffee plantation walk'],
    ['Arrive Bengaluru, drive to Mysuru', 'Mysore Palace and Chamundi Hill', 'Drive to Coorg', 'Abbey Falls and departure']);
  add('amritsar', 'Amritsar', 'india', '2 Nights / 3 Days', 'Oct to Mar', 'Golden Temple, Wagah border and Jallianwala Bagh.',
    ['Golden Temple and langar', 'Wagah Border ceremony', 'Jallianwala Bagh', 'Amritsari food'],
    ['Arrive, Golden Temple evening visit', 'Jallianwala Bagh and Wagah Border', 'Local market and departure']);
  add('shirdi', 'Shirdi & Nashik', 'india', '2 Nights / 3 Days', 'Oct to Mar', 'Sai Baba darshan, Shani Shingnapur and Trimbakeshwar.',
    ['Sai Baba Temple, Shirdi', 'Shani Shingnapur', 'Trimbakeshwar Jyotirlinga', 'Nashik Panchavati'],
    ['Arrive Shirdi, evening darshan', 'Shani Shingnapur, drive to Nashik', 'Trimbakeshwar and departure']);
  add('ajanta-ellora', 'Ajanta & Ellora', 'india', '2 Nights / 3 Days', 'Oct to Mar', 'Rock-cut caves and Bibi Ka Maqbara.',
    ['Ellora Kailasa Temple', 'Ajanta cave paintings', 'Bibi Ka Maqbara', 'Daulatabad Fort'],
    ['Arrive Aurangabad, Bibi Ka Maqbara', 'Ellora Caves and Daulatabad Fort', 'Ajanta Caves and departure']);

  /* ---- International ---- */
  add('dubai', 'Dubai', 'world', '4 Nights / 5 Days', 'Nov to Mar', 'Burj Khalifa, desert safari and shopping.',
    ['Burj Khalifa observation deck', 'Desert safari with dinner', 'Dubai Mall and fountain show', 'Dhow cruise at Marina'],
    ['Arrive, Dhow cruise dinner', 'City tour and Burj Khalifa', 'Desert safari with BBQ dinner', 'Shopping and departure']);
  add('thailand', 'Thailand', 'world', '5 Nights / 6 Days', 'Nov to Mar', 'Bangkok, Pattaya and Phuket islands.',
    ['Bangkok temples and markets', 'Coral Island, Pattaya', 'Phi Phi island tour, Phuket', 'Thai massage and street food'],
    ['Arrive Bangkok, city and temples', 'Transfer to Pattaya, Coral Island', 'Fly to Phuket, beach time', 'Phi Phi island tour and departure']);
  add('maldives', 'Maldives', 'world', '4 Nights / 5 Days', 'Nov to Apr', 'Water villas, clear lagoons and quiet beaches.',
    ['Overwater or beach villa', 'Snorkelling over coral reefs', 'Sunset cruise', 'Candlelight beach dinner'],
    ['Arrive Male, speedboat to resort', 'Snorkelling and lagoon time', 'Sunset cruise and beach dinner', 'Relax and departure']);
  add('singapore', 'Singapore', 'world', '4 Nights / 5 Days', 'Feb to Apr', 'Gardens by the Bay, Sentosa and city lights.',
    ['Gardens by the Bay', 'Sentosa and Universal Studios', 'Night Safari', 'Marina Bay skyline'],
    ['Arrive, city tour and Merlion', 'Gardens by the Bay and Marina Bay', 'Sentosa Island day', 'Night Safari or shopping, departure']);

  var TAGS = { nagpur: 'From Nagpur', india: 'India', world: 'International' };

  /* ================= Helpers ================= */
  var $ = function (id) { return document.getElementById(id); };
  var page = document.body.getAttribute('data-page');
  var params = new URLSearchParams(location.search);

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function wa(text) { return 'https://api.whatsapp.com/send?phone=' + PHONE_WA + '&text=' + encodeURIComponent(text); }
  function find(id) { return places.filter(function (p) { return p.id === id; })[0]; }
  function photo(p, cls) {
    return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="images/' + esc(p.img) + '"' + (p.fallback ? ' data-fallback="' + esc(p.fallback) + '"' : '') + ' alt="' + esc(p.name) + '" loading="lazy">';
  }
  function quoteLink(p) {
    return wa('Hi ' + BUSINESS + ', I want details and a quote for the ' + p.name + ' tour.');
  }
  function card(p) {
    return '<article class="card">' +
      '<a class="card__img" href="destination.html?p=' + p.id + '" data-name="' + esc(p.name) + '">' +
        '<span class="card__tag">' + TAGS[p.type] + '</span>' + photo(p) +
      '</a>' +
      '<div class="card__body">' +
        '<h3><a href="destination.html?p=' + p.id + '">' + esc(p.name) + '</a></h3>' +
        '<p>' + esc(p.text) + '</p>' +
        '<div class="card__foot">' +
          '<span class="card__days"><i class="fa fa-clock-o"></i>' + esc(p.days) + '</span>' +
          '<a class="btn btn--sm" href="' + quoteLink(p) + '" target="_blank" rel="noopener">Get Quote</a>' +
        '</div>' +
      '</div></article>';
  }
  function banner(p, title, sub) {
    return '<div class="banner__bg">' + photo(p) + '</div>' +
      '<div class="container banner__text"><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>';
  }

  /* Image fallback: local file -> web photo -> gradient */
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (img.tagName !== 'IMG') return;
    var fb = img.getAttribute('data-fallback');
    if (fb) { img.removeAttribute('data-fallback'); img.src = fb; }
    else { img.style.display = 'none'; }
  }, true);

  /* ================= Shared header, footer, WhatsApp ================= */
  var nav = [['home', 'index.html', 'Home'], ['destinations', 'destinations.html', 'Destinations'], ['contact', 'contact.html', 'Contact']];
  var phoneLinks = PHONES.map(function (p) { return '<a href="tel:' + p[1] + '"><i class="fa fa-phone"></i> ' + p[0] + '</a>'; }).join('');

  $('site-header').innerHTML =
    '<div class="topbar"><div class="container topbar__inner"><span>Your Trusted Travel Partner</span><span class="topbar__phones">' + phoneLinks + '</span></div></div>' +
    '<header class="header"><div class="container header__inner">' +
      '<a class="wordmark" href="index.html" aria-label="Uravi Holidays"><b>URAVI</b><span>Holidays</span></a>' +
      '<button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="mainNav"><i class="fa fa-bars"></i></button>' +
      '<nav class="nav" id="mainNav" aria-label="Main">' +
        nav.map(function (n) { return '<a href="' + n[1] + '"' + (n[0] === page || (page === 'destination' && n[0] === 'destinations') ? ' class="is-active" aria-current="page"' : '') + '>' + n[2] + '</a>'; }).join('') +
        '<a class="btn btn--sm" href="' + wa('Hi ' + BUSINESS + ', I want a tour quote.') + '" target="_blank" rel="noopener">Get Quote</a>' +
      '</nav></div></header>';

  $('site-footer').innerHTML =
    '<footer class="footer"><div class="container footer__grid">' +
      '<div><a class="wordmark wordmark--light" href="index.html"><b>URAVI</b><span>Holidays</span></a><p>Your Trusted Travel Partner</p></div>' +
      '<div><h4>Explore</h4>' + nav.map(function (n) { return '<a href="' + n[1] + '">' + n[2] + '</a>'; }).join('') + '</div>' +
      '<div><h4>Talk to us</h4><p>Shankartaj Gaikwad<br>Travel Consultant</p>' + phoneLinks + '</div>' +
    '</div><div class="copyright">&copy; ' + new Date().getFullYear() + ' Uravi Holidays. All rights reserved.</div></footer>' +
    '<a class="whatsapp" href="' + wa('Hi ' + BUSINESS + ', I need help planning a trip.') + '" target="_blank" rel="noopener" aria-label="Chat on WhatsApp"><i class="fa fa-whatsapp"></i></a>';

  var navEl = $('mainNav'), toggle = $('navToggle');
  function setNav(open) {
    navEl.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.querySelector('i').className = open ? 'fa fa-times' : 'fa fa-bars';
  }
  toggle.addEventListener('click', function () { setNav(!navEl.classList.contains('is-open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });

  /* ================= Pages ================= */
  var pages = {

    home: function () {
      var slideIds = ['maldives', 'kashmir', 'goa'];
      var slides = $('heroSlides'), caption = $('heroCaption');
      slides.innerHTML = slideIds.map(function (id, i) {
        var p = find(id);
        return '<img class="' + (i === 0 ? 'is-on' : '') + '" src="images/' + p.img + '" data-fallback="' + esc(p.fallback) + '" alt="' + esc(p.name) + '">';
      }).join('');
      var imgs = slides.querySelectorAll('img'), cur = 0;
      function show(i) {
        cur = i;
        imgs.forEach(function (im, n) { im.classList.toggle('is-on', n === i); });
        var p = find(slideIds[i]);
        caption.innerHTML = 'Now showing: <a href="destination.html?p=' + p.id + '">' + esc(p.name) + '</a>';
      }
      show(0);
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setInterval(function () { show((cur + 1) % slideIds.length); }, 6000);
      }
      $('nagpurTrips').innerHTML = ['ramtek', 'pench', 'tadoba', 'chikhaldara'].map(function (id) { return card(find(id)); }).join('');
      $('featured').innerHTML = ['goa', 'kerala', 'dubai', 'thailand'].map(function (id) { return card(find(id)); }).join('');
    },

    destinations: function () {
      $('banner').innerHTML = banner(find('rajasthan'), 'All destinations', 'Pick a place to see highlights and a day-wise plan.');
      var list = $('cards'), filter = TAGS[params.get('type')] ? params.get('type') : 'all';
      function render() {
        document.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('is-active', c.getAttribute('data-filter') === filter); });
        list.innerHTML = places.filter(function (p) { return filter === 'all' || p.type === filter; }).map(card).join('');
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
        '<span class="pill"><i class="fa fa-clock-o"></i> ' + esc(p.days) + '</span>' + (p.dist ? '<span class="pill"><i class="fa fa-map-marker"></i> ' + esc(p.dist) + ' from Nagpur</span>' : '') + '<span class="pill"><i class="fa fa-sun-o"></i> Best time: ' + esc(p.best) + '</span>');
      var others = places.filter(function (x) { return x.id !== p.id && x.type === p.type; }).slice(0, 3);
      box.innerHTML =
        '<div class="container detail">' +
          '<div class="detail__main">' +
            '<h2>Trip highlights</h2><ul class="ticks">' + p.highlights.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul>' +
            '<h2>Sample plan</h2><ol class="days">' + p.plan.map(function (d, i) { return '<li><b>Day ' + (i + 1) + '</b><span>' + esc(d) + '</span></li>'; }).join('') + '</ol>' +
            '<p class="note">This is a sample plan. We change days, hotels and budget to suit you.</p>' +
          '</div>' +
          '<aside class="quote">' +
            '<h3>Plan this trip</h3><p>' + esc(p.text) + '</p>' +
            '<a class="btn" href="' + quoteLink(p) + '" target="_blank" rel="noopener">Get Quote on WhatsApp</a>' +
            '<a class="btn btn--outline" href="contact.html?p=' + p.id + '">Send enquiry</a>' +
            '<a class="quote__call" href="tel:' + PHONES[0][1] + '"><i class="fa fa-phone"></i> ' + PHONES[0][0] + '</a>' +
          '</aside>' +
        '</div>' +
        '<div class="container more"><h2>More ' + (p.type === 'nagpur' ? 'trips from Nagpur' : p.type === 'india' ? 'India trips' : 'international trips') + '</h2><div class="cards">' + others.map(card).join('') + '</div></div>';
    },

    contact: function () {
      $('banner').innerHTML = banner(find('dubai'), 'Plan your trip', 'Send your details and we reply on WhatsApp with a plan and price.');
      var sel = $('fPlace');
      sel.innerHTML = ['nagpur', 'india', 'world'].map(function (t) {
        return '<optgroup label="' + TAGS[t] + '">' + places.filter(function (p) { return p.type === t; }).map(function (p) {
          return '<option value="' + p.id + '">' + esc(p.name) + '</option>';
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
        window.open(wa('Hi ' + BUSINESS + ', my name is ' + name.value.trim() + '. I want to travel to ' + where +
          ' in ' + ($('fMonth').value || 'a month not decided') + ' with ' + people + ' traveller(s). Please share a plan and price.'), '_blank', 'noopener');
      });
    }
  };

  if (pages[page]) pages[page]();
})();