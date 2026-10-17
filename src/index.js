import { verifySignature, replyText, notifyAdmin } from "./line.js";
import { answerFaq } from "./faq.js";
import { detectOrderCommand, listProducts, placeOrder } from "./orders.js";
import { adminApi, json } from "./admin-api.js";
import { adminHtml } from "./admin.js";

async function dispatchMessage(event, env) {
  const text = event.message.text.trim();
  if (text === "人工") {
    return { text: "已收到您希望聯繫真人客服的訊息。管理者會在 LINE OA 聊天室依服務時間回覆；這是課堂示範帳號。" };
  }
  if (/^(說明|help|HELP)$/.test(text)) {
    return { text: "可直接詢問常見問題，或輸入「商品」查看清單，再傳「訂購 P001」測試下單。需要真人請傳「人工」。" };
  }
  const command = detectOrderCommand(text);
  if (!command) return { text: await answerFaq(text, env) };
  if (command.type === "list") return { text: await listProducts(env) };
  return placeOrder(
    env, command.sku,
    String(event.webhookEventId || event.message.id),
    event.source?.type === "user" ? event.source?.userId : null
  );
}

async function handleEvent(event, env) {
  if (event.type !== "message" || event.message?.type !== "text") return;
  const eventId = String(event.webhookEventId || event.message.id || "");
  if (!eventId) return;
  // D1 acts as a simple deduplication gate. For commercial delivery guarantees,
  // use a queue and independent send-status records.
  const result = await env.DB.prepare(
    "INSERT OR IGNORE INTO processed_events(event_id) VALUES (?)"
  ).bind(eventId).run();
  if (result.meta.changes === 0) return;

  let action;
  try {
    action = await dispatchMessage(event, env);
  } catch (error) {
    console.error("Message dispatch failed:", error.message);
    action = { text: "系統暫時無法回覆，請傳「人工」聯繫真人客服。" };
  }
  try {
    await replyText(event.replyToken, action.text, env);
  } catch (error) {
    console.error("Reply failed:", error.message);
  }
  if (action.isNew && action.adminMessage) {
    try {
      await notifyAdmin(action.adminMessage, env);
    } catch (error) {
      console.error("Admin push failed:", error.message);
    }
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health")
      return json({ status: "ok", app: "line-ai-faq-course" });

    if (request.method === "GET" && url.pathname === "/admin")
      return new Response(adminHtml, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "Referrer-Policy": "no-referrer"
        }
      });

    if (url.pathname.startsWith("/api/admin/")) {
      try { return await adminApi(request, env, url); }
      catch (error) {
        console.error("Admin API error:", error.message);
        return json({ error: "操作失敗，請檢查資料及 Worker logs" }, 500);
      }
    }

    if (url.pathname === "/webhook/line" && request.method === "POST") {
      if (!env.LINE_CHANNEL_SECRET || !env.LINE_CHANNEL_ACCESS_TOKEN || !env.DB)
        return json({ error: "Server not configured" }, 503);
      if (Number(request.headers.get("Content-Length") || "0") > 100000)
        return json({ error: "Payload too large" }, 413);
      const raw = await request.text();
      if (raw.length > 100000) return json({ error: "Payload too large" }, 413);
      const signature = request.headers.get("x-line-signature");
      if (!await verifySignature(raw, signature, env.LINE_CHANNEL_SECRET))
        return json({ error: "Invalid signature" }, 401);
      let payload;
      try { payload = JSON.parse(raw); }
      catch { return json({ error: "Invalid JSON" }, 400); }
      const events = Array.isArray(payload.events) ? payload.events.slice(0, 50) : [];
      ctx.waitUntil(Promise.allSettled(events.map(e => handleEvent(e, env))));
      return json({ ok: true });
    }

    if (request.method === "GET" && url.pathname === "/")
      return json({ welcome: "女力 LINE OA × AI 課程示範 Worker", health: "/health", admin: "/admin" });
    return json({ error: "Not found" }, 404);
  }
};
