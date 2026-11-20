const { dirs } = require('./lib/paths');
const XLSX = require(dirs.xlsxModule);
const fs = require('fs');
const path = require('path');

const listings = JSON.parse(fs.readFileSync(dirs.listings, 'utf8'));

const TPL = dirs.noonTemplate;
const OUT = process.argv[2] || path.join(dirs.feeds, 'pilot_nis.xlsx');
const LIMIT = Number(process.argv[3] || 5);
const TYPE_FILTER = process.argv[4] || 'FOOD_STORAGE_CONTAINER';

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
  const map = [
    ['black', 'Black'], ['white', 'White'], ['grey', 'Grey'], ['gray', 'Grey'], ['silver', 'Silver'],
    ['beige', 'Beige'], ['brown', 'Brown'], ['blue', 'Blue'], ['navy', 'Blue'], ['green', 'Green'],
    ['red', 'Red'], ['pink', 'Pink'], ['yellow', 'Yellow'], ['gold', 'Gold'], ['rose', 'Pink'],
    ['transparent', 'Transparent'], ['clear', 'Transparent'], ['purple', 'Purple'],
    ['orange', 'Orange'], ['multicolour', 'Multicolour'], ['multi', 'Multicolour']
  ];
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
  let v = m[1];
  let u = m[2].toLowerCase();
  if (u === 'liter' || u === 'litre' || u === 'l') u = 'Liter';
  if (u === 'ml') { v = Number(v) / 1000; u = 'Liter'; }
  if (u === 'g') { v = Number(v) / 1000; u = 'Kilogram'; }
  if (u === 'kg') u = 'Kilogram';
  return { v, u };
}

const rows = listings.rows
  .filter(r => r.status && r.status.status === 'ACTIVE' && r.listingData && r.listingData.productType === TYPE_FILTER)
  .slice(0, LIMIT);

console.log('picked', rows.length, 'listings of type', TYPE_FILTER);

const wb = XLSX.readFile(TPL, { cellStyles: true });
const ws = wb.Sheets['template_data'];
const codes = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })[8];
const col = {};
codes.forEach((c, i) => { if (c) col[String(c).trim()] = i; });
console.log('columns:', Object.keys(col).length);

const data = [];
for (const r of rows) {
  const title = cleanTitle(r.listingData.title);
  const colour = pickColour(title);
  const material = pickMaterial(title);
  const cap = pickCapacity(title);
  const sku = r.coreListingFields.sku;
  const img = hdImage(r.imageUrl);

  const rec = {};
  const put = (code, val) => { if (col[code] !== undefined) rec[code] = val; };

  put('family', 'Kitchen & Dining');
  put('product_type', 'Storage & Organization');
  put('product_subtype', 'Food Containers');
  put('brand', 'Generic');
  put('product_title', title.slice(0, 150));
  put('seller_sku', sku);
  put('parent_group_key', sku);
  put('parent_child_variation', 'Parent');
  put('item_condition', 'New');
  put('colour_name', colour);
  put('colour_family', colour);
  put('material', material);
  if (cap.v) { put('capacity', cap.v); put('capacity_unit', cap.u); }
  put('long_description', title + '. Durable, practical and easy to use. A reliable choice for everyday home and kitchen use.');
  put('whats_in_the_box', ('1 x ' + title).slice(0, 200));
  put('feature_bullet_1', 'Durable and practical design for daily use');
  put('feature_bullet_2', 'Easy to clean and store');
  put('feature_bullet_3', 'Great value for home and kitchen organisation');
  put('image_url_1', img);
  put('country_of_origin', 'China');
  put('vat_rate_eg', 'Std');
  data.push(rec);
}

const startRow = 10;
rows.forEach((r, i) => {
  const excelRow = startRow + i;
  for (const [code, idx] of Object.entries(col)) {
    const val = data[i][code];
    if (val === undefined || val === '') continue;
    const addr = XLSX.utils.encode_cell({ r: excelRow - 1, c: idx });
    ws[addr] = { t: typeof val === 'number' ? 'n' : 's', v: val };
  }
});
// clear any leftover template row cells beyond the last data row
const lastRow = startRow + rows.length - 1;
for (let rr = lastRow + 1; rr <= lastRow + 5; rr++) {
  for (let cc = 0; cc < codes.length; cc++) {
    delete ws[XLSX.utils.encode_cell({ r: rr - 1, c: cc })];
  }
}
ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastRow - 1, c: codes.length - 1 } });

fs.mkdirSync(dirs.feeds, { recursive: true });
XLSX.writeFile(wb, OUT);
console.log('written', OUT, fs.statSync(OUT).size);
console.log('first row:', JSON.stringify(data[0]));
