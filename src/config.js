/* =====================================================================
 * src/config.js — CQE AI Class Check-In System
 * 全域唯一來源：Supabase 金鑰 + 色盤
 * IIFE 格式，無需 build tool，掛載至 window.CQE.config
 * ===================================================================== */
(function () {
  'use strict';
  window.CQE = window.CQE || {};

  window.CQE.config = {
    SUPABASE_URL:      'https://kxyguqnoudtnxkexbsnc.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eWd1cW5vdWR0bnhrZXhic25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzQxODUsImV4cCI6MjA3MTUxMDE4NX0.Tpv6J1KM10lyrLORWdXjN45YGedcCrjdjjdYV61qp38',

    // 課程卡片 / index.html 排程平台用（原 window.__CQE_PAL，10 色）
    PAL: [
      '#0070C0', '#4a3fc4', '#44c08a', '#e07b20', '#d44a90',
      '#ffb020', '#7a5fc0', '#00a0b8', '#3aae60', '#ff645d'
    ],

    // Chart.js 堆疊長條圖專用（原 Desktop.html 內 palette，10 色）
    CHART_PALETTE: [
      '#418ab3', '#a6b727', '#f69200', '#fec000', '#ff9999',
      '#df5327', '#704c9e', '#339933', '#0066ff', '#a36b2b'
    ]
  };
})();
