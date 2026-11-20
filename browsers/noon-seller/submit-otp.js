const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const SHOT = 'H:/amzain mina/browsers/noon-seller/';

(async () => {
  const code = (process.argv[2] || '').replace(/\D/g, '');
  if (code.length !== 6) { console.error('USAGE: node submit-otp.js 123456'); process.exit(2); }

  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('login.noon.partners')) || ctx.pages()[0];
  await page.bringToFront();

  const input = page.locator('input[aria-label="otp-input"]');
  await input.waitFor({ state: 'visible', timeout: 20000 });
  await input.click();
  await input.fill('');
  await input.type(code, { delay: 90 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: SHOT + 'code-entered.png' });

  const cont = page.getByRole('button', { name: /^Continue$/ }).first();
  const dis = await cont.isDisabled().catch(() => true);
  console.log('continue disabled after typing:', dis);
  if (dis) {
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(x => /^Continue$/.test((x.innerText || '').trim()));
      if (b) { b.removeAttribute('disabled'); b.disabled = false; b.style.pointerEvents = 'auto'; b.click(); }
    });
  } else {
    await cont.click();
  }

  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(4000);
    const u = page.url();
    if (!u.includes('login.noon.partners/en') || i === 11) break;
  }
  await page.waitForTimeout(3000);
  console.log('FINAL URL:', page.url());
  console.log('TITLE:', await page.title());
  console.log('TEXT:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 1500));
  await page.screenshot({ path: SHOT + 'after-otp.png', fullPage: false });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
