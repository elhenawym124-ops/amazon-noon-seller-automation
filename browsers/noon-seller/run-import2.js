const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

async function waitCombos(page, n, tries = 12) {
  for (let i = 0; i < tries; i++) {
    const c = await page.locator('[role="combobox"]').count().catch(() => 0);
    if (c >= n) return true;
    await page.waitForTimeout(3000);
  }
  return false;
}

async function pick(page, idx, label) {
  const combos = page.locator('[role="combobox"]');
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await combos.nth(idx).click({ timeout: 15000 });
      await page.waitForTimeout(1200);
      const opt = page.locator('[role="option"]', { hasText: new RegExp('^' + label + '$') }).first();
      if (await opt.count()) {
        await opt.click({ timeout: 10000 });
        await page.waitForTimeout(2200);
        const txt = (await combos.nth(idx).innerText()).trim();
        if (txt.startsWith(label.slice(0, 6))) return true;
      } else {
        await page.keyboard.press('Escape');
      }
    } catch (e) { }
    await page.waitForTimeout(2500);
  }
  return false;
}

(async () => {
  const [file, type, subtype] = process.argv.slice(2);
  const browser = await chromium.connectOverCDP('http://localhost:9222', { timeout: 60000 });
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  await page.goto('https://noon-catalog.noon.partners/en/imports/create?project=PRJ101488', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
  const ok = await waitCombos(page, 2);
  console.log('combos ready:', ok);

  console.log('type picked:', await pick(page, 0, type), type);
  console.log('subtype picked:', await pick(page, 1, subtype), subtype);

  const nextClicked = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => (x.innerText || '').trim() === 'Next' && !x.disabled);
    if (b) { b.click(); return true; }
    return false;
  });
  console.log('next clicked:', nextClicked);
  await page.waitForTimeout(6000);

  if (!(await page.locator('input[type="file"]').count())) {
    console.log('NO FILE INPUT. page:', (await page.evaluate(() => document.body.innerText)).slice(0, 400).replace(/\n+/g, ' | '));
    await browser.close();
    return;
  }
  await page.locator('input[type="file"]').first().setInputFiles(file);
  await page.waitForTimeout(7000);
  console.log('attached:', await page.evaluate(() => document.body.innerText.includes('Remove file')));

  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => (x.innerText || '').trim() === 'Submit' && !x.disabled);
    if (b) b.click();
  });
  await page.waitForTimeout(12000);
  console.log('URL after submit:', page.url());
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
