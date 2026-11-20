const XLSX = require('xlsx');

const SRC = 'H:/amzain/amz-upload/PQ.xlsm';
const OUT = 'H:/amzain/amz-upload/PQ_feed.xlsx';
const SHEET = 'Template';

const rows = [
  { sku: 'LVP-001', price: 148.5 },
  { sku: 'LVP-005', price: 188.1 }
];

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
  qty: col('fulfillment_availability#1.quantity'),
  lead: col('fulfillment_availability#1.lead_time_to_ship_max_days'),
  always: col('fulfillment_availability#1.is_inventory_available'),
  price: col('purchasable_offer[marketplace_id=ARBP9OOSHTCHU][audience=ALL]#1.our_price')
};
console.log('cols', C);

const START = 6; // dataRow=7 (1-based)
rows.forEach((r, i) => {
  const idx = START + i;
  const row = new Array(attr.length).fill('');
  row[C.sku] = r.sku;
  row[C.fbc] = 'Fulfilment by Merchant (Default)';
  // quantity intentionally blank: this feed rejects any value while inventory_type = always available
  row[C.lead] = 2;
  row[C.always] = 'Enabled';
  row[C.price] = r.price;
  data[idx] = row;
});
// clear the template example row
data[5] = new Array(attr.length).fill('');

const wsNew = XLSX.utils.aoa_to_sheet(data);
wsNew['!cols'] = (ws['!cols'] || []).slice(0, attr.length);
wb.Sheets[SHEET] = wsNew;
const out = XLSX.utils.book_new();
for (const n of wb.SheetNames) XLSX.utils.book_append_sheet(out, wb.Sheets[n], n);
XLSX.writeFile(out, OUT, { bookType: 'xlsx' });

const check = XLSX.readFile(OUT);
const cd = XLSX.utils.sheet_to_json(check.Sheets[SHEET], { header: 1, blankrows: false, defval: '' });
for (let i = START; i < START + rows.length; i++) {
  console.log('ROW', i + 1, JSON.stringify({ sku: cd[i][C.sku], fbc: cd[i][C.fbc], qty: cd[i][C.qty], always: cd[i][C.always], price: cd[i][C.price] }));
}
console.log('written', OUT);
