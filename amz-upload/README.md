# amz-upload — Amazon feed pipeline

Module for building Amazon Egypt upload spreadsheets (Level-Up + HomeVista) from
scraped store data. Every script resolves paths from this folder, so it works
from any current directory.

## Layout

```
amz-upload\
├─ src\                     runnable code
│  ├─ lib\paths.js          single source of truth for every path
│  ├─ classify.js           data/page|asc|desc_*.json  ->  data/merged.json
│  ├─ make-plan.js          data/merged.json           ->  output/reports/BATCH_PLAN.*
│  ├─ build-from-list.js    config/cfg-*.json (ASIN list) -> config/products_*.json
│  ├─ build-remaining.js    auto-build every remaining Arabic product
│  ├─ build-feed.js         config + template          ->  output/feeds/*.xlsx
│  ├─ check-newlines.js     QA: newlines/tabs inside fields
│  ├─ check-bidi.js         QA: bidi control chars in titles
│  ├─ check-sums.js         QA: Processing Summary files
│  ├─ ...                   listing/CSV helpers
│  ├─ mcp\                  Playwright MCP page snippets (upload / diagnose)
│  └─ legacy\               one-off builders from earlier sessions (archived)
│
├─ config\                  every product list / feed config (JSON)
├─ data\                    scraped store data + merged.json
├─ templates\               Amazon templates (*.xlsm, AR2.xlsx, ORG_EN.xlsx)
├─ output\
│  ├─ feeds\                generated upload files (*.xlsx)
│  ├─ summaries\            Amazon Processing Summary downloads
│  └─ reports\              BATCH_PLAN, RESULTS, MY_PRODUCTS.csv, low_qty.json
├─ package.json             dependency: xlsx
├─ node_modules\
└─ TASKS.md                 runbook + Amazon error codes + batch status
```

## Commands

All paths below are relative to `H:\amzain\amz-upload`.

```powershell
# 1) rebuild merged.json from scraped data
node src\classify.js

# 2) rebuild the batch plan
node src\make-plan.js

# 3) build a feed from an existing config
node src\build-feed.js templates\AR2.xlsx config\cfg_H1.json output\feeds\H1_KT.xlsx

# 4) build all remaining Arabic products (writes config\cfg_Hn.json + output\feeds\Hn_*.xlsx)
node src\build-remaining.js

# 5) build a product list from ASINs
node src\build-from-list.js config\cfg-ar2.json
```

`build-feed.js` defaults (no arguments) are:
`templates\APRON_AR.xlsm` + `config\products.json` + `output\feeds\APRON_feed.xlsx`.

## Rules

- Never edit a `products_*.json` by hand and then re-run the script that generated it —
  it will be overwritten. Regenerate, or keep the hand-edited file under a new name.
- A config edited in Notepad/PowerShell may start with a UTF-8 BOM; `src/lib/paths.js`
  strips it when reading (`readJson`).
- `src/legacy/` scripts assume the old flat layout and are kept only as reference.
