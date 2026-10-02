/**
 * The stock universe. Each entry becomes one AssetSeries in data/out.
 *
 * source "yahoo":  fetched from Yahoo Finance by ticker (daily closes reduced to month end).
 * source "manual": hand-curated CSV in data/manual/<id>.csv with columns month,price,income
 *                  in the stated currency. Skipped with a warning while the file is missing.
 *
 * Prices in CHF, JPY, GBP or EUR are converted to USD at the month-end FRED exchange rate.
 *
 * Names must not leak the future: `name` is what the company was called when its series starts,
 * and `renames` lists every later change. `note` is for maintainers and is never shown to players.
 */
export type Currency = "USD" | "CHF" | "JPY" | "GBP" | "EUR";

export interface CorporateEnd {
  month: string; // last month the position exists
  type: "acquisition" | "delisting" | "bankruptcy" | "merger";
  /** Shown to the player when the event happens. */
  note: string;
  /** Asset id a merger converts into; see AssetEnd in @marketsim/shared for the rules. */
  successor?: string;
}

export interface StockDef {
  id: string;
  /** The name at the start of the series. */
  name: string;
  /** Later names, each valid from the given month on. */
  renames?: { from: string; name: string }[];
  source: "yahoo" | "manual";
  ticker?: string;
  currency: Currency;
  /** Drop source rows before this month (a source back-filling a company that did not exist yet). */
  start?: string;
  /**
   * For a Yahoo asset with a manual file: take Yahoo only from this month on and the manual file before it.
   * Used where Yahoo follows a different share class in the early years, or has stale early rows. The manual
   * file must contain this month as an overlap row; the build checks it against Yahoo.
   */
  yahooFrom?: string;
  note?: string;
  end?: CorporateEnd;
  /**
   * Spin-offs that the source books as a one-off dividend instead of adjusting the price.
   * The build removes the distribution from income and scales the earlier history down,
   * so every spin-off is folded into the parent's price the same way.
   */
  spinoffs?: { month: string; name: string }[];
  /**
   * Corrections for single dividends the source reports wrongly (typically one payment left
   * unadjusted for a later split, so it is an exact multiple of its neighbours). In the source
   * currency and on the source share basis.
   */
  dividendFixes?: { month: string; dividend: number; reason: string }[];
}

