"""SQLite/D1 schema contract tests. Run: python3 -m unittest discover -s tests -p '*_test.py'."""
import sqlite3
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

class SchemaTest(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(":memory:")
        self.db.executescript((ROOT / "migrations" / "0001_init.sql").read_text("utf-8"))
        self.db.executescript((ROOT / "seeds" / "demo.sql").read_text("utf-8"))

    def tearDown(self):
        self.db.close()

    def place(self, event, sku="P001"):
        self.db.execute(
            "INSERT INTO orders(id,event_id,sku,line_user_id,status) VALUES (?,?,?,?, 'pending')",
            ("order-" + event, event, sku, "U" + ("a" * 32))
        )

    def stock(self, sku="P001"):
        return self.db.execute("SELECT stock FROM products WHERE sku=?", (sku,)).fetchone()[0]

    def test_first_order_decrements_exactly_one(self):
        self.place("event-1")
        self.assertEqual(self.stock(), 9)

    def test_duplicate_event_rolls_back_stock_change(self):
        self.place("event-1")
        with self.assertRaises(sqlite3.IntegrityError):
            self.place("event-1")
        self.assertEqual(self.stock(), 9)
        count = self.db.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
        self.assertEqual(count, 1)

    def test_out_of_stock_rejects_order(self):
        self.db.execute("UPDATE products SET stock=0 WHERE sku='P001'")
        with self.assertRaises(sqlite3.IntegrityError):
            self.place("event-2")
        self.assertEqual(self.stock(), 0)

    def test_inactive_product_rejects_order(self):
        self.db.execute("UPDATE products SET active=0 WHERE sku='P001'")
        with self.assertRaises(sqlite3.IntegrityError):
            self.place("event-3")
        self.assertEqual(self.stock(), 10)

if __name__ == "__main__":
    unittest.main()
