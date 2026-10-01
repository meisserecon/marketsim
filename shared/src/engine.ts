/**
 * The game rules as pure functions. No I/O, no clock, no database: the server loads a Market
 * once, keeps portfolios in Postgres, and calls these to trade and to advance a month.
 */
import type { AssetSeries, MonthRow } from "./asset.js";

/** Every player starts with this much cash, in USD. Fixed for all games. */
export const STARTING_CASH = 1000;
/** The month a game starts in: players build their first portfolio at these prices. Data may reach further back, as chart history. */
export const GAME_START_MONTH = "1979-12";
/** Positions a player may hold besides cash. */
export const MAX_POSITIONS = 5;
/** Holdings worth less than this after a sale are dropped, so float dust never occupies a position slot. */
const DUST_USD = 0.005;

export function nextMonth(month: string): string {
  let [y, m] = month.split("-").map(Number);
  m++;
  if (m > 12) { m = 1; y++; }
  return `${y}-${String(m).padStart(2, "0")}`;
}

// --- market ------------------------------------------------------------------

export class Market {
  private readonly assets = new Map<string, AssetSeries>();
  private readonly rows = new Map<string, Map<string, MonthRow>>();

  constructor(series: AssetSeries[]) {
    for (const s of series) {
      if (!s.rows.length) throw new Error(`${s.id}: no rows`);
      this.assets.set(s.id, s);
      this.rows.set(s.id, new Map(s.rows.map((r) => [r.month, r])));
    }
    for (const s of series) {
      if (s.end?.type === "merger" && s.end.successor && !this.assets.has(s.end.successor)) {
        throw new Error(`${s.id}: successor ${s.end.successor} is not in the market`);
      }
    }
  }

  ids(): string[] { return [...this.assets.keys()]; }
  asset(id: string): AssetSeries | undefined { return this.assets.get(id); }
  row(id: string, month: string): MonthRow | undefined { return this.rows.get(id)?.get(month); }
  firstMonth(id: string): string { return this.assets.get(id)!.rows[0].month; }
  lastMonth(id: string): string { const r = this.assets.get(id)!.rows; return r[r.length - 1].month; }

  /** Quoted this month and not cash. Assets are invisible before their first row and gone after their last. */
  isTradable(id: string, month: string): boolean {
    const a = this.assets.get(id);
    return !!a && a.kind !== "cash" && this.row(id, month) !== undefined;
  }

  /** True once the asset's end event lies in the past. */
  hasEnded(id: string, month: string): boolean {
    const end = this.assets.get(id)?.end;
    return !!end && month > end.month;
  }

  /**
   * Price used to value a holding. Normally this month's price; if a living asset's data stops
   * early (a source lagging a month), its last known price.
   */
  valuationPrice(id: string, month: string): number | undefined {
    const r = this.row(id, month);
    if (r) return r.price;
    const a = this.assets.get(id);
    if (!a || month < a.rows[0].month) return undefined;
    return a.rows[a.rows.length - 1].price;
  }

  /** The month a game starts in: GAME_START_MONTH, or the first month with data if that is later. Earlier rows are history only. */
  get startMonth(): string {
    const cash = this.assets.get("cash");
    if (!cash) throw new Error("market has no cash asset");
    const first = cash.rows[0].month;
    return first > GAME_START_MONTH ? first : GAME_START_MONTH;
  }

  /** Last month a game can reach: the earliest final month among assets that have no end event. */
  get finalMonth(): string {
    let min: string | undefined;
    for (const a of this.assets.values()) {
      if (a.end) continue;
      const last = a.rows[a.rows.length - 1].month;
      if (!min || last < min) min = last;
    }
    if (!min) throw new Error("market is empty");
    return min;
  }
}

// --- portfolio ---------------------------------------------------------------

export interface Portfolio {
  /** USD. Earns nothing. */
  cash: number;
  /** Units by asset id. Never contains "cash" and never contains zero entries. */
  holdings: Record<string, number>;
}

export function emptyPortfolio(cash: number): Portfolio {
  return { cash, holdings: {} };
}

export function portfolioValue(p: Portfolio, market: Market, month: string): number {
  let v = p.cash;
  for (const [id, units] of Object.entries(p.holdings)) v += units * (market.valuationPrice(id, month) ?? 0);
  return v;
}

export type LedgerKind = "buy" | "sell" | "income" | "bankruptcy" | "payout" | "conversion";

/** One line of a player's account statement. `units` and `cash` are signed changes. */
export interface LedgerEntry {
  month: string;
  kind: LedgerKind;
  assetId: string;
  /** The name the asset carried in `month`. Filled in by the server when it serves a ledger; the engine leaves it out. */
  assetName?: string;
  units: number;
  /** Price per unit for trades, payouts and conversions; income per unit for income. */
  price: number;
  cash: number;
  note?: string;
}

// --- trading -----------------------------------------------------------------

/** How much to trade: a number of units, a USD amount, or everything (all cash on a buy, the whole position on a sell). */
export type TradeAmount = { units: number } | { usd: number } | { all: true };

