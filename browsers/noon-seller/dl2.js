const { chromium } = require('C:/Users/mokhtar/AppData/Local/Programs/nodejs/node_modules/playwright');
const fs = require('fs');
const OUT = 'H:/amzain/browsers/noon-seller/templates';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('noon-catalog')) || ctx.pages()[0];
  const client = await ctx.newCDPSession(page);
  await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: OUT });

  const before = new Set(fs.readdirSync(OUT));
  const net = [];
  page.on('response', async r => {
    const u = r.url();
    const ct = r.headers()['content-type'] || '';
    if (/xlsx|sheet|csv|excel|template|blob/i.test(u + ct)) net.push(r.status() + ' ' + u.slice(0, 150) + ' ' + ct);
  });
  page.on('popup', p => net.push('POPUP ' + p.url()));
  page.on('console', m => { if (m.type() === 'error') net.push('CONSOLE ' + m.text().slice(0, 150)); });

  const btn = page.getByRole('button', { name: /^Download English$/ });
  console.log('enabled:', await btn.isEnabled());
  const dlPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
  await btn.click({ timeout: 20000 }).catch(e => console.log('click err', e.message.split('\n')[0]));
  const dl = await dlPromise;
  console.log('download event:', dl ? dl.suggestedFilename() : 'none');
  if (dl) {
    const p = OUT + '/' + dl.suggestedFilename();
    await dl.saveAs(p);
    console.log('saved', p, fs.statSync(p).size);
  }
  await page.waitForTimeout(6000);
  const after = fs.readdirSync(OUT).filter(f => !before.has(f));
  console.log('NEW FILES:', after);
  console.log('NET:', net.slice(0, 10).join('\n') || '(none)');
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
