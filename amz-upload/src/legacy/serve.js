const http = require('http');
const fs = require('fs');
const path = require('path');

const root = 'H:\\amzain\\amz-upload';
const dataDir = path.join(root, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const types = {
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xlsm': 'application/vnd.ms-excel.sheet.macroEnabled.12',
  '.json': 'application/json',
  '.html': 'text/html; charset=utf-8'
};

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Private-Network': 'true'
};

http.createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }

  if (req.method === 'POST' && req.url.startsWith('/save')) {
    const q = new URL(req.url, 'http://x').searchParams;
    const name = (q.get('name') || 'dump.json').replace(/[^A-Za-z0-9._-]/g, '_');
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      fs.writeFileSync(path.join(dataDir, name), Buffer.concat(chunks));
      res.writeHead(200, { ...cors, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, name, bytes: Buffer.concat(chunks).length }));
    });
    return;
  }

  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, urlPath.replace(/^\/+/, ''));
  if (!file.toLowerCase().startsWith(root.toLowerCase())) { res.writeHead(403, cors); return res.end('no'); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, cors); return res.end('not found'); }
    res.writeHead(200, { ...cors, 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Content-Length': buf.length });
    res.end(buf);
  });
}).listen(8799, '127.0.0.1', () => console.log('server up 8799'));
