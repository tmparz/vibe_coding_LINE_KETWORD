"""Day2 D1/SQLite booking invariants. Execute with unittest discover."""
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
    def reserve(self, event, user="U1", slot="S001"):
        self.db.execute(
            "INSERT INTO bookings(id,event_id,slot_code,line_user_id,status) VALUES(?,?,?,?,'pending')",
            ("booking-"+event, event, slot, user)
        )
    def count(self):
        return self.db.execute("SELECT reserved FROM slots WHERE code='S001'").fetchone()[0]
    def test_new_booking_increases_reserved_once(self):
        self.reserve("e1")
        self.assertEqual(self.count(), 1)
    def test_event_retry_does_not_double_count(self):
        self.reserve("e1")
        with self.assertRaises(sqlite3.IntegrityError):
            self.reserve("e1", "U2")
        self.assertEqual(self.count(), 1)
    def test_same_user_cannot_book_same_slot_twice(self):
        self.reserve("e1")
        with self.assertRaises(sqlite3.IntegrityError):
            self.reserve("e2")
        self.assertEqual(self.count(), 1)
    def test_slot_at_capacity_rejects(self):
        self.db.execute("UPDATE slots SET reserved=capacity WHERE code='S001'")
        with self.assertRaises(sqlite3.IntegrityError):
            self.reserve("e1")
        self.assertEqual(self.count(), 5)
    def test_disabled_slot_rejects(self):
        self.db.execute("UPDATE slots SET active=0 WHERE code='S001'")
        with self.assertRaises(sqlite3.IntegrityError):
            self.reserve("e1")
        self.assertEqual(self.count(), 0)
if __name__=="__main__":
    unittest.main()
