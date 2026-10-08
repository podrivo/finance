import { canvas, rangeButtons, selection } from './dom.js';
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

  canvas.addEventListener('mousedown', (e) => (state.dragStart = indexAt(e.clientX)));
  canvas.addEventListener('mousemove', (e) => {
    state.pointerX = e.clientX;
    state.pointerY = e.clientY;
    queueHover();
  });
  addEventListener('mouseup', (e) => {
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
  let pinch = null;
  const pinchOf = (touches) => {
    if (touches.length === 1) return { x: touches[0].clientX, d: 1 };
    const [p, q] = touches;
    return { x: (p.clientX + q.clientX) / 2, d: Math.hypot(p.clientX - q.clientX, p.clientY - q.clientY) };
  };
  const startTouch = (e) => {
    pinch = e.touches.length ? pinchOf(e.touches) : null;
    state.dragStart = null;
    selection.style.visibility = 'hidden';
  };
  canvas.addEventListener('touchstart', startTouch);
  canvas.addEventListener('touchend', startTouch);
  canvas.addEventListener('touchcancel', startTouch);
  canvas.addEventListener('touchmove', (e) => {
    if (!pinch) return;
    const next = pinchOf(e.touches);
    zoom(pinch.x, next.x, pinch.d / Math.max(1, next.d));
    pinch = next;
  });
}
