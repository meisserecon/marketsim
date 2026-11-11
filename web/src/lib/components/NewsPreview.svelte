<script lang="ts">
  /**
   * The month's news for somebody playing alone, where no game master reads the paper to the room:
   * the market and the biggest movers (every month, news or not), the lead story with a small view of
   * its picture, and the headlines of the other stories. Any story opens the full front page of The News.
   */
  import type { NewsItemView } from '@marketsim/shared';
  import { monthName } from '$lib/format';
  import { signedPct, type MarketSummary } from '$lib/movers';
  import { kicker } from '$lib/news';
  import NewsModal from './NewsModal.svelte';

  interface Props {
    month: string;
    /** In the order of importance; the first is the lead story. */
    items: NewsItemView[];
    nameOf: (id: string) => string;
    /** Ids that can be opened in the asset panel. */
    openable?: Set<string>;
    onselect?: (id: string) => void;
    markets: MarketSummary;
  }
  let { month, items, nameOf, openable, onselect, markets }: Props = $props();

  const lead = $derived(items[0]);
  const rest = $derived(items.slice(1));
  /** The story the paper is opened at, by its place in `items`; undefined while the paper is closed. */
  let open = $state<number | undefined>(undefined);
</script>

<section class="brief" aria-label="The News, {monthName(month)}">
  <header class="head">
    <span class="label">The News</span>
    <span class="date">{monthName(month)}</span>
    {#if lead}<button class="read" onclick={() => (open = 0)}>Read the paper</button>{/if}
  </header>

  {#if markets.indices.length || markets.movers.length}
    <p class="markets">
      {#each markets.indices as x (x.name)}
        <span class="mk index">{x.name} <b class:up={x.change > 0} class:down={x.change < 0}>{signedPct(x.change)}</b></span>
      {/each}
      {#each markets.movers as x (x.id ?? x.name)}
        {#if x.id && openable?.has(x.id) && onselect}
          <button class="mk" title="Open {x.name}" onclick={() => onselect(x.id!)}>{x.name} <b class:up={x.change > 0} class:down={x.change < 0}>{signedPct(x.change)}</b></button>
        {:else}
          <span class="mk">{x.name} <b class:up={x.change > 0} class:down={x.change < 0}>{signedPct(x.change)}</b></span>
        {/if}
      {/each}
    </p>
  {/if}

  {#if lead}
    <div class="stories" class:alone={!rest.length}>
      <button class="lead" class:with-picture={!!lead.image} onclick={() => (open = 0)} aria-label="Read the lead story: {lead.headline}">
        {#if lead.image}<img src={lead.image} alt="" />{/if}
        <span class="lead-body">
          {#if kicker(lead)}<span class="kicker">{kicker(lead)}</span>{/if}
          <span class="headline">{lead.headline}</span>
          <span class="teaser">{lead.text}</span>
        </span>
      </button>
      {#if rest.length}
        <div class="rest" class:two={rest.length > 4}>
          <p class="also">Also in this issue</p>
          <ul>
            {#each rest as item, i (i)}
              <li>
                <button onclick={() => (open = i + 1)}>
                  {#if kicker(item)}<span class="kicker">{kicker(item)}</span>{/if}
                  <span class="title">{item.headline}</span>
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  {:else}
    <p class="quiet">A quiet month: no news to report.</p>
  {/if}
</section>

{#if open !== undefined}
  <NewsModal {month} {items} {nameOf} {openable} {onselect} {markets} focus={open} onclose={() => (open = undefined)} />
{/if}

<style>
  .brief {
    --serif: 'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, 'Times New Roman', serif;
    --paper: #f7f3e8;
    --paper-ink: #1c1a16;
    --paper-rule: #2a2722;
    --paper-hair: rgba(42, 39, 34, 0.3);
    background: var(--paper);
    color: var(--paper-ink);
    font-family: var(--serif);
    padding: 10px 18px 14px;
    border-radius: var(--radius);
    border: 1px solid rgba(0, 0, 0, 0.14);
    box-shadow: var(--shadow);
  }
  @media (prefers-color-scheme: dark) {
    .brief {
      --paper: #e9e3d3;
    }
  }
  button {
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
  }
  button:focus-visible {
    outline: 2px solid var(--paper-rule);
    outline-offset: 2px;
  }

  /* masthead line */
  .head {
    display: flex;
    align-items: baseline;
    gap: 14px;
    padding-bottom: 5px;
    border-bottom: 3px double var(--paper-rule);
  }
  .label {
    font-family: 'Old English Text MT', 'UnifrakturCook', 'Engravers Old English', var(--serif);
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
  }
  .date {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .read {
    margin-left: auto;
    font-family: var(--font);
    font-size: 0.8rem;
    font-weight: 650;
    text-decoration: underline;
    text-underline-offset: 3px;
    white-space: nowrap;
  }

  /* the market and the movers */
  .markets {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 2px 20px;
    margin: 0;
    padding: 6px 0;
    border-bottom: 1px solid var(--paper-rule);
    font-family: var(--font);
    font-size: 0.9rem;
  }
  .mk {
    white-space: nowrap;
  }
  .mk.index {
    font-weight: 650;
    padding-right: 20px;
    border-right: 1px solid var(--paper-hair);
  }
  .mk b {
    font-variant-numeric: tabular-nums;
  }
  .mk b.up {
    color: #0b5f0b;
  }
  .mk b.down {
    color: #a32222;
  }
  button.mk:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  /* the stories */
  .stories {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: 0 22px;
    padding-top: 12px;
    align-items: start;
  }
  .stories.alone {
    grid-template-columns: minmax(0, 1fr);
  }
  .lead {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
    align-items: start;
  }
  .lead.with-picture {
    grid-template-columns: auto minmax(0, 1fr);
  }
  .lead img {
    display: block;
    width: clamp(132px, 15vw, 210px);
    aspect-ratio: 3 / 2;
    object-fit: cover;
    background: #d9d3c3;
    filter: saturate(0.85) contrast(1.02);
  }
  .lead-body {
    display: block;
    min-width: 0;
    /* a story alone has the whole width: keep its lines readable */
    max-width: 72ch;
  }
  .kicker {
    display: block;
    margin-bottom: 2px;
    font-family: var(--font);
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #8a1c1c;
  }
  .headline {
    display: block;
    font-size: clamp(1.25rem, 2.1vw, 1.6rem);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.01em;
    text-wrap: balance;
  }
  .lead:hover .headline,
  .rest button:hover .title {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
  }
  .teaser {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    overflow: hidden;
    margin-top: 6px;
    font-size: 0.95rem;
    line-height: 1.4;
  }
  /* a story alone has room for more of its text */
  .stories.alone .teaser {
    -webkit-line-clamp: 5;
    line-clamp: 5;
  }
  .rest {
    padding-left: 22px;
    border-left: 1px solid var(--paper-hair);
  }
  .also {
    margin: 0 0 2px;
    font-family: var(--font);
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.7;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .two ul {
    columns: 2;
    column-gap: 20px;
  }
  li {
    break-inside: avoid;
    padding: 5px 0;
    border-bottom: 1px solid var(--paper-hair);
  }
  /* In one column the list ends without a rule; in two, every item keeps its rule so both columns end alike. */
  :not(.two) > ul > li:last-child {
    border-bottom: none;
  }
  .rest button {
    display: block;
  }
  .title {
    font-size: 0.98rem;
    font-weight: 700;
    line-height: 1.2;
  }
  .quiet {
    margin: 12px 0 2px;
    font-style: italic;
  }

  @media (max-width: 820px) {
    .brief {
      padding: 10px 14px 12px;
    }
    .stories {
      grid-template-columns: minmax(0, 1fr);
    }
    .rest {
      margin-top: 12px;
      padding: 8px 0 0;
      border-left: none;
      border-top: 1px solid var(--paper-hair);
    }
    .two ul {
      columns: 1;
    }
    .lead {
      gap: 12px;
    }
    .lead img {
      width: 108px;
    }
    .teaser {
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }
  }
</style>
