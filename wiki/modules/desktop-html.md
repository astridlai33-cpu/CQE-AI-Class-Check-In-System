# Desktop.html

## 職責

管理後台: 登入, 課程建立/編輯/刪除, 學員與報到管理 (含過去補登/取消報到), 堆疊長條圖
統計. Tab 型式分頁 UI. 進場先過 `device-route.js` 票證閘門.

## 對外介面 (page-level 函式, 無對外 export)

### 登入 / 狀態
- `signIn(email, password)` / `signOut()` — Supabase Auth 登入登出, 寫/清 `state.access_token`
- `saveState()` — 存 `state` 到 localStorage
- `refreshAuthUI()` — 依登入狀態切換 UI (`src/api.js` 的 `_handleAuthExpiry()` 過期時也會呼叫這支)
- `setSubtabsVisibility(loggedIn)` / `ensureAdminDefaultTab()` — tab 可見性與預設 tab

### 課程
- `loadCourses()` / `editCourse(id)` / `deleteCourse(id)` — 與 `index.html` TimeTree
  操作同一張 `courses` 表, 兩邊資料天然一致

### 學員與報到
- `loadStudentsAndAttendance()` — 後台學員名單 + 報到狀態
- `buildBackfillList()` — 「過去補登」清單, 含補登 checkbox 與取消報到 checkbox
  (`__bf_toRemove` Set, 對應 `#btnRemoveChecked` 批次刪除)
- `exportTodayAttendance()` — 今日報到匯出
- `exportAttendanceCSV()` — 報到記錄 CSV 匯出
- `countAttendanceOfStudent(studentId)` / `deleteAttendanceByStudent(studentId)` /
  `deleteStudentRow(studentId)` — 單一學員的報到記錄統計/清除/刪除學員

### 圖表
- `ensureChartJs()` — 動態載入 Chart.js CDN
- `loadStackedChart()` — 依 function 分類的堆疊長條圖, Daily/Month 切換, KPI 顯示
  「累計 N 堂課 · X 人次」
- `clearChart()` — 銷毀既有 chart instance (換 tab/切換模式前呼叫, 避免 Chart.js 疊圖)

### 共用 UI 元件
- `showAlert(message)` / `showConfirm(message)` / `showFormModal({title, fields})` —
  自訂深色 modal
- `confirmCheckinIdentity(s)` — 誤點防呆確認視窗 (Function/部門碼/ID/名字), 報到前
  必經; `Mobile.html` 有另一份同名函式各自實作 (未共用模組化)
- `initAdminPickers()` — 自訂深色日期/時間選擇器綁定 (建立課程表單用)

## 誰呼叫它

管理員手動輸入網址進入 (或從 `index.html` Hub「上課報到」卡片, 若判斷為桌機裝置導向此頁
的管理功能入口). 需要 `cqe_gate_ok` 票證 (本機開發環境例外放行).

## 依賴

`src/config.js` → `src/api.js`、`src/broadcast.js` (即時報到通知), Chart.js CDN,
`device-route.js` (票證閘門).
