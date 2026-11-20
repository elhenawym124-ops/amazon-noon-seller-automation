const fs = require('fs');
const [,, src, base, prefix] = process.argv;
const j = JSON.parse(fs.readFileSync(src, 'utf8'));
const isAr = s => /[\u0600-\u06FF]/.test(s || '');
const latinCount = s => ((s || '').match(/[A-Za-z]/g) || []).length;
const score = p => {
  let s = 0;
  if (isAr(p.title)) s++;
  if (isAr(p.description)) s++;
  if ((p.bullets || []).some(b => isAr(b))) s++;
  return s;
};

function cleanAr(p) {
  const t = (p.title || '').replace(/\s+/g, ' ').trim();
  const needDesc = !isAr(p.description) || latinCount(p.description) > 12;
  const needBul = !p.bullets || p.bullets.length === 0 || p.bullets.some(b => !isAr(b) || latinCount(b) > 8);
  if (needDesc) {
    p.description = `${t}. منتج عملي مصمم للاستخدام اليومي داخل المنزل، بخامة مناسبة وتصميم يساعد على التنظيم وسهولة الاستخدام. مناسب للمطبخ والمنزل ولمختلف المهام اليومية، ويوفر حلًا بسيطًا وعمليًا يساعد على ترتيب المساحة واستخدامها بشكل أفضل.`;
  }
  if (needBul) {
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

const ar = [], en = [];
for (const p of j.products) {
  if (score(p) >= 2) ar.push(cleanAr(p)); else en.push(p);
}
fs.writeFileSync(base + '_ar.json', JSON.stringify({ ...j, products: ar }, null, 1), 'utf8');
fs.writeFileSync(base + '_en.json', JSON.stringify({ ...j, english: true, products: en }, null, 1), 'utf8');
console.log(prefix, 'ar', ar.length, 'en', en.length);
