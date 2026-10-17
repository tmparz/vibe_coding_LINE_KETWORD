# 如何選：D1 FAQ 或 R2 FAQ？

## 建議方案
**第一堂課先用 D1**：FAQ 是一筆一筆的結構化資料，方便新增、查詢、調整優先順序；第二天商品與訂單也會用到 D1，同一份技術棧可持續擴充。
**R2 當成進階選修**：適合儲存大量文件、圖片、FAQ JSON 檔案或非結構化素材。R2 只是儲存，不會自動變成向量檢索或智能問答。

| 面向 | D1 | R2 |
|---|---|---|
| 資料類型 | 問題、答案、標籤等列資料 | JSON、PDF、圖像等物件 |
| 更新一筆 FAQ | SQL 更新單列 | 通常覆寫檔案 |
| 第二天商品與訂單 | 適合 | 不建議 |
| 第一日難度 | 低（教材採用） | 中等（需要額外 binding） |
| 是否具語意檢索 | 否 | 否 |

## 實作方案：小資料集上下文問答
1. D1 最多載入 30 條「啟用」FAQ；測試用的 5–10 條最適合。
2. 將 FAQ 問答作為「可用事實」送入 Gemini；限制只能依資料回答。
3. 若資料不包含答案，一律回覆「我目前沒有確認的資料，請洽真人客服。」
4. 具明確副作用的指令（下單、取消）不用 Gemini 決策。
5. 測試同義問句、相反問句、超出範圍問句與惡意提示詞。

此作法對小型資料集足夠直觀，但並非檢索增強生成（RAG）的完整實作；資料量增加後須設計檢索、版本控管與審核機制。

## 選修：R2 JSON
建立名為 line-course-faq 的 R2 bucket，新增 wrangler.jsonc 的 r2_buckets binding，例如 FAQ_BUCKET，再放入鍵名 faq.json 的 JSON array：
~~~json
[
  {"question":"週末有開課嗎？","answer":"請依當期公告課表為準。"}
]
~~~
Worker 設定 FAQ_SOURCE=r2 才改從 R2 讀取；不設則繼續用 D1。示範檔請避免放任何敏感資料。

## 重要警語
Gemini API 有額度、速率與可能的收費。不能保證完全不亂答；對金額、補助、法規與醫療資訊應要求可核對資料、提供人工確認管道。成本要另外計入 LINE 訊息量、Cloudflare、Gemini 與協作 AI 工具。

參考：https://developers.cloudflare.com/d1/get-started/、https://developers.cloudflare.com/r2/get-started/workers-api/。