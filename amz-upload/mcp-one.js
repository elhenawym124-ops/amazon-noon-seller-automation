async (page) => {
  const safe = async (fn, dflt) => { try { return await fn(); } catch (e) { return dflt; } };
  const read = async () => safe(async () => {
    const t = await page.evaluate(() => document.body.innerText);
    const i = t.indexOf('Total SKUs');
    if (i < 0) return 'no-preview';
    return t.slice(i, i + 70).replace(/\n/g, ' | ');
  }, 'nav');

  let ok = false;
  for (let i = 0; i < 6; i++) {
    await safe(async () => page.goto('https://sellercentral.amazon.eg/listing/status', { waitUntil: 'domcontentloaded', timeout: 60000 }), null);
    await page.waitForTimeout(6000);
    await safe(async () => page.getByRole('button', { name: 'Upload your spreadsheet' }).first().evaluate(el => el.click()), null);
    await page.waitForTimeout(12000);
    if (await safe(async () => page.locator('input#kat-file-attachment').count(), 0)) { ok = true; break; }
    await safe(async () => page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 }), null);
    await page.waitForTimeout(16000);
    if (await safe(async () => page.locator('input#kat-file-attachment').count(), 0)) { ok = true; break; }
  }
  if (!ok) return { error: 'no form', url: page.url() };

  await page.locator('input#kat-file-attachment').setInputFiles('H:/amzain mina/amz-upload/X7_KT.xlsx');
  await page.waitForTimeout(3000);
  await page.locator('.upload-preview-btn').first().evaluate(el => el.click());
  let last = '';
  for (let k = 0; k < 9; k++) { await page.waitForTimeout(10000); last = await read(); }

  const rows = [];
  const rs = await page.locator('.ag-row').all();
  for (const r of rs.slice(0, 4)) rows.push((await r.innerText()).replace(/\n/g, ' | ').slice(0, 200));

  let submitted = false;
  if (/Action required \| 0/.test(last)) {
    await page.locator('.submit-button').first().evaluate(el => el.click());
    await page.waitForTimeout(3000);
    const dlg = page.getByText('Submit with errors', { exact: true });
    if (await dlg.count()) await dlg.first().evaluate(el => el.click());
    await page.waitForTimeout(12000);
    submitted = true;
  }
  return { last, rows, submitted, url: page.url() };
}
