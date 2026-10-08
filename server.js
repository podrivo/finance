import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { extname } from 'node:path';
import { CACHE_FILE, readCache, fetchIPCA } from './ipca.js';

const PORT = process.env.PORT || 3000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const PUBLIC_DIR = new URL('./public/', import.meta.url);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

async function getIPCA() {
  const cached = await readCache();
  if (cached && Date.now() - new Date(cached.fetchedAt) < MAX_AGE_MS) return cached;

  try {
    const data = await fetchIPCA({ previous: cached });
    await mkdir(new URL('.', CACHE_FILE), { recursive: true });
    await writeFile(CACHE_FILE, JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    if (cached) return cached;
    throw new Error('All sources failed and there is no local data');
  }
}

// Resolves a request path to a file in public/, or null if it isn't one we serve.
function publicFile(url) {
  const { pathname } = new URL(url, 'http://localhost');
  const path = pathname === '/' ? '/index.html' : pathname;
  const file = new URL(`.${path}`, PUBLIC_DIR);
  return TYPES[extname(path)] && file.href.startsWith(PUBLIC_DIR.href) ? file : null;
}

createServer(async (req, res) => {
  try {
    if (req.url === '/api/ipca') {
      const body = JSON.stringify(await getIPCA());
      return res.writeHead(200, { 'Content-Type': 'application/json' }).end(body);
    }
    const file = publicFile(req.url);
    if (!file) return res.writeHead(404).end();
    const body = await readFile(file).catch((err) => (err.code === 'ENOENT' ? null : Promise.reject(err)));
    if (!body) return res.writeHead(404).end();
    return res.writeHead(200, { 'Content-Type': TYPES[extname(file.pathname)] }).end(body);
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'text/plain' }).end(err.message);
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
