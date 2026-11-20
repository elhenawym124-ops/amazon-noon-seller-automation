const XLSX = require('xlsx');
const path = require('path');

const TPL = process.argv[2] || 'H:/amzain mina/amz-upload/APRON_AR.xlsm';
const CFG = process.argv[3] || 'H:/amzain mina/amz-upload/products.json';
const OUT = process.argv[4] || 'H:/amzain mina/amz-upload/APRON_feed.xlsx';
const SHEET = 'النموذج';
const VVSHEET = 'القيم الصحيحة';

const cfg = JSON.parse(require('fs').readFileSync(CFG, 'utf8'));
const wb = XLSX.readFile(TPL, { bookVBA: false });
const ws = wb.Sheets[SHEET];
const data = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: true, defval: '' });
const attrRow = data[4];

const vv = XLSX.utils.sheet_to_json(wb.Sheets[VVSHEET], { header: 1, blankrows: false, defval: '' });
function resolve(labelStartsWith, includesToken) {
  const rows = vv.filter(r => String(r[1] || '').trim().startsWith(labelStartsWith));
  const all = rows.flatMap(r => r.slice(2).filter(x => String(x).trim()).map(String));
  if (!all.length) return null;
  if (!includesToken) {
    if (all.length === 1) return all[0];
    return null;
  }
  const hit = all.find(v => (includesToken instanceof RegExp ? includesToken.test(v) : v.includes(includesToken)));
  return hit || null;
}

const V = {
  productIdType: resolve('نوع معرِّف المنتج', 'معفٍ'),
  condition: resolve('حالة السلعة'),
  fulfillment: resolve('رمز قناة تنفيذ الطلبات', 'التاجر') || resolve('رمز قناة تنفيذ الطلبات'),
  invAlways: resolve('المخزون مُتوفر', 'عط'),
  invEnabled: (() => {
    const rows = vv.filter(r => String(r[1] || '').startsWith('المخزون مُتوفر'));
    const all = rows.flatMap(r => r.slice(2).filter(x => String(x).trim()).map(String));
    return all.find(v => !/عط/.test(v));
  })(),  colorMap: resolve('خريطة اللون', 'متعدد'),
  gender: resolve('الجنس المستهدف', 'للجنسين'),
  ageRange: resolve('وصف الفئة العمرية', 'بالغ'),
  material: resolve('مواد', /^قطن$/),
  strap: resolve('نوع الحزام', 'عنق'),
  specialSize: resolve('حجم خاص', 'قياسي'),
  weightUnit: resolve('وحدة وزن السلعة', 'غرام'),
  lengthUnit: resolve('وحدة قياس طول المنتج', 'سنتيمتر'),
  widthUnit: resolve('وحدة قياس عرض المنتج', 'سنتيمتر'),
  country: resolve('بلد الصنع', /^الصين$/),
  dg: resolve('لوائح البضائع الخطرة', 'غير قابل'),
  battNo: resolve('هل البطاريات مطلوبة؟', 'لا'),
  styleApproved: resolve('النمط', /^مريلة$/),
  weave: resolve('نوع النسج', 'مستو'),
  care: resolve('تعليمات العناية', 'غسيل بالغسالة'),
  listCurrency: resolve('عملة سعر القائمة', /^EGP$/),
  unitH: resolve('وحدة قياس الارتفاع', 'سنتيمتر'),
  unitType: resolve('نوع عدد الوحدات', 'العد') || resolve('نوع عدد الوحدات', 'قطعة'),
  capUnit: resolve('وحدة السعة', 'ملليلتر') || resolve('وحدة السعة', 'أكواب'),
  materialAlt: resolve('مواد', 'معدن') || resolve('مواد', 'زجاج'),
  careAlt: resolve('تعليمات العناية', 'غسيل يدوي') || resolve('تعليمات العناية', 'غسيل'),  unitL: resolve('وحدة قياس الطول', 'سنتيمتر'),
  unitW: resolve('وحدة قياس العرض', 'سنتيمتر'),
  pattern: null
};
// pattern = second "النمط" block (17 values, contains أرجايل)
const patternRows = vv.filter(r => String(r[1] || '').trim().startsWith('النمط'));
const patternVals = patternRows.flatMap(r => r.slice(2).map(String));
const pat = patternVals.find(v => v.includes('منقوش'));
if (pat) V.pattern = pat;

