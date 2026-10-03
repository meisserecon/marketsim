// Checks arc beats files: node data/news/arcs/check-swiss-banks.mjs [id ...] (default: ubs sbv credit-suisse)
// - each <id>.beats.json parses and is an array; months ascend
// - assets name only companies in the game by that month (first row in data/out/<id>.json, last row for ended companies)
// - importance is 1, 2 or 3; move.asset is a company in the game, sp500 or gold
// - every "Biggest months" entry of the company in movers.md has a beat with a move for it,
//   or appears under "## Unexplained moves" in <id>.md
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ["ubs", "sbv", "credit-suisse"];

const span = {};
for (const f of fs.readdirSync(path.join(root, "data/out"))) {
  if (!f.endsWith(".json")) continue;
  const d = JSON.parse(fs.readFileSync(path.join(root, "data/out", f), "utf8"));
  if (!Array.isArray(d.rows) || !d.rows.length || d.kind === "bond") continue;
  const first = d.listed && d.listed > d.rows[0].month ? d.listed : d.rows[0].month;
  span[d.id ?? f.replace(/\.json$/, "")] = { first, last: d.rows[d.rows.length - 1].month };
}

const movers = fs.readFileSync(path.join(here, "movers.md"), "utf8");
function biggest(id) {
  const start = movers.indexOf(`### ${id}:`);
  if (start < 0) return [];
  const end = movers.indexOf("\n### ", start + 5);
  const sec = movers.slice(start, end < 0 ? undefined : end);
  return [...sec.matchAll(/^- (\d{4}-\d{2}): ([+-]?\d+)%/gm)].map((m) => ({ month: m[1], pct: Number(m[2]) }));
}

let errors = 0;
const err = (id, msg) => { errors++; console.log(`  ERROR ${id}: ${msg}`); };

for (const id of ids) {
  console.log(`${id}:`);
  let beats;
  try {
    beats = JSON.parse(fs.readFileSync(path.join(here, `${id}.beats.json`), "utf8"));
  } catch (e) { err(id, `beats file does not parse: ${e.message}`); continue; }
  if (!Array.isArray(beats)) { err(id, "beats file is not an array"); continue; }
  const md = fs.readFileSync(path.join(here, `${id}.md`), "utf8");
  const ui = md.indexOf("## Unexplained moves");
  const unexplained = ui < 0 ? "" : md.slice(ui, md.indexOf("\n## ", ui + 5));

  let prev = "";
  const counts = { 1: 0, 2: 0, 3: 0 };
  for (const b of beats) {
    const where = `${b.month} '${b.title}'`;
    for (const k of ["month", "title", "what", "why", "assets", "importance", "source"]) if (b[k] === undefined) err(id, `${where}: missing ${k}`);
    if (!/^\d{4}-\d{2}$/.test(b.month)) err(id, `${where}: bad month`);
    if (b.month < prev) err(id, `${where}: months not ascending (after ${prev})`);
    prev = b.month;
    if (![1, 2, 3].includes(b.importance)) err(id, `${where}: importance ${b.importance}`);
    else counts[b.importance]++;
    for (const a of b.assets ?? []) {
      const s = span[a];
      if (!s) err(id, `${where}: unknown asset ${a}`);
      else if (b.month < s.first || b.month > s.last) err(id, `${where}: ${a} not in the game (${s.first} to ${s.last})`);
    }
    if (b.move) {
      const a = b.move.asset;
      if (!["sp500", "gold"].includes(a)) {
        const s = span[a];
        if (!s) err(id, `${where}: unknown move asset ${a}`);
        else if (b.month < s.first || b.month > s.last) err(id, `${where}: move asset ${a} not in the game`);
      }
      if (typeof b.move.pct !== "number") err(id, `${where}: move.pct not a number`);
    }
  }
  for (const m of biggest(id)) {
    const beat = beats.find((b) => b.month === m.month && b.move && b.move.asset === id);
    if (beat) {
      if (Math.abs(beat.move.pct - m.pct) > 1) err(id, `${m.month}: move ${beat.move.pct}% differs from movers.md ${m.pct}%`);
    } else if (!unexplained.includes(m.month)) err(id, `${m.month} (${m.pct}%) neither a beat with a move nor under Unexplained moves`);
  }
  console.log(`  ${beats.length} beats; importance 1: ${counts[1]}, 2: ${counts[2]}, 3: ${counts[3]}`);
}
console.log(errors ? `${errors} error(s)` : "OK");
process.exit(errors ? 1 : 0);
