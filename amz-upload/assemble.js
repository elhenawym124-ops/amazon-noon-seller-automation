const fs = require('fs');
const dataDir = 'H:/amzain mina/amz-upload/data';
const merged = JSON.parse(fs.readFileSync(dataDir + '/merged.json', 'utf8'));
const priceByAsin = new Map(merged.map(x => [x.asin, parseFloat(x.price) || 0]));

const cfgFile = process.argv[2];
const cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));

const isArabic = s => /[\u0600-\u06FF]/.test(s || '');
const products = [];
let n = cfg.startSku;
const english = [];

for (const asin of cfg.asins) {
  const f = `${dataDir}/dp_${asin}.json`;
  if (!fs.existsSync(f)) { console.log('MISSING', asin); continue; }
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  const base = priceByAsin.get(asin) || 0;
  const price = Math.round(base * 1.1 * 100) / 100;
  let wg = cfg.defaultWeight || 600;
  const m = (d.weight || '').match(/([\d.]+)\s*(kg|كجم|كيلو|g|جم|غرام)/i);
  if (m) wg = /kg|كجم|كيلو/i.test(m[2]) ? Math.round(parseFloat(m[1]) * 1000) : Math.round(parseFloat(m[1]));

  const ov = (cfg.overrides || {})[asin] || null;
  let title = ov ? ov.title : (d.title || '');
  let desc = ov ? ov.description : (d.desc || '');
  let bullets = ov ? ov.bullets : (d.bullets || []).filter(Boolean);

  const sku = 'LVP-' + String(n++).padStart(3, '0');

  if (!isArabic(title)) english.push({ asin, sku, title: title.slice(0, 80) });

  products.push({
    sku,
    refAsin: asin,
    title: title.slice(0, 200),
    price,
    weightGrams: wg,
    modelName: sku,
    color: cfg.color || 'متعدد الألوان',
    material: cfg.material || undefined,
    care: cfg.care || undefined,
    included: cfg.included || undefined,
    description: desc.slice(0, 1500),
    bullets: bullets.length ? bullets : [title.slice(0, 200)],
    images: [d.main, ...d.imgs].filter(Boolean).slice(0, 9)
  });
}

const out = { productType: cfg.productType, browseNode: cfg.browseNode, quantity: 20, brand: 'Generic', products };
fs.writeFileSync(cfg.outFile, JSON.stringify(out, null, 1), 'utf8');
console.log('products:', products.length, '| english titles:', english.length);
english.forEach(e => console.log('  EN', e.sku, e.asin, e.title));
