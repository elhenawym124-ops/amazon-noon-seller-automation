const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  const hits = [];
  const onResp = async (r) => {
    try {
      const ct = r.headers()['content-type'] || '';
      if (!/json/.test(ct)) return;
      const body = await r.text();
      if (body.length < 3000) return;
      hits.push({ url: r.url().slice(0, 160), method: r.request().method(), len: body.length, head: body.slice(0, 200) });
    } catch (e) { }
  };
  page.on('response', onResp);

  await page.goto('https://noon-catalog.noon.partners/en/catalog?project=PRJ101488&tab=noon', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(15000);
  page.off('response', onResp);

  console.log(hits.length, 'json responses');
  for (const h of hits.slice(0, 8)) console.log(h.method, h.url, h.len, '\n   ', h.head.replace(/\s+/g, ' ').slice(0, 180));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
