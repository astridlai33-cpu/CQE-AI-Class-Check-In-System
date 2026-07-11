# device-route.js

## 職責

`Desktop.html` `<head>` 最前方載入的票證閘門. 只管「有沒有資格進 Desktop.html 這個頁面」,
跟資料層的 anon key / JWT 權限完全無關 (那是 `src/api.js` 的事).

## 對外介面

無 export, 是立即執行的 IIFE, 載入當下就跑完副作用:

- 有效票證 (`localStorage.cqe_gate_ok = {ok:true, exp>now}`) → 滑動延長 TTL 12 小時, 繼續載入
- 無效票證 + 非本機 (`isLocal()` 判斷 `file:`/`localhost`/`127.0.0.1`) → `location.replace('index.html')` 導回入口
- 無效票證 + 本機開發 → 照樣放行 (方便本機測試不用每次都走驗證流程)

## 誰呼叫它

只有 `Desktop.html` 載入, 是 `<head>` 內第一支 script.

## 與 index.html 通關代碼的關係

`index.html` 的 `QACQE` 通關代碼驗證通過後會呼叫 `writeTicket()` (`index.html:616`)
寫入同一把 `cqe_gate_ok` key, 讓使用者從 Hub 點進 `Desktop.html` 時這裡讀得到有效票證。
兩邊 TTL 定義必須一致 (12 小時), 改一邊沒改另一邊會出現「明明剛登入卻被導回」的問題。
