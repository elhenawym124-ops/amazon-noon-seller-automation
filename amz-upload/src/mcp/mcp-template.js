async (page) => {
  const safe = async (fn, d) => { try { return await fn(); } catch (e) { return d; } };
  const log = [];

  // open template chooser
  await safe(async () => page.getByText('Download Blank Template').first().evaluate(el => el.click()), null);
  await page.waitForTimeout(5000);
  await safe(async () => page.getByRole('button', { name: 'Download Product Spreadsheet' }).first().evaluate(el => el.click()), null);
  await page.waitForTimeout(7000);
  log.push({ step: 'chooser', url: page.url(), search: await safe(async () => page.locator('kat-input[data-testid="search-input"] input').count(), 0) });

  // language -> Arabic (skip if already)
  const head = page.locator('.select-header').first();
  const cur = await safe(async () => head.getAttribute('title'), null);
  if (cur && !/Arabic/.test(cur)) {
    await safe(async () => head.evaluate(el => el.click()), null);
    await page.waitForTimeout(2000);
    const ar = page.locator('.select-option, [role=option]').filter({ hasText: 'Arabic' }).first();
    if (await safe(async () => ar.count(), 0)) await safe(async () => ar.evaluate(el => el.click()), null);
    await page.waitForTimeout(2000);
  }
  log.push({ step: 'lang', title: await safe(async () => head.getAttribute('title'), null) });

  // search
  const inp = page.locator('kat-input[data-testid="search-input"] input').first();
  await safe(async () => { await inp.click(); await inp.fill('FURNITURE_LINER'); }, null);
  await page.waitForTimeout(4000);

  // select via full pointer sequence on the inner element
  const sel = page.getByRole('button', { name: 'Select' }).first();
  await safe(async () => sel.evaluate(el => {
    const opts = { bubbles: true, cancelable: true, composed: true, view: window, button: 0 };
    el.dispatchEvent(new PointerEvent('pointerover', opts));
    el.dispatchEvent(new PointerEvent('pointerenter', opts));
    el.dispatchEvent(new MouseEvent('mouseover', opts));
    el.dispatchEvent(new PointerEvent('pointerdown', opts));
    el.dispatchEvent(new MouseEvent('mousedown', opts));
    el.dispatchEvent(new PointerEvent('pointerup', opts));
    el.dispatchEvent(new MouseEvent('mouseup', opts));
    el.dispatchEvent(new MouseEvent('click', opts));
  }), null);
  await page.waitForTimeout(4000);

  const genBtn = page.getByRole('button', { name: 'Generate Spreadsheet' }).first();
  const dis = await safe(async () => genBtn.evaluate(el => el.hasAttribute('disabled') || el.getAttribute('disabled') === ''), null);
  const panel = await safe(async () => {
    const t = await page.evaluate(() => document.body.innerText);
    const i = t.indexOf('Product Type Selected');
    return t.slice(i, i + 250).replace(/\n/g, ' | ');
  }, null);
  log.push({ step: 'afterSelect', disabled: dis, panel });

  if (dis === false) {
    try {
      const [dl] = await Promise.all([
        page.waitForEvent('download', { timeout: 60000 }),
        genBtn.evaluate(el => el.click())
      ]);
      await dl.saveAs('H:/amzain/amz-upload/templates/FURNITURE_LINER_AR.xlsm');
      log.push({ step: 'downloaded', name: dl.suggestedFilename() });
    } catch (e) { log.push({ step: 'dlfail', err: String(e).slice(0, 80) }); }
  }
  return log;
}
