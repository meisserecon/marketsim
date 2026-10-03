/**
 * News items: the storytelling of the game. One file per year in data/news/<year>.json, each a
 * JSON array of items in ascending month order. Players see a month's items when the clock
 * reaches that month; nothing after the current month is ever served.
 */
export type NewsKind = "world" | "company" | "colour" | "listing" | "delisting";

export interface NewsItem {
  month: string; // "YYYY-MM"
  kind: NewsKind;
  headline: string;
  /** Two to four sentences, written as of the end of the month. */
  text: string;
  /** Ids of the companies concerned; empty when none. */
  assets: string[];
  /** Where the facts come from. For maintainers; not sent to players. */
  source?: string;
  /** Optional picture, as a path the web client can load, and its caption. */
  image?: string | null;
  imageCaption?: string | null;
  /** Photographer and agency, or the licence holder, shown small under the picture. */
  imageCredit?: string | null;
}

/** What the client gets: the item without its maintainers' source. */
export type NewsItemView = Omit<NewsItem, "source">;

export function newsView(item: NewsItem): NewsItemView {
  const { source: _source, ...rest } = item;
  return rest;
}
