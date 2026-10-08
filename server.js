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

// Merges [field, date, value] entries into one row per month, sorted by date.
function toSeries(entries) {
  const byDate = {};
  for (const [field, date, value] of entries) {
    byDate[date] ??= { date, monthly: null, ytd: null, twelveMonths: null, index: null };
    byDate[date][field] = value;
  }
  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
}

const IBGE_FIELDS = { 63: 'monthly', 69: 'ytd', 2265: 'twelveMonths', 2266: 'index' };

async function fromIBGE() {
  const rows = await getJSON('https://apisidra.ibge.gov.br/values/t/1737/n1/all/v/63,69,2265,2266/p/all');
  return toSeries(
    rows
      .slice(1)
      .filter((r) => /^-?\d/.test(r.V))
      .map((r) => [IBGE_FIELDS[r.D2C], `${r.D3C.slice(0, 4)}-${r.D3C.slice(4)}`, Number(r.V)])
  );
}

const BCB_FIELDS = { 433: 'monthly', 13522: 'twelveMonths' };

async function fromBCB() {
  const end = `31/12/${new Date().getFullYear()}`;
  const results = await Promise.all(
    Object.entries(BCB_FIELDS).map(async ([code, field]) => {
      const rows = await getJSON(
        `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados?formato=json&dataInicial=01/01/1979&dataFinal=${end}`
      );
      return rows.map((r) => [field, `${r.data.slice(6)}-${r.data.slice(3, 5)}`, Number(r.valor)]);
    })
  );
  return toSeries(results.flat());
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
