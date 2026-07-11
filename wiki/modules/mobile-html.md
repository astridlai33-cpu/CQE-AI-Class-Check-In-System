# Mobile.html

## 職責

學員報到頁. 只顯示今日課程, 部門 tab (滑動式) 篩選學員名單, 點擊卡片報到.
無管理功能 (課程/學員清單匯入匯出在 Desktop.html, 依 Astrid 決策: 手機版不需要).

## 對外介面 (page-level 函式, 無對外 export)

- `loadTodayCourses()` — 只抓今天日期的課程 (非今日課程 `doCheckin()` 會擋, 見
  [checkin.md](checkin.md) 的 `allowCheckin`)
- `loadStudents()` — 抓學員名單
- `renderFnBar()` / `selectFnMobile(fn)` — 部門/職能篩選 tab bar (橫向滑動, 走
  ui-spec 隱藏卷軸例外)
- `renderList()` — 依篩選畫學員卡片列表
- `applyCheckinLock()` — 報到狀態鎖定 (已報到卡片禁止重複點擊/顯示已報到樣式)
- `updateStats()` — 頁面統計數字更新 (已報到/總人數)
- `confirmCheckinIdentity(s)` — 誤點防呆確認視窗, 確認後才呼叫
  `window.CQE.checkin.doCheckin()`. 與 `Desktop.html` 同名函式各自獨立實作
- `openNewStudentModal(empNo)` / `closeNewStudentModal()` / `onSaveNewStudent()` —
  現場新增學員 (查無工號時的補登路徑)
- `setupRealtimeAttendanceMobile(courseId)` — 訂閱 `src/broadcast.js` 的
  `checkin-bc` 頻道, 其他裝置報到時同步更新本頁已報到清單
- `toast(text, type)` — 輕量提示訊息 (報到成功/失敗)

## 誰呼叫它

學員手機/平板開啟 (`index.html` Hub 依裝置判斷或手動導向), 今日課程當堂使用.

## 依賴

`src/config.js` → `src/api.js`、`src/checkin.js`、`src/broadcast.js`、`src/utils.js`
(`escapeHtml`/`getInitials` 畫學員卡片用).
