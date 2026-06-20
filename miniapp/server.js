const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 8080;
const mime = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let p = path.join(__dirname, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  try {
    const c = fs.readFileSync(p);
    res.writeHead(200, { 'Content-Type': mime[path.extname(p)] || 'text/plain', 'Cache-Control': 'no-cache' });
    res.end(c);
  } catch (e) {
    res.writeHead(404);
    res.end('Not Found: ' + req.url);
  }
});

server.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT);
});
