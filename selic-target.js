import { getJSON } from './http.js';
import { DATA_DIR } from './cache.js';

export const CACHE_FILE = new URL('selic-target.json', DATA_DIR);

const FIRST_YEAR = 1999;

export async function fetchSelicTarget({ previous, retries = 0 } = {}) {
  // SGS lists every calendar day, including future days up to the next Copom meeting.
  const currentMonth = new Date().toLocaleDateString('sv', { timeZone: 'America/Sao_Paulo' }).slice(0, 7);

  const byDate = Object.fromEntries((previous?.series ?? []).map((r) => [r.date, r.target]));
  const startYear = previous?.series?.length
    ? Number(previous.series.at(-1).date.slice(0, 4))
    : FIRST_YEAR;

  // Daily series accept at most 10 years per request; 5-year chunks avoid runner timeouts.
  for (let year = startYear; year <= new Date().getFullYear(); year += 5) {
    const rows = await getJSON(
      `https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json&dataInicial=01/01/${year}&dataFinal=31/12/${year + 4}`,
      retries
    );
    // Rows are in date order, so the last one in each month wins.
    for (const r of rows) {
      const date = `${r.data.slice(6)}-${r.data.slice(3, 5)}`;
      if (date < currentMonth) byDate[date] = Number(r.valor);
    }
  }

  const series = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, target]) => ({
      date,
      target,
      monthly: Math.round(((1 + target / 100) ** (1 / 12) - 1) * 1e6) / 1e4,
    }));
  if (!series.length) throw new Error('empty series');
  return { source: 'BCB SGS', fetchedAt: new Date().toISOString(), series };
}
