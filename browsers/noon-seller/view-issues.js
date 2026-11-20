const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const sku = process.argv[2] || 'LVP-543';
  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  // find the row containing the sku and click its View Issues
  const clicked = await page.evaluate((s) => {
    const all = Array.from(document.querySelectorAll('*'));
    const node = all.find(x => (x.innerText || '').includes('PSKU: ' + s) && (x.innerText || '').length < 400);
    let row = node;
    for (let i = 0; i < 6 && row; i++) {
      if (row.querySelector && row.querySelector('button, a')) break;
      row = row.parentElement;
    }
    if (!row) return 'row not found';
    const btn = Array.from(row.querySelectorAll('button, a, span')).find(x => (x.innerText || '').trim() === 'View Issues');
    if (!btn) return 'btn not found';
    btn.click();
    return 'clicked';
  }, sku);
  console.log(clicked);
  await page.waitForTimeout(6000);
  console.log('TEXT:\n' + (await page.evaluate(() => document.body.innerText)).slice(-1500));
  await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/issues.png' });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
