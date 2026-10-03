/**
 * Makes sure every beat is tagged with the assets it talks about: adds to `assets` each company
 * (by the names it carried) and gold when the title or text mentions it and it is in the game
 * that month. Never removes a tag. Run: npm run tags -w data
 */
import fs from "node:fs";
import path from "node:path";
import { OUT_DIR, DATA_DIR } from "./lib/paths.js";
import type { AssetSeries } from "./lib/asset.js";

const ARCS = path.join(DATA_DIR, "news", "arcs");
const assets = new Map<string, AssetSeries>();
for (const f of fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".json"))) {
  const s: AssetSeries = JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), "utf8"));
  assets.set(s.id, s);
}
const listedMonth = (s: AssetSeries) => (s.listed && s.listed > s.rows[0].month ? s.listed : s.rows[0].month);
const nextMonth = (m: string) => { const [y, mm] = m.split("-").map(Number); return mm === 12 ? `${y + 1}-01` : `${y}-${String(mm + 1).padStart(2, "0")}`; };
const inGame = (id: string, month: string) => {
  const s = assets.get(id);
  return !!s && month >= listedMonth(s) && (!s.end || month <= nextMonth(s.end.month));
};

const PATTERNS: Record<string, RegExp> = {
  gold: /\bgold\b(?!\s+(medal|rush|leaf|standard record))(?![- ]leaf)/i,
  ibm: /\bIBM\b/, ge: /\bGeneral Electric\b|\bGE\b(?! Aerospace\b)|\bGE Aerospace\b/, xom: /\bExxon(Mobil)?\b/, slb: /\bSchlumberger\b|\bSLB\b/,
  intc: /\bIntel\b/, ko: /\bCoca-Cola\b|\bCoke\b/, wmt: /\bWal-?Mart\b/i, ba: /\bBoeing\b/, mo: /\bPhilip Morris\b(?! International)|\bAltria\b/,
  c: /\bCitigroup\b|\bCiti\b/, mcd: /\bMcDonald's\b/, dis: /\bDisney\b/, brk: /\bBerkshire\b|\bBuffett\b/, aapl: /\bApple\b/, msft: /\bMicrosoft\b/,
  csco: /\bCisco\b/, amzn: /\bAmazon\b/, ebay: /\beBay\b/, nvda: /\bNvidia\b/i, tsla: /\bTesla\b/, mercedes: /\bDaimler(-Benz|Chrysler)?\b|\bMercedes\b/,
  bmw: /\bBMW\b/, sony: /\bSony\b/, siemens: /\bSiemens\b/, nokia: /\bNokia\b/, glencore: /\bGlencore\b/, xstrata: /\bXstrata\b/,
  nestle: /\bNestl[eé]\b/, novartis: /\bNovartis\b/, sandoz: /\bSandoz\b/, ubs: /\bUBS\b|\bBankgesellschaft\b|\bUnion Bank of Switzerland\b/,
  sbv: /\bBankverein\b|\bSwiss Bank Corporation\b/, "credit-suisse": /\bCredit Suisse\b|\bKreditanstalt\b|\bCS Holding\b/, ibj: /\bIndustrial Bank of Japan\b|\bIBJ\b/,
  enron: /\bEnron\b/, lehman: /\bLehman\b/, worldcom: /\bWorldCom\b|\bLDDS\b/, "pets-com": /\bPets\.com\b/,
};

/** Stories about interest rates and bond yields. */
const RATES = /\binterest rates?\b|\b(bond|Treasury) yields?\b|\bTreasur(y|ies)\b(?! Secretary| Department| secretary)|\bprime rate\b|\bdiscount rate\b|\bfederal funds\b|\brate (cut|rise|increase|hike)s?\b|\b(cuts?|raises?|lowers?|holds?) (its |the )?(key |benchmark |policy )?(interest )?rates?\b|\byields? (on|of) |\bbond (market|prices?|buying)\b|\bquantitative easing\b/i;

let added = 0, touched = 0;
const perAsset: Record<string, number> = {};
for (const f of fs.readdirSync(ARCS).filter((f) => f.endsWith(".beats.json")).sort()) {
  const arc = f.replace(".beats.json", "");
  const file = path.join(ARCS, f);
  const beats = JSON.parse(fs.readFileSync(file, "utf8")) as { month: string; title: string; what: string; assets: string[]; move?: { asset: string } }[];
  let changed = false;
  for (const b of beats) {
    const text = `${b.title} ${b.what}`;
    const want = new Set<string>();
    if (assets.has(arc)) want.add(arc);
    if (b.move && assets.has(b.move.asset) && assets.get(b.move.asset)!.kind !== "bond") want.add(b.move.asset);
    for (const [id, re] of Object.entries(PATTERNS)) if (re.test(text)) want.add(id);
    // "bonds" stands for the Treasuries on offer that month; the news generator expands it.
    if (!assets.has(arc) && arc !== "life" && RATES.test(text)) want.add("bonds");
    if (arc === "life" || assets.has(arc)) want.delete("gold"); // medals and records; in company arcs "Gold" is usually a surname
    for (const id of want) {
      if (b.assets.includes(id) || (id !== "bonds" && !inGame(id, b.month))) continue;
      b.assets.push(id); added++; changed = true; perAsset[id] = (perAsset[id] ?? 0) + 1;
    }
  }
  if (changed) { fs.writeFileSync(file, JSON.stringify(beats, null, 2) + "\n"); touched++; }
}
console.log(`tags: ${added} added in ${touched} arcs`, perAsset);
