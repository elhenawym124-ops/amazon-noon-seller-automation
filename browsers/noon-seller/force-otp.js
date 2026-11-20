const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const EMAIL = 'btoo3e3lanat1@gmail.com';
const SHOT = 'H:/amzain mina/browsers/noon-seller/';

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('login.noon.partners')) || ctx.pages()[0];
  await page.bringToFront();

  const posts = [];
  page.on('response', async r => {
    if (['POST', 'PUT'].includes(r.request().method()) || /otp|verify|auth|login/i.test(r.url())) {
      let body = '';
      try { body = (await r.text()).slice(0, 400); } catch (e) {}
      posts.push(r.request().method() + ' ' + r.status() + ' ' + r.url().slice(0, 140) + ' => ' + body);
    }
  });

  await page.goto('https://login.noon.partners/en', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2500);
  const input = page.locator('input[name="channelIdentifier"]');
  await input.fill(EMAIL);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(6000);

  const before = await page.evaluate(() => document.body.innerText.slice(0, 400));

  // force-enable + click the Email OTP button
  const clicked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => /Email OTP/i.test(b.innerText));
    if (!btn) return 'not-found';
    btn.removeAttribute('disabled');
    btn.disabled = false;
    btn.style.pointerEvents = 'auto';
    btn.click();
    return 'clicked';
  });
  console.log('force click:', clicked);
  await page.waitForTimeout(9000);

  console.log('---TEXT AFTER---');
  console.log(await page.evaluate(() => document.body.innerText.slice(0, 900)));
  console.log('---NETWORK---');
  console.log(posts.slice(-15).join('\n') || '(nothing)');
  await page.screenshot({ path: SHOT + 's4-forced.png' });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
