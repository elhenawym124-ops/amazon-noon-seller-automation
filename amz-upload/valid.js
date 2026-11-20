const XLSX = require('xlsx');
const wb = XLSX.readFile('H:/amzain mina/amz-upload/APRON.xlsm', { bookVBA: false });
const vv = XLSX.utils.sheet_to_json(wb.Sheets['Valid Values'], { header: 1, blankrows: false, defval: '' });
const want = /product id type|item condition|fulfillment channel|country of origin|dangerous goods|parentage level|listing action|item weight unit|inventory always|color map|unit count type|target gender|age range|fabric type|strap type|special size|item weight/i;
for (const row of vv) {
  const label = String(row[1] || '').trim();
  if (label && want.test(label)) {
    const vals = row.slice(2).filter(v => String(v).trim()).map(String);
    console.log('\n### ' + label);
    console.log(vals.slice(0, 30).join(' | '));
  }
}
