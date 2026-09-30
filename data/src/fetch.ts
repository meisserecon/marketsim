/**
 * Downloads raw source files into data/raw. Raw files are committed so the build is
 * reproducible even if a source disappears (FRED already dropped its LBMA gold series).
 *
 *   tsx src/fetch.ts            fetch everything
 *   tsx src/fetch.ts stocks     only Yahoo stocks
 *   tsx src/fetch.ts fred gold  only those groups
 */
import fs from "node:fs";
import path from "node:path";
import { RAW_DIR } from "./lib/paths.js";
import { UNIVERSE } from "./universe.js";

const FRED_SERIES = [
  "DGS1", "DGS5", "DGS10", // daily constant-maturity treasury yields, percent
  "DEXSZUS", "DEXJPUS", // CHF per USD, JPY per USD, daily
];
const GOLD_URL = "https://datahub.io/core/gold-prices/r/monthly.csv"; // LBMA monthly average, USD/oz

const groups = new Set(process.argv.slice(2));
const want = (g: string) => groups.size === 0 || groups.has(g);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function downloadCsv(url: string, file: string) {
  const res = await fetch(url, { headers: { "user-agent": "marketsim-data/0.1" } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  const text = await res.text();
  if (text.trimStart().startsWith("<")) throw new Error(`${url} returned HTML, not CSV`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  console.log(`${path.relative(RAW_DIR, file)}: ${text.split("\n").length - 1} lines`);
}

/** Yahoo daily chart reduced to month-end close and dividends per month (by ex-date). */
async function fetchYahooMonthly(ticker: string, file: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?period1=0&period2=9999999999&interval=1d&events=div,splits`;
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`${ticker}: HTTP ${res.status}`);
  const json: any = await res.json();
  const r = json?.chart?.result?.[0];
  if (!r) throw new Error(`${ticker}: ${json?.chart?.error?.description ?? "no result"}`);

  const tz: string = r.meta.exchangeTimezoneName ?? "America/New_York";
  const monthOf = (unix: number) => {
    // Month in the exchange's local time so a late-evening UTC timestamp doesn't spill into the next month.
    const d = new Date(unix * 1000);
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit" }).formatToParts(d);
    return `${parts.find((p) => p.type === "year")!.value}-${parts.find((p) => p.type === "month")!.value}`;
  };

  const ts: number[] = r.timestamp ?? [];
  const closes: (number | null)[] = r.indicators?.quote?.[0]?.close ?? [];
  const close = new Map<string, number>();
  for (let i = 0; i < ts.length; i++) if (closes[i] != null) close.set(monthOf(ts[i]), closes[i]!);

  const div = new Map<string, number>();
  for (const d of Object.values<any>(r.events?.dividends ?? {})) {
    const m = monthOf(d.date);
    div.set(m, (div.get(m) ?? 0) + d.amount);
  }

  const months = [...close.keys()].sort();
  const lines = ["month,close,dividend,currency", ...months.map((m) => `${m},${close.get(m)},${div.get(m) ?? 0},${r.meta.currency}`)];
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, lines.join("\n") + "\n");
  console.log(`${path.relative(RAW_DIR, file)}: ${months[0]} .. ${months[months.length - 1]}, ${months.length} months, ${div.size} dividend months, ${r.meta.currency}`);
}

if (want("fred")) {
  for (const id of FRED_SERIES) {
    await downloadCsv(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`, path.join(RAW_DIR, "fred", `${id}.csv`));
  }
}
if (want("gold")) await downloadCsv(GOLD_URL, path.join(RAW_DIR, "gold", "lbma_monthly.csv"));
if (want("stocks")) {
  for (const s of UNIVERSE) {
    if (s.source !== "yahoo") continue;
    await fetchYahooMonthly(s.ticker!, path.join(RAW_DIR, "yahoo", `${s.id}.csv`));
    await sleep(300);
  }
}