export const UNIVERSE: StockDef[] = [
  // --- US, full period ------------------------------------------------------
  { id: "ibm", name: "IBM", source: "yahoo", ticker: "IBM", currency: "USD" },
  { id: "ge", name: "General Electric", renames: [{ from: "2024-04", name: "GE Aerospace" }], source: "yahoo", ticker: "GE", currency: "USD" },
  { id: "xom", name: "Exxon", renames: [{ from: "1999-12", name: "ExxonMobil" }], source: "yahoo", ticker: "XOM", currency: "USD", dividendFixes: [{ month: "1982-02", dividend: 0.09375, reason: "Yahoo shows 0.1875, exactly twice every neighbouring quarter; Exxon paid a steady 0.75 USD per quarter in 1981-82" }] },
  { id: "slb", name: "Schlumberger", source: "yahoo", ticker: "SLB", currency: "USD", note: "Top-five US stock at the 1980 oil peak, lost 70% and took twenty years to recover. Yahoo data from 1981-12; 1980 to 1981 needs a manual prefix.", spinoffs: [{ month: "1999-12", name: "Transocean Sedco Forex" }] },
  { id: "intc", name: "Intel", source: "yahoo", ticker: "INTC", currency: "USD", note: "Largest tech stock in 2000, flat for 25 years afterwards." },
  { id: "ko", name: "Coca-Cola", source: "yahoo", ticker: "KO", currency: "USD", dividendFixes: [{ month: "2001-09", dividend: 0.09, reason: "Yahoo shows 0.27, exactly three times the neighbouring quarters; Coca-Cola paid 0.18 USD per quarter in 2001, 0.09 after the 2012 split" }] },
  { id: "wmt", name: "Wal-Mart", renames: [{ from: "2018-02", name: "Walmart" }], source: "yahoo", ticker: "WMT", currency: "USD" },
  { id: "ba", name: "Boeing", source: "yahoo", ticker: "BA", currency: "USD" },
  { id: "mo", name: "Philip Morris", renames: [{ from: "2003-01", name: "Altria" }], source: "yahoo", ticker: "MO", currency: "USD", spinoffs: [{ month: "2007-04", name: "Kraft Foods" }, { month: "2008-03", name: "Philip Morris International" }] },
  { id: "c", name: "Citicorp", renames: [{ from: "1998-10", name: "Citigroup" }], source: "yahoo", ticker: "C", currency: "USD", note: "Verify which predecessor Yahoo's pre-1998 history follows: Citigroup is legally the renamed Travelers Group, so the early prices may be Travelers/Primerica rather than Citicorp.", spinoffs: [{ month: "2002-08", name: "Travelers Property Casualty" }] },
  { id: "mcd", name: "McDonald's", source: "yahoo", ticker: "MCD", currency: "USD" },
  { id: "dis", name: "Disney", source: "yahoo", ticker: "DIS", currency: "USD" },

  // --- US, later arrivals ---------------------------------------------------
  { id: "aapl", name: "Apple Computer", renames: [{ from: "2007-01", name: "Apple" }], source: "yahoo", ticker: "AAPL", currency: "USD" },
  { id: "msft", name: "Microsoft", source: "yahoo", ticker: "MSFT", currency: "USD" },
  { id: "csco", name: "Cisco", source: "yahoo", ticker: "CSCO", currency: "USD" },
  { id: "amzn", name: "Amazon", source: "yahoo", ticker: "AMZN", currency: "USD" },
  { id: "ebay", name: "eBay", source: "yahoo", ticker: "EBAY", currency: "USD", note: "The profitable internet darling of 2000; the PayPal spin-off in 2015 is folded into the price." },
  { id: "nvda", name: "Nvidia", source: "yahoo", ticker: "NVDA", currency: "USD" },

  // --- autos ----------------------------------------------------------------
  { id: "tsla", name: "Tesla", source: "yahoo", ticker: "TSLA", currency: "USD" },
  { id: "mercedes", name: "Daimler-Benz", renames: [{ from: "1998-11", name: "DaimlerChrysler" }, { from: "2007-10", name: "Daimler" }, { from: "2022-02", name: "Mercedes-Benz Group" }], source: "yahoo", ticker: "MBG.DE", currency: "EUR", note: "Yahoo data from 1996-10. Before that: online daily closes from December 1987 and the NZZ's Frankfurt list from 1980 (manual/mercedes.csv, generated by src/nzz.ts)." },
  { id: "bmw", name: "BMW", source: "yahoo", ticker: "BMW.DE", currency: "EUR", note: "Yahoo data from 1996-11; 1980 to 1996 needs a manual prefix." },

  // --- dot-com boom and bust, survivors -------------------------------------
  { id: "jdsu", name: "Uniphase", renames: [{ from: "1999-07", name: "JDS Uniphase" }, { from: "2015-08", name: "Viavi Solutions" }], source: "yahoo", ticker: "VIAV", currency: "USD", note: "Fell 99% from the 2000 peak." },
  { id: "pcln", name: "Priceline", renames: [{ from: "2018-02", name: "Booking Holdings" }], source: "yahoo", ticker: "BKNG", currency: "USD" },

  // --- international --------------------------------------------------------
  { id: "sony", name: "Sony", source: "yahoo", ticker: "SONY", currency: "USD" },
  { id: "siemens", name: "Siemens", source: "yahoo", ticker: "SIE.DE", currency: "EUR", note: "Yahoo data from 1996-11; 1980 to 1996 needs a manual prefix." },
  { id: "nokia", name: "Nokia", source: "yahoo", ticker: "NOK", currency: "USD", note: "ADR from 1994-07. Peak 2000, lost the phone business to Apple." },

  // --- mining ---------------------------------------------------------------
  { id: "glencore", name: "Glencore", source: "yahoo", ticker: "GLEN.L", currency: "GBP", note: "Listed May 2011, merged with Xstrata in 2013." },
  { id: "xstrata", name: "Xstrata", source: "manual", currency: "GBP", end: { month: "2013-04", type: "merger", note: "Merged into Glencore, 3.05 Glencore shares per Xstrata share", successor: "glencore" } },

  // --- Swiss ----------------------------------------------------------------
  { id: "nestle", name: "Nestlé", source: "yahoo", ticker: "NESN.SW", currency: "CHF", yahooFrom: "1993-06", note: "Bearer share from the NZZ until the share classes were unified in mid-1993 (manual/nestle.csv, generated by src/nzz.ts); Yahoo, which follows the registered share, from June 1993." },
  { id: "novartis", name: "Novartis", source: "yahoo", ticker: "NOVN.SW", currency: "CHF", start: "1996-11", note: "Formed December 1996 from Sandoz and Ciba-Geigy. Yahoo back-fills earlier prices with the Sandoz registered share / 50 (exact in all 19 months compared); they are cut, except November 1996, which is kept so that Sandoz and Ciba-Geigy positions can convert at the last prices before the merger." },
  { id: "ubs", name: "Schweizerische Bankgesellschaft", renames: [{ from: "1998-06", name: "UBS" }], source: "yahoo", ticker: "UBSG.SW", currency: "CHF", yahooFrom: "1998-06", note: "UBS AG is the renamed Schweizerische Bankgesellschaft, which merged with Bankverein in June 1998. Bearer share from the NZZ until May 1998 (manual/ubs.csv, generated by src/nzz.ts); Yahoo from June 1998. Yahoo's own rows before that follow the registered share and are stale before September 1996." },
  { id: "sbv", name: "Schweizerischer Bankverein", source: "manual", currency: "CHF", end: { month: "1998-05", type: "merger", note: "Merged with Bankgesellschaft into UBS; holders received 1 1/13 UBS shares per Bankverein share", successor: "ubs" } },
  { id: "sandoz", name: "Sandoz", source: "manual", currency: "CHF", end: { month: "1996-11", type: "merger", note: "Merged with Ciba-Geigy into Novartis", successor: "novartis" } },
  { id: "ciba-geigy", name: "Ciba-Geigy", source: "manual", currency: "CHF", end: { month: "1996-11", type: "merger", note: "Merged with Sandoz into Novartis", successor: "novartis" } },
  { id: "credit-suisse", name: "Schweizerische Kreditanstalt", renames: [{ from: "1989-01", name: "CS Holding" }, { from: "1997-01", name: "Credit Suisse Group" }], source: "manual", currency: "CHF", end: { month: "2023-06", type: "merger", note: "Taken over by UBS, 1 UBS share per 22.48 Credit Suisse shares", successor: "ubs" } },
  { id: "swissair", name: "Swissair", renames: [{ from: "1997-05", name: "SAirGroup" }], source: "manual", currency: "CHF", end: { month: "2001-10", type: "bankruptcy", note: "Grounded in October 2001 and placed in debt moratorium" } },

  // --- Japan bubble ---------------------------------------------------------
  { id: "ibj", name: "Industrial Bank of Japan", source: "manual", currency: "JPY", end: { month: "2000-08", type: "acquisition", note: "Merged into Mizuho, which is not in the game; paid out at the last price" } },

  // --- failures -------------------------------------------------------------
  { id: "enron", name: "Enron", source: "manual", currency: "USD", end: { month: "2001-12", type: "bankruptcy", note: "Filed for Chapter 11 bankruptcy in December 2001" } },
  { id: "lehman", name: "Lehman Brothers", source: "manual", currency: "USD", end: { month: "2008-09", type: "bankruptcy", note: "Filed for Chapter 11 bankruptcy in September 2008" } },
  { id: "worldcom", name: "LDDS Communications", renames: [{ from: "1995-05", name: "WorldCom" }, { from: "1998-09", name: "MCI WorldCom" }, { from: "2000-05", name: "WorldCom" }], source: "manual", currency: "USD", end: { month: "2002-07", type: "bankruptcy", note: "Filed for Chapter 11 bankruptcy in July 2002" } },
  { id: "pets-com", name: "Pets.com", source: "manual", currency: "USD", end: { month: "2000-11", type: "bankruptcy", note: "Liquidated in November 2000" } },
];
