const fs = require('fs');

const raw = fs.readFileSync('H:/amzain mina/noon-upload/reports/errors.csv', 'utf8').replace(/^\uFEFF/, '');

function parseCSV(t) {
  const rows = [];
  let cur = [], field = '', inQ = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (inQ) {
      if (c === '"') { if (t[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
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
const byTitle = new Map();
for (const r of listings.rows) {
  byTitle.set(norm(r.listingData.title).slice(0, 80), r.coreListingFields.sku);
}

const found = new Set();
const unresolved = [];
for (const r of rows.slice(1)) {
  const t = r[iTitle] || '';
  const sku = (r[iSku] || '').trim();
  if (/^LVP-\d+$/.test(sku)) { found.add(sku); continue; }
  const key = norm(t).slice(0, 80);
  if (byTitle.has(key)) found.add(byTitle.get(key));
  else if (t) unresolved.push(t.slice(0, 60));
}
console.log('resolved skus:', found.size);
console.log([...found].join(', '));
console.log('unresolved titles:', unresolved.length);
console.log(unresolved.slice(0, 10).join('\n'));
fs.writeFileSync('H:/amzain mina/noon-upload/failed_skus2.json', JSON.stringify([...found], null, 1));
