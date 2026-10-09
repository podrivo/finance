import './theme.js';
import { BUFFER, ELECTIONS, EVENTS, LINES } from './constants.js';
import { chart, crosshair, legend } from './dom.js';
import { bindInput } from './input.js';
import { restore, setActive } from './ranges.js';
import { invalidate, playIntro, resize } from './render.js';
import { windowFor } from './scale.js';
import { state } from './state.js';

const getJSON = (url) => fetch(url).then((r) => (r.ok ? r.json() : r.text().then((t) => Promise.reject(new Error(t)))));

const addMonths = (date, k) => {
  const [year, month] = date.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1 + k));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

// Pads real-month values with BUFFER months each side. A line that starts with the axis
// runs flat through the leading buffer; every line runs flat from its last value to the end.
const extend = (values) => {
  const last = values.findLastIndex((v) => v !== null);
  const filled = values.map((v, i) => (i > last ? values[last] : v));
  return [...Array(BUFFER).fill(values[0]), ...filled, ...Array(BUFFER).fill(filled.at(-1))];
};
const pad = (values) => [...Array(BUFFER).fill(null), ...values, ...Array(BUFFER).fill(null)];

// The x axis covers every month any line has, plus BUFFER months each side where
// the lines run flat; the lines start and end on different months.
function init(loaded) {
  const real = [...new Set(loaded.flatMap(({ data }) => data.series.map((p) => p.date)))].sort();
  const dates = [
    ...Array.from({ length: BUFFER }, (_, k) => addMonths(real[0], k - BUFFER)),
    ...real,
    ...Array.from({ length: BUFFER }, (_, k) => addMonths(real.at(-1), k + 1)),
  ];
  state.series = dates.map((date) => ({ date }));
  state.n = dates.length;
  state.lines = loaded.map(({ data, url, tooltip = 'monthly', ...line }) => {
    const byDate = new Map(data.series.map((p) => [p.date, p]));
    const field = (key) => real.map((d) => byDate.get(d)?.[key] ?? null);
    return { ...line, values: extend(field('monthly')), shown: pad(field(tooltip)), hidden: false, o: 1 };
  });
  const terms = ELECTIONS.map(({ date, term }) => term ?? `${+date.slice(0, 4) + 1}-01`);
  const index = (date) => (real.includes(date) ? [BUFFER + real.indexOf(date)] : []);
  state.elections = terms.flatMap(index);
  state.events = [...EVENTS, ...ELECTIONS].flatMap(({ date, ...event }) => index(date).map((i) => ({ i, ...event })));

  for (const line of state.lines) {
    const dot = Object.assign(document.createElement('div'), { className: `dot ${line.key}` });
    const item = Object.assign(document.createElement('button'), { className: line.key, textContent: line.label });
    item.setAttribute('aria-pressed', 'true');
    item.addEventListener('click', () => {
      line.hidden = !line.hidden;
      item.setAttribute('aria-pressed', String(!line.hidden));
      state.shown = { i: -1, view: null };
      invalidate();
    });
    crosshair.append(dot);
    legend.append(item);
  }

  const [range, win] = restore();
  setActive(range);
  state.view = windowFor(...win);
  playIntro();
  new ResizeObserver(resize).observe(chart);
  bindInput();
}

// IPCA is required; any other line that fails to load is left out.
Promise.all(
  LINES.map((line, i) =>
    getJSON(line.url).then(
      (data) => ({ ...line, data: { ...data, series: data.series.filter((p) => p.monthly !== null) } }),
      (err) => (i === 0 ? Promise.reject(err) : null)
    )
  )
)
  .then((loaded) => init(loaded.filter(Boolean)))
  .catch((err) => (chart.textContent = `Erro: ${err.message}`))
  .finally(() => document.documentElement.classList.add('ready'));
