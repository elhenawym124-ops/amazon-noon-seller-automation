const fs = require('fs');
const { execSync } = require('child_process');
const j = JSON.parse(fs.readFileSync('products_ar2.json', 'utf8'));
const want = ['LVP-165', 'LVP-166', 'LVP-179'];
const products = j.products.filter(p => want.includes(p.sku)).map(p => Object.assign({}, p, { browseNode: j.browseNode }));
fs.writeFileSync('cfg_X3.json', JSON.stringify({
  productType: 'HOME_ORGANIZERS_AND_STORAGE',
  browseNode: j.browseNode,
  quantity: 99,
  brand: 'Generic',
  products
}, null, 1), 'utf8');
execSync('node build-feed.js ORG_AR.xlsm cfg_X3.json X3_ORG.xlsx', { stdio: 'ignore' });
console.log('built X3 with', products.length, 'products:', products.map(p => p.sku).join(','));
