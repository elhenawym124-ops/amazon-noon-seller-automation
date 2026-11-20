const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];
  const outDir = 'H:/amzain/browsers/noon-seller/templates';
  fs.mkdirSync(outDir, { recursive: true });

  // pick "Catalog" via the dropdown option
  const already = await page.evaluate(() => (document.body.innerText || '').includes('Catalog Import'));
  const opt = page.locator('[role="option"]', { hasText: /^Catalog$/ });
  if (await opt.count()) {
    await opt.first().click();
  } else {
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(x => ['Type', 'Content', 'Catalog'].includes((x.innerText || '').trim()));
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.locator('[role="option"]', { hasText: /^Catalog$/ }).first().click();
  }
  await page.waitForTimeout(2500);
  console.log('TEXT AFTER PICK:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 1500));

  const dlPromise = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => /Download Template/i.test(x.innerText || ''));
    if (b) b.click();
  });
  const dl = await dlPromise;
  if (dl) {
    const p = outDir + '/' + dl.suggestedFilename();
    await dl.saveAs(p);
    console.log('DOWNLOADED:', p, fs.statSync(p).size);
  } else {
    console.log('no download event');
  }
  await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/catalog-type.png' });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
