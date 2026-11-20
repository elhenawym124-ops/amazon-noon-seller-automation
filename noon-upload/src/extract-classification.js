const { dirs } = require('./lib/paths');
const XLSX = require(dirs.xlsxModule);
const fs = require('fs');
const path = require('path');

const wb = XLSX.readFile(dirs.noonTemplate);
const rows = XLSX.utils.sheet_to_json(wb.Sheets['Classification Directory'], { header: 1, defval: '' });
const header = rows[0];
console.log('header:', JSON.stringify(header));
const triples = rows.slice(1)
  .filter(r => r[0] && r[1] && r[2])
  .map(r => ({ family: String(r[0]).trim(), type: String(r[1]).trim(), subtype: String(r[2]).trim() }));

const fams = [...new Set(triples.map(t => t.family))];
console.log('triples:', triples.length, 'families:', fams.length);
const kd = triples.filter(t => /kitchen/i.test(t.family));
console.log('kitchen triples:', kd.length);
console.log('kitchen types:', [...new Set(kd.map(t => t.type))].join(' | '));
fs.writeFileSync(path.join(dirs.config, 'classification.json'), JSON.stringify(triples, null, 1));
console.log('saved classification.json');
