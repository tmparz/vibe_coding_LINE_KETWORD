import test from "node:test";
import assert from "node:assert/strict";
import { cleanFaqs, loadFaqs, answerFaq, FALLBACK } from "../src/faq.js";
import { verifySignature } from "../src/line.js";
import { detectBookingCommand } from "../src/bookings.js";
import worker from "../src/index.js";

test("DAY1 FAQ is loaded with no D1/R2 bindings", async () => {
  const list = await loadFaqs({});
  assert.ok(list.length >= 5);
  assert.equal(list.some(row => row.question.includes("營業")), true);
});
test("FAQ keeps every active item instead of searching or slicing 30 rows", () => {
  const many = Array.from({length: 35}, (_,i) => ({question: "問"+i,answer:"答"+i}));
  assert.equal(cleanFaqs(many).length, 35);
  assert.equal(cleanFaqs([{question:"停用",answer:"不應使用",active:0}]).length, 0);
});
test("Gemini key missing returns human fallback without D1", async () => {
  assert.equal(await answerFaq("你好", {}), FALLBACK);
});
test("Day2 booking command is explicit; ordinary FAQ remains FAQ", () => {
  assert.deepEqual(detectBookingCommand("時段"), {type:"list"});
  assert.deepEqual(detectBookingCommand("預約 S001"), {type:"reserve",code:"S001"});
  assert.equal(detectBookingCommand("請問可以預約嗎"), null);
});
test("LINE signature validates raw body bytes", async () => {
  const raw='{"events":[]}';
  const secret="test-secret";
  const key=await crypto.subtle.importKey("raw", new TextEncoder().encode(secret),
    {name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const sig=btoa(String.fromCharCode(...new Uint8Array(
    await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(raw))
  )));
  assert.equal(await verifySignature(raw,sig,secret),true);
  assert.equal(await verifySignature(raw+" ",sig,secret),false);
});
test("health route works on Day1 without DB", async () => {
  const r=await worker.fetch(new Request("https://example.test/health"),{},{});
  assert.equal(r.status,200);
  assert.deepEqual(await r.json(),{status:"ok",day2_booking_enabled:false,faq_storage:"embedded"});
});
test("valid Day1 empty webhook does not demand D1", async () => {
  const raw='{"events":[]}';
  const secret="test-secret";
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),
    {name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const sig=btoa(String.fromCharCode(...new Uint8Array(
    await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(raw))
  )));
  const r=await worker.fetch(new Request("https://example.test/webhook/line",
    {method:"POST",body:raw,headers:{"x-line-signature":sig}}),
    {LINE_CHANNEL_SECRET:secret,LINE_CHANNEL_ACCESS_TOKEN:"dummy"},
    {waitUntil(){}});
  assert.equal(r.status,200);
});
test("invalid signature rejected on Day1", async()=>{
  const r=await worker.fetch(new Request("https://example.test/webhook/line",
    {method:"POST",body:'{"events":[]}'}),
    {LINE_CHANNEL_SECRET:"dummy",LINE_CHANNEL_ACCESS_TOKEN:"dummy"},
    {waitUntil(){}});
  assert.equal(r.status,401);
});
