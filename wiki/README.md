# CQE AI Class Check-In System — Wiki

自動產生的輕量架構文件, 目的是讓下次改功能時不用整包重讀原始碼. 只記錄從程式碼/註解/
`CLAUDE.md` 讀到的事實, 沒讀到的不編.

**上次同步 commit**: `4ffe6ea`
**同步方式**: 之後改動後, 跑 `git diff --stat 4ffe6ea..HEAD` 看動到哪些檔案, 只重新檢查
對應的模組文件, 沒動到的不用碰. 更新完把這行的 hash 換成新的 `git rev-parse --short HEAD`.

## 索引

- [architecture.md](architecture.md) — 整體架構: 進入點, 資料流, 權限模型, 外部依賴
- [decisions.md](decisions.md) — 有證據的架構決策紀錄 (附來源)
- 模組文件 (`modules/`):
  - [config.md](modules/config.md) — `src/config.js`, Supabase 金鑰/色盤唯一來源
  - [api.md](modules/api.md) — `src/api.js`, 統一 REST 呼叫層
  - [broadcast.md](modules/broadcast.md) — `src/broadcast.js`, 即時報到廣播
  - [checkin.md](modules/checkin.md) — `src/checkin.js`, 報到寫入邏輯
  - [utils.md](modules/utils.md) — `src/utils.js`, 共用工具函式
  - [device-route.md](modules/device-route.md) — `device-route.js`, Desktop.html 票證閘門
  - [index-html.md](modules/index-html.md) — `index.html`, 入口/Hub/TimeTree 月曆
  - [desktop-html.md](modules/desktop-html.md) — `Desktop.html`, 管理後台
  - [mobile-html.md](modules/mobile-html.md) — `Mobile.html`, 學員報到頁

## 未涵蓋

`scheduler.html` (舊版已編譯 Vite/React 排程板) — 原始碼不在本 repo, 屬禁區, 未產生模組
文件. `assets/` 內的編譯產物同理不分析.
