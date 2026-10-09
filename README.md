# IPCA

A minimal website that charts Brazil's historical IPCA (monthly inflation, % change) from January 1980 to the latest release, next to the Selic rate accumulated in each month from August 1986. The gap between the two lines is the real interest rate.

No dependencies and no build step: a small Node server and a static page using native ES modules.

## Structure

| Path | Role |
|---|---|
| `server.js` | Serves `public/`, `/api/ipca`, `/api/selic` and `/api/selic-target` |
| `ipca.js`, `selic.js`, `selic-target.js` | Fetch each index (shared by the server and `update.js`) |
| `http.js`, `cache.js` | JSON fetching with retries, and reading/writing `data/` |
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

The files in `data/` are cached locally and refreshed daily by a GitHub Actions workflow (`npm run update`). Delete one to force a refresh.

### Sources

Both are public and need no key.

1. **IBGE SIDRA** (main), table 1737, which has all four fields:
   `https://apisidra.ibge.gov.br/values/t/1737/n1/all/v/63,69,2265,2266/p/all`
2. **Banco Central do Brasil SGS** (fallback), series 433 (`monthly`) and 13522 (`twelveMonths`). It has no `ytd` or `index`:
   `https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json`
   `https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados?formato=json`

A month-by-month comparison showed both sources give identical values.

### Selic

`data/selic.json` has one row per month from August 1986, with:

| Field | Meaning |
|---|---|
| `monthly` | % accumulated in the month |
| `ytd` | % accumulated in the year (`null` for 1986, which starts in August) |
| `twelveMonths` | % accumulated over the last 12 months |
| `annualized` | The month's rate annualized, 252 business days |

The source is **Banco Central do Brasil SGS**, series 4390 (`monthly`) and 4189 (`annualized`). `ytd` and `twelveMonths` are compounded from `monthly`, matching IPCA's fields so the two can be compared. SGS also lists the month in progress, accumulated so far; it's left out until the month ends.

### Selic target (Meta Selic)

`data/selic-target.json` has one row per month from March 1999, with:

| Field | Meaning |
|---|---|
| `target` | The Copom target in effect on the last day of the month, % per year |
| `monthly` | The same rate as a monthly equivalent, `(1 + target)^(1/12) - 1`, so it shares the chart's scale |

The source is **Banco Central do Brasil SGS**, series 432. It's a daily series, which SGS limits to 10 years per request, so it's fetched in 10-year chunks. The chart draws it as dashed steps, since it only changes at Copom meetings.

## Notes

The 1980–1994 hyperinflation (up to about 82% in a single month in 1990) dominates the vertical scale on the full history and flattens the post-Plano Real years. That's why the chart opens on 1995 and rescales vertically when zooming. A logarithmic scale was tried and dropped.

## Related data (not fetched yet)

- **IPCA-15**: a mid-month preview of IPCA. SIDRA table 7062, SGS series 7478.
- **Market forecasts**: the Central Bank's weekly Focus survey (`olinda.bcb.gov.br`).
- **Breakdowns by city and category**: SIDRA table 7060, from 2020 onward.
