const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const { email: EMAIL } = require('./account');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('login.noon.partners')) || ctx.pages()[0];

  const failed = new Map();
  const reqs = [];
  page.on('requestfailed', r => failed.set(r.url().slice(0, 150), (r.failure() || {}).errorText));
  page.on('request', r => reqs.push(r.url()));
  const resp = [];
  page.on('response', r => { resp.push(r.status() + ' ' + r.url().slice(0, 130)); });

  await page.goto('https://login.noon.partners/en', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
  const input = page.locator('input[name="channelIdentifier"]');
  await input.fill(EMAIL);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(12000);

  console.log('---FAILED---');
  for (const [u, e] of failed) console.log(e, '::', u);
  console.log('---POSTS (non-200) ---');
  console.log(resp.filter(r => !r.startsWith('200') && !r.startsWith('204') && !r.startsWith('304')).slice(0, 30).join('\n'));
  console.log('---API CALLS---');
  console.log([...new Set(reqs.filter(u => /api|graphql|auth|login|v1|v2/.test(u)))].slice(0, 30).join('\n'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
