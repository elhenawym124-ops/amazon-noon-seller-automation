// Create a sub-feed config from an existing products_*.json
// usage: node mksub.js <src.json> <out.json> <sku1,sku2,...|ALL> [qty]
const fs = require('fs');
const [src, out, skuList, qty] = process.argv.slice(2);
const j = JSON.parse(fs.readFileSync(src, 'utf8'));
const want = skuList === 'ALL' ? null : skuList.split(',').map(s => s.trim()).filter(Boolean);
let products = j.products;
if (want) {
  const set = new Set(want);
  products = j.products.filter(p => set.has(p.sku));
  const missing = want.filter(s => !products.find(p => p.sku === s));
  if (missing.length) console.log('MISSING SKUs:', missing.join(','));
}
const res = {
  productType: j.productType,
  browseNode: j.browseNode,
  quantity: qty ? parseInt(qty, 10) : 99,
  brand: j.brand || 'Generic',
  inferMaterial: true,
  products
};
fs.writeFileSync(out, JSON.stringify(res, null, 1), 'utf8');
console.log('wrote', out, 'with', products.length, 'products | qty', res.quantity);
