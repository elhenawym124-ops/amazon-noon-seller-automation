const XLSX = require('xlsx');
const wb = XLSX.readFile('H:/amzain mina/amz-upload/APRON_AR.xlsm', { bookVBA: false });
const vv = XLSX.utils.sheet_to_json(wb.Sheets['القيم الصحيحة'], { header: 1, blankrows: false, defval: '' });
for (const row of vv) {
  const label = String(row[1] || '').trim();
  if (/^(Size|Fabric Type|Style|Weave Type|Care Instructions|Special Size|Number of Items|Color|Model Name|Unit Count|Item Weight|Value|Lifestyle)/i.test(label)) {
    const vals = row.slice(2).filter(v => String(v).trim()).map(String);
    console.log('\n### ' + label + '  (' + vals.length + ')');
    console.log(vals.slice(0, 40).join(' | '));
  }
}
