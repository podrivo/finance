import { MESES, percent } from './constants.js';
import { crosshair, selection, tooltip, vline } from './dom.js';
import { indexAt, toX, toY } from './scale.js';
import { state } from './state.js';

let hoverQueued = false;

// Above-right of the pointer, flipping at the screen edges. Hidden rather than
// moved when it would crowd the controls. Returns whether it's shown.
function placeTooltip() {
  const GAP = state.touch ? 32 : 12;
  const { pointerX, pointerY, controlsBox: c } = state;
  const [w, h] = [tooltip.offsetWidth, tooltip.offsetHeight];
  const x = pointerX + GAP + w > innerWidth ? pointerX - GAP - w : pointerX + GAP;
  const y = pointerY - GAP - h < 0 ? pointerY + Math.max(16, GAP) : pointerY - GAP - h;
  const crowded = x < c.right + GAP && x + w > c.left - GAP && y < c.bottom + GAP && y + h > c.top - GAP;
  tooltip.classList.toggle('visible', !crowded);
  if (!crowded) tooltip.style.transform = `translate(${x}px, ${y}px)`;
  return !crowded;
}

// Mouse events can outpace the display; handle at most one per frame.
export function queueHover() {
  if (hoverQueued) return;
  hoverQueued = true;
  requestAnimationFrame(() => {
    hoverQueued = false;
    if (state.pointerX !== null) hover();
  });
}

// The crosshair, selection and tooltip are plain elements moved with transforms,
// so hovering never repaints the canvas.
// The tooltip sits beside the mouse; the crosshair and dots snap to the nearest month.
export function hover() {
  const { series, lines, view, shown, dragStart } = state;
  const i = indexAt(state.pointerX);
  if (i !== shown.i) {
    const [year, month] = series[i].date.split('-').map(Number);
    const el = (className, text = '') => Object.assign(document.createElement('div'), { className, textContent: text });
    const rows = lines
      .filter((l) => l.values[i] !== null)
      .map((l) => {
        const row = el('row');
        row.append(el(`swatch ${l.key}`), el('name', l.label), el('value', `${percent.format(l.shown[i])}%`));
        return row;
      });
    tooltip.replaceChildren(el('date', `${MESES[month - 1]}, ${year}`), ...rows);
  }
  crosshair.style.visibility = placeTooltip() ? 'visible' : 'hidden';

  if (i === shown.i && view === shown.view) return;
  state.shown = { i, view };

  const x = toX(i);
  vline.style.transform = `translateX(${Math.round(x)}px)`;
  lines.forEach(({ key, values }) => {
    const dot = crosshair.querySelector(`.dot.${key}`);
    dot.style.visibility = values[i] === null ? 'hidden' : '';
    if (values[i] !== null) dot.style.transform = `translate(${x}px, ${toY(values[i])}px)`;
  });

  if (dragStart !== null) {
    const left = toX(Math.min(dragStart, i));
    selection.style.transform = `translateX(${left}px) scaleX(${toX(Math.max(dragStart, i)) - left})`;
    selection.style.visibility = 'visible';
  }
}

export function hideHover() {
  state.pointerX = null;
  state.shown = { i: -1, view: null };
  crosshair.style.visibility = 'hidden';
  tooltip.classList.remove('visible');
}
