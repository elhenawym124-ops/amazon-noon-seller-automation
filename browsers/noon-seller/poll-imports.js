const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const rounds = Number(process.argv[2] || 12);
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  for (let i = 0; i < rounds; i++) {
    if (!page.url().includes('/imports')) {
      await page.goto('https://noon-catalog.noon.partners/en/imports?tab=noon_catalog_content&project=PRJ101488', { waitUntil: 'domcontentloaded' }).catch(() => {});
    } else {
      const refresh = page.getByText('Refresh Imports').first();
      await refresh.click().catch(() => {});
    }
    await page.waitForTimeout(6000);
    const rows = await page.evaluate(() => {
      const trs = Array.from(document.querySelectorAll('tr'));
      return trs.map(tr => (tr.innerText || '').replace(/\s+/g, ' ').trim()).filter(t => /IMP/i.test(t));
    });
    console.log(new Date().toISOString().slice(11, 19), JSON.stringify(rows));
    if (rows.length && rows.every(r => !/Running|Queued|Pending|Uploading/i.test(r))) break;
    await page.waitForTimeout(20000);
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
