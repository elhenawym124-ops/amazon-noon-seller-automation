const fs = require('fs');
const { execSync } = require('child_process');
const j = JSON.parse(fs.readFileSync('products_ar2.json', 'utf8'));

// X10: LVP-166 with unit_count left EMPTY (server may accept blank; only non-empty values get 90244)
const p166 = JSON.parse(JSON.stringify(j.products.find(p => p.sku === 'LVP-166')));
p166.browseNode = j.browseNode;
fs.writeFileSync('cfg_X10.json', JSON.stringify({
  productType: 'HOME_ORGANIZERS_AND_STORAGE',
  browseNode: j.browseNode,
  quantity: 99,
  brand: 'Generic',
  products: [p166]
}, null, 1), 'utf8');
execSync('node build-feed.js ORG_AR.xlsm cfg_X10.json X10_ORG.xlsx', { stdio: 'ignore' });

// X11: LVP-165 with a very short neutral title, single image
const p165 = JSON.parse(JSON.stringify(j.products.find(p => p.sku === 'LVP-165')));
p165.title = 'حقنة توابل للمطبخ';
p165.images = p165.images.slice(0, 1);
p165.browseNode = '21864567031';
fs.writeFileSync('cfg_X11.json', JSON.stringify({
  productType: 'KITCHEN_TOOLS',
  browseNode: '21864567031',
  quantity: 99,
  brand: 'Generic',
  inferMaterial: true,
  products: [p165]
}, null, 1), 'utf8');
execSync('node build-feed.js KT_AR2.xlsm cfg_X11.json X11_KT.xlsx', { stdio: 'ignore' });

console.log('X10 166 blank unit-count | X11 165 title:', p165.title);
