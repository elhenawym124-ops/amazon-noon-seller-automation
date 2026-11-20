const fs = require('fs');
const dir = 'H:/amzain mina/amz-upload';
const merged = JSON.parse(fs.readFileSync(dir + '/data/merged.json', 'utf8'));
const isAr = s => /[\u0600-\u06FF]/.test(s || '');
const latin = s => ((s || '').match(/[A-Za-z]/g) || []).length;

const cfgFile = process.argv[2];
const cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
const priceBy = new Map(merged.map(x => [x.asin, parseFloat(x.price) || 0]));
const byAsin = new Map(merged.map(x => [x.asin, x]));

function fullImg(u) {
  if (!u) return '';
  return u.replace(/\._[A-Za-z0-9,_]+_\./, '._SL1500_.');
}

let n = cfg.startSku;
const products = [];
for (const asin of cfg.asins) {
  const m = byAsin.get(asin);
  if (!m) { console.log('MISSING', asin); continue; }
  const title = (m.title || '').replace(/\s+/g, ' ').trim().slice(0, 200);
  const sku = 'LVP-' + String(n++).padStart(3, '0');
  const price = Math.round((priceBy.get(asin) || 0) * 1.1 * 100) / 100;
  products.push({
    sku,
    refAsin: asin,
    title,
    price,
    weightGrams: cfg.defaultWeight || 500,
    modelName: sku,
    color: cfg.color || 'متعدد الألوان',
    description: `${title}. منتج عملي مصمم للاستخدام اليومي، بخامة مناسبة وتصميم يساعد على سهولة الاستخدام والتنظيف. مناسب للمطبخ والمنزل ولمختلف المهام اليومية، ويوفر حلًا بسيطًا وعمليًا يساعد على ترتيب المساحة واستخدامها بشكل أفضل.`,
    bullets: [
      'تصميم عملي مناسب للاستخدام اليومي.',
      'خامة مناسبة تتحمل الاستخدام المتكرر.',
      'سهل الاستخدام والتنظيف.',
      'مناسب للمطبخ والمنزل ومختلف المهام.',
      'مقاس عملي يناسب الاستخدام اليومي.'
    ],
    images: [fullImg(m.img)].filter(Boolean)
  });
}
const out = { productType: cfg.productType, browseNode: cfg.browseNode, quantity: 99, brand: 'Generic', products };
fs.writeFileSync(cfg.outFile, JSON.stringify(out, null, 1), 'utf8');
console.log('built', products.length, '->', cfg.outFile);
