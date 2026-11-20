// Re-host product images on catbox.moe (public, stable) and rewrite a cfg with the new URLs.
// usage: node rehost.js <cfgFile> <outCfgFile>
'use strict';
const fs = require('fs');
const path = require('path');
const dns = require('dns');
const https = require('https');
const { execFileSync } = require('child_process');

dns.setServers(['1.1.1.1', '8.8.8.8']);
const OUT = __dirname;
const IMG_DIR = path.join(OUT, 'img-cache');
fs.mkdirSync(IMG_DIR, { recursive: true });

const cfgPath = process.argv[2];
const outPath = process.argv[3];
const cfg = JSON.parse(fs.readFileSync(path.isAbsolute(cfgPath) ? cfgPath : path.join(OUT, cfgPath), 'utf8'));

const ipCache = new Map();
function resolveIp(host) {
  if (ipCache.has(host)) return Promise.resolve(ipCache.get(host));
  return new Promise((res, rej) => dns.resolve4(host, (e, a) => (e || !a || !a.length) ? rej(e || new Error('dns')) : (ipCache.set(host, a[0]), res(a[0]))));
}

function download(url, dest) {
  return new Promise(async (resolve, reject) => {
    try {
      const u = new URL(url);
      const ip = await resolveIp(u.hostname);
      const req = https.get({ host: ip, servername: u.hostname, path: u.pathname + u.search, headers: { Host: u.hostname, 'User-Agent': 'Mozilla/5.0' }, timeout: 45000 }, (r) => {
        if (r.statusCode !== 200) { r.resume(); return reject(new Error('HTTP ' + r.statusCode)); }
        const f = fs.createWriteStream(dest);
        r.pipe(f);
        f.on('finish', () => resolve(dest));
      });
      req.on('error', reject);
      req.on('timeout', () => req.destroy(new Error('timeout')));
    } catch (e) { reject(e); }
  });
}

function catbox(file) {
  const ip = ipCache.get('catbox.moe');
  const out = execFileSync('curl.exe', ['-sS', '--max-time', '90', '--resolve', `catbox.moe:443:${ip}`, '-F', 'reqtype=fileupload', '-F', `fileToUpload=@${file}`, 'https://catbox.moe/user/api.php'], { encoding: 'utf8' });
  const url = out.trim();
  if (!/^https:\/\/files\.catbox\.moe\//.test(url)) throw new Error('catbox: ' + url.slice(0, 120));
  return url;
}

(async () => {
  await resolveIp('catbox.moe');
  for (const p of cfg.products) {
    const hosted = [];
    let i = 0;
    for (const url of p.images) {
      i += 1;
      const ext = (url.match(/\.(jpe?g|png)$/i) || ['.jpg'])[0];
      const file = path.join(IMG_DIR, `${p.sku}_${i}${ext}`);
      try {
        if (!fs.existsSync(file)) await download(url, file);
        const hostedUrl = catbox(file);
        hosted.push(hostedUrl);
        console.log('  ok', p.sku, i, hostedUrl);
      } catch (e) {
        console.log('  skip', p.sku, i, e.message.slice(0, 60));
      }
    }
    if (hosted.length) p.images = hosted;
  }
  fs.writeFileSync(path.isAbsolute(outPath) ? outPath : path.join(OUT, outPath), JSON.stringify(cfg, null, 1), 'utf8');
  console.log('written', outPath);
})().catch((e) => { console.error('FAILED', e.message); process.exit(1); });
