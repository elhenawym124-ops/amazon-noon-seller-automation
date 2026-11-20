// Build the candidate list from both suppliers and apply the HomeVista pricing rules.
//   sell price = round(source price * 2) ; anything below 60 EGP is dropped.
'use strict';
const fs = require('fs');
const path = require('path');

const OUT = __dirname;
const tg = JSON.parse(fs.readFileSync(path.join(OUT, 'telegram-posts.json'), 'utf8'));
const el = JSON.parse(fs.readFileSync(path.join(OUT, 'elbatal-products.json'), 'utf8'));

const MIN_SELL = 60;
const MULT = 2;

function stripEmoji(s) {
  return String(s || '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu, ' ')
    .replace(/[«»"'*_#]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function arabicPrice(text) {
  // collect price-ish numbers in EGP
  const t = text.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const found = [];
  const re = /(?:بسعر|السعر|سعر|بـ|فقط|جنيه|ج\s*\.?\s*م|EGP)\s*[:\-]?\s*(\d{2,6})/gi;
  let m;
  while ((m = re.exec(t))) found.push(Number(m[1]));
  const re2 = /(\d{2,6})\s*(?:جنيه|ج\s*\.?\s*م|جنية|جنيها|ج\b)\b/gi;
  while ((m = re2.exec(t))) found.push(Number(m[1]));
  if (!found.length) return null;
  // The advertised (cash) price is normally the smallest of the "was/now" pair.
  return Math.min(...found);
}

function firstTitleLine(text) {
  const lines = text.split('\n').map((l) => stripEmoji(l)).filter(Boolean);
  const good = lines.filter((l) => l.length >= 6 && /[\u0600-\u06FFa-zA-Z]{4,}/.test(l) && !/^(الحق|عرض|عر|بسعر|السعر|متوفر|الجديد|كلمنا|للطلب|واتس)/.test(l));
  return (good[0] || lines[0] || '').slice(0, 120);
}

const cands = [];
const seen = new Set();

// ---------- Telegram ----------
// In the web preview an album is split into single-media messages; the caption
// sits on one of them and the neighbours carry the photos -> gather them.
const tgIndexByCh = new Map();
tg.forEach((p, i) => {
  if (!tgIndexByCh.has(p.channel)) tgIndexByCh.set(p.channel, []);
  tgIndexByCh.get(p.channel).push(i);
});
function albumPhotos(i) {
  const p = tg[i];
  const out = [];
  const push = (u) => { if (u && !out.includes(u)) out.push(u); };
  (p.photos || []).forEach(push);
  const list = tgIndexByCh.get(p.channel) || [];
  const pos = list.indexOf(i);
  const t0 = Date.parse(p.date || 0);
  for (let d = 1; d <= 8 && out.length < 8; d++) {
    for (const j of [list[pos - d], list[pos + d]]) {
      if (j === undefined) continue;
      const q = tg[j];
      if (!q || q.channel !== p.channel) continue;
      const dt = Math.abs(Date.parse(q.date || 0) - t0);
      if (dt > 300000) continue;
      if ((q.text || '').trim().length > 3) continue; // only media-only siblings
      (q.photos || []).forEach(push);
      if (out.length >= 8) break;
    }
  }
  return out.slice(0, 8);
}

tg.forEach((p, i) => {
  const price = arabicPrice(p.text);
  if (!price) return;
  const title = firstTitleLine(p.text);
  if (!title) return;
  const key = title.replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '').slice(0, 40);
  if (seen.has(key)) return;
  seen.add(key);
  const sell = Math.round(price * MULT);
  cands.push({
    source: 'telegram',
    sourceId: p.postId,
    channel: p.channel,
    url: p.url,
    date: p.date,
    title,
    text: p.text,
    cost: price,
    sell,
    keep: sell >= MIN_SELL,
    images: albumPhotos(i),
    hasVideo: p.hasVideo,
  });
});

// ---------- Elbatal ----------
for (const p of el) {
  const price = p.price;
  const sell = Math.round(price * MULT);
  cands.push({
    source: 'elbatal',
    sourceId: p.id,
    channel: 'elbatal-import',
    url: p.url,
    date: null,
    title: p.name,
    text: p.name,
    cost: price,
    sell,
    keep: sell >= MIN_SELL,
    images: [p.image, ...(p.images || [])].filter(Boolean).slice(0, 8),
    hasVideo: false,
    category: p.category,
  });
}

cands.sort((a, b) => (Date.parse(b.date || 0) || 0) - (Date.parse(a.date || 0) || 0));
fs.writeFileSync(path.join(OUT, 'candidates.json'), JSON.stringify(cands, null, 1), 'utf8');

const keep = cands.filter((c) => c.keep);
console.log('candidates:', cands.length, '| pass price rule (>=60 EGP after x2):', keep.length);
console.log('  telegram:', keep.filter((c) => c.source === 'telegram').length,
  '| elbatal:', keep.filter((c) => c.source === 'elbatal').length);
console.log('  dropped (<60):', cands.filter((c) => !c.keep).length);
console.log('  with >=3 images:', keep.filter((c) => c.images.length >= 3).length);
const prices = keep.map((c) => c.sell).sort((a, b) => a - b);
console.log('  sell price range:', prices[0], '...', prices[prices.length - 1], '| median:', prices[Math.floor(prices.length / 2)]);
console.log('\nsample:');
keep.slice(0, 8).forEach((c) => console.log(`  [${c.source}] ${c.sell} EGP (x2 of ${c.cost}) | ${c.title.slice(0, 60)} | imgs ${c.images.length}`));
