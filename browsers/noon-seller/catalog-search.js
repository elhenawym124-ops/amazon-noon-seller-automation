const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const q = process.argv[2];
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  await page.goto('https://noon-catalog.noon.partners/en/catalog?project=PRJ101488&tab=noon&page=1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);

  const search = page.locator('input[type="search"], input[placeholder*="Search" i]').first();
  if (await search.count()) {
    await search.fill(q);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(8000);
  }
  console.log('URL:', page.url());
  console.log('TEXT:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 1500));
  await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/catalog-search.png' });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
