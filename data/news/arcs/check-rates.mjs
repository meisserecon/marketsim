// Checks data/news/arcs/rates.beats.json against the README rules and movers.md.
// Run from the repo root: node data/news/arcs/check-rates.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const errors = [];
const beats = JSON.parse(read("data/news/arcs/rates.beats.json"));
const md = read("data/news/arcs/rates.md");
const movers = read("data/news/arcs/movers.md");

// Price series for checking the move percentages.
const series = { sp500: JSON.parse(read("data/reference/sp500.json")).rows };
for (const f of fs.readdirSync(path.join(root, "data/out"))) {
  if (f === "gold.json" || /^ust\d+\.json$/.test(f)) series[f.replace(".json", "")] = JSON.parse(read("data/out/" + f)).rows;
}
const change = (asset, month) => {
  const rows = series[asset];
  if (!rows) return null;
  const i = rows.findIndex((r) => r.month === month);
  if (i < 1) return null;
  return (rows[i].price / rows[i - 1].price - 1) * 100;
};

// 1. Format: fields, ascending months, importance 1 to 3, move matches the data.
let prev = "";
const counts = { 1: 0, 2: 0, 3: 0 };
beats.forEach((b, i) => {
  const at = `beat ${i} (${b.month})`;
  for (const k of ["month", "title", "what", "why", "assets", "importance", "source"]) if (b[k] === undefined) errors.push(`${at}: missing ${k}`);
  if (!/^\d{4}-\d{2}$/.test(b.month)) errors.push(`${at}: bad month`);
  if (b.month < prev) errors.push(`${at}: months not ascending (${prev} before ${b.month})`);
  prev = b.month;
  if (![1, 2, 3].includes(b.importance)) errors.push(`${at}: importance ${b.importance}`);
  else counts[b.importance]++;
  if (!Array.isArray(b.assets)) errors.push(`${at}: assets not an array`);
  if (!/read \d{4}-\d{2}-\d{2}/.test(b.source)) errors.push(`${at}: source without read date`);
  if (b.move) {
    const c = change(b.move.asset, b.month);
    if (c === null) errors.push(`${at}: no data for move asset ${b.move.asset}`);
    else if (Math.abs(c - b.move.pct) > 1) errors.push(`${at}: move ${b.move.asset} ${b.move.pct}% but data says ${c.toFixed(1)}%`);
  }
});

// 2. Coverage: every market month of 8% or more in movers.md is classified, and the theme's months
//    have a beat with an sp500 move or are listed under "Unexplained moves".
const theme = ["1980-03", "1982-08", "1982-10", "1984-08", "1986-09", "1987-10", "1989-07", "1990-05", "1991-12", "1998-08", "1998-10",
  "2001-04", "2018-12", "2019-01", "2020-04", "2022-04", "2022-06", "2022-07", "2022-09", "2022-10", "2023-11"];
const otherArcs = ["1980-11", "1987-01", "1987-11", "1990-08", "1997-07", "2000-03", "2000-11", "2001-02", "2001-09", "2001-11", "2002-07",
  "2002-09", "2002-10", "2003-04", "2008-06", "2008-09", "2008-10", "2009-01", "2009-02", "2009-03", "2009-04", "2010-05", "2010-09",
  "2011-10", "2015-10", "2020-02", "2020-03", "2020-11", "2026-04"];
const unexplained = md.split("## Unexplained moves")[1]?.split("\n## ")[0] ?? "";
const big = [...movers.matchAll(/^- (\d{4}-\d{2}): market ([+-]\d+)%/gm)].filter((m) => Math.abs(+m[2]) >= 8).map((m) => m[1]);
for (const m of big) {
  if (theme.includes(m)) {
    const ok = beats.some((b) => b.month === m && b.move?.asset === "sp500") || unexplained.includes(m);
    if (!ok) errors.push(`market month ${m}: no beat with an sp500 move and not under Unexplained moves`);
  } else if (!otherArcs.includes(m)) errors.push(`market month ${m}: not classified as theme or other arc`);
}

// 3. Gold's biggest months.
const goldBlock = movers.split("Gold, biggest months:")[1].split("\n## ")[0];
for (const [, m] of goldBlock.matchAll(/^- (\d{4}-\d{2}):/gm)) {
  const ok = beats.some((b) => b.month === m && b.move?.asset === "gold") || unexplained.includes(m);
  if (!ok) errors.push(`gold month ${m}: no beat with a gold move and not under Unexplained moves`);
}

console.log(`${beats.length} beats; importance 1: ${counts[1]}, 2: ${counts[2]}, 3: ${counts[3]}`);
console.log(`market months >= 8%: ${big.length}, of which theme: ${big.filter((m) => theme.includes(m)).length}`);
if (errors.length) {
  console.log(errors.join("\n"));
  process.exit(1);
}
console.log("OK");
