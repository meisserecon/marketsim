/**
 * US Treasury zero-coupon bonds with fixed maturity years.
 *
 * A bond "US Treasury 2000" pays 100 on 1 January 2000 and nothing before. Its price on any
 * day is 100 discounted at the zero-coupon yield for the remaining time, taken from the Federal
 * Reserve's fitted Treasury yield curve (Gürkaynak, Sack and Wright; Svensson parameters).
 * "Pay 13 today, get 100 in 2000."
 *
 * This is a stylisation: zero-coupon Treasuries were not sold to the public in 1980 (stripped
 * Treasuries appeared from 1982, the official STRIPS programme in 1985). The prices are what
 * such a bond would have cost given the yield curve of the day.
 *
 * Three bonds are available at any time: one maturing within 5 years, one within 10 and one
 * within 20. Maturities fall every five years. When a bond matures, the longest maturity that
 * restores that rule is listed: 1985/1990/2000 at the start, then 1995 joins in 1985, 2010 in
 * 1990, 2005 in 1995, and so on.
 */

export interface CurvePoint {
  /** Observation date, YYYY-MM-DD. */
  date: string;
  beta0: number; beta1: number; beta2: number; beta3: number; tau1: number; tau2: number;
}

/** Continuously compounded zero-coupon yield in percent for a maturity of `years` (Svensson form; beta3 = 0 gives Nelson-Siegel). */
export function zeroYield(c: CurvePoint, years: number): number {
  const n = Math.max(years, 1e-6);
  const a = n / c.tau1;
  const f1 = (1 - Math.exp(-a)) / a;
  let y = c.beta0 + c.beta1 * f1 + c.beta2 * (f1 - Math.exp(-a));
  if (c.beta3 && c.tau2 > 0) {
    const b = n / c.tau2;
    y += c.beta3 * ((1 - Math.exp(-b)) / b - Math.exp(-b));
  }
  return y;
}

/** Years from an observation date to 1 January of the maturity year. */
export function yearsToMaturity(date: string, maturityYear: number): number {
  const ms = Date.UTC(maturityYear, 0, 1) - Date.parse(date + "T00:00:00Z");
  return ms / (365.25 * 24 * 3600 * 1000);
}

export interface BondDef {
  maturityYear: number;
  /** First month the bond is listed. */
  from: string;
  /** Last month it is quoted: December before the maturity year. It repays 100 when the game moves on. */
  until: string;
}

/** The bonds in existence between the start of the game and `lastMonth`, following the three-bond rule. */
export function bondSchedule(gameStart: string, lastMonth: string, historyFrom: string): BondDef[] {
  const startYear = Number(gameStart.slice(0, 4)) + 1; // the game opens in December; maturities count from the January after
  const lastYear = Number(lastMonth.slice(0, 4));
  const def = (maturityYear: number, from: string): BondDef => ({ maturityYear, from, until: `${maturityYear - 1}-12` });
  // Initial set: 5, 10 and 20 years. The two shorter ones get chart history before the game starts;
  // the 20-year one starts with the game, because the curve is not fitted that far out before 1980.
  const bonds = [def(startYear + 5, historyFrom), def(startYear + 10, historyFrom), def(startYear + 20, gameStart)];
  let live = [startYear + 5, startYear + 10, startYear + 20];
  for (let y = startYear + 5; y <= lastYear; y += 5) {
    live = live.filter((m) => m !== y);
    // Remaining bonds mature in 5 and either 10 or 15 years. Fill the free slot with the longest allowed maturity.
    const added = live.includes(y + 10) ? y + 20 : y + 10;
    live.push(added);
    bonds.push(def(added, `${y}-01`));
  }
  return bonds;
}

export interface BondRow { month: string; price: number; income: number; extra: { yield: number; years: number } }

/** Monthly prices of one bond from month-end curve observations (map month -> curve point). */
export function buildZeroBondRows(def: BondDef, curve: Map<string, CurvePoint>, months: string[]): BondRow[] {
  const rows: BondRow[] = [];
  for (const month of months) {
    if (month < def.from || month > def.until) continue;
    const c = curve.get(month);
    if (!c) throw new Error(`no yield curve for ${month}`);
    const years = Math.max(0, yearsToMaturity(c.date, def.maturityYear));
    const last = month === def.until;
    const y = zeroYield(c, years) / 100;
    // In its final month the bond is worth its repayment; a day or two of discounting is noise.
    const price = last ? 100 : 100 * Math.exp(-y * years);
    // Shown to players as the yearly return from holding to maturity (annual compounding).
    rows.push({ month, price, income: 0, extra: { yield: last ? 0 : Math.exp(y) - 1, years: last ? 0 : years } });
  }
  return rows;
}
