const fs = require('fs');
const { execSync } = require('child_process');
const j = JSON.parse(fs.readFileSync('products_ar2.json', 'utf8'));
const p165 = JSON.parse(JSON.stringify(j.products.find(p => p.sku === 'LVP-165')));
p165.title = 'أداة مطبخ معدنية لإضافة النكهات إلى اللحوم والدواجن أثناء التحضير';
p165.browseNode = '21864567031';
fs.writeFileSync('cfg_X7.json', JSON.stringify({
  productType: 'KITCHEN_TOOLS',
  browseNode: '21864567031',
  quantity: 99,
  brand: 'Generic',
  inferMaterial: true,
  products: [p165]
}, null, 1), 'utf8');
execSync('node build-feed.js KT_AR2.xlsm cfg_X7.json X7_KT.xlsx', { stdio: 'ignore' });
console.log('X7 title:', p165.title);
