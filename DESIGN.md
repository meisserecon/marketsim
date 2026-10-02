# marketsim design decisions

Educational stock market simulator. Players live through the markets from January 1980 to
today, one month at a time, all synchronized to a shared clock advanced by a game master.

## Game rules

- **Clock.** One game = one shared timeline. The game master advances time one month at a
  time. Every player in the game sees the same month.
- **Starting cash.** Every player starts with 1,000 USD. This is fixed, not a game setting.
- **Creating games.** Players can only join. Games are created on `/create`, which is not linked
  from anywhere and asks for a password when the server has `CREATE_PASSWORD` set.
- **Portfolio.** At most five positions plus cash. Players may freely rebalance at the current
  month's price at any time during a month. No order queue, no spread or commission for now.
- **Assets.** Cash (USD, interest-free), three US Treasury bonds, gold, and a curated list of
  stocks, all quoted in USD.
- **Bonds.** Zero-coupon Treasuries named by the year they are repaid: "US Treasury 2000" pays
  100 on 1 January 2000 and nothing before. "Pay 13 today, get 100 in 2000." Three are on
  offer at any time, one maturing within 5 years, one within 10 and one within 20, with
  maturities every five years: 1985, 1990 and 2000 at the start; when a bond is repaid, the
  longest maturity that restores the rule is listed (1995 in 1985, 2010 in 1990, 2005 in 1995,
  and so on). A bond that has not matured when the game ends is valued at its last price. Such
  bonds were not sold to the public in 1980; the prices are what they would have cost given
  the yield curve of the day.
- **Income is paid out, never reinvested.** Stock dividends are credited to cash in the month
  they are paid, so players can watch income accumulate. Bonds pay nothing until they are
  repaid. Cash itself earns nothing.
- **Scoring.** Nominal portfolio value. No inflation adjustment (the ranking is the same).
- **No lookahead.** The server only serves data up to the game's current month. Clients never
  receive the full dataset.

## Corporate events

- **Acquisition:** the position is converted to cash at the acquisition price.
- **Delisting (still a going concern):** the position is sold automatically at the last price.
- **Wind-down / bankruptcy:** the position goes to zero.
- **Merger:** the position is converted into shares of the successor at the merger ratio
  (Sandoz into Novartis, Bankverein and Credit Suisse into UBS).
- **Spin-offs** are folded into the parent's price history, as Yahoo Finance does. The player
  implicitly keeps the spun-off value in the parent position.

## Stock universe

Defined in `data/src/universe.ts`. Guiding ideas: a few full-period blue chips, the companies
that defined each era, a Swiss angle, the Japanese bubble, and enough failures to make
survivorship bias visible. Assets appear in the game the month their data starts and vanish
on their corporate end event.

- **US, full period:** IBM, GE, Exxon, Schlumberger, Coca-Cola, Walmart, Boeing, Altria,
  Citigroup, McDonald's, Disney, Intel.
- **US, later arrivals:** Apple (1980-12), Microsoft (1986), Cisco (1990), Amazon (1997),
  eBay (1998), Nvidia (1999).
- **Autos:** Tesla (2010), Mercedes-Benz and BMW (Yahoo from late 1996; earlier Daimler-Benz
  history to be curated, decision pending).
- **Dot-com boom and bust:** JDS Uniphase, Priceline as survivors that lost over 90 percent;
  Pets.com, WorldCom as failures.
- **International:** Sony, Siemens (1996), Nokia (1994).
- **Mining:** Glencore (from 2011), Xstrata before the 2013 merger.
- **Swiss:** Nestlé, Novartis with Sandoz before 1996, UBS as the continuation of
  Bankgesellschaft with Bankverein separately until the 1998 merger, Credit Suisse.
  Ciba-Geigy and Swissair were dropped for simplicity; their month-end prices are read and
  kept in `data/manual/raw/` should they be wanted again.
- **Japanese bubble:** Industrial Bank of Japan (merged into Mizuho in 2000).
- **Other failures:** Enron, Lehman Brothers.

