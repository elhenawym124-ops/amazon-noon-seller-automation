const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

async function optionsOf(page, idx) {
  const combos = page.locator('[role="combobox"]');
  await combos.nth(idx).click();
  await page.waitForTimeout(1200);
  const opts = await page.evaluate(() => {
    const lists = Array.from(document.querySelectorAll('[role="listbox"]'));
    const last = lists[lists.length - 1];
    return last ? Array.from(last.querySelectorAll('[role="option"]')).map(o => (o.innerText || '').trim()) : [];
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  return opts;
}

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  console.log('status opts:', JSON.stringify(await optionsOf(page, 2)));
  console.log('marketplace opts:', JSON.stringify(await optionsOf(page, 3)));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
