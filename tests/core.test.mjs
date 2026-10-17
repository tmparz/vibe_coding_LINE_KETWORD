import test from "node:test";
import assert from "node:assert/strict";
import { cleanFaqs, answerFaq, FALLBACK } from "../src/faq.js";
import { verifySignature } from "../src/line.js";
import { detectOrderCommand } from "../src/orders.js";
import worker from "../src/index.js";

test("FAQ removes inactive rows and empty answers", () => {
  const result = cleanFaqs([
    { question: "週末營業？", answer: "依公告", active: 1 },
    { question: "已停用", answer: "不應提供", active: 0 },
    { question: "空", answer: "" }
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].answer, "依公告");
});

test("Gemini key missing falls back to human", async () => {
  const env = { DB: { prepare: () => ({ all: async () => ({
    results: [{ question: "你好", answer: "您好", active: 1 }]
  }) }) } };
  assert.equal(await answerFaq("你好", env), FALLBACK);
});

test("specific order commands bypass general FAQ", () => {
  assert.deepEqual(detectOrderCommand("商品"), { type: "list" });
  assert.deepEqual(detectOrderCommand("訂購 P001"), { type: "order", sku: "P001" });
  assert.equal(detectOrderCommand("請問可以訂購嗎"), null);
});

test("LINE signature is HMAC SHA-256 over original bytes", async () => {
  const raw = '{"events":[]}';
  const secret = "test-secret";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = btoa(String.fromCharCode(...new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw))
  )));
  assert.equal(await verifySignature(raw, signature, secret), true);
  assert.equal(await verifySignature(raw + " ", signature, secret), false);
  assert.equal(await verifySignature(raw, "", secret), false);
});

test("health route does not require secrets", async () => {
  const result = await worker.fetch(new Request("https://example.test/health"), {}, {});
  assert.equal(result.status, 200);
  assert.equal((await result.json()).status, "ok");
});

test("webhook rejects requests without a LINE signature", async () => {
  const req = new Request("https://example.test/webhook/line", {
    method: "POST", body: JSON.stringify({ events: [] })
  });
  const resp = await worker.fetch(req, {
    LINE_CHANNEL_SECRET: "example", LINE_CHANNEL_ACCESS_TOKEN: "example",
    DB: {}
  }, { waitUntil() {} });
  assert.equal(resp.status, 401);
});
