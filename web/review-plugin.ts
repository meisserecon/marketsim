/**
 * Dev-only Vite plugin behind the /review page: serves the story-arc beats and the price data,
 * and writes the curator's decisions (lead, note, deletions) back into data/news/arcs/*.beats.json.
 * Never part of a production build.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const ROOT = path.resolve(process.cwd(), '..');
const ARCS = path.join(ROOT, 'data', 'news', 'arcs');
const OUT = path.join(ROOT, 'data', 'out');

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function data() {
  const arcs: Record<string, unknown[]> = {};
  const images: Record<string, Record<string, unknown>> = {};
  if (fs.existsSync(ARCS)) {
    for (const f of fs.readdirSync(ARCS).filter((f) => f.endsWith('.beats.json')).sort()) arcs[f.replace('.beats.json', '')] = readJson(path.join(ARCS, f));
    // Picture sidecars, keyed by beat id.
    for (const f of fs.readdirSync(ARCS).filter((f) => f.endsWith('.images.json'))) {
      const byBeat: Record<string, unknown> = {};
      for (const it of readJson(path.join(ARCS, f)) as { beat: string }[]) byBeat[it.beat] = it;
      images[f.replace('.images.json', '')] = byBeat;
    }
  }
  const assets: Record<string, { name: string; renames?: { from: string; name: string }[]; listed: string; end?: string; prices: Record<string, number> }> = {};
  for (const f of fs.readdirSync(OUT).filter((f) => f.endsWith('.json'))) {
    const s = readJson(path.join(OUT, f));
    if (s.kind === 'cash' || s.kind === 'bond') continue;
    const prices: Record<string, number> = {};
    for (const r of s.rows) prices[r.month] = r.price;
    assets[s.id] = { name: s.name, renames: s.renames, listed: s.listed && s.listed > s.rows[0].month ? s.listed : s.rows[0].month, end: s.end?.month, prices };
  }
  const spFile = path.join(ROOT, 'data', 'reference', 'sp500.json');
  if (fs.existsSync(spFile)) {
    const sp = readJson(spFile);
    const prices: Record<string, number> = {};
    for (const r of sp.rows) prices[r.month] = r.price;
    assets.sp500 = { name: 'S&P 500', listed: sp.rows[0].month, prices };
  }
  return { arcs, assets, images };
}

export function reviewPlugin(): Plugin {
  return {
    name: 'marketsim-review',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__review/data', (_req, res) => {
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify(data()));
      });
      server.middlewares.use('/__review/beat', (req, res) => {
        if (req.method !== 'POST') return void ((res.statusCode = 405), res.end());
        let body = '';
        req.on('data', (c) => (body += c));
        req.on('end', () => {
          try {
            const { arc, index, id, patch } = JSON.parse(body) as { arc: string; index: number; id?: string; patch: Record<string, unknown> };
            if (!/^[a-z0-9-]+$/.test(arc)) throw new Error('bad arc id');
            const file = path.join(ARCS, `${arc}.beats.json`);
            const beats = readJson(file) as Record<string, unknown>[];
            // By id: the file may have changed on disk since the page was loaded, and positions with it.
            const b = id ? beats.find((x) => x.id === id) : beats[index];
            if (!b) throw new Error('this beat is no longer in the file: reload the page');
            // Only the curator's fields; the beat's substance is edited in the file by hand.
            for (const k of ['note', 'lead', 'changed'] as const) {
              if (!(k in patch)) continue;
              if (patch[k] === null || patch[k] === undefined || patch[k] === false || patch[k] === '') delete b[k];
              else b[k] = patch[k];
            }
            fs.writeFileSync(file, JSON.stringify(beats, null, 2) + '\n');
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ ok: true, beat: b }));
          } catch (e) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: (e as Error).message }));
          }
        });
      });
      server.middlewares.use('/__review/delete', (req, res) => {
        if (req.method !== 'POST') return void ((res.statusCode = 405), res.end());
        let body = '';
        req.on('data', (c) => (body += c));
        req.on('end', () => {
          try {
            const { arc, index, id } = JSON.parse(body) as { arc: string; index: number; id?: string };
            if (!/^[a-z0-9-]+$/.test(arc)) throw new Error('bad arc id');
            const file = path.join(ARCS, `${arc}.beats.json`);
            const beats = readJson(file) as Record<string, unknown>[];
            const at = id ? beats.findIndex((x) => x.id === id) : index;
            if (!beats[at]) throw new Error('this beat is no longer in the file: reload the page');
            // Gone for good from the file; git history keeps it.
            beats.splice(at, 1);
            fs.writeFileSync(file, JSON.stringify(beats, null, 2) + '\n');
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ ok: true, beats }));
          } catch (e) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: (e as Error).message }));
          }
        });
      });
    }
  };
}
