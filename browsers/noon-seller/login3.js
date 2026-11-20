const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const EMAIL = 'btoo3e3lanat1@gmail.com';
const SHOT = 'H:/amzain mina/browsers/noon-seller/';

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('login.noon.partners')) || ctx.pages()[0];
  await page.bringToFront();

  const input = page.locator('input[name="channelIdentifier"]');
  await input.waitFor({ state: 'visible', timeout: 30000 });
  await input.fill(EMAIL);
  await page.waitForTimeout(600);
  const cont = page.locator('button[type="submit"]').first();
  console.log('continue disabled?', await cont.isDisabled());
  await cont.click();
  console.log('submitted');

  const state = async () => page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => ((b.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 30) || '-') + ':' + b.disabled).join(' | '));

  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(3000);
    console.log(i * 3 + 3 + 's:', await state());
  }
  await page.screenshot({ path: SHOT + 's3-wait.png' });
  console.log('URL:', page.url());
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
