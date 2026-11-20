async (page) => {
  const safe = async (fn, d) => { try { return await fn(); } catch (e) { return d; } };
  const read = async () => safe(async () => {
    const t = await page.evaluate(() => document.body.innerText);
    const i = t.indexOf('Total SKUs');
    if (i < 0) return 'no-preview';
    return t.slice(i, i + 70).replace(/\n/g, ' | ');
  }, 'nav');

  const ensureForm = async () => {
    for (let i = 0; i < 5; i++) {
      if (await safe(async () => page.locator('input#kat-file-attachment').count(), 0)) return true;
      await safe(async () => page.goto('https://sellercentral.amazon.eg/listing/status', { waitUntil: 'domcontentloaded', timeout: 60000 }), null);
      await page.waitForTimeout(6000);
      await safe(async () => page.getByRole('button', { name: 'Upload your spreadsheet' }).first().evaluate(el => el.click()), null);
      await page.waitForTimeout(11000);
      if (await safe(async () => page.locator('input#kat-file-attachment').count(), 0)) return true;
      await safe(async () => page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 }), null);
      await page.waitForTimeout(18000);
    }
    return false;
  };

  const files = ['Q3_test.xlsx'];
  const out = [];
  for (const f of files) {
    if (!(await ensureForm())) { out.push({ f, error: 'no form' }); continue; }
    await safe(async () => page.locator('input#kat-file-attachment').setInputFiles('H:/amzain/amz-upload/output/feeds/' + f), null);
    await page.waitForTimeout(3000);
    await safe(async () => page.locator('.upload-preview-btn').first().evaluate(el => el.click()), null);
    let last = '';
    for (let k = 0; k < 9; k++) { await page.waitForTimeout(10000); last = await read(); }
    let submitted = false;
    if (/Total SKUs \| [1-9]/.test(last) && !/Loading/.test(last)) {
      await safe(async () => page.locator('.submit-button').first().evaluate(el => el.click()), null);
      await page.waitForTimeout(3000);
      const dlg = page.getByText('Submit with errors', { exact: true });
      if (await safe(async () => dlg.count(), 0)) await safe(async () => dlg.first().evaluate(el => el.click()), null);
      await page.waitForTimeout(12000);
      submitted = true;
    }
    out.push({ f, last, submitted, ref: (page.url().match(/reference_id=(\d+)/) || [])[1] || null });
  }
  return out;
}
