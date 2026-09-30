/**
 * Constant-maturity par bond, rolled monthly.
 *
 * Each month the player implicitly holds a freshly issued par bond with maturity T years and a
 * semi-annual coupon equal to last month's yield. At month end the bond is repriced at the new
 * yield with one month less to maturity, the accrued coupon is paid out as cash, and the
 * proceeds are rolled into a new par bond. This makes:
 *   capital return = clean price change (rate moves, pull-to-par)
 *   income         = previous yield / 12 (paid to cash, never reinvested)
 * and the sum matches a constant-maturity total return index closely.
 */

/** Dirty price (per 100 face) of a bond with annual coupon rate `c`, `T` years maturity at issue,
 *  yield `y`, `elapsedYears` after issue. Semi-annual coupons, compounding per period. */
export function bondPrice(c: number, T: number, y: number, elapsedYears: number): number {
  const periods = Math.round(2 * T);
  const elapsedPeriods = 2 * elapsedYears;
  const v = 1 / (1 + y / 2);
  let pv = 0;
  for (let k = 1; k <= periods; k++) {
    const t = k - elapsedPeriods; // half-years until this coupon
    pv += (c / 2) * 100 * Math.pow(v, t);
  }
  pv += 100 * Math.pow(v, periods - elapsedPeriods);
  return pv;
}

export function cleanPriceAfterOneMonth(prevYield: number, newYield: number, T: number): number {
  const elapsed = 1 / 12;
  const dirty = bondPrice(prevYield, T, newYield, elapsed);
  const accrued = (prevYield / 2) * 100 * (elapsed * 2); // fraction of the half-year coupon
  return dirty - accrued;
}

/** Build monthly price index and income from a month-end yield series (fractions, not percent). */
export function buildBondRows(months: string[], yields: Map<string, number>, T: number) {
  let index = 100;
  const rows: { month: string; price: number; income: number; extra: { yield: number } }[] = [];
  for (let i = 0; i < months.length; i++) {
    const m = months[i];
    const y = yields.get(m);
    if (y === undefined) throw new Error(`missing yield for ${m}`);
    if (i === 0) {
      rows.push({ month: m, price: index, income: 0, extra: { yield: y } });
      continue;
    }
    const yPrev = yields.get(months[i - 1])!;
    const clean = cleanPriceAfterOneMonth(yPrev, y, T);
    const income = index * (yPrev / 12);
    index = index * (clean / 100);
    rows.push({ month: m, price: index, income, extra: { yield: y } });
  }
  return rows;
}
