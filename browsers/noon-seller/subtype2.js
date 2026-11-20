const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');
const OUT = 'H:/amzain mina/browsers/noon-seller/templates';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  await page.locator('#_r_5_-sub_type').click();
  await page.waitForTimeout(1800);
  const opts = await page.evaluate(() => Array.from(document.querySelectorAll('[role="option"]')).map(o => (o.innerText || '').trim().replace(/\s+/g, ' ')));
  console.log('SUBTYPES:', JSON.stringify(opts));
  await page.screenshot({ path: 'H:/amzain mina/browsers/noon-seller/subtype2.png' });

  const pick = process.argv[2];
  if (pick) {
    await page.locator('[role="option"]', { hasText: new RegExp('^' + pick.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }).first().click();
    await page.waitForTimeout(3000);
    console.log('TEXT:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 1200));
    const dlPromise = page.waitForEvent('download', { timeout: 45000 }).catch(() => null);
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(x => /Download Template/i.test(x.innerText || ''));
      if (b) b.click();
    });
    const dl = await dlPromise;
    if (dl) {
      const p = OUT + '/' + dl.suggestedFilename();
      await dl.saveAs(p);
      console.log('DOWNLOADED:', p, fs.statSync(p).size);
    } else console.log('no download event');
    await page.screenshot({ path: 'H:/amzain mina/browsers/noon-seller/subtype-picked.png' });
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