console.log('resolved values:');
Object.entries(V).forEach(([k, v]) => console.log('  ' + k + ' = ' + v));

// ---- helpers added 2026-11-10 ----
// Amazon rejects titles where any word is repeated more than twice (error 100470)
function sanitizeTitle(t) {
  const parts = String(t || '').split(/\s+/).filter(Boolean);
  const cnt = {};
  const out = [];
  for (const w of parts) {
    const k = w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    if (!k) { out.push(w); continue; }
    cnt[k] = (cnt[k] || 0) + 1;
    if (cnt[k] <= 2) out.push(w);
  }
  return out.join(' ');
}

// infer a *valid* material from the Arabic title (fix: everything defaulted to "زجاج")
function inferMaterial(t) {
  const s = ' ' + String(t || '')
    .replace(/زجاجات|زجاجة|زجاجت/g, ' ')
    .replace(/خشبية|خشب/g, ' خشب ')
    .replace(/\s+/g, ' ') + ' ';
  if (/سيليكون/.test(s)) return 'سيليكون';
  if (/ستانلس|ستيل|مقاوم للصدأ/.test(s)) return 'ستانلس ستيل';
  if (/زجاج/.test(s)) return 'زجاج';
  if (/خشب|بامبو|خيزران/.test(s)) return 'خشب';
  if (/أكريليك|اكريليك/.test(s)) return 'أكريليك';
  if (/بورسلين|سيراميك|خزف/.test(s)) return 'سيراميك';
  if (/غلاية|كاتيل|براد/.test(s)) return 'ستانلس ستيل';
  if (/معدن|حديد|نحاس|ألومنيوم|الومنيوم/.test(s)) return 'حديد';
  if (/قطن/.test(s)) return 'قطن';
  if (/بلاستيك|بولي|ميلامين|نايلون/.test(s)) return 'بلاستيك';
  return 'بلاستيك';
}

// unit_count has no valid values for some product types (KITCHEN_TOOLS) -> error 90244.
// Also invalid after Amazon re-maps the product type, so it is skipped by default.
const vvHasUnitCount = vv.some(r => /نوع عدد الوحدات/.test(String(r[1] || '')));
const ucRow = vv.find(r => /نوع عدد الوحدات/.test(String(r[1] || '')));
const ucVals = ucRow ? ucRow.slice(2).filter(x => String(x).trim()).map(String) : [];
const ucType = cfg.unitCountType || ucVals.find(v => v === 'العد') || ucVals.find(v => /عد/.test(v)) || null;
const WRITE_UNIT_COUNT = !!(cfg.unitCountType || (ucType && ucVals.length));
console.log('write unit_count:', WRITE_UNIT_COUNT, 'type:', cfg.unitCountType || ucType);

if (cfg.english) {
  V.condition = 'New';
  V.fulfillment = 'Fulfilment by Merchant (Default)';
  V.invEnabled = 'Enabled';
  V.weightUnit = 'Grams';
  V.unitL = V.unitW = V.unitH = 'Centimeters';
  V.country = 'China';
  V.dg = 'Not Applicable';
  V.colorMap = 'Multicolor';
  V.battNo = 'No';
}
function colFor(startsWith, nth) {
  let count = 0;
  for (let i = 0; i < attrRow.length; i++) {
    const a = String(attrRow[i] || '');
    if (a.startsWith(startsWith)) {
      if (nth === undefined || count === nth) return i;
      count++;
    }
  }
  return -1;
}
function colExact(attr) {
  const i = attrRow.findIndex(a => String(a || '') === attr);
  return i < 0 ? -1 : i;
}

// clear template example/note rows completely, then reserve our data rows.
// Amazon's parser ignores the first data row (row 6 = template example), so we start at row 7.
const START = 6;
for (let r = 5; r < START + cfg.products.length; r++) {
  data[r] = new Array(attrRow.length).fill('');
}

