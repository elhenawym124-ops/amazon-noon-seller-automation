const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');
const OUT = 'H:/amzain/browsers/noon-seller/templates';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  const name = process.argv[2] || 'NIS.xlsx';
  const btn = page.getByRole('button', { name: /^Download English( \+ Arabic)?$/ }).filter({ hasNotText: 'Arabic' }).first();
  const label = (await btn.innerText()).trim();

  const dlPromise = page.waitForEvent('download', { timeout: 60000 });
  await btn.click({ timeout: 20000 });
  const dl = await dlPromise;
  const target = OUT + '/' + name;
  try {
    await dl.saveAs(target);
    console.log('SAVED', label, '->', target, fs.statSync(target).size);
  } catch (e) {
    console.log('saveAs failed:', e.message.split('\n')[0]);
    console.log('failure:', await dl.failure());
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
