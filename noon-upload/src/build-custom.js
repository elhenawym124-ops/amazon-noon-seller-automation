const { dirs, resolve } = require('./lib/paths');
const XLSX = require(dirs.xlsxModule);
const fs = require('fs');

// usage: node build-custom.js <template.xlsx> <out.xlsx> <assignments.json>
// assignments: [{sku, family, type, subtype}]
const [TPL, OUT, ASSIGN] = process.argv.slice(2);
const jobs = JSON.parse(fs.readFileSync(resolve(ASSIGN), 'utf8').replace(/^\uFEFF/, ''));
const listings = JSON.parse(fs.readFileSync(dirs.listings, 'utf8'));
const bySku = new Map(listings.rows.map(r => [r.coreListingFields.sku, r]));

function cleanTitle(t) {
  let s = (t || '').replace(/\s+/g, ' ').trim();
  for (let i = 0; i < 3; i++) {
    const m = s.match(/\s+(\(?[A-Za-z0-9]{1,3}\)?|\d{1,2})$/);
    if (m && m[1].length <= 4) s = s.slice(0, -m[0].length).trim();
    else break;
  }
  return s;
}
function hdImage(u) {
  if (!u) return '';
  if (/\._[A-Za-z0-9_,]+_\.jpg$/i.test(u)) return u.replace(/\._[A-Za-z0-9_,]+_\.jpg$/i, '._AC_SL1500_.jpg');
  if (/\.jpg$/i.test(u)) return u.replace(/\.jpg$/i, '._AC_SL1500_.jpg');
  return u;
}

const wb = XLSX.readFile(TPL, { cellStyles: true });
const ws = wb.Sheets['template_data'];
const codes = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })[8];
const col = {};
codes.forEach((c, i) => { if (c) col[String(c).trim()] = i; });

const out = [];
for (const j of jobs) {
  const r = bySku.get(j.sku);
  if (!r) { console.log('missing listing', j.sku); continue; }
  const title = cleanTitle(r.listingData.title);
  const groupKey = 'G' + j.sku.replace(/[^A-Za-z0-9]/g, '');
  const img = hdImage(r.imageUrl);
  const parent = {}, child = {};
  const put = (o, code, val) => { if (col[code] !== undefined && val !== undefined && val !== '') o[code] = val; };

  for (const o of [parent, child]) {
    put(o, 'family', j.family);
    put(o, 'product_type', j.type);
    put(o, 'product_subtype', j.subtype);
    put(o, 'brand', 'Generic');
    put(o, 'parent_group_key', groupKey);
  }
  put(parent, 'parent_child_variation', 'Parent');
  put(parent, 'product_title', title.slice(0, 150));
  put(parent, 'item_condition', 'New');
  put(parent, 'long_description', title + '. Durable, practical and easy to use. A reliable choice for everyday use.');
  put(parent, 'whats_in_the_box', ('1 x ' + title).slice(0, 200));
  put(parent, 'feature_bullet_1', 'Practical and durable design');
  put(parent, 'feature_bullet_2', 'Easy to use and store');
  put(parent, 'feature_bullet_3', 'Great value');
  put(parent, 'image_url_1', img);
  put(parent, 'country_of_origin', 'China');
  put(parent, 'vat_rate_eg', 'Std');

  put(child, 'parent_child_variation', 'Child');
  put(child, 'seller_sku', j.sku);
  put(child, 'size_variation', 'One Size');

  out.push(parent, child);
}

const startRow = 10;
for (let i = 0; i < out.length + 15; i++) for (let c = 0; c < codes.length; c++) delete ws[XLSX.utils.encode_cell({ r: startRow - 1 + i, c })];
out.forEach((rec, i) => {
  const rr = startRow + i - 1;
  for (const [code, idx] of Object.entries(col)) {
    const val = rec[code];
    if (val === undefined || val === '') continue;
    ws[XLSX.utils.encode_cell({ r: rr, c: idx })] = { t: 's', v: String(val) };
  }
});
const lastRow = startRow + out.length - 1;
ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastRow - 1, c: codes.length - 1 } });
XLSX.writeFile(wb, OUT);
console.log('written', OUT, fs.statSync(OUT).size, 'rows', out.length);
