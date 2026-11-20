// Build the next upload batch for a product type (state-driven, no duplicates).
// usage: node make-batch.js <productType> <size>
'use strict';
const fs = require('fs');
const path = require('path');

const { dirs } = require('./lib/paths');
const TYPE = process.argv[2] || 'HOME_ORGANIZERS_AND_STORAGE';
const SIZE = Number(process.argv[3] || 15);
const slug = TYPE.toLowerCase().replace(/_/g, '-');

const all = JSON.parse(fs.readFileSync(path.join(dirs.data, 'listings.json'), 'utf8'));
const statePath = path.join(dirs.data, 'submitted.json');
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
state.batches = state.batches || [];

// every SKU that is either submitted or already planned in a batch
const used = new Set(state.batches.flatMap((b) => b.skus || []));
const pool = all.filter((l) => l.productType === TYPE && !used.has(l.sku) && l.images.length >= 3);
const batch = pool.slice(0, SIZE);
if (!batch.length) { console.log('nothing left for', TYPE); process.exit(0); }

const cfg = {
  productType: TYPE,
  browseNode: batch[0].browseNode,
  brand: 'Generic',
  quantity: 99,
  products: batch.map((p) => ({
    sku: p.sku, title: p.title, price: p.price, images: p.images,
    description: p.description, bullets: p.bullets, material: p.material,
    color: p.color, weightGrams: p.weightGrams, modelName: p.modelName, capacity: p.capacity,
  })),
};

const n = state.batches.reduce((m, b) => Math.max(m, b.n || 0), 0) + 1;
const cfgFile = `cfg-${slug}-${n}.json`;
fs.writeFileSync(path.join(dirs.config, cfgFile), JSON.stringify(cfg, null, 1), 'utf8');
state.batches.push({ n, type: TYPE, cfgFile, file: `hv_${slug.split('-')[0]}_${n}_feed.xlsx`, skus: batch.map((p) => p.sku), status: 'planned' });
fs.writeFileSync(statePath, JSON.stringify(state, null, 1), 'utf8');
console.log('wrote', cfgFile, '| products:', batch.length, '| left:', pool.length - batch.length);
