const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');

const OUTDIR = 'H:/amzain/browsers/noon-seller/templates';

async function clickExact(page, text) {
  return page.evaluate((t) => {
    const els = Array.from(document.querySelectorAll('div, span, li, button, label, a'));
    const el = els.find(x => {
      const s = (x.innerText || '').trim().replace(/\s+/g, ' ');
      return s === t && x.offsetParent !== null;
    });
    if (el) { el.click(); return true; }
    return false;
  }, text);
}

(async () => {
  const [category, ptype, leaf, outName] = process.argv.slice(2);
  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  await page.goto('https://noon-catalog.noon.partners/en/imports/create?project=PRJ101488', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(9000);

  const combos = page.locator('[role="combobox"]');
  for (let i = 0; i < 20; i++) {
    if (await combos.count() >= 2) break;
    await page.waitForTimeout(2000);
  }
  console.log('combos:', await combos.count());

  await combos.nth(0).click();
  await page.waitForTimeout(1500);
  await page.locator('[role="option"]', { hasText: /^Content$/ }).first().click();
  await page.waitForTimeout(3000);

  await combos.nth(1).click();
  await page.waitForTimeout(1500);
  await page.locator('[role="option"]', { hasText: /^NIS Create\/Update$/ }).first().click();
  await page.waitForTimeout(5000);

  await page.evaluate(() => {
    const r = Array.from(document.querySelectorAll('[role="radio"]')).find(x => /specific category/i.test(x.parentElement ? x.parentElement.innerText : ''));
    if (r) r.click();
  });
  await page.waitForTimeout(2000);

  console.log('category:', category, await clickExact(page, category));
  await page.waitForTimeout(3500);
  if (ptype) { console.log('type:', ptype, await clickExact(page, ptype)); await page.waitForTimeout(3500); }
  if (leaf) { console.log('leaf:', leaf, await clickExact(page, leaf)); await page.waitForTimeout(4000); }

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
    else { console.log('no download'); await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/leaf-fail.png' }); }
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
