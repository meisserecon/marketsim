<script lang="ts">
  /** The full front page of The News over the page, as opened from the ticker or the news preview. */
  import { onMount } from 'svelte';
  import type { NewsItemView } from '@marketsim/shared';
  import type { MarketSummary } from '$lib/movers';
  import FrontPage from './FrontPage.svelte';

  interface Props {
    month: string;
    items: NewsItemView[];
    nameOf: (id: string) => string;
    openable?: Set<string>;
    /** A company picked from a story's tags: the paper closes first. */
    onselect?: (id: string) => void;
    markets?: MarketSummary;
    /** The story to bring into view, by its place in `items`; the lead (0) is at the top anyway. */
    focus?: number;
    onclose: () => void;
  }
  let { month, items, nameOf, openable, onselect, markets, focus = 0, onclose }: Props = $props();

  let page = $state<HTMLElement | undefined>(undefined);
  onMount(() => {
    if (focus > 0) page?.querySelector(`[data-story="${focus}"]`)?.scrollIntoView({ block: 'center' });
  });

  function pick(id: string) {
    onclose();
    onselect?.(id);
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }
</script>

<svelte:window onkeydown={onKey} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="backdrop" role="dialog" aria-modal="true" aria-label="The News" tabindex="-1" onclick={(e) => { if (e.target === e.currentTarget) onclose(); }}>
  <div class="page" bind:this={page}>
    <button class="btn small close" onclick={onclose}>Close ✕</button>
    <FrontPage {month} {items} {nameOf} {openable} onselect={onselect ? pick : undefined} {markets} />
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 38;
    background: color-mix(in srgb, var(--page) 86%, transparent);
    backdrop-filter: blur(5px);
    overflow-y: auto;
    padding: 20px 16px 48px;
    display: grid;
    justify-items: center;
    align-items: start;
  }
  .page {
    width: min(1100px, 100%);
    display: grid;
    gap: 8px;
    justify-items: end;
  }
  .page > :global(.paper) {
    justify-self: stretch;
  }
</style>
