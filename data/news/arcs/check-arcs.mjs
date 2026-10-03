// Checks story-arc beats: node data/news/arcs/check-arcs.mjs [id ...]
// Without ids, checks every <id>.beats.json in this folder.
// - each beats file parses and every beat has the required fields
// - months ascend, importance is 1..3
// - assets name only companies in the game by that month (first month of data/out/<id>.json,
//   or `listed` in universe.ts if later) and not after their exit month
// - a beat's move matches the month's price change in data/out (within 1 point)
// - every "Biggest months" entry of the company in movers.md is a beat with that move,
//   or appears under "## Unexplained moves" in <id>.md
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, "../../..");
const uni = fs.readFileSync(path.join(root, "data/src/universe.ts"), "utf8");
const movers = fs.readFileSync(path.join(dir, "movers.md"), "utf8");

let errs = 0;
const bad = (m) => { errs++; console.log("ERR", m); };

const series = {};
function load(id) {
  if (series[id] !== undefined) return series[id];
  const f = path.join(root, "data/out", id + ".json");
  if (!fs.existsSync(f)) return (series[id] = null);
  const d = JSON.parse(fs.readFileSync(f, "utf8"));
  const line = uni.split("\n").find((l) => l.includes(`id: "${id}"`)) ?? "";
  const listed = line.match(/listed: "(\d{4}-\d{2})"/)?.[1];
  const first = d.rows[0].month;
  const change = {};
  for (let i = 1; i < d.rows.length; i++) change[d.rows[i].month] = (d.rows[i].price / d.rows[i - 1].price - 1) * 100;
  return (series[id] = {
    from: listed && listed > first ? listed : first,
    to: d.end?.month ?? d.rows[d.rows.length - 1].month,
    change,
  });
}

function biggest(id) {
  const i = movers.indexOf(`### ${id}:`);
  if (i < 0) return [];
  const sec = movers.slice(i, movers.indexOf("\n### ", i + 5));
  const b = sec.indexOf("Biggest months:");
  if (b < 0) return [];
  return [...sec.slice(b).matchAll(/^- (\d{4}-\d{2}): ([+-]\d+)%/gm)].map((m) => ({ month: m[1], pct: +m[2] }));
}

const ids = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(dir).filter((f) => f.endsWith(".beats.json")).map((f) => f.replace(".beats.json", ""));

for (const id of ids) {
  const f = path.join(dir, id + ".beats.json");
  let beats;
  try { beats = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { bad(`${id}: ${e.message}`); continue; }
  if (!Array.isArray(beats)) { bad(`${id}: not an array`); continue; }
  const imp = { 1: 0, 2: 0, 3: 0 };
  let prev = "";
  for (const b of beats) {
    const tag = `${id} ${b.month} "${b.title}"`;
    for (const k of ["month", "title", "what", "why", "assets", "importance", "source"]) if (b[k] === undefined || b[k] === "") bad(`${tag}: missing ${k}`);
    if (!/^\d{4}-\d{2}$/.test(b.month)) bad(`${tag}: bad month`);
    if (b.month < prev) bad(`${tag}: months not ascending (after ${prev})`);
    prev = b.month;
    if (![1, 2, 3].includes(b.importance)) bad(`${tag}: importance ${b.importance}`);
    else imp[b.importance]++;
    if (!/read 2026-10-03|data\/out|movers\.md/.test(b.source ?? "")) bad(`${tag}: source without read date`);
    for (const a of b.assets ?? []) {
      const s = load(a);
      if (!s) { bad(`${tag}: unknown asset ${a}`); continue; }
      if (b.month < s.from) bad(`${tag}: asset ${a} not in the game before ${s.from}`);
      if (b.month > s.to) bad(`${tag}: asset ${a} left the game in ${s.to}`);
    }
    if (b.move) {
      const s = load(b.move.asset);
      if (!s && !["sp500", "gold"].includes(b.move.asset)) bad(`${tag}: move asset ${b.move.asset} unknown`);
      if (s) {
        const c = s.change[b.month];
        if (c === undefined) bad(`${tag}: no price change for ${b.move.asset} in ${b.month}`);
        else if (Math.abs(c - b.move.pct) > 1) bad(`${tag}: move ${b.move.pct}% but data says ${c.toFixed(1)}%`);
      }
    }
  }
  // biggest months
  const md = fs.existsSync(path.join(dir, id + ".md")) ? fs.readFileSync(path.join(dir, id + ".md"), "utf8") : "";
  if (!md) bad(`${id}: missing ${id}.md`);
  const un = md.includes("## Unexplained moves") ? md.slice(md.indexOf("## Unexplained moves"), md.indexOf("\n## ", md.indexOf("## Unexplained moves") + 5)) : "";
  const left = [];
  for (const { month, pct } of biggest(id)) {
    const hit = beats.find((b) => b.month === month && b.move?.asset === id);
    if (hit) { if (hit.move.pct !== pct) bad(`${id} ${month}: move ${hit.move.pct}% but movers.md says ${pct}%`); continue; }
    if (un.includes(month)) { left.push(`${month} (${pct > 0 ? "+" : ""}${pct}%)`); continue; }
    bad(`${id} ${month} (${pct}%): neither a beat with a move nor under Unexplained moves`);
  }
  // coverage gaps
  const s = load(id);
  let gap = 0, gp = "";
  if (s) {
    const mi = (x) => +x.slice(0, 4) * 12 + +x.slice(5);
    const pts = [s.from, ...beats.filter((b) => b.assets?.includes(id)).map((b) => b.month), s.to].sort();
    for (let i = 1; i < pts.length; i++) { const g = mi(pts[i]) - mi(pts[i - 1]); if (g > gap) { gap = g; gp = `${pts[i - 1]}..${pts[i]}`; } }
    if (gap > 24) bad(`${id}: gap of ${gap} months without a beat (${gp})`);
  }
  console.log(`${id.padEnd(10)} ${String(beats.length).padStart(3)} beats; importance 1/2/3: ${imp[1]}/${imp[2]}/${imp[3]}; longest gap ${gap} months (${gp}); unexplained: ${left.join(", ") || "none"}`);
}
console.log(errs ? `${errs} errors` : "OK");
process.exitCode = errs ? 1 : 0;
