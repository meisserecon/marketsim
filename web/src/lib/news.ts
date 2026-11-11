import { THREADS, type NewsItemView } from '@marketsim/shared';

const KIND_LABEL: Record<string, string> = { listing: 'Now trading', delisting: 'Leaving the market' };

/** The line above a headline: an entry or exit, or the storyline the item continues. */
export const kicker = (item: NewsItemView): string | undefined => KIND_LABEL[item.kind] ?? (item.thread ? THREADS[item.thread] : undefined);
