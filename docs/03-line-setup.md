# DAY 1｜LINE 官方帳號與 Messaging API 操作

1. 至 https://manager.line.biz/ 認識官方帳號：聊天、歡迎訊息、內建關鍵字回應、圖文選單及真人接手。
2. 從 LINE OA Manager 的設定中啟用 Messaging API，再至 https://developers.line.biz/ 找到 Channel Secret、Channel Access Token、Webhook 設定。
3. **第一天資料流：** 顧客文字 → LINE → Worker 驗證簽章 → 讀取 src/faq-data.js 的**完整 FAQ** → 顧客文字 + FAQ 一次送 Gemini → LINE reply。
4. Webhook URL： https://<你的-worker>.workers.dev/webhook/line。Verify 後啟用 webhook；依課堂需求調整 OA 原有自動回覆，避免雙重回答。
5. 實機驗收「請問週末有營業嗎」／「假日也開門嗎」等同義句；未知問題要引導「人工」。

## DAY 2：預約和 FAQ 的分流
- 顧客傳「時段」→ Worker 查 **D1 的 slots**。
- 顧客傳「預約 S001」→ Worker 寫 **D1 的 bookings**（待確認）。
- 顧客自然語言問「可以預約嗎？」→ **仍由 Gemini FAQ** 回答，不需要 D1。
- 只有預約的業務指令能寫資料庫；Gemini 不具備自行寫入預約的權限。

## 安全與排錯
收到 401：檢查是否使用原始 request body 驗證 LINE x-line-signature，且 Secret 與 OA 相同。
Verify 成功卻無回答：看 Worker logs、Token、Gemini Key、模型及 FAQ 檔。
預約不成功：Day 2 才檢查 D1 binding、slots 容量和指令格式。
金鑰外洩要立即撤銷並重發；不要貼給 AI。

官方文件：
https://developers.line.biz/en/docs/messaging-api/getting-started/
https://developers.line.biz/en/docs/messaging-api/verify-webhook-signature/
