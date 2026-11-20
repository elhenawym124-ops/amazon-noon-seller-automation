const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');

(async () => {
  const outName = process.argv[2] || 'price_export.xlsx';
  const rowIdx = Number(process.argv[3] || 0);
  const OUT = 'H:/amzain/noon-upload/' + outName;

  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  const dlP = page.waitForEvent('download', { timeout: 90000 }).catch(() => null);
  const clicked = await page.evaluate((i) => {
    const links = Array.from(document.querySelectorAll('a, button, span')).filter(x => (x.innerText || '').trim() === 'Download' && x.offsetParent !== null);
    if (!links[i]) return false;
    links[i].click();
    return true;
  }, rowIdx);
  console.log('clicked download', clicked);
  const dl = await dlP;
  if (!dl) { console.log('no download'); await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/exp-dl-fail.png' }); }
  else { await dl.saveAs(OUT); console.log('SAVED', OUT, fs.statSync(OUT).size); }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
