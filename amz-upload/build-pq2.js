const XLSX = require('xlsx');
const fs = require('fs');

const SRC = 'H:/amzain mina/amz-upload/PQ.xlsm';
const OUT = process.argv[3] || 'H:/amzain mina/amz-upload/PQ_feed.xlsx';
const CFG = process.argv[2] || 'H:/amzain mina/amz-upload/pq-products2.json';
const SHEET = 'Template';

const cfg = JSON.parse(fs.readFileSync(CFG, 'utf8'));
const rows = cfg.products;

const wb = XLSX.readFile(SRC, { bookVBA: false });
const ws = wb.Sheets[SHEET];
const data = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: true, defval: '' });
const attr = data[4];

const col = (s) => {
  const i = attr.findIndex(a => String(a || '').startsWith(s));
  if (i < 0) throw new Error('missing ' + s);
  return i;
};
const C = {
  sku: col('contribution_sku#1.value'),
  fbc: col('fulfillment_availability#1.fulfillment_channel_code'),
  always: col('fulfillment_availability#1.is_inventory_available'),
  price: col('purchasable_offer[marketplace_id=ARBP9OOSHTCHU][audience=ALL]#1.our_price')
};

const START = 6;
data[5] = new Array(attr.length).fill('');
rows.forEach((r, i) => {
  const row = new Array(attr.length).fill('');
  row[C.sku] = r.sku;
  row[C.fbc] = 'Fulfilment by Merchant (Default)';
  row[C.always] = 'Enabled';
  row[C.price] = r.price;
  data[START + i] = row;
});

const wsNew = XLSX.utils.aoa_to_sheet(data);
wsNew['!cols'] = (ws['!cols'] || []).slice(0, attr.length);
wb.Sheets[SHEET] = wsNew;
const out = XLSX.utils.book_new();
for (const n of wb.SheetNames) XLSX.utils.book_append_sheet(out, wb.Sheets[n], n);
XLSX.writeFile(out, OUT, { bookType: 'xlsx' });

const check = XLSX.readFile(OUT);
const cd = XLSX.utils.sheet_to_json(check.Sheets[SHEET], { header: 1, blankrows: false, defval: '' });
for (let i = START; i < START + rows.length; i++) {
  console.log('ROW', i + 1, JSON.stringify({ sku: cd[i][C.sku], always: cd[i][C.always], price: cd[i][C.price] }));
}
console.log('written', OUT, 'rows:', rows.length);
