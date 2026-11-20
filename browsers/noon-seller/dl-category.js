const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');
const OUT = 'H:/amzain/browsers/noon-seller/templates';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const category = process.argv[2] || 'Kitchen & Dining';
  const lang = process.argv[3] || 'Download English';
  const outName = process.argv[4] || ('NIS_' + category.replace(/[^A-Za-z]+/g, '_') + '_EN.xlsx');

  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  await page.goto('https://noon-catalog.noon.partners/en/imports/create?project=PRJ101488', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const combos = page.locator('[role="combobox"]');
  await combos.nth(0).click();
  await page.waitForTimeout(1200);
  await page.locator('[role="option"]', { hasText: /^Content$/ }).first().click();
  await page.waitForTimeout(2500);

  await combos.nth(1).click();
  await page.waitForTimeout(1200);
  await page.locator('[role="option"]', { hasText: /^NIS Create\/Update$/ }).first().click();
  await page.waitForTimeout(4000);
  console.log('URL:', page.url());

  await page.evaluate(() => {
    const r = Array.from(document.querySelectorAll('[role="radio"]')).find(x => /specific category/i.test(x.parentElement ? x.parentElement.innerText : ''));
    if (r) r.click();
  });
  await page.waitForTimeout(1500);

  const clicked = await page.evaluate((cat) => {
    const els = Array.from(document.querySelectorAll('button, [role="button"], label, div, span'));
    const el = els.find(x => (x.innerText || '').trim() === cat && x.offsetParent !== null);
    if (el) { el.click(); return true; }
    return false;
  }, category);
  console.log('category clicked:', clicked);
  await page.waitForTimeout(2500);

  const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button')).filter(b => /download/i.test(b.innerText || '')).map(b => ((b.innerText || '').trim()) + ' disabled=' + b.disabled));
  console.log('download buttons:', JSON.stringify(btns));

  const dlPromise = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
  await page.evaluate((l) => {
    const b = Array.from(document.querySelectorAll('button')).find(x => (x.innerText || '').trim() === l && !x.disabled);
    if (b) b.click();
  }, lang);
  const dl = await dlPromise;
  if (!dl) { console.log('no download'); await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/dl-nocat.png' }); }
  else {
    const p = OUT + '/' + outName;
    await dl.saveAs(p);
    console.log('SAVED', p, fs.statSync(p).size);
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
