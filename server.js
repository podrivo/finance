import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { readCache, writeCache } from './cache.js';
import * as ipca from './ipca.js';
import * as selic from './selic.js';
import * as selicTarget from './selic-target.js';

const PORT = process.env.PORT || 3000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const PUBLIC_DIR = new URL('./public/', import.meta.url);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

const APIS = {
  '/api/ipca': [ipca.CACHE_FILE, ipca.fetchIPCA],
  '/api/selic': [selic.CACHE_FILE, selic.fetchSelic],
  '/api/selic-target': [selicTarget.CACHE_FILE, selicTarget.fetchSelicTarget],
};

async function getData(file, fetchIndex) {
  const cached = await readCache(file);
  if (cached && Date.now() - new Date(cached.fetchedAt) < MAX_AGE_MS) return cached;

  try {
    const data = await fetchIndex({ previous: cached });
    await writeCache(file, data);
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
    if (APIS[req.url]) {
      const body = JSON.stringify(await getData(...APIS[req.url]));
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
