# 架構決策紀錄

只收錄程式碼註解或 CLAUDE.md 裡明確講出「為什麼」的決策, 附證據來源. 沒證據不編動機.

## 沿用 Supabase, 不換 SQLite

**決策**: 前端純重做, 後端維持既有 Supabase (Postgres REST API).
**為什麼**: 既有系統已跑通多人報到與資料寫入, 換底層 (曾提案 SQLite) 與「全部門使用
+多裝置報到」的 L3 定級衝突.
**來源**: `CLAUDE.md` 第 7 行.

## 月曆只顯示週一~五

**決策**: TimeTree 月曆固定 5 欄 (週一~週五), 不顯示週末.
**為什麼**: Astrid 定案; 資料庫實查 28 堂課週末 0 堂, 落在週末的課會在月統計數字旁標註
「N 堂在週末, 月曆未顯示」, 不讓資料無聲消失.
**來源**: `index.html:224`, `index.html:847`.

## 報到名單開放匿名檢視

**決策**: `attendance` 表加 RLS policy `attendance_read_all_anon` (anon 可 SELECT
全部出席記錄), 取代原本只允許讀當日的 `attendance_read_today_anon`.
**為什麼**: 月曆報到名單原本卡「需管理員登入」才看得到過去課程人數, 根因是 RLS 只放行
當日; 2026-07-11 經 Astrid 明示同意後加此 migration.
**來源**: `index.html:1003` 註解, `CLAUDE.md` 專案 lessons 2026-07-11 條目.

## 匿名可搜尋隱藏欄位, 但看不到欄位內容

**決策**: 報到名單搜尋框可以比對部門碼/工號等匿名看不到的欄位, 但搜尋結果不顯示這些
欄位值給非管理員.
**為什麼**: Astrid 定案 (平衡「好搜尋」與「權限分級」).
**來源**: `index.html:1091`.

## 圖表堆疊分類從 team 改為 function, Total 不畫線只留數字

**決策**: `Desktop.html` 與 `index.html` 圖表堆疊分類依據從團隊 (team) 改成職能
(function); Total 資料集不顯示折線與資料點, 只保留柱頂數字標籤與 tooltip 內的 Total 項.
**為什麼**: 2026-07-11 Astrid 定案 (原本白色折線視覺上蓋過堆疊色塊, 已移除).
**來源**: `Desktop.html:2088`, `Desktop.html:2214`, `Desktop.html:2314`, `index.html:1707`.

## 課程 chip 桌機四行不動態斷行, 手機退為三行

**決策**: 桌機月曆 chip 固定顯示課名/單位/時間/地點四行, 各自獨立一行; 手機格子放不下
第四行, 地點資訊退回只在 drawer (課程明細) 顯示.
**為什麼**: Astrid 回饋 v4 (桌機不要斷行), 手機螢幕寬度取捨後的折衷.
**來源**: `index.html:253-254`, `index.html:864`.

## Desktop.html 用票證閘門, 本機開發放行

**決策**: `device-route.js` 檢查 `cqe_gate_ok` 票證, 無效且非本機才導回 `index.html`;
`file://`/`localhost`/`127.0.0.1` 一律放行.
**為什麼**: 方便本機開發測試不用每次重新走通關代碼流程 (程式碼註解直接寫明此意圖).
**來源**: `device-route.js:37`.
