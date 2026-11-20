const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');

(async () => {
  const out = process.argv[2] || 'H:/amzain/noon-upload/catalog_export.csv';
  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  for (let i = 0; i < 5; i++) {
    await page.goto('https://noon-catalog.noon.partners/en/catalog?project=PRJ101488&tab=noon', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(12000);
    const t = await page.evaluate(() => document.body.innerText);
    const hasRows = /PSKU:/.test(t);
    console.log('attempt', i + 1, 'rows rendered:', hasRows, 'len', t.length);
    if (hasRows) break;
  }

  const dlP = page.waitForEvent('download', { timeout: 90000 }).catch(() => null);
  const clicked = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button, a, span')).find(x => (x.innerText || '').trim() === 'Export' && x.offsetParent !== null);
    if (b) { b.click(); return true; }
    return false;
  });
  console.log('export clicked:', clicked);
  const dl = await dlP;
  if (dl) { await dl.saveAs(out); console.log('SAVED', out, fs.statSync(out).size); }
  else { console.log('no download'); await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/export-cat.png' }); }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
