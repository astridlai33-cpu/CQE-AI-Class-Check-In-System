/* =====================================================================
 * src/broadcast.js — CQE AI Class Check-In System
 * Supabase Realtime Broadcast：共用頻道管理 + 廣播送出
 * IIFE 格式，掛載至 window.CQE.broadcast 與 window.CQE.sb
 *
 * ensureBroadcast(onReceive?)
 *   第一次呼叫時建立頻道並訂閱；若傳入 onReceive callback，附加接收監聽器。
 *   之後再呼叫（無論是否傳 callback）皆直接回傳既有頻道物件。
 *   → Desktop.html setupBroadcastReceiver() 傳入 Desktop 接收邏輯
 *   → Mobile.html 傳入 Mobile 接收邏輯
 *   → emitCheckin() 再次呼叫（不傳 callback）以取得頻道送出廣播
 *
 * emitCheckin(course_id, student_id)
 *   等待 SUBSCRIBED 後送出廣播 payload。
 * ===================================================================== */
(function () {
  'use strict';
  window.CQE = window.CQE || {};

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.CQE.config;

  // 建立（唯一）Supabase JS Client，供 Realtime / broadcast 使用
  // 其他模組（Desktop.html、Mobile.html）透過 window.CQE.sb 取用
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.CQE.sb = sb;

  let __bc       = null;   // Realtime channel 物件
  let __bcReady  = null;   // Promise，SUBSCRIBED 後 resolve

  /**
   * 確保廣播頻道存在並已訂閱。
   * @param {function} [onReceive] - 接收 checkin 廣播的 callback(msg)
   *   僅第一次呼叫時有效；頻道已存在後再傳入 callback 會被忽略（避免重複附加）。
   * @returns {RealtimeChannel}
   */
  function ensureBroadcast(onReceive) {
    if (!__bc) {
      __bc = sb.channel('checkin-bc', { config: { broadcast: { self: false } } });
      if (typeof onReceive === 'function') {
        __bc.on('broadcast', { event: 'checkin' }, onReceive);
      }
      __bcReady = new Promise(function (resolve) {
        __bc.subscribe(function (status, err) {
          if (status === 'SUBSCRIBED') resolve();
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn('[CQE Broadcast] 訂閱異常：', status, err);
          }
        });
      });
    }
    return __bc;
  }

  /**
   * 等待頻道 SUBSCRIBED 後送出報到廣播。
   * @param {string|number} course_id
   * @param {string|number} student_id
   */
  async function emitCheckin(course_id, student_id) {
    try {
      ensureBroadcast();   // 若頻道尚未建立，建立一個（無 receive handler）
      await __bcReady;
      await __bc.send({
        type:    'broadcast',
        event:   'checkin',
        payload: {
          course_id:  String(course_id),
          student_id: String(student_id),
          ts:         Date.now()
        }
      });
    } catch (e) {
      console.warn('[CQE Broadcast] 送出失敗：', e);
    }
  }

  window.CQE.broadcast = { ensureBroadcast, emitCheckin };
})();
