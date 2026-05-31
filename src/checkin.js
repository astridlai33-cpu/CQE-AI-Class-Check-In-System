/* =====================================================================
 * src/checkin.js — CQE AI Class Check-In System
 * 統一報到邏輯（合併 Desktop + Mobile 兩版）
 * IIFE 格式，掛載至 window.CQE.checkin
 *
 * doCheckin(course_id, student, opts)
 *   @param {string|number}  course_id          - 課程 ID
 *   @param {{ id: number }}  student            - 學員物件（需有 .id）
 *   @param {{ allowCheckin?: boolean }} [opts]  - allowCheckin 預設 true
 *   @returns {{ ok: true, duplicated: boolean }}
 *
 *   - 使用 Prefer: resolution=ignore-duplicates（不拋重複錯誤）
 *   - 回傳陣列為空 → duplicated = true（Supabase 重複略過行為）
 *   - 內部呼叫 window.CQE.broadcast.emitCheckin（無需呼叫端再重複呼叫）
 *   - DOM 更新由呼叫端負責（函式本身不碰 DOM）
 * ===================================================================== */
(function () {
  'use strict';
  window.CQE = window.CQE || {};

  /**
   * 執行報到：寫入 attendance 資料表 + 廣播。
   * @param {string|number}  course_id
   * @param {{ id: number }}  student
   * @param {{ allowCheckin?: boolean }} [opts]
   * @returns {Promise<{ ok: true, duplicated: boolean }>}
   */
  async function doCheckin(course_id, student, { allowCheckin = true } = {}) {
    if (!allowCheckin) throw new Error('非今日課程不允許報到');
    if (!student || !student.id) throw new Error('找不到學員資料（student.id 為空）');

    const data = await window.CQE.api.rest('/rest/v1/attendance?on_conflict=course_id,student_id,checked_in_day_local', {
      method:  'POST',
      headers: { 'Prefer': 'resolution=ignore-duplicates,return=representation' },
      body:    JSON.stringify({
        course_id,
        student_id: student.id,
        user_agent: navigator.userAgent
      })
    });

    // Supabase 在重複略過時回傳空陣列 []（而非拋錯）
    const duplicated = !Array.isArray(data) || data.length === 0;

    // 廣播給其他裝置（emitCheckin 自行等待 SUBSCRIBED，不阻塞回傳）
    window.CQE.broadcast.emitCheckin(course_id, student.id);

    return { ok: true, duplicated };
  }

  window.CQE.checkin = { doCheckin };
})();
