const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');
const OUT = 'H:/amzain/browsers/noon-seller/templates';
fs.mkdirSync(OUT, { recursive: true });

const before = new Set(fs.existsSync(OUT) ? fs.readdirSync(OUT) : []);

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  const client = await ctx.newCDPSession(page);
  await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: OUT });

  const state = async (tag) => {
    const s = await page.evaluate(() => Array.from(document.querySelectorAll('button')).filter(b => /download/i.test(b.innerText || '')).map(b => ((b.innerText || '').trim()) + ' disabled=' + b.disabled));
    console.log(tag, JSON.stringify(s));
  };
  await state('initial');

  // try clicking All categories radio
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('[role="radio"]')).find(r => /all categories/i.test(r.parentElement ? r.parentElement.innerText : ''));
    if (el) el.click();
  });
  await page.waitForTimeout(1500);
  await state('after all-categories');

  const cat = process.argv[2];
  if (cat) {
    await page.evaluate((c) => {
      const el = Array.from(document.querySelectorAll('button, div, span, li')).find(x => (x.innerText || '').trim() === c && x.offsetParent !== null);
      if (el) el.click();
    }, cat);
    await page.waitForTimeout(2000);
    await state('after category ' + cat);
  }

  const lang = process.argv[3] || 'Download English';
  await page.evaluate((l) => {
    const b = Array.from(document.querySelectorAll('button')).find(x => (x.innerText || '').trim() === l && !x.disabled);
    if (b) b.click();
  }, lang);
  await page.waitForTimeout(8000);

  const after = fs.readdirSync(OUT).filter(f => !before.has(f) && !f.endsWith('.crdownload'));
  console.log('NEW FILES:', after);
  await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/dl-attempt.png' });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
