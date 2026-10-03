// Checks arc beats files: node data/news/arcs/check-arcs.mjs [id ...]
// - each <id>.beats.json parses and is an array
// - months ascend (YYYY-MM, non-decreasing)
// - assets only name companies in the game by that month (data/out/<id>.json first to last row)
// - importance is 1, 2 or 3; required fields present
// - move.pct matches the actual monthly change within 1 point
// - every "Biggest months" entry of a company arc in movers.md is a beat with a move
//   or listed under "## Unexplained moves" in <id>.md
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(dir, "..", "..", "out");
const refDir = path.join(dir, "..", "..", "reference");

const series = {};
function load(id) {
  if (id in series) return series[id];
  let f = path.join(outDir, `${id}.json`);
  if (!fs.existsSync(f)) f = path.join(refDir, `${id}.json`);
  if (!fs.existsSync(f)) return (series[id] = null);
  const j = JSON.parse(fs.readFileSync(f, "utf8"));
  const rows = (j.rows || j).map((r) => ({ month: r.month, price: r.price ?? r.close ?? r.value }));
  return (series[id] = rows);
}
function pct(id, month) {
  const rows = load(id);
  if (!rows) return null;
  const i = rows.findIndex((r) => r.month === month);
  if (i <= 0) return null;
  return (rows[i].price / rows[i - 1].price - 1) * 100;
}

const movers = fs.readFileSync(path.join(dir, "movers.md"), "utf8");
function biggestMonths(id) {
  const start = movers.search(new RegExp(`^### ${id.replace(/[-]/g, "\\-")}:`, "m"));
  if (start < 0) return [];
  const rest = movers.slice(start + 4);
  const end = rest.search(/^##+ /m);
  const sec = end < 0 ? rest : rest.slice(0, end);
  return [...sec.matchAll(/^- (\d{4}-\d{2}): ([+-]?\d+)%/gm)].map((m) => ({ month: m[1], pct: +m[2] }));
}

const ids = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(dir).filter((f) => f.endsWith(".beats.json")).map((f) => f.replace(".beats.json", ""));

let errors = 0;
const err = (id, msg) => { errors++; console.log(`  ERROR ${id}: ${msg}`); };

for (const id of ids) {
  console.log(`== ${id}`);
  let beats;
  try {
    beats = JSON.parse(fs.readFileSync(path.join(dir, `${id}.beats.json`), "utf8"));
  } catch (e) {
    err(id, `does not parse: ${e.message}`);
    continue;
  }
  if (!Array.isArray(beats)) { err(id, "not an array"); continue; }
  let prev = "";
  const counts = { 1: 0, 2: 0, 3: 0 };
  for (const b of beats) {
    const tag = `${b.month} "${b.title}"`;
    for (const k of ["month", "title", "what", "why", "assets", "importance", "source"]) if (b[k] === undefined) err(id, `${tag}: missing ${k}`);
    if (!/^\d{4}-\d{2}$/.test(b.month)) err(id, `${tag}: bad month`);
    if (b.month < prev) err(id, `${tag}: month before previous ${prev}`);
    prev = b.month;
    if (![1, 2, 3].includes(b.importance)) err(id, `${tag}: importance ${b.importance}`);
    else counts[b.importance]++;
    if (!/read \d{4}-\d{2}-\d{2}|price series|listed \d{4}/.test(b.source || "")) err(id, `${tag}: source without read date`);
    for (const a of b.assets || []) {
      const rows = load(a);
      if (!rows) { err(id, `${tag}: unknown asset ${a}`); continue; }
      if (b.month < rows[0].month || b.month > rows[rows.length - 1].month) err(id, `${tag}: asset ${a} not in game (${rows[0].month} to ${rows[rows.length - 1].month})`);
    }
    if (b.move) {
      const p = pct(b.move.asset, b.month);
      if (p === null) err(id, `${tag}: no price change for ${b.move.asset}`);
      else if (Math.abs(p - b.move.pct) > 1) err(id, `${tag}: move ${b.move.pct} but actual ${p.toFixed(1)}`);
    }
  }
  const mdPath = path.join(dir, `${id}.md`);
  const md = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, "utf8") : "";
  if (!md) err(id, "missing .md");
  const um = md.split(/^## Unexplained moves/m)[1]?.split(/^## /m)[0] ?? "";
  const unexplained = [];
  for (const bm of biggestMonths(id)) {
    const hasBeat = beats.some((b) => b.month === bm.month && b.move && b.move.asset === id);
    const listed = um.includes(bm.month);
    if (!hasBeat && !listed) err(id, `biggest month ${bm.month} (${bm.pct}%) neither a beat with move nor under Unexplained moves`);
    if (!hasBeat && listed) unexplained.push(`${bm.month} (${bm.pct > 0 ? "+" : ""}${bm.pct}%)`);
  }
  const years = beats.map((b) => +b.month.slice(0, 4));
  for (let i = 1; i < years.length; i++) if (years[i] - years[i - 1] > 2) console.log(`  note: gap of ${years[i] - years[i - 1]} years between beats ${years[i - 1]} and ${years[i]}`);
  console.log(`  ${beats.length} beats; importance 1/2/3: ${counts[1]}/${counts[2]}/${counts[3]}; unexplained biggest months: ${unexplained.join(", ") || "none"}`);
}
console.log(errors ? `\n${errors} error(s)` : "\nOK");
process.exit(errors ? 1 : 0);
