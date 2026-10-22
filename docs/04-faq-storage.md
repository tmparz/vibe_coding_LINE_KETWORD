# FAQ：本課採「一次給 Gemini 完整 FAQ」的最簡方案

## Day 1 必修：靜態 FAQ
學員在第一天頁面用 AI 整理好 FAQ，由 Codex 依部署提示詞寫成機器人裡的一個獨立 FAQ 檔案。以參考程式的 src/faq-data.js 為例：
~~~js
export const faqData = [
  { question: "星期日有營業嗎？", answer: "星期日公休。" },
  { question: "要先預約嗎？", answer: "請透過 LINE 聯絡真人客服確認。" }
];
~~~

顧客問「禮拜天可以過去嗎？」時，Worker 將 **顧客原句 + 所有已啟用的 FAQ** 一次傳送到 Gemini，模型用 FAQ 的資料判斷並整理答案。沒有檢索、分詞、向量化，也沒有資料庫。這是小資料量最直接的教學設計。

**FAQ 內容變更：** 修改檔案、重新部署 Worker。這是刻意的簡化，適合課堂 Demo；日後若需要讓店主隨時修改再考慮管理後台和儲存空間。

## R2 與 D1 的關係
| 方案 | 本課用途 | Day 1 必要？ |
|---|---|---|
| 靜態 JS FAQ | 保存全部問答，直接由 Worker 打包 | **是，預設** |
| Cloudflare R2 | 未來選修：放 faq.json，Worker 一次讀入 | 否 |
| Cloudflare D1 | **Day 2 專用：商品、訂單、客人狀態、問題紀錄** | 否 |

若學員不想進行 R2 的帳單設定，完全不影響第一天。此 repo 的 FAQ 程式亦支援選修 R2：設定 FAQ_SOURCE=r2 和 FAQ_BUCKET binding，於 bucket 放置 faq.json 陣列；這不是預設流程。

## 使用完整 FAQ 仍要知道的限制
- 「context window 夠大」不等於「免費」：每位顧客的每則問題，都會重複計費完整 FAQ 的輸入 tokens；資料量與訊息量越大，費用越高。
- 提供給 Gemini 的 FAQ 必須已確認，不應含顧客個資，也不要把鑰匙寫進 FAQ 內容。
- 資料夠少時品質通常可控，但 AI 仍可能答錯、誤讀或忽略某段資訊；請實際測同義問題、沒有答案的問題和提示注入。
- 教材為避免輸入量失控，當 FAQ JSON 文字超過示範安全閾值時會改提示聯繫真人；不會默默只傳前 30 題。
