'use strict';
/* Saves a safe copy of the database to <DATA_DIR>/backups/ and keeps the newest KEEP copies (default 14).
   Safe to run while the website is running:  npm run db:backup  */
const fs = require('fs');
const path = require('path');
const db = require('../db');

const dir = path.join(path.dirname(db.DB_FILE), 'backups');
const keep = Math.max(1, parseInt(process.env.KEEP || '14', 10));
fs.mkdirSync(dir, { recursive: true });
const d = new Date(), p = n => String(n).padStart(2, '0');
const file = path.join(dir, 'uravi-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()) + String(d.getMilliseconds()).padStart(3, '0') + '.db');
db.backupTo(file);
console.log('Backup saved: ' + file + ' (' + Math.round(fs.statSync(file).size / 1024) + ' KB)');
fs.readdirSync(dir).filter(f => /^uravi-.*\.db$/.test(f)).sort().reverse().slice(keep)
  .forEach(f => { fs.unlinkSync(path.join(dir, f)); console.log('Removed old backup: ' + f); });
db.close();
