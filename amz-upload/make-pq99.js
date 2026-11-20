const fs = require('fs');
const low = JSON.parse(fs.readFileSync('low_qty.json', 'utf8'));
const cfg = { qty: 99, always: 'Disabled', products: low.map(r => ({ sku: r.sku, price: parseFloat(r.price) })) };
fs.writeFileSync('cfg_PQ99.json', JSON.stringify(cfg, null, 1), 'utf8');
console.log('cfg for', cfg.products.length, 'SKUs');
