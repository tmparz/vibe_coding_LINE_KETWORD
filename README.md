# 女力 LINE OA × AI 工作流進階班｜DAY 1 FAQ 機器人範本與老師文件

這個 repo 有兩個用途：

1. **DAY 1 的 Worker 範本**：學員在課堂上請 Codex clone 這個 repo，把自己的 FAQ 寫進 `src/faq-data.js`，部署成 LINE AI 客服。
2. **老師文件**：課程規劃、課前檢查、排錯、驗收都在 `docs/`。

學員網頁在另一個 repo：[vibe-coding-course-guide](https://github.com/tmparz/vibe-coding-course-guide)（`two-day-v2` 分支）
- 兩日入口：`course/`
- DAY 1：`day1/`
- DAY 2：根目錄（Step 1–10）

## 兩天在做什麼

| | DAY 1 | DAY 2 |
|---|---|---|
| 上半場 | AI 是什麼、AI 協作三招、用 AI 整理我的 FAQ | 複習、欄位規格、訊息分流規則 |
| 下半場 | LINE 關鍵字自動回覆 → Codex 部署 AI FAQ 機器人 | Codex 建立預約系統、D1、圖文選單、後台、換新鑰匙 |
| 程式 | 本 repo（靜態 FAQ + Gemini，不用 D1、R2） | Codex 依整合提示詞重新建立 |
| 成果 | 客人打字，AI 依 FAQ 回答 | 客人按選單預約，真人可以隨時接手 |

完整排程見 [docs/01-course-plan.md](docs/01-course-plan.md)。

## 文件

| 文件 | 給誰 |
|---|---|
| [01 課程規劃](docs/01-course-plan.md) | 老師 |
| [02 課前準備](docs/02-student-preflight.md) | 學員 |
| [02a 課前 30 分鐘檢查表](docs/02a-preflight-check-teacher.md) | 老師 |
| [03 LINE 設定與訊息分流](docs/03-line-setup.md) | 老師 |
| [04 FAQ 為什麼用靜態檔](docs/04-faq-storage.md) | 老師 |
| [05 第二天專題](docs/05-day2-project.md) | 老師 |
| [06 講師／助教 SOP](docs/06-instructor-sop.md) | 老師、助教 |
| [07 驗收表](docs/07-acceptance.md) | 老師、助教 |
| [08 備用提示詞](docs/08-prompts.md) | 老師 |
| [09 官方文件與限制](docs/09-resources.md) | 老師 |
| [10 手動部署（備援）](docs/10-deployment-lab.md) | 老師 |
| [11 紙本工作表](docs/11-worksheets.md) | 學員 |

## DAY 1 範本的運作方式

```
客人傳訊息 → LINE → Worker 驗證簽章 → 整份 FAQ ＋ 客人的問題送 Gemini → 回覆 LINE
```

- `src/faq-data.js`：FAQ 內容。
- `src/faq.js`：呼叫 Gemini，只能依 FAQ 回答，答不出來請客人傳「人工」。
- `src/line.js`：簽章驗證、reply、push。
- `src/index.js`：`/health`、`/webhook/line`。

手動部署步驟見 [docs/10](docs/10-deployment-lab.md)。

> `wrangler.day2.jsonc`、`src/bookings.js`、`src/admin*.js`、`migrations/`、`seeds/` 是早期「時段＋預約 S001」的第二天版本，課程已改用 vibe-coding-course-guide 的 Step 1–10，這些檔案保留作參考。

## 鑰匙

課程設計上，學員會把 LINE 與 Gemini 鑰匙填進網頁、交給 Codex，先做出成果再理解原理。提示詞要求 Codex 只把鑰匙放在 `.dev.vars`（已在 `.gitignore`）和 Cloudflare Worker secrets，第二天最後一步帶學員把鑰匙全部換新。

正式給客人使用前，還需要補上身分驗證、存取控管、個資告知與資料保存政策。

## 測試

```powershell
node --test tests/core.test.mjs
python -I tests/db_test.py
```
