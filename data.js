'use strict';
/* All site content lives here and is served through the API. */

const SITE = {
  name: 'Uravi Holidays',
  shortName: 'Uravi',
  tagline: 'Your Trusted Travel Partner',
  slogan: 'Travel Beyond Boundaries',
  phone: '+91 83290 56457',
  phones: ['+91 83290 56457', '+91 87660 43591'],
  whatsapp: '918329056457',
  email: 'infouraviholidays@gmail.com',
  website: 'URAVIHolidays.in',
  url: 'https://www.uraviholidays.in',
  contactPerson: { name: 'Shankartaj Gaikwad', role: 'Travel Consultant' },
  address: {
    lines: ['Imperial Plaza, Trenton Business Centre, 5th Floor,', 'Block No. 5, Somwar Bazar Road,', 'Bardi, Nagpur'],
    full: 'Imperial Plaza, Trenton Business Centre, 5th Floor, Block No. 5, Somwar Bazar Road, Bardi, Nagpur'
  },
  social: {
    instagram: 'https://www.instagram.com/uraviholidays?vrfl=b2t5bHQ3NGZpOXEz',
    facebook: 'https://www.facebook.com/share/1Dizy6Eg3Z/',
    whatsapp: 'https://wa.me/918329056457'
  },
  mapUrl: 'https://maps.app.goo.gl/xikMJF9QvYEE35hi8',
  reviewUrl: 'https://maps.app.goo.gl/rsNz66sUUWWkuaWY8',
  services: ['Flight Ticket', 'Railway Ticket', 'Tour Package', 'Passport Assistance', 'Visa Services', 'Travel Insurance']
};

