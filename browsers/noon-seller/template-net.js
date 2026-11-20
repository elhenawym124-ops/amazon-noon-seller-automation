const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  const log = [];
  ctx.on('page', p => log.push('NEW PAGE: ' + p.url()));
  page.on('request', r => { if (/download|template|export|import/i.test(r.url())) log.push('REQ ' + r.method() + ' ' + r.url().slice(0, 200)); });
  page.on('response', async r => {
    if (/download|template|export/i.test(r.url())) {
      log.push('RESP ' + r.status() + ' ' + r.url().slice(0, 200) + ' ct=' + (r.headers()['content-type'] || '') + ' cd=' + (r.headers()['content-disposition'] || ''));
    }
  });

  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button, a')).find(x => /Download Template/i.test(x.innerText || ''));
    if (b) b.click();
  });
  await page.waitForTimeout(12000);

  console.log(log.join('\n') || '(no matching traffic)');
  console.log('--- pages now:', ctx.pages().map(p => p.url()).join(' | '));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
