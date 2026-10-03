// Checks story-arc beats files against the rules in README.md.
//
//   node data/news/arcs/check-beats.mjs [id ...]     (default: every <id>.beats.json here)
//
// - the file parses and is an array with the required fields
// - months are YYYY-MM and ascend (equal months allowed)
// - assets name companies in the game by that month (listed / first data month .. end month)
// - importance is 1, 2 or 3
// - a move names a known asset and roughly matches the monthly change in data/out (or the S&P 500 / gold)
// - every "Biggest months" entry of a company in movers.md is a beat with that move, or is listed
//   under "## Unexplained moves" in <id>.md
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const out = path.join(root, "data/out");

// universe: id, listed, end month
const uni = fs.readFileSync(path.join(root, "data/src/universe.ts"), "utf8");
const assets = {};
for (const line of uni.split("\n")) {
  const id = line.match(/\{\s*id:\s*"([^"]+)"/);
  if (!id) continue;
  const listed = line.match(/listed:\s*"(\d{4}-\d\d)"/);
  const end = line.match(/end:\s*\{\s*month:\s*"(\d{4}-\d\d)"/);
  const file = path.join(out, id[1] + ".json");
  const rows = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")).rows : [];
  const first = rows.length ? rows[0].month : "9999-99";
  assets[id[1]] = {
    from: listed && listed[1] > first ? listed[1] : first,
    to: end ? end[1] : "9999-99",
    rows,
  };
}

function monthlyChange(rows, month) {
  const i = rows.findIndex((r) => r.month === month);
  if (i < 1) return null;
  return (rows[i].price / rows[i - 1].price - 1) * 100;
}
function refChange(id, month) {
  // sp500 and gold: take the figure from movers.md if listed there, else from the reference files when present
  const f = id === "sp500" ? path.join(root, "data/reference/sp500.json") : path.join(out, "gold.json");
  if (!fs.existsSync(f)) return null;
  const j = JSON.parse(fs.readFileSync(f, "utf8"));
  const rows = Array.isArray(j) ? j : j.rows || [];
  const key = rows.length && "close" in rows[0] ? "close" : "price";
  const r = rows.map((x) => ({ month: x.month, price: x[key] }));
  return monthlyChange(r, month);
}

// movers.md: biggest months per company
const movers = fs.readFileSync(path.join(here, "movers.md"), "utf8");
const biggest = {};
for (const sec of movers.split(/^### /m).slice(1)) {
  const id = sec.match(/^([a-z0-9-]+):/);
  if (!id) continue;
  const part = sec.split("Biggest months:")[1];
  if (!part) continue;
  biggest[id[1]] = [...part.matchAll(/^- (\d{4}-\d\d): ([+-]\d+)%/gm)].map((m) => ({ month: m[1], pct: +m[2] }));
}

let ids = process.argv.slice(2);
if (!ids.length) ids = fs.readdirSync(here).filter((f) => f.endsWith(".beats.json")).map((f) => f.replace(".beats.json", ""));

let errors = 0;
const err = (id, msg) => { errors++; console.log(`  ERROR ${id}: ${msg}`); };
for (const id of ids) {
  const file = path.join(here, id + ".beats.json");
  console.log(`${id}`);
  let beats;
  try { beats = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { err(id, "does not parse: " + e.message); continue; }
  if (!Array.isArray(beats)) { err(id, "not an array"); continue; }
  let prev = "";
  const imp = { 1: 0, 2: 0, 3: 0 };
  beats.forEach((b, i) => {
    const at = `#${i} ${b.month} ${b.title}`;
    for (const k of ["month", "title", "what", "why", "assets", "importance", "source"]) if (b[k] === undefined) err(id, `${at}: missing ${k}`);
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(b.month)) err(id, `${at}: bad month`);
    if (b.month < prev) err(id, `${at}: months not ascending (after ${prev})`);
    prev = b.month;
    if (![1, 2, 3].includes(b.importance)) err(id, `${at}: importance ${b.importance}`);
    else imp[b.importance]++;
    for (const a of b.assets || []) {
      const u = assets[a];
      if (!u) err(id, `${at}: unknown asset ${a}`);
      else if (b.month < u.from || b.month > u.to) err(id, `${at}: ${a} not in the game in ${b.month} (${u.from}..${u.to})`);
    }
    if (b.move) {
      const { asset, pct } = b.move;
      let actual = null;
      if (asset === "sp500" || asset === "gold") actual = refChange(asset, b.month);
      else if (!assets[asset]) err(id, `${at}: move names unknown asset ${asset}`);
      else actual = monthlyChange(assets[asset].rows, b.month);
      if (typeof pct !== "number") err(id, `${at}: move pct not a number`);
      else if (actual !== null && Math.abs(actual - pct) > 1.5) err(id, `${at}: move ${pct}% but data says ${actual.toFixed(1)}%`);
    }
  });
  console.log(`  ${beats.length} beats; importance 1/2/3: ${imp[1]}/${imp[2]}/${imp[3]}`);

  // coverage of biggest months
  const big = biggest[id];
  if (big) {
    const md = fs.existsSync(path.join(here, id + ".md")) ? fs.readFileSync(path.join(here, id + ".md"), "utf8") : "";
    const unexplained = (md.split(/^## Unexplained moves/m)[1] || "").split(/^## /m)[0];
    for (const m of big) {
      const beat = beats.find((b) => b.month === m.month && b.move && b.move.asset === id);
      if (beat) continue;
      if (unexplained.includes(m.month)) { console.log(`  unexplained: ${m.month} ${m.pct > 0 ? "+" : ""}${m.pct}%`); continue; }
      err(id, `biggest month ${m.month} (${m.pct}%) has no beat with a move and is not under Unexplained moves`);
    }
    // gaps of more than two years
    const end = assets[id] ? (assets[id].to === "9999-99" ? assets[id].rows.at(-1).month : assets[id].to) : prev;
    const toN = (m) => +m.slice(0, 4) * 12 + +m.slice(5, 7);
    let last = beats.length ? beats[0].month : null;
    for (const b of beats.slice(1).concat([{ month: end }])) {
      if (toN(b.month) - toN(last) > 24) console.log(`  note: gap of ${toN(b.month) - toN(last)} months between ${last} and ${b.month}`);
      last = b.month;
    }
  }
}
console.log(errors ? `\n${errors} error(s)` : "\nOK");
process.exit(errors ? 1 : 0);
