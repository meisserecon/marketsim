/** Month keys look like "1980-01". */
export type MonthKey = string;

export function monthOf(date: string): MonthKey {
  return date.slice(0, 7);
}

/** Take the last observation of each calendar month. Input must be sorted ascending by date. */
export function lastOfMonth(rows: { date: string; value: number }[]): Map<MonthKey, number> {
  const out = new Map<MonthKey, number>();
  for (const r of rows) out.set(monthOf(r.date), r.value);
  return out;
}

export function monthRange(from: MonthKey, to: MonthKey): MonthKey[] {
  const keys: MonthKey[] = [];
  let [y, m] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  while (y < ty || (y === ty && m <= tm)) {
    keys.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return keys;
}
