const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const url = process.argv[2] || 'https://login.noon.partners/en/login';
  const shot = process.argv[3] || 'H:/amzain mina/browsers/noon-seller/shot.png';
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon')) || ctx.pages()[0];
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  console.log('URL:', page.url());
  console.log('TITLE:', await page.title());
  await page.screenshot({ path: shot, fullPage: false });
  const text = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 1200) : '');
  console.log('---TEXT---\n' + text);
  const els = await page.evaluate(() => Array.from(document.querySelectorAll('input,button,select,a[href]')).slice(0, 50).map(el => ({
    tag: el.tagName, type: el.type || '', name: el.name || '', id: el.id || '',
    ph: el.placeholder || '', label: (el.getAttribute('aria-label') || '').slice(0, 50),
    txt: (el.innerText || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 60),
    href: (el.getAttribute('href') || '').slice(0, 90)
  })));
  console.log('---ELS---\n' + JSON.stringify(els, null, 1));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
