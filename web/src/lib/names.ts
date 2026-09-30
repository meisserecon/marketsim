/**
 * Ledger entries carry only an asset id. Names come from the market and portfolio views, which
 * drop an asset once it has ended, so every name seen is remembered per game (in memory and,
 * when possible, in localStorage) to keep old statement lines readable.
 */
const key = (code: string) => `marketsim:names:${code.toUpperCase()}`;

export function loadNames(code: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(key(code));
    if (raw) return JSON.parse(raw) as Record<string, string>;
  } catch {
    // start empty
  }
  return {};
}

export function saveNames(code: string, names: Record<string, string>): void {
  try {
    localStorage.setItem(key(code), JSON.stringify(names));
  } catch {
    // memory only
  }
}
