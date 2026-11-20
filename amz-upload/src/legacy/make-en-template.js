const XLSX = require('xlsx');
const fs = require('fs');

const SRC = process.argv[2];
const OUT = process.argv[3];
const SHEET = process.argv[4] || 'النموذج';

const wb = XLSX.readFile(SRC, { bookVBA: false });
const ws = wb.Sheets[SHEET];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: true, defval: '' });

let changed = 0;
for (let r = 0; r < rows.length; r++) {
  for (let c = 0; c < rows[r].length; c++) {
    const v = rows[r][c];
    if (typeof v === 'string' && v.includes('ar_AE')) {
      rows[r][c] = v.split('ar_AE').join('en_AE');
      changed++;
    }
  }
}
const wsNew = XLSX.utils.aoa_to_sheet(rows);
wsNew['!cols'] = (ws['!cols'] || []).slice(0, (rows[4] || []).length);
wb.Sheets[SHEET] = wsNew;
const out = XLSX.utils.book_new();
for (const n of wb.SheetNames) XLSX.utils.book_append_sheet(out, wb.Sheets[n], n);
XLSX.writeFile(out, OUT, { bookType: 'xlsx' });
console.log('changed cells:', changed, '->', OUT);
