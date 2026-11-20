const fs = require('fs');

const items = JSON.parse(fs.readFileSync('H:/amzain mina/amz-upload/data/merged.json', 'utf8'));

const typeLabel = {
  APRON: ['مآزر مطبخ', 'Apron Smock'],
  COOKWARE: ['أواني وصواني وطهي', 'Cookware / Baking Pan'],
  ORGANIZER: ['منظمات', 'Storage Organizer'],
  CUP: ['أكواب ومجات وزجاج', 'Drinkware / Mug'],
  KITCHEN_TOOL: ['أدوات مطبخ (خلاط/قطاعة/مبشرة)', 'Kitchen Tool'],
  FURNITURE: ['أثاث وطاولات وكراسي وسلم', 'Furniture'],
  CONTAINER: ['حفظ وتخزين طعام', 'Food Container'],
  SPICE: ['توابل وبهارات', 'Spice Rack / Spice'],
  CLEANING: ['تنظيف وممسحات', 'Cleaning Tool'],
  BASKET: ['سلال وجرادل', 'Basket'],
  SHELF: ['أرفف وحوامل', 'Shelf / Rack'],
  BATHROOM: ['أدوات حمام', 'Bathroom Accessory'],
  PLATE: ['أطباق وصحون', 'Dinnerware'],
  TOWELS: ['فوط ومناشف', 'Kitchen Towel'],
  BOTTLE: ['زجاجات وبخاخات', 'Bottle'],
  GLOVES: ['جوانتيات وقفازات', 'Glove'],
  FLOWER: ['زهور ونباتات صناعية', 'Artificial Flower'],
  KITCHEN_MISC: ['متنوع مطبخ', 'Kitchen (generic)'],
  BAKING_PAPER: ['ورق زبدة وخبز', 'Baking Paper'],
  HOOK: ['خطافات وتعليق', 'Hook'],
  SINK: ['أدوات الحوض', 'Sink Accessory'],
  RUG: ['سجاد ودعاسات', 'Rug / Mat'],
  LIGHT: ['إضاءة', 'Light'],
  STATIONERY: ['أدوات مكتبية', 'Stationery'],
  TABLE_LINEN: ['كوستر ومفارش سفرة', 'Table Linen'],
  ICE_TRAY: ['قوالب ثلج', 'Ice Tray'],
  PHONE_ACC: ['ملحقات موبايل وتابلت', 'Phone Accessory'],
  APPLIANCE: ['أجهزة صغيرة', 'Small Appliance'],
  CLOCK: ['ساعات', 'Clock'],
  FRAGRANCE: ['عطور وبخور', 'Fragrance'],
  CURTAIN: ['ستائر', 'Curtain'],
  MIRROR: ['مرايا', 'Mirror'],
  POPCORN_MACHINE: ['ماكينات فشار', 'Popcorn Machine'],
  BEDDING: ['مفارش سرير', 'Bedding'],
  SHOE_CARE: ['عناية بالأحذية', 'Shoe Care'],
  PERSONAL_CARE: ['عناية شخصية', 'Personal Care'],
  UNCLASSIFIED: ['غير مصنّف — يحتاج مراجعة', 'TBD']
};

const groups = new Map();
for (const it of items) {
  if (!groups.has(it.group)) groups.set(it.group, []);
  groups.get(it.group).push(it);
}

const batches = [...groups.entries()]
  .map(([g, arr], i) => ({
    group: g,
    nameAr: (typeLabel[g] || [g, g])[0],
    typeGuess: (typeLabel[g] || [g, g])[1],
    count: arr.length,
    items: arr.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0))
  }))
  .filter(b => b.group !== 'APRON')
  .sort((a, b) => b.count - a.count);

const apron = groups.get('APRON') || [];

