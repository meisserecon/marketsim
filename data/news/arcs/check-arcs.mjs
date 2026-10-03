// Checks company arcs: node data/news/arcs/check-arcs.mjs [id ...]  (default: every <id>.beats.json in this folder)
// - the beats file parses and is an array; months are YYYY-MM and ascend (equal months allowed)
// - assets name companies in the game by that month (listed or first price month, up to the exit month)
// - move.asset is the arc's own asset, another game asset, sp500 or gold, and pct is a rounded number
// - importance is 1, 2 or 3; title, what, why, source are present, source carries a read date
// - every "Biggest months" entry of the company in movers.md is a beat with a matching move, or listed
//   under "## Unexplained moves" in <id>.md
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, "../../out");
const movers = fs.readFileSync(path.join(dir, "movers.md"), "utf8");
let errs = 0;
const bad = (m) => { errs++; console.log("ERR", m); };

const span = {};
for (const f of fs.readdirSync(out).filter((f) => f.endsWith(".json"))) {
  const j = JSON.parse(fs.readFileSync(path.join(out, f), "utf8"));
  if (!Array.isArray(j.rows) || !j.rows.length) continue;
  span[j.id ?? f.slice(0, -5)] = { from: j.listed ?? j.rows[0].month, to: j.end?.month ?? j.rows.at(-1).month };
}

function biggest(id) {
  const i = movers.indexOf(`### ${id}:`);
  if (i < 0) return [];
  const sec = movers.slice(i, movers.indexOf("\n### ", i + 5) > 0 ? movers.indexOf("\n### ", i + 5) : undefined);
  const b = sec.indexOf("Biggest months:");
  return [...sec.slice(b).matchAll(/^- (\d{4}-\d{2}): ([+-]\d+)%/gm)].map((m) => ({ month: m[1], pct: +m[2] }));
}

const ids = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(dir).filter((f) => f.endsWith(".beats.json")).map((f) => f.replace(".beats.json", ""));
for (const id of ids) {
  const f = path.join(dir, id + ".beats.json");
  let beats;
  try { beats = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { bad(`${id}: ${e.message}`); continue; }
  if (!Array.isArray(beats)) { bad(`${id}: not an array`); continue; }
  const md = fs.existsSync(path.join(dir, id + ".md")) ? fs.readFileSync(path.join(dir, id + ".md"), "utf8") : "";
  if (!md) bad(`${id}: ${id}.md missing`);
  const unexplained = md.includes("## Unexplained moves") ? md.slice(md.indexOf("## Unexplained moves"), md.indexOf("\n## ", md.indexOf("## Unexplained moves") + 5) > 0 ? md.indexOf("\n## ", md.indexOf("## Unexplained moves") + 5) : undefined) : "";
  let prev = "";
  const imp = { 1: 0, 2: 0, 3: 0 };
  for (const b of beats) {
    const tag = `${id} ${b.month} "${b.title}"`;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(b.month ?? "")) bad(`month format: ${tag}`);
    if (b.month < prev) bad(`months not ascending: ${tag}`);
    prev = b.month;
    for (const k of ["title", "what", "why", "source"]) if (typeof b[k] !== "string" || !b[k].trim()) bad(`missing ${k}: ${tag}`);
    if (b.source && !/read \d{4}-\d{2}-\d{2}/.test(b.source)) bad(`source without read date: ${tag}`);
    if (![1, 2, 3].includes(b.importance)) bad(`importance ${b.importance}: ${tag}`); else imp[b.importance]++;
    if (!Array.isArray(b.assets)) bad(`assets not an array: ${tag}`);
    for (const a of b.assets ?? []) {
      const s = span[a];
      if (!s) bad(`unknown asset ${a}: ${tag}`);
      else if (b.month < s.from || b.month > s.to) bad(`asset ${a} not in the game in ${b.month} (${s.from} to ${s.to}): ${tag}`);
    }
    if (b.move !== undefined) {
      const okAsset = ["sp500", "gold"].includes(b.move.asset) || span[b.move.asset];
      if (!okAsset) bad(`move asset ${b.move.asset}: ${tag}`);
      if (typeof b.move.pct !== "number" || !Number.isInteger(b.move.pct)) bad(`move pct ${b.move.pct}: ${tag}`);
    }
  }
  if (span[id] && beats.length) {
    if (beats[0].month !== span[id].from) bad(`${id}: first beat ${beats[0].month} is not the listing month ${span[id].from}`);
  }
  const missing = [];
  for (const m of biggest(id)) {
    const beat = beats.find((b) => b.month === m.month && b.move && b.move.asset === id);
    if (beat) { if (Math.abs(beat.move.pct - m.pct) > 1) bad(`${id} ${m.month}: move ${beat.move.pct} vs movers ${m.pct}`); continue; }
    if (unexplained.includes(m.month)) continue;
    missing.push(`${m.month} ${m.pct > 0 ? "+" : ""}${m.pct}%`);
  }
  if (missing.length) bad(`${id}: biggest months neither explained nor listed as unexplained: ${missing.join(", ")}`);
  console.log(`${id}: ${beats.length} beats (importance 1: ${imp[1]}, 2: ${imp[2]}, 3: ${imp[3]}); biggest months ${biggest(id).length}`);
}
console.log(errs ? `${errs} error(s)` : "OK");
process.exit(errs ? 1 : 0);
