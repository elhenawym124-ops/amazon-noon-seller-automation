const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0];
  const urls = [
    'https://m.media-amazon.com/images/I/71c8jNfLmkL._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/71c8jNfLmkL._SL1500_.jpeg',
    'https://m.media-amazon.com/images/I/71c8jNfLmkL._AC_SL1500_.jpg',
    'https://m.media-amazon.com/images/I/71c8jNfLmkL.jpg'
  ];
  const out = await page.evaluate(async (list) => {
    const res = [];
    for (const u of list) {
      try {
        const r = await fetch(u, { method: 'GET' });
        res.push({ u: u.slice(-30), status: r.status, ct: r.headers.get('content-type'), len: (await r.blob()).size });
      } catch (e) { res.push({ u: u.slice(-30), err: String(e) }); }
    }
    return res;
  }, urls);
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
