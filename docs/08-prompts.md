# 提示詞

課程用的提示詞都放在學員網頁上，學員填好欄位後一鍵複製，**以網頁為準**：

| 用途 | 位置 |
|---|---|
| AI 協作三招（三段） | DAY 1「AI 協作三招」分頁 |
| 整理我的 FAQ | DAY 1「我的 FAQ」分頁（依學員填的服務資料組出） |
| Codex 登入 Cloudflare | DAY 1「Cloudflare 與 Codex」分頁 |
| 部署 FAQ 機器人 | DAY 1「部署 FAQ 機器人」分頁（帶入 FAQ 與三把鑰匙） |
| 第二天整合提示詞 | DAY 2 Step 3（帶入欄位規格、第一天 FAQ、鑰匙、分流規則、真人接手、後台需求） |

這裡只放網頁上沒有的備用提示詞。

## 排錯：把問題交給 Codex

```
我做了：〔哪一步〕
我預期：〔應該看到什麼〕
實際上：〔看到什麼，附上截圖〕

請先用白話告訴我可能是什麼原因，一次只修一個問題，不要整個重寫。
修完告訴我要怎麼用手機測試。
```

## Codex 想整個重寫時

```
請停下來。只修剛剛那一個錯誤，其他已經能用的部分不要動。
先告訴我你打算改哪個檔案的哪一段。
```

## 換新鑰匙後更新 Cloudflare

```
我重新發行了 LINE Access Token，也建立了新的 Gemini API Key。
請用 wrangler secret put 更新 LINE_CHANNEL_ACCESS_TOKEN 和 GEMINI_API_KEY，
不要把新的鑰匙寫進任何檔案。更新完幫我確認 /health 正常。
新的 Access Token：〔貼上〕
新的 Gemini API Key：〔貼上〕
```
