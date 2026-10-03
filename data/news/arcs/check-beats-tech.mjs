// Checks company arcs against the rules in README.md.
// Usage: node data/news/arcs/check-beats-tech.mjs intc msft aapl nvda
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(here, '../..');
const ids = process.argv.slice(2);
if (!ids.length) { console.error('usage: node check-beats-tech.mjs <id> [...]'); process.exit(2); }

const firstMonth = {}, prices = {};
for (const f of fs.readdirSync(path.join(dataDir, 'out')).filter(f => f.endsWith('.json'))) {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(dataDir, 'out', f), 'utf8'));
    if (!j.rows || !j.rows.length) continue;
    const id = j.id || f.replace(/\.json$/, '');
    firstMonth[id] = j.rows[0].month;
    prices[id] = Object.fromEntries(j.rows.map(r => [r.month, r.price]));
  } catch { /* not a series */ }
}
for (const [id, file] of [['sp500', 'reference/sp500.json'], ['gold', 'reference/gold.json']]) {
  const p = path.join(dataDir, file);
  if (!fs.existsSync(p)) continue;
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  const rows = j.rows || j;
  prices[id] = Object.fromEntries(rows.map(r => [r.month, r.price]));
}
const prevMonth = m => { let [y, mo] = m.split('-').map(Number); mo--; if (!mo) { mo = 12; y--; } return `${y}-${String(mo).padStart(2, '0')}`; };
const pct = (id, m) => { const p = prices[id]; if (!p || !p[m] || !p[prevMonth(m)]) return null; return (p[m] / p[prevMonth(m)] - 1) * 100; };
const monthsBetween = (a, b) => { const [y1, m1] = a.split('-').map(Number), [y2, m2] = b.split('-').map(Number); return (y2 - y1) * 12 + m2 - m1; };

const movers = fs.readFileSync(path.join(here, 'movers.md'), 'utf8');
function biggestMonths(id) {
  const start = movers.indexOf(`### ${id}:`);
  if (start < 0) return [];
  const end = movers.indexOf('\n### ', start + 5);
  const sec = movers.slice(start, end < 0 ? undefined : end);
  const b = sec.indexOf('Biggest months:');
  return [...sec.slice(b).matchAll(/^- (\d{4}-\d{2}): ([+-]?\d+)%/gm)].map(m => ({ month: m[1], pct: Number(m[2]) }));
}

let errors = 0;
const err = (id, msg) => { errors++; console.log(`  ERROR ${id}: ${msg}`); };
for (const id of ids) {
  console.log(`== ${id}`);
  let beats;
  try { beats = JSON.parse(fs.readFileSync(path.join(here, `${id}.beats.json`), 'utf8')); }
  catch (e) { err(id, `beats file does not parse: ${e.message}`); continue; }
  if (!Array.isArray(beats)) { err(id, 'beats file is not an array'); continue; }
  const md = fs.readFileSync(path.join(here, `${id}.md`), 'utf8');
  const unexplainedSec = (md.split(/^## Unexplained moves/m)[1] || '').split(/^## /m)[0];
  let prev = '';
  const imp = { 1: 0, 2: 0, 3: 0 };
  beats.forEach((b, i) => {
    const tag = `${b.month || '?'} "${b.title || ''}"`;
    for (const k of ['month', 'title', 'what', 'why', 'assets', 'importance', 'source']) if (b[k] === undefined) err(id, `${tag}: missing ${k}`);
    if (!/^\d{4}-\d{2}$/.test(b.month || '')) err(id, `${tag}: bad month`);
    if (prev && b.month < prev) err(id, `${tag}: months not ascending (after ${prev})`);
    prev = b.month;
    if (![1, 2, 3].includes(b.importance)) err(id, `${tag}: importance ${b.importance} not 1-3`); else imp[b.importance]++;
    for (const a of b.assets || []) {
      if (!firstMonth[a]) err(id, `${tag}: unknown asset ${a}`);
      else if (b.month < firstMonth[a]) err(id, `${tag}: asset ${a} not in the game before ${firstMonth[a]}`);
    }
    if (b.move) {
      const { asset, pct: p } = b.move;
      if (!['sp500', 'gold'].includes(asset) && !(b.assets || []).includes(asset)) err(id, `${tag}: move asset ${asset} not in assets`);
      const actual = pct(asset, b.month);
      if (actual === null) err(id, `${tag}: no price data for move ${asset}`);
      else if (Math.abs(actual - p) > 1) err(id, `${tag}: move ${p}% but data says ${actual.toFixed(1)}%`);
    }
  });
  // coverage: own beats at least every two years from first month to now
  const own = beats.filter(b => (b.assets || []).includes(id)).map(b => b.month);
  const span = [firstMonth[id], ...own, '2026-09'];
  for (let i = 1; i < span.length; i++) if (monthsBetween(span[i - 1], span[i]) > 24) err(id, `gap of ${monthsBetween(span[i - 1], span[i])} months between ${span[i - 1]} and ${span[i]}`);
  if (own[0] !== firstMonth[id]) err(id, `no beat in the listing month ${firstMonth[id]}`);
  // biggest months
  for (const bm of biggestMonths(id)) {
    const hit = beats.find(b => b.month === bm.month && b.move && b.move.asset === id);
    if (hit) { if (Math.abs(hit.move.pct - bm.pct) > 1) err(id, `${bm.month}: move ${hit.move.pct}% vs movers.md ${bm.pct}%`); continue; }
    if (unexplainedSec.includes(bm.month)) { console.log(`  unexplained ${bm.month} ${bm.pct}%`); continue; }
    err(id, `biggest month ${bm.month} (${bm.pct}%) has neither a beat with a move nor an Unexplained entry`);
  }
  console.log(`  ${beats.length} beats; importance 1/2/3: ${imp[1]}/${imp[2]}/${imp[3]}`);
}
console.log(errors ? `${errors} error(s)` : 'all checks passed');
process.exit(errors ? 1 : 0);
