# 手動部署（老師備援）

課堂上由 Codex 照部署提示詞操作，學員不需要自己打指令。這份是 **Codex 卡住、或老師課前自己跑一次** 時用的手動步驟，Windows PowerShell。

## DAY 1｜FAQ 機器人（不用 D1、R2）

```powershell
git clone https://github.com/tmparz/vibe_coding_LINE_KETWORD.git
cd vibe_coding_LINE_KETWORD
npm install
npx wrangler whoami   # 沒登入就執行 npx wrangler login
```

把學員的 FAQ 改寫進 `src/faq-data.js`。

本機測試（可略過）：

```powershell
Copy-Item .dev.vars.example .dev.vars   # 填入三把鑰匙
npm run dev                             # 開 http://localhost:8787/health
```

部署：

```powershell
npx wrangler secret put LINE_CHANNEL_SECRET
npx wrangler secret put LINE_CHANNEL_ACCESS_TOKEN
npx wrangler secret put GEMINI_API_KEY
npm run deploy
```

打開 `https://<worker>.workers.dev/health` 確認正常。接著到 LINE Developers 設定 Webhook URL `https://<worker>.workers.dev/webhook/line`，Verify，開啟 Use webhook，並到 OA Manager 關閉自動回應訊息。

## DAY 2

第二天的系統由 Codex 依 DAY 2 整合提示詞**重新建立**，程式結構每位學員會不一樣，沒有固定的手動步驟。Codex 卡住時，常用的指令：

```powershell
npx wrangler d1 create <資料庫名稱>          # 把回傳的 database_id 填進 wrangler 設定檔
npx wrangler d1 execute <資料庫名稱> --remote --file=<建表 SQL>
npx wrangler secret put <名稱>
npx wrangler deploy
npx wrangler tail                            # 即時看 Worker 日誌，排錯最好用
```

## 換新鑰匙

```powershell
npx wrangler secret put LINE_CHANNEL_ACCESS_TOKEN
npx wrangler secret put GEMINI_API_KEY
```

secret 更新後立即生效，不用重新部署。