// CSV
const rows = [['Batch', 'Group', 'Suggested Product Type', 'ASIN', 'Title', 'Current Price EGP', 'New Price x1.1', 'Main Image']];
for (const b of batches) {
  for (const it of b.items) {
    const p = parseFloat(it.price) || 0;
    rows.push([b.nameAr, b.group, b.typeGuess, it.asin, (it.title || '').replace(/"/g, "'"), p ? p.toFixed(2) : '', p ? (p * 1.1).toFixed(2) : '', it.img || '']);
  }
}
const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
fs.writeFileSync('H:/amzain mina/amz-upload/BATCH_PLAN.csv', '\ufeff' + csv, 'utf8');

// HTML
const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<title>خطة دفعات Level - up / Takhayl</title>
<style>
body{font-family:"Segoe UI",Tahoma,sans-serif;background:#f5f6f8;color:#111;margin:0;padding:24px}
h1{font-size:22px;margin:0 0 6px}
.sub{color:#666;font-size:13px;margin-bottom:18px}
table{width:100%;border-collapse:collapse;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.08);border-radius:8px;overflow:hidden}
th,td{padding:9px 12px;font-size:13px;border-bottom:1px solid #eee;text-align:right}
th{background:#0f766e;color:#fff;font-weight:600}
tr:hover td{background:#fafafa}
.badge{display:inline-block;background:#e6f4f1;color:#0f766e;border-radius:12px;padding:2px 10px;font-size:12px}
details{margin:10px 0;background:#fff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
summary{cursor:pointer;padding:10px 14px;font-weight:600}
ol{margin:0;padding:0 34px 14px 0;font-size:12.5px;color:#333}
li{margin:4px 0}
.total{font-weight:700}
</style></head><body>
<h1>خطة الدفعات — 499 منتج من متجر Takhayl</h1>
<div class="sub">كل دفعة = نوع منتج واحد = نموذج رفع واحد. السعر الجديد = السعر الحالي × 1.1 — المخزون: متاح دائمًا.</div>
<table>
<thead><tr><th>#</th><th>الدفعة</th><th>نوع المنتج المقترح</th><th>عدد المنتجات</th><th>أقل سعر</th><th>أعلى سعر</th></tr></thead><tbody>`;

const priceRange = arr => {
  const ps = arr.map(x => parseFloat(x.price)).filter(n => n > 0);
  if (!ps.length) return ['-', '-'];
  return [Math.min(...ps).toFixed(2), Math.max(...ps).toFixed(2)];
};

if (apron.length) {
  const [lo, hi] = priceRange(apron);
  html += `<tr style="background:#f0fdfa"><td>0</td><td><span class="badge">تم جزئياً ✅</span> ${esc((typeLabel.APRON)[0])}</td><td>${esc(typeLabel.APRON[1])}</td><td class="total">${apron.length} (تم 2)</td><td>${lo}</td><td>${hi}</td></tr>`;
}
batches.forEach((b, i) => {
  const [lo, hi] = priceRange(b.items);
  html += `<tr><td>${i + 1}</td><td>${esc(b.nameAr)}</td><td>${esc(b.typeGuess)}</td><td class="total">${b.count}</td><td>${lo}</td><td>${hi}</td></tr>`;
});
html += `</tbody></table><h2 style="font-size:16px;margin:22px 0 6px">تفاصيل كل دفعة</h2>`;
if (apron.length) {
  html += `<details open><summary>المرحلة 0 — ${esc(typeLabel.APRON[0])} (${apron.length})</summary><ol>`;
  apron.forEach(it => html += `<li>${esc(it.title)} <span style="color:#888">— ${it.price || '-'} ج.م</span></li>`);
  html += `</ol></details>`;
}
batches.forEach((b, i) => {
  html += `<details><summary>الدفعة ${i + 1} — ${esc(b.nameAr)} (${b.count})</summary><ol>`;
  b.items.forEach(it => html += `<li>${esc(it.title)} <span style="color:#888">— ${it.price || '-'} ج.م</span></li>`);
  html += `</ol></details>`;
});
html += `</body></html>`;
fs.writeFileSync('H:/amzain mina/amz-upload/BATCH_PLAN.html', html, 'utf8');

console.log('total products:', items.length);
console.log('apron batch:', apron.length);
console.log('other batches:', batches.length);
console.log('\n' + batches.map((b, i) => `${i + 1}. ${b.nameAr} (${b.group}) = ${b.count}`).join('\n'));
console.log('\nwrote BATCH_PLAN.csv + BATCH_PLAN.html');
