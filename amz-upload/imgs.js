const fs = require('fs');
const buf = fs.readFileSync('H:/amzain mina/sample10/sample10.csv');
// detect utf8 vs lossy: just parse as utf8
const text = buf.toString('utf8');
const lines = text.split(/\r?\n/).filter(Boolean);
const header = lines[0].split(',');
const imgCols = header.map((h, i) => ({ h, i })).filter(x => /image/i.test(x.h));
console.log('image cols:', imgCols.map(c => c.i + ':' + c.h).join(', '));
for (let r = 1; r < lines.length; r++) {
  const cols = lines[r].split(',');
  const asin = cols[1];
  const price = cols[4];
  const imgs = imgCols.map(c => cols[c.i] || '').filter(Boolean);
  console.log(asin, price, JSON.stringify(imgs));
}
