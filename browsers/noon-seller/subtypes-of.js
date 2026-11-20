const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];
  await page.keyboard.press('Escape');

  const typeLabel = process.argv[2];
  if (typeLabel) {
    await page.locator('#_r_5_-type').click();
    await page.waitForTimeout(1200);
    await page.locator('[role="option"]', { hasText: new RegExp('^' + typeLabel + '$', 'i') }).first().click();
    await page.waitForTimeout(2500);
  }

  await page.locator('#_r_5_-sub_type').click();
  await page.waitForTimeout(1500);
  const opts = await page.evaluate(() => Array.from(document.querySelectorAll('[role="option"]')).map(o => (o.innerText || '').trim().replace(/\s+/g, ' ')));
  console.log('TYPE:', typeLabel || '(current)', 'SUBTYPES:', JSON.stringify(opts));
  await page.keyboard.press('Escape');
  await page.screenshot({ path: 'H:/amzain mina/browsers/noon-seller/subtype-' + (typeLabel || 'cur') + '.png' });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
