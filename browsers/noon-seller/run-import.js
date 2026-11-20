const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const file = process.argv[2];
  if (!file) { console.error('usage: node run-import.js <xlsx>'); process.exit(2); }

  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  await page.goto('https://noon-catalog.noon.partners/en/imports/create?project=PRJ101488', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const combos = page.locator('[role="combobox"]');
  await combos.nth(0).click();
  await page.waitForTimeout(1200);
  await page.locator('[role="option"]', { hasText: /^Content$/ }).first().click();
  await page.waitForTimeout(2200);

  await combos.nth(1).click();
  await page.waitForTimeout(1200);
  await page.locator('[role="option"]', { hasText: /^NIS Create\/Update$/ }).first().click();
  await page.waitForTimeout(3500);

  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => (x.innerText || '').trim() === 'Next' && !x.disabled);
    if (b) b.click();
  });
  await page.waitForTimeout(5000);

  const input = page.locator('input[type="file"]');
  await input.first().setInputFiles(file);
  await page.waitForTimeout(7000);
  const attached = await page.evaluate(() => document.body.innerText.includes('Remove file'));
  console.log('file attached:', attached);

  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => (x.innerText || '').trim() === 'Submit' && !x.disabled);
    if (b) b.click();
  });
  await page.waitForTimeout(15000);
  console.log('URL:', page.url());
  console.log('TEXT:', (await page.evaluate(() => document.body.innerText)).slice(0, 800).replace(/\n+/g, ' | '));
  await page.screenshot({ path: 'H:/amzain mina/browsers/noon-seller/import-done.png' });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
