const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const email = 'btoo3e3lanat1@gmail.com';
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('login.noon.partners')) || ctx.pages()[0];
  if (!page.url().includes('login.noon.partners')) {
    await page.goto('https://login.noon.partners/en', { waitUntil: 'domcontentloaded', timeout: 60000 });
  }
  await page.waitForTimeout(2500);

  const input = page.locator('input[name="channelIdentifier"]');
  await input.click();
  await input.fill('');
  await input.type(email, { delay: 60 });
  await page.waitForTimeout(500);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(6000);

  console.log('URL:', page.url());
  await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/after-email.png' });
  console.log('---TEXT---\n' + await page.evaluate(() => document.body.innerText.slice(0, 1500)));
  const els = await page.evaluate(() => Array.from(document.querySelectorAll('input,button')).map(el => ({
    tag: el.tagName, type: el.type || '', name: el.name || '', id: el.id || '',
    ph: el.placeholder || '', label: (el.getAttribute('aria-label') || '').slice(0, 60),
    txt: (el.innerText || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 70)
  })));
  console.log('---ELS---\n' + JSON.stringify(els, null, 1));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
