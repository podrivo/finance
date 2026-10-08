# IPCA

A minimal website that charts Brazil's historical IPCA (monthly inflation, % change) from January 1980 to the latest release.

No dependencies and no build step: a small Node server and a static page using native ES modules.

## Structure

| Path | Role |
|---|---|
| `server.js` | Serves `public/` and `/api/ipca` |
| `ipca.js` | Fetches and caches the data (shared by the server and `update.js`) |
| `public/index.html` | Page markup |
| `public/css/` | `base` (colors, theme), `chart`, `controls`, `tooltip` |
| `public/js/main.js` | Entry point: loads the data and starts everything |
| `public/js/state.js` | State shared between modules |
| `public/js/render.js` | Animation loop, canvas drawing, zoom and pan |
| `public/js/scale.js` | Month/value to pixel conversion, fitted windows, curve slopes |
| `public/js/ticks.js` | Axis ticks for the current zoom |
| `public/js/hover.js` | Crosshair and tooltip |
| `public/js/input.js` | Mouse, wheel, trackpad and touch handling |
| `public/js/ranges.js` | Preset ranges and the remembered view |
| `public/js/theme.js` | Light/dark toggle |
| `public/js/constants.js`, `motion.js`, `dom.js` | Constants, easing, element lookups |

## Run

Requires Node 18+.

```bash
npm start
```

Open http://localhost:3000. Set `PORT` to use a different port.

## Data

IPCA is published monthly. Each month in `data/ipca.json` has:

| Field | Meaning |
|---|---|
| `monthly` | % change over the previous month |
| `ytd` | % change accumulated in the year |
| `twelveMonths` | % change accumulated over the last 12 months |
| `index` | Index number, December 1993 = 100 |

Missing values are `null`. The annual inflation for a year is its December `ytd`.

The file is cached locally and refreshed daily by a GitHub Actions workflow (`npm run update`). Delete it to force a refresh.

### Sources

Both are public and need no key.

1. **IBGE SIDRA** (main), table 1737, which has all four fields:
   `https://apisidra.ibge.gov.br/values/t/1737/n1/all/v/63,69,2265,2266/p/all`
2. **Banco Central do Brasil SGS** (fallback), series 433 (`monthly`) and 13522 (`twelveMonths`). It has no `ytd` or `index`:
   `https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json`
   `https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados?formato=json`

A month-by-month comparison showed both sources give identical values.

## Notes

The 1980–1994 hyperinflation (up to about 82% in a single month in 1990) dominates the vertical scale on the full history and flattens the post-Plano Real years. That's why the chart opens on 1995 and rescales vertically when zooming. A logarithmic scale was tried and dropped.

## Related data (not fetched yet)

- **IPCA-15**: a mid-month preview of IPCA. SIDRA table 7062, SGS series 7478.
- **Market forecasts**: the Central Bank's weekly Focus survey (`olinda.bcb.gov.br`).
- **Breakdowns by city and category**: SIDRA table 7060, from 2020 onward.
