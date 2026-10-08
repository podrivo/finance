# Index data sources

Public APIs for the main Brazilian financial indexes, beyond the IPCA already fetched by `ipca.js`. All codes below were checked against the live APIs in October 2026.

## Central Bank SGS

Almost every index is available on the Central Bank's SGS API, which `ipca.js` already uses for series 433 and 13522. Adding one of these is a matter of adding its series code.

```
https://api.bcb.gov.br/dados/serie/bcdata.sgs.{code}/dados?formato=json&dataInicial=dd/mm/yyyy&dataFinal=dd/mm/yyyy
```

- Monthly series return their full history in one request.
- Daily series accept at most a 10-year window per request, so they must be fetched in chunks.
- `/dados/ultimos/{n}?formato=json` returns the latest `n` values.
- Values are strings with a dot as decimal separator; dates are `dd/mm/yyyy`.

### Interest rates

| Index | Code | Frequency | Starts |
|---|---|---|---|
| Selic, daily rate | 11 | daily | 1986 |
| Selic target (Copom) | 432 | per decision | 1999 |
| Selic, annualized (252 days) | 1178 | daily | 1986 |
| Selic, accumulated in the month | 4390 | monthly | 1986 |
| CDI, daily rate | 12 | daily | 1986 |
| CDI, annualized (252 days) | 4389 | daily | 1986 |
| CDI, accumulated in the month | 4391 | monthly | 1986 |
| TR | 226 | daily | 1991 |
| Savings yield (poupança) | 195 | daily | 1990s |
| TJLP | 256 | quarterly | 1994 |
| TLP | 27572 | monthly | 2018 |

### Inflation

| Index | Code | Starts |
|---|---|---|
| IPCA | 433 | 1980 |
| IPCA, 12 months | 13522 | 1980 |
| IPCA-15 | 7478 | 2000 |
| IPCA-E | 10764 | 1992 |
| INPC | 188 | 1979 |
| IGP-M | 189 | 1989 |
| IGP-DI | 190 | 1944 |
| IGP-10 | 7447 | 1994 |
| IPC-Fipe | 193 | 1939 |

All monthly. FGV, which publishes the IGP indexes, has no free API; SGS republishes them.

IBGE's SIDRA API is the primary source for IBGE indexes: table 1737 for IPCA (already used) and table 3065 for IPCA-15.

### Currency and activity

| Index | Code | Frequency |
|---|---|---|
| US dollar, PTAX selling | 1 | daily |
| US dollar, PTAX buying | 10813 | daily |
| Euro, selling | 21619 | daily |
| IBC-Br | 24363 (seasonally adjusted: 24364) | monthly |
| Nominal GDP | 4380 | monthly |

## Ibovespa and other B3 indexes

SGS series 7 (Ibovespa) stopped in September 2019. Working alternatives:

- **Yahoo Finance**: `https://query1.finance.yahoo.com/v8/finance/chart/%5EBVSP?range=max&interval=1d`. Daily from 1993, no key. Unofficial, and requires a browser `User-Agent` header.
- **B3**: `https://sistemaswebb3-listados.b3.com.br/indexStatisticsProxy/IndexCall/GetPortfolioDay/{base64}`, where `{base64}` encodes `{"index":"IBOV","language":"pt-br","year":"2026"}`. Returns one year of daily closes per call, with Brazilian number formatting (`160.538,69`). Unofficial. Other B3 indexes (IFIX, SMLL, IDIV) should work by changing `index`.

## Not easily automated

- **ANBIMA** bond indexes (IMA-B, IMA-S, IRF-M, IDkA): official API, but requires registration and OAuth credentials.
- **Ipeadata** (`https://www.ipeadata.gov.br/api/odata4`): aggregates many series, Ibovespa included, but did not respond when tested.

## Next steps

Selic, CDI, IGP-M and INPC fit the existing SGS fetch in `ipca.js` with no new client code. Ibovespa is the only one that needs a new source.
