# 第二天專題：D1 時段預約 Demo（與 FAQ 分開）

原參考教材：https://github.com/tmparz/vibe-coding-course-guide

## 功能邊界
DAY 1：靜態 FAQ + Gemini。資料存 src/faq-data.js。
DAY 2：**LINE 文字預約**，才需要 D1。資料存 slots、bookings。FAQ 不改資料源。

## 學員情境
假設經營小型放鬆服務或體驗課：
1. 管理員先在 /admin 新增時段 S004、活動名稱、開始時間、名額。
2. 顧客傳「時段」取得清單與剩餘人數。
3. 顧客傳「預約 S001」建立**待確認**的預約。
4. D1 保存時段、預約事件、匿名化展示的預約代碼（資料庫仍保存必要的 LINE user ID）。
5. 管理員收到可選的 LINE 提醒，至後台查看紀錄。
6. 顧客問「怎麼預約？」時仍走 Gemini FAQ，與 D1 無關。

## 資料結構與規則
- slots：code、title、starts_at、capacity、reserved、active。
- bookings：id、event_id（唯一）、slot_code、line_user_id、status、created_at；同一個 LINE 使用者不可重複預約同一時段。
- SQLite/D1 trigger 在單筆 INSERT 中檢查名額並增加 reserved，失敗時回滾；避免超額與同事件重送重複計數。
- LINE 明確指令才可預約；不能讓 Gemini 把一般問題誤判成建立預約。
- 此為課堂練習，不涵蓋取消回補、改期、付款、會員身分驗證、完整衝突排程，亦不承諾正式商用可靠性。

## Vibe Coding 練習順序
需求一頁紙 → 設計 slots / bookings → AI 逐步新增管理 API 與 UI → 加上 LINE 指令 → 加上名額與冪等測試 → Rich Menu → 手機驗收。全程避免把金鑰貼入提示詞。

**一定要能證明：** 一筆成功預約只保留一個名額；滿額不收；同事件重送不重複寫；FAQ 正常回答，不需要 D1。
