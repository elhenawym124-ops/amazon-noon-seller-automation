const fs = require('fs');
const p = 'H:/amzain mina/amz-upload/products_pan.json';
const j = JSON.parse(fs.readFileSync(p, 'utf8'));
j.products.forEach(x => {
  x.care = 'غسيل يدوي فقط';
  x.included = x.included || 'قطعة واحدة';
  x.diameter = x.diameter || 30;
  x.pdHeight = x.pdHeight || 8;
  x.pdWidth = x.pdWidth || 50;
});
fs.writeFileSync(p, JSON.stringify(j, null, 1), 'utf8');
console.log('patched', j.products.length);
