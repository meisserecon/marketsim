/** Sanity checks on data/out: no gaps, no NaN, and a printed summary so a human can eyeball each series. */
import fs from "node:fs";
import path from "node:path";
import { OUT_DIR } from "./lib/paths.js";
import { monthRange } from "./lib/months.js";
import type { AssetSeries } from "./lib/asset.js";

// Gold's threshold is set by January 1980 (+48% on monthly averages, the Hunt brothers spike), which is real.
const MAX_MONTHLY_MOVE: Record<string, number> = { bond: 0.15, gold: 0.5, stock: 0.6, cash: 0 };
let failures = 0;
const fail = (msg: string) => {
  failures++;
  console.error("  FAIL " + msg);
};
const pct = (x: number) => (x * 100).toFixed(2) + "%";

for (const file of fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".json")).sort()) {
  const s: AssetSeries = JSON.parse(fs.readFileSync(path.join(OUT_DIR, file), "utf8"));
  const rows = s.rows;
  const last = rows[rows.length - 1];
  console.log(`\n${s.id} (${s.kind}) ${rows[0].month} .. ${last.month}, ${rows.length} rows`);

  const expected = monthRange(rows[0].month, last.month);
  if (expected.length !== rows.length) fail(`expected ${expected.length} months, got ${rows.length}`);
  rows.forEach((r, i) => {
    if (r.month !== expected[i]) fail(`month ${i} is ${r.month}, expected ${expected[i]}`);
    if (!Number.isFinite(r.price) || r.price <= 0) fail(`${r.month} bad price ${r.price}`);
    if (!Number.isFinite(r.income) || r.income < 0) fail(`${r.month} bad income ${r.income}`);
  });

  let best = { m: "", r: 0 };
  let worst = { m: "", r: 0 };
  let hi = rows[0];
  let lo = rows[0];
  for (let i = 1; i < rows.length; i++) {
    const ret = rows[i].price / rows[i - 1].price - 1;
    if (Math.abs(ret) > MAX_MONTHLY_MOVE[s.kind]) {
      // Stocks really do crash this hard; flag for a human, don't fail the build.
      if (s.kind === "stock") console.warn(`  WARN ${rows[i].month} moved ${pct(ret)} in one month`);
      else fail(`${rows[i].month} moved ${pct(ret)} in one month`);
    }
    if (ret > best.r) best = { m: rows[i].month, r: ret };
    if (ret < worst.r) worst = { m: rows[i].month, r: ret };
    if (rows[i].price > hi.price) hi = rows[i];
    if (rows[i].price < lo.price) lo = rows[i];
  }
  const totalIncome = rows.reduce((a, r) => a + r.income, 0);
  console.log(
    `  price  first ${rows[0].price.toFixed(2)}  last ${last.price.toFixed(2)}  high ${hi.price.toFixed(2)} (${hi.month})  low ${lo.price.toFixed(2)} (${lo.month})`,
  );
  console.log(`  month  best ${pct(best.r)} (${best.m})  worst ${pct(worst.r)} (${worst.m})`);
  console.log(`  income paid over whole period per initial unit: ${totalIncome.toFixed(2)}`);

  if (s.kind === "bond") {
    const ys = rows.map((r) => r.extra!.yield);
    const maxI = ys.indexOf(Math.max(...ys));
    const minI = ys.indexOf(Math.min(...ys));
    console.log(
      `  yield  first ${pct(ys[0])}  last ${pct(ys[ys.length - 1])}  high ${pct(ys[maxI])} (${rows[maxI].month})  low ${pct(ys[minI])} (${rows[minI].month})`,
    );
    // Total return with income reinvested, as a plausibility check against published index returns.
    let units = 1;
    for (let i = 1; i < rows.length; i++) units += (units * rows[i].income) / rows[i].price;
    const years = (rows.length - 1) / 12;
    const cagr = ((units * last.price) / rows[0].price) ** (1 / years) - 1;
    console.log(`  total return with income reinvested: ${pct(cagr)} p.a. over ${years.toFixed(1)} years`);
  }
}
console.log(failures ? `\n${failures} failure(s)` : "\nall checks passed");
process.exit(failures ? 1 : 0);
