-- DAY 2 ONLY: D1 records available slots and pending bookings.
-- DAY 1 FAQ is an embedded JS list and is not stored here.
CREATE TABLE IF NOT EXISTS slots (
  code TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK(capacity > 0),
  reserved INTEGER NOT NULL DEFAULT 0 CHECK(reserved >= 0 AND reserved <= capacity),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN(0,1))
);
CREATE INDEX IF NOT EXISTS idx_slots_start ON slots(starts_at);
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  slot_code TEXT NOT NULL REFERENCES slots(code),
  line_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN('pending','confirmed','cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(slot_code,line_user_id)
);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);
-- A single INSERT atomically checks availability and increments reserved count.
-- If a subsequent UNIQUE constraint fails, this statement (including reserved++) rolls back.
CREATE TRIGGER IF NOT EXISTS trg_bookings_capacity
BEFORE INSERT ON bookings
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM slots
    WHERE code=NEW.slot_code AND active=1 AND reserved<capacity
  ) THEN RAISE(ABORT,'SLOT_UNAVAILABLE') END;
  UPDATE slots SET reserved=reserved+1 WHERE code=NEW.slot_code;
END;
