// Scrape the last N days of public Telegram channels through the web preview (t.me/s/...).
// No Telegram account needed while the channels are public.
'use strict';
const https = require('https');
const dns = require('dns');
const fs = require('fs');
const path = require('path');
const fsmod = require('fs');
const { dirs } = require('./lib/paths');

dns.setServers(['1.1.1.1', '8.8.8.8']);

// Router DNS on this machine is unreliable for some hosts -> resolve via public DNS
// and connect to the IP directly (keeping SNI + Host header).
const ipCache = new Map();
function resolveIp(host) {
  if (ipCache.has(host)) return Promise.resolve(ipCache.get(host));
  return new Promise((resolve, reject) => {
    dns.resolve4(host, (err, addrs) => {
      if (err || !addrs || !addrs.length) return reject(err || new Error('no A record for ' + host));
      ipCache.set(host, addrs[0]);
      resolve(addrs[0]);
    });
  });
}

const CHANNELS = (process.env.TG_CHANNELS || 'Sgropnem,Bborkangroup').split(',');
const DAYS = Number(process.env.TG_DAYS || 7);

function get(url) {
  return new Promise(async (resolve, reject) => {
    let ip;
    try { ip = await resolveIp(new URL(url).hostname); } catch (e) { return reject(e); }
    const u = new URL(url);
    const req = https.get(
      {
        host: ip,
        servername: u.hostname,
        path: u.pathname + u.search,
        headers: {
          'Host': u.hostname,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36',
          'Accept-Language': 'ar,en;q=0.8',
        },
        timeout: 45000,
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          return resolve(get(new URL(res.headers.location, url).toString()));
        }
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }
    );
    req.on('timeout', () => req.destroy(new Error('timeout ' + url)));
    req.on('error', reject);
  });
}

function decode(s) {
  return String(s)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parsePosts(html, channel) {
  const posts = [];
  // split on message wrappers
  const parts = html.split('class="tgme_widget_message_wrap');
  for (const part of parts.slice(1)) {
    const postMatch = part.match(/data-post="([^"]+)"/);
    if (!postMatch) continue;
    const postId = postMatch[1].split('/').pop();
    const dateMatch = part.match(/<time[^>]*datetime="([^"]+)"/);
    const textMatch = part.match(/class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    const photos = [];
    const photoRe = /background-image:url\('([^']+)'\)/g;
    let m;
    while ((m = photoRe.exec(part))) {
      const u = m[1];
      if (/telesco\.pe\//.test(u)) photos.push(u.startsWith('//') ? 'https:' + u : u);
    }
    const imgRe = /<a class="tgme_widget_message_photo_wrap[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"/g;
    while ((m = imgRe.exec(part))) {
      const u = m[1];
      if (/telesco\.pe\//.test(u)) photos.push(u.startsWith('//') ? 'https:' + u : u);
    }
    const videoMatch = /tgme_widget_message_video_wrap/.test(part);
    posts.push({
      channel,
      postId,
      url: `https://t.me/${channel}/${postId}`,
      date: dateMatch ? dateMatch[1] : null,
      text: textMatch ? decode(textMatch[1]) : '',
      photos: Array.from(new Set(photos)),
      hasVideo: videoMatch,
    });
  }
  return posts;
}

(async () => {
  const cutoff = Date.now() - DAYS * 86400 * 1000;
  const all = [];
  for (const ch of CHANNELS) {
    let before = null;
    let stop = false;
    let pages = 0;
    while (!stop && pages < 120) {
      const url = `https://t.me/s/${ch}` + (before ? `?before=${before}` : '');
      const { status, body } = await get(url);
      if (status !== 200) { console.log(`${ch}: HTTP ${status} on ${url}`); break; }
      const posts = parsePosts(body, ch);
      if (!posts.length) break;
      const ids = posts.map((p) => Number(p.postId));
      const minId = Math.min(...ids);
      for (const p of posts) {
        const t = p.date ? Date.parse(p.date) : 0;
        if (t && t < cutoff) { stop = true; }
        else if (t) all.push(p);
      }
      before = minId;
      pages += 1;
      console.log(`${ch}: page ${pages} -> ${posts.length} posts (kept ${all.filter((x) => x.channel === ch).length}), oldest ${posts[0].date}`);
    }
  }
  all.sort((a, b) => Date.parse(b.date || 0) - Date.parse(a.date || 0));
  fs.writeFileSync(path.join(dirs.data, 'telegram-posts.json'), JSON.stringify(all, null, 1), 'utf8');

  const withPrice = all.filter((p) => /(?:بسعر|السعر|سعر|جنيه|ج\.م|EGP)/.test(p.text));
  console.log('---');
  console.log('posts in last', DAYS, 'days:', all.length, '| with price-ish text:', withPrice.length,
    '| with photos:', all.filter((p) => p.photos.length).length);
  for (const ch of CHANNELS) console.log(ch, all.filter((p) => p.channel === ch).length, 'posts');
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
