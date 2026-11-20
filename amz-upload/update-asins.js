const fs = require('fs');
const updates = { 'LVP-165': 'B0HR7X4Y9H', 'LVP-166': 'B0HR8MMDHF', 'LVP-503': 'B0HR79D7VK' };
const lines = fs.readFileSync('MY_PRODUCTS.csv', 'utf8').split(/\r?\n/);
let changed = 0;
const out = lines.map(l => {
  if (!l) return l;
  const cols = l.split(',');
  const sku = cols[0];
  if (updates[sku]) {
    if (cols[2] !== updates[sku]) { cols[2] = updates[sku]; changed++; }
    return cols.join(',');
  }
  return l;
});
fs.writeFileSync('MY_PRODUCTS.csv', out.join('\n'), 'utf8');
console.log('rows updated:', changed);
console.log(out.filter(l => Object.keys(updates).some(s => l.startsWith(s + ','))).join('\n').slice(0, 600));
