# marketsim design decisions

Educational stock market simulator. Players live through the markets from January 1980 to
today, one month at a time, all synchronized to a shared clock advanced by a game master.

## Game rules

- **Clock.** One game = one shared timeline. The game master advances time one month at a
  time. Every player in the game sees the same month.
- **Portfolio.** At most five positions plus cash. Players may freely rebalance at the current
  month's price at any time during a month. No order queue, no spread or commission for now.
- **Assets.** Cash (USD, interest-free), US Treasury 1-, 5- and 10-year bonds, gold, and a
  curated list of stocks, all quoted in USD.
- **Income is paid out, never reinvested.** Bond coupons and stock dividends are credited to
  cash every month so players can watch income accumulate. Cash itself earns nothing.
- **Scoring.** Nominal portfolio value. No inflation adjustment (the ranking is the same).
- **No lookahead.** The server only serves data up to the game's current month. Clients never
  receive the full dataset.

## Corporate events

- **Acquisition:** the position is converted to cash at the acquisition price.
- **Delisting (still a going concern):** the position is sold automatically at the last price.
- **Wind-down / bankruptcy:** the position goes to zero.
- **Merger:** the position is converted into shares of the successor at the merger ratio
  (Sandoz and Ciba-Geigy into Novartis, Credit Suisse into UBS).
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

Hindsight is unavoidable, so winners are paired with names that looked as good at the time:
Intel against Microsoft and Cisco, eBay against Amazon, Schlumberger for the 1980 oil peak.
The leaderboard should show the S&P 500 total return as a benchmark.
- **Autos:** Tesla (2010), Mercedes-Benz and BMW (Yahoo from late 1996; earlier Daimler-Benz
  history to be curated, decision pending).
- **Dot-com boom and bust:** JDS Uniphase, Priceline as survivors that lost over 90 percent;
  Pets.com, WorldCom as failures.
- **International:** Sony, Unilever, Siemens (1996), Nokia (1994).
- **Mining:** Glencore (from 2011), Xstrata before the 2013 merger.
- **Swiss:** Nestlé, Novartis with Sandoz and Ciba-Geigy before 1996, UBS as the continuation
  of Bankgesellschaft with Bankverein separately until the 1998 merger, Credit Suisse, Swissair.
- **Japanese bubble:** Industrial Bank of Japan (merged into Mizuho in 2000).
- **Other failures:** Enron, Lehman Brothers.

Everything not on Yahoo Finance (delisted companies, Swiss stocks before the 1990s, Japanese
banks before 1999) is hand-curated in `data/manual/`.

## Data model

See `data/README.md`. Every asset is a monthly series of `price` (value of one unit at month
end) and `income` (cash paid per unit held during the month). Bonds are constant-maturity par
bonds rolled monthly.

## Stack

TypeScript end to end. Svelte (SvelteKit) frontend, Node server, Postgres on Railway.
Data pipeline is a separate workspace (`data/`) that produces static JSON.
