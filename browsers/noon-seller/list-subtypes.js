const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const type = process.argv[2];
  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  await page.goto('https://noon-catalog.noon.partners/en/imports/create?project=PRJ101488', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(8000);

  const combos = page.locator('[role="combobox"]');
  for (let i = 0; i < 15; i++) { if (await combos.count() >= 2) break; await page.waitForTimeout(2500); }

  await combos.nth(0).click();
  await page.waitForTimeout(1500);
  await page.locator('[role="option"]', { hasText: new RegExp('^' + type + '$', 'i') }).first().click();
  await page.waitForTimeout(3000);

  await combos.nth(1).click();
  await page.waitForTimeout(1500);
  const opts = await page.evaluate(() => {
    const lists = Array.from(document.querySelectorAll('[role="listbox"]'));
    const last = lists[lists.length - 1];
    return last ? Array.from(last.querySelectorAll('[role="option"]')).map(o => (o.innerText || '').trim()) : [];
  });
  console.log(type, '=>', JSON.stringify(opts));
  await page.keyboard.press('Escape');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
