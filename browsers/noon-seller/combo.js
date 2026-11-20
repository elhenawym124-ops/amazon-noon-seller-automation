const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);

  const combos = page.locator('[role="combobox"]');
  const n = await combos.count();
  const labels = [];
  for (let i = 0; i < n; i++) labels.push((await combos.nth(i).innerText()).trim().replace(/\s+/g, ' '));
  console.log('comboboxes:', JSON.stringify(labels));

  const idx = Number(process.argv[2] ?? 1);
  await combos.nth(idx).click();
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => {
    const lists = Array.from(document.querySelectorAll('[role="listbox"]'));
    return lists.map(l => ({ label: l.getAttribute('aria-label'), opts: Array.from(l.querySelectorAll('[role="option"]')).map(o => (o.innerText || '').trim()) }));
  });
  console.log('LISTS:', JSON.stringify(info));
  await page.screenshot({ path: 'H:/amzain mina/browsers/noon-seller/combo-' + idx + '.png' });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
