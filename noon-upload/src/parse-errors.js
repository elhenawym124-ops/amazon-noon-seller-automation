const { dirs } = require('./lib/paths');
const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(path.join(dirs.noonReports, 'errors.csv'), 'utf8').replace(/^\uFEFF/, '');

function parseCSV(t) {
  const rows = [];
  let cur = [], field = '', inQ = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (inQ) {
      if (c === '"') {
        if (t[i + 1] === '"') { field += '"'; i++; } else inQ = false;
      } else field += c;
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
const iSku = hdr.indexOf('seller_sku');
const iSkuChild = hdr.indexOf('x_sku_child');
const skus = new Set();
for (const r of rows.slice(1)) {
  for (const idx of [iSku, iSkuChild]) {
    const v = idx >= 0 ? (r[idx] || '').trim() : '';
    if (v) skus.add(v);
  }
  const any = (r.join(' ').match(/LVP-\d+/g) || []);
  any.forEach(s => skus.add(s));
}
console.log('rows', rows.length - 1, 'sku col', iSku, 'unique skus', skus.size);
fs.writeFileSync(path.join(dirs.state, 'failed_skus.json'), JSON.stringify([...skus], null, 1));
console.log([...skus].join(', '));

// error message histogram
const counts = {};
for (const r of rows.slice(1)) {
  const tail = r.slice(-5).join(' | ');
  const m = tail.match(/Invalid value `[^`]+` for select attribute `[^`]+`|Invalid unit `[^`]+` for attribute `[^`]+`|missing[^|]*/i);
  const key = m ? m[0] : (tail.replace(/\|/g, '').trim() || '(empty)');
  counts[key] = (counts[key] || 0) + 1;
}
console.log(JSON.stringify(counts, null, 1));
