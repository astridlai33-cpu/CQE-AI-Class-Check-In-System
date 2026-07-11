# src/utils.js

## 職責

跨頁面共用的小工具函式, 無狀態, 掛載至 `window.CQE.utils`.

## 對外介面

- `escapeHtml(str) → string` — HTML 特殊字元轉義 (防 XSS), 任何用 `innerHTML` 拼字串
  帶入使用者輸入前都要過這層
- `getInitials(name, alt?) → string` — 從姓名產生最多兩字元的頭像縮寫;
  英文兩字取字首組合, 英文一字取前兩碼, 無英文名則 fallback `alt` (工號) 英文部分,
  再沒有就取姓名前兩碼 (中文姓名情境)
- `fmt(d) → string` — 個位數補零 (`5` → `'05'`)
- `todayStr() → string` — 本地時區今天日期, 格式 `YYYY-MM-DD`

## 誰呼叫它

`index.html`、`Desktop.html`、`Mobile.html` 三個進入點都用, 尤其 `escapeHtml` 是所有
動態拼 HTML 字串 (課程名稱、學員姓名等使用者可控內容) 的必經關卡.
