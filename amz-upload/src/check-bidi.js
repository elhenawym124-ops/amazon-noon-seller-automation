const fs = require('fs');
const path = require('path');
const { dirs } = require('./lib/paths');
const targets = ['products_ar2.json', 'products_kt.json', 'products_misc.json', 'cfg_H3.json'];
for (const f of targets) {
  let j; try { j = JSON.parse(fs.readFileSync(path.join(dirs.config, f), 'utf8')); } catch (e) { continue; }
  for (const p of (j.products || [])) {
    const t = p.title || '';
    const hits = [...t].map((c, i) => ({ i, code: c.codePointAt(0) })).filter(x => x.code === 0x200e || x.code === 0x200f || (x.code >= 0x202a && x.code <= 0x202e) || x.code === 0xa0 || x.code === 0x2066 || x.code === 0x2067 || x.code === 0x2068 || x.code === 0x2069);
    if (hits.length) console.log(f, p.sku, JSON.stringify(hits.map(h => h.code.toString(16))));
  }
}
console.log('done');
