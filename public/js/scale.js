import { state } from './state.js';

export const toX = (i) => ((i - state.view.x0) / (state.view.x1 - state.view.x0)) * state.box.width;
export const toY = (v) => ((state.view.yMax - v) / (state.view.yMax - state.view.yMin)) * state.box.height;

export function indexAt(clientX) {
  const { view, box } = state;
  const i = Math.round(view.x0 + ((clientX - box.left) / box.width) * (view.x1 - view.x0));
  return Math.max(Math.ceil(view.x0), Math.min(Math.floor(view.x1), i));
}

// Visible window over months a..b, with the vertical range fitted to that slice.
export function windowFor(a, b) {
  const slice = state.values.slice(Math.floor(a), Math.ceil(b) + 1);
  const lo = Math.min(0, ...slice);
  const hi = Math.max(...slice);
  const range = hi - lo;
  return { x0: a, x1: b, yMin: lo - range * 0.06, yMax: hi + range * 0.04 };
}

// Monotone cubic tangent (as in d3's curveMonotoneX): the curve passes through every
// month without overshooting, so smoothing never invents peaks or dips.
export function slopeAt(i) {
  const { values, n } = state;
  if (i === 0) return values[1] - values[0];
  if (i === n - 1) return values[i] - values[i - 1];
  const s0 = values[i] - values[i - 1];
  const s1 = values[i + 1] - values[i];
  return (Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), Math.abs(s0 + s1) / 4);
}
