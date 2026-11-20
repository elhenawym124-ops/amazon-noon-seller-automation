const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];
  const sel = await page.evaluate(() => Array.from(document.querySelectorAll('select, [role="combobox"], [role="listbox"]')).map((el, i) => ({
    i, tag: el.tagName, id: el.id, cls: (el.className || '').slice(0, 60),
    options: el.tagName === 'SELECT' ? Array.from(el.options).map(o => o.value + ':' + o.text) : null,
    text: (el.innerText || '').trim().slice(0, 80)
  })));
  console.log(JSON.stringify(sel, null, 1));
  const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map((b, i) => i + ': ' + (b.innerText || b.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40)).filter(s => s.length > 3));
  console.log('BUTTONS:\n' + btns.join('\n'));
  await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/import-create2.png' });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
