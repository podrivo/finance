// State read or written by more than one module. State owned by a single module lives there.
export const state = {
  series: [], // one { date } per month, across all lines
  lines: [], // LINES entries plus values (plotted) and shown (tooltip), aligned to series, null where a line has no data
  n: 0,
  elections: [], // month indices of the January after each election
  governments: [], // { president, parties, i0, i1, texts, ws, el, shown } per presidency, from GOVERNMENTS
  bannerTop: 0, // px from the chart top to the banners, below the legend and controls
  events: [], // { i, label, note } for each of EVENTS and ELECTIONS within the series
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
