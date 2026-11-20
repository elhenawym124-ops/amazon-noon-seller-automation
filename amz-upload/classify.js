const fs = require('fs');
const path = require('path');

const dir = 'H:/amzain mina/amz-upload/data';
const readAll = (prefix, max = 24) => {
  const out = [];
  for (let i = 1; i <= max; i++) {
    const f = path.join(dir, `${prefix}_${i}.json`);
    if (fs.existsSync(f)) out.push(...JSON.parse(fs.readFileSync(f, 'utf8')));
  }
  return out;
};

const byAsin = new Map();
for (const p of ['page', 'asc', 'desc']) {
  for (const it of readAll(p)) if (it.asin && !byAsin.has(it.asin)) byAsin.set(it.asin, it);
}
const items = [...byAsin.values()];

// family rules (ordered, first match wins). Arabic + English keywords.
const rules = [
  ['مريلة|apron|مآزر', 'APRON'],
  ['ورق زبدة|زبدة|parchment|baking paper', 'BAKING_PAPER'],
  ['جوانتي|قفازات|قفاز|glove|silicone socks|socks', 'GLOVES'],
  ['فوط|فوطة|منشفة|مناديل|towel|wipe', 'TOWELS'],
  ['توابل|بهارات|spice', 'SPICE'],
  ['قضيب ستارة|ستارة|curtain', 'CURTAIN'],
  ['سجادة|سجاد|rug|carpet|موكيت|دعاسة|floor mat|floor mat', 'RUG'],
  ['مفرش|شرشف|ملاءة|غطاء سرير|وسادة|مخدة|bed sheet|pillow|bedding|لحاف', 'BEDDING'],
  ['مجات|مج |كوب|أكواب|mug|cup|glass|زجاجه عازله|شاليموه|straw', 'CUP'],
  ['أطباق|طبق|صحن|plate|dinner set', 'PLATE'],
  ['جريل|grill|حلة|طنجرة|مقلاة|صينية|طقم أواني|cookware|pot|pan|صواني|tray', 'COOKWARE'],
  ['مضرب|خلاط|عصارة|بلندر|blender|whisk|mixer|juicer|squeezer|مطحنة|فرامة|مفرمة|قطاعة|مبشرة|قشارة|chopper|grater|slicer|peeler|فتاحة|opener', 'KITCHEN_TOOL'],
  ['لوح تقطيع|cutting board|كيس كريمة|decorating bag|ملاعق|spoon|spatula|wooden spreader|whisk', 'KITCHEN_TOOL'],
  ['قالب ثلج|ice tray|ice cube|ثلج', 'ICE_TRAY'],
  ['ماكينة فشار|popcorn', 'POPCORN_MACHINE'],
  ['حافظة|علبة حفظ|container|food storage|برطمان|jar|علب سناكس|طقم حفظ طعام|عياشة|lunch bag|شنطة حرارية|insulated lunch', 'CONTAINER'],
  ['لمبة|إضاءة|light|lamp|led', 'LIGHT'],
  ['مرآة|مرايا|mirror', 'MIRROR'],
  ['ساعة|clock', 'CLOCK'],
  ['لعبة|ألعاب|toy', 'TOY'],
  ['ورد|زهور|زهرة|flower|نبات صناعي|plant', 'FLOWER'],
  ['موبايل|هاتف|phone|charger|cable|حامل جهاز|device stand|tablet', 'PHONE_ACC'],
  ['سلة|سلال|basket|bin|جردل|bucket', 'BASKET'],
  ['رف|أرفف|shelf|أرفف حائط|wall decor shelves|استاند|stands', 'SHELF'],
  ['خطاف|مسمار|hook|hanger|علاقة', 'HOOK'],
  ['صابون|منظف|cleaning|ممسحة|مساحة|شرشوبة|مكنسة|broom|mop|ممسحه', 'CLEANING'],
  ['سماعة دش|دش|حنفية|حمام|bathroom|شطاف|faucet|shower', 'BATHROOM'],
  ['كرسي|chair|ترابيزة|طاولة|table|desk|folding ladder|سلم|مقعد|stool', 'FURNITURE'],
  ['مرطب|humidifier|مروحة|fan|bug zapper|حشرات|appliance|جهاز', 'APPLIANCE'],
  ['عطر|معطر|perfume|fragrance|بخور|مبخرة|incense', 'FRAGRANCE'],
  ['منظم|تنظيم|organizer|storage|تخزين', 'ORGANIZER'],
  ['بخاخ|رشاش|spray|زجاجة|bottle', 'BOTTLE'],
  ['مصفاة|strainer|filter|sink', 'SINK'],
  ['كوستر|coaster|سفرة|dining', 'TABLE_LINEN'],
  ['مايوه|سباحة|ملابس|تيشيرت|shirt|فستان|dress|بنطلون', 'APPAREL'],
  ['فرش داخلي|بطانات|shoe|حذاء', 'SHOE_CARE'],
  ['عناية|بشرة|skin|beauty', 'PERSONAL_CARE'],
  ['ديكور|decor|ديكورية|decoration', 'DECOR'],
  ['مكتب|مكتبية|stationery|pen|قلم|دفتر', 'STATIONERY'],
  ['بيبي|أطفال|baby|kids|بوتي', 'BABY'],
  ['مطبخ|kitchen', 'KITCHEN_MISC']
];

const groups = new Map();
for (const it of items) {
  const t = (it.title || '');
  let g = 'UNCLASSIFIED';
  for (const [re, name] of rules) {
    if (new RegExp(re, 'i').test(t)) { g = name; break; }
  }
  it.group = g;
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push(it);
}

const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
console.log('total unique:', items.length);
console.log('\n=== GROUPS ===');
for (const [g, arr] of sorted) console.log(String(arr.length).padStart(4), g);

const un = groups.get('UNCLASSIFIED') || [];
console.log('\n=== UNCLASSIFIED (' + un.length + ') ===');
un.slice(0, 80).forEach(x => console.log('- ' + (x.title || '').slice(0, 95)));

fs.writeFileSync('H:/amzain mina/amz-upload/data/merged.json', JSON.stringify(items, null, 1), 'utf8');
console.log('\nsaved merged.json');
