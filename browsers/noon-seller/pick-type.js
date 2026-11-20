const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];
  console.log('URL:', page.url());

  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => (x.innerText || '').trim() === 'Type');
    if (b) b.click();
  });
  await page.waitForTimeout(2000);
  const opts = await page.evaluate(() => Array.from(document.querySelectorAll('[role="option"]')).map(o => (o.innerText || '').trim().replace(/\s+/g, ' ')));
  console.log('OPTIONS:', JSON.stringify(opts));
  await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/type-dropdown.png' });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
