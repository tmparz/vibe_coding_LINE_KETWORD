// Day 2 only. Classroom token; 正式環境請換成有身分驗證與角色權限的後台。
export function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"
  } });
}
function authorized(req, env) {
  if (!env.ADMIN_TOKEN) return json({ error: "ADMIN_TOKEN missing" }, 503);
  if (req.headers.get("Authorization") !== "Bearer " + env.ADMIN_TOKEN)
    return json({ error: "Unauthorized" }, 401);
  if (!env.DB) return json({ error: "D1 DB binding missing" }, 503);
  return null;
}
export async function adminApi(req, env, url) {
  const error = authorized(req, env);
  if (error) return error;
  const path = url.pathname, method = req.method;
  if (path === "/api/admin/slots" && method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT code,title,starts_at,capacity,reserved,active FROM slots ORDER BY starts_at LIMIT 100"
    ).all();
    return json({ slots: results });
  }
  if (path === "/api/admin/slots" && method === "POST") {
    const b = await req.json().catch(() => null);
    if (!b || typeof b.code !== "string" || !/^S[0-9A-Z_-]{1,20}$/.test(b.code) ||
      typeof b.title !== "string" || !b.title.trim() || b.title.length > 80 ||
      typeof b.starts_at !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(b.starts_at) ||
      !Number.isInteger(b.capacity) || b.capacity < 1 || b.capacity > 1000)
      return json({ error: "時段資料格式錯誤，時間格式範例 2026-12-05T10:00:00+08:00" }, 400);
    try {
      await env.DB.prepare(
        "INSERT INTO slots(code,title,starts_at,capacity) VALUES(?,?,?,?)"
      ).bind(b.code,b.title.trim(),b.starts_at,b.capacity).run();
      return json({ code: b.code }, 201);
    } catch { return json({ error: "時段代碼已存在或資料庫拒絕寫入" }, 409); }
  }
  const slot = path.match(/^\/api\/admin\/slots\/(S[0-9A-Z_-]{1,20})$/);
  if (slot && method === "PATCH") {
    const b = await req.json().catch(() => null);
    if (!b || ![0,1].includes(b.active)) return json({ error: "active 必須為 0 或 1" }, 400);
    const r = await env.DB.prepare("UPDATE slots SET active=? WHERE code=?")
      .bind(b.active,slot[1]).run();
    return json({ changed: r.meta.changes });
  }
  if (path === "/api/admin/bookings" && method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT b.id,b.slot_code,s.title,s.starts_at,b.status,b.created_at FROM bookings b JOIN slots s ON b.slot_code=s.code ORDER BY b.created_at DESC LIMIT 100"
    ).all();
    // 教學頁避免直接展示 LINE User ID。
    return json({ bookings: results });
  }
  return json({ error: "Route not found" }, 404);
}
