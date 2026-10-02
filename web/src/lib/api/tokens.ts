/**
 * Tokens live in localStorage, keyed by game code, separately for the player and the game
 * master role. Storage can be unavailable (private windows, blocked site data), so every
 * access is guarded and an in-memory copy keeps the current tab working regardless.
 */
export type Role = 'player' | 'gm';

const memory = new Map<string, string>();
const key = (role: Role, code: string) => `marketsim:${role}:${code.toUpperCase()}`;

export function getToken(role: Role, code: string): string | undefined {
  const k = key(role, code);
  try {
    const v = localStorage.getItem(k);
    if (v) return v;
  } catch {
    // fall back to memory
  }
  return memory.get(k);
}

export function setToken(role: Role, code: string, token: string): void {
  const k = key(role, code);
  memory.set(k, token);
  try {
    localStorage.setItem(k, token);
  } catch {
    // memory only
  }
}

export function clearToken(role: Role, code: string): void {
  const k = key(role, code);
  memory.delete(k);
  try {
    localStorage.removeItem(k);
  } catch {
    // nothing to remove
  }
}

/**
 * The address of a seat is the page address with the token in the fragment, `/g/CODE#key=<token>`:
 * copying the address bar is how a player takes the seat to another device. Browsers never send
 * the fragment to the server, so the token stays out of requests and logs.
 */
export function fragmentToken(): string | undefined {
  if (typeof location === 'undefined') return undefined;
  return new URLSearchParams(location.hash.slice(1)).get('key') || undefined;
}

/** Puts the token into the address bar, or removes it, without adding a history entry. */
export function showTokenInAddress(token: string | undefined): void {
  if (typeof location === 'undefined') return;
  const hash = token ? `#key=${encodeURIComponent(token)}` : '';
  if (location.hash !== hash) history.replaceState(history.state, '', location.pathname + location.search + hash);
}

/** Codes of games this browser holds a token for, most recently stored last. */
export function knownGames(): { code: string; role: Role }[] {
  const out: { code: string; role: Role }[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const m = /^marketsim:(player|gm):(.+)$/.exec(localStorage.key(i) ?? '');
      if (m) out.push({ role: m[1] as Role, code: m[2] });
    }
  } catch {
    // none
  }
  return out;
}
