const { dirs } = require('./lib/paths');
const fs = require('fs');
const path = require('path');
const listings = JSON.parse(fs.readFileSync(dirs.listings, 'utf8'));
const skus = JSON.parse(fs.readFileSync(path.join(dirs.state, 'created_skus.json'), 'utf8'));
const bySku = new Map(listings.rows.map(r => [r.coreListingFields.sku, r]));

const lines = ['country_code,id_partner,partner_sku,noon_warehouse_code,stock_gross'];
let n = 0;
for (const sku of skus) {
  const r = bySku.get(sku);
  let qty = r && r.availability ? Number(r.availability.quantity) : 0;
  if (!qty || qty < 1) qty = 10;
  lines.push(`eg,101488,${sku},W00756568EG,${qty}`);
  n++;
}
const out = path.join(dirs.feeds, 'fbp_stock.csv');
fs.writeFileSync(out, lines.join('\r\n') + '\r\n', 'ascii');
console.log('stock rows:', n, '->', out);
