const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');
const OUTDIR = 'H:/amzain mina/browsers/noon-seller/templates';

(async () => {
  const [outName, yArg] = process.argv.slice(2);
  const y = Number(yArg || 473);
  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  await page.mouse.click(400, y);
  await page.waitForTimeout(4000);

  const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button')).filter(b => /download/i.test(b.innerText || '')).map(b => (b.innerText || '').trim() + ':' + b.disabled));
  console.log('after click y=' + y, JSON.stringify(btns));

  if (outName) {
    const dlP = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(x => (x.innerText || '').trim() === 'Download English' && !x.disabled);
      if (b) b.click();
    });
    const dl = await dlP;
    if (dl) { const f = OUTDIR + '/' + outName; await dl.saveAs(f); console.log('SAVED', f, fs.statSync(f).size); }
    else { console.log('no download'); await page.screenshot({ path: 'H:/amzain mina/browsers/noon-seller/coord-fail.png' }); }
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
