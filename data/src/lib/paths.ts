import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.resolve(here, "..", "..");
export const RAW_DIR = path.join(DATA_DIR, "raw");
export const OUT_DIR = path.join(DATA_DIR, "out");
