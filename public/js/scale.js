import { BUFFER } from './constants.js';
import { state } from './state.js';

export const toX = (i) => ((i - state.view.x0) / (state.view.x1 - state.view.x0)) * state.box.width;
export const toY = (v) => ((state.view.yMax - v) / (state.view.yMax - state.view.yMin)) * state.box.height;

export function indexAt(clientX) {
  const { view, box } = state;
  const i = Math.round(view.x0 + ((clientX - box.left) / box.width) * (view.x1 - view.x0));
  const visible = Math.max(Math.ceil(view.x0), Math.min(Math.floor(view.x1), i));
  return Math.max(BUFFER, Math.min(state.n - 1 - BUFFER, visible));
}

// Visible window over months a..b, with the vertical range fitted to every line in that slice.
export function windowFor(a, b) {
  const slice = state.lines.flatMap((l) => l.values.slice(Math.floor(a), Math.ceil(b) + 1)).filter((v) => v !== null);
  const lo = Math.min(0, ...slice);
  const hi = Math.max(...slice);
  const range = hi - lo;
  return { x0: a, x1: b, yMin: lo - range * 0.06, yMax: hi + range * 0.04 };
}

// Monotone cubic tangent (as in d3's curveMonotoneX): the curve passes through every
// month without overshooting, so smoothing never invents peaks or dips.
// A missing neighbor (null, or past either end) is treated like the end of the line.
export function slopeAt(values, i) {
  const [prev, next] = [values[i - 1] ?? null, values[i + 1] ?? null];
  if (prev === null) return next === null ? 0 : next - values[i];
  if (next === null) return values[i] - prev;
  const s0 = values[i] - values[i - 1];
  const s1 = values[i + 1] - values[i];
  return (Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), Math.abs(s0 + s1) / 4);
}
