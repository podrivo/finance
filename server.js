import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { CACHE_FILE, readCache, fetchIPCA } from './ipca.js';

const PORT = process.env.PORT || 3000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

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

createServer(async (req, res) => {
  try {
    if (req.url === '/api/ipca') {
      const body = JSON.stringify(await getIPCA());
      return res.writeHead(200, { 'Content-Type': 'application/json' }).end(body);
    }
    if (req.url === '/') {
      const html = await readFile(new URL('./index.html', import.meta.url));
      return res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(html);
    }
    res.writeHead(404).end();
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'text/plain' }).end(err.message);
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
