/* =====================================================================
 * src/xlsx-export.js — CQE AI Class Check-In System
 * 上課名單 .xlsx 匯出（三張表：上課名單 / 課程統計 / 學員統計）
 * IIFE 格式，掛載至 window.CQE.xlsxExport
 *
 * 一律以 anon key 讀取（RLS 已開放 anon SELECT），不使用管理員 JWT，
 * 因此不受 token 過期影響。Desktop.html 後台圖表與 index.html 課程表
 * 圖表共用這一份。
 *
 * xlsx 為自組 OOXML + zip，無外部依賴，不走 CDN。
 *
 * exportAttendanceXlsx()
 *   → { attendance, courses, students }  已觸發下載，回傳三張表的筆數
 *   → null                               沒有任何出席資料，未產檔
 * ===================================================================== */
(function () {
  'use strict';
  window.CQE = window.CQE || {};

  const { rest } = window.CQE.api;

  /** Supabase 分頁全撈，避免 PostgREST 單次回傳上限把資料截斷 */
  async function fetchAllRows(path, pageSize=1000){
    const out = [];
    for (let offset=0; ; offset+=pageSize){
      const rows = await rest(`${path}&limit=${pageSize}&offset=${offset}`);
      if (!Array.isArray(rows) || !rows.length) break;
      out.push(...rows);
      if (rows.length < pageSize) break;
    }
    return out;
  }

  /** 最小 xlsx 產生器：自組 OOXML + zip，無外部依賴（不走 CDN） */
  async function buildXlsx(sheets){
    const enc = new TextEncoder();
    const esc = v => String(v ?? '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'');
    const colName = i => { let s=''; i++; while(i>0){ const m=(i-1)%26; s=String.fromCharCode(65+m)+s; i=(i-m-1)/26; } return s; };
    const cell = (v, r, ci, style) => {
      const ref = colName(ci) + r;
      if (typeof v === 'number') return `<c r="${ref}"${style?` s="${style}"`:''}><v>${v}</v></c>`;
      return `<c r="${ref}"${style?` s="${style}"`:''} t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`;
    };
    const sheetXml = (header, data, widths) => {
      const lines = [`<row r="1">${header.map((h,i)=> cell(h,1,i,1)).join('')}</row>`];
      data.forEach((rw, ri)=>{
        const r = ri + 2;
        lines.push(`<row r="${r}">${rw.map((v,i)=> cell(v,r,i)).join('')}</row>`);
      });
      const dim = `A1:${colName(header.length-1)}${data.length+1}`;
      return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="${dim}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/><cols>${widths.map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join('')}</cols><sheetData>${lines.join('')}</sheetData><autoFilter ref="${dim}"/></worksheet>`;
    };

    const parts = sheets.map(s => ({ name: s.name, xml: sheetXml(s.header, s.data, s.widths) }));

    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0070C0"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs></styleSheet>`;

    const files = [
      ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${parts.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`],
      ['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
      ['xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${parts.map((s,i)=>`<sheet name="${esc(s.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`],
      ['xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${parts.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="rId${parts.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
      ['xl/styles.xml', styles],
      ...parts.map((s,i)=> [`xl/worksheets/sheet${i+1}.xml`, s.xml]),
    ];

    // ── zip 打包：優先 deflate-raw，瀏覽器不支援時退回 stored（不壓縮，仍是合法 zip）──
    const crcTable = (()=>{
      const t = new Int32Array(256);
      for (let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c = (c & 1) ? (0xEDB88320 ^ (c>>>1)) : (c>>>1); t[n]=c; }
      return t;
    })();
    const crc32 = buf => { let c=-1; for(let i=0;i<buf.length;i++) c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c>>>8); return (c ^ -1) >>> 0; };
    const canDeflate = typeof CompressionStream === 'function';
    const deflateRaw = async u8 => {
      const stream = new Blob([u8]).stream().pipeThrough(new CompressionStream('deflate-raw'));
      return new Uint8Array(await new Response(stream).arrayBuffer());
    };

    const now = new Date();
    const dosTime = (now.getHours()<<11) | (now.getMinutes()<<5) | (now.getSeconds()>>1);
    const dosDate = ((now.getFullYear()-1980)<<9) | ((now.getMonth()+1)<<5) | now.getDate();

    const chunks = [], centrals = [];
    let offset = 0;
    for (const [name, content] of files){
      const nameBuf = enc.encode(name);
      const raw = enc.encode(content);
      const comp = canDeflate ? await deflateRaw(raw) : raw;
      const method = canDeflate ? 8 : 0;
      const crc = crc32(raw);

      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
      lh.setUint16(8, method, true); lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, comp.length, true); lh.setUint32(22, raw.length, true);
      lh.setUint16(26, nameBuf.length, true); lh.setUint16(28, 0, true);
      chunks.push(new Uint8Array(lh.buffer), nameBuf, comp);

      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
      ch.setUint16(8, 0x0800, true); ch.setUint16(10, method, true);
      ch.setUint16(12, dosTime, true); ch.setUint16(14, dosDate, true);
      ch.setUint32(16, crc, true); ch.setUint32(20, comp.length, true); ch.setUint32(24, raw.length, true);
      ch.setUint16(28, nameBuf.length, true); ch.setUint32(42, offset, true);
      centrals.push(new Uint8Array(ch.buffer), nameBuf);

      offset += 30 + nameBuf.length + comp.length;
    }
    const cdSize = centrals.reduce((n,b)=> n + b.length, 0);
    const eocd = new DataView(new ArrayBuffer(22));
    eocd.setUint32(0, 0x06054b50, true);
    eocd.setUint16(8, files.length, true); eocd.setUint16(10, files.length, true);
    eocd.setUint32(12, cdSize, true); eocd.setUint32(16, offset, true);

    return new Blob([...chunks, ...centrals, new Uint8Array(eocd.buffer)],
      { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  /** 撈資料 → 組三張表 → 觸發下載。UI 狀態（按鈕/提示）由呼叫端自理。 */
  async function exportAttendanceXlsx(){
    const [courses, attendance, students] = await Promise.all([
      fetchAllRows('/rest/v1/courses?select=id,title,date,dept,start_time,end_time,room&order=date.asc'),
      fetchAllRows('/rest/v1/attendance?select=course_id,student_id,checked_in_at&order=checked_in_at.asc'),
      fetchAllRows('/rest/v1/students?select=id,team,function,name,employee_no&order=team.asc'),
    ]);
    if (!attendance.length) return null;

    const courseMap = new Map(courses.map(c=> [c.id, c]));
    const stuMap    = new Map(students.map(s=> [s.id, s]));
    const hhmm = t => t ? String(t).slice(0,5) : '';
    const tpe = iso => {                       // UTC → 台北時間顯示字串
      if (!iso) return '';
      const s = new Date(new Date(iso).getTime() + 8*3600*1000).toISOString();
      return s.slice(0,10) + ' ' + s.slice(11,16);
    };

    // 表一：一列一筆報到
    const rows = attendance.map(a=>{
      const c = courseMap.get(a.course_id) || {};
      const s = stuMap.get(a.student_id) || {};
      return [
        c.date || '', c.title || '(課程已刪除)', c.dept || '',
        c.start_time ? `${hhmm(c.start_time)}-${hhmm(c.end_time)}` : '', c.room || '',
        s.team || '', s.function || '', s.name || '(學員已刪除)', s.employee_no || '',
        tpe(a.checked_in_at),
      ];
    }).sort((a,b)=>
      a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]) ||
      a[5].localeCompare(b[5]) || a[7].localeCompare(b[7]));

    // 表二：每堂課報到人數
    const perCourse = new Map();
    for (const a of attendance) perCourse.set(a.course_id, (perCourse.get(a.course_id)||0) + 1);
    const byCourse = courses.map(c=> [
      c.date || '', c.title || '', c.dept || '',
      c.start_time ? `${hhmm(c.start_time)}-${hhmm(c.end_time)}` : '', c.room || '',
      perCourse.get(c.id) || 0,
    ]).sort((a,b)=> String(a[0]).localeCompare(String(b[0])) || String(a[1]).localeCompare(String(b[1])));

    // 表三：每位學員上課堂數
    const perStudent = new Map();
    for (const a of attendance) perStudent.set(a.student_id, (perStudent.get(a.student_id)||0) + 1);
    const byStudent = [...perStudent.entries()].map(([sid, n])=>{
      const s = stuMap.get(sid) || {};
      return [s.team || '', s.function || '', s.name || '(學員已刪除)', s.employee_no || '', n];
    }).sort((a,b)=> b[4]-a[4] || String(a[0]).localeCompare(String(b[0])) || String(a[2]).localeCompare(String(b[2])));

    const blob = await buildXlsx([
      { name:'上課名單',
        header:['日期','課程名稱','部門','時間','教室','Team','Function','姓名','工號','報到時間'],
        data: rows, widths:[12,32,8,14,14,10,12,20,12,18] },
      { name:'課程統計',
        header:['日期','課程名稱','部門','時間','教室','報到人數'],
        data: byCourse, widths:[12,32,8,14,14,11] },
      { name:'學員統計',
        header:['Team','Function','姓名','工號','上課堂數'],
        data: byStudent, widths:[10,12,20,12,11] },
    ]);

    const pad = n => String(n).padStart(2,'0');
    const d = new Date();
    const ts = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `CQE上課名單_${ts}_(Security C).xlsx`;
    a.click();
    setTimeout(()=> URL.revokeObjectURL(a.href), 1000);

    return { attendance: rows.length, courses: byCourse.length, students: byStudent.length };
  }

  window.CQE.xlsxExport = { exportAttendanceXlsx };
})();
