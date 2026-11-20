const fs = require('fs');
const j = JSON.parse(fs.readFileSync('H:/amzain/amz-upload/products_pan.json', 'utf8'));
const skip = new Set(['LVP-032', 'LVP-040']);
const items = j.products.filter(p => !skip.has(p.sku)).map(p => ({ sku: p.sku, price: p.price }));
fs.writeFileSync('H:/amzain/amz-upload/pq-products-pan.json', JSON.stringify({ products: items }, null, 1), 'utf8');
console.log('items', items.length);
