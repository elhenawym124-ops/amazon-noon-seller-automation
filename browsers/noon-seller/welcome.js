const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0];
  await page.goto('https://welcome.noon.partners/en/home?project=PRJ101488', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  console.log('URL:', page.url(), '| TITLE:', await page.title());
  await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/welcome.png', fullPage: false });
  console.log('TEXT:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 1200));
  const links = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map(a => a.innerText.trim().replace(/\s+/g, ' ').slice(0, 40) + ' -> ' + a.getAttribute('href')).slice(0, 30));
  console.log('LINKS:\n' + links.join('\n'));
  const cookies = await ctx.cookies();
  console.log('ALL COOKIES:', cookies.map(c => c.domain + ':' + c.name).join('\n'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
