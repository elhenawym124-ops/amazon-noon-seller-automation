const fs = require('fs');
const { execSync } = require('child_process');
const j = JSON.parse(fs.readFileSync('products_ar2.json', 'utf8'));

// --- X8: LVP-166 drawer liner roll -> unit count "أمتار" (5 meters)
const p166 = JSON.parse(JSON.stringify(j.products.find(p => p.sku === 'LVP-166')));
p166.browseNode = j.browseNode;
p166.unitCountType = 'أمتار';
p166.unitCount = 5;
fs.writeFileSync('cfg_X8.json', JSON.stringify({
  productType: 'HOME_ORGANIZERS_AND_STORAGE',
  browseNode: j.browseNode,
  quantity: 99,
  brand: 'Generic',
  unitCountType: 'أمتار',
  products: [p166]
}, null, 1), 'utf8');
execSync('node build-feed.js ORG_AR.xlsm cfg_X8.json X8_ORG.xlsx', { stdio: 'ignore' });

// --- X9: LVP-165 injector under a NEW sku (old sku looks stuck) as KITCHEN_TOOLS
const p165 = JSON.parse(JSON.stringify(j.products.find(p => p.sku === 'LVP-165')));
p165.sku = 'LVP-553';
p165.modelName = 'LVP-553';
p165.title = 'أداة حقن التتبيلة للفراخ واللحوم – إبرة توابل معدنية لإدخال النكهة داخل الدواجن واللحوم بسهولة';
p165.browseNode = '21864567031';
fs.writeFileSync('cfg_X9.json', JSON.stringify({
  productType: 'KITCHEN_TOOLS',
  browseNode: '21864567031',
  quantity: 99,
  brand: 'Generic',
  inferMaterial: true,
  products: [p165]
}, null, 1), 'utf8');
execSync('node build-feed.js KT_AR2.xlsm cfg_X9.json X9_KT.xlsx', { stdio: 'ignore' });

console.log('X8: 166 أمتار=5 |', p166.title.slice(0, 40));
console.log('X9: LVP-553 (was 165) |', p165.title.slice(0, 40));
