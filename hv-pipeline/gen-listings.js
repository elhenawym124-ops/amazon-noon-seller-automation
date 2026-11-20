// Turn the scraped candidates into Amazon listing records (Arabic) + classify by product type.
'use strict';
const fs = require('fs');
const path = require('path');

const OUT = __dirname;
const MIN_SELL = 60;
const cands = JSON.parse(fs.readFileSync(path.join(OUT, 'candidates.json'), 'utf8')).filter((c) => c.keep);

const TYPES = [
  { ptype: 'HOME_ORGANIZERS_AND_STORAGE', node: '21863799031', label: 'منظم وتخزين منزلي', re: /برطمان|برطمن|منظم|رف\b|استاند|ستاند|توابل|علب|صندوق|درج|تنظيم|ترتيب|شماعة|شماعه|خزانة|سلة|حامل|علبة|زجاجة زيت|دورق|صواني خشب/i },
  { ptype: 'KITCHEN_TOOLS', node: '21864567031', label: 'أداة مطبخ', re: /فرشا|فرشة|مقشرة|سكين|ملعقة|معلقة|مصفاة|هراشة|هراش|مكبس|مبشرة|ميزان|فتاحة|قطاعة|مضرب|شوكة|أدوات مطبخ/i },
  { ptype: 'DRINKING_CUP', node: '21864848031', label: 'كوب', re: /كوب|أكواب|اكواب|مج\b|ترمس|تيرموس|كوباية/i },
  { ptype: 'COOKWARE_SET', node: '51375954031', label: 'أدوات طهي', re: /براد|طقم حلل|حلة|طاسة|مقلاة|صينية|قدر|كاتيل|غلاية/i },
];

const JUNK = /بسعر|جنيه|جنية|العرض|الحقوا|خصم|بدلا من|بدلاً من|واتس|للطلب|شحن|كلمنا|استفسار|متاح الان|متوفر الان|سعر|الكمية محدودة/i;

