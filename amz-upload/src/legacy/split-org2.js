const fs = require('fs');
const j = JSON.parse(fs.readFileSync('H:/amzain/amz-upload/products_org_ar.json', 'utf8'));
const done = new Set(['LVP-065', 'LVP-082', 'LVP-083', 'LVP-084']);
const rest = j.products.filter(p => !done.has(p.sku));
fs.writeFileSync('H:/amzain/amz-upload/products_org_ar2.json', JSON.stringify({ ...j, products: rest }, null, 1), 'utf8');
console.log('rest', rest.length, rest.map(p => p.sku).join(','));
