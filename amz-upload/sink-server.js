const http = require('http');
const fs = require('fs');
const path = require('path');

const outDir = 'H:/amzain mina/amz-upload';
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  let data = '';
  req.setEncoding('utf8');
  req.on('data', c => { data += c; });
  req.on('end', () => {
    const name = (req.url || '/').replace(/[^a-zA-Z0-9._-]/g, '') || 'payload';
    const file = path.join(outDir, name.endsWith('.json') ? name : name + '.json');
    try { fs.writeFileSync(file, data); } catch (e) {}
    console.log(new Date().toISOString(), req.method, name, data.length, '->', file);
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('ok ' + data.length + ' ' + file);
  });
});
server.listen(9321, '127.0.0.1', () => console.log('sink listening on 9321'));
