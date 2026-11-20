async (page) => {
  const safe = async (fn, d) => { try { return await fn(); } catch (e) { return d; } };
  const out = {};

  // open chooser
  for (let i = 0; i < 5; i++) {
    if (await safe(async () => page.locator('input#kat-file-attachment').count(), 0)) break;
    await safe(async () => page.goto('https://sellercentral.amazon.eg/listing/status', { waitUntil: 'domcontentloaded', timeout: 60000 }), null);
    await page.waitForTimeout(6000);
    await safe(async () => page.getByRole('button', { name: 'Upload your spreadsheet' }).first().evaluate(el => el.click()), null);
    await page.waitForTimeout(11000);
    await safe(async () => page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 }), null);
    await page.waitForTimeout(16000);
  }
  await safe(async () => page.getByText('Download Blank Template').first().evaluate(el => el.click()), null);
  await page.waitForTimeout(5000);
  await safe(async () => page.getByRole('button', { name: 'Download Product Spreadsheet' }).first().evaluate(el => el.click()), null);
  await page.waitForTimeout(7000);

  const inp = page.locator('kat-input[data-testid="search-input"] input').first();
  for (const term of ['MEAT_TENDERIZER', 'BASTER', 'KITCHEN_TOOL']) {
    await inp.click();
    await inp.fill(term);
    await inp.press('Enter');
    await page.waitForTimeout(6000);
    const n = await safe(async () => page.getByRole('button', { name: 'Select' }).count(), 0);
    const names = await safe(async () => {
      const cards = await page.locator('kat-button').allInnerTexts().catch(() => []);
      return cards.slice(0, 6);
    }, []);
    const t = await safe(async () => page.evaluate(() => document.body.innerText), '');
    const idx = t.indexOf('Search Product Type');
    out[term] = { selectBtns: n, results: t.slice(idx, idx + 300).replace(/\n/g, ' | ') };
  }
  return out;
}
