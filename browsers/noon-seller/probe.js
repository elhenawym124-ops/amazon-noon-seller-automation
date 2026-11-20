const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

const urls = [
  'https://seller.noon.partners/',
  'https://seller.noon.partners/en/',
  'https://seller.noon.partners/en/dashboard',
  'https://welcome.noon.partners/',
  'https://login.noon.partners/en'
];

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0];
  const statuses = [];
  page.on('response', r => statuses.push(r.status() + ' ' + r.url().slice(0, 80)));
  for (const u of urls) {
    statuses.length = 0;
    let err = '';
    try { await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 40000 }); }
    catch (e) { err = e.message.split('\n')[0]; }
    await page.waitForTimeout(2500);
    const txt = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 200);
    console.log('==', u, '=>', page.url());
    console.log('   status:', statuses.slice(0, 4).join(' || ') || '(none)');
    console.log('   text:', err || txt);
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
