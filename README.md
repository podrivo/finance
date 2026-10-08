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
- `index.html` fetches `/api/ipca` and draws the monthly change as a full-screen SVG line chart.
- `data/ipca.json` is the local cache.

### The chart

- **Gridlines**: horizontal lines at round percentages, vertical lines at each presidential election's first round (1989, 1994, then every 4 years from 1998). Election dates are in the `ELECTIONS` array in `index.html`.
- **Hover**: a dashed crosshair snaps to the nearest month, with a tooltip showing its value.
- **Time ranges**: All, Since 1995 (the default), 10Y and 5Y buttons. The vertical scale fits whatever range is visible.
- **Zoom**: drag across a span to zoom into it; double-click to go back to the full history.
- **Transitions**: changing the range or zooming animates the view over 280ms (`DURATION` in `index.html`), with gridlines and labels fading between scales. With the system's reduced-motion setting on, it switches instantly with a short fade.
- **Performance**: the full series is drawn once and only the visible window (the SVG `viewBox`) changes. Gridlines and labels are reused across frames and positioned with transforms, and hover updates run at most once per frame.

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
2. **Banco Central do Brasil SGS** (fallback). The Central Bank republishes the IBGE numbers but only has `monthly` and `twelveMonths`, so `ytd` and `index` are `null` when this source is used:
   `https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json`
   `https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados?formato=json`

Both APIs are public and need no key. Comparing them month by month showed identical `monthly` and `twelveMonths` values for every month from 1980-01 to 2026-08. SIDRA marks months with no data as `"..."`; those are skipped.

### Caching

- If `data/ipca.json` is less than 24 hours old, it's served as is.
- Otherwise the server fetches from IBGE, falls back to the Central Bank if IBGE fails, and rewrites the cache.
- If both APIs fail, the last saved data is served regardless of age.

Delete `data/ipca.json` to force a refresh.

## Notes

The 1980s to 1994 hyperinflation (up to about 82% in a single month in 1990) dominates the vertical scale on the full history, which makes the post-Plano Real years look nearly flat. That's why the chart opens on "Since 1995", and why the ranges and zoom rescale vertically. A logarithmic scale was tried and dropped.

## Other related data (not fetched yet)

- **IPCA-15**: a preview of IPCA, using prices collected from mid-month to mid-month and released about two weeks before the official number. SIDRA table 7062 and Central Bank SGS series 7478.
- **Market forecasts**: the Central Bank's weekly Focus survey publishes expected future IPCA through its own API (Olinda, `olinda.bcb.gov.br`).
- **Breakdowns by city and spending category**: SIDRA table 7060, from 2020 onward.
