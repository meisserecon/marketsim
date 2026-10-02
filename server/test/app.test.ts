import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { FastifyInstance } from "fastify";
import { Market, type AssetSeries, type GameView, type MarketView, type PortfolioView, type AssetHistory, type LeaderboardView } from "@marketsim/shared";
import { buildApp } from "../src/app.js";
import { migrate, openEmbedded, type Db } from "../src/db.js";
import { loadMarket } from "../src/market.js";

let db: Db;
let app: FastifyInstance;

before(async () => {
  db = await openEmbedded();
  await migrate(db);
  await migrate(db); // second run must be a no-op
  app = await buildApp(db, loadMarket());
});
after(async () => {
  await app.close();
  await db.close();
});

async function call<T = any>(a: FastifyInstance, method: "GET" | "POST", url: string, body?: unknown, token?: string): Promise<{ status: number; body: T }> {
  const res = await a.inject({ method, url, payload: body as any, headers: token ? { authorization: `Bearer ${token}` } : {} });
  return { status: res.statusCode, body: (res.body ? res.json() : undefined) as T };
}

test("a full round: create, join, trade, advance, income, leaderboard, no lookahead", async () => {
  // create
  const created = await call(app, "POST", "/api/games", { name: "Class of 1980" });
  assert.equal(created.status, 201);
  const code: string = created.body.game.code;
  const gm: string = created.body.gameMasterToken;
  assert.match(code, /^[A-Z2-9]{5}$/);
  assert.equal(created.body.game.currentMonth, "1979-12");
  assert.equal(created.body.game.status, "lobby");
  assert.equal(created.body.game.startingCash, 1_000);

  // join; codes are case-insensitive, names unique per game
  const alice = (await call(app, "POST", `/api/games/${code.toLowerCase()}/join`, { name: "Alice" })).body.playerToken as string;
  const bob = (await call(app, "POST", `/api/games/${code}/join`, { name: "Bob" })).body.playerToken as string;
  const dup = await call(app, "POST", `/api/games/${code}/join`, { name: "alice" });
  assert.equal(dup.status, 409);
  assert.equal(dup.body.error, "name_taken");
  assert.equal((await call<GameView>(app, "GET", `/api/games/${code}`)).body.playerCount, 2);

  // market in the base month: nothing from the future
  const market = (await call<MarketView>(app, "GET", `/api/games/${code}/market`)).body;
  assert.equal(market.month, "1979-12");
  const byId = new Map(market.assets.map((a) => [a.id, a]));
  for (const id of ["ibm", "ust1985", "ust1990", "ust2000", "gold", "xom", "mo"]) assert.ok(byId.has(id), `${id} should be quoted`);
  assert.ok(!byId.has("aapl"), "Apple lists in 1980-12");
  assert.ok(!byId.has("cash"));
  assert.equal(byId.get("xom")!.name, "Exxon");
  assert.equal(byId.get("mo")!.name, "Philip Morris");
  assert.ok(byId.get("ust2000")!.extra!.yield > 0.09);
  assert.equal(byId.get("ust2000")!.maturity, "2000-01-01");
  assert.ok(!byId.has("ust1995"), "the 1995 bond is listed only when the 1985 bond has matured");
  for (const a of market.assets) assert.ok(a.listedSince <= "1979-12");
  assert.ok(!JSON.stringify(market).includes("notes") && !JSON.stringify(market).includes('"end"') && !JSON.stringify(market).includes("source"));

  // an asset that is not listed yet is indistinguishable from one that does not exist
  assert.equal((await call(app, "GET", `/api/games/${code}/assets/aapl`)).status, 404);
  assert.equal((await call(app, "GET", `/api/games/${code}/assets/nonsense`)).status, 404);
  const ibm0 = (await call<AssetHistory>(app, "GET", `/api/games/${code}/assets/ibm`)).body;
  // history reaches back before the game start, as chart context, but never past the current month
  assert.equal(ibm0.rows[0].month, "1975-01");
  assert.ok(ibm0.profile!.tagline.length > 10 && /mainframes/.test(ibm0.profile!.about) && !/personal computer/.test(ibm0.profile!.about));
  assert.equal(ibm0.rows[ibm0.rows.length - 1].month, "1979-12");
  assert.ok(byId.get("ibm")!.priceYearAgo! > 0 && byId.get("ibm")!.incomeLastYear > 0);

  // trading needs a player token
  const trade = { assetId: "ust1985", side: "buy", amount: { usd: 500 } };
  assert.equal((await call(app, "POST", `/api/games/${code}/trades`, trade)).status, 401);
  assert.equal((await call(app, "POST", `/api/games/${code}/trades`, trade, gm)).status, 401);
  const t1 = await call(app, "POST", `/api/games/${code}/trades`, trade, alice);
  assert.equal(t1.status, 200);
  assert.equal(t1.body.portfolio.cash, 500);
  assert.equal(t1.body.entry.kind, "buy");
  await call(app, "POST", `/api/games/${code}/trades`, { assetId: "ibm", side: "buy", amount: { usd: 200 } }, alice);
  const broke = await call(app, "POST", `/api/games/${code}/trades`, { assetId: "gold", side: "buy", amount: { usd: 300.01 } }, alice);
  assert.equal(broke.status, 400);
  assert.equal(broke.body.error, "insufficient_cash");
  assert.equal((await call(app, "POST", `/api/games/${code}/trades`, { assetId: "aapl", side: "buy", amount: { usd: 10 } }, alice)).body.error, "not_tradable");
  assert.equal((await call(app, "POST", `/api/games/${code}/trades`, { assetId: "ibm", side: "hold", amount: { usd: 10 } }, alice)).status, 400);

  // only the game master advances time
  assert.equal((await call(app, "POST", `/api/games/${code}/advance`, undefined, alice)).status, 401);
  const adv = await call<GameView>(app, "POST", `/api/games/${code}/advance`, undefined, gm);
  assert.equal(adv.status, 200);
  assert.equal(adv.body.currentMonth, "1980-01");
  assert.equal(adv.body.status, "running");

  // Alice received a month of coupons in cash; nothing was reinvested
  const me = (await call<PortfolioView>(app, "GET", `/api/games/${code}/me`, undefined, alice)).body;
  assert.equal(me.month, "1980-01");
  assert.equal(me.cash, 300); // a zero bond pays nothing, and IBM pays no dividend in January
  assert.equal(me.positions.length, 2);
  assert.ok(!me.ledger.some((e) => e.kind === "income"));
  assert.deepEqual(me.history.map((h) => h.month), ["1979-12", "1980-01"]);
  assert.equal(me.history[0].totalValue, 1_000);
  assert.ok(Math.abs(me.history[1].totalValue - me.totalValue) < 0.01);
  assert.equal(me.maxPositions, 5);

  // history grew by exactly one month
  const ibm1 = (await call<AssetHistory>(app, "GET", `/api/games/${code}/assets/ibm`)).body;
  assert.equal(ibm1.rows.length, ibm0.rows.length + 1);
  assert.equal(ibm1.rows[ibm1.rows.length - 1].month, "1980-01");

  // leaderboard: Bob sat in cash
  const lb = (await call<LeaderboardView>(app, "GET", `/api/games/${code}/leaderboard`)).body;
  assert.equal(lb.players.length, 2);
  assert.equal(lb.players.find((p) => p.name === "Bob")!.totalValue, 1_000);
  assert.deepEqual(lb.players.map((p) => p.rank), [1, 2]);

  // advance to December 1980: Apple appears, under the name it had then
  for (let i = 0; i < 11; i++) await call(app, "POST", `/api/games/${code}/advance`, undefined, gm);
  // dividends land in cash and are never reinvested
  const meDec = (await call<PortfolioView>(app, "GET", `/api/games/${code}/me`, undefined, alice)).body;
  assert.ok(meDec.ledger.some((e) => e.kind === "income" && e.assetId === "ibm"), "IBM dividends are paid into cash");
  assert.ok(meDec.cash > 300);
  assert.equal(meDec.positions.length, 2);
  const dec = (await call<MarketView>(app, "GET", `/api/games/${code}/market`)).body;
  assert.equal(dec.month, "1980-12");
  const aapl = dec.assets.find((a) => a.id === "aapl");
  assert.equal(aapl?.name, "Apple Computer");
  assert.equal(aapl?.listedSince, "1980-12");
  assert.equal(aapl?.pricePrev, undefined);
  const aaplHist = await call<AssetHistory>(app, "GET", `/api/games/${code}/assets/aapl`);
  assert.equal(aaplHist.status, 200);
  // the profile is the one of 1980: it knows the Apple II and nothing that came later
  assert.match(aaplHist.body.profile!.about, /Apple II/);
  assert.ok(!/Macintosh|iPod|iPhone/.test(JSON.stringify(aaplHist.body.profile)));
  assert.equal(aaplHist.body.profile!.country, "United States");

  // a late joiner starts with the starting cash in the current month
  const carol = (await call(app, "POST", `/api/games/${code}/join`, { name: "Carol" })).body.playerToken as string;
  const carolView = (await call<PortfolioView>(app, "GET", `/api/games/${code}/me`, undefined, carol)).body;
  assert.equal(carolView.cash, 1_000);
  assert.deepEqual(carolView.history.map((h) => h.month), ["1980-12"]);
  assert.ok(bob);
});

