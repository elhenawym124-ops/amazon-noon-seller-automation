const { dirs } = require('./lib/paths');
const XLSX = require(dirs.xlsxModule);
const fs = require('fs');
const path = require('path');

const TPL = dirs.noonTemplate;
const LISTINGS = dirs.listings;

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
function pickColour(title) {
  const map = [['black', 'Black'], ['white', 'White'], ['grey', 'Grey'], ['gray', 'Grey'], ['silver', 'Silver'],
    ['beige', 'Beige'], ['brown', 'Brown'], ['blue', 'Blue'], ['navy', 'Blue'], ['green', 'Green'],
    ['red', 'Red'], ['pink', 'Pink'], ['yellow', 'Yellow'], ['gold', 'Gold'], ['rose', 'Pink'],
    ['transparent', 'Transparent'], ['clear', 'Transparent'], ['purple', 'Purple'], ['orange', 'Orange']];
  const low = title.toLowerCase();
  for (const [k, v] of map) if (low.includes(k)) return v;
  return 'Multicolour';
}
function pickMaterial(title) {
  const map = ['stainless steel', 'bamboo', 'wooden', 'wood', 'silicone', 'glass', 'acrylic', 'ceramic',
    'aluminium', 'aluminum', 'plastic', 'cotton', 'linen', 'metal', 'leather', 'rattan', 'polypropylene'];
  const low = title.toLowerCase();
  for (const m of map) if (low.includes(m)) return m.replace(/\b\w/g, c => c.toUpperCase());
  return 'Plastic';
}
function pickCapacity(title) {
  const m = title.match(/(\d+(?:\.\d+)?)\s*(l|liter|litre|ml|kg|g)\b/i);
  if (!m) return { v: '', u: '' };
  let v = m[1]; let u = m[2].toLowerCase();
  if (u === 'l' || u === 'liter' || u === 'litre') u = 'Liter';
  if (u === 'ml') { v = Number(v) / 1000; u = 'Liter'; }
  if (u === 'g') { v = Number(v) / 1000; u = 'Kilogram'; }
  if (u === 'kg') u = 'Kilogram';
  return { v, u };
}

// ---------- main ----------
const outFile = process.argv[2] || path.join(dirs.feeds, 'nis_test.xlsx');
const limit = Number(process.argv[3] || 2);
const typeFilter = process.argv[4] || 'FOOD_STORAGE_CONTAINER';
const startSku = process.argv[5] || '';

const listings = JSON.parse(fs.readFileSync(LISTINGS, 'utf8'));
let rows = listings.rows.filter(r => r.status && r.status.status === 'ACTIVE' &&
  r.listingData && r.listingData.productType === typeFilter);
if (startSku) {
  const i = rows.findIndex(r => r.coreListingFields.sku === startSku);
  if (i >= 0) rows = rows.slice(i);
}
rows = rows.slice(0, limit);
console.log('picked', rows.length, 'of', typeFilter);

const wb = XLSX.readFile(TPL, { cellStyles: true });
const ws = wb.Sheets['template_data'];
const codes = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })[8];
const col = {};
codes.forEach((c, i) => { if (c) col[String(c).trim()] = i; });

const sheetRows = [];
for (const r of rows) {
  const title = cleanTitle(r.listingData.title);
  const sku = r.coreListingFields.sku;
  const colour = pickColour(title);
  const material = pickMaterial(title);
  const cap = pickCapacity(title);
  const img = hdImage(r.imageUrl);
  const groupKey = 'G' + sku.replace(/[^A-Za-z0-9]/g, '');

  const parent = {};
  const child = {};
  const put = (o, code, val) => { if (col[code] !== undefined && val !== undefined && val !== '') o[code] = val; };

  put(parent, 'family', 'Kitchen & Dining');
  put(parent, 'product_type', 'Storage & Organization');
  put(parent, 'product_subtype', 'Food Containers');
  put(parent, 'brand', 'Generic');
  put(parent, 'product_title', title.slice(0, 150));
  put(parent, 'parent_group_key', groupKey);
  put(parent, 'parent_child_variation', 'Parent');
  put(parent, 'colour_name', colour);
  put(parent, 'colour_family', colour);
  put(parent, 'material', material);
  if (cap.v) { put(parent, 'capacity', cap.v); put(parent, 'capacity_unit', cap.u); }
  put(parent, 'item_condition', 'New');
  put(parent, 'long_description', title + '. Durable, practical and easy to use. A reliable choice for everyday home and kitchen use.');
  put(parent, 'whats_in_the_box', ('1 x ' + title).slice(0, 200));
  put(parent, 'feature_bullet_1', 'Durable and practical design for daily use');
  put(parent, 'feature_bullet_2', 'Easy to clean and store');
  put(parent, 'feature_bullet_3', 'Great value for home and kitchen organisation');
  put(parent, 'image_url_1', img);
  put(parent, 'country_of_origin', 'China');
  put(parent, 'vat_rate_eg', 'Std');

  put(child, 'family', 'Kitchen & Dining');
  put(child, 'product_type', 'Storage & Organization');
  put(child, 'product_subtype', 'Food Containers');
  put(child, 'brand', 'Generic');
  put(child, 'parent_group_key', groupKey);
  put(child, 'parent_child_variation', 'Child');
  put(child, 'seller_sku', sku);
  put(child, 'size_variation', 'One Size');

  sheetRows.push(parent, child);
}

const startRow = 10;
sheetRows.forEach((rec, i) => {
  const excelRow = startRow + i;
  for (let c = 0; c < codes.length; c++) delete ws[XLSX.utils.encode_cell({ r: excelRow - 1, c })];
  for (const [code, idx] of Object.entries(col)) {
    const val = rec[code];
    if (val === undefined || val === '') continue;
    ws[XLSX.utils.encode_cell({ r: excelRow - 1, c: idx })] = { t: 's', v: String(val) };
  }
});
const lastRow = startRow + sheetRows.length - 1;
for (let rr = lastRow + 1; rr <= lastRow + 10; rr++) {
  for (let cc = 0; cc < codes.length; cc++) delete ws[XLSX.utils.encode_cell({ r: rr - 1, c: cc })];
}
ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastRow - 1, c: codes.length - 1 } });

fs.mkdirSync(dirs.feeds, { recursive: true });
XLSX.writeFile(wb, outFile);
console.log('written', outFile, fs.statSync(outFile).size, 'rows', sheetRows.length);
