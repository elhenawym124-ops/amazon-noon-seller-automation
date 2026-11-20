const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const pages = ctx.pages();
  console.log('pages:', pages.length);
  for (const p of pages) {
    console.log('PAGE', JSON.stringify(p.url()), await p.title().catch(() => '?'));
  }
  const page = pages.find(p => p.url().includes('noon')) || pages[0];
  await page.bringToFront();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/shot1.png' });
  const text = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 1500) : 'no body');
  console.log('---TEXT---');
  console.log(text);
  console.log('---INPUTS---');
  const inputs = await page.evaluate(() => Array.from(document.querySelectorAll('input,button,a')).slice(0, 40).map(el => ({
    tag: el.tagName,
    type: el.type || '',
    name: el.name || '',
    id: el.id || '',
    ph: el.placeholder || '',
    txt: (el.innerText || el.value || '').trim().slice(0, 60),
    href: (el.getAttribute('href') || '').slice(0, 80)
  })));
  console.log(JSON.stringify(inputs, null, 1));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
