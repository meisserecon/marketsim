/**
 * Turns the curated story-arc beats (data/news/arcs/*.beats.json) and their picture sidecars
 * into the news the game serves: data/news/<year>.json. Run after `npm run build -w data`.
 *
 * A beat becomes an item when it is not cut and has importance 1 or 2; listings and exits are
 * always included. The beat's title and text are used as they are.
 */
import fs from "node:fs";
import path from "node:path";
import { OUT_DIR, DATA_DIR } from "./lib/paths.js";
import type { AssetSeries } from "./lib/asset.js";
import type { NewsItem, NewsKind } from "@marketsim/shared";

const ARCS = path.join(DATA_DIR, "news", "arcs");
const NEWS = path.join(DATA_DIR, "news");
const MAX_IMPORTANCE = 2;

interface Beat {
  id: string; month: string; title: string; what: string; assets: string[]; importance: number;
  source: string; cut?: boolean; lead?: boolean;
}
interface Picture { beat: string; file: string; caption: string; credit?: string; licence: string }

const assets = new Map<string, AssetSeries>();
for (const f of fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".json"))) {
  const s: AssetSeries = JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), "utf8"));
  assets.set(s.id, s);
}
const listedMonth = (s: AssetSeries) => (s.listed && s.listed > s.rows[0].month ? s.listed : s.rows[0].month);
const nextMonth = (m: string) => {
  const [y, mm] = m.split("-").map(Number);
  return mm === 12 ? `${y + 1}-01` : `${y}-${String(mm + 1).padStart(2, "0")}`;
};
const inGame = (id: string, month: string) => {
  const s = assets.get(id);
  return !!s && s.kind === "stock" && month >= listedMonth(s) && (!s.end || month <= nextMonth(s.end.month));
};

const items: (NewsItem & { rank: number })[] = [];
let withPicture = 0;
for (const f of fs.readdirSync(ARCS).filter((f) => f.endsWith(".beats.json")).sort()) {
  const arc = f.replace(".beats.json", "");
  const beats: Beat[] = JSON.parse(fs.readFileSync(path.join(ARCS, f), "utf8"));
  const sidecar = path.join(ARCS, `${arc}.images.json`);
  const pictures = new Map<string, Picture>(fs.existsSync(sidecar) ? (JSON.parse(fs.readFileSync(sidecar, "utf8")) as Picture[]).map((p) => [p.beat, p]) : []);
  const company = assets.get(arc);
  const live = beats.filter((b) => !b.cut);

  // The listing beat: the arc's first beat in the listing month. The exit beat: its most important beat in the last month or the one after.
  const listing = company && listedMonth(company) > "1979-12" ? live.find((b) => b.month === listedMonth(company)) : undefined;
  const exit = company?.end
    ? live.filter((b) => b.month === company.end!.month || b.month === nextMonth(company.end!.month)).sort((a, b) => a.importance - b.importance || b.month.localeCompare(a.month))[0]
    : undefined;

  for (const b of live) {
    const kind: NewsKind = b === listing ? "listing" : b === exit ? "delisting" : arc === "life" ? "colour" : company ? "company" : "world";
    if (b.importance > MAX_IMPORTANCE && kind !== "listing" && kind !== "delisting") continue;
    const p = pictures.get(b.id);
    if (p) withPicture++;
    const tagged = [...new Set([...(company && (kind === "listing" || kind === "delisting") ? [arc] : []), ...b.assets])].filter((id) => inGame(id, b.month));
    items.push({
      month: b.month, kind, headline: b.title, text: b.what, assets: tagged, source: b.source,
      ...(p ? { image: `/${p.file}`, imageCaption: p.caption, imageCredit: p.credit ?? p.licence.replace(/^fair use: /, "") } : {}),
      rank: (b.lead ? 0 : 10) + (kind === "listing" || kind === "delisting" ? 0 : 1) + b.importance,
    });
  }
}

// Every entry and exit must be told. Where the curator kept no beat for one, a plain item is made from the company's profile and end note.
const nameIn = (s: AssetSeries, month: string) => { let n = s.name; for (const r of s.renames ?? []) if (r.from <= month) n = r.name; return n; };
for (const s of assets.values()) {
  if (s.kind !== "stock") continue;
  const lm = listedMonth(s);
  if (lm > "1979-12" && !items.some((i) => i.kind === "listing" && i.month === lm && i.assets.includes(s.id))) {
    const profile = [...(s.profiles ?? [])].reverse().find((p) => p.from <= lm);
    items.push({ month: lm, kind: "listing", headline: `${nameIn(s, lm)} is now available to you`, text: profile ? `${profile.about} You can buy its shares from this month.` : `${nameIn(s, lm)} can be bought from this month.`, assets: [s.id], source: "generated from the company profile", rank: 1 });
  }
  if (s.end) {
    const em = nextMonth(s.end.month);
    if (!items.some((i) => i.kind === "delisting" && (i.month === em || i.month === s.end!.month) && i.assets.includes(s.id))) {
      items.push({ month: em, kind: "delisting", headline: `${nameIn(s, s.end.month)} leaves the market`, text: `${s.end.note}. The shares are no longer traded.`, assets: [s.id], source: "generated from the end note", rank: 1 });
    }
  }
}

// One file per year; drop years that no longer have items.
for (const f of fs.readdirSync(NEWS).filter((f) => /^\d{4}\.json$/.test(f))) fs.rmSync(path.join(NEWS, f));
const byYear = new Map<string, typeof items>();
for (const it of items) byYear.set(it.month.slice(0, 4), [...(byYear.get(it.month.slice(0, 4)) ?? []), it]);
for (const [year, list] of [...byYear].sort()) {
  list.sort((a, b) => a.month.localeCompare(b.month) || a.rank - b.rank);
  fs.writeFileSync(path.join(NEWS, `${year}.json`), JSON.stringify(list.map(({ rank: _rank, ...it }) => it), null, 2) + "\n");
}
const months = new Set(items.map((i) => i.month));
console.log(`news: ${items.length} items in ${months.size} months, ${byYear.size} years; ${withPicture} with a picture`);
