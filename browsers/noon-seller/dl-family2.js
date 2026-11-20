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
const dlEnabled = page => page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find(x => (x.innerText || '').trim() === 'Download English');
  return b ? !b.disabled : false;
});

(async () => {
  const [category, outName] = process.argv.slice(2);
  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  await page.goto('https://noon-catalog.noon.partners/en/imports/create?project=PRJ101488', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(9000);

  const combos = page.locator('[role="combobox"]');
  for (let i = 0; i < 20; i++) { if (await combos.count() >= 2) break; await page.waitForTimeout(2500); }

  await combos.nth(0).click();
  await page.waitForTimeout(1500);
  await page.locator('[role="option"]', { hasText: /^Content$/ }).first().click();
  await page.waitForTimeout(2500);
  await combos.nth(1).click();
  await page.waitForTimeout(1500);
  await page.locator('[role="option"]', { hasText: /^NIS Create\/Update$/ }).first().click();
  await page.waitForTimeout(4500);

  await page.evaluate(() => {
    const r = Array.from(document.querySelectorAll('[role="radio"]')).find(x => /specific category/i.test(x.parentElement ? x.parentElement.innerText : ''));
    if (r) r.click();
  });
  await page.waitForTimeout(2000);

  console.log('category:', category, await clickExact(page, category));
  await page.waitForTimeout(4000);

  const ys = [473, 519, 565, 611, 657, 703];
  for (const y of ys) {
    if (await dlEnabled(page)) break;
    await page.mouse.click(420, y);
    await page.waitForTimeout(3000);
    console.log('click y=' + y, 'enabled=' + (await dlEnabled(page)));
  }

  if (!(await dlEnabled(page))) {
    await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/dl2-fail-' + (outName || 'x') + '.png' });
    console.log('still disabled');
  } else if (outName) {
    const dlP = page.waitForEvent('download', { timeout: 90000 }).catch(() => null);
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
