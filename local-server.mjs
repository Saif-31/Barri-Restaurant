// Simple local development server for testing without Vercel
// Serves static files and simulates API endpoints

import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
config();

// Get __dirname equivalent in ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Import API handler
const sessionModule = await import('./api/session.js');
const sessionHandler = sessionModule.default;

const server = http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Parse URL
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Routes
  if (pathname === '/api/session' && req.method === 'POST') {
    // Check if handler is loaded
    if (!sessionHandler) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server still initializing, please try again' }));
      return;
    }

    // Create mock request/response objects for the serverless function
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      const mockReq = {
        method: 'POST',
        headers: req.headers,
        body: body ? JSON.parse(body) : {},
        socket: { remoteAddress: req.socket.remoteAddress }
      };

      const mockRes = {
        statusCode: 200,
        headers: {},
        setHeader: (key, value) => { mockRes.headers[key] = value; },
        status: (code) => { mockRes.statusCode = code; return mockRes; },
        json: (data) => {
          res.writeHead(mockRes.statusCode, {
            'Content-Type': 'application/json',
            ...mockRes.headers
          });
          res.end(JSON.stringify(data));
        }
      };

      try {
        await sessionHandler(mockReq, mockRes);
      } catch (error) {
        console.error('API Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
    return;
  }

  // Serve static files from public directory
  let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(500);
        res.end('Error loading file');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
});

server.listen(PORT, () => {
  console.log('\n✅ Il-Barri Restaurant Local Server Running!\n');
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`🔧 API: http://localhost:${PORT}/api/session`);
  console.log(`\n📝 OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✓ Configured' : '✗ Missing'}`);
  console.log('\n💡 Open http://localhost:3000 in your browser and click "Start Call"\n');
  console.log('Press CTRL+C to stop\n');
});
