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
 *   maturity     a bond is repaid: the position is paid out in cash at the final price, which is 100
 *   acquisition  the position is paid out in cash at the final price
 *   delisting    the position is sold at the final price
 *   merger       the position is converted into `successor` at both assets' final-month prices
 *                (value-preserving, so no share ratio is needed); paid out in cash if the
 *                successor is not quoted that month
 */
export interface AssetEnd {
  month: string;
  type: "acquisition" | "delisting" | "bankruptcy" | "merger" | "maturity";
  note: string;
  /** Asset id the position converts into. Required for a merger. */
  successor?: string;
}

export interface AssetSeries {
  id: string;
  /** The name at the start of the series. Use nameAt() for display; this alone may be outdated. */
  name: string;
  /** Later names, each valid from the given month on, in ascending order. */
  renames?: { from: string; name: string }[];
  kind: AssetKind;
  currency: "USD";
  /** Provenance. For maintainers; may mention later events, so never show it to players. */
  source: string;
  /** For maintainers; may mention later events, so never show it to players. */
  notes?: string;
  /** For bonds: the day the bond repays 100 per unit, "YYYY-MM-DD". Known from the start, so it may be shown. */
  maturity?: string;
  /** Reveal to players only once the game has moved past end.month. */
  end?: AssetEnd;
  rows: MonthRow[];
}

/** The name the asset carried in the given month. */
export function nameAt(asset: Pick<AssetSeries, "name" | "renames">, month: string): string {
  let name = asset.name;
  for (const r of asset.renames ?? []) if (r.from <= month) name = r.name;
  return name;
}
