/**
 * In-browser stand-in for the server. It runs the real rules from @marketsim/shared over the
 * real data files and obeys the no-lookahead rule the same way the server must:
 *
 *  - rows after the game's current month are never returned;
 *  - names are resolved for the current month with nameAt();
 *  - assets that are not quoted in the current month are absent from the market, and an asset
 *    that has not been listed yet is "not found";
 *  - `source`, `notes` and `end` of a series never leave this module. An end event only
 *    becomes visible through the ledger entries advanceMonth() writes once it has happened.
 *
 * State is kept in localStorage and events go over a BroadcastChannel, so a game master tab
 * and a player tab of the same browser share one game. Only loaded when VITE_MOCK=1.
 */
import {
  Market,
  MAX_POSITIONS,
  TradeError,
  advanceMonth,
  applyTrade,
  emptyPortfolio,
  nameAt,
  nextMonth,
  portfolioValue,
  type ApiError,
  type AssetHistory,
  type AssetSeries,
  type AssetView,
  type GameEvent,
  type GameStatus,
  type GameView,
  type HoldingsView,
  type LeaderboardView,
  type NewsItem,
  type NewsView,
  newsView,
  type LedgerEntry,
  type MarketView,
  type Portfolio,
  type PortfolioView,
  type Trade,
  STARTING_CASH,
  profileAt,
  logoAt
} from '@marketsim/shared';
import { ApiFailure, type Api } from './types';

const files = import.meta.glob<AssetSeries>('../../../../data/out/*.json', { eager: true, import: 'default' });
const newsFiles = import.meta.glob<NewsItem[]>('../../../../data/news/*.json', { eager: true, import: 'default' });
const NEWS: NewsItem[] = Object.values(newsFiles).flat().sort((a, b) => a.month.localeCompare(b.month));

interface MockPlayer {
  id: string;
  name: string;
  token: string;
  bot: boolean;
  portfolio: Portfolio;
  /** Chronological. Not kept for bots. */
  ledger: LedgerEntry[];
  history: { month: string; totalValue: number; cash: number }[];
}

interface MockGame {
  code: string;
  name: string;
  status: GameStatus;
  currentMonth: string;
  startingCash: number;
  gameMasterToken: string;
  players: MockPlayer[];
}

type State = { games: Record<string, MockGame> };

const STORAGE_KEY = 'marketsim:mock:v1';
const CHANNEL = 'marketsim:mock:events';

/** Buy-and-hold strategies that populate the leaderboard, so a single-browser demo has company. */
const BOTS: { name: string; assets: string[] }[] = [
  { name: 'Bond Betty (bot)', assets: ['ust10y'] },
  { name: 'Goldfinger (bot)', assets: ['gold'] },
  { name: 'Blue-chip Bob (bot)', assets: ['ibm', 'ge', 'xom', 'ko', 'wmt'] }
];

function fail(status: number, error: ApiError['error'], message: string): never {
  throw new ApiFailure(status, { error, message });
}