const menus = {
  india: [
    { title: 'North India', links: [
      ['Delhi', 'main-dehli-tour-package.php'], ['Himachal Pradesh', 'main-himachal-tour-package.php'],
      ['Kashmir', 'main-kashmir-tour-package.php'], ['Leh-Ladakh', 'leh-tour.php'],
      ['Amritsar', 'best-of-himachal-pradesh-with-amritsar.php'], ['Uttarakhand', 'main-uttarakhand-tour-package.php'],
      ['Char Dham Yatra', 'chardham-yatra.php'], ['Do Dham Yatra', 'do-dham-yatra.php'],
      ['Auli Skiing', 'auli-skiing-tour.php'], ['Uttar Pradesh', 'uttar-pradesh-tour-5d.php']] },
    { title: 'South India', links: [
      ['Andaman & Nicobar', 'main-andaman-tour-package.php'], ['Hyderabad', 'hyderabad-tour.php'],
      ['Telangana', 'telangana-tour.php'], ['Karnataka', 'main-karnataka-tour-package.php'],
      ['Kerala & Tamil Nadu', 'main-kerala-tour-package.php'], ['Ooty', 'karnataka-tamilnadu-4d.php'],
      ['Kodaikanal', 'karnataka-tamilnadu.php']] },
    { title: 'East & North East', links: [
      ['West Bengal & Sikkim', 'west-bengal-and-sikkim-tour.php'], ['North Sikkim', 'glorious-north-sikkim.php'],
      ['North East', 'incredible-north-east.php'], ['Kolkata', 'heritage-kolkata-with-marvelous-shantiniketan.php'],
      ['Sunderbans', 'royal-sunderban-with-kolkata.php']] },
    { title: 'West & Central', links: [
      ['Maharashtra', 'main-maharashtra-tour-package.php'], ['Rajasthan', 'main-rajasthan-tour-package.php'],
      ['Goa', 'main-goa-tour-package.php'], ['Gujarat', 'main-gujarat-tour-package.php'],
      ['Rann Utsav', 'rann-utsav-tour.php'], ['Madhya Pradesh', 'main-mp-tour-package.php'],
      ['Bandhavgarh', 'bandhavgarh.php']] }
  ],
  world: [
    { title: 'Africa', links: [
      ['Egypt', 'best-of-egypt.php'], ['Kenya', 'delightful-kenya.php'], ['Mauritius', 'main-mauritius-package.php'],
      ['Seychelles', 'seychelles-tour-6days.php'], ['South Africa', 'south-african-grandeur-10days.php'],
      ['Tanzania', 'tanzania_tour.php'], ['Zimbabwe', 'zimbabwe-tour-package.php']] },
    { title: 'Americas', links: [
      ['All of America', 'america-tour-packages.php'], ['South America', 'south-america-tour-packages.php'],
      ['USA', 'all-of-usa-7days.php'], ['Canada', 'canada-tour-packages.php'],
      ['Brazil', 'brazil_tour_package.php'], ['Argentina', 'argentina.php']] },
    { title: 'Asia', links: [
      ['Bhutan', 'main-bhutan-package.php'], ['Nepal', 'main-nepal-tour-package.php'], ['Sri Lanka', 'main-srilanka-tour-package.php'],
      ['Maldives', 'main-maldives-package.php'], ['Cambodia', 'cambodia-tour-package.php'], ['Singapore', 'simply-singapore-4-days.php'],
      ['Malaysia', 'main-malaysia-package.php'], ['Indonesia', 'main-indonesia-tour-package.php'], ['Hong Kong & Macao', 'main-hong-kong-maccau.php'],
      ['China', 'shanghai-beijing.php'], ['Taiwan', 'taiwan-tour.php'], ['Vietnam', 'vietnam-tour-with-cruise-6days.php'],
      ['Thailand', 'main-thailand-tour-package.php'], ['Japan', 'joyfull-japan-tour.php'], ['South Korea', 'south-korea.php'],
      ['Philippines', 'phillippines-tour-5days.php']] },
    { title: 'Australia & NZ', links: [
      ['Australia', 'all-australia-14days.php'], ['Fiji', 'fiji.php'], ['New Zealand', 'all-new%20zealand-10days.php']] },
    { title: 'Europe', links: [
      ['Austria', 'best-of-austria-tour-package.php'], ['Belgium', 'belgium.php'], ['UK', 'all-united-kingdom-9days.php'],
      ['European Panorama', 'all-european-panorama-8days.php'], ['Switzerland & Netherlands', 'best-europe-tour.php'],
      ['England, Scotland & Ireland', 'england-scotland-ireland.php'], ['Italy', 'italy-vatican-city.php'],
      ['Central & Eastern Europe', 'central-nd-eastern-europe.php'], ['Northern Europe', 'northern-europe.php'],
      ['Denmark & Iceland', 'denmark-iceland.php'], ['Russia', 'all-russia-9days.php'], ['Greece', 'greece-tour-7days.php'],
      ['Turkey', 'turkey-tour-packages.php'], ['Spain, Portugal & Morocco', 'spain-portugal-morocco.php'],
      ['Azerbaijan', 'azerbaijan-tour-4-days.php'], ['Uzbekistan & Kazakhstan', 'uzbekistan-kazakhstan-tour.php']] },
    { title: 'Middle East', links: [
      ['Dubai', 'dubai-delight-tour-6D.php'], ['Dubai & Abu Dhabi', 'dubai-tour-with-abudhabi-6days.php'],
      ['Qatar', 'qatar-with-dubai.php'], ['Oman', 'oman-muscat.php'], ['Jordan', 'all-jordan-petra.php'],
      ['Israel', 'israel-tour-package.php'], ['Egypt, Jordan & Israel', 'egypt-jordan-israel-tour.php']] }
  ]
};

