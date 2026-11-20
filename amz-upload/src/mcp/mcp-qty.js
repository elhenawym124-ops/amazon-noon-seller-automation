async (page) => {
  const skus = ['LVP-152'];
  const safe = async (fn, d) => { try { return await fn(); } catch (e) { return d; } };
  const results = [];

  const ensurePage = async () => {
    if (!page.url().includes('/myinventory/inventory')) {
      await safe(async () => page.goto('https://sellercentral.amazon.eg/myinventory/inventory?fulfilledBy=all&page=1&pageSize=25&sort=date_created_desc&status=all', { waitUntil: 'domcontentloaded', timeout: 90000 }), null);
      await page.waitForTimeout(14000);
    }
    if (!(await safe(async () => page.locator('input[placeholder*="Search SKU"]').count(), 0))) {
      await page.waitForTimeout(8000);
    }
  };
  await ensurePage();

  for (const sku of skus) {
    try {
      const box = page.locator('input[placeholder*="Search SKU"]').first();
      await box.click();
      await box.fill(sku);
      await box.press('Enter');
      await page.waitForTimeout(5000);

      const inputs = page.locator('input[type="text"]');
      const n = await inputs.count();
      let idx = -1, cur = null;
      for (let i = 0; i < n; i++) {
        const v = await inputs.nth(i).inputValue().catch(() => null);
        if (v === sku) { idx = i; break; }
      }
      if (idx < 0) { results.push({ sku, err: 'row not found' }); continue; }
      // quantity input is the text input right after the SKU input
      const qtyInput = inputs.nth(idx + 1);
      cur = await qtyInput.inputValue().catch(() => null);

      if (cur === '99') { results.push({ sku, ok: true, already: true }); continue; }

      await qtyInput.click();
      await qtyInput.fill('99');
      await qtyInput.press('Enter');
      await page.waitForTimeout(2500);
      const after = await qtyInput.inputValue().catch(() => null);
      results.push({ sku, from: cur, to: after, ok: after === '99' });
    } catch (e) {
      results.push({ sku, err: String(e).slice(0, 60) });
    }
  }
  return results;
}
