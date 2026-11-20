const fs = require('fs');
const { execSync } = require('child_process');
const j = JSON.parse(fs.readFileSync('products_ar2.json', 'utf8'));

// --- X5: LVP-165 (meat injector) as KITCHEN_TOOLS -> no unit_count needed, clean title
const p165 = JSON.parse(JSON.stringify(j.products.find(p => p.sku === 'LVP-165')));
p165.title = 'أداة حقن التتبيلة للفراخ واللحوم – إبرة توابل معدنية لإدخال النكهة داخل الدواجن واللحوم بسهولة';
p165.browseNode = '21864567031';
fs.writeFileSync('cfg_X5.json', JSON.stringify({
  productType: 'KITCHEN_TOOLS',
  browseNode: '21864567031',
  quantity: 99,
  brand: 'Generic',
  inferMaterial: true,
  products: [p165]
}, null, 1), 'utf8');
execSync('node build-feed.js KT_AR2.xlsm cfg_X5.json X5_KT.xlsx', { stdio: 'ignore' });

// --- X6: LVP-166 (drawer liner roll) -> unit count "رزمة"
const p166 = JSON.parse(JSON.stringify(j.products.find(p => p.sku === 'LVP-166')));
p166.browseNode = j.browseNode;
fs.writeFileSync('cfg_X6.json', JSON.stringify({
  productType: 'HOME_ORGANIZERS_AND_STORAGE',
  browseNode: j.browseNode,
  quantity: 99,
  brand: 'Generic',
  unitCountType: 'رزمة',
  products: [p166]
}, null, 1), 'utf8');
execSync('node build-feed.js ORG_AR.xlsm cfg_X6.json X6_ORG.xlsx', { stdio: 'ignore' });

console.log('X5 ok:', p165.title.slice(0, 40));
console.log('X6 ok:', p166.title.slice(0, 40));
