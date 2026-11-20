const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('login.noon.partners')) || ctx.pages()[0];

  const failed = [];
  const errors = [];
  page.on('requestfailed', r => failed.push(r.url().slice(0, 120) + ' :: ' + (r.failure() || {}).errorText));
  page.on('response', r => { if (r.status() >= 400) failed.push('HTTP ' + r.status() + ' ' + r.url().slice(0, 120)); });
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(e => console.log('reload err', e.message));
  await page.waitForTimeout(15000);
  console.log('---FAILED REQS---');
  console.log([...new Set(failed)].slice(0, 25).join('\n') || '(none)');
  console.log('---CONSOLE ERRORS---');
  console.log([...new Set(errors)].slice(0, 15).join('\n') || '(none)');
  console.log('---BUTTON STATES---');
  console.log(await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => ({
    t: (b.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40),
    disabled: b.disabled,
    aria: b.getAttribute('aria-disabled'),
    dataState: b.getAttribute('data-state'),
    cls: b.className.slice(0, 60)
  }))));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
