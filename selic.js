import { getJSON } from './http.js';
import { DATA_DIR } from './cache.js';

export const CACHE_FILE = new URL('selic.json', DATA_DIR);

const BCB_FIELDS = { 4390: 'monthly', 4189: 'annualized' };

const round = (n) => Math.round(n * 100) / 100;

// Compounds monthly % changes over the given months, or null if any month is missing.
function compound(months) {
  if (months.some((m) => m?.monthly == null)) return null;
  return round((months.reduce((acc, m) => acc * (1 + m.monthly / 100), 1) - 1) * 100);
}

export async function fetchSelic({ retries = 0 } = {}) {
  const end = `31/12/${new Date().getFullYear()}`;
  // SGS includes the month in progress, accumulated so far.
  const currentMonth = new Date().toLocaleDateString('sv', { timeZone: 'America/Sao_Paulo' }).slice(0, 7);

  const byDate = {};
  for (const [code, field] of Object.entries(BCB_FIELDS)) {
    const rows = await getJSON(
      `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados?formato=json&dataInicial=01/01/1986&dataFinal=${end}`,
      retries
    );
    for (const r of rows) {
      const date = `${r.data.slice(6)}-${r.data.slice(3, 5)}`;
      if (date >= currentMonth) continue;
      byDate[date] ??= { date, monthly: null, ytd: null, twelveMonths: null, annualized: null };
      byDate[date][field] = Number(r.valor);
    }
  }

  const series = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  if (!series.length) throw new Error('empty series');
  series.forEach((row, i) => {
    const month = Number(row.date.slice(5));
    const yearStart = series[i - month + 1];
    if (yearStart?.date === `${row.date.slice(0, 4)}-01`) row.ytd = compound(series.slice(i - month + 1, i + 1));
    if (i >= 11) row.twelveMonths = compound(series.slice(i - 11, i + 1));
  });

  return { source: 'BCB SGS', fetchedAt: new Date().toISOString(), series };
}
