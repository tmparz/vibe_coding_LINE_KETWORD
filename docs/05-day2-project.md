# 第二天專題設計：延續 Vibe Coding 6 小時課

原教材：https://github.com/tmparz/vibe-coding-course-guide
原教材章節：成果／LINE 生態、Cloudflare 環境、欄位規格、AI Prompt、商品與訂單、D1、部署、Webhook、Rich Menu、端到端驗收。本課重組後將申請帳號、Worker、D1、Webhook 移到第一天；第二天節省重複設定時間，把重心放在從需求到可運作系統。

## 兩種情境，同一程式底座
A｜販售商品：商品名稱、價格、庫存、上下架；顧客輸入「商品」→ 清單 →「訂購 P001」→ 訂單。
B｜課程／活動預約：課程名稱、說明、價格、剩餘名額；顧客輸入「課程」→ 清單 →「訂購 P001」→ 保留一個名額。

兩種情境只在文案、資料欄位標籤與業務規則上不同。**這裡不支援選擇個別時間區段，也沒有付款／付款核銷；不可對外宣稱完成全功能預約系統。**

## 第二天 Vibe Coding 五個迭代
- 第 1 回合：寫需求。目標使用者、輸入方式、欄位、回覆、錯誤處理、不能做的事。
- 第 2 回合：做資料。商品、訂單、狀態、名額／庫存、防超賣。
- 第 3 回合：做操作。LINE 關鍵字「商品／課程」、「訂購 P001」、客服 FAQ 分流。
- 第 4 回合：做管理。商品管理、訂單列表、訂單改狀態、管理員通知。
- 第 5 回合：做驗收。正常、異常、重送、停用、名額售罄、無 FAQ、假簽章。

## 課堂 Demo 的產品規則
- 僅支援單筆商品文字下單；不蒐集姓名、電話、地址等額外個資。
- 每次新訂單扣 1 件庫存；數量為 0 時不接受。
- 同一 webhook event_id 重送不能重複扣庫存。
- 新訂單寫 D1 成功後才通知管理員；通知失敗不代表訂單不存在。
- FAQ 回答不能修改商品價格、建立訂單或繞過指令。
- 若要取得顧客完整個資、發送行銷訊息或串接付款，需要另做合規與安全評估。

## 既有教材可直接連結的圖片
- LINE 三把鑰匙：https://github.com/tmparz/vibe-coding-course-guide/blob/main/01_LINE三把鑰匙.png
- 技術架構：https://github.com/tmparz/vibe-coding-course-guide/blob/main/02_技術架構總覽.png
- Cloudflare：https://github.com/tmparz/vibe-coding-course-guide/blob/main/03_Cloudflare環境建置.png

**教材提醒：** 舊教材有「直接在 Developers 建立 Messaging API Channel」與「把完整憑證與需求打包給 AI」的段落；上課時務必以本 repo 更新版的流程、金鑰保護規範為準。