const fs = require('fs');
const dir = 'H:/amzain/amz-upload';
const data = dir + '/data';
const merged = JSON.parse(fs.readFileSync(data + '/merged.json', 'utf8'));
const isAr = s => /[\u0600-\u06FF]/.test(s || '');
const latin = s => ((s || '').match(/[A-Za-z]/g) || []).length;

const groups = ['ORGANIZER', 'SHELF', 'BASKET', 'CONTAINER', 'SPICE', 'CLEANING', 'KITCHEN_MISC', 'BATHROOM'];
const doneAsins = new Set();
// already submitted ASINs (from earlier batches)
const doneFiles = ['products_org_ar.json', 'products_storage_ar.json', 'products_ar2.json'];
for (const f of doneFiles) {
  const p = dir + '/' + f;
  if (fs.existsSync(p)) {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const x of j.products) doneAsins.add(x.refAsin);
  }
}

const priceBy = new Map(merged.map(x => [x.asin, parseFloat(x.price) || 0]));
const pick = merged.filter(x => groups.includes(x.group) && isAr(x.title) && !doneAsins.has(x.asin));

const have = [], missing = [];
for (const x of pick) (fs.existsSync(`${data}/dp_${x.asin}.json`) ? have : missing).push(x);

console.log('candidates', pick.length, '| have data', have.length, '| missing data', missing.length);
console.log('MISSING:', JSON.stringify(missing.map(x => x.asin)));

function clean(p) {
  const t = (p.title || '').replace(/\s+/g, ' ').trim();
  if (!isAr(p.description) || latin(p.description) > 12) {
    p.description = `${t}. منتج عملي مصمم للاستخدام اليومي داخل المنزل، بخامة مناسبة وتصميم يساعد على التنظيم وسهولة الاستخدام، ومناسب للمطبخ والمنزل ولمختلف المهام اليومية.`;
  }
  if (!p.bullets || !p.bullets.length || p.bullets.some(b => !isAr(b) || latin(b) > 8)) {
    p.bullets = [
      'تصميم عملي مناسب للاستخدام اليومي داخل المنزل.',
      'يساعد على التنظيم وترتيب المساحة بشكل أفضل.',
      'خامة مناسبة تتحمل الاستخدام المتكرر.',
      'سهل الاستخدام والتنظيف.',
      'مناسب للمطبخ والمنزل ومختلف المهام اليومية.'
    ];
  }
  return p;
}

let n = 200;
const products = [];
for (const x of have) {
  const d = JSON.parse(fs.readFileSync(`${data}/dp_${x.asin}.json`, 'utf8'));
  let wg = 700;
  const m = (d.weight || '').match(/([\d.]+)\s*(kg|كجم|كيلو|g|جم|غرام)/i);
  if (m) wg = /kg|كجم|كيلو/i.test(m[2]) ? Math.round(parseFloat(m[1]) * 1000) : Math.round(parseFloat(m[1]));
  const sku = 'LVP-' + String(n++).padStart(3, '0');
  products.push(clean({
    sku,
    refAsin: x.asin,
    title: (d.title || x.title || '').slice(0, 200),
    price: Math.round((priceBy.get(x.asin) || 0) * 1.1 * 100) / 100,
    weightGrams: wg,
    modelName: sku,
    color: 'متعدد الألوان',
    description: d.desc || '',
    bullets: (d.bullets || []).filter(Boolean),
    images: [d.main, ...(d.imgs || [])].filter(Boolean).slice(0, 9)
  }));
}
fs.writeFileSync(dir + '/products_wave1.json', JSON.stringify({ productType: 'HOME_ORGANIZERS_AND_STORAGE', browseNode: '21863799031', quantity: 99, brand: 'Generic', products }, null, 1), 'utf8');
console.log('built', products.length);
