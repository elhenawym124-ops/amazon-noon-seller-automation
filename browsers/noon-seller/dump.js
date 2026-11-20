const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const waitMs = Number(process.argv[2] || 20000);
  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon')) || ctx.pages()[0];
  for (let i = 0; i < Math.ceil(waitMs / 5000); i++) {
    await page.waitForTimeout(5000);
    const len = await page.evaluate(() => document.body.innerText.trim().length);
    if (len > 200) break;
  }
  console.log('URL:', page.url());
  console.log((await page.evaluate(() => document.body.innerText)).slice(0, 2000));
  await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/dump.png' });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
