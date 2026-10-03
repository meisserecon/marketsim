// Checks story-arc beats files against the README rules.
// Usage: node data/news/arcs/check-beats-commodities.mjs xstrata glencore
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "..", "out");
const ids = process.argv.slice(2);
if (!ids.length) { console.error("usage: node check-beats-commodities.mjs <id> [<id>...]"); process.exit(2); }

const spans = new Map();
function span(id) {
  if (spans.has(id)) return spans.get(id);
  const f = join(outDir, `${id}.json`);
  if (!existsSync(f)) { spans.set(id, null); return null; }
  const d = JSON.parse(readFileSync(f, "utf8"));
  const rows = d.rows || [];
  const s = { first: rows[0]?.month, last: d.end?.month || rows.at(-1)?.month, rows };
  spans.set(id, s);
  return s;
}
function monthChange(id, month) {
  const s = span(id);
  if (!s) return null;
  const i = s.rows.findIndex((r) => r.month === month);
  if (i < 1) return null;
  const p = (r) => r.price ?? r.close ?? r.value;
  return (p(s.rows[i]) / p(s.rows[i - 1]) - 1) * 100;
}

const movers = readFileSync(join(here, "movers.md"), "utf8");
function biggestMonths(id) {
  const start = movers.indexOf(`### ${id}:`);
  if (start < 0) return [];
  const rest = movers.slice(start + 4);
  const end = rest.search(/\n##+ /);
  const section = end < 0 ? rest : rest.slice(0, end);
  return [...section.matchAll(/^- (\d{4}-\d{2}): ([+-]\d+)%/gm)].map((m) => ({ month: m[1], pct: +m[2] }));
}

let errors = 0;
const err = (id, msg) => { errors++; console.log(`ERROR ${id}: ${msg}`); };

for (const id of ids) {
  const beatsFile = join(here, `${id}.beats.json`);
  const mdFile = join(here, `${id}.md`);
  let beats;
  try { beats = JSON.parse(readFileSync(beatsFile, "utf8")); } catch (e) { err(id, `beats file does not parse: ${e.message}`); continue; }
  if (!Array.isArray(beats)) { err(id, "beats file is not an array"); continue; }
  const md = existsSync(mdFile) ? readFileSync(mdFile, "utf8") : (err(id, "md file missing"), "");
  const own = span(id);
  const imp = { 1: 0, 2: 0, 3: 0 };
  let prev = "";
  for (const [i, b] of beats.entries()) {
    const tag = `beat ${i} (${b.month} ${b.title})`;
    for (const k of ["month", "title", "what", "why", "assets", "importance", "source"]) if (b[k] === undefined || b[k] === "") err(id, `${tag}: missing ${k}`);
    if (!/^\d{4}-\d{2}$/.test(b.month || "")) err(id, `${tag}: bad month`);
    if (b.month < prev) err(id, `${tag}: months not ascending (${prev} before ${b.month})`);
    prev = b.month;
    if (![1, 2, 3].includes(b.importance)) err(id, `${tag}: importance ${b.importance}`); else imp[b.importance]++;
    if (own && (b.month < own.first || b.month > own.last)) err(id, `${tag}: outside ${id}'s time in the game ${own.first}..${own.last}`);
    for (const a of b.assets || []) {
      if (a === "sp500" || a === "gold") continue;
      const s = span(a);
      if (!s) err(id, `${tag}: unknown asset ${a}`);
      else if (b.month < s.first || b.month > s.last) err(id, `${tag}: asset ${a} not in the game in ${b.month} (${s.first}..${s.last})`);
    }
    if (b.move) {
      const c = monthChange(b.move.asset, b.month);
      if (c === null) { if (b.move.asset !== "sp500" && b.move.asset !== "gold") err(id, `${tag}: no price change for move asset ${b.move.asset}`); }
      else if (Math.abs(c - b.move.pct) > 1.01) err(id, `${tag}: move ${b.move.pct}% but data says ${c.toFixed(1)}%`);
    }
  }
  const unexplained = (md.split(/^## Unexplained moves/m)[1] || "").split(/^## /m)[0];
  for (const bm of biggestMonths(id)) {
    const hit = beats.some((b) => b.month === bm.month && b.move && b.move.asset === id);
    if (!hit && !unexplained.includes(bm.month)) err(id, `biggest month ${bm.month} (${bm.pct}%) has no beat with a move and is not under Unexplained moves`);
  }
  console.log(`${id}: ${beats.length} beats, importance 1/2/3 = ${imp[1]}/${imp[2]}/${imp[3]}, biggest months checked: ${biggestMonths(id).length}`);
}
console.log(errors ? `${errors} error(s)` : "all checks passed");
process.exit(errors ? 1 : 0);
