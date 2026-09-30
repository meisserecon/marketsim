# marketsim data pipeline

Produces one JSON file per asset in `out/`, all in the same shape (see `src/lib/asset.ts`):
one row per month with `price` (value of one unit at month end, USD) and `income`
(cash paid during the month per unit held, USD). Income is never reinvested; the game
credits it to the player's cash.

```
npm install
npm run data:fetch      # downloads sources into data/raw (committed)
npm run data:build      # writes data/out/*.json
npm run data:validate   # gap / sanity checks and a summary per series
```

## Assets and sources

| id | source | notes |
|----|--------|-------|
| cash | constant | interest-free by design |
| ust1y, ust5y, ust10y | FRED DGS1 / DGS5 / DGS10, last daily observation of each month | constant-maturity par bond rolled monthly, see `src/lib/bonds.ts`; coupon paid as income |
| gold | datahub.io/core/gold-prices (LBMA via Bundesbank) | monthly *average*, not month-end. FRED removed its LBMA series in 2022 |
| stocks | Yahoo Finance chart API (daily, reduced to month end at fetch time) or `manual/<id>.csv` | split- and spin-off-adjusted close as price, dividends per share by ex-date month as income. Universe in `src/universe.ts` |
| FX | FRED DEXSZUS, DEXJPUS, last daily observation of each month | converts CHF and JPY listings to USD |

Stocks start the month their data starts and stop at the `end` event declared in the
universe. Gaps of up to two months in a source are filled with the previous price.
`src/probe.ts TICKER...` prints what Yahoo has for a ticker, useful when extending the universe.

## Bond model

The player holds a par bond of maturity T issued at last month's yield. Each month it is
repriced at the new yield with one month less to run, the accrued coupon is paid out, and
the position is rolled into a new par bond. `price` is therefore a clean-price index that
moves with rates; `income` is `previous yield / 12`. Adding both back gives a normal
constant-maturity total return, which is how the model was checked.
