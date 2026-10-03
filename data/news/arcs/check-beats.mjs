// Checks arc beat files: node data/news/arcs/check-beats.mjs [id ...]
// Parses each <id>.beats.json, checks ascending months, importance 1-3,
// and that assets name companies in the game by that month (first month in data/out/<id>.json).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, "../../out");
const ids = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(dir).filter((f) => f.endsWith(".beats.json")).map((f) => f.replace(".beats.json", ""));

const firstMonth = {}, lastMonth = {};
const monthsOf = (id) => {
  if (id in firstMonth) return;
  const file = path.join(out, id + ".json");
  if (!fs.existsSync(file)) { firstMonth[id] = null; return; }
  const txt = fs.readFileSync(file, "utf8");
  const ms = [...txt.matchAll(/"month":\s*"(\d{4}-\d{2})"/g)].map((m) => m[1]).sort();
  firstMonth[id] = ms[0] ?? null;
  lastMonth[id] = ms[ms.length - 1] ?? null;
};

let errs = 0;
const bad = (m) => { errs++; console.log("ERR", m); };
for (const id of ids) {
  let beats;
  try { beats = JSON.parse(fs.readFileSync(path.join(dir, id + ".beats.json"), "utf8")); }
  catch (e) { bad(`${id}: ${e.message}`); continue; }
  if (!Array.isArray(beats)) { bad(`${id}: not an array`); continue; }
  let prev = "";
  const imp = { 1: 0, 2: 0, 3: 0 };
  for (const b of beats) {
    const tag = `${id} ${b.month} ${b.title}`;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(b.month ?? "")) bad("month format " + tag);
    if (b.month < prev) bad("months not ascending " + tag);
    prev = b.month;
    for (const k of ["title", "what", "why", "source"]) if (typeof b[k] !== "string" || !b[k].trim()) bad(`missing ${k}: ${tag}`);
    if (!/read \d{4}-\d{2}-\d{2}/.test(b.source ?? "")) bad("source without read date " + tag);
    if (![1, 2, 3].includes(b.importance)) bad("importance " + tag); else imp[b.importance]++;
    if (!Array.isArray(b.assets)) bad("assets not an array " + tag);
    for (const a of b.assets ?? []) {
      monthsOf(a);
      if (!firstMonth[a]) bad(`unknown asset ${a}: ${tag}`);
      else if (b.month < firstMonth[a] || b.month > lastMonth[a]) bad(`asset ${a} not in game in ${b.month} (${firstMonth[a]}..${lastMonth[a]}): ${tag}`);
    }
    if (b.move) {
      const a = b.move.asset;
      if (a !== "sp500") { monthsOf(a); if (!firstMonth[a]) bad(`unknown move asset ${a}: ${tag}`); }
      if (typeof b.move.pct !== "number") bad("move pct " + tag);
    }
  }
  console.log(`${id}: ${beats.length} beats, importance 1/2/3 = ${imp[1]}/${imp[2]}/${imp[3]}`);
}
console.log(errs ? errs + " errors" : "OK");
process.exit(errs ? 1 : 0);
