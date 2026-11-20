const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');
const OUTDIR = 'H:/amzain mina/browsers/noon-seller/templates';

(async () => {
  const outName = process.argv[2];
  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  const dlP = page.waitForEvent('download', { timeout: 90000 }).catch(() => null);
  const clicked = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => (x.innerText || '').trim() === 'Download English' && !x.disabled);
    if (b) { b.click(); return true; }
    return false;
  });
  console.log('clicked:', clicked);
  const dl = await dlP;
  if (dl) { const f = OUTDIR + '/' + outName; await dl.saveAs(f); console.log('SAVED', f, fs.statSync(f).size); }
  else console.log('no download');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