const A = {
  sku: colExact('contribution_sku#1.value'),
  ptype: colExact('product_type#1.value'),
  title: colFor('item_name['),
  brand: colFor('brand['),
  pidType: colExact('amzn1.volt.ca.product_id_type'),
  pidValue: colExact('amzn1.volt.ca.product_id_value'),
  nodes: colFor('recommended_browse_nodes['),
  model: colFor('model_name['),
  mainImg: colFor('main_product_image_locator['),
  desc: colFor('product_description['),
  bullet: colFor('bullet_point['),
  material: colFor('material['),
  gender: colFor('target_gender['),
  age: colFor('age_range_description['),
  strap: colFor('strap_type['),
  specialSize: colFor('special_size_type['),
  colorStd: colExact('color[marketplace_id=ARBP9OOSHTCHU][language_tag=ar_AE]#1.standardized_values#1'),
  colorVal: colFor('color[marketplace_id=ARBP9OOSHTCHU][language_tag=ar_AE]#1.value'),
  pattern: colFor('pattern['),
  weightValue: colExact('item_weight[marketplace_id=ARBP9OOSHTCHU]#1.value'),
  weightUnit: colExact('item_weight[marketplace_id=ARBP9OOSHTCHU]#1.unit'),
  condition: colFor('condition_type['),
  fulfill: colOfAttr('fulfillment_availability#1.fulfillment_channel_code'),
  lwLUnit: colOfAttr('item_length_width[marketplace_id=ARBP9OOSHTCHU]#1.length.unit'),
  lwLVal: colOfAttr('item_length_width[marketplace_id=ARBP9OOSHTCHU]#1.length.value'),
  lwWUnit: colOfAttr('item_length_width[marketplace_id=ARBP9OOSHTCHU]#1.width.unit'),
  lwWVal: colOfAttr('item_length_width[marketplace_id=ARBP9OOSHTCHU]#1.width.value'),
  qty: colOfAttr('fulfillment_availability#1.quantity'),
  invAlways: colOfAttr('fulfillment_availability#1.is_inventory_available'),
  price: colFor('purchasable_offer[marketplace_id=ARBP9OOSHTCHU][audience=ALL]#1.our_price'),
  pkgL: colFor('item_package_dimensions[marketplace_id=ARBP9OOSHTCHU]#1.length.value'),
  pkgLU: colFor('item_package_dimensions[marketplace_id=ARBP9OOSHTCHU]#1.length.unit'),
  pkgW: colFor('item_package_dimensions[marketplace_id=ARBP9OOSHTCHU]#1.width.value'),
  pkgWU: colFor('item_package_dimensions[marketplace_id=ARBP9OOSHTCHU]#1.width.unit'),
  pkgH: colFor('item_package_dimensions[marketplace_id=ARBP9OOSHTCHU]#1.height.value'),
  pkgHU: colFor('item_package_dimensions[marketplace_id=ARBP9OOSHTCHU]#1.height.unit'),
  country: colFor('country_of_origin['),
  dg: colFor('supplier_declared_dg_hz_regulation['),
  battRequired: colOfAttr('batteries_required['),
  battIncluded: colOfAttr('batteries_included['),
  styleCol: colFor('style['),
  fabric: colFor('fabric_type['),
  weave: colFor('weave_type['),
  care: colFor('care_instructions['),
  outerMat: colOfAttr('outer[marketplace_id=ARBP9OOSHTCHU]#1.material['),
  listCur: colOfAttr('list_price[marketplace_id=ARBP9OOSHTCHU]#1.currency'),
  listVal: colOfAttr('list_price[marketplace_id=ARBP9OOSHTCHU]#1.value_with_tax'),
  modelNumber: colOfAttr('model_number['),
  manufacturer: colFor('manufacturer['),
  numberOfItems: colOfAttr('number_of_items['),
  partNumber: colOfAttr('part_number['),
  dimHUnit: colOfAttr('item_length_width_height[marketplace_id=ARBP9OOSHTCHU]#1.height.unit'),
  dimHVal: colOfAttr('item_length_width_height[marketplace_id=ARBP9OOSHTCHU]#1.height.value'),
  dimLUnit: colOfAttr('item_length_width_height[marketplace_id=ARBP9OOSHTCHU]#1.length.unit'),
  dimLVal: colOfAttr('item_length_width_height[marketplace_id=ARBP9OOSHTCHU]#1.length.value'),
  dimWUnit: colOfAttr('item_length_width_height[marketplace_id=ARBP9OOSHTCHU]#1.width.unit'),
  dimWVal: colOfAttr('item_length_width_height[marketplace_id=ARBP9OOSHTCHU]#1.width.value'),
  careCol: colFor('care_instructions['),
  inclComp: colFor('included_components['),
  diamUnit: colOfAttr('item_width_diameter_height[marketplace_id=ARBP9OOSHTCHU]#1.diameter.unit'),
  diamVal: colOfAttr('item_width_diameter_height[marketplace_id=ARBP9OOSHTCHU]#1.diameter.value'),
  pdHUnit: colOfAttr('item_width_diameter_height[marketplace_id=ARBP9OOSHTCHU]#1.height.unit'),
  pdHVal: colOfAttr('item_width_diameter_height[marketplace_id=ARBP9OOSHTCHU]#1.height.value'),
  pdWUnit: colOfAttr('item_width_diameter_height[marketplace_id=ARBP9OOSHTCHU]#1.width.unit'),
  pdWVal: colOfAttr('item_width_diameter_height[marketplace_id=ARBP9OOSHTCHU]#1.width.value'),
  unitCountType: colOfAttr('unit_count[marketplace_id=ARBP9OOSHTCHU]#1.type'),
  unitCountVal: colOfAttr('unit_count[marketplace_id=ARBP9OOSHTCHU]#1.value'),
  capUnit: colOfAttr('capacity[marketplace_id=ARBP9OOSHTCHU]#1.unit'),
  capVal: colOfAttr('capacity[marketplace_id=ARBP9OOSHTCHU]#1.value'),
  wv: colOfAttr('item_width_height[marketplace_id=ARBP9OOSHTCHU]#1.width.value'),
  wu: colOfAttr('item_width_height[marketplace_id=ARBP9OOSHTCHU]#1.width.unit'),
  hv: colOfAttr('item_width_height[marketplace_id=ARBP9OOSHTCHU]#1.height.value'),
  liquid: colOfAttr('contains_liquid_contents['),
};
function colOfAttr(prefix) {
  const i = attrRow.findIndex(a => String(a || '').startsWith(prefix));
  return i < 0 ? -1 : i;
}

