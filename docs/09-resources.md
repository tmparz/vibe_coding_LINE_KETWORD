# 官方參考、限制與課前複核

- LINE Messaging API：https://developers.line.biz/en/docs/messaging-api/getting-started/
- LINE Webhook 驗證：https://developers.line.biz/en/docs/messaging-api/verify-webhook-signature/
- Cloudflare Workers：https://developers.cloudflare.com/workers/
- Cloudflare D1（第二天預約資料專用）：https://developers.cloudflare.com/d1/get-started/
- Cloudflare R2（非必修）：https://developers.cloudflare.com/r2/get-started/workers-api/
- Gemini API：https://ai.google.dev/gemini-api/docs/
- 原 Vibe Coding 六小時參考：https://github.com/tmparz/vibe-coding-course-guide

## 請在課前重新核對
LINE OA 與 Developers 當日操作介面；Gemini 模型可用性、費率與配額；Cloudflare Workers/D1/R2 當期方案及 R2 是否須付款資訊；LINE OA 訊息額度及推播限制。

## 範例限制
- FAQ 小資料量採完整上下文送 Gemini，**無搜尋、無 D1、無向量庫**，每次問答重送整包 FAQ 都會產生 token 成本。
- Day 2 為名額型時段預約 Demo；不含日期合法性業務驗證、取消釋出名額、付款、改期、排班引擎或自動確認。
- 課堂後台使用單一 ADMIN_TOKEN；正式營運須做使用者身分驗證、角色權限、存取記錄及個資/第三方服務評估。
- Webhook 採非同步回覆，尚無持久化佇列與發送成功追蹤，不宜作商用送達保證。
