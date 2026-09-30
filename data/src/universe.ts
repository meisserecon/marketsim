/**
 * The stock universe. Each entry becomes one AssetSeries in data/out.
 *
 * source "yahoo":  fetched from Yahoo Finance by ticker (daily closes reduced to month end).
 * source "manual": hand-curated CSV in data/manual/<id>.csv with columns month,price,income
 *                  in the stated currency. Skipped with a warning while the file is missing.
 *
 * Prices in CHF or JPY are converted to USD at the month-end FRED exchange rate.
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
  name: string;
  source: "yahoo" | "manual";
  ticker?: string;
  currency: Currency;
  note?: string;
  end?: CorporateEnd;
  /**
   * Spin-offs that the source books as a one-off dividend instead of adjusting the price.
   * The build removes the distribution from income and scales the earlier history down,
   * so every spin-off is folded into the parent's price the same way.
   */
  spinoffs?: { month: string; name: string }[];
}

export const UNIVERSE: StockDef[] = [
  // --- US, full period ------------------------------------------------------
  { id: "ibm", name: "IBM", source: "yahoo", ticker: "IBM", currency: "USD" },
  { id: "ge", name: "General Electric", source: "yahoo", ticker: "GE", currency: "USD" },
  { id: "xom", name: "Exxon (ExxonMobil)", source: "yahoo", ticker: "XOM", currency: "USD" },
  { id: "slb", name: "Schlumberger", source: "yahoo", ticker: "SLB", currency: "USD", note: "Top-five US stock at the 1980 oil peak, lost 70% and took twenty years to recover." },
  { id: "intc", name: "Intel", source: "yahoo", ticker: "INTC", currency: "USD", note: "Largest tech stock in 2000, flat for 25 years afterwards." },
  { id: "ko", name: "Coca-Cola", source: "yahoo", ticker: "KO", currency: "USD" },
  { id: "wmt", name: "Walmart", source: "yahoo", ticker: "WMT", currency: "USD" },
  { id: "ba", name: "Boeing", source: "yahoo", ticker: "BA", currency: "USD" },
  { id: "mo", name: "Altria (Philip Morris)", source: "yahoo", ticker: "MO", currency: "USD", spinoffs: [{ month: "2007-04", name: "Kraft Foods" }, { month: "2008-03", name: "Philip Morris International" }] },
  { id: "c", name: "Citigroup", source: "yahoo", ticker: "C", currency: "USD", spinoffs: [{ month: "2002-08", name: "Travelers Property Casualty" }] },
  { id: "mcd", name: "McDonald's", source: "yahoo", ticker: "MCD", currency: "USD" },
  { id: "dis", name: "Disney", source: "yahoo", ticker: "DIS", currency: "USD" },

  // --- US, later arrivals ---------------------------------------------------
  { id: "aapl", name: "Apple", source: "yahoo", ticker: "AAPL", currency: "USD" },
  { id: "msft", name: "Microsoft", source: "yahoo", ticker: "MSFT", currency: "USD" },
  { id: "csco", name: "Cisco", source: "yahoo", ticker: "CSCO", currency: "USD" },
  { id: "amzn", name: "Amazon", source: "yahoo", ticker: "AMZN", currency: "USD" },
  { id: "ebay", name: "eBay", source: "yahoo", ticker: "EBAY", currency: "USD", note: "The profitable internet darling of 2000; the PayPal spin-off in 2015 is folded into the price." },
  { id: "nvda", name: "Nvidia", source: "yahoo", ticker: "NVDA", currency: "USD" },

  // --- autos ----------------------------------------------------------------
  { id: "tsla", name: "Tesla", source: "yahoo", ticker: "TSLA", currency: "USD" },
  { id: "mercedes", name: "Mercedes-Benz (Daimler)", source: "yahoo", ticker: "MBG.DE", currency: "EUR", note: "Daimler-Benz until 1998, DaimlerChrysler until 2007, Daimler until 2022. Yahoo data from 1996-10; 1980 to 1996 needs a manual prefix." },
  { id: "bmw", name: "BMW", source: "yahoo", ticker: "BMW.DE", currency: "EUR", note: "Yahoo data from 1996-11; 1980 to 1996 needs a manual prefix." },

  // --- dot-com boom and bust, survivors -------------------------------------
  { id: "jdsu", name: "JDS Uniphase (Viavi)", source: "yahoo", ticker: "VIAV", currency: "USD", note: "Fell 99% from the 2000 peak, renamed Viavi in 2015." },
  { id: "pcln", name: "Priceline (Booking)", source: "yahoo", ticker: "BKNG", currency: "USD" },

  // --- international --------------------------------------------------------
  { id: "sony", name: "Sony", source: "yahoo", ticker: "SONY", currency: "USD" },
  { id: "siemens", name: "Siemens", source: "yahoo", ticker: "SIE.DE", currency: "EUR", note: "Yahoo data from 1996-11; 1980 to 1996 needs a manual prefix." },
  { id: "nokia", name: "Nokia", source: "yahoo", ticker: "NOK", currency: "USD", note: "ADR from 1994-07. Peak 2000, lost the phone business to Apple." },

  // --- mining ---------------------------------------------------------------
  { id: "glencore", name: "Glencore", source: "yahoo", ticker: "GLEN.L", currency: "GBP", note: "Listed May 2011, merged with Xstrata in 2013." },
  { id: "xstrata", name: "Xstrata", source: "manual", currency: "GBP", end: { month: "2013-04", type: "merger", note: "Merged into Glencore, 3.05 Glencore shares per Xstrata share", successor: "glencore" } },

  // --- Swiss ----------------------------------------------------------------
  { id: "nestle", name: "Nestlé", source: "yahoo", ticker: "NESN.SW", currency: "CHF", note: "Yahoo data from 1990-01; 1980 to 1989 needs a manual prefix." },
  { id: "novartis", name: "Novartis", source: "yahoo", ticker: "NOVN.SW", currency: "CHF", note: "Formed 1996 from Sandoz and Ciba-Geigy." },
  { id: "ubs", name: "UBS (Schweizerische Bankgesellschaft until 1998)", source: "yahoo", ticker: "UBSG.SW", currency: "CHF", note: "UBS AG is the renamed Schweizerische Bankgesellschaft (Union Bank of Switzerland), which merged with Bankverein in June 1998. Yahoo data from 1995-08; 1980 to 1995 needs a manual prefix. Verify that Yahoo's 1995-1998 prices are Bankgesellschaft's." },
  { id: "sbv", name: "Schweizerischer Bankverein (Swiss Bank Corporation)", source: "manual", currency: "CHF", end: { month: "1998-06", type: "merger", note: "Merged with Bankgesellschaft into UBS; holders received 1 1/13 UBS shares per Bankverein share", successor: "ubs" } },
  { id: "sandoz", name: "Sandoz", source: "manual", currency: "CHF", end: { month: "1996-12", type: "merger", note: "Merged into Novartis", successor: "novartis" } },
  { id: "ciba-geigy", name: "Ciba-Geigy", source: "manual", currency: "CHF", end: { month: "1996-12", type: "merger", note: "Merged into Novartis", successor: "novartis" } },
  { id: "credit-suisse", name: "Credit Suisse", source: "manual", currency: "CHF", end: { month: "2023-06", type: "merger", note: "Taken over by UBS, 1 UBS share per 22.48 CS shares", successor: "ubs" } },
  { id: "swissair", name: "Swissair (SAirGroup)", source: "manual", currency: "CHF", end: { month: "2001-10", type: "bankruptcy", note: "Grounded October 2001" } },

  // --- Japan bubble ---------------------------------------------------------
  { id: "ibj", name: "Industrial Bank of Japan", source: "manual", currency: "JPY", end: { month: "2000-09", type: "acquisition", note: "Merged into Mizuho, which is not in the game; paid out at the last price" } },

  // --- failures -------------------------------------------------------------
  { id: "enron", name: "Enron", source: "manual", currency: "USD", end: { month: "2001-12", type: "bankruptcy", note: "Chapter 11, December 2001" } },
  { id: "lehman", name: "Lehman Brothers", source: "manual", currency: "USD", end: { month: "2008-09", type: "bankruptcy", note: "Chapter 11, September 2008" } },
  { id: "worldcom", name: "WorldCom", source: "manual", currency: "USD", end: { month: "2002-07", type: "bankruptcy", note: "Chapter 11, July 2002" } },
  { id: "pets-com", name: "Pets.com", source: "manual", currency: "USD", end: { month: "2000-11", type: "bankruptcy", note: "Liquidated November 2000" } },
];
