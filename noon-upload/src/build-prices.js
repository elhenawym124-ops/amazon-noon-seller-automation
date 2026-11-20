const { dirs, resolve } = require('./lib/paths');
const fs = require('fs');
const path = require('path');
const listings = JSON.parse(fs.readFileSync(dirs.listings, 'utf8'));
const skus = JSON.parse(fs.readFileSync(resolve(process.argv[2] || path.join(dirs.state, 'kitchen_created.json')), 'utf8'));
const out = resolve(process.argv[3] || path.join(dirs.feeds, 'prices_all.csv'));

const bySku = new Map(listings.rows.map(r => [r.coreListingFields.sku, r]));
const lines = ['country_code,partner_sku,price,sale_price,sale_start,sale_end,id_partner'];
let n = 0, missing = [];
for (const sku of skus) {
  const r = bySku.get(sku);
  if (!r) { missing.push(sku); continue; }
  const off = (r.offers || []).find(o => o.price && o.price.price && o.price.price.amount);
  const amt = off ? String(off.price.price.amount).replace(/,/g, '') : null;
  if (!amt) { missing.push(sku); continue; }
  lines.push(`eg,${sku},${amt},,,,101488`);
  n++;
}
fs.writeFileSync(out, lines.join('\n'), 'ascii');
console.log('prices written:', n, 'missing:', missing.length, '->', out);
if (missing.length) console.log('missing skus:', missing.slice(0, 20).join(', '));