/* slug -> [days, highlights separated by ;] */
const X = {
  'main-dehli-tour-package': [4, "Red Fort; India Gate; Qutub Minar; Humayun's Tomb; Chandni Chowk"],
  'main-himachal-tour-package': [7, 'Shimla; Kufri; Manali; Solang Valley; Rohtang Pass'],
  'main-kashmir-tour-package': [6, 'Dal Lake shikara ride; Gulmarg; Pahalgam; Sonmarg; Mughal Gardens'],
  'leh-tour': [7, 'Leh Palace; Pangong Lake; Nubra Valley; Khardung La; Magnetic Hill'],
  'best-of-himachal-pradesh-with-amritsar': [9, 'Shimla; Manali; Dharamshala; Golden Temple; Wagah Border'],
  'main-uttarakhand-tour-package': [6, 'Mussoorie; Rishikesh; Haridwar; Nainital; Jim Corbett'],
  'chardham-yatra': [12, 'Yamunotri; Gangotri; Kedarnath; Badrinath; Haridwar'],
  'do-dham-yatra': [6, 'Kedarnath; Badrinath; Haridwar; Rishikesh'],
  'auli-skiing-tour': [5, 'Auli ski slopes; Joshimath; Auli cable car; Rishikesh'],
  'uttar-pradesh-tour-5d': [5, 'Taj Mahal; Agra Fort; Fatehpur Sikri; Varanasi Ganga Aarti; Sarnath'],
  'main-andaman-tour-package': [6, 'Radhanagar Beach; Cellular Jail; Havelock Island; Neil Island; Ross Island'],
  'hyderabad-tour': [4, 'Charminar; Golconda Fort; Ramoji Film City; Hussain Sagar'],
  'telangana-tour': [5, 'Warangal Fort; Thousand Pillar Temple; Ramappa Temple; Hyderabad city'],
  'main-karnataka-tour-package': [7, 'Mysore Palace; Coorg; Bengaluru; Hampi; Chamundi Hills'],
  'main-kerala-tour-package': [7, 'Munnar; Thekkady; Alleppey houseboat; Kovalam; Kochi'],
  'karnataka-tamilnadu-4d': [4, 'Ooty Botanical Garden; Doddabetta Peak; Ooty Lake; Nilgiri toy train'],
  'karnataka-tamilnadu': [6, 'Kodaikanal Lake; Coaker\'s Walk; Pillar Rocks; Ooty; Mysore'],
  'west-bengal-and-sikkim-tour': [8, 'Darjeeling; Tiger Hill; Gangtok; Tsomgo Lake; Kalimpong'],
  'glorious-north-sikkim': [7, 'Lachung; Yumthang Valley; Gurudongmar Lake; Gangtok'],
  'incredible-north-east': [9, 'Guwahati; Kamakhya Temple; Kaziranga; Shillong; Cherrapunji'],
  'heritage-kolkata-with-marvelous-shantiniketan': [5, 'Victoria Memorial; Howrah Bridge; Dakshineswar; Shantiniketan'],
  'royal-sunderban-with-kolkata': [5, 'Sunderbans boat safari; Kolkata sightseeing; Victoria Memorial'],
  'main-maharashtra-tour-package': [6, 'Mumbai; Lonavala; Mahabaleshwar; Ajanta & Ellora; Shirdi'],
  'main-rajasthan-tour-package': [8, 'Jaipur; Jodhpur; Udaipur; Jaisalmer; Pushkar'],
  'main-goa-tour-package': [4, 'Baga Beach; Calangute; Old Goa churches; Fort Aguada'],
  'main-gujarat-tour-package': [6, 'Statue of Unity; Somnath; Dwarka; Gir National Park; Ahmedabad'],
  'rann-utsav-tour': [4, 'White Rann; Tent city stay; Kala Dungar; Cultural evenings'],
  'main-mp-tour-package': [6, 'Khajuraho; Sanchi; Bhopal; Ujjain; Pachmarhi'],
  'bandhavgarh': [4, 'Jeep safaris; Bandhavgarh Fort; Tiger spotting; Nature walks'],
  'best-of-egypt': [8, 'Pyramids of Giza; Sphinx; Nile cruise; Luxor; Egyptian Museum'],
  'delightful-kenya': [7, 'Masai Mara; Lake Nakuru; Amboseli; Nairobi'],
  'main-mauritius-package': [6, 'Ile aux Cerfs; Chamarel; Port Louis; Grand Bassin'],
  'seychelles-tour-6days': [6, 'Anse Source d\'Argent; Praslin; La Digue; Mahe'],
  'south-african-grandeur-10days': [10, 'Cape Town; Table Mountain; Cape Point; Kruger National Park; Johannesburg'],
  'tanzania_tour': [8, 'Serengeti; Ngorongoro Crater; Tarangire; Zanzibar'],
  'zimbabwe-tour-package': [6, 'Victoria Falls; Hwange National Park; Zambezi sunset cruise'],
  'america-tour-packages': [10, 'New York; Niagara Falls; Las Vegas; Los Angeles; San Francisco'],
  'south-america-tour-packages': [12, 'Rio de Janeiro; Machu Picchu; Iguazu Falls; Buenos Aires'],
  'all-of-usa-7days': [7, 'New York; Washington DC; Niagara Falls; Statue of Liberty'],
  'canada-tour-packages': [8, 'Niagara Falls; Toronto; Banff; Vancouver; CN Tower'],
  'brazil_tour_package': [8, 'Christ the Redeemer; Sugarloaf Mountain; Iguazu Falls; Copacabana'],
  'argentina': [8, 'Buenos Aires; Tango show; Perito Moreno Glacier; Iguazu Falls; Ushuaia'],
  'main-bhutan-package': [6, 'Paro Taktsang; Thimphu; Punakha Dzong; Dochula Pass'],
  'main-nepal-tour-package': [5, 'Kathmandu; Pashupatinath; Swayambhunath; Pokhara; Phewa Lake'],
  'main-srilanka-tour-package': [6, 'Colombo; Kandy; Nuwara Eliya; Sigiriya; Galle'],
  'main-maldives-package': [5, 'Overwater villas; Snorkelling; Sandbank picnic; Sunset cruise'],
  'cambodia-tour-package': [5, 'Angkor Wat; Bayon Temple; Tonle Sap; Phnom Penh'],
  'simply-singapore-4-days': [4, 'Marina Bay Sands; Gardens by the Bay; Sentosa; Universal Studios; Night Safari'],
  'main-malaysia-package': [5, 'Petronas Twin Towers; Genting Highlands; Batu Caves; Langkawi'],
  'main-indonesia-tour-package': [6, 'Ubud; Tanah Lot; Kintamani; Nusa Penida; Uluwatu'],
  'main-hong-kong-maccau': [6, 'Victoria Peak; Disneyland; Big Buddha; Macau; Ruins of St. Paul'],
  'shanghai-beijing': [8, 'Great Wall; Forbidden City; The Bund; Summer Palace'],
  'taiwan-tour': [6, 'Taipei 101; Sun Moon Lake; Jiufen; Alishan'],
  'vietnam-tour-with-cruise-6days': [6, 'Ha Long Bay cruise; Hanoi Old Quarter; Local cuisine; Cultural shows'],
  'main-thailand-tour-package': [5, 'Pattaya; Coral Island; Bangkok; Grand Palace; Phuket'],
  'joyfull-japan-tour': [8, 'Tokyo; Mount Fuji; Kyoto; Osaka; Bullet train'],
  'south-korea': [7, 'Seoul; Gyeongbokgung Palace; Nami Island; Lotte World; Jeju'],
  'phillippines-tour-5days': [5, 'Manila; Intramuros; Tagaytay; Taal Volcano'],
  'all-australia-14days': [14, 'Sydney Opera House; Great Barrier Reef; Melbourne; Gold Coast'],
  'fiji': [6, 'Denarau; Mamanuca Islands; Island cruise; Coral reefs'],
  'all-new zealand-10days': [10, 'Auckland; Rotorua; Queenstown; Milford Sound'],
  'best-of-austria-tour-package': [7, 'Vienna; Salzburg; Innsbruck; Hallstatt'],
  'belgium': [6, 'Brussels Grand Place; Bruges; Atomium; Belgian chocolate tasting'],
  'all-united-kingdom-9days': [9, 'London Eye; Buckingham Palace; Tower Bridge; Edinburgh Castle; Cotswolds'],
  'all-european-panorama-8days': [8, 'Paris; Swiss Alps; Rome; Amsterdam'],
  'best-europe-tour': [9, 'Mount Titlis; Lucerne; Amsterdam; Keukenhof Gardens'],
  'england-scotland-ireland': [10, 'London; Edinburgh; Dublin; Cliffs of Moher'],
  'italy-vatican-city': [8, 'Colosseum; Vatican City; Venice; Florence; Pisa'],
  'central-nd-eastern-europe': [10, 'Prague; Vienna; Budapest; Danube cruise'],
  'northern-europe': [10, 'Oslo; Stockholm; Copenhagen; Scenic fjords'],
  'denmark-iceland': [9, 'Copenhagen; Blue Lagoon; Golden Circle; Northern Lights (seasonal)'],
  'all-russia-9days': [9, 'Red Square; Moscow Kremlin; Hermitage Museum; Saint Petersburg canals'],
  'greece-tour-7days': [7, 'Athens Acropolis; Santorini; Mykonos'],
  'turkey-tour-packages': [8, 'Istanbul; Hagia Sophia; Cappadocia; Pamukkale'],
  'spain-portugal-morocco': [12, 'Barcelona; Madrid; Lisbon; Marrakech'],
  'azerbaijan-tour-4-days': [4, 'Baku; Flame Towers; Gobustan; Old City'],
  'uzbekistan-kazakhstan-tour': [8, 'Tashkent; Samarkand; Registan Square; Almaty'],
  'dubai-delight-tour-6d': [6, 'Burj Khalifa; Desert safari; Dubai Mall; Marina cruise; Palm Jumeirah'],
  'dubai-tour-with-abudhabi-6days': [6, 'Burj Khalifa; Sheikh Zayed Grand Mosque; Ferrari World; Desert safari'],
  'qatar-with-dubai': [7, 'Doha Corniche; Museum of Islamic Art; Souq Waqif; Burj Khalifa'],
  'oman-muscat': [5, 'Sultan Qaboos Grand Mosque; Mutrah Souq; Wadi Shab; Royal Opera House'],
  'all-jordan-petra': [6, 'Petra; Wadi Rum; Dead Sea; Amman'],
  'israel-tour-package': [7, 'Jerusalem; Dead Sea; Tel Aviv; Bethlehem; Sea of Galilee'],
  'egypt-jordan-israel-tour': [12, 'Pyramids of Giza; Petra; Jerusalem; Dead Sea']
};

