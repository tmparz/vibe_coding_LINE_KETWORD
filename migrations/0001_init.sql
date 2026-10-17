-- D1 SQLite schema / classroom MVP, read docs/05-day2-project.md
CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  tag TEXT NOT NULL DEFAULT 'general',
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(active, id);

CREATE TABLE IF NOT EXISTS products (
  sku TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0 CHECK(price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  kind TEXT NOT NULL DEFAULT 'goods' CHECK(kind IN ('goods','class')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL REFERENCES products(sku),
  line_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- SQLite trigger: stock decrement and insert happen in ONE statement transaction.
-- Unique event_id violation rolls back the trigger's decrement.
CREATE TRIGGER IF NOT EXISTS trg_orders_check_stock
BEFORE INSERT ON orders
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM products
    WHERE sku = NEW.sku AND active = 1 AND stock > 0
  ) THEN RAISE(ABORT, 'OUT_OF_STOCK') END;
  UPDATE products SET stock = stock - 1, updated_at = datetime('now')
  WHERE sku = NEW.sku;
END;

CREATE TABLE IF NOT EXISTS processed_events (
  event_id TEXT PRIMARY KEY,
  received_at TEXT NOT NULL DEFAULT (datetime('now'))
);
