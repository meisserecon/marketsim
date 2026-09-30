import type { ApiError, LedgerKind } from '@marketsim/shared';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "1987-03" -> "March 1987" */
export function monthName(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${MONTHS[m - 1] ?? month} ${y}`;
}

/** "1987-03" -> "Mar 1987" */
export function monthShort(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${(MONTHS[m - 1] ?? '').slice(0, 3)} ${y}`;
}

const MINUS = '−';
const group = (n: number, digits: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** A USD amount: "$12,345.67", "−$3.20". Cents are dropped from 100,000 up unless asked for. */
export function usd(value: number, opts: { cents?: boolean; sign?: boolean } = {}): string {
  if (!Number.isFinite(value)) return '–';
  const abs = Math.abs(value);
  const cents = opts.cents ?? abs < 100_000;
  const rounded = Number(abs.toFixed(cents ? 2 : 0));
  const sign = rounded === 0 ? '' : value < 0 ? MINUS : opts.sign ? '+' : '';
  return `${sign}$${group(rounded, cents ? 2 : 0)}`;
}

/** Compact USD for axis ticks: "$1.2M", "$350K", "$0.04". */
export function usdCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? MINUS : '';
  if (abs >= 1e9) return `${sign}$${trim(abs / 1e9)}B`;
  if (abs >= 1e6) return `${sign}$${trim(abs / 1e6)}M`;
  if (abs >= 1e4) return `${sign}$${trim(abs / 1e3)}K`;
  if (abs >= 100) return `${sign}$${group(abs, 0)}`;
  return sign + priceTick(abs);
}
/** Axis tick for a per-unit price: "$0.1", "$0.015", "$10", "$2.50", "$1.2K". */
export function priceTick(value: number): string {
  const abs = Math.abs(value);
  if (abs === 0) return '$0';
  if (abs >= 1000) return usdCompact(value);
  if (abs >= 1) return '$' + (Number.isInteger(Number(abs.toFixed(2))) ? abs.toFixed(0) : abs.toFixed(2));
  return '$' + String(Number(abs.toPrecision(2)));
}

const trim = (n: number) => (n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1).replace(/\.0$/, '') : n.toFixed(2).replace(/\.?0+$/, ''));

/**
 * A price per unit without the currency sign. Prices are split-adjusted, so early ones can be
 * a few cents: below 1 USD they keep four significant digits ("0.04052").
 */
export function price(value: number): string {
  if (!Number.isFinite(value)) return '–';
  const abs = Math.abs(value);
  if (abs === 0) return '0.00';
  if (abs >= 1) return group(value, 2);
  const digits = Math.min(8, Math.max(2, 3 - Math.floor(Math.log10(abs))));
  return value.toFixed(digits);
}

/** A fraction as a percentage: 0.0312 -> "3.1%". With `sign`, "+3.1%" / "−3.1%". */
export function pct(fraction: number | undefined, opts: { sign?: boolean; digits?: number } = {}): string {
  if (fraction === undefined || !Number.isFinite(fraction)) return '–';
  const digits = opts.digits ?? 1;
  const v = Number((fraction * 100).toFixed(digits));
  const abs = Math.abs(v);
  const body = abs >= 1000 ? group(abs, 0) : abs.toFixed(digits);
  const sign = v < 0 ? MINUS : opts.sign && v > 0 ? '+' : '';
  return `${sign}${body}%`;
}

/** Units are fractional and often huge or tiny; shown as a secondary detail only. */
export function units(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000) return group(value, 0);
  if (abs >= 1) return group(value, 2);
  return value.toPrecision(3);
}

export function change(now: number, before: number | undefined): number | undefined {
  if (before === undefined || !(before > 0)) return undefined;
  return now / before - 1;
}

export const direction = (v: number | undefined): 'up' | 'down' | 'flat' =>
  v === undefined || Math.abs(v) < 0.0005 ? 'flat' : v > 0 ? 'up' : 'down';

export const LEDGER_LABEL: Record<LedgerKind, string> = {
  buy: 'Buy',
  sell: 'Sell',
  income: 'Income',
  bankruptcy: 'Bankruptcy',
  payout: 'Payout',
  conversion: 'Conversion'
};

/** Player-facing text for an error code. The server's own message is the fallback. */
export function errorMessage(e: unknown): string {
  const body = (e as { body?: ApiError } | undefined)?.body;
  if (!body) return e instanceof Error ? e.message : 'Something went wrong.';
  switch (body.error) {
    case 'insufficient_cash':
      return 'Not enough cash for this purchase. Lower the amount or sell something first.';
    case 'insufficient_units':
      return 'You do not hold that much of this asset. Lower the amount or sell the whole position.';
    case 'too_many_positions':
      return 'You already hold five positions, the maximum. Sell one completely before buying a new asset.';
    case 'invalid_amount':
      return 'Enter an amount greater than zero.';
    case 'not_tradable':
      return 'This asset cannot be traded this month.';
    case 'unknown_asset':
      return 'This asset does not exist in the game.';
    case 'game_finished':
      return 'The game is over.';
    case 'name_taken':
      return 'That name is already taken in this game. Pick another one.';
    case 'not_found':
      return body.message || 'Not found.';
    case 'unauthorized':
      return body.message || 'You are not signed in to this game on this browser.';
    default:
      return body.message || 'Something went wrong.';
  }
}
