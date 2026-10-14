# Adding a company

What a new company needs before it can be traded in the game, in the order in which to get it.
The first step decides whether the rest is worth starting: without sourced prices there is no
company.

## 1. Prices: one close per month, from a source

The game needs the closing price of the last trading day of every month the company is listed,
from its first month to its last, in one currency and on one share basis.

- **A living company:** give its Yahoo ticker in `src/universe.ts` (`source: "yahoo"`).
  `npm run data:fetch` downloads the monthly history, already adjusted for splits.
- **A company that is gone** (taken over, bankrupt, delisted): Yahoo drops it. The prices then
  go into `manual/<id>.csv` (`source: "manual"`), see `manual/README.md` for the format.
  - Put the source at the top of the file: the address, the date retrieved, the exchange and
    ticker, and how the quoted prices were converted. Keep the raw download in `manual/raw/`.
  - State the share basis. All months must be on the same one, normally the final share count:
    a price quoted before a 2-for-1 split is halved. List every split with its date.
  - Cross-check against a second, independent source (the quarterly high and low in the
    company's 10-K, a newspaper table, an exchange yearbook) and say in the header what agreed.
  - Sources that have worked: companiesmarketcap.com (some delisted US companies, daily or
    monthly points embedded in the page), SEC filings on EDGAR for cross-checks, the scanned NZZ
    and Journal de Genève price tables for Swiss, German and New York blue chips before 1999. The NZZ
    scans in `manual/scans/nzz/` (month-end issues to November 2001) also carry a Nasdaq table and the
    larger New York shares; for later months the table page of an issue can be downloaded from the NZZ
    archive (zeitungsarchiv.nzz.ch, subscription) into `manual/scans/nzz-pages/`. Reading a table by eye
    is slow (an agent needs about an hour per fifty months) but it is a real source: note the issue,
    page and printed fraction of every month in `manual/raw/<id>-nzz.csv`.
  - Sources that do not work from this machine: Yahoo for delisted tickers, Stooq (bot check),
    BigCharts and Barchart (login), the price-by-date sites (no data for delisted tickers).
- **Never estimate a price.** A month without a sourced close stays empty; the build fills gaps
  of up to two months with the previous price and fails on longer ones. If the history cannot be
  sourced, the company is not added. Record what was tried in `manual/FEASIBILITY.md`.

## 2. Dividends

- Yahoo assets: dividends come with the prices. Check a few years against the company's own
  figures; fix single wrong payments with `dividendFixes`, and spin-offs that Yahoo books as a
  dividend with `spinoffs` (see the comments in `universe.ts`).
- Manual assets: the `income` column of `manual/<id>.csv`, per share, in the month paid, on the
  same share basis as the prices. Sources and working go into `manual/dividends/`.
- A company that never paid one (most young technology companies) has `income` 0 throughout;
  say so in the file header, with the source of that statement.
- An estimate is allowed only where the curator has approved it, and is marked `ESTIMATE` in
  the dividends file.

## 3. The entry in `src/universe.ts`

- `id`: short, lower case, never changes (it is in saved games and in the news).
- `name`: what the company was called in its first month. Every later name goes into
  `renames` with its month. Names must not leak the future.
- `currency`, and `ticker` for Yahoo.
- `start`: drop source rows before this month, when the source back-fills a predecessor.
- `listed`: the first month the share can be traded when that is later than its data (earlier
  months remain as chart history). Use it to bring a company in at a quiet moment.
- `end`: the last month and what happens to the holder.
  - `bankruptcy`: the position becomes worthless.
  - `delisting`: the position is sold at the last price.
  - `acquisition`: holders are paid out in cash at the last price. Use this also when the
    buyer is not in the game, even if it paid in shares.
  - `merger` with `successor`: the position converts into another asset of the game at both
    assets' last prices, so no share ratio is needed; name the ratio in the note anyway.
  - One company per story. A chain of takeovers is followed only as far as its companies are
    worth having in the game; where the chain leaves the game, cash out.
- `note`: for maintainers, never shown.

## 4. Profile and logo

- `src/profiles.ts`: country, sector, and one version of tagline and description for each
  period in which the company was a different thing, each written as it could have been at the
  time. The first version is what a player reads when the share appears.
- Logos: `web/static/logos/<id>/<year>.png` or `.svg`, one per look, with the entry in
  `data/logos.json` (`from` month and file). The source of each logo goes into the manifest.

## 5. The story: an arc with beats

In `news/arcs/` (format in its `README.md`):

- `<id>.md`: the story of the company with hindsight, for maintainers, with sources.
- `<id>.beats.json`: the dated beats that become news. At least:
  - the **listing beat** in the first tradable month: what the company is and why someone might
    buy it now. It is the first beat of that month in the file.
  - the **exit beat** in the last month or the one after: what happened and what holders get.
  - a beat for every month in which the share moved 20 percent or more against the market
    (`npm run movers -w data` lists them in `news/arcs/movers.md`).
  - enough beats in between to carry the story: one every year or two.
- Every beat: only what was public by the end of its month, a source read in this session with
  its date, and the ids of all companies it concerns as `assets`.
- If the company belongs to a storyline (`thread`), tag its beats and add them to
  `news/threads/<thread>.md`. Stories that already exist in other arcs and concern the new
  company get its id added to `assets`, so that they show up on its page.
- `<id>.images.json` and `web/static/news/<id>/`: one picture per beat, with source, credit and
  licence. No two stories share a picture.

## 6. Build and check

```
npm run data:fetch            # Yahoo assets only
npm run data:build            # writes data/out/<id>.json
npm run data:validate
npm run movers -w data
node data/news/arcs/check-beats.mjs
node data/news/arcs/check-images.mjs
npm run data:news
npm test && npm run typecheck
```

Then look at the company in a running game: its chart from the first month, the listing story,
the months with the largest moves, and the exit.

A new company appears in every game, also in games already under way, from its first tradable
month on. A game that is already past that month simply finds it in the market.
