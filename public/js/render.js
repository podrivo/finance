import { MIN_SPAN } from './constants.js';
import { canvas, chart, controls, ctx, labels } from './dom.js';
import { hover } from './hover.js';
import { DURATION, FADE, INTRO, Y_EASE, easeInOut, reduceMotion } from './motion.js';
import { save, setActive } from './ranges.js';
import { slopeAt, toX, toY, windowFor } from './scale.js';
import { state } from './state.js';
import { timeTicks, valueTicks } from './ticks.js';

let anim = null;
let yGoal = null; // vertical range that gestures ease toward
let frame = 0;
let lastDraw = 0;
let lastFrame = 0;
const fades = new Map(); // tick key -> { tick, o, el }
let intro = null; // { start } while the line draws in; start is set on the first frame

export function playIntro() {
  if (reduceMotion.matches) chart.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease' });
  else intro = { start: null };
}

export function invalidate() {
  if (!frame) frame = requestAnimationFrame(render);
}

export function resize() {
  const box = (state.box = chart.getBoundingClientRect());
  state.controlsBox = controls.getBoundingClientRect();
  const dpr = devicePixelRatio || 1;
  canvas.width = Math.round(box.width * dpr);
  canvas.height = Math.round(box.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  state.shown.view = null;
  if (draw(performance.now())) invalidate();
}

function render(now) {
  frame = 0;
  if (anim) {
    const p = Math.min(1, (now - anim.start) / DURATION);
    const e = easeInOut(p);
    const lerp = (key) => anim.from[key] + (anim.to[key] - anim.from[key]) * e;
    state.view = { x0: lerp('x0'), x1: lerp('x1'), yMin: lerp('yMin'), yMax: lerp('yMax') };
    if (p === 1) anim = null;
  } else if (yGoal) {
    const { view } = state;
    const k = reduceMotion.matches ? 1 : 1 - Math.exp(-Math.min(now - lastFrame, 34) / Y_EASE);
    const yMin = view.yMin + (yGoal.yMin - view.yMin) * k;
    const yMax = view.yMax + (yGoal.yMax - view.yMax) * k;
    const settled = Math.abs(yGoal.yMin - yMin) + Math.abs(yGoal.yMax - yMax) < (yGoal.yMax - yGoal.yMin) * 1e-3;
    state.view = { ...view, ...(settled ? yGoal : { yMin, yMax }) };
    if (settled) yGoal = null;
  }
  lastFrame = now;
  if (draw(now) || anim || yGoal) invalidate();
}

// Ticks fade in and out on their own clock as the view crosses scale thresholds.
// Returns true while any fade or the intro is still running.
function draw(now) {
  const { view, box, lines, n, palette, elections } = state;
  const dt = reduceMotion.matches ? 1 : Math.min(now - lastDraw, 34) / FADE;
  lastDraw = now;
  const wanted = new Map([...valueTicks(), ...timeTicks()].map((t) => [t.key, t]));
  for (const [key, tick] of wanted) {
    if (fades.has(key)) continue;
    const el = document.createElement('span');
    el.className = tick.line === 'month' ? 'label minor' : 'label';
    el.textContent = tick.text;
    labels.append(el);
    fades.set(key, { tick, o: 0, el });
  }
  let fading = false;
  for (const [key, f] of fades) {
    const on = wanted.has(key);
    f.o = on ? Math.min(1, f.o + dt) : Math.max(0, f.o - dt);
    if (f.o !== +on) fading = true;
    if (!on && f.o === 0) {
      f.el.remove();
      fades.delete(key);
    }
  }
  for (const line of lines) {
    const goal = line.hidden ? 0 : 1;
    line.o = goal ? Math.min(1, line.o + dt) : Math.max(0, line.o - dt);
    if (line.o !== goal) fading = true;
  }

  let p = 1;
  if (intro) {
    intro.start ??= now;
    p = Math.min(1, (now - intro.start) / INTRO);
    if (p === 1) intro = null;
  }
  const head = box.width * easeInOut(p);
  // During the intro, time labels appear as the line reaches them and value labels rise in from the bottom.
  const shown = (tick) => {
    if (p === 1) return 1;
    const s = tick.axis === 'x' ? (head - toX(tick.i)) / 60 : (p - 0.4 * (1 - toY(tick.v) / box.height)) / 0.3;
    return Math.max(0, Math.min(1, s));
  };

  ctx.clearRect(0, 0, box.width, box.height);
  ctx.lineWidth = 1;
  for (const { tick, o } of fades.values()) {
    if (tick.axis === 'x' ? !tick.line : tick.v !== 0) continue;
    ctx.globalAlpha = o * shown(tick);
    ctx.strokeStyle = tick.axis === 'x' ? palette[tick.line] : palette.zero;
    ctx.beginPath();
    if (tick.axis === 'y') {
      const y = Math.round(toY(tick.v)) + 0.5;
      ctx.moveTo(0, y);
      ctx.lineTo(box.width, y);
    } else {
      const x = Math.round(toX(tick.i)) + 0.5;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, box.height);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, head, box.height);
  ctx.clip();
  ctx.strokeStyle = palette.election;
  ctx.beginPath();
  for (const i of elections) {
    const x = Math.round(toX(i)) + 0.5;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, box.height);
  }
  ctx.stroke();

  const a = Math.max(0, Math.floor(view.x0) - 1);
  const b = Math.min(n - 1, Math.ceil(view.x1) + 1);
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  for (const { key, values, step, dash = [], o } of lines.toReversed()) {
    if (o === 0) continue;
    ctx.globalAlpha = o;
    ctx.strokeStyle = palette[key];
    ctx.setLineDash(dash);
    ctx.beginPath();
    for (let i = a; i <= b; i++) {
      if (values[i] === null) continue;
      if (i === a || values[i - 1] === null) {
        ctx.moveTo(toX(i), toY(values[i]));
        continue;
      }
      if (step) {
        ctx.lineTo(toX(i), toY(values[i - 1]));
        ctx.lineTo(toX(i), toY(values[i]));
        continue;
      }
      const [m0, m1] = [slopeAt(values, i - 1), slopeAt(values, i)];
      ctx.bezierCurveTo(
        toX(i - 2 / 3), toY(values[i - 1] + m0 / 3),
        toX(i - 1 / 3), toY(values[i] - m1 / 3),
        toX(i), toY(values[i])
      );
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  for (const { tick, o, el } of fades.values()) {
    const s = shown(tick);
    const rise = (1 - s) * 6;
    if (tick.axis === 'y') {
      const y = toY(tick.v);
      el.style.opacity = y < 0 || y > box.height ? 0 : o * s;
      el.style.transform = `translate(8px, calc(${y + rise}px - 100% - 4px))`;
    } else {
      const x = toX(tick.i);
      el.style.opacity = x < 0 || x > box.width ? 0 : o * s;
      el.style.transform = `translate(${x + 4}px, calc(${box.height - 8 + rise}px - 100%))`;
    }
  }

  if (state.pointerX !== null) hover();
  return fading || !!intro;
}

export function animateTo(next) {
  save(next.x0, next.x1);
  yGoal = null;
  if (reduceMotion.matches) {
    anim = null;
    state.view = next;
    chart.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 150, easing: 'ease' });
  } else {
    anim = { from: state.view, to: next, start: performance.now() };
  }
  invalidate();
}

// Scales the window by `factor` (1 to just pan), keeping the month under `fromX` pinned beneath `toClientX`.
export function zoom(fromX, toClientX, factor) {
  const { view, box, n } = state;
  const span = view.x1 - view.x0;
  const next = Math.max(MIN_SPAN, Math.min(n - 1, span * factor));
  const anchor = view.x0 + ((fromX - box.left) / box.width) * span;
  const x0 = Math.max(0, Math.min(n - 1 - next, anchor - ((toClientX - box.left) / box.width) * next));
  if (x0 === view.x0 && next === span) return;
  anim = null;
  const { yMin, yMax } = windowFor(x0, x0 + next);
  if (!yGoal) lastFrame = performance.now();
  state.view = { ...view, x0, x1: x0 + next };
  yGoal = { yMin, yMax };
  setActive(null);
  save(x0, x0 + next);
  invalidate();
}
