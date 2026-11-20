const fs = require('fs');
const p = 'H:/amzain mina/amz-upload/products_org.json';
const j = JSON.parse(fs.readFileSync(p, 'utf8'));
const isAr = s => /[\u0600-\u06FF]/.test(s || '');
const ar = j.products.filter(x => isAr(x.title));
const en = j.products.filter(x => !isAr(x.title));
fs.writeFileSync('H:/amzain mina/amz-upload/products_org_ar.json', JSON.stringify({ ...j, products: ar }, null, 1), 'utf8');
fs.writeFileSync('H:/amzain mina/amz-upload/products_org_en.json', JSON.stringify({ ...j, products: en }, null, 1), 'utf8');
console.log('ar', ar.length, 'en', en.length, 'total', j.products.length);