console.log('\ncolumn map:', JSON.stringify(A));

cfg.products.forEach((p, idx) => {
  const r = START + idx;
  const row = data[r];
  row[A.sku] = p.sku;
  row[A.ptype] = cfg.productType;
  row[A.title] = cfg.rawTitle ? p.title : sanitizeTitle(p.title);
  row[A.brand] = cfg.brand;
  row[A.pidType] = V.productIdType;
  row[A.pidValue] = '';
  row[A.nodes] = p.browseNode || cfg.browseNode;
  row[A.model] = p.modelName;
  row[A.mainImg] = p.images[0];
  if (A.mainImg >= 0) for (let k = 1; k < Math.min(p.images.length, 9); k++) row[A.mainImg + k] = p.images[k];
  row[A.desc] = p.description;
  if (A.bullet >= 0) for (let b = 0; b < Math.min(p.bullets.length, 5); b++) row[A.bullet + b] = p.bullets[b];
  row[A.material] = p.material || (cfg.inferMaterial ? inferMaterial(p.title) : (V.materialAlt || V.material));
  row[A.gender] = V.gender;
  row[A.age] = V.ageRange;
  row[A.strap] = V.strap;
  row[A.specialSize] = V.specialSize;
  row[A.colorStd] = V.colorMap;
  row[A.colorVal] = p.color;
  if (V.pattern) row[A.pattern] = V.pattern;
  row[A.weightValue] = p.weightGrams;
  row[A.weightUnit] = V.weightUnit;
  if (A.lwLVal >= 0) { row[A.lwLVal] = p.dimLength || 40; row[A.lwLUnit] = p.dimUnit || 'سنتيمترات'; }
  if (A.lwWVal >= 0) { row[A.lwWVal] = p.dimWidth || 25; row[A.lwWUnit] = p.dimUnit || 'سنتيمترات'; }
  row[A.condition] = V.condition;
  row[A.fulfill] = V.fulfillment;
  row[A.qty] = cfg.quantity;   // creates the offer record; availability is flipped later by the price feed
  if (A.invAlways >= 0 && cfg.setAvailability) row[A.invAlways] = cfg.setAvailability;
  row[A.price] = p.price;
  row[A.pkgL] = 30; row[A.pkgLU] = V.unitL || V.lengthUnit || 'سنتيمترات';
  row[A.pkgW] = 25; row[A.pkgWU] = V.unitW || V.widthUnit || 'سنتيمترات';
  row[A.pkgH] = 5; row[A.pkgHU] = V.unitH || V.lengthUnit || 'سنتيمترات';
  row[A.country] = V.country;
  row[A.dg] = V.dg;
  row[A.battRequired] = V.battNo;
  row[A.battIncluded] = V.battNo;
  row[A.styleCol] = V.styleApproved;
  row[A.fabric] = V.material;
  row[A.weave] = V.weave;
  row[A.care] = V.care;
  row[A.outerMat] = V.material;
  row[A.listCur] = V.listCurrency;
  row[A.listVal] = p.price;
  if (A.modelNumber >= 0) row[A.modelNumber] = p.modelName;
  if (A.manufacturer >= 0) row[A.manufacturer] = p.manufacturer || 'Generic';
  if (A.numberOfItems >= 0) row[A.numberOfItems] = p.numberOfItems || 1;
  if (A.partNumber >= 0) row[A.partNumber] = p.partNumber || p.sku;
  if (A.dimLVal >= 0) { row[A.dimLVal] = p.dimLength || 40; row[A.dimLUnit] = V.unitL || 'سنتيمترات'; }
  if (A.dimWVal >= 0) { row[A.dimWVal] = p.dimWidth || 25; row[A.dimWUnit] = V.unitW || 'سنتيمترات'; }
  if (A.dimHVal >= 0) { row[A.dimHVal] = p.dimHeight || 5; row[A.dimHUnit] = V.unitH || 'سنتيمترات'; }
  if (A.careCol >= 0) row[A.careCol] = p.care || V.careAlt || V.care || null;
  if (A.inclComp >= 0) row[A.inclComp] = p.included || 'قطعة واحدة';
  if (A.diamVal >= 0) { row[A.diamVal] = p.diameter || 30; row[A.diamUnit] = V.unitL || 'سنتيمترات'; }
  if (A.pdHVal >= 0) { row[A.pdHVal] = p.pdHeight || 8; row[A.pdHUnit] = V.unitH || 'سنتيمترات'; }
  if (A.pdWVal >= 0) { row[A.pdWVal] = p.pdWidth || 50; row[A.pdWUnit] = V.unitW || 'سنتيمترات'; }
  if (A.capVal >= 0) { row[A.capVal] = p.capacity || 350; row[A.capUnit] = V.capUnit || 'ملليلترات'; }
  if (A.wv >= 0) { row[A.wv] = p.pWidth || 8; row[A.wu] = V.unitW || 'سنتيمترات'; }
  if (A.hv >= 0) { row[A.hv] = p.pHeight || 10; row[A.hu] = V.unitH || 'سنتيمترات'; }
  if (A.liquid >= 0) row[A.liquid] = p.liquid || 'لا';
  if (WRITE_UNIT_COUNT && A.unitCountVal >= 0) { row[A.unitCountVal] = p.unitCount || 1; row[A.unitCountType] = p.unitCountType || cfg.unitCountType || ucType; }
});

