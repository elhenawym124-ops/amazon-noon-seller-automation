const fs = require('fs');

const raw = fs.readFileSync('H:/amzain mina/noon-upload/reports/errors_kitchen_batch.csv', 'utf8').replace(/^\uFEFF/, '');
function parseCSV(t) {
  const rows = []; let cur = [], field = '', inQ = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (inQ) { if (c === '"') { if (t[i + 1] === '"') { field += '"'; i++; } else inQ = false; } else field += c; }
    else if (c === '"') inQ = true;
    else if (c === ',') { cur.push(field); field = ''; }
    else if (c === '\n') { cur.push(field); rows.push(cur); cur = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || cur.length) { cur.push(field); rows.push(cur); }
  return rows;
}
const rows = parseCSV(raw);
const hdr = rows[0];
const iTitle = hdr.indexOf('product_title');
const iSku = hdr.indexOf('seller_sku');

const listings = JSON.parse(fs.readFileSync('H:/amzain mina/amz-upload/levelup_listings.json', 'utf8'));
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const found = new Set();
for (const r of rows.slice(1)) {
  const sku = (r[iSku] || '').trim();
  if (/^LVP-\d+$/.test(sku)) { found.add(sku); continue; }
  const key = norm(r[iTitle]).slice(0, 45);
  if (!key) continue;
  const hit = listings.rows.find(l => norm(l.listingData.title).startsWith(key));
  if (hit) found.add(hit.coreListingFields.sku);
}
const list = [...found];
console.log('total skus to re-create:', list.length);
fs.writeFileSync('H:/amzain mina/noon-upload/failed_skus.json', JSON.stringify(list, null, 1));
console.log(list.join(', '));
