# src/api.js

## 職責

統一 Supabase REST 呼叫層, 合併原本 Desktop/Mobile 各自的 fetch 邏輯. 掛載至
`window.CQE.api`. 負責組 header (anon key 或 JWT)、解析 JSON、統一錯誤格式、
偵測 JWT 過期並自動清除登入態.

## 對外介面

### `rest(path, opts) → Promise<data>`

- `path` — API 路徑, 例如 `/rest/v1/courses?select=...`
- `opts.method` — 預設 `'GET'`
- `opts.body` — 已序列化的 JSON 字串
- `opts.auth` — `false` (預設) 用 anon key; `true` 用 `localStorage.sb_access_token` 的 JWT
- `opts.headers` — 額外 header, 會覆蓋預設值
- 失敗時 throw `Error`, 附 `.status` / `.code` / `.details`
- 401/403 且訊息符合 `/jwt|token|expir|invalid/i` → 呼叫內部 `_handleAuthExpiry()`:
  清 `sb_access_token`/`sb_user_email`, 嘗試呼叫呼叫端頁面全域的 `signOut()` /
  `refreshAuthUI()` (Desktop.html 有定義, Mobile.html 沒有, try-catch 安全降級)

### `restWithCount(path, opts) → Promise<{ rows, total }>`

同 `rest()` 參數, 額外支援 `opts.limit` / `opts.offset` (轉成 query string), 自動帶
`Prefer: count=exact`, 從回應的 `Content-Range` header 解出 `total`. 主要供
`Desktop.html` 後台分頁使用.

## 誰呼叫它

- `index.html` — 課程/報到讀取 (皆 `auth:false`), 課程編輯/新增 (`auth:true`)
- `Desktop.html` — 幾乎所有資料存取, 含 `restWithCount` 分頁查詢
- `Mobile.html` — 課程/學員/報到讀取, `checkin.js` 內部也呼叫 `rest()` 寫入 attendance
- `src/checkin.js` — `doCheckin()` 內呼叫 `window.CQE.api.rest()` 寫入報到

## 已知行為 (不是 bug)

JWT 短效期是 Supabase 預設行為, 過期後 `_handleAuthExpiry()` 會自動清 token 並登出,
排查「怎麼突然要重新登入」時先解 JWT payload 看 `exp`, 不要先懷疑程式邏輯.
