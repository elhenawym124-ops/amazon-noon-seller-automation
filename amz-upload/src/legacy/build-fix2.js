const fs = require('fs');
const { execSync } = require('child_process');

// --- X1: LVP-372 (cutting board) with an explicit valid unit-count type
const kt = JSON.parse(fs.readFileSync('products_kt.json', 'utf8'));
const p372 = kt.products.find(p => p.sku === 'LVP-372');
fs.writeFileSync('cfg_X1.json', JSON.stringify({
  productType: kt.productType, browseNode: kt.browseNode, quantity: 99,
  brand: 'Generic', inferMaterial: true, unitCountType: 'العد', products: [p372]
}, null, 1), 'utf8');

// --- X2: LVP-406 with the title rewritten (no repeated sprayer/spray words)
const misc = JSON.parse(fs.readFileSync('products_misc.json', 'utf8'));
const p406 = JSON.parse(JSON.stringify(misc.products.find(p => p.sku === 'LVP-406')));
p406.title = 'بخاخة جامبو متعددة الاستخدامات للزيت والمأكولات والقلاية الهوائية والنباتات والشعر W';
misc.products.forEach(p => { if (p.sku === 'LVP-406') p.title = p406.title; });
fs.writeFileSync('products_misc.json', JSON.stringify(misc, null, 1), 'utf8');
fs.writeFileSync('cfg_X2.json', JSON.stringify({
  productType: misc.productType, browseNode: misc.browseNode, quantity: 99,
  brand: 'Generic', inferMaterial: true, products: [p406]
}, null, 1), 'utf8');

execSync('node build-feed.js KT_AR2.xlsm cfg_X1.json X1_KT.xlsx', { stdio: 'ignore' });
execSync('node build-feed.js KT_AR2.xlsm cfg_X2.json X2_KT.xlsx', { stdio: 'ignore' });
console.log('built X1 (LVP-372) and X2 (LVP-406)');
console.log('406 title:', p406.title);
