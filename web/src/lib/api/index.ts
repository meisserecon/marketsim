import { httpApi } from './http';
import type { Api } from './types';

export * from './types';
export const MOCK: boolean = __MOCK__;

let mockApi: Promise<Api> | undefined;

/**
 * The API client. In a normal build `__MOCK__` is the literal `false`, the branch below is
 * dead code and neither mock.ts nor the data files end up in the bundle.
 */
export function getApi(): Promise<Api> {
  if (__MOCK__) {
    mockApi ??= import('./mock').then((m) => m.createMockApi());
    return mockApi;
  }
  return Promise.resolve(httpApi);
}

/** Convenience wrapper so callers can write `api.market(code)` without awaiting the client first. */
export const api: Api = {
  createGame: async (req) => (await getApi()).createGame(req),
  solo: async (req) => (await getApi()).solo(req),
  highscores: async (at) => (await getApi()).highscores(at),
  getGame: async (code) => (await getApi()).getGame(code),
  join: async (code, req) => (await getApi()).join(code, req),
  market: async (code, token) => (await getApi()).market(code, token),
  asset: async (code, id, token) => (await getApi()).asset(code, id, token),
  me: async (code, token) => (await getApi()).me(code, token),
  trade: async (code, token, trade) => (await getApi()).trade(code, token, trade),
  leaderboard: async (code, token) => (await getApi()).leaderboard(code, token),
  ages: async (code, token) => (await getApi()).ages(code, token),
  news: async (code, month, token) => (await getApi()).news(code, month, token),
  holdings: async (code, token) => (await getApi()).holdings(code, token),
  advance: async (code, token) => (await getApi()).advance(code, token),
  subscribe(code, onEvent, onReconnect) {
    let stop: (() => void) | undefined;
    let cancelled = false;
    getApi().then((a) => {
      if (!cancelled) stop = a.subscribe(code, onEvent, onReconnect);
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }
};
