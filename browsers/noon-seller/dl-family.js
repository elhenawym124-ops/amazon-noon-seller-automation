const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');

const OUTDIR = 'H:/amzain mina/browsers/noon-seller/templates';
fs.mkdirSync(OUTDIR, { recursive: true });

async function clickText(page, text, exact = true) {
  return page.evaluate(({ t, ex }) => {
    const els = Array.from(document.querySelectorAll('button, div, span, li, label, a'));
    const el = els.find(x => {
      const s = (x.innerText || '').trim().replace(/\s+/g, ' ');
      if (!s || x.offsetParent === null) return false;
      return ex ? s === t : s.includes(t);
    });
    if (el) { el.click(); return true; }
    return false;
  }, { t: text, ex: exact });
}

(async () => {
  const [category, ptype, outName] = process.argv.slice(2);
  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  await page.goto('https://noon-catalog.noon.partners/en/imports/create?project=PRJ101488', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(8000);

  const combos = page.locator('[role="combobox"]');
  for (let i = 0; i < 15 && (await combos.count()) < 1; i++) await page.waitForTimeout(3000);

  await combos.nth(0).click();
  await page.waitForTimeout(1500);
  await page.locator('[role="option"]', { hasText: /^Content$/ }).first().click();
  await page.waitForTimeout(2500);

  await combos.nth(1).click();
  await page.waitForTimeout(1500);
  await page.locator('[role="option"]', { hasText: /^NIS Create\/Update$/ }).first().click();
  await page.waitForTimeout(4000);

  // Specific category radio
  await page.evaluate(() => {
    const r = Array.from(document.querySelectorAll('[role="radio"]')).find(x => /specific category/i.test(x.parentElement ? x.parentElement.innerText : ''));
    if (r) r.click();
  });
  await page.waitForTimeout(1500);

  console.log('category click:', category, await clickText(page, category));
  await page.waitForTimeout(3000);
  console.log('ptype click:', ptype, await clickText(page, ptype));
  await page.waitForTimeout(3500);

  const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button')).filter(b => /download/i.test(b.innerText || '')).map(b => (b.innerText || '').trim() + ':' + b.disabled));
  console.log('buttons:', JSON.stringify(btns));
  await page.screenshot({ path: 'H:/amzain mina/browsers/noon-seller/family-state.png' });

  if (outName) {
    const dlP = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(x => (x.innerText || '').trim() === 'Download English' && !x.disabled);
      if (b) b.click();
    });
    const dl = await dlP;
    if (dl) { const f = OUTDIR + '/' + outName; await dl.saveAs(f); console.log('SAVED', f, fs.statSync(f).size); }
    else console.log('no download');
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
