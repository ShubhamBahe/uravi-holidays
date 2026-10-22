'use strict';
/* Safety net: rewrites leftover "AVM Tours & Travels" text, the old phone number and the old e-mail
   addresses in the HTML/JS files inside public/ as they are served (e.g. text still hard-coded in js/common.js).
   It never touches the bare identifier "AVM" in JavaScript, because the site's code uses it as a variable name. */
const fs = require('fs');
const path = require('path');
const D = require('./data');

const NAME = D.SITE.name, EMAIL = D.SITE.email;
const PHONE_PLAIN = D.SITE.whatsapp, PHONE_SHOW = D.SITE.phone;
const OLD = '94224[\\s-]?39711';
const NOT_IN_WORD = '(?<![\\w\\-./$])', NOT_BEFORE = '(?![\\w\\-./$])';

function rebrand(s, isJs) {
  s = s
    .replace(/AVM\s+Tours\s*(?:&amp;|&|and)\s*Travels/gi, NAME)
    .replace(/AVM\s+Tours/gi, NAME)
    .replace(/vijay\.avmtravels@gmail\.com|md@avmtoursandtravels\.com/gi, EMAIL)
    .replace(new RegExp('(tel:\\s*)(?:\\+?91)?[\\s-]*' + OLD, 'gi'), '$1+' + PHONE_PLAIN)
    .replace(new RegExp('((?:wa\\.me/|phone=)\\+?)(?:91)?' + OLD, 'gi'), '$1' + PHONE_PLAIN)
    .replace(new RegExp('(?:\\+?91[\\s-]*)?' + OLD, 'g'), PHONE_SHOW);
  if (!isJs) s = s.replace(new RegExp(NOT_IN_WORD + 'AVM' + NOT_BEFORE, 'g'), NAME);
  return s;
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

module.exports = function (PUB) {
  const sendBranded = (res, file) => {
    const ext = path.extname(file).toLowerCase();
    res.set('Content-Type', TYPES[ext]).send(rebrand(fs.readFileSync(file, 'utf8'), ext === '.js'));
  };
  return function (req, res, next) {
    const orig = res.sendFile.bind(res);
    res.sendFile = function (p, ...rest) {
      if (TYPES[path.extname(p).toLowerCase()]) { try { return sendBranded(res, p); } catch (e) { /* fall through */ } }
      return orig(p, ...rest);
    };
    if (req.method === 'GET' || req.method === 'HEAD') {
      let rel;
      try { rel = decodeURIComponent(req.path); } catch (e) { return next(); }
      const abs = path.join(PUB, rel);
      if (abs.startsWith(PUB + path.sep)) {
        for (const f of [abs, abs + '.html']) {
          if (TYPES[path.extname(f).toLowerCase()] && fs.existsSync(f) && fs.statSync(f).isFile()) {
            try { return sendBranded(res, f); } catch (e) { break; }
          }
        }
      }
    }
    next();
  };
};
module.exports.rebrand = rebrand;
