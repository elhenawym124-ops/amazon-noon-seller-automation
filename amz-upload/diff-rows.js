const XLSX = require('xlsx');
const wb = XLSX.readFile('X9_KT.xlsx');
const d = XLSX.utils.sheet_to_json(wb.Sheets['النموذج'], { header: 1, defval: '' });
const h = d[4];
const rowA = d.find(r => r[0] === 'LVP-553');
const wb2 = XLSX.readFile('R1_KT.xlsx');
const d2 = XLSX.utils.sheet_to_json(wb2.Sheets['النموذج'], { header: 1, defval: '' });
const h2 = d2[4];
const rowB = d2.find(r => r[0] === 'LVP-372');
console.log('cols', h.length, h2.length);
const max = Math.max(h.length, h2.length);
for (let i = 0; i < max; i++) {
  const a = String(h[i] || ''), b = String(h2[i] || '');
  const va = rowA ? rowA[i] : '', vb = rowB ? rowB[i] : '';
  const fa = (va === '' || va === undefined || va === null) ? 0 : 1;
  const fb = (vb === '' || vb === undefined || vb === null) ? 0 : 1;
  if (fa !== fb) console.log('DIFF col', i, '|', a.slice(0, 55), '| A=', JSON.stringify(String(va).slice(0, 40)), '| B=', JSON.stringify(String(vb).slice(0, 40)));
}
