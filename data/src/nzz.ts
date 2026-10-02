/**
 * Assembles the hand-read NZZ month-end quotes (data/manual/raw/nzz-readings*.csv, raw printed
 * prices) into series files in data/manual. Run with `npm run nzz -w data` after readings change.
 *
 * Decisions encoded here (see DESIGN.md, "Data sourcing decisions"):
 *  - Swiss companies use the bearer share (class I) until the paper stops listing it, then the
 *    registered share (class N), on one continuous share basis.
 *  - Splits and nominal changes are applied as divisors per period. Each one is documented with
 *    the evidence found in the paper (restated year range, or a constant ratio between classes).
 *  - Nothing is interpolated. Months without a reading are simply absent; the build fills gaps of
 *    up to two months with the previous price and fails on longer ones.
 */
import fs from "node:fs";
import path from "node:path";
import { DATA_DIR, RAW_DIR } from "./lib/paths.js";
import { readCsv } from "./lib/csv.js";

const MANUAL = path.join(DATA_DIR, "manual");
const READINGS_DIR = path.join(MANUAL, "raw");

// Later files override earlier ones for the same (series, class, month): second readings and
// focused double-read files come after the first, partly single-read, passes.
const FILES = [
  "nzz-readings-1979-1982.csv",
  "nzz-readings-1983-1985.csv",
  "nzz-readings-1983a-second.csv",
  "nzz-readings-1984b-second.csv",
  "nzz-readings-1986-1988.csv",
  "nzz-readings-1986.csv",
  "nzz-readings-1987.csv",
  "nzz-readings-1988.csv",
  "nzz-readings-1989-1991.csv",
  "nzz-readings-1992-1994.csv",
  "nzz-readings-1995-1998.csv",
  "nzz-readings.csv",
  "nzz-readings-holes.csv",
  "nzz-readings-gaps.csv",
  "nzz-readings-decisions.csv",
];

interface Reading { series: string; cls: string; month: string; price: number; currency: string; quoteDate: string; file: string }

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false; } else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

/** The agents used slightly different labels; normalise them. */
function normSeries(s: string) { const t = s.trim().toLowerCase(); return t === "sbg" ? "ubs" : t; }
function normClass(c: string) {
  const t = c.trim().replace(/^SBG\s+/i, "");
  if (["ordinary", "common", ""].includes(t)) return "";
  if (t === "I+PS" || t === "A") return "I"; // Kreditanstalt printed bearer share and PS on one line
  if (t === "N+PS") return "N";
  return t;
}

function loadReadings(): Map<string, Reading> {
  const best = new Map<string, Reading>();
  for (const f of FILES) {
    const file = path.join(READINGS_DIR, f);
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, "utf8").replace(/﻿/g, "");
    const rows = parseCsv(text.split("\n").filter((l) => !l.startsWith("#")).join("\n"));
    const head = rows[0].map((h) => h.trim());
    const col = (n: string) => head.indexOf(n);
    for (const r of rows.slice(1)) {
      if (r.length < 6 || !r[col("series")]?.trim()) continue;
      const price = Number(String(r[col("price_as_printed")]).replace(/[^0-9.]/g, ""));
      if (!Number.isFinite(price) || price <= 0) continue;
      const rd: Reading = {
        series: normSeries(r[col("series")]), cls: normClass(r[col("share_class")]), month: r[col("month")].trim(), price,
        currency: r[col("currency")].trim().replace(/^DM$/, "DEM"), quoteDate: r[col("quote_date")].trim(), file: f,
      };
      best.set(`${rd.series}|${rd.cls}|${rd.month}`, rd);
    }
  }
  return best;
}

interface Segment { cls: string; from?: string; until?: string; divisor: number }
interface Spec {
  id: string;
  series: string;
  currency: string;
  segments: Segment[];
  /** Readings known to be wrong in the paper or unverifiable; left out. */
  exclude?: Record<string, string>;
  header: string[];
  /** Rows from a file in data/manual/raw to append after the NZZ part (kept as they are). */
  appendFrom?: { file: string; from: string };
}

// Divisors: Deutsche Mark to the euro-equivalent basis of the online Daimler series, established on
// 30 December 1987 (NZZ 575 DM = onvista 24.4072) and exact in every later month compared.
const DAIMLER_DM_PER_UNIT = 23.5586;

