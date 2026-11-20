const fs = require('fs');
const listings = JSON.parse(fs.readFileSync('H:/amzain mina/amz-upload/levelup_listings.json', 'utf8'));
const skus = JSON.parse(fs.readFileSync(process.argv[2] || 'H:/amzain mina/noon-upload/kitchen_created.json', 'utf8'));
const out = process.argv[3] || 'H:/amzain mina/noon-upload/prices_all.csv';

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
