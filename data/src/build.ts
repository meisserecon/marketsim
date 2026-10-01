/** Turns raw source files into data/out/<asset>.json in the shared AssetSeries format. */
import fs from "node:fs";
import path from "node:path";
import { RAW_DIR, OUT_DIR, DATA_DIR } from "./lib/paths.js";
import { readTwoColumnCsv, readCsv } from "./lib/csv.js";
import { lastOfMonth, monthRange } from "./lib/months.js";
import { GAME_START_MONTH } from "@marketsim/shared";
import { buildBondRows } from "./lib/bonds.js";
import { UNIVERSE, type Currency } from "./universe.js";
import type { AssetSeries, MonthRow } from "./lib/asset.js";

/** First month of history. The game itself starts at GAME_START_MONTH; the years before are chart context and feed the trailing figures. */
export const START_MONTH = "1975-01";
const round = (x: number, d = 4) => Math.round(x * 10 ** d) / 10 ** d;

// Clear stale outputs so removed assets disappear.
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

function write(series: AssetSeries) {
  const rows = series.rows.map((r) => ({
    ...r,
    price: round(r.price),
    income: round(r.income, 6),
    ...(r.extra ? { extra: Object.fromEntries(Object.entries(r.extra).map(([k, v]) => [k, round(v, 6)])) } : {}),
  }));
  fs.writeFileSync(path.join(OUT_DIR, `${series.id}.json`), JSON.stringify({ ...series, rows }, null, 1));
  console.log(`${series.id.padEnd(14)} ${rows.length.toString().padStart(4)} months, ${rows[0].month} .. ${rows[rows.length - 1].month}`);
}

function fredMonthly(id: string): Map<string, number> {
  return lastOfMonth(readTwoColumnCsv(path.join(RAW_DIR, "fred", `${id}.csv`)));
}

// --- bonds -------------------------------------------------------------------
const bonds = [
  { id: "ust1y", name: "US Treasury 1-year", fred: "DGS1", T: 1 },
  { id: "ust5y", name: "US Treasury 5-year", fred: "DGS5", T: 5 },
  { id: "ust10y", name: "US Treasury 10-year", fred: "DGS10", T: 10 },
];
let endMonth: string | undefined;
for (const b of bonds) {
  const monthly = fredMonthly(b.fred);
  const yields = new Map([...monthly].map(([m, pct]) => [m, pct / 100]));
  const last = [...monthly.keys()].at(-1)!;
  endMonth = endMonth && endMonth < last ? endMonth : last;
  write({
    id: b.id,
    name: b.name,
    kind: "bond",
    currency: "USD",
    source: `FRED ${b.fred} (daily constant-maturity yield, last observation of each month)`,
    notes:
      "Constant-maturity par bond rolled monthly. price = clean price index, income = previous month yield / 12 paid in cash. extra.yield = month-end yield as fraction.",
    rows: buildBondRows(monthRange(START_MONTH, last), yields, b.T, GAME_START_MONTH),
  });
}

