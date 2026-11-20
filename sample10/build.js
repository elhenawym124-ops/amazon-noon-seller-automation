const fs = require('fs');
const path = require('path');

const base = 'https://m.media-amazon.com/images/I/';
const products = [
  {
    asin: 'B0HJT6VBD7',
    title: 'مريلة مطبخ قطن دانتيل – مريلة مريحة بجيب كبير وتصميم فراشة ودرابية جانبية برسمة ورد KH',
    price: 135.00,
    imgs: ['71c8jNfLmkL','41JEMAnLQCL','41Ytu0oe33L','51QxhPP0PUL','41-iU66cQkL','41Ys-UuY8gL']
  },
  {
    asin: 'B0HJJHSCTL',
    title: 'رول ورق زبدة صحي مستورد عالي الجودة – ورق للخبز ومنع التصاق الكيك والحلويات وتحضير السندوتشات كود C، 30سم*10متر',
    price: 153.00,
    imgs: ['514c-rbtFoL','61sfd1b59EL','617OmnPaijL','71xVKB9ubHL','51ej0xr0NKL']
  },
  {
    asin: 'B0HJT7LJYV',
    title: 'جوانتي غسيل سيليكون 30 قطعة – قفازات مطاطية مقاومة للقطع لغسيل المواعين وتقطيع الخضروات والفواكه KH',
    price: 202.50,
    imgs: ['61Cf0D7AK+L','412dPZgfIvL','41JW2DxGY7L','31eR1qtQaOL']
  },
  {
    asin: 'B0HJST8D46',
    title: 'رول فوط تنشيف فائقة الامتصاص – فوط مطبخ قابلة للغسل وإعادة الاستخدام للماء والزيوت وتلميع الزجاج KH',
    price: 198.00,
    imgs: ['71c8PedNsjL','51tUJwuCIrL','415Ad5U5roL','41AKiJdYnZL','51rsthddW+L','51kYPMwcUlL']
  },
  {
    asin: 'B0HHSK55WF',
    title: 'مريلة مطبخ بتصميم فستان عصري ومبتكر مع جيبين أماميين | مريلة طهي عملية للمطبخ والمنزل – مستلزمات الطبخ وتحضير الطعام (N)',
    price: 171.00,
    imgs: ['71nIcWP7ECL','41ns-JxgAnL','51L1EwjqKpL','51VhBxqWRFL','61VTNnVbzML','61g9PnlIYeL','51OGCDb09KL','41rFLUdPiNL']
  },
  {
    asin: 'B0HHY5743R',
    title: 'Long and Shortened Curtain Rod - Multi-Use Curtain Hanging Rod for Drapery and Laundry Spreading Without Need to Drill Walls Suitable for Walls (W), 70cm',
    price: 198.00,
    imgs: ['21WdcXI+NyL','41Dpj1iaFZL','31NI1CWQXnL','41v2E-OrGcL','51L4SVmSBWL']
  },
  {
    asin: 'B0HJSPJLWF',
    title: 'منظم برطمانات البهارات والتوابل للمطبخ – استاند خشب بامبو لترتيب عبوات التوابل واستغلال مساحة سطح المطبخ KH',
    price: 378.00,
    imgs: ['7142b1nF5WL','41FZjujZIBL','41L4u6vLW2L','41saGwzW5HL','61orLQLlTPL','51qXIFllqjL']
  },
  {
    asin: 'B0HM9MLFRZ',
    title: '9 Large Compartments Hanging Closet Organizer for Shoes, Socks, Scarves, Clothes and Small Items – AM',
    price: 220.50,
    imgs: ['81Ka4Rv-u1L','41HiTiH16vL','51wmZ6cz9jL','61EpirTaQ6L','61tUGDTNZtL','519KjANeOCL']
  },
  {
    asin: 'B0HHLD144N',
    title: 'Artificial Flowers for Home Office 5 Different Colors for Indoor Arrangement Natural Look Decoration Gift (W), Pink',
    price: 198.00,
    imgs: ['71WvrSjOIYL','41ucezfAq2L','41B6LN2OhhL','41wvXdpGCjL']
  },
  {
    asin: 'B0HHPKQ5BG',
    title: 'Car Phone Holder - Strong Stable Clip Phone Holder Mount for Dashboard, Mirror, Sun Visor, 360 Degree Rotation, Easy to Install Suitable for Various Size Phones (W)',
    price: 157.50,
    imgs: ['4117i9DnouL','31fBvrOEVCL','4128ugpr1JL','51gpLy5xfML','51t3gDOezFL']
  }
];

