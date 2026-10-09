# IPCA e Selic

A minimal website that charts Brazil's monthly IPCA (inflation) from January 1980, the Selic rate accumulated each month from August 1986, and the Copom Selic target from March 1999. The gap between IPCA and Selic is the real interest rate.

No dependencies and no build step: a small Node server and a static page using native ES modules. The UI is in Portuguese.

## Features

- Zoom and pan (mouse, trackpad, touch); drag mode toggles between select and pan (`H`)
- Preset ranges: all history, Plano Real onward, 10 years, 5 years
- Toggle series from the legend; light/dark theme (`M`)
- Presidents and historical events along the chart (`I`), with notes in the tooltip

## Structure

| Path | Role |
|---|---|
| `server.js` | Serves `public/`, `/api/ipca`, `/api/selic`, `/api/selic-target` |
| `ipca.js`, `selic.js`, `selic-target.js` | Fetch each index (shared by the server and `update.js`) |
| `http.js`, `cache.js` | JSON fetching with retries, and reading/writing `data/` |
| `update.js` | Refresh all three caches (used by GitHub Actions) |
| `netlify.toml` | Static deploy: copy `data/` into `public/` and rewrite `/api/*` |
| `public/index.html` | Page markup |
| `public/css/` | `base`, `chart`, `controls`, `tooltip` |
| `public/js/main.js` | Entry: load data and start the chart |
| `public/js/state.js` | State shared between modules |
| `public/js/render.js` | Animation loop, canvas drawing, zoom and pan |
| `public/js/scale.js` | Month/value to pixel conversion, fitted windows |
| `public/js/ticks.js` | Axis ticks for the current zoom |
| `public/js/hover.js` | Crosshair and tooltip |
| `public/js/input.js` | Mouse, wheel, trackpad and touch |
| `public/js/ranges.js` | Preset ranges and the remembered view |
| `public/js/theme.js` | Light/dark toggle |
| `public/js/constants.js` | Lines, events, elections, governments |
| `public/js/motion.js`, `dom.js` | Easing and element lookups |
| `docs/` | Notes on charting libraries and other index data sources |

## Run

Requires Node 18+.

```bash
npm start
```

Open http://localhost:3000. Set `PORT` to use a different port.

For a static deploy (e.g. Netlify), `npm run update` is not required at build time: the committed files in `data/` are copied into `public/data` and served via redirects at `/api/*`.

## Data

The files in `data/` are cached locally and refreshed daily by a GitHub Actions workflow (`npm run update`). Delete one to force a refresh. Both IBGE and BCB sources are public and need no key.

### IPCA

IPCA is published monthly. Each month in `data/ipca.json` has:

| Field | Meaning |
|---|---|
| `monthly` | % change over the previous month |
| `ytd` | % change accumulated in the year |
| `twelveMonths` | % change accumulated over the last 12 months |
| `index` | Index number, December 1993 = 100 |

Missing values are `null`. The annual inflation for a year is its December `ytd`.

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

The source is **Banco Central do Brasil SGS**, series 432. It's a daily series, which SGS limits to 10 years per request; it's fetched in 5-year chunks. The chart draws it as dashed steps, since it only changes at Copom meetings.

## Notes

The 1980–1994 hyperinflation (up to about 82% in a single month in 1990) dominates the vertical scale on the full history and flattens the post-Plano Real years, so the chart rescales vertically when zooming. A logarithmic scale was tried and dropped.

Historical events (economic plans, crises, elections) and presidential terms are listed in `public/js/constants.js`. Events are marked along the bottom of the chart; governments appear as banners. The tooltip notes how each event moved the IPCA or the Selic.

## Related data (not fetched yet)

See `docs/index-data-sources.md` for codes and endpoints. Candidates include:

- **IPCA-15**: a mid-month preview of IPCA. SIDRA table 7062, SGS series 7478.
- **Market forecasts**: the Central Bank's weekly Focus survey (`olinda.bcb.gov.br`).
- **Breakdowns by city and category**: SIDRA table 7060, from 2020 onward.
