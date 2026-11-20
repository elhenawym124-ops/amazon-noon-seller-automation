const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const url = process.argv[2];
  const shot = process.argv[3] || 'H:/amzain mina/browsers/noon-seller/page.png';
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0];
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(4000);
    const len = await page.evaluate(() => document.body.innerText.trim().length);
    if (len > 40) break;
  }
  console.log('URL:', page.url(), '| TITLE:', await page.title());
  await page.screenshot({ path: shot, fullPage: false });
  console.log('TEXT:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 1500));
  const links = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map(a => (a.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 35) + ' -> ' + a.getAttribute('href')).slice(0, 40));
  console.log('LINKS:\n' + links.join('\n'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
