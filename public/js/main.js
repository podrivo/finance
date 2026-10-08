import './theme.js';
import { ELECTIONS } from './constants.js';
import { chart } from './dom.js';
import { bindInput } from './input.js';
import { restore, setActive } from './ranges.js';
import { resize } from './render.js';
import { windowFor } from './scale.js';
import { state } from './state.js';

function init(data) {
  state.series = data.series.filter((p) => p.monthly !== null);
  state.values = state.series.map((p) => p.monthly);
  state.n = state.series.length;
  state.elections = state.series.flatMap((p, i) => (ELECTIONS.includes(p.date) ? [i] : []));

  const [range, win] = restore();
  setActive(range);
  state.view = windowFor(...win);
  new ResizeObserver(resize).observe(chart);
  bindInput();
}

fetch('/api/ipca')
  .then((r) => (r.ok ? r.json() : r.text().then((t) => Promise.reject(new Error(t)))))
  .then(init)
  .catch((err) => (chart.textContent = `Error: ${err.message}`));