const tourRows = [
  ['Fun N Food', 'odt-fun-n-food.php', 'fun-n-food-village.jpg', 4.3, 'A village-style fun and food day out for families and groups.', 'Village games; Traditional food; Rides & activities; Open-air picnic'],
  ['Highland Park', 'odt-highland-park.php', 'highland-park.jpeg', 4.5, 'A relaxed park and resort day trip near Nagpur.', 'Park rides; Pool fun; Garden walks; Lunch & snacks'],
  ['Railway Museum, Nagpur', 'odt-railway-museum-nagpur.php', 'railway-museum-nagpur.jpg', 4.3, 'Explore heritage locomotives and railway history in Nagpur.', 'Heritage locomotives; Toy train; Railway exhibits; Photo stops'],
  ['Children Traffic Park, Nagpur', 'odt-traffic-park-nagpur.php', 'traffic-park-nagpur.jpg', 4.5, 'A learning-through-play outing that teaches kids road safety.', 'Traffic rules for kids; Mini roads & signals; Play area; Great for schools'],
  ['Go Flamingo, Hingna', 'odt-go-flamingo-hingna.php', 'go-flamingo-hingna.jpg', 4.3, 'A fun family outing at Hingna on the edge of Nagpur.', 'Family activities; Open spaces; Photo spots; Snacks'],
  ['Ramdham, Krishnadham & Agro Park', 'odt-ramdham-krishnadham-n-agro-park.php', 'ramdham-krishnadham-agro-park.jpg', 4.5, 'A devotional and nature-filled day combining temples with an agro park.', 'Temple darshan; Agro park walk; Picnic lunch; Group friendly'],
  ['Sahas Adventure Camp, Junewani, Katol', 'odt-sahas-adventure-camp-junewani-katol.php', 'sahas-adventure-camp-katol.jpg', 4.3, 'Adventure activities in the countryside near Katol.', 'Adventure activities; Team games; Nature surroundings; Outdoor lunch'],
  ['Green Groves, Saoner', 'odt-green-grooves-saoner.php', 'green-groves-saoner.jpg', 4.5, 'A green getaway at Saoner ideal for picnics and celebrations.', 'Green surroundings; Pool & games; Picnic spots; Lunch included on request'],
  ['Waghville Adventure Camp', 'odt-waghville-adventure-camp.php', 'waghville-adventure-camp.jpeg', 4.3, 'A camp-style adventure day for groups, colleges and corporates.', 'Adventure activities; Team building; Camp setting; Group packages'],
  ['Ramdham – Krishnadham – Agro Park Educational Excursion', 'odt-ramdham-krishnadham-agro-park-educational-excursion.php', 'ramdham-educational-excursion.jpg', 4.3, 'The Ramdham, Krishnadham and Agro Park trip designed for school excursions.', 'Guided visit; Agro learning; Temple visits; Student-friendly plan'],
  ['Shivthirth Tour', 'odt-shivthirth-tour.php', 'shivthirth-tour.jpg', 4.5, 'A one-day spiritual tour for families and senior citizens.', 'Darshan; Peaceful surroundings; Comfortable transfer; Family friendly'],
  ['Fun Planet', 'odt-fun-planet.php', 'fun-planet.webp', 4.3, 'An amusement day with rides and games for all ages.', 'Amusement rides; Games; Food court; Kids zone'],
  ['Dwarka River Farms & Amusement Park', 'odt-dwarka-river-farms-n-amusement-park.php', 'dwarka-river-farms.jpg', 4.3, 'Riverside farm stay vibes with an amusement park.', 'Amusement rides; River & farm setting; Picnic lunch; Group fun']
];

