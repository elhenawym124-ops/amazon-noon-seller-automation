const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const pages = ctx.pages();
  console.log('pages:', pages.length);
  for (const p of pages) console.log('-', p.url(), '|', await p.title().catch(() => '?'));
  const page = pages[pages.length - 1];
  await page.bringToFront();
  await page.waitForTimeout(2000);
  console.log('ACTIVE:', page.url(), '|', await page.title());
  console.log('TEXT:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 1200));
  await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/current.png' });
  const cookies = await ctx.cookies(['https://seller.noon.partners', 'https://login.noon.partners']);
  console.log('COOKIES:', cookies.map(c => c.name).join(', '));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
