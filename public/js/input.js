import { DOUBLE_TAP, HOLD, TAP_SLOP } from './constants.js';
import { canvas, chart, modeButton, rangeButtons, selection } from './dom.js';
import { hideHover, queueHover } from './hover.js';
import { RANGES, setActive } from './ranges.js';
import { animateTo, zoom } from './render.js';
import { indexAt, windowFor } from './scale.js';
import { state } from './state.js';

export function bindInput() {
  rangeButtons.forEach((b) =>
    b.addEventListener('click', () => {
      setActive(b.dataset.range);
      animateTo(windowFor(...RANGES[b.dataset.range]()));
    })
  );

  // A mouse drag either selects a range to zoom into or pans, depending on the mode.
  let pan = true;
  let panX = null;
  const applyMode = () => {
    chart.classList.toggle('pan', pan);
    const label = pan ? 'Mudar para arrastar e selecionar um período' : 'Mudar para arrastar e mover o gráfico';
    modeButton.setAttribute('aria-label', label);
    modeButton.querySelectorAll('svg').forEach((svg) => (svg.style.display = (svg.dataset.icon === 'pan') === pan ? '' : 'none'));
  };
  const toggleMode = () => {
    pan = !pan;
    applyMode();
  };
  applyMode();
  modeButton.addEventListener('click', toggleMode);
  addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() !== 'h' || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    toggleMode();
  });

  canvas.addEventListener('mousedown', (e) => {
    if (!pan) return (state.dragStart = indexAt(e.clientX));
    panX = e.clientX;
    chart.classList.add('panning');
  });
  canvas.addEventListener('mousemove', (e) => {
    state.touch = false;
    state.pointerX = e.clientX;
    state.pointerY = e.clientY;
    queueHover();
  });
  addEventListener('mousemove', (e) => {
    if (panX === null) return;
    zoom(panX, e.clientX, 1);
    panX = e.clientX;
  });
  addEventListener('mouseup', (e) => {
    if (panX !== null) {
      panX = null;
      chart.classList.remove('panning');
    }
    if (state.dragStart === null) return;
    const [a, b] = [state.dragStart, indexAt(e.clientX)].sort((x, y) => x - y);
    state.dragStart = null;
    selection.style.visibility = 'hidden';
    if (b - a < 2) return;
    setActive(null);
    animateTo(windowFor(a, b));
  });
  canvas.addEventListener('dblclick', () => {
    setActive('all');
    animateTo(windowFor(...RANGES.all()));
  });
  canvas.addEventListener('mouseleave', hideHover);

  // Trackpad pinch arrives as ctrl+wheel in Chrome and Firefox, and as gesture events in Safari.
  // Plain scrolling zooms (vertical) or pans (horizontal), whichever direction dominates.
  // Listens on the whole window and claims every scroll, so browsers never treat a
  // sideways swipe as back/forward.
  addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const scale = e.deltaMode === 1 ? 16 : 1;
      const [dx, dy] = [e.deltaX * scale, e.deltaY * scale];
      if (e.ctrlKey) zoom(e.clientX, e.clientX, Math.exp(dy * 0.01));
      else if (Math.abs(dx) > Math.abs(dy)) zoom(e.clientX, e.clientX - dx, 1);
      else zoom(e.clientX, e.clientX, Math.exp(dy * 0.002));
    },
    { passive: false }
  );
  let gestureScale = 1;
  canvas.addEventListener('gesturestart', (e) => {
    e.preventDefault();
    gestureScale = 1;
  });
  canvas.addEventListener('gesturechange', (e) => {
    e.preventDefault();
    zoom(e.clientX, e.clientX, gestureScale / e.scale);
    gestureScale = e.scale;
  });

  // One finger pans, two fingers pinch (and pan by their midpoint).
  // A tap shows the month under the finger and a double tap shows everything.
  // Touching and holding still scrubs through months instead of panning.
  // The tooltip stays up after lifting the finger, until the next touch.
  let pinch = null;
  let press = null; // a single finger that hasn't moved yet: { x, y, timer }
  let scrubbing = false;
  let lastTap = 0;
  const pinchOf = (touches) => {
    if (touches.length === 1) return { x: touches[0].clientX, d: 1 };
    const [p, q] = touches;
    return { x: (p.clientX + q.clientX) / 2, d: Math.hypot(p.clientX - q.clientX, p.clientY - q.clientY) };
  };
  const showAt = (x, y) => {
    state.touch = true;
    state.pointerX = x;
    state.pointerY = y;
    queueHover();
  };
  const release = () => {
    clearTimeout(press?.timer);
    press = null;
  };
  const resetTouch = (e) => {
    pinch = e.touches.length ? pinchOf(e.touches) : null;
    state.dragStart = null;
    selection.style.visibility = 'hidden';
  };
  // Cancelling touchstart stops the browser from also firing emulated mouse events.
  canvas.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault();
      release();
      hideHover();
      scrubbing = false;
      resetTouch(e);
      if (e.touches.length !== 1) return;
      const { clientX: x, clientY: y } = e.touches[0];
      press = { x, y, timer: setTimeout(() => ((scrubbing = true), showAt(x, y)), HOLD) };
    },
    { passive: false }
  );
  const endTouch = (e) => {
    if (press && !e.touches.length) {
      if (e.timeStamp - lastTap < DOUBLE_TAP) {
        lastTap = 0;
        hideHover();
        setActive('all');
        animateTo(windowFor(...RANGES.all()));
      } else {
        lastTap = e.timeStamp;
        showAt(press.x, press.y);
      }
    }
    release();
    if (!e.touches.length) scrubbing = false;
    resetTouch(e);
  };
  canvas.addEventListener('touchend', endTouch);
  canvas.addEventListener('touchcancel', endTouch);
  canvas.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (scrubbing) return showAt(t.clientX, t.clientY);
    if (press) {
      if (Math.hypot(t.clientX - press.x, t.clientY - press.y) < TAP_SLOP) return;
      release();
    }
    if (!pinch) return;
    const next = pinchOf(e.touches);
    zoom(pinch.x, next.x, pinch.d / Math.max(1, next.d));
    pinch = next;
  });
}
