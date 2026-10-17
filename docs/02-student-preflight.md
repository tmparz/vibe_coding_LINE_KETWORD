# 課前準備與器材清單

## 學員請在課前完成
- 筆電與電源、Chrome 或 Edge、手機 LINE 可正常使用。
- LINE Official Account Manager 可登入；若沒有 OA，課前建立測試帳號。
- LINE Developers 可登入，同一管理者具設定權限；不要使用客戶的正式 OA 做第一次測試。
- Cloudflare 帳號可登入（可以用電子郵件註冊；不以 Gmail 作為唯一必要條件）。
- Google AI Studio / Gemini API 可使用，並理解 API 使用量、計費與服務條款可能隨時調整。
- 一種 AI 協作工具已登入（ChatGPT、Claude、Codex 等；依實際課堂工具選擇）。
- Node.js 20 以上、VS Code、Git（以講師課前環境檢查的當日實際版本為準）。
- 準備真實但可公開展示的五個商業 FAQ、一張商品／課程列表（不含客戶資料）。
- 同意教材是練習環境；不放個資、信用卡、身分證、醫療紀錄。

## 不需交給講師的四種秘密
LINE Channel Secret、LINE Channel Access Token、GEMINI_API_KEY、後台 ADMIN_TOKEN 全程學員自管。輸入 Cloudflare secret 或本機 .dev.vars；課堂用「已設定／未設定」做檢查，不用 Google 表單蒐集金鑰。

## 講師課前 1 週
確認投影、Wi-Fi、插座、測試 LINE OA 與 Cloudflare 帳號；準備一個已部署的示範 Worker。助教需能協助 LINE Manager / Developers 權限、Wrangler 登入與 Windows PowerShell 操作。

## 課前 1 天
跑一次完整流程：建 D1 → 執行 migration → seed → Worker FAQ → LINE Webhook → 下單 → 管理員接訊。準備離線教材；預留網路故障與 API 限額的示範錄影／截圖。

## 裝置與帳號安全
所有正式密鑰不得寫入公開 Repo、AI 對話、共用雲端筆記或課後作業截圖。本機 .dev.vars 已由 .gitignore 排除；仍須注意螢幕分享與自動同步。