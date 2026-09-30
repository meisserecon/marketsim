import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Market, MAX_POSITIONS, TradeError, advanceMonth, applyTrade, emptyPortfolio, nextMonth, portfolioValue,
  type AssetSeries, type Portfolio, type TradeErrorCode,
} from "../src/index.js";

const MONTHS = ["1979-12", "1980-01", "1980-02", "1980-03"];

function series(id: string, prices: number[], opts: Partial<AssetSeries> & { incomes?: number[]; from?: number } = {}): AssetSeries {
  const from = opts.from ?? 0;
  return {
    id,
    name: id.toUpperCase(),
    kind: opts.kind ?? "stock",
    currency: "USD",
    source: "test",
    end: opts.end,
    rows: prices.map((price, i) => ({ month: MONTHS[from + i], price, income: opts.incomes?.[i] ?? 0 })),
  };
}

function market(extra: AssetSeries[] = []): Market {
  return new Market([
    series("cash", [1, 1, 1, 1], { kind: "cash" }),
    series("a", [10, 11, 12, 13], { incomes: [0, 0.5, 0, 0.25] }),
    series("late", [20, 22], { from: 2 }),
    series("bust", [5, 1], { end: { month: "1980-01", type: "bankruptcy", note: "Chapter 11" } }),
    series("bought", [8, 9], { end: { month: "1980-01", type: "acquisition", note: "Taken over" } }),
    series("merged", [4, 6], { end: { month: "1980-01", type: "merger", note: "Merged into A", successor: "a" } }),
    ...extra,
  ]);
}

function expectTradeError(fn: () => unknown, code: TradeErrorCode) {
  assert.throws(fn, (e: unknown) => e instanceof TradeError && e.code === code);
}

test("nextMonth rolls over the year", () => {
  assert.equal(nextMonth("1979-12"), "1980-01");
  assert.equal(nextMonth("1980-01"), "1980-02");
});

test("buying by USD amount and selling everything returns the cash", () => {
  const m = market();
  let p = emptyPortfolio(1000);
  const bought = applyTrade(p, m, "1979-12", { assetId: "a", side: "buy", amount: { usd: 400 } });
  p = bought.portfolio;
  assert.equal(p.holdings.a, 40);
  assert.equal(p.cash, 600);
  assert.equal(bought.entry.cash, -400);
  assert.equal(portfolioValue(p, m, "1979-12"), 1000);

  const sold = applyTrade(p, m, "1979-12", { assetId: "a", side: "sell", amount: { all: true } });
  assert.deepEqual(sold.portfolio, { cash: 1000, holdings: {} });
  assert.equal(sold.entry.units, -40);
});

test("buy all spends all cash; the original portfolio is not mutated", () => {
  const m = market();
  const p = emptyPortfolio(1000);
  const { portfolio } = applyTrade(p, m, "1979-12", { assetId: "a", side: "buy", amount: { all: true } });
  assert.equal(portfolio.cash, 0);
  assert.equal(portfolio.holdings.a, 100);
  assert.deepEqual(p, { cash: 1000, holdings: {} });
});

test("trades are rejected without enough cash or units, and for nonsense amounts", () => {
  const m = market();
  const p: Portfolio = { cash: 100, holdings: { a: 5 } };
  expectTradeError(() => applyTrade(p, m, "1979-12", { assetId: "a", side: "buy", amount: { usd: 100.01 } }), "insufficient_cash");
  expectTradeError(() => applyTrade(p, m, "1979-12", { assetId: "a", side: "sell", amount: { units: 6 } }), "insufficient_units");
  expectTradeError(() => applyTrade(p, m, "1979-12", { assetId: "a", side: "buy", amount: { units: 0 } }), "invalid_amount");
  expectTradeError(() => applyTrade(p, m, "1979-12", { assetId: "a", side: "buy", amount: { usd: -5 } }), "invalid_amount");
  expectTradeError(() => applyTrade(p, m, "1979-12", { assetId: "bought", side: "sell", amount: { all: true } }), "invalid_amount");
  expectTradeError(() => applyTrade(p, m, "1979-12", { assetId: "nope", side: "buy", amount: { usd: 1 } }), "unknown_asset");
});

test("assets cannot be traded before listing, after their end, and cash is not an asset to trade", () => {
  const m = market();
  const p = emptyPortfolio(1000);
  expectTradeError(() => applyTrade(p, m, "1979-12", { assetId: "late", side: "buy", amount: { usd: 10 } }), "not_tradable");
  assert.equal(applyTrade(p, m, "1980-02", { assetId: "late", side: "buy", amount: { usd: 10 } }).portfolio.holdings.late, 0.5);
  expectTradeError(() => applyTrade(p, m, "1980-02", { assetId: "bust", side: "buy", amount: { usd: 10 } }), "not_tradable");
  expectTradeError(() => applyTrade(p, m, "1979-12", { assetId: "cash", side: "buy", amount: { usd: 10 } }), "not_tradable");
});

test("at most five positions besides cash, but topping up an existing one is fine", () => {
  const extras = ["p1", "p2", "p3", "p4", "p5", "p6"].map((id) => series(id, [1, 1, 1, 1]));
  const m = market(extras);
  let p = emptyPortfolio(1000);
  for (const id of ["p1", "p2", "p3", "p4", "p5"]) p = applyTrade(p, m, "1979-12", { assetId: id, side: "buy", amount: { usd: 100 } }).portfolio;
  assert.equal(Object.keys(p.holdings).length, MAX_POSITIONS);
  expectTradeError(() => applyTrade(p, m, "1979-12", { assetId: "p6", side: "buy", amount: { usd: 100 } }), "too_many_positions");
  p = applyTrade(p, m, "1979-12", { assetId: "p1", side: "buy", amount: { usd: 100 } }).portfolio;
  assert.equal(p.holdings.p1, 200);
  p = applyTrade(p, m, "1979-12", { assetId: "p2", side: "sell", amount: { all: true } }).portfolio;
  p = applyTrade(p, m, "1979-12", { assetId: "p6", side: "buy", amount: { usd: 100 } }).portfolio;
  assert.equal(Object.keys(p.holdings).length, MAX_POSITIONS);
});

