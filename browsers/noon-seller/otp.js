const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('login.noon.partners')) || ctx.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1500);
  const btn = page.getByRole('button', { name: /Continue with Email OTP/i });
  await btn.click();
  await page.waitForTimeout(7000);
  console.log('URL:', page.url());
  await page.screenshot({ path: 'H:/amzain mina/browsers/noon-seller/otp-step.png' });
  console.log('---TEXT---\n' + await page.evaluate(() => document.body.innerText.slice(0, 1500)));
  const els = await page.evaluate(() => Array.from(document.querySelectorAll('input,button')).map(el => ({
    tag: el.TAGNAME || el.tagName, type: el.type || '', name: el.name || '', id: el.id || '',
    ph: el.placeholder || '', maxlength: el.maxLength, label: (el.getAttribute('aria-label') || '').slice(0, 60),
    txt: (el.innerText || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 70)
  })));
  console.log('---ELS---\n' + JSON.stringify(els, null, 1));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
