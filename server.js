import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const INDEX_PATH = path.join(__dirname, 'index.html');
const ADMIN_PATH = path.join(__dirname, 'admin.html');

app.use(express.static(__dirname, {
  setHeaders(res, filePath) {
    const base = path.basename(filePath);
    if (base === 'index.html' || base === 'admin.html') {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));

app.get(['/afmin', '/afmin/'], (_req, res) => {
  res.redirect(301, '/admin');
});

app.get(['/admin', '/admin/'], (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(ADMIN_PATH);
});

app.get('*', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(INDEX_PATH);
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});