const SPECS: Spec[] = [
  {
    id: "nestle", series: "nestle", currency: "CHF",
    segments: [
      { cls: "I", until: "1992-08", divisor: 1000 },
      { cls: "I", from: "1992-09", until: "1993-05", divisor: 100 },
      { cls: "N", from: "1993-06", until: "1993-06", divisor: 100 }, // overlap row for the switch to Yahoo
    ],
    header: [
      "Nestlé bearer share (Inhaberaktie), month-end close in CHF on the share basis of Yahoo's NESN.SW series.",
      "Divisors: 1000 until August 1992, 100 from September 1992. Evidence: the paper shows the bearer share at 9120 on 31.8.1992 and 976 on 30.9.1992",
      "with the year range restated (1-for-10 split); Yahoo's series equals the printed registered price / 1000 before and / 100 after, in every month compared.",
      "The share classes were unified between 3 May and 30 June 1993; the last row (1993-06) is the unified registered share and serves as the overlap",
      "check for the switch to Yahoo. Before 17 November 1988 the registered share was closed to foreigners and traded at about half the bearer price.",
    ],
  },
  {
    id: "ubs", series: "ubs", currency: "CHF",
    segments: [
      { cls: "I", until: "1992-06", divisor: 25 * 12.079 },
      { cls: "I", from: "1992-07", until: "1998-05", divisor: 5 * 12.079 },
      { cls: "N", from: "1998-06", until: "1998-06", divisor: 12.079 }, // overlap row for the switch to Yahoo
    ],
    header: [
      "Schweizerische Bankgesellschaft (SBG) bearer share, month-end close in CHF on the share basis of Yahoo's UBSG.SW series.",
      "Yahoo's series is the registered share / 12.079 (constant over the 28 months September 1996 to February 1998 and again from June 1998).",
      "The bearer share is five registered shares (ratio 5.00 in every month of 1998 read; nominal CHF 100 against CHF 20), so the divisor is 5 x 12.079",
      "from July 1992. Until June 1992 a further 5: the paper shows the bearer share at 3570 on 30.6.1992 and 701 on 31.7.1992 with the year range restated.",
      "In the June 1998 merger with Bankverein a bearer share became five shares of the new UBS; the last row (1998-06) is the new UBS share and",
      "serves as the overlap check for the switch to Yahoo.",
    ],
  },
  {
    id: "sbv", series: "sbv", currency: "CHF",
    segments: [
      { cls: "I", until: "1996-04", divisor: 2 },
      { cls: "N", from: "1996-05", divisor: 1 },
    ],
    header: [
      "Schweizerischer Bankverein (SBV) bearer share until April 1996, then the registered share, month-end close in CHF on the basis of the",
      "registered share of 1996-1998. The bearer share (nominal CHF 100) is two registered shares (CHF 50): the printed ratio is 2.00 from 1993 on.",
      "The paper stops listing the bearer share after April 1996. Last quote 535 on 29.5.1998; from 30.6.1998 only the new UBS share is listed.",
    ],
  },
  {
    id: "swissair", series: "swissair", currency: "CHF",
    segments: [
      { cls: "I", until: "1993-04", divisor: 5 },
      { cls: "N", from: "1993-05", until: "1998-04", divisor: 5 },
      { cls: "N", from: "1998-05", divisor: 1 },
    ],
    header: [
      "Swissair (from 1997 SAirGroup): bearer share until April 1993, then the registered share, month-end close in CHF on the share basis of 2001.",
      "Divisor 5 until April 1998: the paper shows the registered share at 1962 on 30.4.1998 and 453 on 29.5.1998 with the year range restated",
      "from 2170/1815 to 457/363 (1-for-5 split). Bearer and registered shares had the same nominal value and traded within a few percent of each other.",
      "March 1999 is missing (the issue prints only an intraday snapshot). Dividends were not collected.",
    ],
  },
  {
    id: "sandoz", series: "sandoz", currency: "CHF",
    segments: [
      { cls: "I", until: "1991-04", divisor: 25 },
      { cls: "I", from: "1991-05", until: "1994-05", divisor: 5 },
      { cls: "I", from: "1994-06", divisor: 1 },
    ],
    header: [
      "Sandoz bearer share, month-end close in CHF on the share basis of 1996.",
      "Divisors: 25 until April 1991, 5 until May 1994. Evidence: the registered share goes from 11500 (30.4.1991) to 2400 (31.5.1991) with the year range",
      "restated, and the bearer share is printed at 10800 on 30.3.1990 and at 2470 on 31.7.1991; then 3710 (29.4.1994) to 718 (30.6.1994), year range restated.",
      "Last quote 1518 on 29.11.1996, before the merger with Ciba-Geigy into Novartis.",
    ],
  },
  {
    id: "ciba-geigy", series: "ciba-geigy", currency: "CHF",
    segments: [
      { cls: "I", until: "1992-06", divisor: 5 },
      { cls: "I", from: "1992-07", divisor: 1 },
    ],
    header: [
      "Ciba-Geigy bearer share, month-end close in CHF on the share basis of 1996.",
      "Divisor 5 until June 1992: the paper shows 3320 on 30.6.1992 and 662 on 31.7.1992 with the year range restated (1-for-5 split).",
      "Last quote 1611 on 29.11.1996, before the merger with Sandoz into Novartis.",
    ],
  },
  {
    id: "ibj", series: "ibj", currency: "JPY",
    segments: [{ cls: "", divisor: 1 }],
    header: [
      "Industrial Bank of Japan, month-end close in yen as printed in the NZZ's Tokyo list. No adjustment: no split is visible in the printed quotes.",
      "The NZZ does not list the share before the mid-1980s and drops it after August 2000, shortly before the merger into Mizuho.",
    ],
  },
  {
    id: "mercedes", series: "mercedes", currency: "EUR",
    segments: [{ cls: "", until: "1987-11", divisor: DAIMLER_DM_PER_UNIT }],
    exclude: { "1985-05": "the paper prints 825 against a previous day of 701, with Deutsche Bank on the same line also jumping; probably a misprint" },
    appendFrom: { file: "mercedes-onvista.csv", from: "1987-12" },
    header: [
      "Daimler-Benz, month-end Frankfurt close. Until November 1987: NZZ foreign list in DM, divided by 23.5586 (= 1.95583 DM per EUR x the factor",
      "to the online series, which is exact on 30.12.1987: 575 DM = 24.4072). From December 1987: onvista daily closes, copied from raw/mercedes-onvista.csv,",
      "whose header documents their source, factor and cross-checks (see also raw/mercedes-raw.csv).",
      "Like the online part, the NZZ part is not adjusted for rights issues. Before 1988 the NZZ rounds to whole or half DM and can differ from other",
      "newspapers by up to 1.5 DM. 1985-05 is left out (probable misprint in the paper).",
    ],
  },
];

