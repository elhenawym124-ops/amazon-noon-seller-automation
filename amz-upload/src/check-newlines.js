const fs = require('fs');
const path = require('path');
const { dirs } = require('./lib/paths');
const files = fs.readdirSync(dirs.config).filter(f => /^products.*\.json$/.test(f) || /^w1_\d\.json$/.test(f) || /^cfg_.*\.json$/.test(f));
const bad = new Map();
for (const f of files) {
  let j; try { j = JSON.parse(fs.readFileSync(path.join(dirs.config, f), 'utf8')); } catch (e) { continue; }
  const arr = Array.isArray(j) ? j : (j.products || []);
  for (const p of arr) {
    if (!p) continue;
    const hits = [];
    for (const [k, v] of Object.entries({ images: p.images || [], bullets: p.bullets || [] })) {
      v.forEach((s, i) => { if (typeof s === 'string' && /[\n\r\t]/.test(s)) hits.push(k + '[' + i + ']'); });
    }
    for (const k of ['title', 'description', 'color', 'modelName']) {
      const s = p[k];
      if (typeof s === 'string' && /[\n\r\t]/.test(s)) hits.push(k);
    }
    if (hits.length) bad.set(p.sku, hits);
  }
}
console.log('affected SKUs:', bad.size);
for (const [sku, ks] of bad) console.log(' ', sku, '->', ks.join(','));
