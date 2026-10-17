# 學員操作指南（Windows PowerShell）

這份文件是課堂上可逐步操作的版本，不需要先懂工程名詞。所有金鑰都由學員自己管理。

## 第一階段：下載教材
在 VS Code 終端機切到自己熟悉的工作資料夾：
~~~powershell
git clone https://github.com/tmparz/vibe_coding_LINE_KETWORD.git
cd vibe_coding_LINE_KETWORD
npm install
npx wrangler login
~~~
若你的電腦不能使用 git，可從 GitHub 下載 ZIP 解壓，再開啟資料夾。

## 第二階段：建立 D1
~~~powershell
npx wrangler d1 create line-course-db
~~~
把系統回傳的 database_id 貼入 wrangler.jsonc；是資料庫 ID（非秘密），請確認名稱 line-course-db 相符。接著：
~~~powershell
npx wrangler d1 migrations apply DB --local
npx wrangler d1 execute DB --local --file=seeds/demo.sql
npx wrangler d1 execute DB --local --command="SELECT id,question FROM faqs"
~~~

## 第三階段：本機金鑰
~~~powershell
Copy-Item .dev.vars.example .dev.vars
~~~
用 VS Code 開啟 .dev.vars，自己填 LINE_CHANNEL_SECRET、LINE_CHANNEL_ACCESS_TOKEN、GEMINI_API_KEY、ADMIN_TOKEN。只在本人電腦填，不貼給老師或 AI。使用已開通的 LINE 測試官方帳號。

## 第四階段：本機測試
~~~powershell
npm run dev
~~~
瀏覽器打開 http://localhost:8787/health 與 http://localhost:8787/admin。後台輸入自己建立的 ADMIN_TOKEN。你可以先查看 FAQ、上架狀態。LINE 真正 Webhook 必須有外網 HTTPS URL；本機驗收先做後台與資料庫。

## 第五階段：上雲
~~~powershell
npx wrangler d1 migrations apply DB --remote
npx wrangler d1 execute DB --remote --file=seeds/demo.sql
npx wrangler secret put LINE_CHANNEL_SECRET
npx wrangler secret put LINE_CHANNEL_ACCESS_TOKEN
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put ADMIN_TOKEN
# 如要測試管理員通知：
npx wrangler secret put LINE_ADMIN_USER_ID
npm run deploy
~~~
每個 secret put 指令執行後，依終端機提示輸入自己的值。**不要把字面金鑰直接寫在這些指令後方，以免保留在殼層歷史紀錄。**
如果 Google API 當日使用的模型不同，修改 wrangler.jsonc 中 GEMINI_MODEL，再重新 deploy。

## 第六階段：LINE 設定
至 LINE Developers 的 Messaging API 頁籤設定 Webhook URL：
https://你的-worker.你的-subdomain.workers.dev/webhook/line
按下 Verify、啟用 Webhook、測試手機 LINE 傳「營業時間」。
第二天傳「商品」及「訂購 P001」，比對 Cloudflare D1 的 orders、products 表和管理端。
圖文選單可在 LINE OA Manager 設定一個「商品」按鈕，點擊送出文字「商品」。

## FAQ 更新與安全
在 /admin 可新增 FAQ 或停用；也可直接於 D1 SQL 管理介面操作資料。確認資訊已核准才更新答案。
如果金鑰外洩，立刻到 LINE / Google 平台撤銷與重發，再透過 wrangler secret put 替換。

## R2（選修）
在 Cloudflare R2 建立 bucket line-course-faq，從 Dashboard 上傳 faq.json（array of question/answer objects）。將 wrangler.jsonc 的 r2_buckets 範例取消註解，並把 FAQ_SOURCE 改為 r2；重新部署。R2 bucket 是否需啟用方案／付款方式，以 Cloudflare 當日畫面為準。