const readings = loadReadings();
const allMonths = [...new Set([...readings.values()].map((r) => r.month))].sort();

for (const spec of SPECS) {
  const rows: { month: string; price: number }[] = [];
  for (const month of allMonths) {
    if (spec.exclude?.[month]) continue;
    const seg = spec.segments.find((s) => (!s.from || month >= s.from) && (!s.until || month <= s.until) && readings.has(`${spec.series}|${s.cls}|${month}`));
    if (!seg) continue;
    const r = readings.get(`${spec.series}|${seg.cls}|${month}`)!;
    rows.push({ month, price: r.price / seg.divisor });
  }
  if (!rows.length) { console.warn(`${spec.id}: no readings`); continue; }

  const outFile = path.join(MANUAL, `${spec.id}.csv`);
  // The build rejects a series with a gap of more than two months. Hold such a series back
  // (and remove a stale file) instead of emitting something the build cannot use.
  const monthIndex = (m: string) => Number(m.slice(0, 4)) * 12 + Number(m.slice(5, 7));
  let longGap = "";
  for (let i = 1; i < rows.length; i++) {
    if (monthIndex(rows[i].month) - monthIndex(rows[i - 1].month) > 3) longGap = `${rows[i - 1].month} to ${rows[i].month}`;
  }
  if (longGap) {
    if (fs.existsSync(outFile)) fs.rmSync(outFile);
    console.warn(`${spec.id.padEnd(12)} NOT WRITTEN: readings missing from ${longGap}`);
    continue;
  }
  let tail: string[] = [];
  if (spec.appendFrom) {
    tail = readCsv(path.join(READINGS_DIR, spec.appendFrom.file))
      .filter((r) => r.month >= spec.appendFrom!.from)
      .map((r) => `${r.month},${r.price},${r.income || 0}`);
  }
  const round = (x: number) => Number(x.toPrecision(7));
  const lines = [
    "# Generated by data/src/nzz.ts from data/manual/raw/nzz-readings*.csv. Do not edit by hand; change the readings or the spec.",
    ...spec.header.map((h) => "# " + h),
    "# income: dividends were not collected for the NZZ part; the column is 0 there.",
    "month,price,income",
    ...rows.map((r) => `${r.month},${round(r.price)},0`),
    ...tail,
  ];
  fs.writeFileSync(outFile, lines.join("\n") + "\n");

  // Report coverage, gaps and the largest monthly moves so a human can eyeball each series.
  const months = rows.map((r) => r.month);
  const gaps: string[] = [];
  for (let i = 1; i < months.length; i++) {
    const [y0, m0] = months[i - 1].split("-").map(Number), [y1, m1] = months[i].split("-").map(Number);
    const d = (y1 - y0) * 12 + (m1 - m0);
    if (d > 1) gaps.push(`${months[i - 1]}>${months[i]}(${d - 1})`);
  }
  let worst = { m: "", r: 1 }, best = { m: "", r: 1 };
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i].price / rows[i - 1].price;
    if (r < worst.r) worst = { m: rows[i].month, r };
    if (r > best.r) best = { m: rows[i].month, r };
  }
  console.log(`${spec.id.padEnd(12)} ${months[0]}..${months[months.length - 1]} ${rows.length} rows${tail.length ? ` + ${tail.length} appended` : ""}  best ${((best.r - 1) * 100).toFixed(0)}% (${best.m})  worst ${((worst.r - 1) * 100).toFixed(0)}% (${worst.m})  gaps: ${gaps.join(" ") || "none"}`);
}

