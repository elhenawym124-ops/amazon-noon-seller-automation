const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const sku = process.argv[2] || 'LVP-543';
  const url = 'https://noon-catalog.noon.partners/en/catalog?project=PRJ101488&tab=noon';
  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  let found = false;
  for (let i = 0; i < 5 && !found; i++) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(12000);
    const t = await page.evaluate(() => document.body.innerText);
    found = t.includes(sku);
    console.log('attempt', i + 1, 'found:', found, 'len:', t.length);
    if (found) {
      const idx = t.indexOf(sku);
      console.log('--- context ---');
      console.log(t.slice(Math.max(0, idx - 300), idx + 700).replace(/\n+/g, ' | '));
    }
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
