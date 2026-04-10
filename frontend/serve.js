const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const HOST = 'localhost';

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? '/index.html' : req.url);

  // Read and serve the file
  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - File Not Found');
      return;
    }

    // If it's a directory, serve index.html
    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 - Server Error: ' + readErr.message);
        return;
      }

      // Determine content type
      const ext = path.extname(filePath);
      let contentType = 'text/html';
      
      if (ext === '.js') contentType = 'application/javascript';
      else if (ext === '.css') contentType = 'text/css';
      else if (ext === '.json') contentType = 'application/json';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.svg') contentType = 'image/svg+xml';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Frontend server running at http://${HOST}:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});
