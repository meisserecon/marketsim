<script lang="ts">
  /** The news of a month: one card per item, with room for a picture on the left once there is one. */
  import type { NewsItemView } from '@marketsim/shared';

  interface Props {
    items: NewsItemView[];
    /** Resolves a company id to the name it carries now; the id itself when unknown. */
    nameOf: (id: string) => string;
    /** Ids that can be opened in the asset panel; others are shown as plain text. */
    openable?: Set<string>;
    onselect?: (id: string) => void;
    /** Larger type for the projector. */
    big?: boolean;
    /** Show the month on each item (for lists spanning months). */
    showMonth?: boolean;
    monthLabel?: (month: string) => string;
  }
  let { items, nameOf, openable, onselect, big = false, showMonth = false, monthLabel = (m) => m }: Props = $props();

  const KIND_LABEL: Record<string, string> = { listing: 'Now trading', delisting: 'Leaving the market' };

  /** The item whose picture is shown large. */
  let zoomed = $state<NewsItemView | undefined>(undefined);
  function onKey(e: KeyboardEvent) {
    if (zoomed && e.key === 'Escape') {
      zoomed = undefined;
      e.stopPropagation();
    }
  }
</script>

<svelte:window onkeydowncapture={onKey} />

{#if items.length === 0}
  <p class="sub muted">No news this month.</p>
{:else}
  <ul class="news" class:big>
    {#each items as item, i (i)}
      <li class="item" class:listing={item.kind === 'listing' || item.kind === 'delisting'}>
        {#if item.image}
          <figure>
            <button class="zoom" onclick={() => (zoomed = item)} aria-label="Show the picture larger">
              <img src={item.image} alt={item.imageCaption ?? ''} loading="lazy" />
            </button>
          </figure>
        {/if}
        <div class="body">
          {#if showMonth || KIND_LABEL[item.kind]}
            <p class="sub meta">
              {#if showMonth}{monthLabel(item.month)}{/if}
              {#if KIND_LABEL[item.kind]}<span class="badge new">{KIND_LABEL[item.kind]}</span>{/if}
            </p>
          {/if}
          <h3>{item.headline}</h3>
          <p class="text">{item.text}</p>
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
        </div>
      </li>
    {/each}
  </ul>
{/if}

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
  .zoom {
    all: unset;
    display: block;
    width: 100%;
    cursor: zoom-in;
    border-radius: 8px;
  }
  .zoom:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .lightbox {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: rgba(0, 0, 0, 0.86);
    display: grid;
    place-items: center;
    padding: 24px;
    cursor: zoom-out;
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
    width: auto;
    height: auto;
    aspect-ratio: auto;
    object-fit: contain;
    border-radius: 6px;
    background: none;
  }
  .lightbox figcaption {
    display: grid;
    gap: 2px;
    text-align: center;
    color: #fff;
    font-size: 0.95rem;
    margin: 0;
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
  .news {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 14px;
  }
  .item {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--hairline);
  }
  .item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  .item:has(figure) {
    grid-template-columns: 180px minmax(0, 1fr);
  }
  figure {
    margin: 0;
  }
  figure img {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    border-radius: 8px;
    display: block;
    background: var(--surface-2);
  }
  figcaption {
    margin-top: 4px;
    font-size: 0.75rem;
  }
  .credit {
    color: var(--muted);
    white-space: nowrap;
  }
  .body {
    display: grid;
    gap: 4px;
    align-content: start;
  }
  .meta {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 0.8rem;
  }
  h3 {
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 1.25;
    margin: 0;
  }
  .text {
    margin: 0;
    line-height: 1.5;
  }
  .tags {
    margin: 2px 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .tag {
    all: unset;
    font-size: 0.8rem;
    padding: 1px 9px;
    border-radius: 999px;
    background: var(--accent-wash);
    color: var(--accent);
    cursor: pointer;
  }
  .tag.plain {
    cursor: default;
    background: var(--surface-2);
    color: var(--ink-2);
  }
  .tag:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .big h3 {
    font-size: 1.5rem;
  }
  .big .text {
    font-size: 1.15rem;
  }
  .big .item:has(figure) {
    grid-template-columns: 260px minmax(0, 1fr);
  }
  @media (max-width: 600px) {
    .item:has(figure),
    .big .item:has(figure) {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
