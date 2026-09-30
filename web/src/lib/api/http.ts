import type { ApiError, GameEvent } from '@marketsim/shared';
import { ApiFailure, type Api } from './types';

const BASE = '/api';

async function request<T>(method: 'GET' | 'POST', path: string, opts: { token?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined
    });
  } catch {
    throw new ApiFailure(0, { error: 'bad_request', message: 'Cannot reach the server. Check your connection and try again.' });
  }

  if (!res.ok) {
    let body: ApiError | undefined;
    try {
      const parsed = await res.json();
      if (parsed && typeof parsed.error === 'string') body = { error: parsed.error, message: String(parsed.message ?? parsed.error) };
    } catch {
      // not JSON; fall through to a generic error
    }
    throw new ApiFailure(
      res.status,
      body ?? {
        error: res.status === 404 ? 'not_found' : res.status === 401 || res.status === 403 ? 'unauthorized' : 'bad_request',
        message: `The server answered ${res.status} ${res.statusText}`.trim()
      }
    );
  }
  return (await res.json()) as T;
}

const game = (code: string) => `/games/${encodeURIComponent(code)}`;

export const httpApi: Api = {
  createGame: (req) => request('POST', '/games', { body: req }),
  getGame: (code) => request('GET', game(code)),
  join: (code, req) => request('POST', `${game(code)}/join`, { body: req }),
  market: (code, token) => request('GET', `${game(code)}/market`, { token }),
  asset: (code, id, token) => request('GET', `${game(code)}/assets/${encodeURIComponent(id)}`, { token }),
  me: (code, token) => request('GET', `${game(code)}/me`, { token }),
  trade: (code, token, trade) => request('POST', `${game(code)}/trades`, { token, body: trade }),
  leaderboard: (code, token) => request('GET', `${game(code)}/leaderboard`, { token }),
  advance: (code, token) => request('POST', `${game(code)}/advance`, { token }),

  subscribe(code, onEvent, onReconnect) {
    // EventSource cannot send an Authorization header; the events route is public in the contract.
    const source = new EventSource(`${BASE}${game(code)}/events`);
    let opened = false;
    source.onopen = () => {
      if (opened) onReconnect?.();
      opened = true;
    };
    source.onmessage = (msg) => {
      try {
        onEvent(JSON.parse(msg.data) as GameEvent);
      } catch {
        // ignore keep-alives or malformed lines
      }
    };
    // On error EventSource reconnects by itself; onopen then triggers a refetch.
    return () => source.close();
  }
};
