const fs = require('fs');
const dataDir = 'H:/amzain/amz-upload/data';
const merged = JSON.parse(fs.readFileSync(dataDir + '/merged.json', 'utf8'));
const priceByAsin = new Map(merged.map(x => [x.asin, parseFloat(x.price) || 0]));

const asins = ["B0HPGTHF21","B0HPBBQRGG","B0HP82PJ41","B0HM58XDZF","B0HM4WXTBV","B0HL5BBDVS","B0HL3S2P1M","B0HHTN81CX","B0HKTCTKRR","B0HJYY2CGL","B0HL5HY5W6","B0HHKKYB1L","B0HL5DZGNM","B0HL5CL9B3"];

const overrides = {
  "B0HPBBQRGG": {
    title: "مقلاة واسعة 34 سم – مقلاة للقلي والطهي اليومي للاستخدام المنزلي",
    description: "مقلاة واسعة بقطر 34 سم مناسبة للقلي والطهي اليومي داخل المطبخ. تصميم عملي يوزع الحرارة بشكل مناسب ويسهل تحضير مختلف الوصفات اليومية. مقاس 34 سم: مساحة واسعة لطهي كميات مناسبة. تصميم عملي: مناسب للقلي وتقليب الطعام. للاستخدام اليومي: مناسب لمختلف الوصفات المنزلية. سهلة الاستخدام: مناسبة للطهي والتقديم.",
    bullets: ["مقلاة واسعة بقطر 34 سم.", "مناسبة للقلي والطهي اليومي.", "توزيع مناسب للحرارة أثناء الطهي.", "عملية للاستخدام المنزلي.", "تناسب مختلف الوصفات اليومية."]
  },
  "B0HP82PJ41": {
    title: "مقلاة واسعة 34 سم – مقلاة قلي وطهي للاستخدام اليومي",
    description: "مقلاة واسعة بقطر 34 سم مصممة للقلي والطهي اليومي. توفر مساحة مناسبة لتحضير الوجبات والوصفات المنزلية مع تصميم عملي سهل الاستخدام. مقاس 34 سم: مساحة واسعة للطهي. تصميم عملي: للقلي وتقليب الطعام. استخدام يومي: مناسب للوصفات المنزلية. سهل التنظيف والاستخدام.",
    bullets: ["مقلاة واسعة 34 سم.", "للقي والطهي اليومي.", "مساحة مناسبة لتحضير الوجبات.", "تصميم عملي سهل الاستخدام.", "مناسبة للوصفات المنزلية."]
  },
  "B0HM58XDZF": {
    title: "طقم مقلاة مانعة للالتصاق 3 قطع بأحجام مختلفة – للطهي والقلي اليومي",
    description: "طقم مقلاة مانعة للالتصاق مكوّن من 3 قطع بأحجام مختلفة، مناسب للطهي والقلي وتحضير الوجبات اليومية. تصميم عملي يوفر أحجامًا متعددة تناسب مختلف احتياجات المطبخ. 3 أحجام مختلفة: مرونة في الطهي حسب حجم الوصفة. طبقة مانعة للالتصاق: تسهل الطهي والتنظيف. تصميم عملي: مناسب للاستخدام اليومي. طقم متكامل: يغطي احتياجات المطبخ الأساسية.",
    bullets: ["طقم من 3 مقلاة بأحجام مختلفة.", "طبقة مانعة للالتصاق لتسهيل الطهي والتنظيف.", "مناسبة للقلي والطهي اليومي.", "أحجام متعددة تناسب مختلف الوصفات.", "تصميم عملي للمطبخ المنزلي."]
  },
  "B0HM4WXTBV": {
    title: "طقم مقلاة مانعة للالتصاق 3 قطع متعددة المقاسات – للطهي والقلي",
    description: "طقم مقلاة مانعة للالتصاق من 3 قطع بمقاسات متعددة، مناسب للطهي والقلي وتحضير الوجبات. يوفر الطقم أحجامًا مختلفة تناسب مختلف أنواع الطعام والوصفات اليومية. 3 قطع متعددة المقاسات: تناسب احتياجات الطهي المختلفة. مانعة للالتصاق: تسهل استخدام الطعام وتقلل الالتصاق. مناسبة للاستخدام اليومي: للقلي والطهي. سهلة التنظيف والاستخدام.",
    bullets: ["طقم 3 مقلاة بمقاسات متعددة.", "طبقة مانعة للالتصاق.", "مناسبة للقلي والطهي اليومي.", "أحجام مختلفة لاحتياجات متنوعة.", "سهلة الاستخدام والتنظيف."]
  },
  "B0HHKKYB1L": {
    title: "مقلاة بمقبضين مع عازل حراري وتوزيع متساوي للحرارة – مثالية للطهي",
    description: "مقلاة بمقبضين مع عازل حراري وتوزيع متساوي للحرارة، مناسبة لمختلف مهام الطهي داخل المطبخ. يوفر المقبضان ثباتًا أثناء الحمل والتقليب، مع تصميم يساعد على توزيع الحرارة بشكل متساوٍ. مقبضان مع عازل: حمل ثابت وأكثر أمانًا. توزيع متساوي للحرارة: يساعد على طهي متوازن. تصميم عملي: للطهي والتقديم. مناسبة للاستخدام اليومي.",
    bullets: ["مقلاة بمقبضين لعملية حمل أسهل.", "عازل حراري على المقابض.", "توزيع متساوي للحرارة أثناء الطهي.", "تصميم عملي للطهي والتقديم.", "مناسبة للاستخدام اليومي."]
  }
};

const products = [];
let n = 27;
for (const asin of asins) {
  const f = `${dataDir}/dp_${asin}.json`;
  if (!fs.existsSync(f)) { console.log('MISSING', asin); continue; }
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  const base = priceByAsin.get(asin) || 0;
  const price = Math.round(base * 1.1 * 100) / 100;
  let wg = 800;
  const m = (d.weight || '').match(/([\d.]+)\s*(kg|كجم|كيلو|g|جم|غرام)/i);
  if (m) wg = /kg|كجم|كيلو/i.test(m[2]) ? Math.round(parseFloat(m[1]) * 1000) : Math.round(parseFloat(m[1]));
  const ov = overrides[asin] || null;
  const bullets = ov ? ov.bullets : (d.bullets || []).filter(Boolean);
  const sku = 'LVP-' + String(n++).padStart(3, '0');
  products.push({
    sku,
    refAsin: asin,
    title: (ov ? ov.title : d.title || '').slice(0, 200),
    price,
    weightGrams: wg,
    modelName: sku,
    color: 'أسود',
    material: 'معدن',
    description: (ov ? ov.description : d.desc || '').slice(0, 1500),
    bullets: bullets.length ? bullets : [(d.title || '').slice(0, 200)],
    images: [d.main, ...d.imgs].filter(Boolean).slice(0, 9)
  });
}

const cfg = { productType: 'SAUTE_FRY_PAN', browseNode: '21864422031', quantity: 20, brand: 'Generic', products };
fs.writeFileSync('H:/amzain/amz-upload/products_pan.json', JSON.stringify(cfg, null, 1), 'utf8');
console.log('products:', products.length);
products.forEach(p => console.log(p.sku, p.refAsin, p.price, '| imgs', p.images.length, '|', p.title.slice(0, 45)));
