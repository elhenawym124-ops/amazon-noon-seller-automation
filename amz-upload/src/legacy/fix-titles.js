const fs = require('fs');
const fix = {
  'LVP-369': 'قشارة بطاطس وخضروات عملية للجزر والخيار والفاكهة – أداة سريعة للاستخدام اليومي في المطبخ (H)',
  'LVP-370': 'أداة تقشير خضار وفاكهة طويلة للبطاطس والجزر والخيار والتفاح – متعددة الاستخدام في المطبخ (H)'
};
for (const f of ['products_kt.json', 'cfg_R1_kt.json']) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  j.products.forEach(p => { if (fix[p.sku]) p.title = fix[p.sku]; });
  fs.writeFileSync(f, JSON.stringify(j, null, 1), 'utf8');
}
const j = JSON.parse(fs.readFileSync('products_kt.json', 'utf8'));
const sub = j.products.filter(p => fix[p.sku]);
fs.writeFileSync('cfg_R1b_kt.json', JSON.stringify({
  productType: j.productType, browseNode: j.browseNode, quantity: 99,
  brand: 'Generic', inferMaterial: true, products: sub
}, null, 1), 'utf8');
console.log('sub', sub.map(p => p.sku + ' :: ' + p.title).join('\n'));
