import type { LeaderboardView, MarketView } from '@marketsim/shared';

/** One line of the market summary: a name and the month's change as a fraction. `id` is set for assets. */
export interface Mover {
  id?: string;
  name: string;
  change: number;
}

/** The month's market summary: the index first, then the assets that moved most, up or down. */
export interface MarketSummary {
  indices: Mover[];
  movers: Mover[];
}

/**
 * What the markets did in `month`: the stock market index (the leaderboard's benchmark) and the
 * `count` assets with the largest price change on the month before.
 */
export function marketSummary(board: LeaderboardView | undefined, market: MarketView | undefined, month: string | undefined, count = 5): MarketSummary {
  const indices: Mover[] = [];
  const h = board?.benchmark?.history ?? [];
  if (h.length >= 2 && h[h.length - 1].month === month) indices.push({ name: 'Market', change: h[h.length - 1].totalValue / h[h.length - 2].totalValue - 1 });
  const movers = (market?.assets ?? [])
    .filter((a) => a.pricePrev !== undefined && a.pricePrev > 0)
    // Short names keep the line short: "Bankverein" for "Schweizerischer Bankverein".
    .map((a) => ({ id: a.id, name: a.name.replace(/^Schweizerische[rs]? /, ''), change: a.price / a.pricePrev! - 1 }))
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, count);
  return { indices, movers };
}

/** "+12%", "−7%", "0%": a change as the papers print it, in whole percent. */
export const signedPct = (c: number) => `${c > 0 ? '+' : c < 0 ? '−' : ''}${Math.abs(c * 100).toFixed(0)}%`;
