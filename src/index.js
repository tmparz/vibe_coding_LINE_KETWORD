import { verifySignature, replyText, notifyAdmin } from "./line.js";
import { answerFaq } from "./faq.js";
import { detectBookingCommand, listSlots, reserveSlot } from "./bookings.js";
import { adminApi, json } from "./admin-api.js";
import { adminHtml } from "./admin.js";

function bookingEnabled(env) { return env.BOOKING_ENABLED === "true"; }

async function dispatchMessage(event, env) {
  const text = event.message.text.trim();
  if (text === "人工") return { text: "請稍候，由真人客服依服務時間回覆。這是課堂示範帳號。" };
  if (/^(說明|help|HELP)$/.test(text))
    return { text: bookingEnabled(env)
      ? "直接詢問 FAQ；傳「時段」看示範時段，傳「預約 S001」建立待確認預約；人工客服請傳「人工」。"
      : "直接詢問常見問題；不知道的答案會引導真人客服。第二天才啟用預約功能。" };
  const cmd = bookingEnabled(env) ? detectBookingCommand(text) : null;
  if (cmd) {
    if (!env.DB) return { text: "預約功能尚未設定 D1，請通知課堂講師。" };
    if (cmd.type === "list") return { text: await listSlots(env) };
    return reserveSlot(
      env, cmd.code, String(event.webhookEventId || event.message.id),
      event.source?.type === "user" ? event.source?.userId : null
    );
  }
  return { text: await answerFaq(text, env) };
}

async function handleEvent(event, env) {
  if (event.type !== "message" || event.message?.type !== "text") return;
  let action;
  try { action = await dispatchMessage(event, env); }
  catch (error) {
    console.error("Message dispatch failed:", error.message);
    action = { text: "系統暫時無法回覆，請傳「人工」聯繫真人客服。" };
  }
  try { await replyText(event.replyToken, action.text, env); }
  catch (error) { console.error("Reply failed:", error.message); }
  if (action.isNew && action.adminMessage) {
    try { await notifyAdmin(action.adminMessage, env); }
    catch (error) { console.error("Admin push failed:", error.message); }
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health")
      return json({ status: "ok", day2_booking_enabled: bookingEnabled(env), faq_storage: env.FAQ_SOURCE === "r2" ? "r2" : "embedded" });
    if (request.method === "GET" && url.pathname === "/admin") {
      if (!bookingEnabled(env)) return json({ message: "第一天 FAQ 不需要管理後台；第二天才啟用預約管理。" });
      return new Response(adminHtml, { headers: {
        "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Referrer-Policy": "no-referrer"
      } });
    }
    if (url.pathname.startsWith("/api/admin/")) {
      if (!bookingEnabled(env)) return json({ error: "Booking module disabled" }, 404);
      try { return await adminApi(request, env, url); }
      catch (error) {
        console.error("Admin API error:", error.message);
        return json({ error: "操作失敗，請檢查輸入和 Worker logs" }, 500);
      }
    }
    if (url.pathname === "/webhook/line" && request.method === "POST") {
      // 第一日 FAQ 不需要 env.DB，第二日只有預約操作才存取 D1。
      if (!env.LINE_CHANNEL_SECRET || !env.LINE_CHANNEL_ACCESS_TOKEN)
        return json({ error: "LINE secrets not configured" }, 503);
      if (Number(request.headers.get("Content-Length") || "0") > 100000)
        return json({ error: "Payload too large" }, 413);
      const raw = await request.text();
      if (raw.length > 100000) return json({ error: "Payload too large" }, 413);
      if (!await verifySignature(raw, request.headers.get("x-line-signature"), env.LINE_CHANNEL_SECRET))
        return json({ error: "Invalid signature" }, 401);
      let payload;
      try { payload = JSON.parse(raw); }
      catch { return json({ error: "Invalid JSON" }, 400); }
      const events = Array.isArray(payload.events) ? payload.events.slice(0, 50) : [];
      ctx.waitUntil(Promise.allSettled(events.map(e => handleEvent(e, env))));
      return json({ ok: true });
    }
    if (request.method === "GET" && url.pathname === "/")
      return json({ welcome: "女力 LINE OA × AI 課堂 Worker", faq: "DAY 1 靜態資料", bookings: bookingEnabled(env) ? "DAY 2 D1 開啟" : "未開啟" });
    return json({ error: "Not found" }, 404);
  }
};
