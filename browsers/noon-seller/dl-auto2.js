const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');
const OUTDIR = 'H:/amzain/browsers/noon-seller/templates';

async function clickExact(page, text) {
  return page.evaluate((t) => {
    const els = Array.from(document.querySelectorAll('div, span, li, button, label, a'));
    const el = els.find(x => (x.innerText || '').trim().replace(/\s+/g, ' ') === t && x.offsetParent !== null);
    if (el) { el.click(); return true; }
    return false;
  }, text);
}

async function nextItemAfterHeader(page) {
  return page.evaluate(() => {
    const lines = (document.body.innerText || '').split('\n').map(s => s.trim()).filter(Boolean);
    const i = lines.findIndex(l => /Selected Category/.test(l));
    if (i < 0) return null;
    for (let j = i + 1; j < lines.length; j++) {
      const l = lines[j];
      if (/^(Choose the template|With Instructions|Download)/i.test(l)) return null;
      return l;
    }
    return null;
  });
}

(async () => {
  const [category, outName] = process.argv.slice(2);
  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  // select a leaf until the download button enables
  for (let round = 0; round < 4; round++) {
    const enabled = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(x => (x.innerText || '').trim() === 'Download English');
      return b ? !b.disabled : false;
    });
    if (enabled) break;
    const item = await nextItemAfterHeader(page);
    console.log('round', round, 'click item:', item);
    if (!item) break;
    await clickExact(page, item);
    await page.waitForTimeout(3500);
  }

  const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button')).filter(b => /download/i.test(b.innerText || '')).map(b => (b.innerText || '').trim() + ':' + b.disabled));
  console.log('buttons:', JSON.stringify(btns));

  if (outName) {
    const dlP = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(x => (x.innerText || '').trim() === 'Download English' && !x.disabled);
      if (b) b.click();
    });
    const dl = await dlP;
    if (dl) { const f = OUTDIR + '/' + outName; await dl.saveAs(f); console.log('SAVED', f, fs.statSync(f).size); }
    else { console.log('no download'); await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/auto2-fail.png' }); }
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
