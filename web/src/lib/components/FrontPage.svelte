<script lang="ts">
  /**
   * The month's news as the front page of "The News": a masthead, the lead story across the
   * page with its picture, and the other stories in columns below.
   */
  import { THREADS, type NewsItemView } from '@marketsim/shared';
  import { monthName } from '$lib/format';

  interface Props {
    month: string;
    /** In the order of importance; the first is the lead story. */
    items: NewsItemView[];
    nameOf: (id: string) => string;
    /** Ids that can be opened in the asset panel; others are shown as plain text. */
    openable?: Set<string>;
    onselect?: (id: string) => void;
    /** Larger type for the projector. */
    big?: boolean;
    /** The month's market summary, shown as a strip under the masthead: the indices first, then the biggest movers. */
    markets?: { indices: { name: string; change: number }[]; movers: { name: string; change: number }[] };
  }
  let { month, items, nameOf, openable, onselect, big = false, markets }: Props = $props();
  // The strip slides only when it does not fit on one line.
  let stripWidth = $state(0);
  let setWidth = $state(0);
  const sliding = $derived(setWidth > stripWidth + 1);
  const fmt = (c: number) => `${c > 0 ? '+' : c < 0 ? '−' : ''}${Math.abs(c * 100).toFixed(0)}%`;

  const KIND_LABEL: Record<string, string> = { listing: 'Now trading', delisting: 'Leaving the market' };
  /** The line above a headline: an entry or exit, or the storyline the item continues. */
  const kicker = (item: NewsItemView) => KIND_LABEL[item.kind] ?? (item.thread ? THREADS[item.thread] : undefined);
  const lead = $derived(items[0]);
  const rest = $derived(items.slice(1));
  /** Papers count their years: volume 1 is the game's first year. */
  const volume = $derived(Number(month.slice(0, 4)) - 1978);
  const issue = $derived(Number(month.slice(5, 7)));

  let zoomed = $state<NewsItemView | undefined>(undefined);
  function onKey(e: KeyboardEvent) {
    if (zoomed && e.key === 'Escape') {
      zoomed = undefined;
      e.stopPropagation();
    }
  }
</script>

<svelte:window onkeydowncapture={onKey} />