export interface Trade {
  assetId: string;
  side: "buy" | "sell";
  amount: TradeAmount;
}

export type TradeErrorCode =
  | "unknown_asset"
  | "not_tradable"
  | "invalid_amount"
  | "insufficient_cash"
  | "insufficient_units"
  | "too_many_positions";

export class TradeError extends Error {
  constructor(public readonly code: TradeErrorCode, message: string) {
    super(message);
    this.name = "TradeError";
  }
}

/** Executes a trade at the month's price. No fees, no spread. Returns a new portfolio. */
export function applyTrade(p: Portfolio, market: Market, month: string, trade: Trade): { portfolio: Portfolio; entry: LedgerEntry } {
  const asset = market.asset(trade.assetId);
  if (!asset) throw new TradeError("unknown_asset", `Unknown asset ${trade.assetId}`);
  if (!market.isTradable(trade.assetId, month)) throw new TradeError("not_tradable", `${asset.name} cannot be traded in ${month}`);
  const price = market.row(trade.assetId, month)!.price;
  const held = p.holdings[trade.assetId] ?? 0;
  const amount = trade.amount;

  let units: number;
  if ("all" in amount) units = trade.side === "buy" ? p.cash / price : held;
  else if ("usd" in amount) units = amount.usd / price;
  else units = amount.units;
  if (!Number.isFinite(units) || units <= 0) throw new TradeError("invalid_amount", "Amount must be positive");

  const holdings = { ...p.holdings };
  let cash = p.cash;
  const tolerance = 1e-9;

  if (trade.side === "buy") {
    const cost = units * price;
    if (cost > cash * (1 + tolerance) + tolerance) throw new TradeError("insufficient_cash", `Costs ${cost.toFixed(2)}, cash is ${cash.toFixed(2)}`);
    if (held === 0 && Object.keys(holdings).length >= MAX_POSITIONS) {
      throw new TradeError("too_many_positions", `At most ${MAX_POSITIONS} positions besides cash`);
    }
    cash = Math.max(0, cash - cost);
    holdings[trade.assetId] = held + units;
    return { portfolio: { cash, holdings }, entry: { month, kind: "buy", assetId: trade.assetId, units, price, cash: -cost } };
  }

  if (units > held * (1 + tolerance) + tolerance) throw new TradeError("insufficient_units", `Holding is ${held}, tried to sell ${units}`);
  units = Math.min(units, held);
  const remaining = held - units;
  if (remaining * price < DUST_USD) {
    units = held;
    delete holdings[trade.assetId];
  } else holdings[trade.assetId] = remaining;
  const proceeds = units * price;
  cash += proceeds;
  return { portfolio: { cash, holdings }, entry: { month, kind: "sell", assetId: trade.assetId, units: -units, price, cash: proceeds } };
}

// --- advancing time ----------------------------------------------------------

/**
 * Moves a portfolio from `month` to the next month:
 *  1. assets whose last month was `month` are wound up at that month's prices (see AssetEnd);
 *  2. every remaining holding pays the new month's income into cash.
 * Prices of the new month then apply for valuation and trading.
 */
export function advanceMonth(p: Portfolio, market: Market, month: string): { portfolio: Portfolio; month: string; entries: LedgerEntry[] } {
  const to = nextMonth(month);
  const holdings = { ...p.holdings };
  let cash = p.cash;
  const entries: LedgerEntry[] = [];

  for (const [id, units] of Object.entries(p.holdings)) {
    const asset = market.asset(id);
    const end = asset?.end;
    if (!asset || !end || month < end.month) continue;
    const price = market.valuationPrice(id, end.month) ?? 0;
    delete holdings[id];

    if (end.type === "bankruptcy") {
      entries.push({ month: to, kind: "bankruptcy", assetId: id, units: -units, price: 0, cash: 0, note: end.note });
      continue;
    }
    const successor = end.type === "merger" ? end.successor : undefined;
    const successorPrice = successor ? market.row(successor, end.month)?.price : undefined;
    if (successor && successorPrice) {
      const received = (units * price) / successorPrice;
      holdings[successor] = (holdings[successor] ?? 0) + received;
      entries.push({ month: to, kind: "conversion", assetId: id, units: -units, price, cash: 0, note: end.note });
      entries.push({ month: to, kind: "conversion", assetId: successor, units: received, price: successorPrice, cash: 0, note: `From ${asset.name}` });
    } else {
      const proceeds = units * price;
      cash += proceeds;
      entries.push({ month: to, kind: "payout", assetId: id, units: -units, price, cash: proceeds, note: end.note });
    }
  }

  for (const [id, units] of Object.entries(holdings)) {
    const income = market.row(id, to)?.income ?? 0;
    if (income <= 0) continue;
    const paid = units * income;
    cash += paid;
    entries.push({ month: to, kind: "income", assetId: id, units: 0, price: income, cash: paid });
  }

  return { portfolio: { cash, holdings }, month: to, entries };
}
