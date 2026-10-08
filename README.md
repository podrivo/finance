# IPCA

A minimal website that charts Brazil's historical IPCA (monthly inflation, % change) as a single line, from January 1980 to the latest release.

No dependencies: a small Node server and one HTML page.

## Run

Requires Node 18+ (uses the built-in `fetch`).

```bash
npm start
```

Open http://localhost:3000. Set `PORT` to use a different port.

## How it works

- `server.js` serves the page and a JSON endpoint at `/api/ipca`.
- `ipca.js` fetches the data (main source, fallback and retries), shared by the server and `update.js`.
- `index.html` fetches `/api/ipca` and draws the monthly change as a full-screen SVG line chart.
- `data/ipca.json` is the local cache.

### The chart

- **Line**: a monotone cubic curve through each month's value. It never overshoots between months, so the smoothing doesn't invent peaks or dips.
- **Gridlines**: a 0% baseline (round percentages are labelled on the left without lines), vertical lines at each presidential election's first round (1989, 1994, then every 4 years from 1998). Election dates are in the `ELECTIONS` array in `index.html`.
- **Adaptive axes**: the percentage step (from 100% down to 0.05%) follows the visible range. The time axis labels election years when zoomed out, then every year, half-year, quarter and month as space allows (at least `MIN_GAP` pixels between labels), adding lighter gridlines for those finer steps. Gridlines and labels fade in and out as you cross each level.
- **Hover**: a dashed crosshair and a dot snap to the nearest month on the line. A tooltip beside the mouse shows it in Brazilian format, e.g. `Ago, 2007 · 0,47%`.
- **Time ranges**: All, Since 1995 (the default), 10Y and 5Y buttons. The vertical scale fits whatever range is visible.
- **Zoom**: scroll up to zoom in and down to zoom out, pinch on a trackpad or touchscreen, or drag across a span to zoom into it; double-click to go back to the full history.
- **Pan**: scroll horizontally on a trackpad (or Shift+wheel), or drag with one finger on a touchscreen, to move through time. Panning stops at the first and last month.
- **Remembered view**: the selection is saved in `localStorage` (key `ipca:view`) and restored on load. A preset range is saved by name, so "5Y" still means the latest five years after new data arrives. A custom zoom or pan is saved as its exact window. Missing or invalid saved data falls back to "Since 1995".
- **Transitions**: changing the range or zooming animates the view over 280ms (`DURATION` in `index.html`), with gridlines and labels fading between scales. While scrolling, pinching or panning, the time axis follows the gesture directly and the vertical range eases toward its new fit (`Y_EASE` in `index.html`), so spikes entering or leaving the view don't make the scale jump. With the system's reduced-motion setting on, it switches instantly with a short fade.
- **Performance**: the gridlines and line are drawn on a `<canvas>`, which only redraws when the view changes (during a transition or a resize), and only the visible months are drawn. The crosshair, zoom selection, labels and tooltip are HTML elements moved with transforms, so hovering never repaints the chart. Hover updates run at most once per frame.

### Data

IPCA is published once a month, so a month is the finest granularity available. Each month in `data/ipca.json` has four measures:

```json
{
  "source": "IBGE SIDRA",
  "fetchedAt": "2026-10-08T17:00:00.000Z",
  "series": [
    { "date": "2026-08", "monthly": -0.32, "ytd": 3.11, "twelveMonths": 4.22, "index": 7633.23 }
  ]
}
```

| Field | Meaning | IBGE SIDRA (table 1737) | Central Bank SGS |
|---|---|---|---|
| `monthly` | % change over the previous month | variable 63 | series 433 |
| `ytd` | % change accumulated in the year | variable 69 | not available |
| `twelveMonths` | % change accumulated over the last 12 months | variable 2265 | series 13522 |
| `index` | Index number, December 1993 = 100 | variable 2266 | not available |

Missing values are `null`. For example, `twelveMonths` starts in 1980-12, since it needs a full year of data. The annual inflation for a year is its December `ytd`. Index numbers before the Plano Real are tiny (about 0.0000000076 in 1979-12) because the index is anchored at December 1993.

### Data sources

1. **IBGE SIDRA** (main). IBGE calculates and publishes IPCA, so it's the primary source. All four measures come in one request:
   `https://apisidra.ibge.gov.br/values/t/1737/n1/all/v/63,69,2265,2266/p/all`
2. **Banco Central do Brasil SGS** (fallback). The Central Bank republishes the IBGE numbers but only has `monthly` and `twelveMonths`, so `ytd` and `index` keep their previously saved values (or are `null` for months not saved yet) when this source is used:
   `https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json`
   `https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados?formato=json`

Both APIs are public and need no key. Comparing them month by month showed identical `monthly` and `twelveMonths` values for every month from 1980-01 to 2026-08. SIDRA marks months with no data as `"..."`; those are skipped.

### Caching

- If `data/ipca.json` is less than 24 hours old, it's served as is.
- Otherwise the server fetches from IBGE, falls back to the Central Bank if IBGE fails, and rewrites the cache.
- If both APIs fail, the last saved data is served regardless of age.

Delete `data/ipca.json` to force a refresh.

### Daily update

`.github/workflows/update-data.yml` runs `npm run update` (`update.js`) every day at 13:00 UTC (10:00 in Brasília, after IBGE's usual 9:00 release) and commits `data/ipca.json` only when the series changed. It can also be run by hand from the Actions tab.

When a request fails, `update.js` retries up to 3 times per source, waiting according to the error:

- Network error or timeout: retry soon (2s, 4s, 8s).
- HTTP 5xx, 408, or a response that isn't JSON: back off (5s, 15s, 45s).
- HTTP 429, or 503 with a `Retry-After` header: wait as long as the server asks (capped at 10 minutes), or 1, 2, then 3 minutes without the header.
- Any other 4xx: don't retry, go straight to the fallback.

If both sources fail, the run fails (GitHub emails the repo owner) and nothing is committed. The server doesn't retry, so page loads never hang.

## Notes

The 1980s to 1994 hyperinflation (up to about 82% in a single month in 1990) dominates the vertical scale on the full history, which makes the post-Plano Real years look nearly flat. That's why the chart opens on "Since 1995", and why the ranges and zoom rescale vertically. A logarithmic scale was tried and dropped.

## Other related data (not fetched yet)

- **IPCA-15**: a preview of IPCA, using prices collected from mid-month to mid-month and released about two weeks before the official number. SIDRA table 7062 and Central Bank SGS series 7478.
- **Market forecasts**: the Central Bank's weekly Focus survey publishes expected future IPCA through its own API (Olinda, `olinda.bcb.gov.br`).
- **Breakdowns by city and spending category**: SIDRA table 7060, from 2020 onward.
