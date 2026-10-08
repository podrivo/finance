import { getJSON } from './http.js';
import { DATA_DIR } from './cache.js';

export const CACHE_FILE = new URL('ipca.json', DATA_DIR);

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