// remove instruction note row if it lands after our data
const wsNew = XLSX.utils.aoa_to_sheet(data);
// preserve column widths best-effort
wsNew['!cols'] = (ws['!cols'] || []).slice(0, attrRow.length);
wb.Sheets[SHEET] = wsNew;
const outWb = XLSX.utils.book_new();
for (const name of wb.SheetNames) XLSX.utils.book_append_sheet(outWb, wb.Sheets[name], name);
XLSX.writeFile(outWb, OUT, { bookType: 'xlsx' });
console.log('\nwritten:', OUT);

// verify
const check = XLSX.readFile(OUT);
const cd = XLSX.utils.sheet_to_json(check.Sheets[SHEET], { header: 1, blankrows: false, defval: '' });
for (let r = START; r < START + cfg.products.length; r++) {
  console.log('\nROW', r + 1, '=> sku=' + cd[r][A.sku] + ' | ptype=' + cd[r][A.ptype] + ' | title=' + String(cd[r][A.title]).slice(0, 50));
  console.log('  price=' + cd[r][A.price] + ' qty=' + cd[r][A.qty] + ' brand=' + cd[r][A.brand] + ' pidType=' + cd[r][A.pidType]);
  console.log('  mainImg=' + cd[r][A.mainImg]);
  console.log('  images=' + [0,1,2,3,4,5,6,7].map(k => cd[r][A.mainImg + k]).filter(Boolean).length);
}
