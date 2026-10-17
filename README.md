# 女力 LINE OA × AI 工作流進階班｜12 小時實作教材

> DAY 1：LINE 後台 + 自然語言 FAQ（直接把完整 FAQ 與顧客問題送 Gemini，不用資料庫）。
> DAY 2：Vibe Coding + LINE 預約系統（**D1 只負責時段與預約紀錄**）。

## 兩天是兩種獨立功能
- **FAQ 模組**：學員把已確認的問答編寫在 [src/faq-data.js](src/faq-data.js)，Worker 收到 LINE 訊息後，將顧客原句與**完整有效 FAQ** 一起傳給 Gemini。無 SQL、無搜尋／向量庫、無 RAG；第一天**不必建 D1，也不必開 R2 或提供信用卡**。
- **預約模組**：第二天才用 D1 儲存時段、名額、預約事件與狀態。明確指令「時段」與「預約 S001」走預約邏輯，其他自然語言問題仍由 Day 1 FAQ 處理。D1 不用來存 FAQ。
- R2 僅為未來可選的 FAQ JSON 保存途徑；小型教學直接用靜態檔最省步驟。
- Demo 只支援**名額型時段預約**，不支援付款、取消回補、複雜排班、員工指派、顧客身分核驗。

## 教材與進度
- **[DAY 1 六小時完整互動式學員網頁](day1/index.html)**：依原六小時 Vibe Coding 網頁的分章節、圖解、步驟勾選與複製提示詞形式，加入 LINE OA 後台實作、官方 AI 比較、網路基礎、FAQ 編輯器和部署驗收。
- [互動式進度與提示詞](site/index.html)（下載專案後開啟，尚未部署 Pages）
- [兩日 12 小時課綱](docs/01-course-plan.md)
- [課前準備](docs/02-student-preflight.md)
- [LINE OA 管理後台](docs/03-line-setup.md)
- [FAQ 如何選擇儲存方式](docs/04-faq-storage.md)
- [第二天預約專題](docs/05-day2-project.md)
- [講師與助教 SOP](docs/06-instructor-sop.md)
- [驗收表](docs/07-acceptance.md)
- [AI 提示詞](docs/08-prompts.md)
- [官方文件與限制](docs/09-resources.md)
- [Windows PowerShell 實作指引](docs/10-deployment-lab.md)
- [學員工作表](docs/11-worksheets.md)

## 第一天：0 資料庫啟動
1. 課前註冊 LINE OA、Cloudflare、Google AI Studio；備妥 LINE Channel Secret、Access Token、Gemini Key。
2. 開啟 **src/faq-data.js**，編寫至少 5 題已確認 FAQ；不要加入顧客個資或敏感資料。
3. 在 Windows PowerShell：
```powershell
npm install
npx wrangler login
Copy-Item .dev.vars.example .dev.vars
npm run dev
```
4. 本機 `.dev.vars` 填自己的秘密，無需 D1/R2。
5. 遠端部署前設定：
```powershell
npx wrangler secret put LINE_CHANNEL_SECRET
npx wrangler secret put LINE_CHANNEL_ACCESS_TOKEN
npx wrangler secret put GEMINI_API_KEY
npm run deploy
```
6. LINE Webhook 指到 `https://<你的-worker>.workers.dev/webhook/line`，依 [LINE 教學](docs/03-line-setup.md) 啟用。實測同一問題三種問法、資料不足轉真人。

## 第二天：只為預約建立 D1
```powershell
npx wrangler d1 create line-course-bookings
# 將顯示的 database_id 填入 wrangler.day2.jsonc
npm run db:local
npm run seed:local
npm run dev:day2
```
本機測試後：
```powershell
npm run db:remote
npm run seed:remote
npx wrangler secret put ADMIN_TOKEN
# 可選：管理員通知使用 LINE_ADMIN_USER_ID
npx wrangler secret put LINE_ADMIN_USER_ID
npm run deploy:day2
```
`wrangler.day2.jsonc` 的 Worker name 與第一天相同；第二天啟用 `BOOKING_ENABLED=true` 並增加 D1 binding，FAQ 仍從 `src/faq-data.js` 讀取。管理後台：`/admin`；LINE 傳「時段」「預約 S001」。

> 安全：不要把 LINE / Gemini 密鑰寫進 GitHub、前端或 AI 提示詞。正式使用前須加上身分驗證、存取控管、個資告知、保留政策、預約取消與通知重試機制。課程預約會儲存 LINE user ID；請只用測試帳號。Google API 可能有費率和額度；把所有 FAQ 每次送出，也代表每次都計入輸入 token。

原第二天參考：[tmparz/vibe-coding-course-guide](https://github.com/tmparz/vibe-coding-course-guide)。此 repo 以教學時間重新拆分「Day 1 FAQ」與「Day 2 D1 預約」。
