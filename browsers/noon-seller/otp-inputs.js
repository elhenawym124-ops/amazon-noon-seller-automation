const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('login.noon.partners')) || ctx.pages()[0];
  console.log('URL:', page.url());
  console.log('TEXT:', (await page.evaluate(() => document.body.innerText)).slice(0, 500));
  const els = await page.evaluate(() => Array.from(document.querySelectorAll('input')).map(el => ({
    type: el.type, name: el.name, id: el.id, ph: el.placeholder,
    maxlength: el.maxLength, inputmode: el.getAttribute('inputmode'),
    aria: el.getAttribute('aria-label'), autoComplete: el.getAttribute('autocomplete'),
    cls: el.className.slice(0, 70)
  })));
  console.log(JSON.stringify(els, null, 1));
  await page.screenshot({ path: 'H:/amzain mina/browsers/noon-seller/otp-wait.png' });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
