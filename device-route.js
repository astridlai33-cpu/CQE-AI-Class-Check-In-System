/**
 * device-route.js
 * Desktop.html 的 <head> 最前方載入。
 * 功能：若持有有效的 cqe_gate_ok 票證，則滑動延伸 TTL 12 小時；
 *       若票證不存在或已過期，且非本機開發環境，則導回 index.html 重新驗證。
 */
(function () {
  var KEY = 'cqe_gate_ok';
  var TTL = 12 * 60 * 60 * 1000; // 12 小時

  function isLocal() {
    return location.protocol === 'file:' ||
           location.hostname === 'localhost' ||
           location.hostname === '127.0.0.1';
  }

  function hasValidTicket() {
    try {
      var t = JSON.parse(localStorage.getItem(KEY) || '{}');
      return !!(t.ok && t.exp > Date.now());
    } catch (e) {
      return false;
    }
  }

  function slideTicket() {
    localStorage.setItem(KEY, JSON.stringify({ ok: true, exp: Date.now() + TTL }));
  }

  if (hasValidTicket()) {
    // 有效票證：滑動延伸 TTL，繼續正常載入
    slideTicket();
  } else if (!isLocal()) {
    // 無效票證 + 非本機：導回登入頁
    location.replace('index.html');
  }
  // 本機開發環境：無票證也放行（方便開發測試）
})();
