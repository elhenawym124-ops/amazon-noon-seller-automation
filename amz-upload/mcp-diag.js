async (page) => {
  const safe = async (fn, dflt) => { try { return await fn(); } catch (e) { return dflt; } };
  const read = async () => safe(async () => {
    const t = await page.evaluate(() => document.body.innerText);
    const i = t.indexOf('Total SKUs');
    if (i < 0) return 'no-preview';
    return t.slice(i, i + 70).replace(/\n/g, ' | ');
  }, 'nav');

  // ensure form
  for (let i = 0; i < 4; i++) {
    const n = await safe(async () => page.locator('input#kat-file-attachment').count(), 0);
    if (n > 0) break;
    await safe(async () => page.goto('https://sellercentral.amazon.eg/listing/status', { waitUntil: 'domcontentloaded', timeout: 60000 }), null);
    await page.waitForTimeout(5000);
    await safe(async () => page.getByRole('button', { name: 'Upload your spreadsheet' }).first().click(), null);
    await page.waitForTimeout(10000);
  }
  await page.locator('input#kat-file-attachment').setInputFiles('H:/amzain mina/amz-upload/X3_ORG.xlsx');
  await page.waitForTimeout(2500);
  await page.locator('.upload-preview-btn').first().click();
  let last = '';
  for (let k = 0; k < 8; k++) { await page.waitForTimeout(10000); last = await read(); }

  // focus on errors
  await safe(async () => page.getByText('Focus on errors', { exact: true }).first().click(), null);
  await page.waitForTimeout(3000);
  const headers = await safe(async () => page.locator('.ag-header-cell').filter({ has: page.locator('.workbook-error-icon') }).allInnerTexts(), []);

  // open each error popover
  const pops = [];
  const icons = page.locator('.cell-error-icon');
  const n = await icons.count();
  for (let i = 0; i < Math.min(n, 5); i++) {
    const cell = await safe(async () => icons.nth(i).evaluate(e => {
      const c = e.closest('.ag-cell'); const r = e.closest('.ag-row');
      const skuEl = r ? r.querySelector('[col-id*="contribution_sku"]') : null;
      return { col: c ? c.getAttribute('col-id') : null, sku: skuEl ? skuEl.innerText.trim() : '' };
    }), {});
    await safe(async () => icons.nth(i).click(), null);
    await page.waitForTimeout(1200);
    const txt = await safe(async () => page.evaluate(() => {
      const els = [...document.querySelectorAll('[id^=smart-sheets-]')].filter(x => !/tooltip-trigger/.test(x.id));
      const e = els.pop();
      return e ? e.innerText.trim().slice(0, 300) : null;
    }), null);
    pops.push({ cell, txt });
  }
  return { last, headers, pops, total_icons: n };
}
