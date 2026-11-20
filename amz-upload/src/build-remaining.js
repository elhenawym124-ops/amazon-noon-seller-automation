// Build the remaining 53 Arabic products from the scraped store data
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { dirs, readJson } = require('./lib/paths');

const merged = readJson(path.join(dirs.data, 'merged.json'));
const isAr = s => /[\u0600-\u06FF]/.test(s || '');
const latin = s => ((s || '').match(/[A-Za-z]/g) || []).length;

const files = fs.readdirSync(dirs.config).filter(f => /^products.*\.json$/.test(f) || /^w1_\d\.json$/.test(f));
const used = new Set();
for (const f of files) {
  let j; try { j = readJson(path.join(dirs.config, f)); } catch (e) { continue; }
  const arr = Array.isArray(j) ? j : (j.products || []);
  arr.forEach(p => p && p.refAsin && used.add(p.refAsin));
}

const KITCHEN = new Set(['PLATE', 'ICE_TRAY', 'POPCORN_MACHINE', 'BAKING_PAPER', 'APPLIANCE', 'SPICE', 'KITCHEN_TOOL', 'BOTTLE', 'COOKWARE']);
const NODE_KITCHEN = '21864567031';
const NODE_HOME = '21863799031';

const pool = [];
for (const m of merged) {
  if (used.has(m.asin)) continue;
  if (!isAr(m.title)) continue;
  pool.push(m);
}
console.log('remaining AR pool', pool.length);

function fullImg(u) {
  if (!u) return '';
  return u.replace(/\._[A-Za-z0-9,_]+_\./, '._SL1500_.').replace(/_AC_[A-Za-z0-9,_]+_\./, '._SL1500_.');
}

let n = 500;
const rows = pool.map(m => {
  const title = (m.title || '').replace(/\s+/g, ' ').trim().slice(0, 200);
  const sku = 'LVP-' + String(n++).padStart(3, '0');
  const price = Math.round((parseFloat(m.price) || 0) * 1.1 * 100) / 100;
  const kitchen = KITCHEN.has(m.group);
  return {
    kitchen,
    p: {
      sku,
      refAsin: m.asin,
      group: m.group,
      browseNode: kitchen ? NODE_KITCHEN : NODE_HOME,
      title,
      price,
      weightGrams: 600,
      modelName: sku,
      color: 'متعدد الألوان',
      description: `${title}. منتج عملي مصمم للاستخدام اليومي، بخامة مناسبة وتصميم يساعد على سهولة الاستخدام والتنظيف. مناسب للمنزل ولمختلف المهام اليومية، ويوفر حلًا بسيطًا وعمليًا يساعد على ترتيب المساحة واستخدامها بشكل أفضل.`,
      bullets: [
        'تصميم عملي مناسب للاستخدام اليومي.',
        'خامة مناسبة تتحمل الاستخدام المتكرر.',
        'سهل الاستخدام والتنظيف.',
        'مناسب للمنزل ومختلف المهام اليومية.',
        'مقاس عملي يناسب الاستخدام اليومي.'
      ],
      images: [fullImg(m.img)].filter(Boolean)
    }
  };
});

fs.writeFileSync(path.join(dirs.config, 'remaining-map.json'), JSON.stringify(rows.map(r => ({ sku: r.p.sku, asin: r.p.refAsin, group: r.p.group, title: r.p.title, price: r.p.price })), null, 1), 'utf8');

const CHUNK = 10;
let idx = 0;
const made = [];
for (const kitchen of [true, false]) {
  const part = rows.filter(r => r.kitchen === kitchen).map(r => r.p);
  for (let i = 0; i < part.length; i += CHUNK) {
    idx++;
    const chunk = part.slice(i, i + CHUNK);
    const cfgName = `cfg_H${idx}.json`;
    const outName = `H${idx}_${kitchen ? 'KT' : 'ORG'}.xlsx`;
    const cfgPath = path.join(dirs.config, cfgName);
    const outPath = path.join(dirs.feeds, outName);
    const tplPath = path.join(dirs.templates, kitchen ? 'KT_AR2.xlsm' : 'AR2.xlsx');
    fs.writeFileSync(cfgPath, JSON.stringify({
      productType: kitchen ? 'KITCHEN_TOOLS' : 'HOME_ORGANIZERS_AND_STORAGE',
      browseNode: kitchen ? NODE_KITCHEN : NODE_HOME,
      quantity: 99,
      brand: 'Generic',
      inferMaterial: kitchen,
      products: chunk
    }, null, 1), 'utf8');
    execFileSync(process.execPath, [path.join(__dirname, 'build-feed.js'), tplPath, cfgPath, outPath], { stdio: 'ignore' });
    made.push({ out: outName, n: chunk.length, skus: chunk.map(p => p.sku + '/' + p.refAsin + '/' + p.group).join(', ') });
  }
}
made.forEach(m => console.log(m.out, m.n, m.skus));
