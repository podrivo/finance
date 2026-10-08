import { MIN_SPAN } from './constants.js';
import { rangeButtons } from './dom.js';
import { state } from './state.js';

let activeRange = null;
export function setActive(range) {
  activeRange = range;
  rangeButtons.forEach((b) => b.classList.toggle('active', b.dataset.range === range));
}

export const RANGES = {
  all: () => [0, state.n - 1],
  real: () => [state.series.findIndex((p) => p.date >= '1995-01'), state.n - 1],
  '10y': () => [state.n - 120, state.n - 1],
  '5y': () => [state.n - 60, state.n - 1],
};

// A preset range is saved by name so it keeps tracking the latest months; a custom
// zoom is saved as month indices, which stay stable because the series starts in 1980-01.
const STORAGE_KEY = 'ipca:view';
let saveTimer = 0;
export function save(x0, x1) {
  clearTimeout(saveTimer);
  const saved = activeRange ? { range: activeRange } : { x0, x1 };
  saveTimer = setTimeout(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)), 200);
}

export function restore() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (RANGES[s.range]) return [s.range, RANGES[s.range]()];
    if (s.x0 >= 0 && s.x1 <= state.n - 1 && s.x1 - s.x0 >= MIN_SPAN) return [null, [s.x0, s.x1]];
  } catch {}
  return ['real', RANGES.real()];
}
