import fs from "node:fs";

/** Parse a two-column CSV (header row, then `date,value`). Non-numeric values (FRED uses ".") are skipped. */
export function readTwoColumnCsv(file: string): { date: string; value: number }[] {
  const text = fs.readFileSync(file, "utf8");
  const rows: { date: string; value: number }[] = [];
  for (const line of text.split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue;
    const [date, raw] = line.split(",");
    if (!raw || raw.trim() === "" || raw.trim() === ".") continue; // FRED marks missing values as "" or "."
    const value = Number(raw);
    if (!Number.isFinite(value)) continue;
    rows.push({ date: date.trim(), value });
  }
  return rows;
}
