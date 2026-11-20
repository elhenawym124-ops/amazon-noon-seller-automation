const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map((b, i) => ({ i, txt: (b.innerText || '').trim().slice(0, 30), disabled: b.disabled, aria: b.getAttribute('aria-disabled') })));
  console.log(JSON.stringify(btns.filter(b => b.txt), null, 1));

  const clicked = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => (x.innerText || '').trim() === 'Submit');
    if (!b) return 'no submit button';
    b.click();
    return 'clicked disabled=' + b.disabled;
  });
  console.log(clicked);
  await page.waitForTimeout(10000);
  console.log('URL:', page.url());
  console.log('TEXT:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 1000));
  await page.screenshot({ path: 'H:/amzain mina/browsers/noon-seller/submit2.png' });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
