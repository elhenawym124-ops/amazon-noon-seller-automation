const fs = require('fs');
const map = JSON.parse(fs.readFileSync('remaining-map.json', 'utf8'));
const csvPath = 'MY_PRODUCTS.csv';
let csv = fs.readFileSync(csvPath, 'utf8');
const existing = new Set(csv.split(/\r?\n/).map(l => l.split(',')[0]));
const esc = s => '"' + String(s).replace(/"/g, '""') + '"';
const lines = [];
for (const r of map) {
  if (existing.has(r.sku)) continue;
  lines.push([r.sku, r.asin, '', r.price, esc(r.title)].join(','));
}
if (lines.length) {
  csv = csv.replace(/\s*$/, '\n') + lines.join('\n') + '\n';
  fs.writeFileSync(csvPath, csv, 'utf8');
}
console.log('appended', lines.length, 'rows');
