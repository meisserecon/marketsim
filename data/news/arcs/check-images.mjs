// Checks the picture sidecars: node data/news/arcs/check-images.mjs [arc ...]
// Every entry names an existing beat of its arc, its file exists under web/static, is a JPEG, PNG or WebP
// of at most 400 KB and at most 1600 px on the long side, and carries caption, source and licence.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.join(dir, "../../../web/static");
const MAX_BYTES = 400 * 1024;
const MAX_SIDE = 1600;

function dimensions(buf) {
  if (buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG") return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) return null;
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      i += 2 + len;
    }
    return null;
  }
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8X") return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
    if (chunk === "VP8 ") return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    if (chunk === "VP8L") { const b = buf.readUInt32LE(21); return { w: 1 + (b & 0x3fff), h: 1 + ((b >> 14) & 0x3fff) }; }
  }
  return null;
}

const args = process.argv.slice(2);
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".images.json") && (!args.length || args.includes(f.replace(".images.json", ""))));
let errors = 0;
const bad = (m) => { errors++; console.log("ERR", m); };
let total = 0;
for (const f of files) {
  const arc = f.replace(".images.json", "");
  const beatsFile = path.join(dir, `${arc}.beats.json`);
  if (!fs.existsSync(beatsFile)) { bad(`${f}: no beats file for ${arc}`); continue; }
  const ids = new Set(JSON.parse(fs.readFileSync(beatsFile, "utf8")).map((b) => b.id));
  let items;
  try { items = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch (e) { bad(`${f}: ${e.message}`); continue; }
  const seen = new Set();
  for (const [i, it] of items.entries()) {
    const where = `${f}[${i}]`;
    if (!ids.has(it.beat)) bad(`${where}: no beat ${it.beat} in ${arc}`);
    if (seen.has(it.beat)) bad(`${where}: beat ${it.beat} has two pictures`);
    seen.add(it.beat);
    for (const k of ["file", "caption", "source", "licence"]) if (typeof it[k] !== "string" || !it[k].trim()) bad(`${where}: missing ${k}`);
    if (typeof it.file !== "string") continue;
    if (!it.file.startsWith(`news/${arc}/`)) bad(`${where}: file should be under news/${arc}/`);
    if (!/\.(jpe?g|png|webp)$/i.test(it.file)) bad(`${where}: file type`);
    const p = path.join(staticDir, it.file);
    if (!fs.existsSync(p)) { bad(`${where}: file missing ${it.file}`); continue; }
    const size = fs.statSync(p).size;
    if (size === 0) bad(`${where}: empty file`);
    if (size > MAX_BYTES) bad(`${where}: ${Math.round(size / 1024)} KB, over ${MAX_BYTES / 1024}`);
    const d = dimensions(fs.readFileSync(p));
    if (!d) bad(`${where}: not a readable image`);
    else if (Math.max(d.w, d.h) > MAX_SIDE) bad(`${where}: ${d.w}x${d.h}, over ${MAX_SIDE}`);
    else if (Math.max(d.w, d.h) < 300) bad(`${where}: ${d.w}x${d.h}, too small`);
  }
  total += items.length;
  console.log(f, items.length, "pictures");
}
// orphan files
for (const arc of fs.existsSync(path.join(staticDir, "news")) ? fs.readdirSync(path.join(staticDir, "news")) : []) {
  const sidecar = path.join(dir, `${arc}.images.json`);
  const used = new Set(fs.existsSync(sidecar) ? JSON.parse(fs.readFileSync(sidecar, "utf8")).map((it) => path.basename(it.file)) : []);
  for (const f of fs.readdirSync(path.join(staticDir, "news", arc))) if (!used.has(f)) bad(`orphan file news/${arc}/${f}`);
}
console.log(total, "pictures;", errors ? `${errors} errors` : "OK");
process.exit(errors ? 1 : 0);
