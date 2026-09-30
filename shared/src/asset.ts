/**
 * The asset data format produced by the data pipeline (data/out/<id>.json) and consumed by
 * the game engine. One row per month.
 *
 * price   – value of one unit at month end (USD). Split-adjusted for stocks, clean price index for bonds.
 * income  – cash paid out during the month per unit held at the previous month end (USD).
 *           Bond coupons and stock dividends. Never reinvested; the game credits it to cash.
 * extra   – asset-specific context for display (e.g. yield for bonds).
 */
export interface MonthRow {
  month: string; // "YYYY-MM"
  price: number;
  income: number;
  extra?: Record<string, number>;
}

export type AssetKind = "cash" | "bond" | "gold" | "stock";

/**
 * How an asset stops existing. `month` is its last row; the event takes effect when the game
 * advances past that month.
 *
 *   bankruptcy   the position becomes worthless
 *   acquisition  the position is paid out in cash at the final price
 *   delisting    the position is sold at the final price
 *   merger       the position is converted into `successor` at both assets' final-month prices
 *                (value-preserving, so no share ratio is needed); paid out in cash if the
 *                successor is not quoted that month
 */
export interface AssetEnd {
  month: string;
  type: "acquisition" | "delisting" | "bankruptcy" | "merger";
  note: string;
  /** Asset id the position converts into. Required for a merger. */
  successor?: string;
}

export interface AssetSeries {
  id: string;
  name: string;
  kind: AssetKind;
  currency: "USD";
  source: string;
  notes?: string;
  end?: AssetEnd;
  rows: MonthRow[];
}
