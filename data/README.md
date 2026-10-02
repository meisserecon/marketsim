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
| ust1985, ust1990, ... | Federal Reserve fitted zero-coupon yield curve (Gürkaynak, Sack and Wright), last observation of each month, reduced at fetch time to `raw/fed/gsw_monthly.csv` | zero-coupon bond repaying 100 on 1 January of the named year, see `src/lib/bonds.ts`; no income |
| gold | datahub.io/core/gold-prices (LBMA via Bundesbank) | monthly *average*, not month-end. FRED removed its LBMA series in 2022 |
| stocks | Yahoo Finance chart API (daily, reduced to month end at fetch time) or `manual/<id>.csv` | split- and spin-off-adjusted close as price, dividends per share by ex-date month as income. Universe in `src/universe.ts` |
| FX | FRED DEXSZUS, DEXJPUS, last daily observation of each month | converts CHF and JPY listings to USD |

Stocks start the month their data starts and stop at the `end` event declared in the
universe. Gaps of up to two months in a source are filled with the previous price.
Spin-offs are always folded into the parent's price. Yahoo does that itself for most (PayPal,
Kyndryl, Alcon) but books some as a one-off dividend (Altria's Kraft and Philip Morris
International, Citigroup's Travelers). Those are declared under `spinoffs` in the universe and
folded in by the build; the validator fails on any undeclared distribution above 15 percent of
the price.

`src/probe.ts TICKER...` prints what Yahoo has for a ticker, useful when extending the universe.

## Bond model

Each bond repays 100 on 1 January of its maturity year and pays nothing before. Its price is
100 discounted at the continuously compounded zero-coupon yield for the time left, computed
from the Svensson parameters of the Fed's daily curve. The formula reproduces the yields the
Fed publishes to within 0.0003 percentage points. `extra.yield` is the yearly return from
holding to maturity and `extra.years` the time left. In its last month (December before the
maturity year) the price is 100, and the bond ends with a `maturity` event.

Three bonds exist at any time (5, 10 and 20 years at most), with maturities every five years;
`bondSchedule` generates them. The curve is fitted only up to 15 years before mid-1981, so
the 2000 bond's first eighteen months extrapolate it; the result is 10.17 percent
at the start against 10.16 for FRED's 20-year constant-maturity yield, and up to 0.7 points
below it in mid-1981 (part of that gap is the difference between a zero and a par yield). The two shorter initial
bonds have history from 1975, the 2000 bond starts with the game.
