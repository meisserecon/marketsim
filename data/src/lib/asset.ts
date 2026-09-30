/**
 * Output format shared by every asset. One row per month.
 *
 * price   – value of one unit at month end (USD). Split-adjusted for stocks, clean price index for bonds.
 * income  – cash paid out during the month per unit held at the previous month end (USD).
 *           Bond coupons and stock dividends. Never reinvested; the game credits it to cash.
 * extra   – asset-specific context for display (e.g. yield for bonds).
 */
export interface MonthRow {
  month: string;
  price: number;
  income: number;
  extra?: Record<string, number>;
}

export interface AssetSeries {
  id: string;
  name: string;
  kind: "cash" | "bond" | "gold" | "stock";
  currency: "USD";
  source: string;
  notes?: string;
  rows: MonthRow[];
}
