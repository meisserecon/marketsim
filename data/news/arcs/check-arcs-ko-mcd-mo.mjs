// Checks company arcs: node data/news/arcs/check-arcs-ko-mcd-mo.mjs [id ...]   (default: ko mcd mo)
// - <id>.beats.json parses, required fields present, months valid and ascending
// - importance is 1, 2 or 3
// - assets name companies in the game by that month (listed / first data month, and not after their end)
// - move.pct matches the month's price change in data/out (or the S&P 500 / gold reference) within 1 point
// - every "Biggest months" entry of the company in movers.md is a beat with a move, or listed under
//   "## Unexplained moves" in <id>.md
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const arcs = dirname(fileURLToPath(import.meta.url));
const root = join(arcs, "..", "..", "..");
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ["ko", "mcd", "mo"];
const GAME_START = "1979-12";

const universe = readFileSync(join(root, "data", "src", "universe.ts"), "utf8");
function stockInfo(id) {
  const line = universe.split("\n").find((l) => l.includes(`id: "${id}"`));
  if (!line) return null;
  const listed = line.match(/listed: "(\d{4}-\d{2})"/)?.[1];
  const end = line.match(/end: \{ month: "(\d{4}-\d{2})"/)?.[1];
  return { listed, end };
}
const seriesCache = {};
function series(id) {
  if (seriesCache[id]) return seriesCache[id];
  const f = id === "sp500" || id === "gold" ? join(root, "data", "reference", `${id}.json`) : join(root, "data", "out", `${id}.json`);
  if (!existsSync(f)) return (seriesCache[id] = null);
  const rows = JSON.parse(readFileSync(f, "utf8")).rows;
  return (seriesCache[id] = Object.fromEntries(rows.map((r) => [r.month, r.price])));
}
function prevMonth(m) {
  let [y, mo] = m.split("-").map(Number);
  mo -= 1;
  if (mo === 0) { mo = 12; y -= 1; }
  return `${y}-${String(mo).padStart(2, "0")}`;
}
function change(id, m) {
  const s = series(id);
  if (!s || s[m] == null || s[prevMonth(m)] == null) return null;
  return (s[m] / s[prevMonth(m)] - 1) * 100;
}
function inGame(id, m) {
  const info = stockInfo(id);
  const s = series(id);
  if (!info || !s) return `unknown asset ${id}`;
  const first = [GAME_START, info.listed, Object.keys(s).sort()[0]].filter(Boolean).sort().at(-1);
  if (m < first) return `${id} not in the game before ${first}`;
  if (info.end && m > info.end) return `${id} left the game in ${info.end}`;
  return null;
}

const movers = readFileSync(join(arcs, "movers.md"), "utf8");
function biggestMonths(id) {
  const start = movers.indexOf(`### ${id}:`);
  if (start < 0) return [];
  const rest = movers.slice(start + 4);
  const section = rest.slice(0, rest.indexOf("\n### "));
  return [...section.matchAll(/^- (\d{4}-\d{2}): ([+-]\d+)%/gm)].map((m) => ({ month: m[1], pct: +m[2] }));
}

let errors = 0;
const err = (id, msg) => { errors++; console.log(`  ERROR ${id}: ${msg}`); };
for (const id of ids) {
  console.log(`== ${id}`);
  let beats;
  try { beats = JSON.parse(readFileSync(join(arcs, `${id}.beats.json`), "utf8")); }
  catch (e) { err(id, `beats file does not parse: ${e.message}`); continue; }
  if (!Array.isArray(beats)) { err(id, "beats file is not an array"); continue; }
  let last = "";
  const counts = { 1: 0, 2: 0, 3: 0 };
  for (const [i, b] of beats.entries()) {
    const tag = `#${i} ${b.month} ${b.title ?? ""}`;
    for (const k of ["month", "title", "what", "why", "assets", "importance", "source"]) if (b[k] == null || b[k] === "") err(id, `${tag}: missing ${k}`);
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(b.month ?? "")) err(id, `${tag}: bad month`);
    if (b.month < last) err(id, `${tag}: months not ascending (after ${last})`);
    last = b.month;
    if (![1, 2, 3].includes(b.importance)) err(id, `${tag}: importance ${b.importance}`);
    else counts[b.importance]++;
    if (!Array.isArray(b.assets)) err(id, `${tag}: assets not an array`);
    else for (const a of b.assets) { const p = inGame(a, b.month); if (p) err(id, `${tag}: ${p}`); }
    if (!/read \d{4}-\d{2}-\d{2}/.test(b.source ?? "") && !/data\/(out|reference)/.test(b.source ?? "")) err(id, `${tag}: source has no read date`);
    if (b.move) {
      const { asset, pct } = b.move;
      if (asset !== "sp500" && asset !== "gold" && !(b.assets ?? []).includes(asset)) err(id, `${tag}: move asset ${asset} not in assets`);
      const c = change(asset, b.month);
      if (c == null) err(id, `${tag}: no price change for ${asset} in ${b.month}`);
      else if (Math.abs(c - pct) > 1) err(id, `${tag}: move ${pct}% but data says ${c.toFixed(1)}%`);
    }
  }
  const mdFile = join(arcs, `${id}.md`);
  const md = existsSync(mdFile) ? readFileSync(mdFile, "utf8") : "";
  if (!md) err(id, `${id}.md missing`);
  const un = md.indexOf("## Unexplained moves");
  const unexplained = un >= 0 ? md.slice(un, md.indexOf("\n## ", un + 5) > 0 ? md.indexOf("\n## ", un + 5) : undefined) : "";
  const explained = [], listed = [];
  for (const bm of biggestMonths(id)) {
    const beat = beats.find((b) => b.month === bm.month && b.move && b.move.asset === id);
    if (beat) explained.push(bm.month);
    else if (unexplained.includes(bm.month)) listed.push(bm.month);
    else err(id, `biggest month ${bm.month} (${bm.pct}%) neither explained by a beat with a move nor listed as unexplained`);
  }
  console.log(`  ${beats.length} beats; importance 1/2/3: ${counts[1]}/${counts[2]}/${counts[3]}`);
  console.log(`  biggest months explained: ${explained.join(", ") || "-"}`);
  console.log(`  biggest months unexplained: ${listed.join(", ") || "-"}`);
}
console.log(errors ? `${errors} error(s)` : "all checks passed");
process.exit(errors ? 1 : 0);
