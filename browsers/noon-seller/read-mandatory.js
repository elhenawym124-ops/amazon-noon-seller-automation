const fs = require('fs');
const path = 'H:/amzain mina/browsers/noon-seller/tpl_unzip/out/xl/';

const styles = fs.readFileSync(path + 'styles.xml', 'utf8');
const wb = fs.readFileSync(path + 'workbook.xml', 'utf8');

// map sheet name -> sheetN.xml
const rels = fs.readFileSync(path + '_rels/workbook.xml.rels', 'utf8');
const relMap = {};
for (const m of rels.matchAll(/<Relationship[^>]*>/g)) {
  const id = (m[0].match(/Id="(rId\d+)"/) || [])[1];
  const target = (m[0].match(/Target="([^"]+)"/) || [])[1];
  if (id && target) relMap[id] = target;
}
const sheets = {};
for (const m of wb.matchAll(/<sheet[^>]*\/>/g)) {
  const name = (m[0].match(/name="([^"]+)"/) || [])[1];
  const rid = (m[0].match(/r:id="(rId\d+)"/) || [])[1];
  if (name && rid) sheets[name] = relMap[rid];
}
console.log('sheets:', sheets);

// fills
const fillsBlock = styles.match(/<fills[^>]*>([\s\S]*?)<\/fills>/)[1];
const fills = [...fillsBlock.matchAll(/<fill>[\s\S]*?<\/fill>/g)].map(f => {
  const fg = f[0].match(/<fgColor[^>]*\/>/);
  const rgb = fg && fg[0].match(/rgb="([0-9A-Fa-f]{6,8})"/);
  const theme = fg && fg[0].match(/theme="(\d+)"/);
  return rgb ? rgb[1] : (theme ? 'theme' + theme[1] : 'none');
});
const cellXfsBlock = styles.match(/<cellXfs[^>]*>([\s\S]*?)<\/cellXfs>/)[1];
const xfs = [...cellXfsBlock.matchAll(/<xf[^>]*>/g)].map(x => {
  const m = x[0].match(/fillId="(\d+)"/);
  return m ? Number(m[1]) : 0;
});

const sheetFile = sheets['template_data'];
const sheet = fs.readFileSync(path + 'worksheets/' + sheetFile.split('/').pop(), 'utf8');

const rows = {};
for (const m of sheet.matchAll(/<c r="([A-Z]+)(\d+)"(?:[^>]*s="(\d+)")?[^>]*>/g)) {
  const [, col, row, s] = m;
  rows[row] = rows[row] || {};
  rows[row][col] = s ? fills[xfs[Number(s)]] : null;
}

function colToNum(c) { let n = 0; for (const ch of c) n = n * 26 + (ch.charCodeAt(0) - 64); return n; }
function numToCol(n) { let s = ''; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; }

// read shared strings? inline strings maybe. use sheetSharedStrings
let shared = [];
try {
  const ss = fs.readFileSync(path + 'sharedStrings.xml', 'utf8');
  shared = [...ss.matchAll(/<si>([\s\S]*?)<\/si>/g)].map(s => (s[1].match(/<t[^>]*>([\s\S]*?)<\/t>/) || [, ''])[1]);
} catch (e) {}

const headerRow = 8;
const out = [];
for (let c = 1; c <= 78; c++) {
  const col = numToCol(c);
  const cell = sheet.match(new RegExp('<c r="' + col + headerRow + '"[^>]*>([\\s\\S]*?)</c>'));
  let label = '';
  if (cell) {
    const v = cell[1].match(/<v>(\d+)<\/v>/);
    const t = cell[1].match(/<t[^>]*>([\s\S]*?)<\/t>/);
    label = t ? t[1] : (v ? shared[Number(v[1])] : '');
  }
  out.push({ col, label, fill: rows[headerRow] ? rows[headerRow][col] : null });
}
console.log(out.map(o => o.col + ' ' + o.label + ' :: ' + o.fill).join('\n'));
console.log('distinct fills:', [...new Set(out.map(o => o.fill))]);
