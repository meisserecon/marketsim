import fs from "node:fs";

/** Parse a two-column CSV (header row, then `date,value`). Missing values (FRED uses "" or ".") are skipped. */
export function readTwoColumnCsv(file: string): { date: string; value: number }[] {
  const text = fs.readFileSync(file, "utf8");
  const rows: { date: string; value: number }[] = [];
  for (const line of text.split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue;
    const [date, raw] = line.split(",");
    if (!raw || raw.trim() === "" || raw.trim() === ".") continue;
    const value = Number(raw);
    if (!Number.isFinite(value)) continue;
    rows.push({ date: date.trim(), value });
  }
  return rows;
}

/** Parse a simple CSV with a header row into objects keyed by column name. Lines starting with # are comments. */
export function readCsv(file: string): Record<string, string>[] {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("#"));
  const header = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    return Object.fromEntries(header.map((h, i) => [h, cells[i] ?? ""]));
  });
}
