/** Turns raw source files into data/out/<asset>.json in the shared AssetSeries format. */
import fs from "node:fs";
import path from "node:path";
import { RAW_DIR, OUT_DIR } from "./lib/paths.js";
import { readTwoColumnCsv } from "./lib/csv.js";
import { lastOfMonth, monthRange } from "./lib/months.js";
import { buildBondRows } from "./lib/bonds.js";
import type { AssetSeries, MonthRow } from "./lib/asset.js";

export const START_MONTH = "1979-12"; // base month; the game starts one month later
const round = (x: number, d = 4) => Math.round(x * 10 ** d) / 10 ** d;

function write(series: AssetSeries) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const rows = series.rows.map((r) => ({
    ...r,
    price: round(r.price),
    income: round(r.income, 6),
    ...(r.extra ? { extra: Object.fromEntries(Object.entries(r.extra).map(([k, v]) => [k, round(v, 6)])) } : {}),
  }));
  fs.writeFileSync(path.join(OUT_DIR, `${series.id}.json`), JSON.stringify({ ...series, rows }, null, 1));
  console.log(`${series.id}: ${rows.length} months, ${rows[0].month} .. ${rows[rows.length - 1].month}`);
}

// --- bonds -------------------------------------------------------------------
const bonds = [
  { id: "ust1y", name: "US Treasury 1-year", fred: "DGS1", T: 1 },
  { id: "ust5y", name: "US Treasury 5-year", fred: "DGS5", T: 5 },
  { id: "ust10y", name: "US Treasury 10-year", fred: "DGS10", T: 10 },
];
let endMonth: string | undefined;
for (const b of bonds) {
  const daily = readTwoColumnCsv(path.join(RAW_DIR, "fred", `${b.fred}.csv`));
  const monthly = lastOfMonth(daily);
  const yields = new Map([...monthly].map(([m, pct]) => [m, pct / 100]));
  const last = [...monthly.keys()].at(-1)!;
  endMonth = endMonth && endMonth < last ? endMonth : last;
  const months = monthRange(START_MONTH, last);
  write({
    id: b.id,
    name: b.name,
    kind: "bond",
    currency: "USD",
    source: `FRED ${b.fred} (daily constant-maturity yield, last observation of each month)`,
    notes:
      "Constant-maturity par bond rolled monthly. price = clean price index, income = previous month yield / 12 paid in cash. extra.yield = month-end yield as fraction.",
    rows: buildBondRows(months, yields, b.T),
  });
}

// --- gold --------------------------------------------------------------------
const goldRows = readTwoColumnCsv(path.join(RAW_DIR, "gold", "lbma_monthly.csv")); // dates are "YYYY-MM"
const gold = new Map(goldRows.map((r) => [r.date, r.value]));
const goldLast = goldRows.at(-1)!.date;
const goldMonths = monthRange(START_MONTH, goldLast);
const rows: MonthRow[] = goldMonths.map((m) => {
  const p = gold.get(m);
  if (p === undefined) throw new Error(`missing gold price for ${m}`);
  return { month: m, price: p, income: 0 };
});
write({
  id: "gold",
  name: "Gold",
  kind: "gold",
  currency: "USD",
  source: "datahub.io/core/gold-prices (LBMA, via Deutsche Bundesbank), monthly average USD per troy ounce",
  notes: "Monthly average, not month-end. No income.",
  rows,
});

// --- cash --------------------------------------------------------------------
write({
  id: "cash",
  name: "US Dollar",
  kind: "cash",
  currency: "USD",
  source: "constant",
  notes: "Interest-free by design.",
  rows: monthRange(START_MONTH, endMonth!).map((m) => ({ month: m, price: 1, income: 0 })),
});
