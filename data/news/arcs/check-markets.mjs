// Checks markets.beats.json: parses, months ascend, assets in the game that month, importance 1-3,
// sp500 moves match the data, and every S&P 500 month of +-8% or more (rounded, as in movers.md)
// has a beat with a sp500 move or is listed under "Unexplained moves" in markets.md.
// Run from the repo root: node data/news/arcs/check-markets.mjs
import fs from "node:fs";
import path from "node:path";

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const root = path.resolve(dir, "../../..");
const beats = JSON.parse(fs.readFileSync(path.join(dir, "markets.beats.json"), "utf8"));
const md = fs.readFileSync(path.join(dir, "markets.md"), "utf8");
const sp = JSON.parse(fs.readFileSync(path.join(root, "data/reference/sp500.json"), "utf8")).rows;
const errors = [];

// asset windows from data/out
const outDir = path.join(root, "data/out");
const windows = {};
for (const f of fs.readdirSync(outDir).filter((f) => f.endsWith(".json"))) {
  const a = JSON.parse(fs.readFileSync(path.join(outDir, f), "utf8"));
  const first = a.listed && a.listed > a.rows[0].month ? a.listed : a.rows[0].month;
  windows[a.id] = { first, last: a.rows[a.rows.length - 1].month };
}

// monthly changes
const change = {};
for (let i = 1; i < sp.length; i++) change[sp[i].month] = (sp[i].price / sp[i - 1].price - 1) * 100;
const round = (x) => Number(x.toFixed(0));

let prev = "";
const counts = { 1: 0, 2: 0, 3: 0 };
beats.forEach((b, i) => {
  const id = `#${i} ${b.month} "${b.title}"`;
  if (!/^\d{4}-\d{2}$/.test(b.month)) errors.push(`${id}: bad month`);
  if (b.month < prev) errors.push(`${id}: months not ascending`);
  prev = b.month;
  for (const k of ["title", "what", "why", "source"]) if (!b[k] || typeof b[k] !== "string") errors.push(`${id}: missing ${k}`);
  if (![1, 2, 3].includes(b.importance)) errors.push(`${id}: importance ${b.importance}`);
  else counts[b.importance]++;
  if (!Array.isArray(b.assets)) errors.push(`${id}: assets not an array`);
  for (const a of b.assets ?? []) {
    const w = windows[a];
    if (!w) errors.push(`${id}: unknown asset ${a}`);
    else if (b.month < w.first || b.month > w.last) errors.push(`${id}: ${a} not in the game in ${b.month} (${w.first}..${w.last})`);
  }
  if (b.move) {
    if (b.move.asset === "sp500") {
      const c = change[b.month];
      if (c === undefined) errors.push(`${id}: no sp500 data`);
      else if (round(c) !== b.move.pct) errors.push(`${id}: move ${b.move.pct} but sp500 changed ${c.toFixed(2)}%`);
    } else if (b.move.asset !== "gold" && !windows[b.move.asset]) errors.push(`${id}: unknown move asset`);
  }
});

// coverage of big market months
const unexplainedSection = (md.split(/^## Unexplained moves/m)[1] ?? "").split(/^## /m)[0];
const unexplained = new Set(unexplainedSection.match(/\d{4}-\d{2}/g) ?? []);
const explained = new Set(beats.filter((b) => b.move?.asset === "sp500").map((b) => b.month));
const big = Object.entries(change).filter(([m, c]) => m >= "1979-12" && Math.abs(round(c)) >= 8);
for (const [m, c] of big) if (!explained.has(m) && !unexplained.has(m)) errors.push(`big month ${m} (${c.toFixed(1)}%) has no beat and is not listed as unexplained`);

// year-end beats
const lastMonth = sp[sp.length - 1].month;
for (let y = 1980; y < Number(lastMonth.slice(0, 4)); y++) {
  if (!beats.some((b) => b.month === `${y}-12`)) errors.push(`no year-end beat for ${y}`);
}

console.log(`${beats.length} beats; importance 1/2/3: ${counts[1]}/${counts[2]}/${counts[3]}; big months: ${big.length} (${big.filter(([m]) => explained.has(m)).length} with a beat, ${big.filter(([m]) => !explained.has(m) && unexplained.has(m)).length} unexplained)`);
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("OK");
