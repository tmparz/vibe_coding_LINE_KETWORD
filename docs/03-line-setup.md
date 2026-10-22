# LINE 官方帳號與 Messaging API 操作

學員操作畫面以第一天頁面「LINE 官方帳號」分頁為準，這份是老師備查。

## 課前

在 <https://manager.line.biz/> 建立官方帳號，手機加好友（見 [02a](02a-preflight-check-teacher.md) 第 4 項）。其他設定都留到上課。

## DAY 1 下半場

1. **先做沒有 AI 的機器人**：設定歡迎訊息、一則關鍵字自動回覆（例如「營業時間」）。手機傳「營業時間」收到回覆，再傳「你們幾點開門？」，讓學員看到關鍵字聽不懂換句話說。
2. **開通 Messaging API**：OA Manager → 設定 → Messaging API → 啟用。再到 <https://developers.line.biz/> 取得 Channel ID、Channel Secret、Your user ID，並在 Messaging API 分頁發行 Access Token。學員把它們填進頁面欄位，第二天會自動帶入。
3. **資料流**：客人文字 → LINE → Worker 驗證簽章 → 整份 FAQ 加上客人的問題送 Gemini → LINE 回覆。
4. **Webhook**：LINE Developers → Messaging API → Webhook URL 填 `https://<你的-worker>.workers.dev/webhook/line` → Verify → 開啟 Use webhook。
5. **關閉 OA 的自動回應訊息**，否則客人問一題，關鍵字和 AI 會各回一次。
6. 驗收：同一題「你們幾點開門？」再問一次，這次 AI 聽得懂；問 FAQ 沒有的事，AI 請客人傳「人工」。
7. 老師示範：傳「人工」之後再傳訊息，機器人還是會回答，真人和機器人同時回覆。這是第二天要解決的問題。

## DAY 2：訊息分流

第二天的整合提示詞已經寫好以下規則，學員不需要自己寫，但老師要講得出原因。

| 順序 | 收到的文字 | 處理 | 真人接手中也處理？ |
|---|---|---|---|
| 1 | 開頭是「👉 我要預約【」 | 建立訂單、扣庫存、通知管理員 | 是 |
| 2 | 「瀏覽商品」或「購買」 | 回傳商品輪播 | 是 |
| 3 | 「聯絡客服」或「人工」 | 進入真人接手模式，回覆一次，通知管理員 | 只延長時間 |
| 4 | 該客人在真人接手中 | 不回應，也不呼叫 Gemini | — |
| 5 | 其他文字 | Gemini 依 FAQ 回答；答不出來就記到問題紀錄 | — |

- **為什麼按鈕要送出真正的文字**：客人可能從頭到尾沒打過字。如果按鈕只送 postback，OA Manager 的一對一聊天就不會出現這位客人，店家無法追蹤。
- **為什麼比對格式、不比對「預約」兩個字**：客人自己打「我上次預約的是幾點？」不能建立訂單。按鈕送出的格式，客人幾乎不可能剛好打出來。
- **真人接手**：從客人最後一則訊息起算 30 分鐘。店家在 OA Manager 回覆客人的訊息**不會**送到 Webhook，所以系統只能用客人的訊息計時，後台另外提供「結束真人接手」按鈕。
- **推播額度**：通知管理員用的是 push，會算進 LINE 每月免費訊息額度；回覆客人用 reply，不算。

## 排錯

| 狀況 | 先檢查 |
|---|---|
| Verify 回 401 | Channel Secret 是否和這個官方帳號一致 |
| Verify 成功，手機沒回應 | Use webhook 是否開啟、Access Token、Gemini Key、Worker 日誌 |
| 客人問一題收到兩則回覆 | OA 的「自動回應訊息」是否已關閉 |
| 按預約沒反應 | 按鈕送出的文字是否和「👉 我要預約【」完全相同（全形括號、空格） |

官方文件：
- <https://developers.line.biz/en/docs/messaging-api/getting-started/>
- <https://developers.line.biz/en/docs/messaging-api/verify-webhook-signature/>
