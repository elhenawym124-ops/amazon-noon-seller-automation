const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  await page.goto('https://noon-catalog.noon.partners/en/imports/create?project=PRJ101488', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(7000);

  const combos = page.locator('[role="combobox"]');
  await combos.nth(0).click();
  await page.waitForTimeout(1200);
  await page.locator('[role="option"]', { hasText: /^Pricing$/ }).first().click();
  await page.waitForTimeout(2500);

  await combos.nth(1).click();
  await page.waitForTimeout(1200);
  await page.locator('[role="option"]', { hasText: /^Price Update$/ }).first().click();
  await page.waitForTimeout(3500);

  // list the selectors on the "Customized export" block
  const info = await page.evaluate(() => {
    const combos = Array.from(document.querySelectorAll('[role="combobox"]')).map((c, i) => ({ i, txt: (c.innerText || '').trim().slice(0, 40), id: c.id }));
    const btns = Array.from(document.querySelectorAll('button')).map((b, i) => ({ i, txt: (b.innerText || '').trim().slice(0, 30), disabled: b.disabled }));
    return { combos, btns: btns.filter(b => b.txt) };
  });
  console.log(JSON.stringify(info, null, 1));
  await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/pricing-step.png' });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
