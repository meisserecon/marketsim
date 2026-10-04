import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Market, type AssetSeries, type NewsItem } from "@marketsim/shared";

const DEFAULT_DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "data", "out");

/** Loads every asset series the data pipeline produced. The market is immutable and kept in memory. */
export function loadMarket(dir = process.env.DATA_DIR ?? DEFAULT_DATA_DIR): Market {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  if (!files.length) throw new Error(`no asset files in ${dir}; run npm run data:build`);
  const series: AssetSeries[] = files.map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  return new Market(series);
}

const DEFAULT_NEWS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "data", "news");

/** Loads data/news/<year>.json files into one list sorted by month. An absent directory means no news. */
export function loadNews(dir = process.env.NEWS_DIR ?? DEFAULT_NEWS_DIR): NewsItem[] {
  if (!fs.existsSync(dir)) return [];
  const items: NewsItem[] = [];
  for (const f of fs.readdirSync(dir).filter((f) => /^\d{4}\.json$/.test(f)).sort()) {
    items.push(...(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as NewsItem[]));
  }
  return items.sort((a, b) => a.month.localeCompare(b.month));
}

/** The stock market index (S&P 500 month-end closes), a reference series and not an asset. Absent file: no benchmark. */
export function loadIndex(file = process.env.INDEX_FILE ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "data", "reference", "sp500.json")): { name: string; rows: { month: string; price: number }[] } | undefined {
  if (!fs.existsSync(file)) return undefined;
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  return { name: j.name ?? "Stock market", rows: j.rows };
}

export function addMonths(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  const total = y * 12 + (m - 1) + n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}