const safariRows = [
  ['Tadoba Jungle Safari', 'tadoba-jungle-safari.php', 2, 'Jeep safaris in Tadoba Andhari Tiger Reserve, one of central India\'s best-known tiger reserves.', 'Core zone jeep safari; Tiger and wildlife spotting; Forest stay; Nature walks'],
  ['Pench Jungle Safari', 'pench-jungle-safari.php', 2, 'Safari through the teak forests of Pench Tiger Reserve, close to Nagpur.', 'Jeep safari; Bird watching; Forest stay; Wildlife photography'],
  ['Kanha Jungle Safari', 'kanha-jungle-safari.php', 3, 'The meadows and sal forests of Kanha National Park in Madhya Pradesh.', 'Morning & evening safaris; Barasingha habitat; Forest lodge stay; Nature trails'],
  ['Navegaon Nagzira Safari', 'navegaon-nagzira-safari.php', 2, 'A quieter wildlife escape in the forests and lakes of eastern Vidarbha.', 'Jungle safari; Lake views; Bird watching; Forest stay'],
  ['Umred Karhandla Safari', 'umred-karhandla-safari.php', 1, 'A short wildlife outing from Nagpur at Umred Karhandla Wildlife Sanctuary.', 'Jeep safari; Wildlife spotting; Easy day trip; Family friendly']
];

