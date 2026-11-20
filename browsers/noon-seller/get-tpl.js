const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');

(async () => {
  const type = process.argv[2] || 'Pricing';
  const subtype = process.argv[3] || 'Price Update';
  const outName = process.argv[4] || (type + '_' + subtype + '.xlsx').replace(/\s+/g, '_');

  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  await page.goto('https://noon-catalog.noon.partners/en/imports/create?project=PRJ101488', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const combos = page.locator('[role="combobox"]');
  await combos.nth(0).click();
  await page.waitForTimeout(1200);
  await page.locator('[role="option"]', { hasText: new RegExp('^' + type + '$') }).first().click();
  await page.waitForTimeout(2500);

  await combos.nth(1).click();
  await page.waitForTimeout(1200);
  await page.locator('[role="option"]', { hasText: new RegExp('^' + subtype + '$') }).first().click();
  await page.waitForTimeout(3500);

  console.log('TEXT:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 900));

  const dlP = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => /^Download Template$/i.test((x.innerText || '').trim()) && !x.disabled);
    if (b) b.click();
  });
  const dl = await dlP;
  if (dl) {
    const f = 'H:/amzain mina/browsers/noon-seller/templates/' + outName;
    await dl.saveAs(f);
    console.log('SAVED', f, fs.statSync(f).size);
  } else console.log('no download');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
