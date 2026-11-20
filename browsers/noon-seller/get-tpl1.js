const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');

(async () => {
  const type = process.argv[2];
  const outName = process.argv[3];
  const OUT = 'H:/amzain mina/browsers/noon-seller/templates/' + outName;

  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  await page.goto('https://noon-catalog.noon.partners/en/imports/create?project=PRJ101488', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(9000);

  const combos = page.locator('[role="combobox"]');
  for (let i = 0; i < 15; i++) { if (await combos.count() >= 1) break; await page.waitForTimeout(2500); }
  await combos.nth(0).click();
  await page.waitForTimeout(1500);
  await page.locator('[role="option"]', { hasText: new RegExp('^' + type + '$', 'i') }).first().click();
  await page.waitForTimeout(5000);

  const dlP = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
  const clicked = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => /Download Template/i.test(x.innerText || '') && !x.disabled);
    if (b) { b.click(); return true; }
    return false;
  });
  console.log('clicked:', clicked);
  const dl = await dlP;
  if (dl) { await dl.saveAs(OUT); console.log('SAVED', OUT, fs.statSync(OUT).size); }
  else console.log('no download');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
