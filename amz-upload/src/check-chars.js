const fs = require('fs');
const path = require('path');
const { dirs } = require('./lib/paths');
const j = JSON.parse(fs.readFileSync(path.join(dirs.config, 'products_ar2.json'), 'utf8'));
const p = j.products.find(x => x.sku === 'LVP-165');
const t = p.title;
const groups = {};
for (const ch of t) {
  const c = ch.codePointAt(0);
  let name;
  if (c >= 0x0621 && c <= 0x064a) name = 'arabic-letter';
  else if (c === 0x20) name = 'space';
  else if (c >= 0x0660 && c <= 0x0669) name = 'arabic-digit';
  else name = 'OTHER';
  groups[name] = groups[name] || new Set();
  groups[name].add(ch + ' U+' + c.toString(16).toUpperCase());
}
for (const [k, v] of Object.entries(groups)) {
  console.log(k + ':', k === 'arabic-letter' ? [...v].length + ' unique letters' : [...v].join(' | '));
}
console.log('bytes:', Buffer.byteLength(t, 'utf8'), 'chars:', t.length);
