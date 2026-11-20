const fs = require('fs');
const dir = 'H:/amzain mina/amz-upload';

const files = ['products.json', 'products3.json', 'products_tray.json', 'products_pan.json', 'products_org_ar.json', 'products_org_en.json', 'products_storage_ar.json', 'products_storage_en.json', 'products_ar2.json'];
const seen = new Set();
const rows = [];
for (const f of files) {
  const p = dir + '/' + f;
  if (!fs.existsSync(p)) continue;
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const x of j.products || []) {
    if (seen.has(x.sku)) continue;
    seen.add(x.sku);
    rows.push({ sku: x.sku, refAsin: x.refAsin, title: x.title, price: x.price });
  }
}
// new ASIN map collected from Seller Central (partial)
let map = {};
const mp = dir + '/data/inventory_map.json';
if (fs.existsSync(mp)) {
  try {
    let arr = JSON.parse(fs.readFileSync(mp, 'utf8'));
    if (typeof arr === 'string') arr = JSON.parse(arr);
    for (const x of arr) map[x.sku] = x.asin;
  } catch (e) { console.log('map parse failed', e.message); }
}
const extra = {
  'LVP-001': 'B0HR245LC5', 'LVP-005': 'B0HR1RMYHY', 'LVP-006': 'B0HR2N2WD1', 'LVP-007': 'B0HR2ZYB61',
  'LVP-008': 'B0HR3NBBL4', 'LVP-009': 'B0HR3C3PXL', 'LVP-010': 'B0HR2K6V7C', 'LVP-011': 'B0HR311G7P',
  'LVP-012': 'B0HR35QLP9', 'LVP-013': 'B0HR3GX8YQ', 'LVP-014': 'B0HR3J5X4G', 'LVP-015': 'B0HR2TDD1N',
  'LVP-016': 'B0HR39NQF6', 'LVP-017': 'B0HR39KLQ3', 'LVP-018': 'B0HR32TBXV', 'LVP-019': 'B0HR2YBYJM',
  'LVP-020': 'B0HR342KV3', 'LVP-021': 'B0HR3C4SBN', 'LVP-022': 'B0HR3DTWJR', 'LVP-023': 'B0HR35X7M6',
  'LVP-024': 'B0HR3J9B96', 'LVP-025': 'B0HR3D5D18', 'LVP-026': 'B0HR38F1V3', 'LVP-027': 'B0HR2T3BJQ',
  'LVP-028': 'B0HR3576F8', 'LVP-029': 'B0HR35PZ9G'
};
Object.assign(map, extra);

rows.sort((a, b) => a.sku.localeCompare(b.sku));
const csv = ['SKU,Source ASIN,New ASIN,Price EGP,Title']
  .concat(rows.map(r => [r.sku, r.refAsin || '', map[r.sku] || '', r.price, '"' + String(r.title || '').replace(/"/g, '""') + '"'].join(',')))
  .join('\r\n');
fs.writeFileSync(dir + '/MY_PRODUCTS.csv', '\ufeff' + csv, 'utf8');

console.log('total skus:', rows.length, '| with new asin:', rows.filter(r => map[r.sku]).length);
console.log('first 5:', rows.slice(0, 5).map(r => r.sku).join(','));
