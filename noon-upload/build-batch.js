const XLSX = require('H:/amzain mina/amz-upload/node_modules/xlsx');
const fs = require('fs');
const { mapType } = require('./mapping');

const TPL = process.argv[2] || 'H:/amzain mina/browsers/noon-seller/templates/Food_Containers__Download_English.xlsx';
const OUT = process.argv[3] || 'H:/amzain mina/noon-upload/kitchen_nis.xlsx';
const FAMILY = process.argv[4] || 'Kitchen & Dining';

const listings = JSON.parse(fs.readFileSync('H:/amzain mina/amz-upload/levelup_listings.json', 'utf8'));

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
const COLOURS = [['black', 'Black'], ['white', 'White'], ['grey', 'Grey'], ['gray', 'Grey'], ['silver', 'Silver'],
  ['beige', 'Beige'], ['brown', 'Brown'], ['blue', 'Blue'], ['navy', 'Blue'], ['green', 'Green'], ['red', 'Red'],
  ['pink', 'Pink'], ['yellow', 'Yellow'], ['gold', 'Gold'], ['rose', 'Pink'], ['transparent', 'Clear'],
  ['clear', 'Clear'], ['purple', 'Purple'], ['orange', 'Orange']];
const VALID_COLOUR_FAMILY = ['Beige', 'Black', 'Blue', 'Brown', 'Clear', 'Gold', 'Green', 'Grey', 'Multicolour', 'Orange', 'Pink', 'Purple', 'Red', 'Silver', 'White', 'Yellow'];
const VALID_MATERIAL = ['ABS', 'Acrylic', 'Aluminium', 'Bagasse', 'Bamboo', 'Bamboo Fiber', 'Brass', 'Cardboard', 'Cast Iron', 'Ceramic', 'China', 'Chrome Alloy', 'Copper', 'Cotton', 'Crystal', 'Glass', 'Granite', 'Iron', 'Latex', 'Leather', 'Marble', 'Melamine', 'Metal', 'Non-stick', 'Paper', 'Plastic', 'Polycarbonate', 'Polyester', 'Polyethylene', 'Polyethylene Terephthalate', 'Polypropylene', 'Polystyrene', 'Polyurethane', 'Porcelain', 'PVC', 'Rubber', 'Silicone', 'Stainless Steel', 'Stoneware', 'Titanium'];
const VALID_CAP_UNIT = ['Cubic Centimeter', 'Liter', 'Milliliter', 'Ounce'];
function pickColour(t) {
  const low = t.toLowerCase();
  for (const [k, v] of COLOURS) if (low.includes(k)) return VALID_COLOUR_FAMILY.includes(v) ? v : 'Multicolour';
  return 'Multicolour';
}
function pickMaterial(t) {
  const map = ['stainless steel', 'bamboo', 'silicone', 'glass', 'acrylic', 'ceramic', 'aluminium', 'aluminum',
    'plastic', 'cotton', 'metal', 'leather', 'polypropylene'];
  const low = t.toLowerCase();
  for (const m of map) {
    const v = m.replace(/\b\w/g, c => c.toUpperCase());
    if (VALID_MATERIAL.includes(v)) return v;
  }
  return 'Plastic';
}
function pickCapacity(t) {
  const m = t.match(/(\d+(?:\.\d+)?)\s*(l|liter|litre|ml|kg|g)\b/i);
  if (!m) return { v: '', u: '' };
  let v = m[1]; let u = m[2].toLowerCase();
  if (u === 'l' || u === 'liter' || u === 'litre') u = 'Liter';
  else if (u === 'ml') { v = Number(v) / 1000; u = 'Liter'; }
  else return { v: '', u: '' };
  if (!VALID_CAP_UNIT.includes(u)) return { v: '', u: '' };
  return { v, u };
}

const SKU_FILTER = process.argv[5] && fs.existsSync(process.argv[5]) ? new Set(JSON.parse(fs.readFileSync(process.argv[5], 'utf8'))) : null;

const picked = listings.rows.filter(r => {
  if (!(r.status && r.status.status === 'ACTIVE' && r.listingData)) return false;
  if (SKU_FILTER && !SKU_FILTER.has(r.coreListingFields.sku)) return false;
  return mapType(r.listingData.productType, r.listingData.title).family === FAMILY;
});
console.log('products for', FAMILY, ':', picked.length);

const wb = XLSX.readFile(TPL, { cellStyles: true });
const ws = wb.Sheets['template_data'];
const codes = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })[8];
const col = {};
codes.forEach((c, i) => { if (c) col[String(c).trim()] = i; });

const out = [];
for (const r of picked) {
  const title = cleanTitle(r.listingData.title);
  const m = mapType(r.listingData.productType, r.listingData.title);
  const sku = r.coreListingFields.sku;
  const groupKey = 'G' + sku.replace(/[^A-Za-z0-9]/g, '');
  const colour = pickColour(title);
  const material = pickMaterial(title);
  const cap = pickCapacity(title);
  const img = hdImage(r.imageUrl);

  const parent = {};
  const child = {};
  const put = (o, code, val) => { if (col[code] !== undefined && val !== undefined && val !== '') o[code] = val; };

  put(parent, 'family', m.family);
  put(parent, 'product_type', m.type);
  put(parent, 'product_subtype', m.subtype);
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

  put(child, 'family', m.family);
  put(child, 'product_type', m.type);
  put(child, 'product_subtype', m.subtype);
  put(child, 'brand', 'Generic');
  put(child, 'parent_group_key', groupKey);
  put(child, 'parent_child_variation', 'Child');
  put(child, 'seller_sku', sku);
  put(child, 'size_variation', 'One Size');

  out.push(parent, child);
}

const startRow = 10;
for (let i = 0; i < out.length + 20; i++) {
  for (let c = 0; c < codes.length; c++) delete ws[XLSX.utils.encode_cell({ r: startRow - 1 + i, c })];
}
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
