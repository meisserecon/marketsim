import type {
  AgesView,
  ApiError,
  AssetHistory,
  CreateGameRequest,
  CreateGameResponse,
  GameEvent,
  GameView,
  HoldingsView,
  HighscoresView, AdminGamesView, AdminRequest,
  SoloRequest,
  SoloResponse,
  JoinRequest,
  JoinResponse,
  LeaderboardView,
  MarketView,
  NewsView,
  PortfolioView,
  TradeRequest,
  TradeResponse
} from '@marketsim/shared';

/**
 * One method per route of shared/src/api.ts. Implemented twice: over HTTP (http.ts) and as an
 * in-browser mock running the real engine (mock.ts).
 */
export interface Api {
  createGame(req: CreateGameRequest): Promise<CreateGameResponse>;
  solo(req: SoloRequest): Promise<SoloResponse>;
  highscores(board?: string): Promise<HighscoresView>;
  adminGames(req: AdminRequest): Promise<AdminGamesView>;
  adminDelete(code: string, req: AdminRequest): Promise<AdminGamesView>;
  getGame(code: string): Promise<GameView>;
  join(code: string, req: JoinRequest): Promise<JoinResponse>;
  /** The read routes are public in the contract; a token is sent along when we have one. */
  market(code: string, token?: string): Promise<MarketView>;
  asset(code: string, id: string, token?: string): Promise<AssetHistory>;
  me(code: string, playerToken: string): Promise<PortfolioView>;
  trade(code: string, playerToken: string, trade: TradeRequest): Promise<TradeResponse>;
  leaderboard(code: string, token?: string): Promise<LeaderboardView>;
  ages(code: string, token?: string): Promise<AgesView>;
  news(code: string, month?: string, token?: string): Promise<NewsView>;
  holdings(code: string, gameMasterToken: string): Promise<HoldingsView>;
  advance(code: string, gameMasterToken: string): Promise<GameView>;
  /**
   * Live events of a game. `onReconnect` fires when the stream comes back after an
   * interruption, so the caller can refetch what it may have missed. Returns an unsubscribe.
   */
  subscribe(code: string, onEvent: (event: GameEvent) => void, onReconnect?: () => void): () => void;
}

/** A non-2xx response. `body` is the server's ApiError. */
export class ApiFailure extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiError
  ) {
    super(body.message);
    this.name = 'ApiFailure';
  }
  get code(): ApiError['error'] {
    return this.body.error;
  }
}

export function isApiFailure(e: unknown): e is ApiFailure {
  return e instanceof ApiFailure;
}
