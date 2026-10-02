/**
 * The HTTP contract between server and web client. All bodies are JSON. Money is USD.
 *
 * Authentication: a bearer token in the Authorization header. Creating a game returns the
 * game master's token; joining returns the player's token. Creating a game may additionally
 * require a password, so that only the host can start games. Tokens are opaque and stored
 * hashed on the server.
 *
 * No lookahead: nothing the server sends may reveal anything after the game's current month.
 * That covers prices and income, but also asset names, notes, and end events, all of which
 * the server resolves for the current month before sending.
 *
 *   POST /api/games                         CreateGameRequest  -> CreateGameResponse
 *   GET  /api/games/:code                                      -> GameView
 *   POST /api/games/:code/join              JoinRequest        -> JoinResponse
 *   GET  /api/games/:code/market                               -> MarketView
 *   GET  /api/games/:code/assets/:id                           -> AssetHistory
 *   GET  /api/games/:code/me                (player)           -> PortfolioView
 *   POST /api/games/:code/trades            (player) TradeRequest -> TradeResponse
 *   GET  /api/games/:code/leaderboard                          -> LeaderboardView
 *   GET  /api/games/:code/holdings          (game master)      -> HoldingsView
 *   POST /api/games/:code/advance           (game master)      -> GameView
 *   GET  /api/games/:code/events            Server-Sent Events of GameEvent
 *
 * Errors: non-2xx with an ApiError body.
 */
import type { AssetKind } from "./asset.js";
import type { LedgerEntry, Trade, TradeErrorCode } from "./engine.js";

export type GameStatus = "lobby" | "running" | "finished";

export interface GameView {
  code: string;
  name: string;
  status: GameStatus;
  /** "YYYY-MM". In the lobby this is the base month, where players build their first portfolio. */
  currentMonth: string;
  finalMonth: string;
  startingCash: number;
  playerCount: number;
}

/** `password` is required when the server has a create password configured. Starting cash is fixed (STARTING_CASH). */
export interface CreateGameRequest { name: string; password?: string }
export interface CreateGameResponse { game: GameView; gameMasterToken: string }

export interface JoinRequest { name: string }
export interface JoinResponse { playerId: string; name: string; playerToken: string }

/** An asset as the player may see it this month. */
export interface AssetView {
  id: string;
  /** The name the asset carried in the current month. */
  name: string;
  kind: AssetKind;
  price: number;
  /** Price one month and twelve months ago, if the asset was quoted then. */
  pricePrev?: number;
  priceYearAgo?: number;
  /** Income per unit paid in the current month, and summed over the last twelve months. */
  income: number;
  incomeLastYear: number;
  extra?: Record<string, number>;
  /** For bonds: the day the bond repays 100 per unit, "YYYY-MM-DD". */
  maturity?: string;
  /** First month the asset was quoted. */
  listedSince: string;
}

export interface MarketView {
  month: string;
  /** Only assets quoted in the current month. */
  assets: AssetView[];
}

export interface AssetHistory {
  id: string;
  name: string;
  kind: AssetKind;
  /** How the asset would be described in the current month; never mentions later events. */
  profile?: { tagline: string; about: string; country?: string; sector?: string; logo?: string; image?: string; imageCaption?: string };
  /** From the asset's first row up to the current month, never beyond. */
  rows: { month: string; price: number; income: number; extra?: Record<string, number> }[];
}

export interface PositionView {
  assetId: string;
  name: string;
  units: number;
  price: number;
  value: number;
}

export interface PortfolioView {
  playerId: string;
  name: string;
  month: string;
  cash: number;
  positions: PositionView[];
  totalValue: number;
  maxPositions: number;
  /** Total value at each month end so far, for the equity curve. */
  history: { month: string; totalValue: number; cash: number }[];
  /** Most recent first. */
  ledger: LedgerEntry[];
}

export type TradeRequest = Trade;
export interface TradeResponse { portfolio: PortfolioView; entry: LedgerEntry }

export interface LeaderboardView {
  month: string;
  players: {
    playerId: string;
    name: string;
    totalValue: number;
    rank: number;
    /** Total value at each month end since the player joined, up to and including the current month. */
    history: { month: string; totalValue: number }[];
  }[];
  /** Value of the starting cash had it tracked the benchmark, once a benchmark series exists. */
  benchmark?: { name: string; totalValue: number };
}

/** What every player holds this month. For the game master only; players see each other's values, not positions. */
export interface HoldingsView {
  month: string;
  /** In leaderboard order. */
  players: { playerId: string; name: string; cash: number; totalValue: number; positions: PositionView[] }[];
}

export type GameEvent =
  | { type: "month-advanced"; game: GameView }
  | { type: "player-joined"; name: string; playerCount: number }
  | { type: "game-finished"; game: GameView };

export interface ApiError {
  error: TradeErrorCode | "not_found" | "unauthorized" | "name_taken" | "game_finished" | "bad_request";
  message: string;
}
