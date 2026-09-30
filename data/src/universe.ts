/**
 * The stock universe. Each entry becomes one AssetSeries in data/out.
 *
 * source "yahoo":  fetched from Yahoo Finance by ticker (daily closes reduced to month end).
 * source "manual": hand-curated CSV in data/manual/<id>.csv with columns month,price,income
 *                  in the stated currency. Skipped with a warning while the file is missing.
 *
 * Prices in CHF or JPY are converted to USD at the month-end FRED exchange rate.
 */
export type Currency = "USD" | "CHF" | "JPY" | "GBP";

export interface CorporateEnd {
  month: string; // last month the position exists
  type: "acquisition" | "delisting" | "bankruptcy" | "merger";
  /** For acquisition/merger: what the holder receives. Free text for now. */
  note: string;
}

export interface StockDef {
  id: string;
  name: string;
  source: "yahoo" | "manual";
  ticker?: string;
  currency: Currency;
  note?: string;
  end?: CorporateEnd;
}

export const UNIVERSE: StockDef[] = [
  // --- US, full period ------------------------------------------------------
  { id: "ibm", name: "IBM", source: "yahoo", ticker: "IBM", currency: "USD" },
  { id: "ge", name: "General Electric", source: "yahoo", ticker: "GE", currency: "USD" },
  { id: "xom", name: "Exxon (ExxonMobil)", source: "yahoo", ticker: "XOM", currency: "USD" },
  { id: "ko", name: "Coca-Cola", source: "yahoo", ticker: "KO", currency: "USD" },
  { id: "wmt", name: "Walmart", source: "yahoo", ticker: "WMT", currency: "USD" },
  { id: "ba", name: "Boeing", source: "yahoo", ticker: "BA", currency: "USD" },
  { id: "f", name: "Ford", source: "yahoo", ticker: "F", currency: "USD" },

  // --- US, later arrivals ---------------------------------------------------
  { id: "aapl", name: "Apple", source: "yahoo", ticker: "AAPL", currency: "USD" },
  { id: "msft", name: "Microsoft", source: "yahoo", ticker: "MSFT", currency: "USD" },
  { id: "csco", name: "Cisco", source: "yahoo", ticker: "CSCO", currency: "USD" },
  { id: "amzn", name: "Amazon", source: "yahoo", ticker: "AMZN", currency: "USD" },
  { id: "nvda", name: "Nvidia", source: "yahoo", ticker: "NVDA", currency: "USD" },
  { id: "goog", name: "Google (Alphabet)", source: "yahoo", ticker: "GOOG", currency: "USD" },
  { id: "tsla", name: "Tesla", source: "yahoo", ticker: "TSLA", currency: "USD" },

  // --- dot-com boom and bust, survivors -------------------------------------
  { id: "jdsu", name: "JDS Uniphase (Viavi)", source: "yahoo", ticker: "VIAV", currency: "USD", note: "Fell 99% from the 2000 peak, renamed Viavi in 2015." },
  { id: "akam", name: "Akamai", source: "yahoo", ticker: "AKAM", currency: "USD" },
  { id: "pcln", name: "Priceline (Booking)", source: "yahoo", ticker: "BKNG", currency: "USD" },

  // --- international --------------------------------------------------------
  { id: "sony", name: "Sony", source: "yahoo", ticker: "SONY", currency: "USD" },
  { id: "unilever", name: "Unilever", source: "yahoo", ticker: "UL", currency: "USD" },

  // --- mining ---------------------------------------------------------------
  { id: "glencore", name: "Glencore", source: "yahoo", ticker: "GLEN.L", currency: "GBP", note: "Listed May 2011, merged with Xstrata in 2013." },
  { id: "xstrata", name: "Xstrata", source: "manual", currency: "GBP", end: { month: "2013-04", type: "merger", note: "Merged into Glencore, 3.05 Glencore shares per Xstrata share" } },

  // --- Swiss ----------------------------------------------------------------
  { id: "nestle", name: "Nestlé", source: "yahoo", ticker: "NESN.SW", currency: "CHF", note: "Yahoo data from 1989-12; earlier years to be added manually." },
  { id: "novartis", name: "Novartis", source: "yahoo", ticker: "NOVN.SW", currency: "CHF", note: "Formed 1996 from Sandoz and Ciba-Geigy." },
  { id: "ubs", name: "UBS", source: "yahoo", ticker: "UBSG.SW", currency: "CHF" },
  { id: "sandoz", name: "Sandoz", source: "manual", currency: "CHF", end: { month: "1996-12", type: "merger", note: "Merged into Novartis" } },
  { id: "ciba-geigy", name: "Ciba-Geigy", source: "manual", currency: "CHF", end: { month: "1996-12", type: "merger", note: "Merged into Novartis" } },
  { id: "credit-suisse", name: "Credit Suisse", source: "manual", currency: "CHF", end: { month: "2023-06", type: "acquisition", note: "Taken over by UBS, 1 UBS share per 22.48 CS shares" } },
  { id: "swissair", name: "Swissair (SAirGroup)", source: "manual", currency: "CHF", end: { month: "2001-10", type: "bankruptcy", note: "Grounded October 2001" } },

  // --- Japan bubble ---------------------------------------------------------
  { id: "ibj", name: "Industrial Bank of Japan", source: "manual", currency: "JPY", end: { month: "2000-09", type: "merger", note: "Merged into Mizuho" } },

  // --- failures -------------------------------------------------------------
  { id: "enron", name: "Enron", source: "manual", currency: "USD", end: { month: "2001-12", type: "bankruptcy", note: "Chapter 11, December 2001" } },
  { id: "lehman", name: "Lehman Brothers", source: "manual", currency: "USD", end: { month: "2008-09", type: "bankruptcy", note: "Chapter 11, September 2008" } },
  { id: "worldcom", name: "WorldCom", source: "manual", currency: "USD", end: { month: "2002-07", type: "bankruptcy", note: "Chapter 11, July 2002" } },
  { id: "pets-com", name: "Pets.com", source: "manual", currency: "USD", end: { month: "2000-11", type: "bankruptcy", note: "Liquidated November 2000" } },
];
