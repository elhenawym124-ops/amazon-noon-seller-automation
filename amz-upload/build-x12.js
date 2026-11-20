const fs = require('fs');
const { execSync } = require('child_process');
const j = JSON.parse(fs.readFileSync('products_ar2.json', 'utf8'));

const p166 = JSON.parse(JSON.stringify(j.products.find(p => p.sku === 'LVP-166')));
p166.browseNode = '21863900031';           // Home & Kitchen > Storage & Organization > Racks, Shelves & Drawers
p166.unitCountType = 'متر مربع';
p166.unitCount = 2.25;                      // 5 m x 45 cm roll
p166.material = 'سيليكون';

fs.writeFileSync('cfg_X12.json', JSON.stringify({
  productType: 'FURNITURE_LINER',
  browseNode: '21863900031',
  quantity: 99,
  brand: 'Generic',
  unitCountType: 'متر مربع',
  products: [p166]
}, null, 1), 'utf8');

execSync('node build-feed.js FURNITURE_LINER_AR.xlsm cfg_X12.json X12_FL.xlsx', { stdio: 'ignore' });
console.log('X12 built for', p166.sku);
