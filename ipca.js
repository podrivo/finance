import { readFile } from 'node:fs/promises';

const DATA_DIR = new URL('./data/', import.meta.url);
export const CACHE_FILE = new URL('ipca.json', DATA_DIR);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class HttpError extends Error {
  constructor(url, res) {
    super(`${url} -> HTTP ${res.status}`);
    this.status = res.status;
    const retryAfter = Number(res.headers.get('retry-after'));
    this.retryAfterMs = retryAfter > 0 ? retryAfter * 1000 : null;
  }
}

// How long to wait before the next attempt, or null when retrying won't help.
function retryDelay(err, attempt) {
  if (err instanceof HttpError) {
    if (err.retryAfterMs && (err.status === 429 || err.status === 503)) return Math.min(err.retryAfterMs, 10 * 60_000);
    if (err.status === 429) return 60_000 * (attempt + 1);
    if (err.status === 408 || err.status >= 500) return 5000 * 3 ** attempt;
    return null;
  }
  if (err.name === 'TimeoutError' || err.name === 'TypeError') return 2000 * 2 ** attempt;
  // A 200 with an HTML error page instead of JSON.
  if (err.name === 'SyntaxError') return 5000 * 3 ** attempt;
  return null;
}

async function getJSON(url, retries) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new HttpError(url, res);
      return await res.json();
    } catch (err) {
      const delay = retryDelay(err, attempt);
      if (delay === null || attempt >= retries) throw err;
      console.error(`${url} failed (${err.message}), retrying in ${delay / 1000}s`);
      await sleep(delay);
    }
  }
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

async function fromIBGE(retries) {
  const rows = await getJSON('https://apisidra.ibge.gov.br/values/t/1737/n1/all/v/63,69,2265,2266/p/all', retries);
  return toSeries(
    rows
      .slice(1)
      .filter((r) => /^-?\d/.test(r.V))
      .map((r) => [IBGE_FIELDS[r.D2C], `${r.D3C.slice(0, 4)}-${r.D3C.slice(4)}`, Number(r.V)])
  );
}

const BCB_FIELDS = { 433: 'monthly', 13522: 'twelveMonths' };

async function fromBCB(retries) {
  const end = `31/12/${new Date().getFullYear()}`;
  const results = await Promise.all(
    Object.entries(BCB_FIELDS).map(async ([code, field]) => {
      const rows = await getJSON(
        `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados?formato=json&dataInicial=01/01/1979&dataFinal=${end}`,
        retries
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

// The fallback has no ytd or index, so keep earlier values wherever the new series is missing them.
function merge(oldSeries, newSeries) {
  const byDate = new Map(oldSeries.map((row) => [row.date, row]));
  for (const row of newSeries) {
    const old = byDate.get(row.date) ?? {};
    byDate.set(row.date, Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v ?? old[k] ?? null])));
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export async function readCache() {
  try {
    return JSON.parse(await readFile(CACHE_FILE, 'utf8'));
  } catch {
    return null;
  }
}

export async function fetchIPCA({ previous, retries = 0 } = {}) {
  for (const [source, fetchSeries] of SOURCES) {
    try {
      const series = await fetchSeries(retries);
      if (!series.length) throw new Error('empty series');
      return { source, fetchedAt: new Date().toISOString(), series: merge(previous?.series ?? [], series) };
    } catch (err) {
      console.error(`${source} failed:`, err.message);
    }
  }
  throw new Error('All sources failed');
}
