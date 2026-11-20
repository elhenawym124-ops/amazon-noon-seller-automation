const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');

(async () => {
  const status = process.argv[2] || 'Not Live';
  const market = process.argv[3] || 'noon';
  const outName = process.argv[4] || 'price_export.xlsx';
  const OUT = 'H:/amzain/noon-upload/' + outName;

  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  const combos = page.locator('[role="combobox"]');
  await combos.nth(2).click();
  await page.waitForTimeout(1000);
  await page.locator('[role="option"]', { hasText: new RegExp('^' + status + '$') }).first().click();
  await page.waitForTimeout(1500);

  await combos.nth(3).click();
  await page.waitForTimeout(1000);
  await page.locator('[role="option"]', { hasText: new RegExp('^' + market + '$') }).first().click();
  await page.waitForTimeout(2500);

  const enabled = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => /Export Template/i.test(x.innerText || ''));
    return b ? !b.disabled : false;
  });
  console.log('export enabled:', enabled);

  const dlP = page.waitForEvent('download', { timeout: 90000 }).catch(() => null);
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => /Export Template/i.test(x.innerText || ''));
    if (b && !b.disabled) b.click();
  });
  const dl = await dlP;
  if (!dl) { console.log('no download'); await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/export-fail.png' }); }
  else {
    await dl.saveAs(OUT);
    console.log('SAVED', OUT, fs.statSync(OUT).size);
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
