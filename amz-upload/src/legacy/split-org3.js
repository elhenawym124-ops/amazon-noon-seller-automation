const fs = require('fs');
const j = JSON.parse(fs.readFileSync('H:/amzain/amz-upload/products_org_ar2.json', 'utf8'));
const p = j.products;
const chunk = (arr, n) => arr.reduce((acc, x, i) => { const k = Math.floor(i / n); (acc[k] = acc[k] || []).push(x); return acc; }, []);
const parts = chunk(p, 5);
parts.forEach((part, i) => {
  const f = `H:/amzain/amz-upload/products_org_ar2_${i + 1}.json`;
  fs.writeFileSync(f, JSON.stringify({ ...j, products: part }, null, 1), 'utf8');
  console.log('part', i + 1, part.length, part.map(x => x.sku).join(','));
});
