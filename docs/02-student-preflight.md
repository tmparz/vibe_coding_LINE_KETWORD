# 課前準備（學員）

準備：筆電、電源、手機 LINE、可登入 LINE Official Account Manager 和 Developers、Cloudflare 帳號、Google AI Studio/Gemini API、AI 協作工具與 VS Code、Node.js、Git（亦可用 GitHub ZIP）。

第一天帶 5–10 題已確認的常見問答（商家公開資訊，不能有客戶個資），會直接填進 src/faq-data.js；**不必建立 D1、R2 或提供 R2 信用卡付款資訊。**

第二天才會建立 D1 預約資料庫與簡單預約時段。可先想像自己的服務或課程：一個服務名稱、可預約時段、每時段容量。請勿拿正式顧客資料示範。

## 只能由學員本人填寫的秘密
- LINE_CHANNEL_SECRET
- LINE_CHANNEL_ACCESS_TOKEN
- GEMINI_API_KEY
- ADMIN_TOKEN（第二天預約後台才需要）

這些金鑰不要放 GitHub、公開畫面、AI 對話、作業截圖或講師的表單。

## 講師課前測試
- DAY 1：無 DB binding，LINE Webhook 仍能啟動、讀到靜態 FAQ、呼叫 Gemini、回覆真人 LINE。
- DAY 2：同一個 Worker 加上 D1 binding 後，預約指令操作 slots/bookings；FAQ 仍不查 D1。
- 準備無網路或 API 配額不足時的錄影與講師 Demo。
