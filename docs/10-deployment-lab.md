# Windows PowerShell 課堂操作：兩天分開走

## DAY 1｜完全不用 D1、R2
```powershell
git clone https://github.com/tmparz/vibe_coding_LINE_KETWORD.git
cd vibe_coding_LINE_KETWORD
npm install
npx wrangler login
Copy-Item .dev.vars.example .dev.vars
```
編輯 **src/faq-data.js**，把自己的 FAQ 問答放入列表；編輯本機 .dev.vars 放入 LINE 與 Gemini 三組金鑰（自己輸入、不交給講師）。

```powershell
npm run dev
```
查看 http://localhost:8787/health ，確認 faq_storage=embedded，day2_booking_enabled=false。

雲端部署前逐一輸入秘密：
```powershell
npx wrangler secret put LINE_CHANNEL_SECRET
npx wrangler secret put LINE_CHANNEL_ACCESS_TOKEN
npx wrangler secret put GEMINI_API_KEY
npm run deploy
```
於 LINE Developers 將 Webhook URL 設為 https://你的-worker.你的-subdomain.workers.dev/webhook/line。啟用 webhook，手機測 FAQ。**當日沒有建表、匯入 SQL、建立 R2 bucket 的步驟。**

## DAY 2｜預約才用 D1
```powershell
npx wrangler d1 create line-course-bookings
```
把回傳的 database_id 貼到 **wrangler.day2.jsonc**，取代 00000000-0000-0000-0000-000000000000。

```powershell
npm run db:local
npm run seed:local
npm run dev:day2
```
本機 http://localhost:8787/admin 需要 ADMIN_TOKEN（本機 .dev.vars 已設定）。

完成後到雲端：
```powershell
npm run db:remote
npm run seed:remote
npx wrangler secret put ADMIN_TOKEN
# 如果需要測試管理員通知，再設定 LINE_ADMIN_USER_ID
npx wrangler secret put LINE_ADMIN_USER_ID
npm run deploy:day2
```
因為兩天使用同一 Worker 名稱，既有 LINE / Gemini secrets 會沿用；Day 2 只是多了 D1 binding、BOOKING_ENABLED=true。

手機測：
- 「時段」：看時段、名額。
- 「預約 S001」：建立待確認預約。
- 「星期日有營業嗎」：仍由靜態 FAQ 呼叫 Gemini 回答。

**重要**：SQL seed 使用固定的 2026 年 12 月示範日期，上課前須確認日期仍可用；重跑同一份 seed 可能遇到代碼重複，請勿直接在已有正式資料的 D1 執行。所有預約都只是練習，不可接入真實顧客/付款。

## FAQ 變更
編輯 src/faq-data.js 後重新 npm run deploy:day2；這樣維持第一天與第二天 FAQ 的資料來源完全一致。未來 FAQ 很多且需要線上維護時，再考慮 R2，非此課程必修。
