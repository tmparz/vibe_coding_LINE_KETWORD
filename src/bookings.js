// DAY 2：D1 只處理有狀態的時段和預約，不儲存 FAQ。
const LIST = /^(時段|預約時段|可預約時段)$/;
const RESERVE = /^預約\s+(S[0-9A-Z_-]{1,20})$/i;

export function detectBookingCommand(message) {
  const value = String(message || "").trim();
  if (LIST.test(value)) return { type: "list" };
  const match = value.match(RESERVE);
  return match ? { type: "reserve", code: match[1].toUpperCase() } : null;
}

export async function listSlots(env) {
  const { results } = await env.DB.prepare(
    "SELECT code,title,starts_at,capacity,reserved FROM slots WHERE active=1 ORDER BY starts_at LIMIT 20"
  ).all();
  if (!results.length) return "目前沒有可預約的示範時段，請傳「人工」詢問。";
  const lines = results.map(s =>
    s.code + "｜" + s.title + "｜" + s.starts_at + "｜剩餘 " +
    Math.max(0, s.capacity - s.reserved) + " 位"
  );
  return "示範時段（日期含 +08:00 台灣時區）：\n" +
    lines.join("\n") + "\n\n傳「預約 S001」（依列表更換代碼）送出待確認預約。";
}

export async function reserveSlot(env, code, eventId, userId) {
  if (!userId) return { text: "請使用一對一 LINE 聊天室進行預約練習。" };
  const slot = await env.DB.prepare(
    "SELECT code,title,starts_at FROM slots WHERE code=? AND active=1"
  ).bind(code).first();
  if (!slot) return { text: "找不到該時段，請輸入「時段」重新查詢。" };
  const bookingId = crypto.randomUUID();
  try {
    // D1/SQLite trigger 將容量檢查和名額增加放在單筆 INSERT 的原子操作中。
    await env.DB.prepare(
      "INSERT INTO bookings(id,event_id,slot_code,line_user_id,status) VALUES(?,?,?,?,'pending')"
    ).bind(bookingId, eventId, code, userId).run();
  } catch (e) {
    const old = await env.DB.prepare(
      "SELECT id FROM bookings WHERE event_id=?"
    ).bind(eventId).first();
    if (old) return { text: "此訊息已受理，預約編號：" + old.id, isNew: false };
    console.error("Booking insert failed:", e.message);
    return { text: "這個時段可能已額滿、已預約或暫停受理，請傳「時段」重新確認。" };
  }
  return {
    text: "已收到待確認的測試預約！\n預約編號：" + bookingId +
      "\n項目：" + slot.title + "\n時段：" + slot.starts_at +
      "\n尚未完成付款，也不代表商家已確認預約。",
    isNew: true,
    adminMessage: "LINE 新測試預約\n預約編號：" + bookingId +
      "\n項目：" + slot.title + "\n時段：" + slot.starts_at
  };
}
