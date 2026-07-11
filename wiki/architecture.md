# 架構總覽

## 系統類型

靜態多檔網站, 無 build 工具, 無 npm 依賴. 三個獨立 HTML 進入點各自載入共用的
`src/*.js` 模組. 後端是既有 Supabase 專案 (project ref `kxyguqnoudtnxkexbsnc`),
前端一律走 PostgREST (`/rest/v1/...`).

## 進入點

| 檔案 | 角色 | 誰用 |
|---|---|---|
| `index.html` | 入口: 通關代碼 portal → Hub 導覽 (兩張卡) → TimeTree 風月曆課程表 (唯讀) | 所有人第一站 |
| `Desktop.html` | 管理後台: 課程建立/編輯/刪除, 報到補登與取消, 堆疊圖表, 學員管理 | 管理員 (需登入) |
| `Mobile.html` | 學員報到頁: 部門 tab 篩選學員 + 點名報到 | 學員 (今日課程) |
| `scheduler.html` | 舊版 (改名前的原始 `index.html`), 已編譯的 Vite/React 排程板, 原始碼不在本 repo | 保留舊功能, 邏輯上是另一套系統, 屬禁區 |

## 資料流

```
瀏覽器 (index.html / Desktop.html / Mobile.html)
   │  fetch, 帶 apikey (anon) 或 Authorization: Bearer <JWT> (auth=true)
   ▼
src/api.js  rest() / restWithCount()
   │
   ▼
Supabase PostgREST  https://kxyguqnoudtnxkexbsnc.supabase.co/rest/v1/*
   │
   ├─ courses    (課程: title/date/start_time/end_time/room/dept)
   ├─ students   (學員: name/function/team/emp_id...)
   └─ attendance (報到記錄: course_id/student_id/checked_in_day_local, unique 約束防重複報到)

即時廣播 (報到瞬間同步其他裝置):
Mobile.html --checkin.js doCheckin()--> attendance 表寫入 --> broadcast.js emitCheckin()
                                                                   │
                                                    Supabase Realtime Broadcast channel 'checkin-bc'
                                                                   │
                                                    Desktop.html / 其他 Mobile 分頁監聽更新畫面
```

## 權限模型

- **anon key** (`src/config.js` 內, 設計上就是公開的前端 key): 讀 courses/students, 讀
  attendance (`attendance_read_all_anon` RLS policy, 2026-07-11 加入), 寫入 attendance
  (報到動作本身不需登入).
- **JWT** (`localStorage.sb_access_token`, Desktop.html 登入取得): 課程建立/編輯/刪除,
  刪除 attendance (取消報到), 學員管理. `src/api.js` 的 `rest(path, {auth:true})` 用這把.
- **裝置票證** (`localStorage.cqe_gate_ok`, 12 小時 TTL): 只是「通關代碼」層的存取控制,
  跟上面的資料權限無關. `device-route.js` 掛在 Desktop.html `<head>` 最前, 沒票證且非本機
  就導回 `index.html`. 本機開發 (`file://`/`localhost`/`127.0.0.1`) 一律放行, 見
  `device-route.js:11-15` `isLocal()`.

## 外部依賴 (CDN, 無 npm)

- Supabase JS Client (`window.supabase`, broadcast.js 用來建立 `sb.channel`)
- Chart.js 4.4.1 (`Desktop.html` / `index.html` 的圖表, 動態載入, 見 `ensureChartJs()`)

## 共用模組載入順序

三個進入點都要先載 `src/config.js` (掛 `window.CQE.config`), 才能載
`src/api.js` / `src/broadcast.js` (兩者都讀 `window.CQE.config` 裡的 URL/key).
`src/checkin.js` 依賴 `window.CQE.api` 與 `window.CQE.broadcast` 已存在.

## 已知限制 (不是 bug, 是既有取捨)

- `scheduler.html` 內部資源走絕對路徑, 本機開會 404, 部署到 GitHub Pages 才正常.
- 月曆固定只顯示週一~五 (詳見 [decisions.md](decisions.md)).
