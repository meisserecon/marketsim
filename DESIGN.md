# Month by Month

The game's name. The repository and the packages are still called marketsim.

## marketsim design decisions

Educational stock market simulator. Players live through the markets from January 1980 to
today, one month at a time, all synchronized to a shared clock advanced by a game master.

## Game rules

- **Clock.** One game = one shared timeline. The game master advances time one month at a
  time. Every player in the game sees the same month.
- **Starting cash.** Every player starts with 1,000 USD. This is fixed, not a game setting.
- **Creating games.** Players can only join. Games are created on `/create`, which is not linked
  from anywhere and asks for a password: `CREATE_PASSWORD` on the server, or `password` when that is not set.
- **Ages.** The game is told in six ages (`shared/src/ages.ts`): The Cold War (to January 1990), The Peace
  Dividend (to July 1995), The New Economy (to December 2002), Safe as Houses (to March 2009), Free Money (to
  October 2022) and The Age of AI. When the clock enters a new age, players and the game master see a screen
  that looks back at the age that ended (its story, the stock market index and every player on one chart, all
  rebased to the start of the age, and the best and worst assets) and then sets the scene for the new one. The
  intro of an age knows nothing of what is coming; the look back is only shown once the age is over. The age's
  name stays in the header and reopens the screen. The index (S&P 500, a reference series, not an asset) is also
  the dashed benchmark line on the leaderboard chart.
- **Welcome screen.** On first entering a game a player sees what the game is, how a month works, and the three
  lessons it wants to teach, stated openly: diversify, stay in the market, know your history.
- **Playing alone.** A single-player game is started on `/single`, which is not linked from anywhere and asks for the same password as `/create` (`POST /api/solo`): it is
  created and joined in one step, nobody else can join, and the player's own token advances the clock
  with a button in the player view.
- **Starting with a later age.** A game normally begins in December 1979. On `/create` and `/single` it can
  instead begin with any later age: it then starts in that age's first month, with the same starting cash.
- **Highscores.** `/highscores` has one board for the whole game and one for each age. "Overall" ranks the
  portfolio value at the end of games played the whole distance from the first month. An age's board ranks
  the gain during that age, the value in its last month against the value in its first, of everybody who
  played it through; so a game that begins with a later age competes on equal terms with one that came all
  the way, and each board also shows what the stock market gained. A game appears once it has moved past
  the board's last month. It reads the month-end snapshots, so it needs a database that persists
  (`DATABASE_URL` or `PGLITE_DIR`).
- **Admin.** `/admin`, not linked from anywhere, lists every game on the server and deletes one with its
  players and their highscores. It asks for `ADMIN_PASSWORD`, or the password of `/create` when that is not set.
- **Seats and rejoining.** Joining returns a token that the browser keeps in localStorage, so
  reopening `/g/CODE` there returns to the same seat. There are no passwords. To come back from
  another device or after clearing site data, the address bar itself is the personal link: the
  player page is always shown as `/g/CODE#key=<token>` and the game master page as
  `/g/CODE/gm#key=<token>`, to be copied or bookmarked. The token sits in the fragment on
  purpose: it is never sent to the server and stays out of logs. A link that is opened wins
  over a token already held; a token the server rejects is dropped (falling back to the seat
  the browser had before, if any) and the visitor sees the join form. Anyone holding the link
  can act as that player, so the address should not be shared or shown on a projector.
- **Portfolio.** Any number of positions plus cash (an earlier limit of five was dropped). Players may freely rebalance at the current
  month's price at any time during a month. No order queue, no spread or commission for now.
- **Trading in steps.** Players do not type amounts. Every Buy or Sell moves one step, 5% of the portfolio's
  current value: Buy invests a step or all remaining cash, whichever is less; Sell sells a step or the whole
  position, whichever is less. The buttons sit on every market row, every holding and in the company panel,
  and are disabled when a trade is not possible (no cash). The API still
  accepts exact amounts.
- **Assets.** Cash (USD, interest-free), three US Treasury bonds, gold, and a curated list of
  stocks, all quoted in USD.
- **Bonds.** Zero-coupon Treasuries named by the year they are repaid: "US Treasury 2000" pays
  100 on 1 January 2000 and nothing before. "Pay 13 today, get 100 in 2000." Three are on
  offer at any time, one maturing within 5 years, one within 10 and one within 20, with
  maturities every five years: 1985, 1990 and 2000 at the start; when a bond is repaid, the
  longest maturity that restores the rule is listed (1995 in 1985, 2010 in 1990, 2005 in 1995,
  and so on). A bond that has not matured when the game ends is valued at its last price.
  (One exception: from December 1979 to September 1980 the 2000 bond is priced with the observed
  20-year Treasury yield, FRED DGS20, because the fitted curve does not reach that far yet and
  its extrapolation is wrong in those months; see `data/src/lib/bonds.ts`.) Such
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
  McDonald's, Disney, Intel, Berkshire Hathaway (class A share, from March 1980).
- **US, later arrivals:** Apple (1980-12), Microsoft (1986), Cisco (1990), Amazon (1997),
  eBay (1998), Citigroup (from its formation in October 1998), Nvidia (1999).
- **Autos:** Tesla (2010), Mercedes-Benz and BMW (Yahoo from late 1996; earlier Daimler-Benz
  history to be curated, decision pending).
