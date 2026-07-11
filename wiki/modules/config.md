# src/config.js

## 職責

全域唯一設定來源: Supabase URL/anon key + 色盤. 掛載至 `window.CQE.config`.
IIFE, 無 export 語法, 純瀏覽器全域變數.

## 對外介面

`window.CQE.config = { SUPABASE_URL, SUPABASE_ANON_KEY, PAL, CHART_PALETTE }`

- `SUPABASE_URL` / `SUPABASE_ANON_KEY` — 給 `src/api.js`、`src/broadcast.js` 建立連線用
- `PAL` — 10 色, 課程卡片/index.html 排程平台色盤 (`hashColor()` 依 key 雜湊取色)
- `CHART_PALETTE` — 10 色, Chart.js 堆疊圖專用. 超過 10 分類時呼叫端 (`Desktop.html`/
  `index.html`) 自行做同色加深/加淺循環, 這裡只提供基礎 10 色.

## 誰呼叫它

- `src/api.js` (讀 `SUPABASE_URL`/`SUPABASE_ANON_KEY`)
- `src/broadcast.js` (讀 `SUPABASE_URL`/`SUPABASE_ANON_KEY` 建立 `supabase.createClient`)
- `index.html` (讀 `PAL`、`CHART_PALETTE`)
- `Desktop.html` (讀 `CHART_PALETTE`)

## 禁區

專案 `CLAUDE.md` 明列: 這個檔案的 URL/key 未經同意不得動, 改了會斷線, 非 UI 範疇.
