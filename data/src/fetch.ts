/**
 * Downloads raw source files into data/raw. Raw files are committed so the build is
 * reproducible even if a source disappears (FRED already dropped its LBMA gold series).
 */
import fs from "node:fs";
import path from "node:path";
import { RAW_DIR } from "./lib/paths.js";

const FRED_SERIES = ["DGS1", "DGS5", "DGS10"]; // daily constant-maturity treasury yields, percent
const GOLD_URL = "https://datahub.io/core/gold-prices/r/monthly.csv"; // LBMA monthly average, USD/oz

async function download(url: string, file: string) {
  const res = await fetch(url, { headers: { "user-agent": "marketsim-data/0.1" } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  const text = await res.text();
  if (text.trimStart().startsWith("<")) throw new Error(`${url} returned HTML, not CSV`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  console.log(`${path.relative(RAW_DIR, file)}: ${text.split("\n").length - 1} lines`);
}

for (const id of FRED_SERIES) {
  await download(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`, path.join(RAW_DIR, "fred", `${id}.csv`));
}
await download(GOLD_URL, path.join(RAW_DIR, "gold", "lbma_monthly.csv"));
