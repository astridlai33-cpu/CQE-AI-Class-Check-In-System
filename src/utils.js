/* =====================================================================
 * src/utils.js — CQE AI Class Check-In System
 * 通用工具函式：escapeHtml、getInitials、fmt、todayStr
 * IIFE 格式，掛載至 window.CQE.utils
 * ===================================================================== */
(function () {
  'use strict';
  window.CQE = window.CQE || {};

  /** HTML 特殊字元轉義（防 XSS） */
  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (s) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s];
    });
  }

  /**
   * 從姓名（及備用工號）產生最多兩字母的縮寫頭像。
   * 採 Desktop 版完整邏輯（含 alt fallback），保持跨頁面一致性。
   *  getInitials('Alice Wang')          → 'AW'
   *  getInitials('Alice')               → 'AL'
   *  getInitials('王小明', 'EMP001')    → 'EM'（無英文名時 fallback 工號）
   *  getInitials('王小明')              → '王小'
   */
  function getInitials(name, alt) {
    var base = String(name || '').trim();
    var words = base.match(/[A-Za-z]+/g) || [];
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    var altLetters = String(alt || '').replace(/[^A-Za-z]/g, '');
    if (altLetters) return altLetters.slice(0, 2).toUpperCase();
    var noSpace = base.replace(/\s+/g, '').slice(0, 2);
    return (noSpace || '??').toUpperCase();
  }

  /** 補零：單位數字補前置 0 */
  function fmt(d) { return d < 10 ? ('0' + d) : ('' + d); }

  /** 今天日期字串 YYYY-MM-DD */
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + fmt(d.getMonth() + 1) + '-' + fmt(d.getDate());
  }

  window.CQE.utils = { escapeHtml: escapeHtml, getInitials: getInitials, fmt: fmt, todayStr: todayStr };
})();
