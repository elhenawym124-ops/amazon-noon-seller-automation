# noon-upload — Noon seller feeds

Builds Noon seller upload files (NIS catalog rows, price CSV, stock CSV) from the
Amazon listings dump produced by `amz-upload`.

## Layout

```
noon-upload\
├─ src\                     scripts
│  ├─ lib\paths.js          path map (templates, listings dump, xlsx module)
│  ├─ build-nis.js          listings -> NIS xlsx (parent + child rows)
│  ├─ build-nis-pilot.js    small NIS sample for a first test
│  ├─ build-batch.js        NIS xlsx for a family / SKU filter
│  ├─ build-custom.js       NIS xlsx from an assignment config
│  ├─ build-prices.js       price CSV  (country_code,partner_sku,...)
│  ├─ build-stock.js        stock CSV  (fbp_stock)
│  ├─ extract-classification.js  noon template -> config/classification.json
│  ├─ parse-errors.js       noon errors.csv -> data/state/failed_skus.json
│  └─ resolve-failed*.js    match failed SKUs back to listings
├─ config\                  assign_*.json, new10/new15.json, misc_*.json, classification.json
├─ data\
│  ├─ state\                created_skus*, failed_skus*, kitchen_created, decor_skus
│  └─ noon-reports\         errors*.csv downloaded from noon
├─ output\feeds\            *.xlsx and *.csv upload files
└─ README.md
```

## Commands

```powershell
# NIS feed: <out> [limit] [productType] [startSku]
node src\build-nis.js output\feeds\kitchen_nis.xlsx 2 FOOD_STORAGE_CONTAINER

# price / stock CSV from a created-SKU list
node src\build-prices.js data\state\kitchen_created.json output\feeds\prices_kitchen.csv
node src\build-stock.js

# parse noon upload errors
node src\parse-errors.js
```

The source listings dump is `H:\amzain\amz-upload\data\levelup_listings.json`.
The Noon template is read from `H:\amzain\browsers\noon-seller\templates\`.
