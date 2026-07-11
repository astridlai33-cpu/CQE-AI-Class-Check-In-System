# src/checkin.js

## 職責

單一報到動作的邏輯 (寫入 attendance 表 + 觸發廣播), 合併原本 Desktop/Mobile 兩份重複
邏輯. 掛載至 `window.CQE.checkin`. 刻意設計成**不碰 DOM** — 呼叫端自己負責報到成功/失敗
後怎麼更新畫面.

## 對外介面

### `doCheckin(course_id, student, opts?) → Promise<{ ok: true, duplicated: boolean }>`

- `student` 必須有 `.id`, 否則直接 throw
- `opts.allowCheckin` 預設 `true`; 傳 `false` 會直接 throw `'非今日課程不允許報到'`
  (呼叫端在報到前自行判斷是否為今日課程, 這裡只是最後一道防呆)
- 用 `POST /rest/v1/attendance?on_conflict=course_id,student_id,checked_in_day_local`,
  帶 `Prefer: resolution=ignore-duplicates,return=representation` — 重複報到不會拋錯,
  Supabase 回傳空陣列, 此函式把它轉換成 `duplicated: true` 讓呼叫端可以顯示「已經報到過」
  而不是報錯
- 內部呼叫 `window.CQE.broadcast.emitCheckin()`, 呼叫端不需要自己再廣播一次

## 誰呼叫它

- `Mobile.html` 學員點名報到 (點擊學員卡片, 經 `confirmCheckinIdentity()` 確認後呼叫)

## 相關防呆 (在呼叫端, 不在本模組)

`Mobile.html`/`Desktop.html` 皆有「誤點他人姓名」防呆: 點擊卡片先跳
`confirmCheckinIdentity(s)` 確認視窗 (顯示 Function/部門碼/ID/名字), 使用者按「確認報到」
才呼叫 `doCheckin()`. 這層防呆與本模組無關, 各自在兩個 HTML 檔案內各自實作一份同名函式。
