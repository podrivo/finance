import './theme.js';
import { ELECTIONS, LINES } from './constants.js';
import { chart, crosshair, legend } from './dom.js';
import { bindInput } from './input.js';
import { restore, setActive } from './ranges.js';
import { invalidate, playIntro, resize } from './render.js';
import { windowFor } from './scale.js';
import { state } from './state.js';

const getJSON = (url) => fetch(url).then((r) => (r.ok ? r.json() : r.text().then((t) => Promise.reject(new Error(t)))));

// The x axis covers every month any line has; the lines start and end on different months.
function init(loaded) {
  const dates = [...new Set(loaded.flatMap(({ data }) => data.series.map((p) => p.date)))].sort();
  state.series = dates.map((date) => ({ date }));
  state.n = dates.length;
  state.lines = loaded.map(({ data, url, tooltip = 'monthly', ...line }) => {
    const byDate = new Map(data.series.map((p) => [p.date, p]));
    const field = (key) => dates.map((d) => byDate.get(d)?.[key] ?? null);
    return { ...line, values: field('monthly'), shown: field(tooltip), hidden: false, o: 1 };
  });
  const terms = ELECTIONS.map((d) => `${+d.slice(0, 4) + 1}-01`);
  state.elections = state.series.flatMap((p, i) => (terms.includes(p.date) ? [i] : []));

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
  .catch((err) => (chart.textContent = `Error: ${err.message}`))
  .finally(() => document.documentElement.classList.add('ready'));