// Proposed new image order (0-based indexes of the current gallery).
// Rule: keep the compliant white-background main image first, then bring an in-use / lifestyle shot to position 2.
const orders = {
  'B0HJT6VBD7': [0,1,2,3,4,5],
  'B0HJJHSCTL': [0,1,3,4,2,5],
  'B0HJT7LJYV': [0,2,3,1],
  'B0HJST8D46': [0,3,4,5,1,2],
  'B0HHSK55WF': [0,3,4,6,1,2,5,7],
  'B0HHY5743R': [0,1,3,2,4],
  'B0HJSPJLWF': [0,1,2,3,5,4],
  'B0HM9MLFRZ': [0,3,1,2,4,5],
  'B0HHLD144N': [0,1,3,2],
  'B0HHPKQ5BG': [0,1,2,4,3]
};

const rows = products.map((p, i) => {
  const newPrice = +(p.price * 1.1).toFixed(2);
  const sku = 'LVP-' + String(i + 1).padStart(3, '0');
  const urls = p.imgs.map(id => base + id + '._SL1500_.jpg');
  const order = orders[p.asin] || p.imgs.map((_, k) => k);
  const newUrls = order.map(k => urls[k]);
  return { ...p, sku, newPrice, urls, newUrls, order, listPrice: +(p.price / 0.9).toFixed(2) };
});

// CSV (working sheet for the sample)
const header = ['SKU','ASIN','Product Title','Current Price (EGP)','New Price x1.1 (EGP)','Main Image (new)','Other Image 1','Other Image 2','Other Image 3','Other Image 4','Other Image 5','Other Image 6','Other Image 7','Proposed Order (old numbers)','Image Count','Notes'];
const csvLines = [header];
for (const r of rows) {
  const others = r.newUrls.slice(1);
  const pad = Array.from({length: 7}, (_, k) => others[k] || '');
  const orderLabel = r.order.map(k => k + 1).join(' → ');
  csvLines.push([
    r.sku, r.asin, r.title, r.price.toFixed(2), r.newPrice.toFixed(2),
    r.newUrls[0], ...pad, orderLabel, r.urls.length, 'Price x1.1; image order proposed (white-bg main kept)'
  ]);
}
const csv = '\uFEFF' + csvLines.map(line => line.map(v => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}).join(',')).join('\r\n');
fs.writeFileSync(path.join(__dirname, 'sample10.csv'), csv, 'utf8');

// Visual preview
const cards = rows.map((r, i) => `
  <section class="card">
    <div class="head">
      <div class="num">${i + 1}</div>
      <div class="info">
        <h2>${r.title}</h2>
        <div class="meta"><span>ASIN: ${r.asin}</span><span>SKU: ${r.sku}</span><span>عدد الصور: ${r.urls.length}</span></div>
      </div>
      <div class="prices">
        <div class="old">الحالي: ${r.price.toFixed(2)} EGP</div>
        <div class="new">×1.1 ← ${r.newPrice.toFixed(2)} EGP</div>
        <div class="list">سعر القائمة الأصلي: ${r.listPrice.toFixed(2)} EGP</div>
      </div>
    </div>
    <div class="gallery">
      ${r.newUrls.map((u, k) => {
        const oldPos = r.urls.indexOf(u) + 1;
        const changed = oldPos !== k + 1;
        return `<figure class="${k === 0 ? 'main' : ''}"><img src="${u}"><figcaption>${k + 1}${k === 0 ? ' · الرئيسية' : ''}${changed ? ` <span class="oldpos">(قديم ${oldPos})</span>` : ''}</figcaption></figure>`;
      }).join('')}
    </div>
    <div class="orderline">الترتيب الحالي: ${r.urls.map((_, k) => k + 1).join(' → ')} &nbsp;|&nbsp; <b>المقترح: ${r.order.map(k => k + 1).join(' → ')}</b></div>
  </section>`).join('');

