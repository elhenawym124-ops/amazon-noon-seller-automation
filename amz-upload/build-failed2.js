// Build re-upload batches for HOME_ORGANIZERS_AND_STORAGE
// Pool = failed SKUs + the SKUs that live in the stuck server-side preview draft (LVP-147..186)
const fs = require('fs');
const { execSync } = require('child_process');

const srcs = [
  { file: 'products_org_ar.json', skus: 'LVP-043,LVP-045,LVP-066,LVP-067,LVP-069,LVP-070,LVP-072,LVP-076,LVP-079,LVP-080,LVP-081,LVP-085,LVP-086,LVP-087' },
  { file: 'products_storage_ar.json', skus: 'LVP-099,LVP-101,LVP-103,LVP-105,LVP-108,LVP-110,LVP-111,LVP-113,LVP-114,LVP-117,LVP-134,LVP-135,LVP-136' },
  { file: 'products_ar2.json', skus: 'LVP-137,LVP-138,LVP-139,LVP-142,LVP-143,LVP-145,LVP-147,LVP-148,LVP-149,LVP-150,LVP-151,LVP-152,LVP-153,LVP-154,LVP-155,LVP-156,LVP-157,LVP-158,LVP-159,LVP-160,LVP-161,LVP-162,LVP-163,LVP-164,LVP-165,LVP-166,LVP-167,LVP-168,LVP-169,LVP-170,LVP-171,LVP-172,LVP-173,LVP-174,LVP-175,LVP-176,LVP-177,LVP-178,LVP-179,LVP-180,LVP-181,LVP-182,LVP-183,LVP-184,LVP-185,LVP-186' }
];

let pool = [];
for (const s of srcs) {
  const j = JSON.parse(fs.readFileSync(s.file, 'utf8'));
  for (const sku of s.skus.split(',')) {
    const p = j.products.find(x => x.sku === sku);
    if (!p) { console.log('MISSING', sku, 'in', s.file); continue; }
    pool.push(Object.assign({}, p, { browseNode: j.browseNode }));
  }
}
console.log('pool size', pool.length);

const CHUNK = 10;
let n = 0;
for (let i = 0; i < pool.length; i += CHUNK) {
  const part = pool.slice(i, i + CHUNK);
  n++;
  const cfg = `cfg_G${n}.json`;
  const out = `G${n}_ORG.xlsx`;
  fs.writeFileSync(cfg, JSON.stringify({
    productType: 'HOME_ORGANIZERS_AND_STORAGE',
    browseNode: 21863799031,
    quantity: 99,
    brand: 'Generic',
    products: part
  }, null, 1), 'utf8');
  execSync(`node build-feed.js AR2.xlsx ${cfg} ${out}`, { stdio: 'ignore' });
  console.log(out, part.length, part.map(p => p.sku).join(','));
}
