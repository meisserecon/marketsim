// Checks arc beat files: node data/news/arcs/check-beats.mjs [id ...]   (default: every *.beats.json here)
// Parses, months ascend, assets name companies in the game by that month, importance 1-3, move/source present.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, "../../out");
const uni = fs.readFileSync(path.join(dir, "../../src/universe.ts"), "utf8");

// first and last month of each company in the game, from data/out/<id>.json
const span = {};
for (const f of fs.readdirSync(out)) {
  const id = f.replace(/\.json$/, "");
  if (!uni.includes(`id: "${id}"`)) continue; // skips cash, gold, bond series
  const rows = JSON.parse(fs.readFileSync(path.join(out, f), "utf8")).rows ?? [];
  if (rows.length) span[id] = [rows[0].month, rows[rows.length - 1].month];
}

const ids = process.argv.slice(2);
const files = ids.length ? ids.map((i) => i + ".beats.json") : fs.readdirSync(dir).filter((f) => f.endsWith(".beats.json"));
let errs = 0;
const bad = (m) => { errs++; console.log("ERR", m); };

for (const f of files) {
  let a;
  try { a = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch (e) { bad(`${f}: ${e.message}`); continue; }
  if (!Array.isArray(a)) { bad(`${f}: not an array`); continue; }
  let prev = "";
  const imp = { 1: 0, 2: 0, 3: 0 };
  for (const b of a) {
    const id = `${f} ${b.month} "${b.title}"`;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(b.month ?? "")) bad("month format " + id);
    if (b.month < "1979-12") bad("before the game " + id);
    if (b.month < prev) bad("months not ascending " + id);
    prev = b.month;
    for (const k of ["title", "what", "why", "source"]) if (typeof b[k] !== "string" || !b[k].trim()) bad(`missing ${k} ` + id);
    if (b.source && !/read \d{4}-\d{2}-\d{2}/.test(b.source)) bad("source without read date " + id);
    if (![1, 2, 3].includes(b.importance)) bad("importance " + id); else imp[b.importance]++;
    if (!Array.isArray(b.assets)) bad("assets not an array " + id);
    for (const s of b.assets ?? []) {
      if (!span[s]) { bad(`unknown asset ${s} ` + id); continue; }
      if (b.month < span[s][0] || b.month > span[s][1]) bad(`asset ${s} not in the game (${span[s][0]}..${span[s][1]}) ` + id);
    }
    if (b.move !== undefined) {
      const m = b.move;
      if (!m || typeof m.asset !== "string" || typeof m.pct !== "number") bad("move shape " + id);
      else if (!["sp500", "gold"].includes(m.asset) && !span[m.asset]) bad(`move asset ${m.asset} unknown ` + id);
      else if (span[m.asset] && !(b.assets ?? []).includes(m.asset)) bad(`move asset ${m.asset} not in assets ` + id);
    }
  }
  console.log(`${f}: ${a.length} beats, importance 1/2/3 = ${imp[1]}/${imp[2]}/${imp[3]}, ${a.filter((b) => b.move).length} with a move`);
}
console.log(errs ? errs + " errors" : "OK");
process.exit(errs ? 1 : 0);
