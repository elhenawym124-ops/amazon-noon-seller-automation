const fs = require('fs');
const { execSync } = require('child_process');
const j = JSON.parse(fs.readFileSync('products_ar2.json', 'utf8'));

const p = JSON.parse(JSON.stringify(j.products.find(x => x.sku === 'LVP-165')));
p.title = 'حقنة توابل للمطبخ';
p.description = 'حقنة توابل عملية لإضافة النكهات إلى اللحوم والدواجن أثناء التحضير.';
p.bullets = ['تصميم عملي سهل الاستخدام.', 'مناسبة للمطبخ المنزلي.'];
p.images = p.images.slice(0, 1);
p.browseNode = '21864567031';

fs.writeFileSync('cfg_X13.json', JSON.stringify({
  productType: 'KITCHEN_TOOLS',
  browseNode: '21864567031',
  quantity: 99,
  brand: 'Generic',
  inferMaterial: true,
  products: [p]
}, null, 1), 'utf8');
execSync('node build-feed.js KT_AR2.xlsm cfg_X13.json X13_KT.xlsx', { stdio: 'ignore' });
console.log('X13 built:', p.title);
