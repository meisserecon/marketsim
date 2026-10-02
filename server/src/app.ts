/**
 * The HTTP API described in shared/src/api.ts. All game rules come from the shared engine;
 * this file only does persistence, authentication and the no-lookahead projection of market data.
 */
import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import Fastify, { type FastifyInstance, type FastifyRequest } from "fastify";
import fastifyStatic from "@fastify/static";
import {
  MAX_POSITIONS, Market, STARTING_CASH, TradeError, profileAt, logoAt, advanceMonth, applyTrade, nameAt, portfolioValue,
  type ApiError, type AssetHistory, type AssetView, type CreateGameResponse, type GameEvent, type GameStatus, type GameView,
  type HoldingsView, type JoinResponse, type LeaderboardView, type LedgerEntry, type MarketView, type Portfolio, type PortfolioView,
  type Trade, type TradeResponse,
} from "@marketsim/shared";
import type { Db, Queryable } from "./db.js";
import { addMonths } from "./market.js";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I
const LEDGER_LIMIT = 500;

class HttpError extends Error {
  constructor(public readonly status: number, public readonly code: ApiError["error"], message: string) {
    super(message);
  }
}

interface GameRow {
  id: string; code: string; name: string; status: GameStatus; current_month: string; final_month: string;
  starting_cash: string; gm_token_hash: string;
}
interface PlayerRow { id: string; game_id: string; name: string; cash: string }

