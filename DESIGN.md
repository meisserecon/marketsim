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

## Data model

See `data/README.md`. Every asset is a monthly series of `price` (value of one unit at month
end) and `income` (cash paid per unit held during the month). Bonds are constant-maturity par
bonds rolled monthly.

## Stack

TypeScript end to end. Svelte (SvelteKit) frontend, Node server, Postgres on Railway.
Data pipeline is a separate workspace (`data/`) that produces static JSON.
