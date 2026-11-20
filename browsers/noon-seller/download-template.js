const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');
const OUT = 'H:/amzain/browsers/noon-seller/templates';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  const [type, subtype] = process.argv.slice(2);
  const combos = page.locator('[role="combobox"]');
  await combos.nth(0).click();
  await page.waitForTimeout(1200);
  await page.locator('[role="option"]', { hasText: new RegExp('^' + type + '$', 'i') }).first().click();
  await page.waitForTimeout(2500);

  await combos.nth(1).click();
  await page.waitForTimeout(1200);
  await page.locator('[role="option"]', { hasText: new RegExp('^' + subtype + '$', 'i') }).first().click();
  await page.waitForTimeout(3000);

  console.log('PAGE TEXT:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 1800));
  await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/selected-import.png' });

  const dlPromise = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button, a')).find(x => /Download Template/i.test(x.innerText || ''));
    if (b) b.click();
  });
  const dl = await dlPromise;
  if (dl) {
    const p = OUT + '/' + dl.suggestedFilename();
    await dl.saveAs(p);
    console.log('DOWNLOADED:', p, fs.statSync(p).size);
  } else console.log('no download event');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
