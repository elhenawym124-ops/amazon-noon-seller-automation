const XLSX = require('xlsx');
const wb = XLSX.readFile('H:/amzain mina/amz-upload/APRON.xlsm', { bookVBA: false });
console.log('SHEETS:', wb.SheetNames.join(' | '));
for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name];
  const ref = ws['!ref'] || '';
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: '' });
  console.log('\n=== ' + name + ' === ref=' + ref + ' rows=' + rows.length);
  const limit = name.toLowerCase() === 'template' ? 6 : 8;
  for (let i = 0; i < Math.min(limit, rows.length); i++) {
    const r = rows[i].slice(0, 30).map(c => String(c).slice(0, 60));
    console.log('  r' + (i + 1) + ': ' + JSON.stringify(r));
  }
}
