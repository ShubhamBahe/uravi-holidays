'use strict';
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const dir = process.env.DATA_DIR || path.join(__dirname, 'data');
fs.mkdirSync(dir, { recursive: true });
const DB_FILE = path.join(dir, 'uravi.db');
const SCHEMA_VERSION = 1;
const db = new DatabaseSync(DB_FILE);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    package_slug TEXT,
    package_name TEXT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    travel_date TEXT,
    travelers INTEGER,
    budget TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    ip TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  CREATE INDEX IF NOT EXISTS idx_enq_status ON enquiries(status);
  CREATE INDEX IF NOT EXISTS idx_enq_created ON enquiries(created_at);
`);

// bump SCHEMA_VERSION and add a migration step here whenever the tables change
if (db.prepare('PRAGMA user_version').get().user_version < SCHEMA_VERSION) db.exec('PRAGMA user_version = ' + SCHEMA_VERSION);

const STATUSES = ['new', 'contacted', 'booked', 'closed'];

function insert(e) {
  const r = db.prepare(`INSERT INTO enquiries (type,package_slug,package_name,name,phone,email,travel_date,travelers,budget,message,ip)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(e.type, e.package_slug, e.package_name, e.name, e.phone, e.email, e.travel_date, e.travelers, e.budget, e.message, e.ip);
  return Number(r.lastInsertRowid);
}

function list({ status, q, limit = 50, offset = 0 }) {
  const where = [], args = [];
  if (status && STATUSES.includes(status)) { where.push('status = ?'); args.push(status); }
  if (q) { where.push('(name LIKE ? OR phone LIKE ? OR email LIKE ? OR package_name LIKE ? OR message LIKE ?)'); const t = '%' + q + '%'; args.push(t, t, t, t, t); }
  const w = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const total = db.prepare(`SELECT COUNT(*) c FROM enquiries ${w}`).get(...args).c;
  const rows = db.prepare(`SELECT * FROM enquiries ${w} ORDER BY id DESC LIMIT ? OFFSET ?`).all(...args, limit, offset);
  return { total, rows };
}
function setStatus(id, status) { return db.prepare('UPDATE enquiries SET status=? WHERE id=?').run(status, id).changes > 0; }
function remove(id) { return db.prepare('DELETE FROM enquiries WHERE id=?').run(id).changes > 0; }
function stats() {
  const out = { total: 0, new: 0, contacted: 0, booked: 0, closed: 0 };
  db.prepare('SELECT status, COUNT(*) c FROM enquiries GROUP BY status').all().forEach(r => { out[r.status] = r.c; out.total += r.c; });
  return out;
}
function all() { return db.prepare('SELECT * FROM enquiries ORDER BY id DESC').all(); }

function ping() { return db.prepare('SELECT 1 AS ok').get().ok === 1; }
function close() { try { db.close(); } catch (e) { /* already closed */ } }
// consistent snapshot of the live database into a new file (safe while the site is running)
function backupTo(file) { db.exec("VACUUM INTO '" + String(file).replace(/'/g, "''") + "'"); }
function info() {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(r => r.name);
  return { file: DB_FILE, version: db.prepare('PRAGMA user_version').get().user_version, tables, enquiries: stats() };
}

module.exports = { insert, list, setStatus, remove, stats, all, STATUSES, ping, close, backupTo, info, DB_FILE };
