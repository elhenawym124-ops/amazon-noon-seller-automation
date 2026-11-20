const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');
const OUT = 'H:/amzain/browsers/noon-seller/templates';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const [category, ptype, lang = 'Download English', outName] = process.argv.slice(2);
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  async function pickCat(cat) {
    await page.evaluate(() => {
      const r = Array.from(document.querySelectorAll('[role="radio"]')).find(x => /specific category/i.test(x.parentElement ? x.parentElement.innerText : ''));
      if (r) r.click();
    });
    await page.waitForTimeout(1200);
    const ok = await page.evaluate((c) => {
      const el = Array.from(document.querySelectorAll('div, span, li, button')).find(x => (x.innerText || '').trim() === c && x.offsetParent !== null);
      if (el) { el.click(); return true; }
      return false;
    }, cat);
    await page.waitForTimeout(2500);
    return ok;
  }

  if (category) console.log('category:', category, 'clicked', await pickCat(category));
  if (ptype) {
    const ok = await page.evaluate((pt) => {
      const el = Array.from(document.querySelectorAll('div, span, li, button')).find(x => (x.innerText || '').trim() === pt && x.offsetParent !== null);
      if (el) { el.click(); return true; }
      return false;
    }, ptype);
    console.log('ptype:', ptype, 'clicked', ok);
    await page.waitForTimeout(3000);
  }

  const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button')).filter(b => /download/i.test(b.innerText || '')).map(b => ((b.innerText || '').trim()) + ' disabled=' + b.disabled));
  console.log('download buttons:', JSON.stringify(btns));

  const name = outName || (category.replace(/[^A-Za-z]+/g, '_') + '__' + (ptype || 'all').replace(/[^A-Za-z]+/g, '_') + '.xlsx');
  const dlPromise = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
  await page.evaluate((l) => {
    const b = Array.from(document.querySelectorAll('button')).find(x => (x.innerText || '').trim() === l && !x.disabled);
    if (b) b.click();
  }, lang);
  const dl = await dlPromise;
  if (!dl) { console.log('no download'); await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/dl-fail.png' }); }
  else {
    const p = OUT + '/' + name;
    await dl.saveAs(p);
    console.log('SAVED', p, fs.statSync(p).size);
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
