const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');

(async () => {
  const code = process.argv[2];
  const outName = process.argv[3] || 'errors_batch.csv';
  const OUT = 'H:/amzain/noon-upload/reports/' + outName;

  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  await page.goto('https://noon-catalog.noon.partners/en/imports?tab=noon_catalog_content&project=PRJ101488', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});

  let found = false;
  for (let i = 0; i < 12 && !found; i++) {
    await page.waitForTimeout(4000);
    found = await page.evaluate((c) => document.body.innerText.includes(c), code);
  }
  console.log('code visible:', found);

  const dlP = page.waitForEvent('download', { timeout: 90000 }).catch(() => null);
  const clicked = await page.evaluate((c) => {
    const trs = Array.from(document.querySelectorAll('tr'));
    const row = trs.find(t => (t.innerText || '').includes(c));
    if (!row) return 'row not found (' + trs.length + ' rows)';
    const el = Array.from(row.querySelectorAll('a, button, span, div')).find(x => (x.innerText || '').trim() === 'Error File');
    if (!el) return 'link not found';
    el.click();
    return 'clicked';
  }, code);
  console.log(clicked);
  const dl = await dlP;
  if (dl) { await dl.saveAs(OUT); console.log('SAVED', OUT, fs.statSync(OUT).size); }
  else console.log('no download');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
