# src/broadcast.js

## 職責

管理唯一的 Supabase Realtime Broadcast channel, 讓報到動作即時同步到其他裝置/分頁
(例如學員在 Mobile.html 報到, Desktop.html 開著的報到清單即時更新). 掛載至
`window.CQE.broadcast` 與 `window.CQE.sb`.

同時是本專案**唯一**建立 Supabase JS Client (`supabase.createClient(...)`) 的地方,
其他模組要用這個 client 一律讀 `window.CQE.sb`, 不重複建立.

## 對外介面

### `ensureBroadcast(onReceive?) → RealtimeChannel`

- 第一次呼叫: 建立 channel `'checkin-bc'` (`config.broadcast.self = false`, 不收自己送的),
  若有傳 `onReceive` callback 就掛上 `'broadcast'`/`'checkin'` event listener, 然後 `subscribe()`.
- 之後再呼叫 (不論有沒有傳 callback): 直接回傳既有 channel, **不會**重複附加 listener —
  這代表 `onReceive` 只有第一次呼叫有效, 呼叫端要小心不要以為每次呼叫都能換 handler.

### `emitCheckin(course_id, student_id) → Promise<void>`

等待 channel 進入 `SUBSCRIBED` 狀態後送出 `{ course_id, student_id, ts }` (皆轉字串/數字)。
送出失敗只 `console.warn`, 不 throw (報到本身已經寫進資料庫, 廣播只是錦上添花).

## 誰呼叫它

- `Desktop.html setupBroadcastReceiver()` — 傳入接收邏輯 (更新報到清單/圖表)
- `Mobile.html setupRealtimeAttendanceMobile()` — 傳入接收邏輯 (更新已報到清單)
- `src/checkin.js doCheckin()` — 報到成功後呼叫 `emitCheckin()` (不傳 callback, 純送出)

## 注意事項

`ensureBroadcast()` 內部用閉包變數 `__bc`/`__bcReady` 記狀態, 整個頁面生命週期只會建立
一個 channel. 若之後要支援「多課程各自獨立頻道」需要改介面簽名, 現在是全站共用單一頻道
靠 payload 裡的 `course_id` 讓接收端自行過濾。
