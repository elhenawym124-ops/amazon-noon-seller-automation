# hv-pipeline — HomeVista product sourcing

Scrapes supplier catalogs, applies the pricing rule, classifies products, and
produces configs that `amz-upload` turns into Amazon upload files.

## Layout

```
hv-pipeline\
├─ src\                     scripts
│  ├─ lib\paths.js          path map
│  ├─ scrape-elbatal.js     elbatal-import.com  -> data/raw-elbatal.json + data/elbatal-products.json
│  ├─ scrape-telegram.js    t.me public preview -> data/telegram-posts.json
│  ├─ build-candidates.js   both sources        -> data/candidates.json
│  ├─ gen-listings.js       candidates          -> data/listings.json + data/skipped.json
│  ├─ build-review.js       candidates          -> output/reports/review.html
│  ├─ make-batch.js         listings + state    -> config/cfg-<type>-<n>.json
│  └─ rehost.js             cfg images          -> catbox URLs + data/img-cache/
├─ config\                  cfg-*.json (per-type batches)
├─ data\                    raw scrapes, candidates, listings, submitted.json, image caches, HTML samples
├─ output\
│  ├─ feeds\                hv_*.xlsx (upload files)
│  └─ reports\              Amazon processing summaries + review.html
└─ STATUS.md                batch history, Amazon error findings, remaining work
```

## Flow

```powershell
node src\scrape-telegram.js          # optional: refresh supplier data
node src\scrape-elbatal.js
node src\build-candidates.js
node src\gen-listings.js
node src\build-review.js             # open output\reports\review.html

node src\make-batch.js HOME_ORGANIZERS_AND_STORAGE 15
node H:\amzain\amz-upload\src\build-feed.js templates\HV_ORG_AR.xlsm ..\hv-pipeline\config\cfg-home-organizers-and-storage-<n>.json ..\hv-pipeline\output\feeds\hv_org_<n>_feed.xlsx
```

`data\submitted.json` is the state file: it records every SKU already planned in a
batch so `make-batch.js` never repeats one.