// --- gold --------------------------------------------------------------------
const goldRows = readTwoColumnCsv(path.join(RAW_DIR, "gold", "lbma_monthly.csv")); // dates are "YYYY-MM"
const gold = new Map(goldRows.map((r) => [r.date, r.value]));
write({
  id: "gold",
  name: "Gold",
  kind: "gold",
  currency: "USD",
  source: "datahub.io/core/gold-prices (LBMA, via Deutsche Bundesbank), monthly average USD per troy ounce",
  notes: "Monthly average, not month-end. No income.",
  rows: monthRange(START_MONTH, goldRows.at(-1)!.date).map((m) => {
    const p = gold.get(m);
    if (p === undefined) throw new Error(`missing gold price for ${m}`);
    return { month: m, price: p, income: 0 };
  }),
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

// --- stocks ------------------------------------------------------------------
// USD per unit of foreign currency at month end.
const usdPer: Record<Currency, (m: string) => number> = {
  USD: () => 1,
  CHF: (() => { const chfPerUsd = fredMonthly("DEXSZUS"); return (m: string) => 1 / need(chfPerUsd, m, "DEXSZUS"); })(),
  JPY: (() => { const jpyPerUsd = fredMonthly("DEXJPUS"); return (m: string) => 1 / need(jpyPerUsd, m, "DEXJPUS"); })(),
  GBP: (() => { const usdPerGbp = fredMonthly("DEXUSUK"); return (m: string) => need(usdPerGbp, m, "DEXUSUK"); })(),
  EUR: (() => {
    // Yahoo restates pre-1999 German prices in euro at the fixed conversion rate, so do the same with the DEM/USD rate.
    const usdPerEur = fredMonthly("DEXUSEU");
    const demPerUsd = fredMonthly("EXGEUS"); // monthly average; only used 1996-1998 for the German listings
    return (m: string) => (m >= "1999-01" ? need(usdPerEur, m, "DEXUSEU") : 1.95583 / need(demPerUsd, m, "EXGEUS"));
  })(),
};
function need(map: Map<string, number>, m: string, what: string): number {
  const v = map.get(m);
  if (v === undefined) throw new Error(`missing ${what} for ${m}`);
  return v;
}

for (const s of UNIVERSE) {
  let local: { month: string; price: number; income: number; maxdiv?: number }[] = [];
  const sources: string[] = [];
  const manualFile = path.join(DATA_DIR, "manual", `${s.id}.csv`);
  const manual = fs.existsSync(manualFile)
    ? readCsv(manualFile).map((r) => ({ month: r.month, price: Number(r.price), income: Number(r.income || 0) }))
    : [];
  if (s.source === "yahoo") {
    const file = path.join(RAW_DIR, "yahoo", `${s.id}.csv`);
    if (!fs.existsSync(file)) { console.warn(`${s.id}: raw file missing, run fetch`); continue; }
    local = readCsv(file).map((r) => ({ month: r.month, price: Number(r.close), income: Number(r.dividend), maxdiv: Number(r.maxdiv || 0) }));
    sources.push(`Yahoo Finance ${s.ticker} (daily, last close of month; dividends by ex-date; split- and spin-off-adjusted)`);
    // A manual file for a Yahoo asset is a prefix: it supplies the months before Yahoo's history starts.
    // Its prices must be on the same share basis as Yahoo's adjusted series (check the overlap month).
    const yahooStart = local[0].month;
    const prefix = manual.filter((r) => r.month < yahooStart);
    if (prefix.length) {
      const overlap = manual.find((r) => r.month === yahooStart);
      if (overlap) {
        const ratio = overlap.price / local[0].price;
        if (Math.abs(ratio - 1) > 0.05) throw new Error(`${s.id}: manual prefix is off by ${((ratio - 1) * 100).toFixed(1)}% in overlap month ${yahooStart}; rebase it to Yahoo's adjusted prices`);
      } else console.warn(`${s.id}: manual prefix has no overlap month ${yahooStart} to check the share basis against`);
      local = [...prefix, ...local];
      sources.unshift(`manual/${s.id}.csv until ${prefix[prefix.length - 1].month}`);
    }
  } else {
    if (!manual.length) { console.warn(`${s.id}: manual/${s.id}.csv not yet curated, skipped`); continue; }
    local = manual;
    sources.push(`manual/${s.id}.csv`);
  }
  for (const fix of s.dividendFixes ?? []) {
    const r = local.find((x) => x.month === fix.month);
    if (!r) throw new Error(`${s.id}: dividend fix month ${fix.month} not in data`);
    if (Math.abs(r.income - fix.dividend) < 1e-9) throw new Error(`${s.id}: dividend in ${fix.month} already is ${fix.dividend}; the source was corrected, remove the fix`);
    r.income = fix.dividend;
    if (r.maxdiv !== undefined) r.maxdiv = fix.dividend;
    sources.push(`dividend ${fix.month} corrected to ${fix.dividend}`);
  }
  // Fold spin-offs that the source booked as a dividend into the price history (oldest first,
  // so each later event sees amounts already rescaled by the earlier ones).
  const folded: string[] = [];
  for (const sp of [...(s.spinoffs ?? [])].sort((a, b) => a.month.localeCompare(b.month))) {
    const i = local.findIndex((r) => r.month === sp.month);
    if (i < 1) throw new Error(`${s.id}: spin-off month ${sp.month} not in data`);
    const amount = local[i].maxdiv ?? 0;
    const prev = local[i - 1].price;
    if (amount / prev < 0.03) throw new Error(`${s.id}: no large distribution found in ${sp.month} for ${sp.name}; has the source started adjusting for it?`);
    const f = 1 - amount / prev;
    local[i].income -= amount;
    for (let k = 0; k < i; k++) {
      local[k].price *= f;
      local[k].income *= f;
      if (local[k].maxdiv) local[k].maxdiv! *= f;
    }
    folded.push(`${sp.name} ${sp.month} (factor ${f.toFixed(3)})`);
  }
  if (folded.length) sources.push(`spin-offs folded into price: ${folded.join(", ")}`);
  const source = sources.join("; ");
  local = local.filter((r) => r.month >= START_MONTH);
  if (s.start) local = local.filter((r) => r.month >= s.start!);
  if (s.end) local = local.filter((r) => r.month <= s.end!.month);
  if (!local.length) { console.warn(`${s.id}: no rows in range, skipped`); continue; }

  // Fill gaps (a month with no trading day in the source) with the previous price, and fail on long gaps.
  const byMonth = new Map(local.map((r) => [r.month, r]));
  const rows: MonthRow[] = [];
  let prev: MonthRow | undefined;
  let gap = 0;
  for (const m of monthRange(local[0].month, local[local.length - 1].month)) {
    const r = byMonth.get(m);
    if (!r) {
      if (++gap > 2) throw new Error(`${s.id}: gap of ${gap} months at ${m}`);
      rows.push({ month: m, price: prev!.price, income: 0 });
      continue;
    }
    gap = 0;
    const fx = usdPer[s.currency](m);
    prev = { month: m, price: r.price * fx, income: r.income * fx };
    rows.push(prev);
  }

  write({
    id: s.id,
    name: s.name,
    renames: s.renames,
    kind: "stock",
    currency: "USD",
    source,
    notes: [s.currency !== "USD" ? `Converted from ${s.currency} at month-end FRED rate.` : "", s.note ?? ""].filter(Boolean).join(" ") || undefined,
    end: s.end,
    rows,
  });
}
