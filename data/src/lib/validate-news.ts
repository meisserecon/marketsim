/** Checks data/news: well-formed items, no unknown or not-yet-listed company, and every listing and exit in a covered year told. */
import fs from "node:fs";
import path from "node:path";
import type { AssetSeries } from "./asset.js";

const KINDS = new Set(["world", "company", "colour", "listing", "delisting"]);

const nextMonth = (m: string) => {
  const [y, mm] = m.split("-").map(Number);
  return mm === 12 ? `${y + 1}-01` : `${y}-${String(mm + 1).padStart(2, "0")}`;
};
const listedMonth = (s: AssetSeries) => (s.listed && s.listed > s.rows[0].month ? s.listed : s.rows[0].month);

export function validateNews(newsDir: string, assets: Map<string, AssetSeries>, fail: (msg: string) => void): void {
  if (!fs.existsSync(newsDir)) return;
  const years = new Set<string>();
  const all: { month: string; kind: string; assets: string[] }[] = [];
  for (const file of fs.readdirSync(newsDir).filter((f) => /^\d{4}\.json$/.test(f)).sort()) {
    const year = file.slice(0, 4);
    years.add(year);
    let items: any[];
    try {
      items = JSON.parse(fs.readFileSync(path.join(newsDir, file), "utf8"));
    } catch (e) {
      fail(`news/${file}: ${(e as Error).message}`);
      continue;
    }
    const perMonth = new Map<string, number>();
    let prev = "";
    for (const [i, n] of items.entries()) {
      const where = `news/${file}[${i}]`;
      if (typeof n.month !== "string" || !n.month.startsWith(year)) fail(`${where}: month ${n.month} does not belong in ${file}`);
      if (n.month < prev) fail(`${where}: out of order (${n.month} after ${prev})`);
      prev = n.month;
      perMonth.set(n.month, (perMonth.get(n.month) ?? 0) + 1);
      if (!KINDS.has(n.kind)) fail(`${where}: unknown kind ${n.kind}`);
      if (typeof n.headline !== "string" || !n.headline.trim() || n.headline.length > 120) fail(`${where}: bad headline`);
      if (typeof n.text !== "string" || n.text.length < 40 || n.text.length > 1200) fail(`${where}: text length ${n.text?.length}`);
      if (!Array.isArray(n.assets)) fail(`${where}: assets must be an array`);
      for (const id of n.assets ?? []) {
        const s = assets.get(id);
        if (!s) fail(`${where}: unknown asset ${id}`);
        else if (n.month < listedMonth(s)) fail(`${where}: ${id} is not in the game before ${listedMonth(s)}`);
        else if (s.end && n.month > nextMonth(s.end.month)) fail(`${where}: ${id} left the game after ${s.end.month}`);
      }
      if ((n.kind === "listing" || n.kind === "delisting") && !n.assets?.length) fail(`${where}: a ${n.kind} item needs the company in assets`);
      all.push(n);
    }
    const months = [...perMonth.entries()].sort();
    console.log(`\nnews/${file}: ${items.length} items in ${months.length} months (${months.map(([m, c]) => `${m.slice(5)}:${c}`).join(" ")})`);
  }
  for (const s of assets.values()) {
    if (s.kind !== "stock") continue;
    const lm = listedMonth(s);
    if (lm > "1979-12" && years.has(lm.slice(0, 4)) && !all.some((n) => n.kind === "listing" && n.month === lm && n.assets.includes(s.id))) {
      fail(`no listing news for ${s.id} in ${lm}`);
    }
    if (s.end) {
      const em = nextMonth(s.end.month);
      if (years.has(em.slice(0, 4)) && !all.some((n) => n.kind === "delisting" && (n.month === em || n.month === s.end!.month) && n.assets.includes(s.id))) {
        fail(`no delisting news for ${s.id} around ${em}`);
      }
    }
  }
}
