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
- `index.html` fetches `/api/ipca` and draws the series as an SVG line. Hovering shows a gray crosshair snapped to the nearest month and a tooltip with its value.
- `data/ipca.json` is the local cache: `{ source, fetchedAt, series: [{ date: "YYYY-MM", value }] }`.

### Data sources

1. **IBGE SIDRA** (main): table 1737, variable 63 (IPCA monthly change). IBGE calculates and publishes IPCA, so it's the primary source.
   `https://apisidra.ibge.gov.br/values/t/1737/n1/all/v/63/p/all`
2. **Banco Central do Brasil SGS** (fallback): series 433, a republication of the IBGE numbers.
   `https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json`

Both APIs are public and need no key. A month-by-month comparison showed they return identical values for all 560 months (1980-01 to 2026-08). SIDRA also has a 1979-12 row with no value (`"..."`), which is skipped.

### Caching

- If `data/ipca.json` is less than 24 hours old, it's served as is.
- Otherwise the server fetches from IBGE, falls back to the Central Bank if IBGE fails, and rewrites the cache.
- If both APIs fail, the last saved data is served regardless of age.

Delete `data/ipca.json` to force a refresh.

## Notes

The 1980s to 1994 hyperinflation (up to about 82% in a single month in 1990) dominates the vertical scale, so the post-Plano Real years look nearly flat.
