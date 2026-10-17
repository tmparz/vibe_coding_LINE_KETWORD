// LINE Messaging API: verify raw webhook bytes before JSON parsing.
const encoder = new TextEncoder();

export async function verifySignature(raw, received, channelSecret) {
  if (!received || !channelSecret) return false;
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(channelSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(raw)));
  const expected = btoa(String.fromCharCode(...bytes));
  if (expected.length !== received.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) mismatch |= expected.charCodeAt(i) ^ received.charCodeAt(i);
  return mismatch === 0;
}

async function linePost(path, data, token) {
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN not configured");
  const resp = await fetch("https://api.line.me/v2/bot/message/" + path, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(9000)
  });
  if (!resp.ok) throw new Error("LINE API error HTTP " + resp.status);
}

export function shortLineText(text) {
  return String(text || "").slice(0, 1800);
}

export async function replyText(replyToken, message, env) {
  if (!replyToken) return;
  await linePost("reply", {
    replyToken,
    messages: [{ type: "text", text: shortLineText(message) || "目前無法回答，請稍後再試。" }]
  }, env.LINE_CHANNEL_ACCESS_TOKEN);
}

export async function notifyAdmin(message, env) {
  if (!env.LINE_ADMIN_USER_ID) return;
  await linePost("push", {
    to: env.LINE_ADMIN_USER_ID,
    messages: [{ type: "text", text: shortLineText(message) }]
  }, env.LINE_CHANNEL_ACCESS_TOKEN);
}