function randomString(length: number, alphabet: string): string {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

function prevMonth(month: string, back = 1): string {
  const [y, m] = month.split('-').map(Number);
  const index = y * 12 + (m - 1) - back;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`;
}

export function createMockApi(options: { bots?: boolean; latencyMs?: number } = {}): Api {
  const market = new Market(Object.values(files));
  const startMonth = market.startMonth;
  const finalMonth = market.finalMonth;
  const latency = options.latencyMs ?? 40;
  const withBots = options.bots ?? true;

  let memory: State = { games: {} };
  const load = (): State => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) memory = JSON.parse(raw) as State;
    } catch {
      // storage unavailable or corrupt: keep the in-memory copy
    }
    return memory;
  };
  const save = (state: State) => {
    memory = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // quota or blocked storage: the game lives on in this tab only
    }
  };

  const listeners = new Set<{ code: string; onEvent: (e: GameEvent) => void }>();
  const deliver = (code: string, event: GameEvent) => {
    for (const l of listeners) if (l.code === code) l.onEvent(event);
  };
  let channel: BroadcastChannel | undefined;
  try {
    channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (msg: MessageEvent<{ code: string; event: GameEvent }>) => deliver(msg.data.code, msg.data.event);
  } catch {
    // single-tab only
  }
  const emit = (code: string, event: GameEvent) => {
    deliver(code, event);
    channel?.postMessage({ code, event });
  };

  const respond = <T>(fn: () => T): Promise<T> =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // structuredClone: callers get plain copies, like parsed JSON from a server.
          resolve(structuredClone(fn()));
        } catch (e) {
          reject(e);
        }
      }, latency);
    });

  const findGame = (state: State, code: string): MockGame => {
    const game = state.games[code.toUpperCase()];
    if (!game) fail(404, 'not_found', `There is no game with the code ${code.toUpperCase()}.`);
    return game;
  };

  const gameView = (g: MockGame): GameView => ({
    code: g.code,
    name: g.name,
    status: g.status,
    currentMonth: g.currentMonth,
    finalMonth,
    startingCash: g.startingCash,
    playerCount: g.players.length
  });

  const assetView = (a: AssetSeries, month: string): AssetView | undefined => {
    const row = market.row(a.id, month);
    if (!row || a.kind === 'cash') return undefined;
    let incomeLastYear = 0;
    for (let back = 0; back < 12; back++) incomeLastYear += market.row(a.id, prevMonth(month, back))?.income ?? 0;
    return {
      id: a.id,
      name: nameAt(a, month),
      kind: a.kind,
      price: row.price,
      pricePrev: market.row(a.id, prevMonth(month))?.price,
      priceYearAgo: market.row(a.id, prevMonth(month, 12))?.price,
      income: row.income,
      incomeLastYear,
      extra: row.extra,
      ...(a.maturity ? { maturity: a.maturity } : {}),
      listedSince: market.listedMonth(a.id)
    };
  };

  const portfolioView = (g: MockGame, p: MockPlayer): PortfolioView => {
    const month = g.currentMonth;
    const positions = Object.entries(p.portfolio.holdings).map(([assetId, units]) => {
      const price = market.valuationPrice(assetId, month) ?? 0;
      const cost = p.portfolio.cost[assetId] ?? 0;
      return { assetId, name: nameAt(market.asset(assetId)!, month), units, price, value: units * price, pricePrev: market.row(assetId, prevMonth(month))?.price, cost, avgPrice: units > 0 ? cost / units : 0 };
    });
    positions.sort((a, b) => b.value - a.value);
    return {
      playerId: p.id,
      name: p.name,
      month,
      cash: p.portfolio.cash,
      positions,
      totalValue: portfolioValue(p.portfolio, market, month),
      maxPositions: MAX_POSITIONS,
      history: p.history,
      ledger: [...p.ledger].reverse()
    };
  };

  const playerByToken = (g: MockGame, token: string | undefined): MockPlayer => {
    const p = token ? g.players.find((x) => x.token === token) : undefined;
    if (!p) fail(401, 'unauthorized', 'This browser is not a player in this game.');
    return p;
  };

  const newPlayer = (g: MockGame, name: string, bot: boolean): MockPlayer => ({
    id: randomString(10, 'abcdefghijklmnopqrstuvwxyz0123456789'),
    name,
    token: `p_${randomString(24, 'abcdefghijklmnopqrstuvwxyz0123456789')}`,
    bot,
    portfolio: emptyPortfolio(g.startingCash),
    ledger: [],
    history: [{ month: g.currentMonth, totalValue: g.startingCash, cash: g.startingCash }]
  });

  const addBots = (g: MockGame) => {
    for (const bot of BOTS) {
      const assets = bot.assets.filter((id) => market.isTradable(id, g.currentMonth));
      if (!assets.length) continue;
      const p = newPlayer(g, bot.name, true);
      const slice = g.startingCash / assets.length;
      for (const assetId of assets) {
        p.portfolio = applyTrade(p.portfolio, market, g.currentMonth, { assetId, side: 'buy', amount: { usd: slice } }).portfolio;
      }
      p.history = [{ month: g.currentMonth, totalValue: g.startingCash, cash: p.portfolio.cash }];
      g.players.push(p);
    }
  };

  return {
    createGame: (req) =>
      respond(() => {
        const name = req.name?.trim();
        if (!name) fail(400, 'bad_request', 'The game needs a name.');
        const startingCash = STARTING_CASH;
        const state = load();
        let code: string;
        do code = randomString(5, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789');
        while (state.games[code]);
        const game: MockGame = {
          code,
          name,
          status: 'lobby',
          currentMonth: startMonth,
          startingCash,
          gameMasterToken: `gm_${randomString(24, 'abcdefghijklmnopqrstuvwxyz0123456789')}`,
          players: []
        };
        if (withBots) addBots(game);
        state.games[code] = game;
        save(state);
        return { game: gameView(game), gameMasterToken: game.gameMasterToken };
      }),

    // The mock keeps no record across games, so solo play and highscores are only offered by the real server.
    solo: () => respond(() => fail(400, 'bad_request', 'Single-player games need the real server.')),
    highscores: (at) => respond(() => ({ at: at ?? 'final', milestones: ['final'], entries: [] })),

    getGame: (code) => respond(() => gameView(findGame(load(), code))),

    join: (code, req) =>
      respond(() => {
        const state = load();
        const g = findGame(state, code);
        const name = req.name?.trim();
        if (!name) fail(400, 'bad_request', 'Enter a player name.');
        if (g.status === 'finished') fail(409, 'game_finished', 'This game is over.');
        if (g.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
          fail(409, 'name_taken', `Somebody is already playing as ${name}.`);
        }
        const p = newPlayer(g, name, false);
        g.players.push(p);
        save(state);
        emit(g.code, { type: 'player-joined', name: p.name, playerCount: g.players.length });
        return { playerId: p.id, name: p.name, playerToken: p.token };
      }),

    market: (code) =>
      respond((): MarketView => {
        const g = findGame(load(), code);
        const assets: AssetView[] = [];
        for (const id of market.ids()) {
          const view = assetView(market.asset(id)!, g.currentMonth);
          if (view) assets.push(view);
        }
        return { month: g.currentMonth, assets };
      }),

    asset: (code, id) =>
      respond((): AssetHistory => {
        const g = findGame(load(), code);
        const a = market.asset(id);
        // An asset that is not listed yet must be indistinguishable from one that does not exist.
        if (!a || a.kind === 'cash' || market.listedMonth(id) > g.currentMonth) fail(404, 'not_found', 'No such asset.');
        return {
          id: a.id,
          name: nameAt(a, g.currentMonth),
          kind: a.kind,
          ...(() => {
            const p = profileAt(a, g.currentMonth);
            const logo = logoAt(a, g.currentMonth);
            return p ? { profile: { tagline: p.tagline, about: p.about, country: a.country, sector: a.sector, logo: logo ? `/logos/${logo}` : undefined, image: p.image, imageCaption: p.imageCaption } } : {};
          })(),
          ...(() => {
            const story = NEWS.filter((n) => n.month <= g.currentMonth && n.assets.includes(a.id)).map(newsView);
            return story.length ? { news: story } : {};
          })(),
          rows: a.rows
            .filter((r) => r.month <= g.currentMonth)
            .map((r) => ({ month: r.month, price: r.price, income: r.income, ...(r.extra ? { extra: r.extra } : {}) }))
        };
      }),

    me: (code, token) =>
      respond(() => {
        const g = findGame(load(), code);
        return portfolioView(g, playerByToken(g, token));
      }),

    trade: (code, token, trade: Trade) =>
      respond(() => {
        const state = load();
        const g = findGame(state, code);
        const p = playerByToken(g, token);
        if (g.status === 'finished') fail(409, 'game_finished', 'The game is over; trading is closed.');
        // Same answer for "does not exist" and "not listed yet", so a trade cannot probe the future.
        const a = market.asset(trade.assetId);
        if (!a || market.listedMonth(a.id) > g.currentMonth) fail(400, 'unknown_asset', 'Unknown asset.');
        try {
          const result = applyTrade(p.portfolio, market, g.currentMonth, trade);
          p.portfolio = result.portfolio;
          p.ledger.push(result.entry);
          const last = p.history[p.history.length - 1];
          if (last?.month === g.currentMonth) last.cash = p.portfolio.cash;
          save(state);
          return { portfolio: portfolioView(g, p), entry: result.entry };
        } catch (e) {
          if (e instanceof TradeError) {
            const message = e.code === 'not_tradable' ? `${nameAt(a, g.currentMonth)} is not traded this month.` : e.message;
            fail(400, e.code, message);
          }
          throw e;
        }
      }),

    leaderboard: (code) =>
      respond((): LeaderboardView => {
        const g = findGame(load(), code);
        const rows = g.players
          .map((p) => {
            const totalValue = portfolioValue(p.portfolio, market, g.currentMonth);
            const history = p.history.filter((h) => h.month < g.currentMonth).map((h) => ({ month: h.month, totalValue: h.totalValue }));
            history.push({ month: g.currentMonth, totalValue });
            return { playerId: p.id, name: p.name, totalValue, history };
          })
          .sort((a, b) => b.totalValue - a.totalValue);
        let rank = 0;
        let lastValue = 0;
        const players = rows.map((r, i) => {
          if (i === 0 || Math.abs(r.totalValue - lastValue) > 0.005) rank = i + 1;
          lastValue = r.totalValue;
          return { ...r, rank };
        });
        // No benchmark series exists in data/out yet, so `benchmark` stays undefined.
        return { month: g.currentMonth, players };
      }),

    ages: () => respond(() => ({ ended: [] })),

    news: (code, month) =>
      respond((): NewsView => {
        const g = findGame(load(), code);
        const m = month ?? g.currentMonth;
        return { month: m, items: m > g.currentMonth ? [] : NEWS.filter((n) => n.month === m).map(newsView) };
      }),

    holdings: (code, token) =>
      respond((): HoldingsView => {
        const g = findGame(load(), code);
        if (!token || token !== g.gameMasterToken) fail(401, 'unauthorized', 'Only the game master can see the positions of all players.');
        const players = g.players
          .map((p) => {
            const v = portfolioView(g, p);
            return { playerId: v.playerId, name: v.name, cash: v.cash, totalValue: v.totalValue, positions: v.positions };
          })
          .sort((a, b) => b.totalValue - a.totalValue);
        return { month: g.currentMonth, players };
      }),

    advance: (code, token) =>
      respond(() => {
        const state = load();
        const g = findGame(state, code);
        if (!token || token !== g.gameMasterToken) fail(401, 'unauthorized', 'Only the game master can advance the month.');
        if (g.status === 'finished' || g.currentMonth >= finalMonth) fail(409, 'game_finished', 'The game has reached its final month.');
        const from = g.currentMonth;
        const to = nextMonth(from);
        for (const p of g.players) {
          const result = advanceMonth(p.portfolio, market, from);
          p.portfolio = result.portfolio;
          if (!p.bot) p.ledger.push(...result.entries);
          p.history.push({ month: to, totalValue: portfolioValue(p.portfolio, market, to), cash: p.portfolio.cash });
        }
        g.currentMonth = to;
        g.status = to >= finalMonth ? 'finished' : 'running';
        save(state);
        const view = gameView(g);
        emit(g.code, { type: 'month-advanced', game: view });
        if (g.status === 'finished') emit(g.code, { type: 'game-finished', game: view });
        return view;
      }),

    subscribe(code, onEvent) {
      const listener = { code: code.toUpperCase(), onEvent };
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
