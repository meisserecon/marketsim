// Checks arc beat files against the rules in README.md.
// Usage: node data/news/arcs/check-beats.mjs [id ...]   (default: every *.beats.json in this folder)
// Checks: the file parses as an array; months are YYYY-MM and ascend; importance is 1 to 3;
// every asset in `assets` (and `move.asset`) is in the game in the beat's month, i.e. between
// max(listed, first data month) and the last data month of data/out/<id>.json.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "..", "out");
const ids = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(here).filter((f) => f.endsWith(".beats.json")).map((f) => f.replace(/\.beats\.json$/, ""));

const spans = new Map();
function span(asset) {
  if (spans.has(asset)) return spans.get(asset);
  const f = join(outDir, `${asset}.json`);
  let s = null;
  if (existsSync(f)) {
    const j = JSON.parse(readFileSync(f, "utf8"));
    const rows = j.rows ?? [];
    if (rows.length) {
      const first = rows[0].month;
      s = { from: j.listed && j.listed > first ? j.listed : first, to: rows[rows.length - 1].month };
    }
  }
  spans.set(asset, s);
  return s;
}

let errors = 0;
const fail = (id, i, msg) => { errors++; console.log(`${id}[${i}]: ${msg}`); };
for (const id of ids) {
  const beats = JSON.parse(readFileSync(join(here, `${id}.beats.json`), "utf8"));
  if (!Array.isArray(beats)) { fail(id, "-", "not an array"); continue; }
  let prev = "";
  beats.forEach((b, i) => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(b.month ?? "")) fail(id, i, `bad month ${b.month}`);
    if (b.month < prev) fail(id, i, `month ${b.month} before ${prev}`);
    prev = b.month;
    for (const k of ["title", "what", "why", "source"]) if (typeof b[k] !== "string" || !b[k].trim()) fail(id, i, `missing ${k}`);
    if (![1, 2, 3].includes(b.importance)) fail(id, i, `importance ${b.importance}`);
    if (!Array.isArray(b.assets)) fail(id, i, "assets not an array");
    const assets = [...(b.assets ?? [])];
    if (b.move) {
      if (!["sp500", "gold"].includes(b.move.asset)) assets.push(b.move.asset);
      if (typeof b.move.pct !== "number") fail(id, i, "move.pct not a number");
    }
    for (const a of assets) {
      const s = span(a);
      if (!s) fail(id, i, `unknown asset ${a}`);
      else if (b.month < s.from || b.month > s.to) fail(id, i, `${a} not in the game in ${b.month} (${s.from} to ${s.to})`);
    }
  });
  const imp = [1, 2, 3].map((n) => beats.filter((b) => b.importance === n).length);
  console.log(`${id}: ${beats.length} beats, importance 1/2/3 = ${imp.join("/")}, ${beats[0]?.month} to ${beats.at(-1)?.month}`);
}
console.log(errors ? `${errors} error(s)` : "ok");
process.exit(errors ? 1 : 0);
