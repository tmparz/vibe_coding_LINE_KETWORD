const LIST_COMMANDS = /^(商品|商品列表|課程|課程列表)$/;
const ORDER_COMMAND = /^訂購\s+(P[0-9A-Z_-]{1,20})$/i;

export function detectOrderCommand(message) {
  const s = String(message || "").trim();
  if (LIST_COMMANDS.test(s)) return { type: "list" };
  const m = s.match(ORDER_COMMAND);
  return m ? { type: "order", sku: m[1].toUpperCase() } : null;
}

export async function listProducts(env) {
  const { results } = await env.DB.prepare(
    "SELECT sku,title,price,stock,kind FROM products WHERE active=1 ORDER BY sku LIMIT 20"
  ).all();
  if (!results.length) return "目前沒有上架的商品或課程，請傳「人工」詢問。";
  const lines = results.map(p =>
    p.sku + "｜" + p.title + "｜NT$" + p.price +
    "｜" + (p.kind === "class" ? "名額 " : "庫存 ") + p.stock
  );
  return "目前可選擇的項目：\n" + lines.join("\n") +
    "\n\n傳「訂購 P001」建立測試訂單（請換成上方 SKU）。訂單不等於付款完成。";
}

export async function placeOrder(env, sku, eventId, lineUserId) {
  if (!lineUserId) return { text: "請在一對一 LINE 聊天室進行測試下單。" };
  const product = await env.DB.prepare(
    "SELECT sku,title,price FROM products WHERE sku=? AND active=1"
  ).bind(sku).first();
  if (!product) return { text: "找不到該項目或已下架，請輸入「商品」重新查詢。" };

  const orderId = crypto.randomUUID();
  try {
    // Trigger trg_orders_check_stock validates stock and decrements atomically.
    await env.DB.prepare(
      "INSERT INTO orders (id,event_id,sku,line_user_id,status) VALUES (?,?,?,?, 'pending')"
    ).bind(orderId, eventId, sku, lineUserId).run();
  } catch (e) {
    const existing = await env.DB.prepare("SELECT id FROM orders WHERE event_id=?").bind(eventId).first();
    if (existing) return { text: "這則訊息已建立過訂單，單號：" + existing.id, isNew: false };
    console.error("Order insert failed:", e.message);
    return { text: "此項目可能已額滿或暫時無法受理，請輸入「商品」確認，或傳「人工」聯繫客服。" };
  }
  return {
    text: "已收到測試訂單！\n單號：" + orderId + "\n項目：" + product.title +
      "\n金額：NT$" + product.price + "\n狀態：待確認（尚未付款）",
    isNew: true,
    adminMessage: "LINE 新測試訂單\n單號：" + orderId +
      "\n項目：" + product.title + "\n金額：NT$" + product.price +
      "\n請登入管理介面確認。"
  };
}