test("selling down to float dust closes the position", () => {
  const m = market();
  const p: Portfolio = { cash: 0, holdings: { a: 0.1 + 0.2 } };
  const { portfolio } = applyTrade(p, m, "1979-12", { assetId: "a", side: "sell", amount: { units: 0.3 } });
  assert.deepEqual(Object.keys(portfolio.holdings), []);
});

test("advancing pays income into cash and never reinvests it", () => {
  const m = market();
  const p: Portfolio = { cash: 50, holdings: { a: 100 } };
  const step = advanceMonth(p, m, "1979-12");
  assert.equal(step.month, "1980-01");
  assert.equal(step.portfolio.holdings.a, 100);
  assert.equal(step.portfolio.cash, 100); // 50 + 100 units * 0.5
  assert.deepEqual(step.entries, [{ month: "1980-01", kind: "income", assetId: "a", units: 0, price: 0.5, cash: 50 }]);
  assert.equal(portfolioValue(step.portfolio, m, "1980-01"), 100 + 100 * 11);

  const next = advanceMonth(step.portfolio, m, "1980-01");
  assert.equal(next.portfolio.cash, 100); // no income in 1980-02
  assert.equal(next.entries.length, 0);
});

test("bankruptcy wipes the position, acquisition pays cash, merger converts at equal value", () => {
  const m = market();
  let p: Portfolio = { cash: 0, holdings: { bust: 10, bought: 10, merged: 11 } };
  p = advanceMonth(p, m, "1979-12").portfolio; // now 1980-01, the final month of all three
  assert.equal(portfolioValue(p, m, "1980-01"), 10 * 1 + 10 * 9 + 11 * 6);

  const step = advanceMonth(p, m, "1980-01");
  // bought: 10 * 9 = 90 cash. merged: 11 * 6 = 66 USD -> 6 units of a at 11. bust: gone.
  assert.deepEqual(Object.keys(step.portfolio.holdings), ["a"]);
  assert.ok(Math.abs(step.portfolio.holdings.a - 6) < 1e-12);
  assert.equal(step.portfolio.cash, 90);
  assert.deepEqual(step.entries.map((e) => e.kind).sort(), ["bankruptcy", "conversion", "conversion", "payout"]);
  // The converted units were held at the previous month end, so they earn the successor's income from then on.
  const later = advanceMonth(step.portfolio, m, "1980-02");
  assert.ok(Math.abs(later.portfolio.cash - (90 + 6 * 0.25)) < 1e-9);
});

test("a merger into a position already held adds to it without using another slot", () => {
  const m = market();
  const p: Portfolio = { cash: 0, holdings: { a: 1, merged: 11 } };
  const step = advanceMonth(advanceMonth(p, m, "1979-12").portfolio, m, "1980-01");
  assert.ok(Math.abs(step.portfolio.holdings.a - 7) < 1e-12);
});

test("market knows its start and final month and rejects a dangling successor", () => {
  const m = market();
  assert.equal(m.startMonth, "1979-12");
  assert.equal(m.finalMonth, "1980-03"); // ended assets do not shorten the game
  assert.equal(m.hasEnded("bust", "1980-01"), false);
  assert.equal(m.hasEnded("bust", "1980-02"), true);
  assert.throws(() => new Market([series("x", [1], { end: { month: "1979-12", type: "merger", note: "", successor: "missing" } })]));
});

// --- against the real data set ---------------------------------------------------

const OUT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "data", "out");
const real = fs.existsSync(OUT_DIR)
  ? new Market(fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), "utf8"))))
  : undefined;

test("real data: a ten-year treasury held through 1980 pays its coupons into cash", { skip: !real }, () => {
  const m = real!;
  let month = m.startMonth;
  let p = applyTrade(emptyPortfolio(10_000), m, month, { assetId: "ust10y", side: "buy", amount: { all: true } }).portfolio;
  const units = p.holdings.ust10y;
  for (let i = 0; i < 12; i++) ({ portfolio: p, month } = advanceMonth(p, m, month));
  assert.equal(month, "1980-12");
  assert.equal(p.holdings.ust10y, units);
  // Yields were 10 to 13 percent in 1980, so a year of coupons on 10,000 is roughly 1,100.
  assert.ok(p.cash > 900 && p.cash < 1400, `coupons were ${p.cash}`);
});

test("real data: a full game from start to final month runs without losing track of value", { skip: !real }, () => {
  const m = real!;
  let month = m.startMonth;
  let p = emptyPortfolio(100_000);
  for (const id of ["ibm", "xom", "gold", "ust10y", "ko"]) p = applyTrade(p, m, month, { assetId: id, side: "buy", amount: { usd: 20_000 } }).portfolio;
  while (month < m.finalMonth) ({ portfolio: p, month } = advanceMonth(p, m, month));
  assert.equal(month, m.finalMonth);
  const value = portfolioValue(p, m, month);
  assert.ok(Number.isFinite(value) && value > 100_000, `final value ${value}`);
  assert.ok(p.cash > 0);
});
