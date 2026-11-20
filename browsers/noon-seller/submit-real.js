const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];

  const net = [];
  page.on('request', r => { if (/import|upload|submit|catalog/i.test(r.url()) && r.method() !== 'GET') net.push(r.method() + ' ' + r.url().slice(0, 140)); });
  page.on('response', async r => { if (/import|upload|submit/i.test(r.url()) && r.request().method() !== 'GET') { let t = ''; try { t = (await r.text()).slice(0, 300); } catch (e) {} net.push('  -> ' + r.status() + ' ' + t); } });
  page.on('console', m => { if (m.type() === 'error') net.push('CONSOLE ' + m.text().slice(0, 200)); });

  const btn = page.getByRole('button', { name: /^Submit$/ });
  await btn.scrollIntoViewIfNeeded();
  await btn.click({ timeout: 15000 }).catch(e => console.log('click err', e.message.split('\n')[0]));
  await page.waitForTimeout(12000);

  console.log('URL:', page.url());
  console.log('TEXT:', (await page.evaluate(() => document.body.innerText)).slice(0, 600).replace(/\n+/g, ' | '));
  console.log('NET:', net.slice(0, 15).join('\n') || '(none)');
  await page.screenshot({ path: 'H:/amzain/browsers/noon-seller/submit3.png' });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
