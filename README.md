# IPCA

A minimal website that charts Brazil's historical IPCA (monthly inflation, % change) from January 1980 to the latest release.

No dependencies: a small Node server and one HTML page.

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
