const fs = require('fs');
const { execSync } = require('child_process');

// 3-SKU test: force quantity 99 on EXISTING offers by also disabling "always available"
const low = JSON.parse(fs.readFileSync('low_qty.json', 'utf8'));
const test = low.filter(r => ['LVP-142', 'LVP-153', 'LVP-180'].includes(r.sku)).map(r => r.sku);
const j = JSON.parse(fs.readFileSync('products_ar2.json', 'utf8'));
const products = j.products.filter(p => test.includes(p.sku)).map(p => Object.assign({}, p, { browseNode: j.browseNode }));

fs.writeFileSync('cfg_Q3.json', JSON.stringify({
  productType: 'HOME_ORGANIZERS_AND_STORAGE',
  browseNode: j.browseNode,
  quantity: 99,
  brand: 'Generic',
  setAvailability: 'مُعطّل',      // Disabled -> quantity becomes authoritative
  products
}, null, 1), 'utf8');

execSync('node build-feed.js ORG_AR.xlsm cfg_Q3.json Q3_test.xlsx', { stdio: 'ignore' });
console.log('test file for:', products.map(p => p.sku).join(', '));