/* ---------- build items ---------- */
function decode(s) { try { return decodeURIComponent(s); } catch (e) { return s; } }
function slugOf(file) { return decode(file).replace(/\.php$/i, '').toLowerCase(); }
function imgKey(slug) { return slug.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

const items = [];
const bySlug = {};
function add(it) {
  it.slug = slugOf(it.file);
  it.imgKey = imgKey(it.slug);
  items.push(it);
  bySlug[it.slug] = it;
  return it;
}

tourRows.forEach(function (r) {
  add({ kind: 'tour', name: r[0], file: r[1], photo: r[2], score: r[3], region: 'Nagpur Special Tours', scope: 'nagpur', days: 1,
    tagline: r[4], highlights: r[5].split('; ') });
});
safariRows.forEach(function (r) {
  add({ kind: 'safari', name: r[0], file: r[1], score: null, region: 'Jungle Safari', scope: 'safari', days: r[2],
    tagline: r[3], highlights: r[4].split('; ') });
});
['india', 'world'].forEach(function (scope) {
  menus[scope].forEach(function (g) {
    g.links.forEach(function (l) {
      const slug = slugOf(l[1]);
      const x = X[slug] || [5, l[0]];
      const days = x[0];
      if (bySlug[slug]) return;
      add({ kind: 'destination', name: l[0], file: l[1], score: null, region: g.title, scope: scope, days: days,
        tagline: days + ' Days / ' + (days - 1) + ' Nights package' ,
        highlights: x[1].split('; ') });
    });
  });
});
// Bandhavgarh is a destination in the menu but also a safari
bySlug['bandhavgarh'].scope = 'india';

const suggested = ['main-indonesia-tour-package', 'main-thailand-tour-package', 'main-nepal-tour-package',
  'main-srilanka-tour-package', 'simply-singapore-4-days'];
const suggestedTaglines = {
  'main-indonesia-tour-package': 'Bali is a living postcard',
  'main-thailand-tour-package': "There's so much to see",
  'main-nepal-tour-package': 'Everyone who visits falls in love',
  'main-srilanka-tour-package': 'The pearl of the Indian Ocean',
  'simply-singapore-4-days': 'The first time you go'
};

/* Customer reviews are intentionally empty. Add real Uravi Holidays reviews here as ['Name', 5, 'Text']. */
const reviews = { google: [], justdial: [] };

module.exports = { SITE, menus, items, bySlug, slugOf, imgKey, suggested, suggestedTaglines, reviews, decode };
