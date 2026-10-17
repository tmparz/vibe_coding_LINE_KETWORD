// Classroom-only admin API: replace single token auth with identity/roles for production.
export function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

const goodText = (value, max = 150) =>
  typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;
const intWithin = (value, min, max) =>
  Number.isInteger(value) && value >= min && value <= max;
const skuValid = value => typeof value === "string" && /^P[0-9A-Z_-]{1,20}$/.test(value);

function unauthorized(req, env) {
  if (!env.ADMIN_TOKEN) return json({ error: "ADMIN_TOKEN is not configured" }, 503);
  if (req.headers.get("Authorization") !== "Bearer " + env.ADMIN_TOKEN)
    return json({ error: "Unauthorized" }, 401);
  return null;
}

export async function adminApi(req, env, url) {
  const authError = unauthorized(req, env);
  if (authError) return authError;
  if (!env.DB) return json({ error: "DB binding missing" }, 503);

  const path = url.pathname;
  const method = req.method;
  if (path === "/api/admin/faqs" && method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT id,question,answer,tag,active,updated_at FROM faqs ORDER BY id DESC LIMIT 100"
    ).all();
    return json({ faqs: results });
  }
  if (path === "/api/admin/faqs" && method === "POST") {
    const b = await req.json().catch(() => null);
    if (!b || !goodText(b.question, 200) || !goodText(b.answer, 800) ||
        (b.tag != null && !goodText(b.tag, 60)))
      return json({ error: "FAQ question / answer 格式錯誤" }, 400);
    const result = await env.DB.prepare(
      "INSERT INTO faqs(question,answer,tag) VALUES (?,?,?)"
    ).bind(b.question.trim(), b.answer.trim(), (b.tag || "general").trim()).run();
    return json({ id: result.meta.last_row_id }, 201);
  }

  const faqMatch = path.match(/^\/api\/admin\/faqs\/(\d+)$/);
  if (faqMatch && method === "PATCH") {
    const b = await req.json().catch(() => null);
    if (!b || (b.question !== undefined && !goodText(b.question, 200)) ||
        (b.answer !== undefined && !goodText(b.answer, 800)) ||
        (b.tag !== undefined && !goodText(b.tag, 60)) ||
        (b.active !== undefined && ![0,1].includes(b.active)))
      return json({ error: "FAQ patch 格式錯誤" }, 400);
    const result = await env.DB.prepare(
      "UPDATE faqs SET question=COALESCE(?,question), answer=COALESCE(?,answer), " +
      "tag=COALESCE(?,tag), active=COALESCE(?,active),updated_at=datetime('now') WHERE id=?"
    ).bind(b.question ?? null, b.answer ?? null, b.tag ?? null, b.active ?? null, Number(faqMatch[1])).run();
    return json({ changed: result.meta.changes });
  }

  if (path === "/api/admin/products" && method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT sku,title,description,price,stock,kind,active,updated_at FROM products ORDER BY sku LIMIT 100"
    ).all();
    return json({ products: results });
  }
  if (path === "/api/admin/products" && method === "POST") {
    const b = await req.json().catch(() => null);
    if (!b || !skuValid(b.sku) || !goodText(b.title, 80) ||
      (b.description != null && typeof b.description !== "string") ||
      (typeof b.description === "string" && b.description.length > 300) ||
      !intWithin(b.price, 0, 99999999) || !intWithin(b.stock, 0, 999999) ||
      !["goods","class"].includes(b.kind))
      return json({ error: "Product input 格式錯誤" }, 400);
    try {
      await env.DB.prepare(
        "INSERT INTO products(sku,title,description,price,stock,kind) VALUES (?,?,?,?,?,?)"
      ).bind(b.sku,b.title.trim(),b.description || "",b.price,b.stock,b.kind).run();
      return json({ sku: b.sku }, 201);
    } catch {
      return json({ error: "SKU 已存在或資料庫拒絕寫入" }, 409);
    }
  }
  const productMatch = path.match(/^\/api\/admin\/products\/(P[0-9A-Z_-]{1,20})$/);
  if (productMatch && method === "PATCH") {
    const b = await req.json().catch(() => null);
    if (!b || (b.title !== undefined && !goodText(b.title,80)) ||
      (b.description !== undefined && (typeof b.description !== "string" || b.description.length > 300)) ||
      (b.price !== undefined && !intWithin(b.price,0,99999999)) ||
      (b.stock !== undefined && !intWithin(b.stock,0,999999)) ||
      (b.active !== undefined && ![0,1].includes(b.active)) ||
      (b.kind !== undefined && !["goods","class"].includes(b.kind)))
      return json({ error: "Product patch 格式錯誤" }, 400);
    const result = await env.DB.prepare(
      "UPDATE products SET title=COALESCE(?,title),description=COALESCE(?,description)," +
      "price=COALESCE(?,price),stock=COALESCE(?,stock),active=COALESCE(?,active)," +
      "kind=COALESCE(?,kind),updated_at=datetime('now') WHERE sku=?"
    ).bind(b.title ?? null,b.description ?? null,b.price ?? null,b.stock ?? null,
      b.active ?? null,b.kind ?? null,productMatch[1]).run();
    return json({ changed: result.meta.changes });
  }

  if (path === "/api/admin/orders" && method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT o.id,o.sku,p.title,o.status,o.created_at " +
      "FROM orders o JOIN products p ON p.sku=o.sku ORDER BY o.created_at DESC LIMIT 100"
    ).all();
    return json({ orders: results });
  }
  const orderMatch = path.match(/^\/api\/admin\/orders\/([0-9a-f-]{36})$/);
  if (orderMatch && method === "PATCH") {
    const b = await req.json().catch(() => null);
    if (!b || !["pending","confirmed","cancelled"].includes(b.status))
      return json({ error: "訂單狀態錯誤" }, 400);
    const result = await env.DB.prepare("UPDATE orders SET status=? WHERE id=?")
      .bind(b.status, orderMatch[1]).run();
    // Demo: intentionally no automatic restock on cancellation.
    return json({ changed: result.meta.changes });
  }
  return json({ error: "Route not found" }, 404);
}
