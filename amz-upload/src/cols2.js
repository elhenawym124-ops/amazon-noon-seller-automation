const XLSX = require('xlsx');
const file = process.argv[2] || 'APRON_AR.xlsm';
const wbPath = require('path').isAbsolute(file) ? file : require('path').join(require('./lib/paths').dirs.templates, file);
const sheet = process.argv[3] || 'النموذج';
const wb = XLSX.readFile(wbPath, { bookVBA: false });
const tpl = XLSX.utils.sheet_to_json(wb.Sheets[sheet], { header: 1, blankrows: false, defval: '' });
console.log('rows:', tpl.length);
tpl.forEach((r, i) => console.log('ROW' + (i + 1) + ' len=' + r.length + ' first3=' + JSON.stringify(r.slice(0, 3))));

const attr = tpl[4] || [];
const label = tpl[3] || [];
const defs = XLSX.utils.sheet_to_json(wb.Sheets['تعريفات البيانات'], { header: 1, blankrows: false, defval: '' });
const reqMap = {};
for (const r of defs) { const a = String(r[1] || '').trim(); if (a) reqMap[a] = String(r[5] || '').trim(); }

const rows = [];
for (let i = 0; i < attr.length; i++) {
  const a = String(attr[i] || '').trim();
  if (!a) continue;
  rows.push({ col: XLSX.utils.encode_col(i), i, label: String(label[i] || ''), attr: a, req: reqMap[a] || '' });
}
console.log('\nATTR COLS:', rows.length);
console.log('--- REQUIRED ---');
rows.filter(r => /مطلوب|Required/i.test(r.req)).forEach(r => console.log(r.col + '\t' + r.attr + '\t' + r.req));
console.log('--- ALL ATTR NAMES ---');
console.log(rows.map(r => r.col + '=' + r.attr).join('\n'));