const hash = (token: string) => createHash("sha256").update(token).digest("hex");
const newToken = () => randomBytes(24).toString("hex");
const newCode = () => Array.from({ length: 5 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("");

function bearer(req: FastifyRequest): string {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) throw new HttpError(401, "unauthorized", "Missing bearer token");
  return h.slice(7).trim();
}

export interface AppOptions {
  /** Directory with the built web client; served with an SPA fallback when it exists. */
  staticDir?: string;
  logger?: boolean;
  /** When set, creating a game requires this password. */
  createPassword?: string;
}

export async function buildApp(db: Db, market: Market, opts: AppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({ logger: opts.logger ?? false });
  const subscribers = new Map<string, Set<(e: GameEvent) => void>>();

  function broadcast(code: string, event: GameEvent) {
    for (const send of subscribers.get(code) ?? []) send(event);
  }

  // --- loading and saving ------------------------------------------------------

  async function gameByCode(q: Queryable, code: string, lock: "" | "for update" | "for share" = ""): Promise<GameRow> {
    const { rows } = await q.query<GameRow>(`select * from games where code = $1 ${lock}`, [String(code).toUpperCase()]);
    if (!rows[0]) throw new HttpError(404, "not_found", "No game with this code");
    return rows[0];
  }

  async function gameView(q: Queryable, g: GameRow): Promise<GameView> {
    const { rows } = await q.query<{ n: string }>("select count(*) as n from players where game_id = $1", [g.id]);
    return {
      code: g.code, name: g.name, status: g.status, currentMonth: g.current_month, finalMonth: g.final_month,
      startingCash: Number(g.starting_cash), playerCount: Number(rows[0].n),
    };
  }

  async function playerByToken(q: Queryable, req: FastifyRequest, gameId: string, lock: "" | "for update" = ""): Promise<PlayerRow> {
    const { rows } = await q.query<PlayerRow>(`select * from players where token_hash = $1 and game_id = $2 ${lock}`, [hash(bearer(req)), gameId]);
    if (!rows[0]) throw new HttpError(401, "unauthorized", "Not a player in this game");
    return rows[0];
  }

  async function loadPortfolio(q: Queryable, player: PlayerRow): Promise<Portfolio> {
    const { rows } = await q.query<{ asset_id: string; units: string }>("select asset_id, units from holdings where player_id = $1 order by asset_id", [player.id]);
    const holdings: Record<string, number> = {};
    for (const r of rows) holdings[r.asset_id] = Number(r.units);
    return { cash: Number(player.cash), holdings };
  }

  async function savePortfolio(q: Queryable, playerId: string, p: Portfolio) {
    await q.query("update players set cash = $1 where id = $2", [p.cash, playerId]);
    await q.query("delete from holdings where player_id = $1", [playerId]);
    for (const [assetId, units] of Object.entries(p.holdings)) {
      await q.query("insert into holdings (player_id, asset_id, units) values ($1, $2, $3)", [playerId, assetId, units]);
    }
  }

  async function saveLedger(q: Queryable, playerId: string, entries: LedgerEntry[]) {
    for (const e of entries) {
      await q.query(
        "insert into ledger (player_id, month, kind, asset_id, units, price, cash, note) values ($1, $2, $3, $4, $5, $6, $7, $8)",
        [playerId, e.month, e.kind, e.assetId, e.units, e.price, e.cash, e.note ?? null],
      );
    }
  }

  async function saveSnapshot(q: Queryable, playerId: string, month: string, p: Portfolio) {
    await q.query(
      `insert into snapshots (player_id, month, total_value, cash) values ($1, $2, $3, $4)
       on conflict (player_id, month) do update set total_value = excluded.total_value, cash = excluded.cash`,
      [playerId, month, portfolioValue(p, market, month), p.cash],
    );
  }

  function positionViews(p: Portfolio, month: string) {
    return Object.entries(p.holdings).map(([assetId, units]) => {
      const price = market.valuationPrice(assetId, month) ?? 0;
      return { assetId, name: nameAt(market.asset(assetId)!, month), units, price, value: units * price };
    }).sort((a, b) => b.value - a.value);
  }

  async function portfolioView(q: Queryable, g: GameRow, player: PlayerRow): Promise<PortfolioView> {
    const month = g.current_month;
    const p = await loadPortfolio(q, player);
    const positions = positionViews(p, month);
    const history = await q.query<{ month: string; total_value: string; cash: string }>(
      "select month, total_value, cash from snapshots where player_id = $1 order by month", [player.id]);
    const ledger = await q.query<any>(
      "select month, kind, asset_id, units, price, cash, note from ledger where player_id = $1 order by id desc limit $2", [player.id, LEDGER_LIMIT]);
    return {
      playerId: player.id, name: player.name, month, cash: p.cash, positions,
      totalValue: portfolioValue(p, market, month), maxPositions: MAX_POSITIONS,
      history: history.rows.map((r) => ({ month: r.month, totalValue: Number(r.total_value), cash: Number(r.cash) })),
      ledger: ledger.rows.map((r): LedgerEntry => ({
        month: r.month, kind: r.kind, assetId: r.asset_id, assetName: ledgerName(r.asset_id, r.month), units: Number(r.units), price: Number(r.price), cash: Number(r.cash),
        ...(r.note ? { note: r.note } : {}),
      })),
    };
  }

  /** The name an asset carried when a ledger entry was written; for an asset that has ended, its last name. */
  function ledgerName(assetId: string, month: string): string {
    const a = market.asset(assetId);
    if (!a) return assetId;
    const last = market.lastMonth(assetId);
    return nameAt(a, month < last ? month : last);
  }

  // --- market projection: nothing after the current month leaves the server ---

  function assetView(id: string, month: string): AssetView {
    const a = market.asset(id)!;
    const row = market.row(id, month)!;
    let incomeLastYear = 0;
    for (let i = 0; i < 12; i++) incomeLastYear += market.row(id, addMonths(month, -i))?.income ?? 0;
    const prev = market.row(id, addMonths(month, -1))?.price;
    const yearAgo = market.row(id, addMonths(month, -12))?.price;
    return {
      id, name: nameAt(a, month), kind: a.kind, price: row.price,
      ...(prev !== undefined ? { pricePrev: prev } : {}),
      ...(yearAgo !== undefined ? { priceYearAgo: yearAgo } : {}),
      income: row.income, incomeLastYear,
      ...(row.extra ? { extra: row.extra } : {}),
      ...(a.maturity ? { maturity: a.maturity } : {}),
      listedSince: market.listedMonth(id),
    };
  }

  // --- routes ----------------------------------------------------------------

  app.post("/api/games", async (req, reply): Promise<CreateGameResponse> => {
    const body = (req.body ?? {}) as { name?: unknown; password?: unknown };
    if (opts.createPassword) {
      const given = hash(typeof body.password === "string" ? body.password : "");
      if (!timingSafeEqual(Buffer.from(given), Buffer.from(hash(opts.createPassword)))) throw new HttpError(401, "unauthorized", "Wrong password");
    }
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 60) throw new HttpError(400, "bad_request", "A game needs a name of at most 60 characters");
    const token = newToken();
    for (let attempt = 0; ; attempt++) {
      const code = newCode();
      const taken = await db.query("select 1 from games where code = $1", [code]);
      if (taken.rows.length) { if (attempt > 20) throw new Error("could not allocate a game code"); continue; }
      const { rows } = await db.query<GameRow>(
        `insert into games (code, name, current_month, final_month, starting_cash, gm_token_hash)
         values ($1, $2, $3, $4, $5, $6) returning *`,
        [code, name, market.startMonth, market.finalMonth, STARTING_CASH, hash(token)],
      );
      reply.code(201);
      return { game: await gameView(db, rows[0]), gameMasterToken: token };
    }
  });

  app.get<{ Params: { code: string } }>("/api/games/:code", async (req): Promise<GameView> => {
    return gameView(db, await gameByCode(db, req.params.code));
  });

  app.post<{ Params: { code: string } }>("/api/games/:code/join", async (req, reply): Promise<JoinResponse> => {
    const body = (req.body ?? {}) as { name?: unknown };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 30) throw new HttpError(400, "bad_request", "A player needs a name of at most 30 characters");
    const token = newToken();
    const result = await db.tx(async (q) => {
      const g = await gameByCode(q, req.params.code, "for share");
      if (g.status === "finished") throw new HttpError(409, "game_finished", "This game is over");
      const clash = await q.query("select 1 from players where game_id = $1 and lower(name) = lower($2)", [g.id, name]);
      if (clash.rows.length) throw new HttpError(409, "name_taken", "Someone in this game already uses that name");
      const { rows } = await q.query<PlayerRow>(
        "insert into players (game_id, name, token_hash, cash) values ($1, $2, $3, $4) returning *", [g.id, name, hash(token), g.starting_cash]);
      await saveSnapshot(q, rows[0].id, g.current_month, { cash: Number(g.starting_cash), holdings: {} });
      return { player: rows[0], game: await gameView(q, g) };
    });
    broadcast(result.game.code, { type: "player-joined", name, playerCount: result.game.playerCount });
    reply.code(201);
    return { playerId: result.player.id, name, playerToken: token };
  });

  app.get<{ Params: { code: string } }>("/api/games/:code/market", async (req): Promise<MarketView> => {
    const g = await gameByCode(db, req.params.code);
    const month = g.current_month;
    return { month, assets: market.ids().filter((id) => market.isTradable(id, month)).map((id) => assetView(id, month)) };
  });

  app.get<{ Params: { code: string; id: string } }>("/api/games/:code/assets/:id", async (req): Promise<AssetHistory> => {
    const g = await gameByCode(db, req.params.code);
    const a = market.asset(req.params.id);
    // An asset that is not listed yet must look exactly like one that does not exist.
    if (!a || a.kind === "cash" || market.listedMonth(a.id) > g.current_month) throw new HttpError(404, "not_found", "No such asset");
    const rows = a.rows.filter((r) => r.month <= g.current_month);
    const last = rows[rows.length - 1].month;
    const asOf = last < g.current_month ? last : g.current_month;
    const p = profileAt(a, asOf);
    const logo = logoAt(a, asOf);
    return {
      id: a.id, name: nameAt(a, asOf), kind: a.kind,
      ...(p ? { profile: { tagline: p.tagline, about: p.about, ...(a.country ? { country: a.country } : {}), ...(a.sector ? { sector: a.sector } : {}), ...(logo ? { logo: `/logos/${logo}` } : {}), ...(p.image ? { image: p.image } : {}), ...(p.imageCaption ? { imageCaption: p.imageCaption } : {}) } } : {}),
      rows: rows.map((r) => ({ month: r.month, price: r.price, income: r.income, ...(r.extra ? { extra: r.extra } : {}) })),
    };
  });

  app.get<{ Params: { code: string } }>("/api/games/:code/me", async (req): Promise<PortfolioView> => {
    const g = await gameByCode(db, req.params.code);
    return portfolioView(db, g, await playerByToken(db, req, g.id));
  });

  app.post<{ Params: { code: string } }>("/api/games/:code/trades", async (req): Promise<TradeResponse> => {
    const trade = parseTrade(req.body);
    return db.tx(async (q) => {
      // A shared lock on the game keeps the month from advancing in the middle of a trade.
      const g = await gameByCode(q, req.params.code, "for share");
      if (g.status === "finished") throw new HttpError(409, "game_finished", "This game is over");
      const player = await playerByToken(q, req, g.id, "for update");
      let result;
      try {
        result = applyTrade(await loadPortfolio(q, player), market, g.current_month, trade);
      } catch (e) {
        if (e instanceof TradeError) throw new HttpError(e.code === "unknown_asset" ? 404 : 400, e.code, e.message);
        throw e;
      }
      await savePortfolio(q, player.id, result.portfolio);
      await saveLedger(q, player.id, [result.entry]);
      const updated = { ...player, cash: String(result.portfolio.cash) };
      return { portfolio: await portfolioView(q, g, updated), entry: { ...result.entry, assetName: ledgerName(result.entry.assetId, result.entry.month) } };
    });
  });

  app.get<{ Params: { code: string } }>("/api/games/:code/leaderboard", async (req): Promise<LeaderboardView> => {
    const g = await gameByCode(db, req.params.code);
    const { rows: players } = await db.query<PlayerRow>("select * from players where game_id = $1", [g.id]);
    const snapshots = await db.query<{ player_id: string; month: string; total_value: string }>(
      "select s.player_id, s.month, s.total_value from snapshots s join players p on p.id = s.player_id where p.game_id = $1 and s.month < $2 order by s.month",
      [g.id, g.current_month]);
    const valued = [];
    for (const pl of players) {
      const totalValue = portfolioValue(await loadPortfolio(db, pl), market, g.current_month);
      const history = snapshots.rows.filter((s) => s.player_id === pl.id).map((s) => ({ month: s.month, totalValue: Number(s.total_value) }));
      history.push({ month: g.current_month, totalValue });
      valued.push({ playerId: pl.id, name: pl.name, totalValue, history });
    }
    valued.sort((a, b) => b.totalValue - a.totalValue || a.name.localeCompare(b.name));
    let rank = 0;
    let last = Number.NaN;
    const ranked = valued.map((v, i) => {
      if (v.totalValue !== last) { rank = i + 1; last = v.totalValue; }
      return { ...v, rank };
    });
    return { month: g.current_month, players: ranked };
  });

  app.get<{ Params: { code: string } }>("/api/games/:code/holdings", async (req): Promise<HoldingsView> => {
    const g = await gameByCode(db, req.params.code);
    if (hash(bearer(req)) !== g.gm_token_hash) throw new HttpError(401, "unauthorized", "Only the game master can see everybody's positions");
    const { rows: players } = await db.query<PlayerRow>("select * from players where game_id = $1", [g.id]);
    const out = [];
    for (const pl of players) {
      const p = await loadPortfolio(db, pl);
      out.push({ playerId: pl.id, name: pl.name, cash: p.cash, totalValue: portfolioValue(p, market, g.current_month), positions: positionViews(p, g.current_month) });
    }
    out.sort((a, b) => b.totalValue - a.totalValue || a.name.localeCompare(b.name));
    return { month: g.current_month, players: out };
  });

  app.post<{ Params: { code: string } }>("/api/games/:code/advance", async (req): Promise<GameView> => {
    const token = bearer(req);
    const view = await db.tx(async (q) => {
      const g = await gameByCode(q, req.params.code, "for update");
      if (hash(token) !== g.gm_token_hash) throw new HttpError(401, "unauthorized", "Only the game master can advance time");
      if (g.status === "finished" || g.current_month >= g.final_month) throw new HttpError(409, "game_finished", "This game has reached its final month");
      const { rows: players } = await q.query<PlayerRow>("select * from players where game_id = $1 for update", [g.id]);
      let month = g.current_month;
      for (const pl of players) {
        const step = advanceMonth(await loadPortfolio(q, pl), market, g.current_month);
        month = step.month;
        await savePortfolio(q, pl.id, step.portfolio);
        await saveLedger(q, pl.id, step.entries);
        await saveSnapshot(q, pl.id, step.month, step.portfolio);
      }
      if (!players.length) month = addMonths(g.current_month, 1);
      const status: GameStatus = month >= g.final_month ? "finished" : "running";
      const { rows } = await q.query<GameRow>(
        "update games set current_month = $1, status = $2, advanced_at = now() where id = $3 returning *", [month, status, g.id]);
      return gameView(q, rows[0]);
    });
    broadcast(view.code, { type: view.status === "finished" ? "game-finished" : "month-advanced", game: view });
    return view;
  });

  app.get<{ Params: { code: string } }>("/api/games/:code/events", async (req, reply) => {
    const g = await gameByCode(db, req.params.code);
    reply.hijack();
    const res = reply.raw;
    res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache, no-transform", connection: "keep-alive", "x-accel-buffering": "no" });
    res.write("retry: 3000\n\n");
    const send = (e: GameEvent) => res.write(`data: ${JSON.stringify(e)}\n\n`);
    const set = subscribers.get(g.code) ?? new Set();
    subscribers.set(g.code, set);
    set.add(send);
    const keepAlive = setInterval(() => res.write(": keep-alive\n\n"), 25_000);
    req.raw.on("close", () => {
      clearInterval(keepAlive);
      set.delete(send);
      if (!set.size) subscribers.delete(g.code);
    });
  });

  // --- errors and static files -------------------------------------------------

  app.setErrorHandler((err: any, _req, reply) => {
    if (err instanceof HttpError) return reply.code(err.status).send({ error: err.code, message: err.message } satisfies ApiError);
    if (err.validation || err.statusCode === 400 || err.statusCode === 415) return reply.code(400).send({ error: "bad_request", message: err.message } satisfies ApiError);
    app.log.error(err);
    console.error(err);
    return reply.code(500).send({ error: "bad_request", message: "Internal server error" } satisfies ApiError);
  });

  const staticDir = opts.staticDir;
  const hasClient = !!staticDir && fs.existsSync(path.join(staticDir, "index.html"));
  if (hasClient) await app.register(fastifyStatic, { root: staticDir!, wildcard: false });
  app.setNotFoundHandler((req, reply) => {
    if (hasClient && req.method === "GET" && !req.url.startsWith("/api/")) return reply.type("text/html").send(fs.readFileSync(path.join(staticDir!, "index.html")));
    return reply.code(404).send({ error: "not_found", message: "Not found" } satisfies ApiError);
  });

  return app;
}

function parseTrade(body: unknown): Trade {
  const b = (body ?? {}) as any;
  const bad = (m: string) => new HttpError(400, "bad_request", m);
  if (typeof b.assetId !== "string" || !b.assetId) throw bad("assetId is required");
  if (b.side !== "buy" && b.side !== "sell") throw bad("side must be buy or sell");
  const a = b.amount;
  if (!a || typeof a !== "object") throw bad("amount is required");
  if (a.all === true) return { assetId: b.assetId, side: b.side, amount: { all: true } };
  if (typeof a.usd === "number") return { assetId: b.assetId, side: b.side, amount: { usd: a.usd } };
  if (typeof a.units === "number") return { assetId: b.assetId, side: b.side, amount: { units: a.units } };
  throw bad("amount must be { usd }, { units } or { all: true }");
}
