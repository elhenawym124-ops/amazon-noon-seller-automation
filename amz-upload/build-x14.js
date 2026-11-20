const fs = require('fs');
const { execSync } = require('child_process');
const j = JSON.parse(fs.readFileSync('products_ar2.json', 'utf8'));

const p = JSON.parse(JSON.stringify(j.products.find(x => x.sku === 'LVP-166')));
p.browseNode = '21863900031';
p.unitCountType = 'متر مربع';
p.unitCount = 2.25;
p.material = 'سيليكون';
p.dimLength = 500;          // roll length 5 m
p.dimWidth = 45;            // 45 cm
p.dimUnit = 'سنتيمترات';

fs.writeFileSync('cfg_X14.json', JSON.stringify({
  productType: 'FURNITURE_LINER',
  browseNode: '21863900031',
  quantity: 99,
  brand: 'Generic',
  unitCountType: 'متر مربع',
  products: [p]
}, null, 1), 'utf8');

execSync('node build-feed.js FURNITURE_LINER_AR.xlsm cfg_X14.json X14_FL.xlsx', { stdio: 'ignore' });
console.log('X14 built');
