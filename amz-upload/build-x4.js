const fs = require('fs');
const { execSync } = require('child_process');
const cfg = JSON.parse(fs.readFileSync('cfg_H3.json', 'utf8'));
const p = cfg.products.find(x => x.sku === 'LVP-503');
if (!p) throw new Error('LVP-503 not in cfg_H3');
const products = [p];
fs.writeFileSync('cfg_X4.json', JSON.stringify({
  productType: 'HOME_ORGANIZERS_AND_STORAGE',
  browseNode: cfg.browseNode,
  quantity: 99,
  brand: 'Generic',
  products
}, null, 1), 'utf8');
execSync('node build-feed.js ORG_AR.xlsm cfg_X4.json X4_ORG.xlsx', { stdio: 'ignore' });
console.log('built X4 for', p.sku, '| imgs:', p.images.length, '|', p.title.slice(0, 70));
