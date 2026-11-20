// Verify that supplier images are downloadable, then build a review page (HTML).
'use strict';
const https = require('https');
const http = require('http');
const dns = require('dns');
const fs = require('fs');
const path = require('path');
const { dirs } = require('./lib/paths');

dns.setServers(['1.1.1.1', '8.8.8.8']);
const cands = JSON.parse(fs.readFileSync(path.join(dirs.data, 'candidates.json'), 'utf8')).filter((c) => c.keep);

const ipCache = new Map();
function ip(host) {
  if (ipCache.has(host)) return Promise.resolve(ipCache.get(host));
  return new Promise((res, rej) => dns.resolve4(host, (e, a) => (e || !a || !a.length) ? rej(e || new Error('dns ' + host)) : (ipCache.set(host, a[0]), res(a[0]))));
}

function head(url) {
  return new Promise(async (resolve) => {
    try {
      const u = new URL(url);
      const ipAddr = await ip(u.hostname);
      const req = https.request({ host: ipAddr, servername: u.hostname, path: u.pathname + u.search, method: 'GET', headers: { Host: u.hostname, 'User-Agent': 'Mozilla/5.0', Range: 'bytes=0-1023' }, timeout: 20000 }, (res) => {
        resolve({ status: res.statusCode, type: res.headers['content-type'], size: res.headers['content-range'] || res.headers['content-length'] });
        res.resume();
      });
      req.on('error', (e) => resolve({ status: 0, err: e.code || e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ status: 0, err: 'timeout' }); });
      req.end();
    } catch (e) { resolve({ status: 0, err: String(e.message) }); }
  });
}

(async () => {
  const tgSample = cands.find((c) => c.source === 'telegram' && c.images.length);
  const elSample = cands.find((c) => c.source === 'elbatal' && c.images.length);
  const checks = [];
  for (const s of [tgSample, elSample]) {
    if (!s) continue;
    for (const u of s.images.slice(0, 2)) checks.push({ url: u.slice(0, 80), ...(await head(u)) });
  }
  console.log('image checks:'); checks.forEach((c) => console.log(' ', JSON.stringify(c)));

  // fall back to https for protocol-relative telegram urls
  const fix = (u) => (u.startsWith('//') ? 'https:' + u : u);
  const rows = cands.map((c, i) => `
  <tr>
    <td>${i + 1}</td>
    <td><img loading="lazy" src="${fix(c.images[0] || '')}" alt=""></td>
    <td><b>${escapeHtml(c.title)}</b><br><small>${c.source} · ${c.channel} · ${c.images.length} صور${c.date ? ' · ' + c.date.slice(0, 10) : ''}</small><br><a href="${c.url}" target="_blank">المصدر</a></td>
    <td>${c.cost}</td>
    <td class="sell">${c.sell}</td>
  </tr>`).join('');

  const html = `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8">
<title>مرشحو HomeVista (${cands.length})</title>
<style>
 body{font-family:Segoe UI,Tahoma,sans-serif;background:#f6f7f9;margin:0;padding:20px}
 h1{font-size:20px} .meta{color:#555;margin-bottom:14px}
 table{width:100%;border-collapse:collapse;background:#fff;box-shadow:0 1px 3px #0002}
 th,td{padding:8px;border-bottom:1px solid #eee;font-size:13px;vertical-align:top}
 th{background:#233; color:#fff;position:sticky;top:0}
 img{width:110px;height:110px;object-fit:cover;border-radius:6px;background:#eee}
 .sell{color:#0a7;font-weight:700;font-size:15px}
</style>
<h1>مرشحو الرفع على HomeVista — ${cands.length} منتج</h1>
<div class="meta">السعر = سعر المورد × 2 · الحد الأدنى 60 ج · أقرب أول</div>
<table><thead><tr><th>#</th><th>صورة</th><th>المنتج</th><th>سعر المورد</th><th>سعر البيع</th></tr></thead>
<tbody>${rows}</tbody></table></html>`;
  fs.writeFileSync(path.join(dirs.reports, 'review.html'), html, 'utf8');
  console.log('\nreview.html written:', cands.length, 'rows');
})();

function escapeHtml(s) { return String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
