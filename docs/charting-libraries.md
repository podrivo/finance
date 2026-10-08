# Charting libraries

## Current state

The project has no dependencies. The chart is hand-written on a 2D `<canvas>` in `index.html`: about 380 lines of script covering the monotone curve, adaptive axes, zoom, pan, pinch, hover and transitions.

## When a library would help

For a single line series, the custom code is enough. A library starts paying off when we add any of:

- Several series at once (`monthly`, `ytd`, `twelveMonths`, or IPCA-15 next to IPCA)
- Other chart types (bars for annual inflation, breakdowns by category)
- Legends, toggling series on and off, a second y-axis
- Several charts on one page with a shared cursor

## Options

In rough order of fit for this project:

- **[uPlot](https://github.com/leeoniya/uPlot)** (~50 KB): a fast canvas library for time series, with zoom, cursor, multiple series and multiple axes built in. Closest to the current approach, and the best fit if the project stays focused on time series.
- **[Apache ECharts](https://echarts.apache.org)**: a full toolkit with many chart types, data zoom, legends, tooltips, animations and themes. Heavier (~300 KB+ tree-shaken), but covers almost any chart we might add.
- **[D3](https://d3js.org)** (individual modules such as `d3-scale`, `d3-shape`, `d3-zoom`): building blocks rather than ready-made charts. Full control of the look, and could replace parts of the hand-written code (our curve already matches `curveMonotoneX`). Most flexible, but still the most code to write.
- **[Observable Plot](https://observablehq.com/plot)**: quick to write and good for static analytical charts, weaker at interactive zoom and pan.

Not recommended: Chart.js handles dense time series and smooth zoom less well, and Recharts is React-only (the project doesn't use a framework).

## Recommendation

Keep the custom chart while it's one series. When a second series or a second chart is added, move to uPlot if it stays time series, or ECharts if bars, breakdowns or dashboards are expected. Both can be loaded from a `<script>` tag, with no build step.
