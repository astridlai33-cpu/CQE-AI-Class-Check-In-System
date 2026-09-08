## 專案卡 (30 秒讀懂本專案)

- 一句話: 給 CQE 全部門學員用的課程查詢與線上報到系統, 解決學員不清楚排課/報到要人工補登的問題.
- 定級: L3 (判準見 devproj-yh rules/evaluate.md E1: 全部門使用 + 寫共用資料 + 會壞掉有人找 + 會持續加功能). 定級日期: 2026-07-10
- 類型: 多頁網站 (靜態多檔, 無 build 工具)
- OS 矩陣: 開發 Mac → 目標瀏覽器 (桌機+手機). 本專案是網站非桌面 app, 不適用 evaluate.md E2b 的桌面 OS 硬規則; 改用下方 DoD 的三 viewport 響應式檢查.
- 技術選型結論: 沿用既有 Supabase (Postgres REST API, 見 src/config.js + src/api.js), 前端純 HTML/CSS/JS 重做成 dark-yh 高級深色風. 為什麼: 既有系統已跑通多人報到與資料寫入, 換底層 (曾提案 SQLite) 與「全部門使用+多裝置報到」的 L3 定級衝突, 已與 Astrid 定案排除.
- 目前階段: G3 (功能批次進行中: UI 重做+月曆+編輯功能已交付, 待 G4 硬化)

## 現況架構 (2026-07-10 盤點, 換 UI 前必讀)