function clean(s) {
  return String(s || '')
    .replace(/&(?:amp|lt|gt|quot|nbsp|#\d+|\s\d+);/gi, ' ')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}]/gu, ' ')
    .replace(/&/g, ' ')
    .replace(/[«»"'*_#]+/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}

function lines(text) {
  return clean(text).split('\n').map((l) => l.trim()).filter(Boolean);
}

// Fact extraction ----------------------------------------------------------
function facts(text) {
  const t = clean(text);
  const capacity = (() => {
    let m = t.match(/(\d+(?:[.,]\d+)?)\s*(?:مللي|مل|ملي|ml|ML)/);
    if (m) return { value: Number(String(m[1]).replace(',', '.')), unit: 'ملليلتر' };
    m = t.match(/(\d+(?:[.,]\d+)?)\s*(?:لتر|لترا|L\b)/);
    if (m) return { value: Number(String(m[1]).replace(',', '.')) * 1000, unit: 'ملليلتر' };
    return null;
  })();
  const dims = (() => {
    const out = [];
    const re = /(\d+(?:[.,]\d+)?)\s*(?:سم|سنتيمتر|cm)/g;
    let m;
    while ((m = re.exec(t))) out.push(Number(String(m[1]).replace(',', '.')));
    return out.length ? out.slice(0, 3) : null;
  })();
  const pieces = (() => {
    const m = t.match(/(?:طقم|مجموعة|مكون من|عدد)\s*(\d{1,3})/);
    if (m) return Number(m[1]);
    const m2 = t.match(/(\d{1,3})\s*(?:قطعة|برطمان|برطمن|كوب|علبة)/);
    return m2 ? Number(m2[1]) : null;
  })();
  const colors = ['بني', 'بيج', 'بينك', 'وردي', 'أزرق', 'ازرق', 'أحمر', 'احمر', 'أخضر', 'اخضر', 'أبيض', 'ابيض', 'أسود', 'اسود', 'ذهبي', 'فضي', 'رمادي', 'أصفر', 'اصفر', 'بني غامق', 'موف'];
  const color = colors.find((c) => new RegExp('(^|\\s)' + c + '(\\s|$|[،,.])').test(t)) || 'متعدد الألوان';
  return { capacity, dims, pieces, color };
}

function material(text) {
  const s = ' ' + clean(text) + ' ';
  if (/ستانلس|ستيل|مقاوم للصدأ/.test(s)) return 'ستانلس ستيل';
  if (/بورسلين|سيراميك|خزف/.test(s)) return 'سيراميك';
  if (/زجاج|كريستال/.test(s)) return 'زجاج';
  if (/بامبو|خشب|خشبي/.test(s)) return 'خشب';
  if (/أكريليك|اكريليك/.test(s)) return 'أكريليك';
  if (/سيليكون/.test(s)) return 'سيليكون';
  if (/معدن|حديد|نحاس|ألومنيوم|الومنيوم/.test(s)) return 'معدن';
  if (/قطن/.test(s)) return 'قطن';
  if (/بلاستيك|بولي|ميلامين|نايلون/.test(s)) return 'بلاستيك';
  return 'بلاستيك';
}

function classify(c) {
  const t = c.title + '\n' + c.text;
  for (const ty of TYPES) if (ty.re.test(t)) return ty;
  return null;
}

function pickTitle(c, type) {
  const NOUN = /برطمان|برطمن|براد|كوب|منظم|رف\b|استاند|ستاند|صندوق|علبة|علب|فرشاة|فرشة|زجاجة|دورق|هراشة|صينية|طاسة|حلة|مقلاة|شماعة|شماعه|سلة|حامل|طقم/;
  const ls = lines(c.text)
    .map((l) => l
      .replace(/[\u20E3\uFE0F]/g, '')
      .replace(/^[\s\d\u0660-\u0669]*[).\-–•*]+/g, '')
      .replace(/\s+/g, ' ')
      .trim())
    .filter((l) => l.length >= 6 && !JUNK.test(l));
  const scored = ls.map((l) => {
    let s = 0;
    if (NOUN.test(l)) s += 6;
    if (/طقم|مجموعة/.test(l)) s += 2;
    if (/^\d/.test(l)) s -= 4;
    if (/^(مكون|مكونه|سعة|سعه|مقاس|الوان|ألوان|متوفر|متاح|لو|عايز|بتحبي|ممكن|وصل|وصلت|الجديد|التريند|حصري|عرض|خصم|كل|دلوقتي|بجد)/.test(l)) s -= 6;
    if (l.length > 110) s -= 1;
    if (l.split(' ').length < 3) s -= 2;
    return { l, s };
  }).sort((a, b) => b.s - a.s);
  let title = (scored[0] && scored[0].s > 0 ? scored[0].l : c.title).replace(/\s+/g, ' ');
  if (title.length > 120) title = title.slice(0, 120);
  return `${title} - ${type.label} عملي للمنزل والمطبخ`;
}

function bullets(c, f, type) {
  const ls = lines(c.text).filter((l) => l.length >= 12 && !JUNK.test(l));
  const out = [];
  for (const l of ls) {
    const b = l.replace(/^[-•✔✓*\d.)\s]+/, '').trim();
    if (b.length < 12) continue;
    if (out.some((x) => x.slice(0, 25) === b.slice(0, 25))) continue;
    out.push(b.slice(0, 220));
    if (out.length === 5) break;
  }
  while (out.length < 5) {
    const fillers = [
      `تصميم ${type.label} يجمع بين الشكل الأنيق والاستخدام اليومي السهل`,
      'خامات متينة تدوم مع الاستخدام المتكرر وتحافظ على مظهرها',
      'حجم مناسب يناسب المساحات الصغيرة ويوفر مساحة أكبر في المنزل',
      'سهل التنظيف والاستخدام، ويحافظ على ترتيب المكان',
      'هدية عملية ومناسبة للاستخدام الشخصي أو للإهداء',
    ];
    out.push(fillers[out.length]);
  }
  return out.slice(0, 5);
}

function description(c, f, type) {
  const ls = lines(c.text).filter((l) => l.length >= 15 && !JUNK.test(l)).slice(0, 9);
  const intro = `${type.label} من ${material(c.text)} بتصميم عملي يناسب الاستخدام اليومي في المنزل والمطبخ.`;
  const specs = [];
  if (f.capacity) specs.push(`السعة ${f.capacity.value} ${f.capacity.unit}`);
  if (f.dims) specs.push(`المقاسات ${f.dims.join(' × ')} سم`);
  if (f.pieces) specs.push(`عدد القطع ${f.pieces}`);
  const body = ls.join(' ');
  return `${intro}${specs.length ? ' ' + specs.join('، ') + '.' : ''} ${body}`.replace(/\s+/g, ' ').slice(0, 1900);
}

// -------------------------------------------------------------------------
const listings = [];
const skipped = [];
let seq = 0;
for (const c of cands) {
  const type = classify(c);
  if (!type) { skipped.push({ title: c.title, reason: 'no product type match', source: c.source }); continue; }
  if (!c.images.length) { skipped.push({ title: c.title, reason: 'no images', source: c.source }); continue; }
  seq += 1;
  const f = facts(c.text);
  const sku = 'HV-' + String(seq).padStart(3, '0');
  listings.push({
    sku,
    productType: type.ptype,
    browseNode: type.node,
    title: pickTitle(c, type),
    price: c.sell,
    images: c.images.slice(0, 8),
    description: description(c, f, type),
    bullets: bullets(c, f, type),
    material: material(c.text),
    color: f.color,
    capacity: f.capacity ? f.capacity.value : null,
    dims: f.dims,
    pieces: f.pieces,
    weightGrams: 700,
    modelName: sku,
    source: c.source,
    sourceUrl: c.url,
    cost: c.cost,
  });
}

fs.writeFileSync(path.join(OUT, 'listings.json'), JSON.stringify(listings, null, 1), 'utf8');
fs.writeFileSync(path.join(OUT, 'skipped.json'), JSON.stringify(skipped, null, 1), 'utf8');

const byType = {};
listings.forEach((l) => { byType[l.productType] = (byType[l.productType] || 0) + 1; });
console.log('listings:', listings.length, '| skipped:', skipped.length);
console.log('by type:', JSON.stringify(byType, null, 1));
console.log('\nsample listings:');
listings.slice(0, 3).forEach((l) => {
  console.log('\n---', l.sku, l.productType, '| price', l.price, '| imgs', l.images.length, '|', l.material, l.color);
  console.log('TITLE:', l.title);
  console.log('BULLET1:', l.bullets[0]);
  console.log('DESC:', l.description.slice(0, 180));
});
