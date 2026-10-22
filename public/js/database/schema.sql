-- Reference copy of the database schema (SQLite). db.js creates this automatically; you never need to run it by hand.
-- Keep it here for documentation or if you ever move the data to another database.
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS enquiries (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  type          TEXT NOT NULL,              -- package | tour | safari | contact | custom | corporate | quick
  package_slug  TEXT,
  package_name  TEXT,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT,
  travel_date   TEXT,
  travelers     INTEGER,
  budget        TEXT,
  message       TEXT,
  status        TEXT NOT NULL DEFAULT 'new', -- new | contacted | booked | closed
  ip            TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_enq_status  ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enq_created ON enquiries(created_at);

PRAGMA user_version = 1;
