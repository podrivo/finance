export const DURATION = 280;
export const FADE = 200;
export const INTRO = 900; // ms for the line to draw in on first load
export const Y_EASE = 70; // ms time constant for the vertical range to follow gestures
export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

function cubicBezier(x1, y1, x2, y2) {
  const at = (t, a, b) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x) => {
    let lo = 0;
    let hi = 1;
    let t = x;
    for (let k = 0; k < 30 && Math.abs(at(t, x1, x2) - x) > 1e-5; k++) {
      at(t, x1, x2) < x ? (lo = t) : (hi = t);
      t = (lo + hi) / 2;
    }
    return at(t, y1, y2);
  };
}
export const easeInOut = cubicBezier(0.77, 0, 0.175, 1);
