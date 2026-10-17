# 官方參考、版本限制與待驗證項目

## 官方文件（2026-10-17 查證）
- LINE Messaging API 開始使用：https://developers.line.biz/en/docs/messaging-api/getting-started/
- LINE Webhook 簽章：https://developers.line.biz/en/docs/messaging-api/verify-webhook-signature/
- LINE Webhook 接收：https://developers.line.biz/en/docs/messaging-api/receiving-messages/
- LINE 回覆訊息：https://developers.line.biz/en/docs/messaging-api/sending-messages/
- Cloudflare D1 起步：https://developers.cloudflare.com/d1/get-started/
- Cloudflare D1 migrations：https://developers.cloudflare.com/d1/reference/migrations/
- Cloudflare R2 Workers API：https://developers.cloudflare.com/r2/get-started/workers-api/
- Gemini API：https://ai.google.dev/gemini-api/docs/
- 原 6 小時 Vibe Coding 教材：https://github.com/tmparz/vibe-coding-course-guide

## 請講師課前複核
1. LINE OA Manager 當日介面位置；Messaging API 必須先在 OA Manager 啟用。
2. Cloudflare D1/R2 免費用量與信用卡要求（不同帳號情況、方案可能不同），不可宣稱「永遠免費」。
3. Google AI Studio API Key 開通、可用 Gemini model ID、配額、資料使用條款及成本；本 Repo GEMINI_MODEL 預設 gemini-2.5-flash，若當日 API 不支援需改為可用模型。
4. LINE 免費訊息數、管理員主動推播限制與 OA 訊息方案；請依官方最新公告。
5. 接觸真實消費者資料前，補足隱私告知、留存期間、授權、備份與管理權限。

## 教學 M​VP 的限制
- FAQ 採最多 30 筆上下文模式；不是向量化 RAG。
- 只支援文字訊息，缺少多媒體、排班引擎、付款與會員。
- 後台使用單一管理金鑰，適合課堂與小型封閉 Demo；正式上線須加身分驗證、操作紀錄、權限控管與防暴力破解。
- Webhook 採已驗簽後非同步回應；未配置重試佇列與完整可觀測性，不能宣稱企業級可靠度。