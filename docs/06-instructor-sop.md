# 講師／助教 SOP

講師阿茲負責需求拆解、操作示範與 AI 協作除錯；助教負責帳號登入、逐桌排障、記錄關卡。

## 兩日關卡
- Day 1 A（1:30）：學員知道 OA Manager 的自動回覆與 Messaging API 差異。
- Day 1 B（3:20）：每人完成至少五題 src/faq-data.js；**沒有 D1 建表作業**。
- Day 1 C（5:15）：LINE 實際串接完整 FAQ 和 Gemini。
- Day 1 終點：換句話問、未知問題、人工作業都通過。
- Day 2 A（1:50）：時段管理 UI 可新增兩個示範時段。
- Day 2 B（3:05）：D1 有 bookings 記錄，LINE 可以「時段」「預約 S001」。
- Day 2 C（4:40）：Rich Menu 與管理員通知測試通過。
- Day 2 終點：展示 D1 預約紀錄和 FAQ 獨立運行。

## 排錯順序
Day 1 LINE 不回：Webhook → Worker secrets → FAQ 靜態檔 → Gemini；**不要叫學員查 D1**。
Day 2 預約出錯：確認 BOOKING_ENABLED=true、D1 binding、migrations、seed、容量與 LINE 指令。
FAQ 回答有偏差：先檢查商家問答資料是否精準，不能只依模型口頭保證完成。
預約重複或超額：檢查 event_id 唯一性、trigger 和資料表約束；不要以 AI 回覆「成功」取代實際 D1 查核。
金鑰外洩：立即輪替、檢查 repo 歷史，教學不索取學員 Key。

## 掉隊處理
先讓學員在講師 Demo 看到成品，再由助教協助完成當前步驟；先修復一個最小錯誤，避免整包重寫。
