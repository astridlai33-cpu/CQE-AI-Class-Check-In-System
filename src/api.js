/* =====================================================================
 * src/api.js — CQE AI Class Check-In System
 * 統一 Supabase REST 呼叫層（合併 Desktop + Mobile 兩版）
 * IIFE 格式，掛載至 window.CQE.api
 *
 * rest(path, opts)
 *   opts.auth = false（預設）→ 使用 anon key（Mobile 行為）
 *   opts.auth = true         → 使用 localStorage JWT（Desktop admin 行為）
 *                              JWT 過期時自動清除 + 呼叫 signOut / refreshAuthUI
 *
 * restWithCount(path, opts)   → { rows, total }（含 Content-Range 解析）
 * ===================================================================== */
(function () {
  'use strict';
  window.CQE = window.CQE || {};

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.CQE.config;

  /** JWT 過期共用處理：清除 localStorage → 通知 Desktop.html 更新 state + UI */
  function _handleAuthExpiry() {
    localStorage.removeItem('sb_access_token');
    localStorage.removeItem('sb_user_email');
    // signOut / refreshAuthUI 是 Desktop.html 的全域函式；Mobile 不定義，try-catch 安全降級
    try { if (typeof signOut === 'function') signOut(); } catch (_) {}
    try { if (typeof refreshAuthUI === 'function') refreshAuthUI(); } catch (_) {}
  }

  /**
   * 通用 Supabase REST 呼叫。
   * @param {string} path   - API 路徑，如 '/rest/v1/students?...'
   * @param {object} opts
   * @param {string}  opts.method   - HTTP 方法（預設 'GET'）
   * @param {string}  opts.body     - 序列化後的請求 body（預設 null）
   * @param {boolean} opts.auth     - true 時使用 JWT；false（預設）使用 anon key
   * @param {object}  opts.headers  - 額外 headers（會覆蓋預設值）
   */
  async function rest(path, { method='GET', body=null, auth=false, headers={} }={}) {
    const h = {
      'apikey':        SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Accept':        'application/json',
      ...headers
    };
    // auth=true 時：用 JWT 覆蓋 anon Authorization
    if (auth) {
      const token = localStorage.getItem('sb_access_token');
      if (token) h['Authorization'] = 'Bearer ' + token;
    }
    if (body && !h['Content-Type']) h['Content-Type'] = 'application/json';

    const res = await fetch(SUPABASE_URL + path, { method, headers: h, body });
    const txt = await res.text();
    let data = null;
    try { data = txt ? JSON.parse(txt) : null; } catch { data = txt; }

    if (!res.ok) {
      const msg = data?.error_description || data?.message || data?.msg
                  || `${res.status} ${res.statusText}`;
      if ((res.status === 401 || res.status === 403) && /jwt|token|expir|invalid/i.test(msg)) {
        _handleAuthExpiry();
      }
      const err  = new Error(msg);
      err.status  = res.status;
      err.code    = data?.code;
      err.details = data?.details;
      throw err;
    }
    return data;
  }

  /**
   * 帶總筆數的 REST 查詢（Prefer: count=exact + Content-Range 解析）。
   * 回傳 { rows: [], total: number }。
   * 主要供 Desktop.html 後台分頁使用。
   */
  async function restWithCount(path, { method='GET', body=null, auth=false, headers={}, limit=null, offset=null }={}) {
    const h = {
      'apikey':        SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Accept':        'application/json',
      'Prefer':        'count=exact',
      ...headers
    };
    if (auth) {
      const token = localStorage.getItem('sb_access_token');
      if (token) h['Authorization'] = 'Bearer ' + token;
    }
    if (body && !h['Content-Type']) h['Content-Type'] = 'application/json';

    const url = new URL(SUPABASE_URL + path);
    if (typeof limit  === 'number') url.searchParams.set('limit',  String(limit));
    if (typeof offset === 'number') url.searchParams.set('offset', String(offset));

    const res = await fetch(url.toString(), { method, headers: h, body });
    const txt = await res.text();
    let data = null;
    try { data = txt ? JSON.parse(txt) : null; } catch { data = txt; }

    if (!res.ok) {
      const msg = data?.error_description || data?.message || data?.msg
                  || `${res.status} ${res.statusText}`;
      if ((res.status === 401 || res.status === 403) && /jwt|token|expir|invalid/i.test(msg)) {
        _handleAuthExpiry();
      }
      const err  = new Error(msg);
      err.status  = res.status;
      err.code    = data?.code;
      err.details = data?.details;
      throw err;
    }

    // Content-Range: "0-9/123" → total = 123
    const range = res.headers.get('Content-Range') || '';
    const m     = range.match(/\/(\d+)$/);
    const total = m ? Number(m[1]) : (Array.isArray(data) ? data.length : 0);
    return { rows: Array.isArray(data) ? data : [], total };
  }

  window.CQE.api = { rest, restWithCount };
})();
