# 女力 LINE OA × AI 工作流進階班｜12 小時實作教材

> 兩天、每天 6 小時。第一天：LINE OA 後台 → Cloudflare D1 / R2 → Gemini 自然語言 FAQ。第二天：延續既有 Vibe Coding 教材，做出 LINE 商品展示與簡易預約／接單 MVP。

## 學習路徑
- [互動式兩日課程進度與提示詞](site/index.html)（可下載 Repo 後開啟；尚未發布 GitHub Pages）
- [完整 12 小時課綱](docs/01-course-plan.md)
- [課前準備](docs/02-student-preflight.md)
- [LINE OA／Developers 後台](docs/03-line-setup.md)
- [D1 與 R2 如何選擇](docs/04-faq-storage.md)
- [第二天 Vibe Coding 專題](docs/05-day2-project.md)
- [講師／助教 SOP](docs/06-instructor-sop.md)
- [驗收與除錯](docs/07-acceptance.md)
- [可直接使用的 AI 提示詞](docs/08-prompts.md)
- [參考來源與限制](docs/09-resources.md)
- [學員 Windows PowerShell 部署教學](docs/10-deployment-lab.md)
- [兩日學員工作表](docs/11-worksheets.md)

## 可執行的教學範例
`src/` 提供單一 Cloudflare Worker：LINE webhook、簽章驗證、FAQ 自然語言回答、商品清單、文字下單、簡易後台；`migrations/`、`seeds/` 分別存放 D1 schema、測試用資料。第一天就能部署 FAQ；第二天擴充訂單流程。**此範例是教學 MVP，正式營運仍需做資安、個資與商業規則檢核。**

## 快速開始
```bash
npm install
npx wrangler login
npx wrangler d1 create line-course-db
# 將回傳的 database_id 填到 wrangler.jsonc
npx wrangler d1 migrations apply DB --local
npx wrangler d1 execute DB --local --file=seeds/demo.sql
# 參考 .dev.vars.example 建立自己的 .dev.vars，填入測試環境 secrets
npm run dev
```

本地測試後：
```bash
npx wrangler d1 migrations apply DB --remote
npx wrangler d1 execute DB --remote --file=seeds/demo.sql
npx wrangler secret put LINE_CHANNEL_SECRET
npx wrangler secret put LINE_CHANNEL_ACCESS_TOKEN
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put ADMIN_TOKEN
npm run deploy
```

Webhook URL：`https://<你的-worker>.workers.dev/webhook/line`；後台：`https://<你的-worker>.workers.dev/admin`。官方後台的 **Webhook 要啟用**，並依需求關閉會重複回覆的 OA 自動回應。

提醒：示範訂單仍會儲存 LINE user ID（屬個人資料）。請只用課堂測試帳號，不要在未完成個資告知、存取控管及保留政策前使用真實客戶資料。顧客提問會傳給 Gemini API 進行處理，正式營運前須完成第三方資料處理評估。

若要測試管理員通知，請加設 Worker secret：LINE_ADMIN_USER_ID（請勿提交至 GitHub）。

## 驗證紀錄
Repository 內含 Node.js 單元測試、SQLite 原子庫存測試及 GitHub Actions workflow。測試通過代表範例邏輯檢查通過，**不代表已連接你的真實 LINE、Cloudflare 或 Gemini 帳號**。

安全規則：**不要將 Channel Secret、Access Token、Gemini Key 放入 GitHub、AI 提示詞、前端程式或截圖。** 本 repo 所有金鑰皆使用 Worker secrets；教學資訊請只記錄「已設定」與後四碼，不蒐集完整密鑰。

原始第二天參考：[tmparz/vibe-coding-course-guide](https://github.com/tmparz/vibe-coding-course-guide)。本專案重新分配時間，**不要求學員第二天重新申請 LINE 與 Cloudflare**。

版本：課程規劃起點 2026-10-17。