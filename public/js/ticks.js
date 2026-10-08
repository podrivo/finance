import { MIN_GAP, MONTHS, MONTH_STEPS, STEPS } from './constants.js';
import { state } from './state.js';

export function valueTicks() {
  const { yMin: lo, yMax: hi } = state.view;
  const step = STEPS.find((s) => (hi - lo) / s <= 8);
  const out = [];
  for (let k = Math.ceil(lo / step); k * step <= hi; k++) {
    const v = +(k * step).toFixed(2);
    out.push({ key: `y${v}`, axis: 'y', v, text: `${v}%` });
  }
  return out;
}

// Election years when zoomed out; every year, then quarters, then months as there's room.
export function timeTicks() {
  const { view, box, series, n, elections } = state;
  const perMonth = box.width / (view.x1 - view.x0);
  const step = MONTH_STEPS.find((s) => s * perMonth >= MIN_GAP);
  if (!step) return elections.map((i) => ({ key: `e${i}`, axis: 'x', i, text: series[i].date.slice(0, 4) }));
  const out = [];
  for (let i = Math.max(0, Math.floor(view.x0)); i <= Math.min(n - 1, Math.ceil(view.x1)); i++) {
    const [year, month] = series[i].date.split('-').map(Number);
    if ((month - 1) % step) continue;
    out.push({ key: `m${i}`, axis: 'x', i, line: month === 1 ? 'year' : 'month', text: month === 1 ? `${year}` : MONTHS[month - 1] });
  }
  return out;
}
