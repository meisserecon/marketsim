// Checks an arc's beats file: node data/news/arcs/check-beats.mjs <id> [<id> ...]
// Parses <id>.beats.json and checks month order, required fields, importance 1-3,
// and that `assets` (and `move.asset`) only name companies in the game by that month.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, "../../out");
const span = (id) => {
  const f = path.join(out, id + ".json");
  if (!fs.existsSync(f)) return null;
  const j = JSON.parse(fs.readFileSync(f, "utf8"));
  return { first: j.rows[0].month, last: j.rows.at(-1).month };
};
const ids = process.argv.slice(2);
if (!ids.length) { console.log("usage: node check-beats.mjs <id> ..."); process.exit(2); }
let errs = 0;
for (const id of ids) {
  const bad = (m) => { errs++; console.log("ERR", id, m); };
  let a;
  try { a = JSON.parse(fs.readFileSync(path.join(dir, id + ".beats.json"), "utf8")); }
  catch (e) { bad("parse: " + e.message); continue; }
  if (!Array.isArray(a)) { bad("not an array"); continue; }
  let prev = "";
  const imp = { 1: 0, 2: 0, 3: 0 };
  for (const b of a) {
    const tag = `${b.month} ${b.title}`;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(b.month ?? "")) bad("month format " + tag);
    if (b.month < prev) bad("months not ascending " + tag);
    prev = b.month;
    for (const k of ["title", "what", "why", "source"]) if (typeof b[k] !== "string" || !b[k].trim()) bad(`missing ${k}: ${tag}`);
    if (!/read \d{4}-\d{2}-\d{2}/.test(b.source ?? "")) bad("source without read date " + tag);
    if (![1, 2, 3].includes(b.importance)) bad("importance " + b.importance + " " + tag); else imp[b.importance]++;
    if (!Array.isArray(b.assets)) bad("assets not an array " + tag);
    for (const s of b.assets ?? []) {
      const sp = span(s);
      if (!sp) bad(`unknown asset ${s}: ${tag}`);
      else if (b.month < sp.first || b.month > sp.last) bad(`asset ${s} not in game in ${b.month} (${sp.first}..${sp.last}): ${tag}`);
    }
    if (b.move !== undefined) {
      const m = b.move;
      if (typeof m.asset !== "string" || typeof m.pct !== "number" || !Number.isInteger(m.pct)) bad("move shape " + tag);
      else if (!["sp500", "gold"].includes(m.asset)) {
        const sp = span(m.asset);
        if (!sp) bad(`unknown move asset ${m.asset}: ${tag}`);
        else if (b.month < sp.first || b.month > sp.last) bad(`move asset ${m.asset} not in game in ${b.month}: ${tag}`);
        if (!(b.assets ?? []).includes(m.asset)) bad(`move asset ${m.asset} not in assets: ${tag}`);
      }
    }
  }
  console.log(`${id}: ${a.length} beats, importance 1/2/3 = ${imp[1]}/${imp[2]}/${imp[3]}, with move: ${a.filter((b) => b.move).length}`);
}
console.log(errs ? errs + " errors" : "OK");
process.exit(errs ? 1 : 0);
