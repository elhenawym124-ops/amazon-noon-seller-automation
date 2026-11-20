# Noon Seller — browser profile + upload pipeline

Isolated Chrome instance dedicated to the Noon seller account.

| Item | Value |
|---|---|
| Account | `btoo3e3lanat1@gmail.com` (seller name: Hala) |
| Profile folder | `H:\amzain\profiles\noon-seller` |
| Launcher | `launch-noon-seller.cmd` / desktop shortcut **Noon Seller** |
| CDP port | `9222` (needs `--remote-debugging-port=9222`; reconnect with `chromium.connectOverCDP('http://localhost:9222')`) |
| Login | https://login.noon.partners/en |
| Seller Lab | https://noon-store.noon.partners/en/STR101488-NEG/home?project=PRJ101488 |
| Catalog | https://noon-catalog.noon.partners/en/catalog?project=PRJ101488 |
| Store | Elsherbiny factory — 44 live SKUs at start |

## Login notes
- Login requires a **passkey**, Google, or **Email OTP**. OTP code goes to the account mailbox.
- The "Continue with Email OTP" button stays `disabled` until the passkey check resolves; if it
  never enables, force it:
  ```js
  const b = [...document.querySelectorAll('button')].find(x => /Email OTP/i.test(x.innerText));
  b.removeAttribute('disabled'); b.disabled = false; b.click();
  ```
  This actually fires the OTP request (`{"emailotp":"ok"}`).
- OTP input: `input[aria-label="otp-input"]` (6 digits, numeric).

## Product upload (NIS) — what actually works
1. Catalog → **Imports → Add Import** → Type **Content** → Subtype **NIS Create/Update**.
2. Choose **Specific category** → category (e.g. `Kitchen & Dining`) → product type
   (e.g. `Storage & Organization`) → subtype (e.g. `Food Containers`) → **Download English**.
3. Fill the `template_data` sheet. Import starts reading at **row 10** (row 8 = labels,
   row 9 = attribute codes). Do not leave blank rows.
4. **Every product needs a parent + child row pair**:
   - Parent row: family / product_type / product_subtype / brand / title / colour / material /
     images / description / `parent_group_key` / `parent_child_variation = Parent`
     (no seller_sku)
   - Child row: `seller_sku`, same `parent_group_key`, `parent_child_variation = Child`,
     `size_variation`
   A parent without children fails with **`child is missing`**; a child without a group key fails
   with **`parent_group_key is missing`**.
5. Upload → Submit. Status appears in Imports → Content; on failure download **Error File**
   (CSV) — the last columns carry the real validation messages.

## Data source (Amazon Level-up)
- Seller Central inventory GraphQL: `POST /myinventory/gql`, operation **`getListingsV2`**,
  variables `{pagination:{from,size:100}, sortRequest, multiSelectFilters}`.
- Response path: `data.listingsV2.listings[]` (`count` = total).
- Working capture pattern: open inventory page and capture the request in the Playwright MCP
  browser, then replay it from a **new tab on a static same-origin page** (the SPA redirects
  to `/product-search/bulk` and kills the execution context otherwise).
- Dump: `H:\amzain\amz-upload\data\levelup_listings.json` (561 listings, 544 ACTIVE).

## Scripts
| File | Purpose |
|---|---|
| `inspect.js`, `state.js`, `go.js` | attach / dump page state |
| `open-page.js` | navigate + dump text/links |
| `run-import.js` | end-to-end: select Content → NIS → Next → attach xlsx → Submit |
| `poll-imports.js` | poll Imports list until processing finishes |
| `get-report.js "Error File"` | download the import error file |
| `H:\amzain\noon-upload\src\build-nis.js` | build NIS xlsx (parent+child rows) from listings |

## Price update (works)
Import type `Pricing` → subtype `Price Update`. The accepted file is a plain CSV with exactly:

```
country_code,partner_sku,price,sale_price,sale_start,sale_end,id_partner
eg,LVP-546,925.65,,,,101488
```

Rules learned the hard way:
- `id_partner` = **101488** (this store).
- The exporter's own column list (psku_code, x_sku_child, ...) is **not** accepted — use the 7 columns above.
- **Never** let a thousands separator into the price (`1,692.90` breaks the whole file: import status
  becomes plain `Error` with no row details). Strip commas.
- CRLF line endings.

## FBP stock (works)
Import type `FBP Stock` (no subtype), CSV:

```
country_code,id_partner,partner_sku,noon_warehouse_code,stock_gross
eg,101488,LVP-546,W00756568EG,99
```

- Warehouse code for this seller (EG) = **W00756568EG** — it is shown in the URL/top bar of
  `https://directship.noon.partners/en/orders?...&whCode=W00756568EG`.
- `stock_gross` must be a positive integer.

## New products show "View Issues" until
- noon reviews the content (up to 3 business days), and
- price + FBP stock exist for the SKU.

## Upload log (2026-11-11)
| Import | Rows | Processed | Errors |
|---|---|---|---|
| NIS pilot | 4 | 4 | 0 |
| NIS kitchen (1st) | 842 | 750 | 92 |
| NIS kitchen fix | 48 | 48 | 0 |
| NIS kitchen v2 (full re-run) | 842 | 842 | 0 |
| NIS home decor | 194 | 192 | 2 |
| NIS misc kitchen | 24 | 24 | 0 |
| NIS misc decor | 6 | 6 | 0 |
| Price update (all) | 518 | 517 | 1 |
| Price update (new 15) | 15 | 13 | 2 |
| FBP stock (all) | 518 | 517 | 1 |
| FBP stock (new 15) | 15 | 15 | 0 |
| NIS Cleaning & Hygiene | 14 | 7 | 7 |
| NIS Bath | 4 | 4 | 0 |
| NIS Apparel | 2 | 2 | 0 |
| Price update (new 10) | 10 | 10 | 0 |
| FBP stock (new 10) | 10 | 10 | 0 |

Result: **539 of 544 active Amazon listings created in the noon catalog**, each with price and FBP stock.

Still open (5): monitor, projector, radio (Electronic Accessories), shoe insoles (Footwear),
garment steamer (Home Appliances) — each needs the *correct subtype leaf* selected in the template
downloader, and the trees we downloaded (phone/tablet/e-reader, large appliances) do not contain them.

Note: cleaning imports report `seller_sku is missing` on the **parent** rows while the child rows are
created — harmless, the products exist.
