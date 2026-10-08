// State read or written by more than one module. State owned by a single module lives there.
export const state = {
  series: [],
  values: [],
  n: 0,
  elections: [], // month indices of election months
  view: null, // the currently displayed window, possibly mid-animation
  box: null, // chart bounds
  controlsBox: null,
  palette: null,
  pointerX: null,
  pointerY: 0,
  touch: false, // whether the pointer is a finger, so the tooltip keeps clear of it
  shown: { i: -1, view: null }, // what the crosshair last drew
  dragStart: null,
};
