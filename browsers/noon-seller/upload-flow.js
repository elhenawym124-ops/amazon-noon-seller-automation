const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  const action = process.argv[2];

  if (action === 'next') {
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(x => (x.innerText || '').trim() === 'Next' && !x.disabled);
      if (b) b.click();
    });
    await page.waitForTimeout(6000);
    console.log('URL:', page.url());
    console.log('TEXT:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 1800));
    const inputs = await page.evaluate(() => Array.from(document.querySelectorAll('input')).map(i => ({ type: i.type, name: i.name, id: i.id, ph: i.placeholder, accept: i.accept })));
    console.log('INPUTS:', JSON.stringify(inputs));
    await page.screenshot({ path: 'H:/amzain mina/browsers/noon-seller/upload-step.png' });
  }

  if (action === 'upload') {
    const file = process.argv[3];
    const input = page.locator('input[type="file"]');
    const n = await input.count();
    console.log('file inputs:', n);
    if (n) {
      await input.first().setInputFiles(file);
      await page.waitForTimeout(8000);
      console.log('TEXT AFTER UPLOAD:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 1500));
      await page.screenshot({ path: 'H:/amzain mina/browsers/noon-seller/uploaded.png' });
    }
  }

  if (action === 'submit') {
    const before = await page.evaluate(() => document.body.innerText.length);
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(x => /^(Submit|Upload|Confirm|Create Import|Start Import)$/i.test((x.innerText || '').trim()) && !x.disabled);
      if (b) { b.click(); return b.innerText; }
    });
    await page.waitForTimeout(9000);
    console.log('URL:', page.url());
    console.log('TEXT:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 1500));
    await page.screenshot({ path: 'H:/amzain mina/browsers/noon-seller/submitted.png' });
  }

  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
