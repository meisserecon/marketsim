// Checks data/news/19xx.json: node data/news/check.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const uni = fs.readFileSync(path.join(dir, "../src/universe.ts"), "utf8");
const from = { brk: "1980-03", intc: "1980-03", aapl: "1980-12", mercedes: "1981-03", bmw: "1981-03", ubs: "1982-03", sbv: "1982-03", "credit-suisse": "1982-03", ibj: "1985-05", msft: "1986-03" };
const start = ["ibm", "ge", "xom", "slb", "ko", "wmt", "ba", "mo", "mcd", "dis", "sony", "siemens", "nestle", "sandoz"];
const kinds = new Set(["world", "company", "colour", "listing", "delisting"]);
const mustList = [["1980-03", "brk"], ["1980-03", "intc"], ["1980-12", "aapl"], ["1981-03", "mercedes"], ["1981-03", "bmw"], ["1982-03", "ubs"], ["1982-03", "sbv"], ["1982-03", "credit-suisse"], ["1985-05", "ibj"], ["1986-03", "msft"]];
let errs = 0;
const bad = (m) => { errs++; console.log("ERR", m); };
const counts = {}, perMonth = {}, byAsset = {}, listings = new Set();
const mi = (x) => +x.slice(0, 4) * 12 + +x.slice(5);

for (let y = 1979; y <= 1989; y++) {
  const f = path.join(dir, y + ".json");
  let a;
  try { a = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { bad(f + " " + e.message); continue; }
  let prev = "";
  for (const it of a) {
    const id = `${it.month} ${it.headline}`;
    if (!/^\d{4}-\d{2}$/.test(it.month) || !it.month.startsWith(String(y))) bad("month/file " + id);
    if (y === 1979 && it.month !== "1979-12") bad("1979 only december " + id);
    if (it.month < prev) bad("order " + id);
    prev = it.month;
    if (!kinds.has(it.kind)) bad("kind " + id);
    if (!it.headline || it.headline.length >= 80 || /\.$/.test(it.headline)) bad("headline " + id);
    if (!it.text || it.text.length > 470) bad("text " + (it.text || "").length + " " + id);
    if (!it.source || !/read 2026-10-03/.test(it.source)) bad("source " + id);
    if (it.image !== null || it.imageCaption !== null) bad("image " + id);
    if (!Array.isArray(it.assets)) bad("assets " + id);
    for (const s of it.assets) {
      if (!uni.includes(`id: "${s}"`)) bad("unknown asset " + s + " " + id);
      if (!start.includes(s) && !from[s]) bad("not a 1980s asset " + s + " " + id);
      if (it.month < (from[s] ?? "1979-12")) bad(`asset ${s} before ${from[s]}: ${id}`);
      (byAsset[s] ??= []).push(it.month);
      if (it.kind === "listing") listings.add(it.month + " " + s);
    }
    (counts[y] ??= {})[it.kind] = (counts[y][it.kind] ?? 0) + 1;
    perMonth[it.month] = (perMonth[it.month] ?? 0) + 1;
  }
}
for (let k = mi("1979-12"); k <= mi("1989-12"); k++) {
  const key = `${Math.floor((k - 1) / 12)}-${String(((k - 1) % 12) + 1).padStart(2, "0")}`;
  if ((perMonth[key] ?? 0) < 2) bad("month " + key + " has " + (perMonth[key] ?? 0));
}
for (const [m, s] of mustList) if (!listings.has(m + " " + s)) bad("missing listing " + m + " " + s);
console.log(JSON.stringify(counts));
for (const s of [...start, ...Object.keys(from)]) {
  const ms = byAsset[s] ?? [];
  const pts = [from[s] ?? "1979-12", ...ms, "1989-12"].sort();
  let gap = 0, gp = "";
  for (let i = 1; i < pts.length; i++) { const g = mi(pts[i]) - mi(pts[i - 1]); if (g > gap) { gap = g; gp = pts[i - 1] + ".." + pts[i]; } }
  console.log(s.padEnd(14), String(ms.length).padStart(3), "items; longest gap", gap, "months", gp);
}
console.log(errs ? errs + " errors" : "OK");
