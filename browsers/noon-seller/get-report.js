const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');
const OUT = 'H:/amzain mina/noon-upload/reports';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const kind = process.argv[2] || 'Error File';
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  const dlPromise = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
  const clicked = await page.evaluate((k) => {
    const els = Array.from(document.querySelectorAll('a, button, span'));
    const el = els.find(x => (x.innerText || '').trim() === k && x.offsetParent !== null);
    if (el) { el.click(); return true; }
    return false;
  }, kind);
  console.log('clicked', kind, clicked);
  const dl = await dlPromise;
  if (!dl) { console.log('no download'); await page.screenshot({ path: 'H:/amzain mina/browsers/noon-seller/report-fail.png' }); }
  else {
    const p = OUT + '/' + dl.suggestedFilename();
    await dl.saveAs(p);
    console.log('SAVED', p, fs.statSync(p).size);
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
