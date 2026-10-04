<script lang="ts">
  /** The month's headlines on one line; clicking opens the full front page of The News. */
  import type { NewsItemView } from '@marketsim/shared';
  import FrontPage from './FrontPage.svelte';

  interface Props {
    month: string;
    items: NewsItemView[];
    nameOf: (id: string) => string;
    openable?: Set<string>;
    onselect?: (id: string) => void;
    /** Shown instead of headlines in a month without news: the market and the biggest movers. */
    quiet?: string[];
  }
  let { month, items, nameOf, openable, onselect, quiet = [] }: Props = $props();
  /** What runs across the line: the headlines, or the market moves when there are none. */
  const lines = $derived(items.length ? items.map((i) => i.headline) : quiet);

  let open = $state(false);
  /** Long lines scroll slowly; the speed is steady whatever the number of headlines. */
  const seconds = $derived(Math.max(20, lines.reduce((n, l) => n + l.length, 0) / 5));

  // The headlines only move when they do not fit on the line.
  let tapeWidth = $state(0);
  let setWidth = $state(0);
  const moving = $derived(setWidth > tapeWidth + 1);

  function pick(id: string) {
    open = false;
    onselect?.(id);
  }
  function onKey(e: KeyboardEvent) {
    if (open && e.key === 'Escape') open = false;
  }
</script>

<svelte:window onkeydown={onKey} />

{#if lines.length}
  <button class="ticker" class:quiet={!items.length} onclick={() => (open = true)} disabled={!items.length} aria-label="Open The News for this month">
    <span class="label">{items.length ? 'The News' : 'Markets'}</span>
    <span class="tape" class:moving bind:clientWidth={tapeWidth}>
      <span class="run" style:animation-duration="{seconds}s">
        <span class="set" bind:clientWidth={setWidth}>
          {#each lines as line, i (i)}<span class="headline" class:last={!moving && i === lines.length - 1}>{line}</span>{/each}
        </span>
        {#if moving}
          <span class="set" aria-hidden="true">
            {#each lines as line, i (i)}<span class="headline">{line}</span>{/each}
          </span>
        {/if}
      </span>
    </span>
    {#if items.length}<span class="more">Read</span>{/if}
  </button>
{/if}

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="backdrop" role="dialog" aria-modal="true" aria-label="The News" tabindex="-1" onclick={(e) => { if (e.target === e.currentTarget) open = false; }}>
    <div class="page">
      <button class="btn small close" onclick={() => (open = false)}>Close ✕</button>
      <FrontPage {month} {items} {nameOf} {openable} onselect={pick} />
    </div>
  </div>
{/if}

<style>
  .ticker {
    all: unset;
    box-sizing: border-box;
    width: 100%;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    padding: 7px 12px;
    border-radius: var(--radius);
    background: #f7f3e8;
    color: #1c1a16;
    border: 1px solid rgba(0, 0, 0, 0.14);
    cursor: pointer;
    font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif;
  }
  .ticker.quiet {
    cursor: default;
    grid-template-columns: auto minmax(0, 1fr);
  }
  .ticker.quiet .headline {
    font-weight: 400;
  }
  .ticker:hover {
    border-color: rgba(0, 0, 0, 0.4);
  }
  .ticker:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .label {
    font-family: 'Old English Text MT', 'Engravers Old English', 'Iowan Old Style', Georgia, serif;
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1;
    padding-right: 12px;
    border-right: 1px solid rgba(0, 0, 0, 0.35);
    white-space: nowrap;
  }
  .tape {
    overflow: hidden;
    white-space: nowrap;
  }
  .tape.moving {
    mask-image: linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 24px), transparent);
  }
  .run,
  .set {
    display: inline-block;
  }
  .moving .run {
    animation: slide linear infinite;
  }
  .headline.last::after {
    content: none;
  }
  .ticker:hover .run {
    animation-play-state: paused;
  }
  .headline {
    font-weight: 700;
    font-size: 0.98rem;
  }
  .headline::after {
    content: '◆';
    font-size: 0.5em;
    vertical-align: middle;
    margin: 0 18px;
    opacity: 0.55;
  }
  @keyframes slide {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .moving .run {
      animation: none;
    }
    .set[aria-hidden='true'] {
      display: none;
    }
    .tape {
      text-overflow: ellipsis;
    }
  }
  .more {
    font-family: var(--font);
    font-size: 0.8rem;
    font-weight: 650;
    text-decoration: underline;
    text-underline-offset: 3px;
    white-space: nowrap;
  }
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
