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
</script>

{#if items.length === 0}
  <p class="sub muted">No news this month.</p>
{:else}
  <ul class="news" class:big>
    {#each items as item, i (i)}
      <li class="item" class:listing={item.kind === 'listing' || item.kind === 'delisting'}>
        {#if item.image}
          <figure>
            <img src={item.image} alt={item.imageCaption ?? ''} loading="lazy" />
            {#if item.imageCaption || item.imageCredit}<figcaption class="sub">{item.imageCaption ?? ''}{#if item.imageCredit} <span class="credit">© {item.imageCredit}</span>{/if}</figcaption>{/if}
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

<style>
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
