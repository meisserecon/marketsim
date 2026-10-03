// Checks arc beat files: node data/news/arcs/check-beats.mjs [tech.beats.json ...]
// (no arguments: every *.beats.json in this folder)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(dir, "../../out");
const uni = fs.readFileSync(path.join(dir, "../../src/universe.ts"), "utf8");

// In the game from max(listed, first data month) to the last data month.
const span = {};
for (const f of fs.readdirSync(outDir)) {
  if (!f.endsWith(".json")) continue;
  const j = JSON.parse(fs.readFileSync(path.join(outDir, f), "utf8"));
  if (!j.id || !Array.isArray(j.rows) || !j.rows.length || !uni.includes(`id: "${j.id}"`)) continue;
  const first = j.rows[0].month;
  span[j.id] = { from: j.listed && j.listed > first ? j.listed : first, to: j.rows.at(-1).month };
}
// Bonds and gold are not in universe.ts but a beat may explain their moves too.
const bondIds = fs.readdirSync(outDir).filter((f) => f.startsWith("ust") && f.endsWith(".json")).map((f) => f.slice(0, -5));
const moveAssets = new Set([...Object.keys(span), ...bondIds, "sp500", "gold"]);

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(dir).filter((f) => f.endsWith(".beats.json"));
let errs = 0;
for (const name of files) {
  const f = path.isAbsolute(name) ? name : path.join(dir, name);
  const bad = (m) => { errs++; console.log("ERR", path.basename(f), m); };
  let a;
  try { a = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { bad("parse: " + e.message); continue; }
  if (!Array.isArray(a)) { bad("not an array"); continue; }
  let prev = "";
  const imp = { 1: 0, 2: 0, 3: 0 };
  for (const b of a) {
    const id = `${b.month} ${b.title}`;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(b.month ?? "")) bad("month " + id);
    if (b.month < prev) bad("order " + id);
    prev = b.month;
    for (const k of ["title", "what", "why", "source"]) if (typeof b[k] !== "string" || !b[k].trim()) bad(`${k} missing: ${id}`);
    if (!/read \d{4}-\d{2}-\d{2}/.test(b.source ?? "")) bad("source without read date: " + id);
    if (![1, 2, 3].includes(b.importance)) bad("importance " + id);
    else imp[b.importance]++;
    if (!Array.isArray(b.assets)) bad("assets " + id);
    else for (const s of b.assets) {
      const sp = span[s];
      if (!sp) bad(`unknown asset ${s}: ${id}`);
      else if (b.month < sp.from || b.month > sp.to) bad(`asset ${s} not in game (${sp.from}..${sp.to}): ${id}`);
    }
    if (b.move !== undefined) {
      if (!b.move || !moveAssets.has(b.move.asset) || typeof b.move.pct !== "number" || !Number.isInteger(b.move.pct)) bad("move " + id);
      else if (span[b.move.asset] && (b.month < span[b.move.asset].from || b.month > span[b.move.asset].to)) bad("move asset not in game: " + id);
    }
  }
  console.log(path.basename(f), a.length, "beats; importance 1/2/3:", imp[1], imp[2], imp[3], "; with move:", a.filter((b) => b.move).length);
}
console.log(errs ? errs + " errors" : "OK");
process.exit(errs ? 1 : 0);
