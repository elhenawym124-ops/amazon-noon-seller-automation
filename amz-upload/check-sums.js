const XLSX = require('xlsx');
const fs = require('fs');
const dir = 'H:/amzain mina/amz-upload/summaries';
const files = fs.readdirSync(dir).filter(f => /^sum_5005|^sum_5006/.test(f));
const agg = {};
for (const f of files) {
  const wb = XLSX.readFile(dir + '/' + f);
  const nm = wb.SheetNames.find(s => /ملخص|Summary/i.test(s));
  if (!nm) { console.log(f, 'no summary sheet'); continue; }
  const d = XLSX.utils.sheet_to_json(wb.Sheets[nm], { header: 1, defval: '' });
  const rows = d.filter(r => String(r[1]).match(/^\d{4,6}$/) && String(r[6]).match(/^LVP-/));
  rows.forEach(r => {
    const sku = String(r[6]).trim(), code = String(r[1]);
    agg[sku] = agg[sku] || new Set();
    if (!['18367'].includes(code)) agg[sku].add(code);
  });
}
const bad = Object.entries(agg).filter(([s, c]) => c.size);
console.log('SKUs with non-warning issues:', bad.length);
const groups = {};
bad.forEach(([s, c]) => { const k = [...c].sort().join('+'); (groups[k] = groups[k] || []).push(s); });
for (const [k, v] of Object.entries(groups)) console.log(k, '=>', v.length, v.join(','));
