const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];
  const r = await page.evaluate(() => ({
    links: Array.from(document.querySelectorAll('a[href]')).map(a => [(a.innerText || '').trim().slice(0, 30), a.getAttribute('href')]).filter(x => /download|template/i.test(x[0] + x[1])),
    buttons: Array.from(document.querySelectorAll('button')).map(b => ({
      t: (b.innerText || '').trim().toLowerCase().slice(0, 30),
      attrs: Array.from(b.attributes).map(a => a.name + '=' + String(a.value).slice(0, 80))
    })).filter(x => /download|instruction|english|arabic|all categ/i.test(x.t)),
    radios: Array.from(document.querySelectorAll('[role="radio"], input[type="radio"]')).map(x => (x.getAttribute('aria-label') || x.value || (x.parentElement ? x.parentElement.innerText.trim().slice(0, 40) : '')))
  }));
  console.log(JSON.stringify(r, null, 1).slice(0, 4000));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