- `index.html` — 2026-07-10 已重寫為 vanilla dark-yh 入口: 通關代碼 portal + hub 導覽 + TimeTree 風月曆課程表 (讀 Supabase courses 表, 唯讀). 舊版原始 index.html 已備份為 index.html.bak-20260710-2304, 內容改名保留為 scheduler.html (絕對路徑資產, 本機直開會 404, 部署到 GitHub Pages 才正常, 既有行為未修)
- `scheduler.html` — 舊 `index.html` 原封不動改名, 登入閘門 + 已編譯的 Vite/React 排程板入口 (assets/index-*.js, 原始碼不在本資料夾)
- `Desktop.html` (2543 行) — 管理端: 課程建立/編輯, 報到補登, 上課人次圖表. 用 `device-route.js` 做票證閘門 (localStorage `cqe_gate_ok`, TTL 12hr)
- `Mobile.html` (737 行) — 學員端: 課程查詢 + 線上報到
- `src/config.js` — Supabase URL/anon key + 色盤 (單一來源)
- `src/api.js` — 統一 REST 呼叫層 (`rest`/`restWithCount`, auth=true 用 JWT / false 用 anon key)
- `src/checkin.js`, `src/broadcast.js`, `src/utils.js` — 報到/廣播/工具函式
- `styles/tokens.css` — 既有色彩 token (本次要換成 devproj-yh rules/ui-spec.md 的 dark-yh v2 token)
- 本次(Desktop/Mobile 重做)改動範圍: **只動 Desktop.html / Mobile.html 的 UI/UX 與 styles/**, 不動 src/*.js 的 Supabase 呼叫邏輯. index.html 已於後續 session 另案重做 (見上).

## 跑起來 (指令必須可直接複製執行)

```bash
# 開發模式 (file:// 下 type="module" 會被瀏覽器擋, 一律起本機靜態伺服器)
cd "/Users/AstridLai/Desktop/CQE-AI-Class-Check-In-System-main 2" && python3 -m http.server 8080
# 開瀏覽器: http://localhost:8080/Mobile.html (學員端) 或 /Desktop.html (管理端, 本機會跳過票證閘門)

# 驗收 lint (交付前必跑)
python scripts/check_project.py "/Users/AstridLai/Desktop/CQE-AI-Class-Check-In-System-main 2" --type web --level 3

# 部署 (L3 必填) — 資料夾複製/git push 到既有靜態託管 (參考: astridlai33-cpu.github.io/CQE-AI-Class-Check-In-System/)
# 本資料夾目前無 .git, 部署前先確認正式 repo 位置 (環境陷阱見下)
```

## 本專案的完成定義 (DoD)

- [ ] 三 viewport (375/768/1440) 截圖, Desktop.html 與 Mobile.html 皆無元素重疊/溢出/不可讀
- [ ] 交付形式符合靜態多檔選型: 資料夾複製/git push 即部署, 無 node server 依賴
- [ ] 空資料/超長課程名/中英混排 三種輸入不破版
- [ ] 主要互動 (課程查詢/報到/補登/圖表) 在無 console error 下完成
- [ ] 符合 rules/ui-spec.md 全部硬規則 (按鈕外框式 R1, 文字禁純黑 R2, focus 三層 R4, scrollbar 全站深色化 R7)
- [ ] 報到/課程資料有匯出功能 (CSV/JSON 擇一) 作備援 (需求書第 5 節: 遺失代價會痛)
- [ ] Supabase 呼叫邏輯 (src/*.js) 改動前後行為一致 (換皮不換骨, 見 ui-spec.md 第 5 節)

## 禁區 (不准動)

- `scheduler.html` 的 Vite/React 排程板部分與 assets/index-*.js — 原因: 原始碼不在本資料夾, 屬另一系統
- `src/config.js` 的 Supabase URL/key — 原因: 動了會斷線, 非 UI 範疇
- 未經使用者同意不得: 刪除既有課程/報到資料, 改動 Supabase schema, 對外發布

## 環境陷阱 (踩過的坑, 開工前先讀)

- 本資料夾**無 .git**, 是靜態檔案複製, 不是開發中的 repo — 正式部署路徑待 Astrid 確認, 交付前先問清楚要 push 去哪.
- `type="module"` 的 script 在 `file://` 協定下會被瀏覽器擋, 本機測試一律用 `python3 -m http.server` 起靜態伺服器, 不要直接雙擊開 index.html.
- `device-route.js` 判斷 `isLocal()` 才會放行無票證存取 Desktop.html; localhost/127.0.0.1/file: 皆算本機.
- ASE 公司網路走 NTLM proxy: npm/pip/git 直連會失敗 (本專案無 npm 依賴, 影響較小).
- 中文字型: 若之後要匯出 PDF/簡報才會踩雷, 純網頁渲染目前無此問題.

## 工作規則 (每個 session 都適用)

1. 服從 governance-yh 全套硬規則 (備份/完成要有證據/驗證不自驗/派工門檻).
2. UI 迭代預算 2 輪, 規則見 devproj-yh rules/lifecycle.md 第 4 節.
3. 改碼風格服從 minimalist-coder: 不過度設計, 不加沒被要求的抽象.
4. 每次 session 結束前: 更新下方"專案 lessons"與"目前階段", 這是下個 session 的交接文件.

## 專案 lessons (append-only, 格式: 日期 | 症狀 | 對策)

- 2026-07-10 | 開案時發現本資料夾無 git/package.json, 與"沿用 Supabase 架構"的假設需要對照現況才看得出 index.html 是另一套已編譯系統 | 開案盤點時務必先讀現有檔案結構再定 CLAUDE.md 內容, 不能只憑需求書文字推測架構
- 2026-07-10 | index.html 重做時, 舊 React bundle 裡的「通關代碼/hub/裝置判斷」邏輯只存在編譯後的 assets/index-*.js, 原始碼不在庫內 | 用 grep 從 minified bundle 反查關鍵字 (QACQE / cqe_gate_ok / keyframes / Mobi|Android|iPhone) 逆向出精確既有行為, 而非憑印象重寫; CDP 測試中發現 Chrome 的 Location.href/replace 是 WebIDL Unforgeable 屬性, 無法從頁面 JS монkey-patch 攔截導頁, 改用真實導頁 + Page.frameRequestedNavigation 事件驗證; Network.getResponseBody 對重複 responseReceived 記錄會噴 "No resource with given identifier found", 改用 DOM 層證據 (chip 文字/筆數) 驗證真實資料, 不要死磕 CDP 這個坑

- 2026-07-11 | 驗收課程編輯功能時在正式 Supabase 誤改一筆真資料 (CQE Agent P2 start_time), 權限分類器擋下回改操作 | 之後所有寫入類功能驗證一律 mock fetch 攔截 payload, 不對正式庫做任何寫入; 該筆待 Astrid 手動改回 14:00
- 2026-07-11 | 管理員 JWT 過期時月曆報到名單顯示「需管理員登入」被誤判為 bug | Supabase JWT 短效期是預設行為, api.js 的 _handleAuthExpiry 會自動清 token, 排查時先解 JWT payload 看 exp 再懷疑程式
- 2026-07-11 | 瀏覽器快取舊版 config.js/index.html 造成「改了沒生效」誤判多次 | 共用 js 引用一律帶 ?v=日期 版本參數, 改檔後 bump; 驗證時 URL 帶 _r 隨機參數
- 2026-09-07 | Desktop.html 的「匯出上課人員」CSV 按鈕換成 xlsx 三表匯出 (上課名單/課程統計/學員統計). 原版用 JWT 讀資料, token 過期就匯不出; 新版一律 anon 讀 (RLS 已開放), 不受過期影響 | xlsx 是自組 OOXML+zip (CompressionStream deflate-raw, 不支援時退回 stored), 無外部依賴不走 CDN — 公司 proxy 擋 CDN 時仍可用; 產出檔名沿用 `_yyyymmddhhmmss_(Security C).xlsx` 慣例
- 2026-09-07 | Edit 工具改不動含 BOM (原始碼寫成反斜線 uFEFF) 逃逸序列的那一行 (實際字元與逃逸字串兩種形式都比對不到) | 這類行改用 node 腳本做行區間 splice, 不要跟 Edit 硬耗; splice 前先 `cp` 備份
- 2026-09-08 | 接手中斷的 session 時, 靠檔案 mtime + 與部署 repo 比對就能精確定位斷點: 程式碼三個檔都改完且語法無誤, 真正沒做的是收尾 (CLAUDE.md 交接沒更新 + 沒推送) | 盤點順序: `find -newermt` 排時間 → `diff --strip-trailing-cr` 比 repo → `git ls-remote` 看遠端 HEAD → 抽 HTML 內嵌 script 過 `new vm.Script()` 驗語法, 不要憑「看起來像改一半」就重寫
- 2026-07-11 | 月曆報到名單原本卡管理員登入, 根因是 attendance 表 RLS 只允許 anon 讀當日 (attendance_read_today_anon) | 經 Astrid 明示同意後加 migration attendance_read_all_anon (anon 可 SELECT 全部出席記錄), 前端改一律匿名讀+課程列右側顯示 n 人 (accent 色); Supabase 政策變更紀錄在此, 屬黃級改動已取得同意

## 待辦與交接 (session 結束前更新)

- 目前狀態 (2026-07-11): G3 功能批次持續中. 已交付並驗收: Desktop/Mobile UI 重做, index.html 入口 (原版 portal/hub 還原+VS Code 打字背景), TimeTree 月曆 (五欄制/磨砂面板/年月選擇器/拖曳換月/管理員編輯+新增課程+取消報到/報到名單 function+部門碼+ID 分權顯示/Search/排序/圖表含 Daily-Month), 後台圖表 function 分類+Daily-Month+取消報到批次, Mobile 報到誤點確認視窗, 部門 tab 滑動.
- 原「進行中 (subagent)」三項已於 2026-09-07 完成並確認在檔內: 自訂深色日期/時間選擇器 (`attachDatePicker`/`attachTimePicker`, Desktop.html + index.html 皆有, Mobile.html 無 date/time input 故不需要), 月曆當月堂數 (`#monthCount`), 圖表累計堂數 (Desktop `#chartCourseKpi` / index `#calChartKpi`).
- 2026-09-07 追加: Desktop.html 圖表頁的匯出按鈕改為 xlsx 三表匯出 (`exportAttendanceXlsx`), 取代原本的 `attendance_list.csv`. 已備份 `Desktop.html.bak-20260907-145256`.
- 2026-09-08: xlsx 匯出實作抽成共用模組 `src/xlsx-export.js` (`window.CQE.xlsxExport.exportAttendanceXlsx()`), Desktop.html 移除內嵌實作改為呼叫; index.html 月曆圖表面板新增匯出鈕 `#btnCalXlsx` (只在 localStorage 有 `sb_access_token` 時顯示, 每次開面板重判). 兩邊按鈕文字統一為「Excel」. 備份 `Desktop.html.bak2-20260907-175752`.
- 2026-09-08: 圖表 KPI「累計 N 堂課」改為只計**實際上過的課** — 日期不晚於今天 **且**已有人報到; 未來排定的課、以及沒人報到的課 (沒開成) 都不計入. Astrid 定案: 過去但 0 報到的課也不算, 過去與當天同一套標準. 兩處同步 (Desktop `#chartCourseKpi` / index `#calChartKpi`), 人次 KPI 與圖表本身的資料範圍未動. 備份 `Desktop.html.bak3-20260908-143757` / `index.html.bak-20260908-143757`.
- 2026-09-08: 管理後台【學員名單】搜尋框加入 Function 欄 — `loadStudentsAdmin` 的 PostgREST `or=(...)` 從 team/name/employee_no 三欄擴為四欄 (`function.ilike` 排最前), placeholder 同步改為「搜尋 Function / Team / Name / ID」. 本機與公司 proxy 都連不到 Supabase (curl 回 HTTP 000), 此查詢未實連驗證, 待 Astrid 在正式站試打一次 Function 關鍵字. 備份 `Desktop.html.bak4-20260908-153916`.
- **部署 repo 已確認 (2026-09-07)**: `astridlai33-cpu/CQE-AI-Class-Check-In-System` (main 分支 → GitHub Pages). 本資料夾仍無 .git; 推送方式是 clone 到暫存區、複製改動檔後 commit/push. 本資料夾的檔案本身已是 CRLF, 與 repo 一致, 直接 `cp` 即可 (比對差異時用 `diff --strip-trailing-cr`, 否則所有檔案都會被標成 differ).
- 待 Astrid: ①確認 2026-08-05 CQE Agent P2 start_time 是否已改回 14:00 ②首次真實使用「取消報到」時挑一筆測試再批次用 ③在正式站按一次「Excel」匯出鈕 (Desktop 後台圖表頁 + index 月曆圖表面板兩處) 確認 anon 讀取真的通 (本機網路擋 Supabase, 無法實連驗證).
- 下一步: G4 硬化 (lifecycle DoD 逐條: 三 viewport 全頁截圖/空資料超長字串中英混排/console error 清查) → G5 部署.
