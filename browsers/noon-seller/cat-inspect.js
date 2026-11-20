const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];
  const info = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('[role], button, label, input'));
    const near = nodes.filter(n => /Kitchen & Dining/.test(n.innerText || n.value || n.getAttribute('aria-label') || ''));
    return near.slice(0, 12).map(n => ({
      tag: n.tagName, role: n.getAttribute('role'), aria: n.getAttribute('aria-label'),
      checked: n.getAttribute('aria-checked') || n.checked,
      cls: (n.className || '').toString().slice(0, 80),
      txt: (n.innerText || '').trim().slice(0, 40)
    }));
  });
  console.log(JSON.stringify(info, null, 1));
  await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/cat-state.png' });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
