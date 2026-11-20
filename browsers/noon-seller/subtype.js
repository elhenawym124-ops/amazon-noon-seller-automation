const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');

const OUT = 'H:/amzain mina/browsers/noon-seller/templates';
fs.mkdirSync(OUT, { recursive: true });

async function openCombo(page, label) {
  const clicked = await page.evaluate((lbl) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const b = buttons.find(x => (x.innerText || '').trim() === lbl);
    if (b) { b.click(); return true; }
    return false;
  }, label);
  await page.waitForTimeout(1800);
  const opts = await page.evaluate(() => Array.from(document.querySelectorAll('[role="option"]')).map(o => (o.innerText || '').trim().replace(/\s+/g, ' ')));
  return { clicked, opts };
}

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  const mode = process.argv[2] || 'list';

  if (mode === 'list') {
    const r = await openCombo(page, 'Select the import subtype');
    console.log('subtype options:', JSON.stringify(r.opts));
    await page.screenshot({ path: 'H:/amzain mina/browsers/noon-seller/subtype.png' });
  }

  if (mode === 'pick') {
    const label = process.argv[3];
    const clicked = await page.evaluate((lbl) => {
      const btn = Array.from(document.querySelectorAll('button')).find(x => (x.innerText || '').trim() === 'Select the import subtype' || /Import Subtype/i.test(x.parentElement ? x.parentElement.innerText : ''));
      if (btn) btn.click();
      return !!btn;
    }, label);
    await page.waitForTimeout(1500);
    await page.locator('[role="option"]', { hasText: new RegExp(label, 'i') }).first().click();
    await page.waitForTimeout(3000);
    console.log('TEXT:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 1200));

    const dlPromise = page.waitForEvent('download', { timeout: 45000 }).catch(() => null);
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(x => /Download Template/i.test(x.innerText || ''));
      if (b) b.click();
    });
    const dl = await dlPromise;
    if (dl) {
      const p = OUT + '/' + dl.suggestedFilename();
      await dl.saveAs(p);
      console.log('DOWNLOADED:', p, fs.statSync(p).size);
    } else console.log('no download');
    await page.screenshot({ path: 'H:/amzain mina/browsers/noon-seller/subtype-picked.png' });
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
