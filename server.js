import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const PORT = process.env.PORT || 3000;
const DATA_DIR = new URL('./data/', import.meta.url);
const CACHE_FILE = new URL('ipca.json', DATA_DIR);
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

async function getJSON(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

async function fromIBGE() {
  const rows = await getJSON('https://apisidra.ibge.gov.br/values/t/1737/n1/all/v/63/p/all');
  return rows
    .slice(1)
    .filter((r) => /^-?\d/.test(r.V))
    .map((r) => ({ date: `${r.D3C.slice(0, 4)}-${r.D3C.slice(4)}`, value: Number(r.V) }));
}

async function fromBCB() {
  const end = `31/12/${new Date().getFullYear()}`;
  const rows = await getJSON(
    `https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json&dataInicial=01/01/1979&dataFinal=${end}`
  );
  return rows.map((r) => ({ date: `${r.data.slice(6)}-${r.data.slice(3, 5)}`, value: Number(r.valor) }));
}

const SOURCES = [
  ['IBGE SIDRA', fromIBGE],
  ['BCB SGS', fromBCB],
];

async function readCache() {
  try {
    return JSON.parse(await readFile(CACHE_FILE, 'utf8'));
  } catch {
    return null;
  }
}

async function getIPCA() {
  const cached = await readCache();
  if (cached && Date.now() - new Date(cached.fetchedAt) < MAX_AGE_MS) return cached;

  for (const [source, fetchSeries] of SOURCES) {
    try {
      const series = await fetchSeries();
      if (!series.length) throw new Error('empty series');
      const data = { source, fetchedAt: new Date().toISOString(), series };
      await mkdir(DATA_DIR, { recursive: true });
      await writeFile(CACHE_FILE, JSON.stringify(data, null, 2));
      return data;
    } catch (err) {
      console.error(`${source} failed:`, err.message);
    }
  }

  if (cached) return cached;
  throw new Error('All sources failed and there is no local data');
}

createServer(async (req, res) => {
  try {
    if (req.url === '/api/ipca') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(await getIPCA()));
    }
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(await readFile(new URL('./index.html', import.meta.url)));
    }
    res.writeHead(404).end();
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'text/plain' }).end(err.message);
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
