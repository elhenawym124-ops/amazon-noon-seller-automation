const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

const { email: EMAIL } = require('./account');
const SHOT = 'H:/amzain/browsers/noon-seller/';

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  let page = ctx.pages().find(p => p.url().includes('login.noon.partners')) || ctx.pages()[0];
  await page.bringToFront();

  // fresh start
  for (let i = 0; i < 4; i++) {
    try {
      await page.goto('https://login.noon.partners/en', { waitUntil: 'domcontentloaded', timeout: 45000 });
      break;
    } catch (e) {
      console.log('goto retry', i, e.message.split('\n')[0]);
      await page.waitForTimeout(4000);
    }
  }
  console.log('URL:', page.url());
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});

  const input = page.locator('input[name="channelIdentifier"]');
  await input.waitFor({ state: 'visible', timeout: 30000 });
  await input.fill(EMAIL);
  await page.waitForTimeout(400);
  await page.locator('button[type="submit"]').first().click();

  // wait for OTP option to become enabled
  const otpBtn = page.getByRole('button', { name: /Continue with Email OTP/i });
  await otpBtn.waitFor({ state: 'visible', timeout: 40000 });
  for (let i = 0; i < 30; i++) {
    const dis = await otpBtn.isDisabled().catch(() => true);
    if (!dis) break;
    await page.waitForTimeout(1000);
  }
  console.log('otp button disabled?', await otpBtn.isDisabled().catch(() => '?'));
  await page.screenshot({ path: SHOT + 's1-otp-option.png' });

  await otpBtn.click({ timeout: 20000 });
  await page.waitForTimeout(8000);
  await page.screenshot({ path: SHOT + 's2-otp-sent.png' });
  console.log('URL:', page.url());
  console.log('---TEXT---\n' + await page.evaluate(() => document.body.innerText.slice(0, 1200)));
  const els = await page.evaluate(() => Array.from(document.querySelectorAll('input,button')).map(el => ({
    tag: el.tagName, type: el.type || '', name: el.name || '', id: el.id || '',
    ph: el.placeholder || '', maxlength: el.maxLength,
    label: (el.getAttribute('aria-label') || '').slice(0, 60),
    disabled: el.disabled,
    txt: (el.innerText || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 70)
  })));
  console.log('---ELS---\n' + JSON.stringify(els, null, 1));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
