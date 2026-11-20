const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 8765;
const types = { '.html':'text/html; charset=utf-8', '.csv':'text/csv; charset=utf-8', '.js':'text/javascript', '.png':'image/png', '.jpg':'image/jpeg' };
http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(__dirname, u === '/' ? 'preview.html' : u);
  fs.readFile(f, (e, data) => {
    if (e) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(port, () => console.log('serving on ' + port));
