const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = 8090;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.mp4':  'video/mp4',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

const NO_CACHE = 'no-cache, no-store, must-revalidate';

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);

  // Security: stay inside ROOT
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404); res.end('Not found'); return;
    }

    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';

    // ── Video: support Range requests so browser can stream ──────────
    if (ext === '.mp4') {
      const fileSize = stat.size;
      const rangeHeader = req.headers['range'];

      if (rangeHeader) {
        const [startStr, endStr] = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parseInt(startStr, 10);
        const end   = endStr ? parseInt(endStr, 10) : fileSize - 1;
        const chunk = end - start + 1;

        res.writeHead(206, {
          'Content-Range':  `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges':  'bytes',
          'Content-Length': chunk,
          'Content-Type':   'video/mp4',
          'Cache-Control':  NO_CACHE,
        });
        fs.createReadStream(filePath, { start, end }).pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type':   'video/mp4',
          'Accept-Ranges':  'bytes',
          'Cache-Control':  NO_CACHE,
        });
        fs.createReadStream(filePath).pipe(res);
      }
      return;
    }

    // ── All other files ───────────────────────────────────────────────
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) { res.writeHead(500); res.end('Read error'); return; }
      res.writeHead(200, {
        'Content-Type':   mime,
        'Content-Length': data.length,
        'Cache-Control':  NO_CACHE,
      });
      res.end(data);
    });
  });

}).listen(PORT, '127.0.0.1', () => {
  console.log(`GW landing → http://localhost:${PORT}`);
});
