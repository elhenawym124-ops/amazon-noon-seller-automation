// Scrape elbatal-import.com catalog via the Vondera storefront API.
// Store API needs Origin/Referer of the store domain, and its host resolves
// only through public DNS on this machine (router DNS fails) -> custom lookup.
'use strict';
const dns = require('dns');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { dirs } = require('./lib/paths');

const STORE_ORIGIN = 'https://elbatal-import.com';
const API_HOST = 'production.api.vondera.app';

dns.setServers(['1.1.1.1', '8.8.8.8']);

function resolveHost(host) {
  return new Promise((resolve, reject) => {
    dns.resolve4(host, (err, addrs) => {
      if (err || !addrs || !addrs.length) return reject(err || new Error('no A record'));
      resolve(addrs[0]);
    });
  });
}

function getJson(url, ip) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.get(
      {
        host: ip,
        servername: u.hostname,
        path: u.pathname + u.search,
        port: 443,
        headers: {
          'Host': u.hostname,
          'Origin': STORE_ORIGIN,
          'Referer': STORE_ORIGIN + '/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
        timeout: 45000,
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode + ' ' + body.slice(0, 200)));
          try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
        });
      }
    );
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
  });
}

(async () => {
  const ip = await resolveHost(API_HOST);
  console.log('API IP:', ip);

  const items = [];
  let pageNo = 1;
  let meta = null;
  for (;;) {
    const url = `https://${API_HOST}/api/ecommerce/products?limit=50&pageNo=${pageNo}`;
    const j = await getJson(url, ip);
    const d = j.data || {};
    if (!meta) meta = { totalItems: d.totalItems, totalPages: d.totalPages };
    (d.items || []).forEach((it) => items.push(it));
    console.log(`page ${pageNo}/${d.totalPages} -> ${(d.items || []).length} items (total ${items.length})`);
    if (d.isLastPage || !(d.items || []).length) break;
    pageNo += 1;
    if (pageNo > 200) break;
  }

  const rawPath = path.join(dirs.data, 'raw-elbatal.json');
  fs.writeFileSync(rawPath, JSON.stringify({ meta, count: items.length, items }, null, 1), 'utf8');

  // Normalized view
  const norm = items.map((it) => ({
    source: 'elbatal',
    id: it.id,
    name: (it.name || '').trim(),
    brand: it.brand || '',
    price: Number(it.price) || 0,
    crossedPrice: Number(it.crossedPrice) || 0,
    quantity: it.quantity,
    available: !!it.isAvailable,
    category: it.categoryName || '',
    subCategory: it.subCategoryName || '',
    url: it.link || '',
    image: it.mainImage ? it.mainImage.originalSize : '',
    images: (it.images || []).map((im) => im.originalSize || im).filter(Boolean),
    variants: it.variantsCount || 0,
  }));
  fs.writeFileSync(path.join(dirs.data, 'elbatal-products.json'), JSON.stringify(norm, null, 1), 'utf8');

  const sellX2 = norm.filter((p) => p.price * 2 >= 60);
  console.log('---');
  console.log('total products:', norm.length, ' | meta:', JSON.stringify(meta));
  console.log('source price >= 30 (i.e. x2 >= 60):', sellX2.length);
  const cats = {};
  norm.forEach((p) => { cats[p.category || '(none)'] = (cats[p.category || '(none)'] || 0) + 1; });
  console.log('categories:', JSON.stringify(cats, null, 1));
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
