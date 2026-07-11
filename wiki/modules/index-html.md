# index.html

## 職責

系統入口. 三段式: 通關代碼 portal → Hub 導覽 (兩張卡: 課程表 / 上課報到) → TimeTree
風月曆課程表 (唯讀瀏覽, 管理員登入時可編輯). 背景有一段逆向自舊 React bundle 的假
VS Code 打字動畫 (`VS_TOKENS`, 純視覺, 無邏輯耦合).

## 對外介面 (page-level, 皆為模組內函式, 無對外 export)

### 進場流程
- `isMobileDevice()` — UA + viewport 判斷裝置, 決定登入後導去哪個報到介面
- `writeTicket()` — 通關代碼驗證通過後寫 `cqe_gate_ok` 票證 (見 [device-route.md](device-route.md) 的耦合關係)
- `showScreen(id)` / `submitCode()` / `enterHub()` — portal → Hub 畫面切換

### 月曆 (TimeTree 風)
- `loadCourses()` — 抓全部課程, 建 `coursesByDate: Map<'YYYY-MM-DD', course[]>`
- `loadAttCounts()` — bulk 抓 `attendance?select=course_id` 算每堂課報到人數, 建
  `courseAttCount: Map<course_id, count>`, 過去日期的 chip 用這個顯示實際人數
- `initCalendar()` — 進場初始化: 判斷是否顯示「Add」按鈕 (`state.access_token` 存在才顯示),
  平行 `loadCourses()` + `loadAttCounts()`, 呼叫 `renderMonth()`
- `renderMonth()` — 畫當月 42 格 (只顯示週一~五, 見 [decisions.md](decisions.md)), 含
  chip (課名/單位/時間/地點) 與過去日期人數標籤
- `openDetail(ds)` / `closeDetail()` — 開關右側/底部 drawer, 顯示當日課程明細
- `editCourse(id)` / `createCourse()` — 管理員登入時可用, 寫入同一張 `courses` 表,
  與 `Desktop.html` 後台課程清單天然一致 (同表不同介面)
- `fadeSwitchMonth(dir)` — 換月動畫

### 報到名單 (drawer 內)
- `loadStudentsCache()` — 學員全表快取一次
- `loadAttendanceIds(courseId)` — 各課 attendance 快取 (`attendanceCache` Map)
- `renderAttendanceBox(courseId, el, countEl)` / `renderAttList(...)` — 畫報到名單,
  管理員登入可見部門碼/工號並有取消報到按鈕, 匿名只看 function+姓名但仍可搜尋隱藏欄位

### 共用 UI 元件
- `showConfirm(message)` / `showAlert(message)` / `showFormModal({title, fields})` —
  自訂深色 modal, 取代原生 `confirm()`/`alert()`/表單彈窗

## 誰呼叫它

使用者瀏覽器直接開啟, 是網站的 `/` 首頁.

## 依賴

`src/config.js` → `src/api.js` (資料讀寫), Chart.js CDN (圖表, 動態載入).
