const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

async function pick(page, idx, label) {
  const combos = page.locator('[role="combobox"]');
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await combos.nth(idx).click({ timeout: 15000 });
      await page.waitForTimeout(1200);
      const opt = page.locator('[role="option"]', { hasText: new RegExp('^' + label + '$', 'i') }).first();
      if (await opt.count()) { await opt.click({ timeout: 10000 }); await page.waitForTimeout(2500); return true; }
      await page.keyboard.press('Escape');
    } catch (e) { }
    await page.waitForTimeout(2000);
  }
  return false;
}

(async () => {
  const [file, type] = process.argv.slice(2);
  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  await page.goto('https://noon-catalog.noon.partners/en/imports/create?project=PRJ101488', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(9000);

  const combos = page.locator('[role="combobox"]');
  for (let i = 0; i < 15; i++) { if (await combos.count() >= 1) break; await page.waitForTimeout(2500); }
  console.log('combos:', await combos.count());

  console.log('type:', await pick(page, 0, type));

  const next = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => (x.innerText || '').trim() === 'Next' && !x.disabled);
    if (b) { b.click(); return true; }
    return false;
  });
  console.log('next:', next);
  await page.waitForTimeout(6000);

  if (!(await page.locator('input[type="file"]').count())) {
    console.log('NO FILE INPUT:', (await page.evaluate(() => document.body.innerText)).slice(0, 300).replace(/\n+/g, ' | '));
    await browser.close();
    return;
  }
  await page.locator('input[type="file"]').first().setInputFiles(file);
  await page.waitForTimeout(8000);
  console.log('attached:', await page.evaluate(() => document.body.innerText.includes('Remove file')));

  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => (x.innerText || '').trim() === 'Submit' && !x.disabled);
    if (b) b.click();
  });
  await page.waitForTimeout(12000);
  console.log('URL:', page.url());
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