const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>عينة 10 منتجات – Level - up / Takhayl</title>
<style>
  :root { --bg:#0f1115; --card:#181b22; --line:#2a2f3a; --text:#e8eaed; --muted:#9aa3b2; --green:#1f9d55; --amber:#f5a623; --blue:#4a9eff; }
  * { box-sizing: border-box; }
  body { margin:0; padding:28px; background:var(--bg); color:var(--text); font-family:"Segoe UI", Tahoma, sans-serif; }
  header.top { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:1px solid var(--line); padding-bottom:16px; margin-bottom:20px; }
  h1 { margin:0; font-size:22px; }
  .sub { color:var(--muted); font-size:13px; margin-top:6px; }
  .badge { background:#1e2733; border:1px solid #2f3d4f; color:#9fc3ef; padding:6px 12px; border-radius:999px; font-size:12px; }
  .note { background:#1a1f27; border:1px solid var(--line); border-right:4px solid var(--amber); padding:12px 14px; border-radius:10px; font-size:13px; color:#d9dde5; margin-bottom:20px; line-height:1.8; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:16px; margin-bottom:18px; }
  .head { display:flex; gap:14px; align-items:flex-start; }
  .num { width:34px; height:34px; flex:0 0 34px; border-radius:10px; background:#232a35; display:flex; align-items:center; justify-content:center; font-weight:700; color:#9fc3ef; }
  .info { flex:1; }
  .info h2 { margin:0 0 8px; font-size:15px; line-height:1.6; font-weight:600; }
  .meta { display:flex; flex-wrap:wrap; gap:14px; color:var(--muted); font-size:12px; }
  .prices { text-align:left; min-width:210px; font-size:12px; line-height:1.9; }
  .old { color:var(--muted); text-decoration:line-through; }
  .new { color:#5fd38d; font-weight:700; font-size:14px; }
  .list { color:#6b7382; }
  .gallery { display:flex; flex-wrap:wrap; gap:10px; margin-top:14px; }
  figure { margin:0; background:#11141a; border:1px solid var(--line); border-radius:10px; padding:8px; width:150px; }
  figure.main { border-color:var(--green); box-shadow:0 0 0 1px var(--green) inset; }
  figure img { width:100%; height:150px; object-fit:contain; display:block; background:#fff; border-radius:6px; }
  figcaption { text-align:center; font-size:12px; color:var(--muted); padding-top:6px; }
  figure.main figcaption { color:#5fd38d; font-weight:700; }
  .oldpos { color:#f5a623; font-weight:400; }
  .orderline { margin-top:10px; font-size:12px; color:var(--muted); }
  .orderline b { color:#9fc3ef; }
  footer { color:var(--muted); font-size:12px; text-align:center; margin-top:26px; }
</style>
</head>
<body>
<header class="top">
  <div>
    <h1>عينة 10 منتجات — متجر Takhayl. (أمازون مصر)</h1>
    <div class="sub">مصدر البيانات: صفحة المتجر العامة + صفحات المنتجات · تم التجميع بتاريخ 2026-11-09</div>
  </div>
  <div class="badge">حساب: Level - up · Egypt</div>
</header>
<div class="note">
  <b>ملاحظة مهمة عن السعر:</b> الأسعار الحالية داخل عرض 11.11 وهي أصلًا أقل 10% من سعر القائمة (مثال: 135 = 150 × 0.9). الضرب في 1.1 يرجّعها لسعر القائمة تقريبًا، يعني مش زيادة صافية 10% فوق سعرك الأساسي. لو المطلوب زيادة حقيقية 10% فوق سعر القائمة، السعر الجديد = السعر الحالي × 1.2222.
</div>
${cards}
<footer>عينة تجريبية — لم يتم رفع أي تعديل على Seller Central.</footer>
</body>
</html>`;
fs.writeFileSync(path.join(__dirname, 'preview.html'), html, 'utf8');

console.log('OK', rows.length, 'products');
console.log(rows.map(r => `${r.asin} | ${r.price} -> ${r.newPrice}`).join('\n'));