// --- consistency checks between share classes and against Yahoo ----------------------------------
function ratioReport(label: string, a: string, b: string, from: string, to: string) {
  const vals: number[] = [];
  for (const m of allMonths) {
    if (m < from || m > to) continue;
    const x = readings.get(`${a}|${m}`), y = readings.get(`${b}|${m}`);
    if (x && y) vals.push(x.price / y.price);
  }
  if (!vals.length) return;
  vals.sort((p, q) => p - q);
  console.log(`  ${label}: n=${vals.length} median ${vals[Math.floor(vals.length / 2)].toFixed(3)} range ${vals[0].toFixed(3)}..${vals[vals.length - 1].toFixed(3)}`);
}
function yahooReport(label: string, key: string, yahooId: string, from: string, to: string) {
  const file = path.join(RAW_DIR, "yahoo", `${yahooId}.csv`);
  if (!fs.existsSync(file)) return;
  const y = new Map(readCsv(file).map((r) => [r.month, Number(r.close)]));
  const vals: number[] = [];
  for (const m of allMonths) {
    if (m < from || m > to) continue;
    const x = readings.get(`${key}|${m}`), yv = y.get(m);
    if (x && yv) vals.push(x.price / yv);
  }
  if (!vals.length) return;
  vals.sort((p, q) => p - q);
  console.log(`  ${label}: n=${vals.length} median ${vals[Math.floor(vals.length / 2)].toFixed(4)} range ${vals[0].toFixed(4)}..${vals[vals.length - 1].toFixed(4)}`);
}
console.log("\nclass ratios (bearer / registered), which justify the divisors:");
ratioReport("SBG I/N 1993-1998", "ubs|I", "ubs|N", "1993-01", "1998-05");
ratioReport("SBG I/N 1980-1988", "ubs|I", "ubs|N", "1980-01", "1988-12");
ratioReport("SBV I/N 1993-05..1996-04", "sbv|I", "sbv|N", "1993-05", "1996-04");
ratioReport("SBV I/N 1980-1987", "sbv|I", "sbv|N", "1980-01", "1987-01");
ratioReport("Swissair I/N 1989-1993", "swissair|I", "swissair|N", "1989-01", "1993-04");
ratioReport("Nestlé I/N 1980-1988-10", "nestle|I", "nestle|N", "1980-01", "1988-10");
ratioReport("Nestlé I/N 1988-11..1993-04", "nestle|I", "nestle|N", "1988-11", "1993-04");
ratioReport("Kreditanstalt I/N 1994-1995", "credit-suisse|I", "credit-suisse|N", "1994-01", "1995-05");
console.log("printed price / Yahoo close, which fixes the basis at the switch to Yahoo:");
yahooReport("Nestlé N 1990-01..1992-08", "nestle|N", "nestle", "1990-01", "1992-08");
yahooReport("Nestlé N 1992-09..2001-05", "nestle|N", "nestle", "1992-09", "2001-05");
yahooReport("UBS N 1996-09..1998-02", "ubs|N", "ubs", "1996-09", "1998-02");
yahooReport("UBS N 1998-06..2000-04", "ubs|N", "ubs", "1998-06", "2000-04");
yahooReport("Daimler DM 1996-10..1998-12", "mercedes|", "mercedes", "1996-10", "1998-12");