Hindsight is unavoidable, so winners are paired with names that looked as good at the time:
Intel against Microsoft and Cisco, eBay against Amazon, Schlumberger for the 1980 oil peak.
The leaderboard should show the S&P 500 total return as a benchmark.

Everything not on Yahoo Finance (delisted companies, Swiss stocks before the 1990s, Japanese
banks before 1999) is hand-curated in `data/manual/`.

## Data model

See `data/README.md`. Every asset is a monthly series of `price` (value of one unit at month
end) and `income` (cash paid per unit held during the month). Bonds are fixed-maturity zeros
priced off the Federal Reserve's fitted Treasury yield curve.

## Stack

TypeScript end to end. Svelte (SvelteKit) frontend, Node server, Postgres on Railway.
Data pipeline is a separate workspace (`data/`) that produces static JSON.

## Contracts

Three interfaces hold the parts together. All live in code, in the `shared` workspace, so
server, client and data pipeline compile against the same definitions.

- **Asset data** (`shared/src/asset.ts`): what the data pipeline writes to `data/out` and the
  engine reads. One row per month with `price` and `income`, plus an optional end event.
- **Game engine** (`shared/src/engine.ts`): the rules as pure functions, covered by
  `shared/test`. `applyTrade` executes a trade at the month's price; `advanceMonth` winds up
  ended assets and pays income into cash. A game starts in the base month 1979-12, where
  players build their first portfolio, and runs to the last month all living assets have data.
  The data itself reaches back to January 1975 where sources allow, so charts and trailing
  figures have history from the first day.
- **HTTP API** (`shared/src/api.ts`): routes and payload types between server and client.
  Live updates go out as Server-Sent Events.

The database schema is in `server/db/schema.sql`. Market data stays in JSON files loaded into
memory; Postgres only holds games, players, holdings, the ledger and month-end snapshots.

Rules the engine fixes that were previously open:

- Cash is not one of the five positions. It is the sixth, always present.
- Fractional units are allowed, so players can invest a USD amount.
- A merger converts the position into the successor at both assets' final-month prices, which
  preserves value and avoids share ratios. Sandoz becomes Novartis, Bankverein
  and Credit Suisse become UBS, Xstrata becomes Glencore. Industrial Bank of Japan is paid out
  in cash because Mizuho is not in the game.
- An asset is invisible before its first month and untradable after its last.

No lookahead applies to names too. Each asset carries the name it had when its series starts
plus a list of renames (Uniphase, then JDS Uniphase, then Viavi Solutions), and the server
resolves the name for the current month with `nameAt`. Notes, sources and end events are for
maintainers and are never sent to players before the event has happened.

## Running locally

```
npm install
npm test            # engine and server tests
npm run dev         # API on http://localhost:3000, restarts on change
```

Without `DATABASE_URL` the server uses an embedded Postgres in memory, so no database setup
is needed for development; set `PGLITE_DIR` to keep games across restarts. With `DATABASE_URL`
it connects to a real Postgres (Railway) and creates the tables on first start. Set
`CREATE_PASSWORD` on any public deployment so that only the host can create games. The server
serves the built web client from `web/build` when it exists. Market data is read from
`data/out` at startup; rebuild it with `npm run data:build`.

## Data sourcing decisions

- **Swiss share classes.** Before the Swiss companies unified their shares, the bearer share
  (Inhaberaktie) is used, because it is what a foreign investor could buy. Registered shares
  were closed to foreigners and traded at roughly half the price until Nestlé opened its
  register on 17 November 1988. Yahoo's series continue the registered line, so the bearer
  series is carried up to each company's unification and Yahoo is used from there.
- **Swiss history 1980 to 1998** is read from full issues of the NZZ (first issue after each
  month end), downloaded through the user's subscription and kept outside git in
  `data/manual/scans/`. Raw readings go to `data/manual/raw/` unadjusted; the series files
  apply documented splits. Nestlé and Novartis are read alongside as controls against Yahoo.
- **German history before late 1996** comes from online chart sources (boerse.de, onvista),
  rebased to Yahoo's series and cross-checked against printed NZZ quotes where available.
- **Japan** is represented by Industrial Bank of Japan, from the NZZ's Tokyo list.
- **News library:** scope and format are still to be decided.
