// Checks company arc files against the rules in README.md.
// Usage (from the repo root): node data/news/arcs/check-arcs.mjs xom slb
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const ids = process.argv.slice(2);
if (!ids.length) {
  console.error("usage: node data/news/arcs/check-arcs.mjs <id> [<id> ...]");
  process.exit(2);
}

const universe = readFileSync(join(root, "data/src/universe.ts"), "utf8");
const movers = readFileSync(join(here, "movers.md"), "utf8");
const GAME_START = "1979-12";

/** First and last tradable month of an asset id, or null if it is not in the game. */
function span(id) {
  const file = join(root, "data/out", `${id}.json`);
  if (!existsSync(file)) return null;
  const rows = JSON.parse(readFileSync(file, "utf8")).rows;
  let first = rows[0].month;
  const def = universe.match(new RegExp(`\\{ id: "${id}"[^\\n]*`));
  const listed = def?.[0].match(/listed: "(\d{4}-\d{2})"/)?.[1];
  if (listed && listed > first) first = listed;
  if (first < GAME_START) first = GAME_START;
  return { first, last: rows[rows.length - 1].month, rows };
}

function monthChange(id, month) {
  const s = id === "sp500" ? null : span(id);
  if (!s) return null;
  const i = s.rows.findIndex((r) => r.month === month);
  if (i < 1) return null;
  return (s.rows[i].price / s.rows[i - 1].price - 1) * 100;
}

function biggestMonths(id) {
  const start = movers.indexOf(`### ${id}:`);
  if (start < 0) return [];
  const section = movers.slice(start, movers.indexOf("\n### ", start + 5));
  const list = section.slice(section.indexOf("Biggest months:"));
  return [...list.matchAll(/^- (\d{4}-\d{2}): ([+-]\d+)%/gm)].map((m) => ({ month: m[1], pct: +m[2] }));
}

let errors = 0;
const fail = (id, msg) => {
  errors++;
  console.log(`  ERROR ${id}: ${msg}`);
};

for (const id of ids) {
  console.log(`== ${id}`);
  const beatsFile = join(here, `${id}.beats.json`);
  const mdFile = join(here, `${id}.md`);
  let beats;
  try {
    beats = JSON.parse(readFileSync(beatsFile, "utf8"));
  } catch (e) {
    fail(id, `beats file does not parse: ${e.message}`);
    continue;
  }
  if (!Array.isArray(beats)) {
    fail(id, "beats file is not an array");
    continue;
  }
  const md = existsSync(mdFile) ? readFileSync(mdFile, "utf8") : "";
  if (!md) fail(id, "missing .md file");
  let unexplained = "";
  const u = md.indexOf("## Unexplained moves");
  if (u >= 0) {
    const next = md.indexOf("\n## ", u + 5);
    unexplained = md.slice(u, next < 0 ? undefined : next);
  }

  const own = span(id);
  const counts = { 1: 0, 2: 0, 3: 0 };
  let prev = "";
  beats.forEach((b, i) => {
    const tag = `#${i} ${b.month} "${b.title}"`;
    for (const k of ["month", "title", "what", "why", "assets", "importance", "source"])
      if (b[k] === undefined || b[k] === "") fail(id, `${tag}: missing ${k}`);
    if (!/^\d{4}-\d{2}$/.test(b.month)) fail(id, `${tag}: bad month`);
    if (b.month < prev) fail(id, `${tag}: months not ascending (after ${prev})`);
    prev = b.month;
    if (![1, 2, 3].includes(b.importance)) fail(id, `${tag}: importance ${b.importance} not 1-3`);
    else counts[b.importance]++;
    if (!/read \d{4}-\d{2}-\d{2}|data\/(out|reference)/.test(b.source)) fail(id, `${tag}: source without read date`);
    for (const a of b.assets || []) {
      const s = span(a);
      if (!s) fail(id, `${tag}: asset ${a} not in the game`);
      else if (b.month < s.first || b.month > s.last) fail(id, `${tag}: asset ${a} not in the game in ${b.month} (${s.first} to ${s.last})`);
    }
    if (b.move) {
      const { asset, pct } = b.move;
      if (!["sp500", "gold"].includes(asset) && !(b.assets || []).includes(asset)) fail(id, `${tag}: move asset ${asset} not in assets`);
      const actual = monthChange(asset, b.month);
      if (actual !== null && Math.abs(actual - pct) > 1) fail(id, `${tag}: move ${pct}% but data says ${actual.toFixed(1)}%`);
    }
  });

  if (own) {
    if (!beats.length || beats[0].month !== own.first) fail(id, `first beat ${beats[0]?.month} is not the listing month ${own.first}`);
    const ms = beats.map((b) => b.month);
    const toN = (m) => +m.slice(0, 4) * 12 + +m.slice(5, 7);
    for (let i = 1; i < ms.length; i++)
      if (toN(ms[i]) - toN(ms[i - 1]) > 24) console.log(`  warn: gap of ${toN(ms[i]) - toN(ms[i - 1])} months between ${ms[i - 1]} and ${ms[i]}`);
  }

  for (const big of biggestMonths(id)) {
    const hit = beats.find((b) => b.month === big.month && b.move?.asset === id);
    if (hit) continue;
    if (unexplained.includes(big.month)) {
      console.log(`  unexplained (listed in .md): ${big.month} ${big.pct}%`);
      continue;
    }
    fail(id, `biggest month ${big.month} (${big.pct}%) has no beat with a move and is not under "Unexplained moves"`);
  }
  console.log(`  ${beats.length} beats; importance 1/2/3: ${counts[1]}/${counts[2]}/${counts[3]}`);
}

console.log(errors ? `\n${errors} error(s)` : "\nall checks passed");
process.exit(errors ? 1 : 0);