- **Dot-com boom and bust:** Pets.com and WorldCom as failures; eBay and Amazon as survivors.
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

- Fractional units are allowed, so players can invest a USD amount.
- A merger converts the position into the successor at both assets' final-month prices, which
  preserves value and avoids share ratios. Sandoz becomes Novartis, Bankverein
  and Credit Suisse become UBS, Xstrata becomes Glencore. Industrial Bank of Japan is paid out
  in cash because Mizuho is not in the game.
- An asset is invisible before its first month and untradable after its last.

No lookahead applies to names too. Each asset carries the name it had when its series starts
plus a list of renames (Daimler-Benz, then DaimlerChrysler, then Daimler, then Mercedes-Benz
Group), and the server
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
- **Credit Suisse** is one series from 1979 to its takeover by UBS in June 2023: the NZZ bearer
  share (SKA, from 1989 CS Holding) until May 1995 and the registered share until October 2001 in
  CHF, then the NYSE ADR (companiesmarketcap.com) in USD; a manual series may carry a currency per
  row for this. Divisors for the 1989 exchange, the 1993 split, the 1995 single registered share,
  the 2001 split and the 2013 stock dividend are documented in `data/src/nzz.ts`. Rights issues are
  not adjusted, as in the other NZZ series. Dividends 1980 to 2023 in
  `data/manual/dividends/credit-suisse.csv`.
- **German history before late 1996** comes from online chart sources (boerse.de, onvista),
  rebased to Yahoo's series and cross-checked against printed NZZ quotes where available.
- **Japan** is represented by Industrial Bank of Japan, from the NZZ's Tokyo list.
- **Postponed listings.** To ease players into the game, some companies that existed in 1979 are
  listed later: Daimler-Benz and BMW in March 1981, and the three Swiss banks (Bankgesellschaft,
  Bankverein, Kreditanstalt) in March 1982 (`listed` in `data/src/universe.ts`). The story is
  that the stock only became available to the players then; its earlier prices are kept and shown
  as chart history from the listing month on, but it cannot be traded before.
- **Dividend gaps.** Every amount in `data/manual/dividends/` comes from a source cited next to it,
  with one exception: where a company is known to have paid but no source for a year was found
  (BMW 1980 and 1987 to 1995, Siemens 1983, Industrial Bank of Japan before December 1992), the
  year carries the amount of the neighbouring sourced years, marked `ESTIMATE` in the row. A
  missing year would wrongly show no payment at all; an estimate is replaced when a source turns up.

## News

The news is the storytelling of the game and carries the fundamentals where they matter
("IBM reports record profits"), instead of a systematic fundamentals database. One file per
year in `data/news/<year>.json`, each a JSON array of items (`NewsItem` in
`shared/src/news.ts`): month, kind, headline, two to four sentences written as of the end of
that month, the companies concerned, a source for maintainers, and a slot for a picture.
Kinds: world (politics, economy, markets), company, colour (life of the time), listing and
delisting. About three to five items a month, more in big months. Every company entry, exit and
merger has its item; a company must have its story when it becomes tradable.

Rules: no lookahead (an item knows nothing after its month, and later names or fates never
leak into earlier items); nothing from memory alone, every fact cites a source. Items are
written by agents per period and reviewed for lookahead and dullness.

The server serves a month's items only once the game has reached it (`GET /news`), and the
asset history carries "the story so far": the company's items up to the current month. The
player view shows the month's news above the leaderboard; the game master page shows it large,
to be read to the room before anyone trades; the company panel shows the story so far.
`npm run data:validate` checks the files, the company ids against their listing months, and
that every listing and exit in a covered year has its item.

### Story arcs

The news is derived from story arcs in `data/news/arcs/` (format in its README): one per company
and one per market theme (rates and gold, oil, Iran and the Middle East, Asia, the technology
waves, Wall Street's booms and crashes, world politics, life of the time), 48 in all, written
with hindsight for the curators from sources cited per beat. `movers.md`, generated by
`npm run movers -w data` from the prices and the S&P 500 reference series, lists the moves every
arc must explain. Beats are curated on the review desk (`/review` under `npm run dev:web`),
which writes `lead` and `note` into the beats files and deletes the beats the curator does not want (there are no priorities and no hidden beats: every beat is shown); the monthly items are
then written from the kept beats, as of their month and with the price move in the headline where
a beat explains one. `node data/news/arcs/check-beats.mjs` checks the beats files.

## Company profiles

Every asset has a profile for players who do not know it: sector and country, a one-line pitch
in the voice of the company's boss at the time, and a sentence or two on what it sells. The
texts are in `data/src/profiles.ts`. Like names, profiles come in dated versions so that none
reveals the future: Apple in 1981 is the maker of the Apple II, and the iPhone appears in its
profile only from July 2007. A version may only say what was true and known when it starts and
must stay true until the next one. The server sends the version for the game's current month.
Each version can also carry a picture; the client shows it when present.

Logos have their own timeline, because a company redraws its logo on a different schedule than
its business changes. The files are in `web/static/logos/<id>/`, and `data/logos.json` lists
for each company the logos with the month each came into use and its source. The build copies
the list into the asset, and the server sends the logo of the game's current month, so players
watch the styles evolve and never see a logo before its time.

The market lists companies first, then gold, then bonds.
