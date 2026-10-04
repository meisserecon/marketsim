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
  "DEXSZUS", "DEXJPUS", // CHF per USD, JPY per USD, daily
  "DEXUSUK", // USD per GBP, daily
  "DEXUSEU", // USD per EUR, daily, from 1999
  "EXGEUS", // DEM per USD, monthly average, 1971-2001; used for EUR before 1999 via the fixed 1.95583 DEM/EUR rate
  "FEDFUNDS", "CPIAUCSL", "UNRATE", // the Fed's interest rate (monthly average), consumer prices and unemployment, monthly: for the charts of the interest-rate stories
  "DFEDTAR", "DFEDTARL", "DFEDTARU", "CPIAUCNS", // the Fed's target (a single rate to 2008, a range since) and the headline consumer price index: the numbers quoted in the stories
];
const GOLD_URL = "https://datahub.io/core/gold-prices/r/monthly.csv"; // LBMA monthly average, USD/oz
// Fitted US Treasury zero-coupon yield curve (Gürkaynak, Sack and Wright), daily, Svensson parameters. A Federal Reserve staff research product.
const GSW_URL = "https://www.federalreserve.gov/data/yield-curve-tables/feds200628.csv";

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

/** The daily curve file is 16 MB; keep the last observation of each month and only the six curve parameters. */
async function fetchYieldCurve(file: string) {
  const res = await fetch(GSW_URL, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`${GSW_URL} -> HTTP ${res.status}`);
  const lines = (await res.text()).split(/\r?\n/);
  const headIndex = lines.findIndex((l) => l.startsWith("Date,"));
  if (headIndex < 0) throw new Error("yield curve file has no header row");
  const head = lines[headIndex].split(",");
  const cols = ["BETA0", "BETA1", "BETA2", "BETA3", "TAU1", "TAU2"];
  const idx = cols.map((c) => head.indexOf(c));
  if (idx.some((i) => i < 0)) throw new Error("yield curve file lacks parameter columns");
  const byMonth = new Map<string, string>();
  for (const line of lines.slice(headIndex + 1)) {
    const c = line.split(",");
    if (c.length < head.length || c[0] < "1974-12") continue;
    const vals = idx.map((i) => c[i]);
    if (vals.slice(0, 3).some((v) => v === "NA" || v === "")) continue;
    // TAU2 and BETA3 are absent in the early Nelson-Siegel years; store 0.
    byMonth.set(c[0].slice(0, 7), [c[0], ...vals.map((v) => (v === "NA" || v === "" ? "0" : v))].join(","));
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, ["date," + cols.join(","), ...[...byMonth.values()]].join("\n") + "\n");
  const months = [...byMonth.keys()];
  console.log(`${path.relative(RAW_DIR, file)}: ${months[0]} .. ${months[months.length - 1]}, ${months.length} months`);
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

  // London quotes prices and dividends in pence; normalise to pounds.
  let currency: string = r.meta.currency;
  let scale = 1;
  if (currency === "GBp") { currency = "GBP"; scale = 0.01; }

  const ts: number[] = r.timestamp ?? [];
  const closes: (number | null)[] = r.indicators?.quote?.[0]?.close ?? [];
  const close = new Map<string, number>();
  for (let i = 0; i < ts.length; i++) if (closes[i] != null) close.set(monthOf(ts[i]), closes[i]! * scale);

  // dividend = sum of all distributions with ex-date in the month; maxdiv = the largest single one,
  // which lets the build separate a spin-off booked as a dividend from the regular payout.
  const div = new Map<string, number>();
  const maxDiv = new Map<string, number>();
  for (const d of Object.values<any>(r.events?.dividends ?? {})) {
    const m = monthOf(d.date);
    div.set(m, (div.get(m) ?? 0) + d.amount * scale);
    maxDiv.set(m, Math.max(maxDiv.get(m) ?? 0, d.amount * scale));
  }

  // The running month has no month-end close yet.
  const months = [...close.keys()].sort().filter((m) => m < monthOf(Date.now() / 1000));
  const lines = ["month,close,dividend,maxdiv,currency", ...months.map((m) => `${m},${close.get(m)},${div.get(m) ?? 0},${maxDiv.get(m) ?? 0},${currency}`)];
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
if (want("gsw")) await fetchYieldCurve(path.join(RAW_DIR, "fed", "gsw_monthly.csv"));
// The market itself, for the news and as a benchmark; not an asset of the game.
if (want("index")) await fetchYahooMonthly("^GSPC", path.join(RAW_DIR, "yahoo", "sp500.csv"));
if (want("stocks")) {
  // ONLY=brk,ibm fetches just those, leaving the other raw files as they are.
  const only = process.env.ONLY?.split(",");
  for (const s of UNIVERSE) {
    if (s.source !== "yahoo" || (only && !only.includes(s.id))) continue;
    await fetchYahooMonthly(s.ticker!, path.join(RAW_DIR, "yahoo", `${s.id}.csv`));
    await sleep(300);
  }
}
