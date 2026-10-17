# LINE 官方帳號後台教學 SOP（第一天）

## Part A｜LINE OA Manager（操作優先）
入口：https://manager.line.biz/
1. 登入、找到「建立／管理帳號」，辨識帳號與成員權限。
2. 找到「聊天」和「自動回應」／「關鍵字回應」設定（介面名稱可能會變動）。
3. 新增關鍵字「營業時間」與固定回答；測試內建回應。
4. 展示圖文選單 Rich Menu 的用途：入口按鈕可送出文字或開啟網址。
5. 說明真人聊天、機器人自動回應可能同時啟用造成重複答覆；上線前調整回應設定。

## Part B｜Messaging API 開通（注意舊教材差異）
入口：https://developers.line.biz/
**現行流程：先在 LINE OA Manager 的「設定 → Messaging API」啟用，再到 Developers Console 查看所屬 Provider／Channel。不能再直接從 Developers Console 建立 Messaging API Channel。** 舊參考教材的「Provider → Create Channel → Messaging API」步驟要改掉。

找出：
- Channel ID：辨識通道；不是密鑰。
- Channel Secret：驗證 LINE Webhook 的 HMAC-SHA256；不能公開。
- Channel Access Token：Worker 呼叫回覆／推播 API；不能公開。
- Your user ID / 管理員 UID：用來接收測試通知，需注意隱私。

## Part C｜先畫出資料流
顧客傳「課程何時開始？」 → LINE → POST /webhook/line → Worker 驗證簽章 → 從 D1/R2 找 FAQ → Gemini 根據 FAQ 回答 → Messaging API reply → 顧客收到訊息。

當顧客傳「商品」或「訂購 P001」：走第二天明確指令流程，避免 Gemini 擅自承諾有貨或建立訂單。

## Part D｜填入 Webhook
1. 先部署 Worker，取得 workers.dev URL。
2. 在 Developers Console 的 Messaging API 頁籤，Webhook URL 設為 https://<worker>.workers.dev/webhook/line。
3. 點 Verify（LINE 可能送空 events）；啟用 Use webhook。
4. 將 LINE OA 原有的自動回覆依教學需求調整，確認不會重複回覆。
5. 用測試 LINE 帳號加好友、傳「你好」、傳 FAQ、測到回覆。

## 常見卡關
- 400／401：簽章不一致，檢查 Channel Secret 對應到相同 OA；必須用未修改的原始 request body 驗證。
- Webhook Verify 成功但不回話：token、use webhook、自動回應設定、Worker log、Gemini secret、FAQ 資料。
- 管理員收不到推播：查 UID、是否已加 OA 好友、token 有效、帳號訊息額度。
- 貼了完整密鑰到 AI 或 GitHub：立刻換發密鑰並更新 Worker secrets。

官方文件：https://developers.line.biz/en/docs/messaging-api/getting-started/ 和 https://developers.line.biz/en/docs/messaging-api/verify-webhook-signature/。