{#snippet more(item: NewsItemView)}
  {#if item.link}<p class="more-link"><a href={item.link} target="_blank" rel="noopener noreferrer">{item.linkLabel ?? 'More'} ↗</a></p>{/if}
{/snippet}

{#snippet tags(item: NewsItemView)}
  {#if item.assets.length}
    <p class="tags">
      {#each item.assets as id (id)}
        {#if openable?.has(id) && onselect}
          <button class="tag" onclick={() => onselect(id)}>{nameOf(id)}</button>
        {:else}
          <span class="tag plain">{nameOf(id)}</span>
        {/if}
      {/each}
    </p>
  {/if}
{/snippet}

{#snippet picture(item: NewsItemView)}
  {#if item.image}
    <button class="zoom" onclick={() => (zoomed = item)} aria-label="Show the picture larger">
      <img src={item.image} alt={item.imageCaption ?? ''} loading="lazy" />
    </button>
  {/if}
{/snippet}

{#snippet strip(m: NonNullable<Props['markets']>)}
  {#each m.indices as x (x.name)}<span class="mk index">{x.name} <b class:up={x.change > 0} class:down={x.change < 0}>{fmt(x.change)}</b></span>{/each}
  {#if m.indices.length && m.movers.length}<span class="mk-sep" aria-hidden="true"></span>{/if}
  {#each m.movers as x (x.name)}<span class="mk">{x.name} <b class:up={x.change > 0} class:down={x.change < 0}>{fmt(x.change)}</b></span>{/each}
{/snippet}

<article class="paper" class:big>
  <header class="masthead">
    <div class="rule double"></div>
    <h2>The News</h2>
    <p class="dateline">
      <span>Vol. {volume}, No. {issue}</span>
      <span class="date">{monthName(month)}</span>
      <span>Monthly edition</span>
    </p>
    <div class="rule"></div>
    {#if markets && (markets.indices.length || markets.movers.length)}
      <div class="markets" class:sliding bind:clientWidth={stripWidth}>
        <div class="run" style:animation-duration="{Math.max(18, (markets.indices.length + markets.movers.length) * 4)}s">
          {#each sliding ? [0, 1] : [0] as copy (copy)}
            {#if copy === 0}
              <span class="set" bind:clientWidth={setWidth}>{@render strip(markets)}</span>
            {:else}
              <span class="set" aria-hidden="true">{@render strip(markets)}</span>
            {/if}
          {/each}
        </div>
      </div>
      <div class="rule"></div>
    {/if}
  </header>

  {#if !lead}
    <p class="quiet">A quiet month: no news to report.</p>
  {:else}
    <section class="lead" class:with-picture={!!lead.image}>
      <div class="lead-head">
        {#if kicker(lead)}<p class="kicker">{kicker(lead)}</p>{/if}
        <h3>{lead.headline}</h3>
      </div>
      {#if lead.image}<div class="lead-picture">{@render picture(lead)}</div>{/if}
      <div class="lead-text">
        <p>{lead.text}</p>
        {@render more(lead)}
        {@render tags(lead)}
      </div>
    </section>

    {#if rest.length}
      <div class="rule"></div>
      <section class="columns" style:column-count={Math.min(3, rest.length)}>
        {#each rest as item, i (i)}
          <!-- a story alone under the lead has the whole width: its picture goes beside the text -->
          {@const beside = rest.length === 1 && !!item.image}
          <div class="story" class:beside>
            {#if beside}{@render picture(item)}{/if}
            <div class="story-body">
              {#if kicker(item)}<p class="kicker">{kicker(item)}</p>{/if}
              <h4>{item.headline}</h4>
              {#if !beside}{@render picture(item)}{/if}
              <p>{item.text}</p>
              {@render more(item)}
              {@render tags(item)}
            </div>
          </div>
        {/each}
      </section>
    {/if}
  {/if}
</article>

{#if zoomed?.image}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="lightbox" role="dialog" aria-modal="true" aria-label="Picture" tabindex="-1" onclick={() => (zoomed = undefined)}>
    <figure>
      <img src={zoomed.image} alt={zoomed.imageCaption ?? ''} />
      <figcaption>
        <strong>{zoomed.headline}</strong>
        {#if zoomed.imageCaption}<span>{zoomed.imageCaption}</span>{/if}
        {#if zoomed.imageCredit}<span class="credit">Photo: {zoomed.imageCredit}</span>{/if}
      </figcaption>
    </figure>
    <button class="btn small close" onclick={() => (zoomed = undefined)}>Close ✕</button>
  </div>
{/if}

<style>
  .paper {
    --serif: 'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, 'Times New Roman', serif;
    --paper: #f7f3e8;
    --paper-ink: #1c1a16;
    --paper-rule: #2a2722;
    background: var(--paper);
    color: var(--paper-ink);
    font-family: var(--serif);
    padding: 18px 26px 22px;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    border: 1px solid rgba(0, 0, 0, 0.12);
  }
  @media (prefers-color-scheme: dark) {
    .paper {
      --paper: #e9e3d3;
    }
  }
  .rule {
    border-top: 1px solid var(--paper-rule);
  }
  .rule.double {
    border-top: 3px double var(--paper-rule);
  }
  .masthead {
    text-align: center;
    display: grid;
    gap: 4px;
    margin-bottom: 14px;
  }
  .masthead h2 {
    font-family: 'Old English Text MT', 'UnifrakturCook', 'Engravers Old English', var(--serif);
    font-size: clamp(2.4rem, 6vw, 3.6rem);
    font-weight: 700;
    letter-spacing: 0.01em;
    line-height: 1.05;
    margin: 6px 0 2px;
  }
  .dateline {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin: 0 0 4px;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .dateline .date {
    font-weight: 700;
  }
  .markets {
    overflow: hidden;
    white-space: nowrap;
    text-align: center;
    margin: 4px 0;
    font-family: var(--font);
    font-size: 0.9rem;
  }
  .markets.sliding {
    text-align: left;
    mask-image: linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 24px), transparent);
  }
  .run,
  .set {
    display: inline-block;
  }
  .sliding .run {
    animation: strip-slide linear infinite;
  }
  .markets:hover .run {
    animation-play-state: paused;
  }
  .set > :global(*) {
    margin: 0 9px;
  }
  @keyframes strip-slide {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .sliding .run {
      animation: none;
    }
  }
  .mk {
    white-space: nowrap;
  }
  .mk.index {
    font-weight: 650;
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
  .mk-sep {
    display: inline-block;
    width: 1px;
    height: 1em;
    vertical-align: middle;
    background: rgba(42, 39, 34, 0.45);
  }
  .big .markets {
    font-size: 1.2rem;
  }
  .big .set > :global(*) {
    margin: 0 13px;
  }
  .quiet {
    text-align: center;
    font-style: italic;
    margin: 18px 0 6px;
  }
  .kicker {
    margin: 0 0 2px;
    font-family: var(--font);
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #8a1c1c;
  }

  /* lead story */
  .lead {
    display: grid;
    gap: 10px 22px;
    margin-bottom: 16px;
  }
  .lead.with-picture {
    grid-template-columns: minmax(0, 5fr) minmax(0, 4fr);
    grid-template-areas: 'head head' 'picture text';
  }
  .lead-head {
    grid-area: head;
  }
  .lead-picture {
    grid-area: picture;
  }
  .lead.with-picture .lead-text {
    grid-area: text;
  }
  .lead:not(.with-picture) .lead-text {
    columns: 2;
    column-gap: 26px;
  }
  .lead h3 {
    font-size: clamp(1.6rem, 3.6vw, 2.5rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.01em;
    margin: 0;
    text-wrap: balance;
  }
  .lead-text p:first-child {
    font-size: 1.08rem;
  }
  .lead-text p:first-child::first-letter {
    float: left;
    font-size: 3.1em;
    line-height: 0.82;
    padding: 4px 6px 0 0;
    font-weight: 700;
  }

  /* the other stories */
  .columns {
    columns: 3 240px;
    column-gap: 26px;
    column-rule: 1px solid rgba(42, 39, 34, 0.35);
    margin-top: 14px;
  }
  .story {
    break-inside: avoid;
    padding-bottom: 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid rgba(42, 39, 34, 0.35);
  }
  .story:last-child {
    border-bottom: none;
  }
  .story.beside {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    gap: 22px;
    align-items: start;
  }
  .story.beside img {
    margin-bottom: 0;
  }
  h4 {
    font-size: 1.15rem;
    font-weight: 800;
    line-height: 1.15;
    margin: 0 0 6px;
    text-wrap: balance;
  }
  .paper p {
    margin: 0;
    line-height: 1.45;
    hyphens: auto;
  }
  .story p {
    font-size: 0.95rem;
    text-align: justify;
  }
  .zoom {
    all: unset;
    display: block;
    width: 100%;
    cursor: zoom-in;
  }
  .zoom:focus-visible {
    outline: 2px solid var(--paper-rule);
    outline-offset: 2px;
  }
  .zoom img {
    display: block;
    width: 100%;
    object-fit: cover;
    background: #d9d3c3;
    filter: saturate(0.85) contrast(1.02);
  }
  .lead-picture img {
    aspect-ratio: 3 / 2;
  }
  .story img {
    aspect-ratio: 16 / 10;
    margin-bottom: 8px;
  }
  .more-link {
    margin: 6px 0 0 !important;
    font-family: var(--font);
    font-size: 0.85rem;
  }
  .more-link a {
    color: #8a1c1c;
    font-weight: 600;
  }
  .tags {
    margin: 8px 0 0 !important;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    font-family: var(--font);
  }
  .tag {
    all: unset;
    font-size: 0.75rem;
    padding: 1px 9px;
    border-radius: 999px;
    border: 1px solid var(--paper-rule);
    cursor: pointer;
  }
  .tag:hover {
    background: var(--paper-ink);
    color: var(--paper);
  }
  .tag.plain {
    cursor: default;
    border-color: rgba(42, 39, 34, 0.4);
  }
  .tag.plain:hover {
    background: none;
    color: inherit;
  }
  .tag:focus-visible {
    outline: 2px solid var(--paper-rule);
    outline-offset: 2px;
  }

  /* projector */
  .big {
    padding: 26px 40px 30px;
  }
  .big .masthead h2 {
    font-size: clamp(3.2rem, 7vw, 5rem);
  }
  .big .lead h3 {
    font-size: clamp(2.2rem, 4.4vw, 3.4rem);
  }
  .big .lead-text p:first-child {
    font-size: 1.35rem;
  }
  .big h4 {
    font-size: 1.45rem;
  }
  .big .story p {
    font-size: 1.15rem;
  }
  .big .columns {
    columns: 3 300px;
  }

  @media (max-width: 720px) {
    .paper {
      padding: 14px 16px 18px;
    }
    .lead.with-picture {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas: 'head' 'picture' 'text';
    }
    .lead:not(.with-picture) .lead-text {
      columns: 1;
    }
    .story.beside {
      grid-template-columns: minmax(0, 1fr);
      gap: 8px;
    }
    .dateline span:not(.date) {
      display: none;
    }
    .dateline {
      justify-content: center;
    }
  }

  /* large picture view */
  .lightbox {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: rgba(0, 0, 0, 0.86);
    display: grid;
    place-items: center;
    padding: 24px;
    cursor: zoom-out;
    font-family: var(--font);
  }
  .lightbox figure {
    margin: 0;
    display: grid;
    gap: 10px;
    justify-items: center;
    max-width: min(1400px, 100%);
  }
  .lightbox img {
    max-width: 100%;
    max-height: calc(100vh - 150px);
    object-fit: contain;
    border-radius: 6px;
  }
  .lightbox figcaption {
    display: grid;
    gap: 2px;
    text-align: center;
    color: #fff;
    font-size: 0.95rem;
  }
  .lightbox .credit {
    color: #c3c2b7;
    font-size: 0.8rem;
  }
  .lightbox .close {
    position: absolute;
    top: 16px;
    right: 16px;
  }
</style>
