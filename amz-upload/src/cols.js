const XLSX = require('xlsx');
const path = require('path');
const { dirs } = require('./lib/paths');
const wb = XLSX.readFile(path.join(dirs.templates, 'APRON.xlsm'), { bookVBA: false });

const tpl = XLSX.utils.sheet_to_json(wb.Sheets['Template'], { header: 1, blankrows: false, defval: '' });
const group = tpl[2] || [];
const label = tpl[3] || [];
const attr = tpl[4] || [];
const example = tpl[5] || [];

// required map from Data Definitions
const defs = XLSX.utils.sheet_to_json(wb.Sheets['Data Definitions'], { header: 1, blankrows: false, defval: '' });
const reqMap = {};
const accMap = {};
for (const r of defs) {
  const a = String(r[1] || '').trim();
  if (a) { reqMap[a] = String(r[5] || '').trim(); accMap[a] = String(r[3] || '').trim(); }
}

const out = [];
for (let i = 0; i < attr.length; i++) {
  if (!String(attr[i] || '').trim()) continue;
  out.push({
    idx: i,
    col: XLSX.utils.encode_col(i),
    group: String(group[i] || ''),
    label: String(label[i] || ''),
    attr: String(attr[i] || ''),
    req: reqMap[String(attr[i]).trim()] || '',
    example: String(example[i] || '').slice(0, 40),
    accepted: accMap[String(attr[i]).trim()] ? accMap[String(attr[i]).trim()].slice(0, 120) : ''
  });
}
console.log('TOTAL COLUMNS WITH ATTRIBUTE:', out.length);
const reqd = out.filter(o => /^Required/i.test(o.req));
console.log('REQUIRED COUNT:', reqd.length);
console.log('\n--- REQUIRED ---');
for (const o of reqd) console.log(`${o.col}\t${o.group}\t${o.label}\t${o.attr}\t${o.accepted}`);
console.log('\n--- ALL (compact) ---');
for (const o of out) console.log(`${o.col}\t${o.group}\t${o.label}\t${o.attr}\t${o.req}`);