test("creating a game needs the password when one is configured", async () => {
  const locked = await buildApp(db, loadMarket(), { createPassword: "s3cret" });
  try {
    assert.equal((await call(locked, "POST", "/api/games", { name: "x" })).status, 401);
    assert.equal((await call(locked, "POST", "/api/games", { name: "x", password: "wrong" })).body.error, "unauthorized");
    assert.equal((await call(locked, "POST", "/api/games", { name: "x", password: "s3cret" })).status, 201);
  } finally {
    await locked.close();
  }
});

test("unknown games and bad input", async () => {
  assert.equal((await call(app, "GET", "/api/games/ZZZZZ")).status, 404);
  assert.equal((await call(app, "POST", "/api/games", { name: "" })).status, 400);
  assert.equal((await call(app, "GET", "/api/nothing")).status, 404);
});

test("a game ends at the final month, winds up dead assets, and then refuses trades and advances", async () => {
  const months = ["1979-12", "1980-01", "1980-02"];
  const s = (id: string, prices: number[], extra: Partial<AssetSeries> = {}): AssetSeries => ({
    id, name: id, kind: "stock", currency: "USD", source: "test", rows: prices.map((price, i) => ({ month: months[i], price, income: 0 })), ...extra,
  });
  const tiny = new Market([
    s("cash", [1, 1, 1], { kind: "cash" }),
    s("a", [10, 20, 40]),
    s("bust", [10, 5], { end: { month: "1980-01", type: "bankruptcy", note: "Went under" } }),
  ]);
  const db2 = await openEmbedded();
  await migrate(db2);
  const app2 = await buildApp(db2, tiny);
  try {
    const g = (await call(app2, "POST", "/api/games", { name: "Tiny" })).body;
    const code = g.game.code, gm = g.gameMasterToken;
    assert.equal(g.game.finalMonth, "1980-02");
    const p = (await call(app2, "POST", `/api/games/${code}/join`, { name: "P" })).body.playerToken;
    await call(app2, "POST", `/api/games/${code}/trades`, { assetId: "a", side: "buy", amount: { usd: 500 } }, p);
    await call(app2, "POST", `/api/games/${code}/trades`, { assetId: "bust", side: "buy", amount: { all: true } }, p);
    assert.equal((await call<GameView>(app2, "POST", `/api/games/${code}/advance`, undefined, gm)).body.status, "running");
    const end = await call<GameView>(app2, "POST", `/api/games/${code}/advance`, undefined, gm);
    assert.equal(end.body.status, "finished");
    assert.equal(end.body.currentMonth, "1980-02");
    const me = (await call<PortfolioView>(app2, "GET", `/api/games/${code}/me`, undefined, p)).body;
    assert.equal(me.totalValue, 2000); // 50 units of a at 40; the bankrupt half is gone
    assert.deepEqual(me.positions.map((x) => x.assetId), ["a"]);
    assert.ok(me.ledger.some((e) => e.kind === "bankruptcy" && e.note === "Went under"));
    assert.equal((await call(app2, "POST", `/api/games/${code}/advance`, undefined, gm)).body.error, "game_finished");
    assert.equal((await call(app2, "POST", `/api/games/${code}/trades`, { assetId: "a", side: "sell", amount: { all: true } }, p)).body.error, "game_finished");
    assert.equal((await call(app2, "POST", `/api/games/${code}/join`, { name: "Late" })).body.error, "game_finished");
  } finally {
    await app2.close();
    await db2.close();
  }
});
