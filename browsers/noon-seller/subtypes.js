const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  const typeWanted = process.argv[2];
  const combos = page.locator('[role="combobox"]');
  if (typeWanted) {
    await combos.nth(0).click();
    await page.waitForTimeout(1200);
    await page.locator('[role="option"]', { hasText: new RegExp('^' + typeWanted + '$', 'i') }).first().click();
    await page.waitForTimeout(2500);
  }
  await combos.nth(1).click();
  await page.waitForTimeout(1500);
  const opts = await page.evaluate(() => {
    const lists = Array.from(document.querySelectorAll('[role="listbox"]'));
    const last = lists[lists.length - 1];
    return last ? Array.from(last.querySelectorAll('[role="option"]')).map(o => (o.innerText || '').trim()) : [];
  });
  console.log('TYPE', typeWanted || '(cur)', '=> SUBTYPES', JSON.stringify(opts));
  await page.keyboard.press('Escape');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
