<script lang="ts">
  /**
   * The curator's desk: every beat of every story arc, by month or by arc, with keyboard rating.
   * Works only under `npm run dev:web` (the review plugin reads and writes ../data); in a build
   * it shows a notice. Decisions go into the beats files as `importance`, `cut`, `lead`, `note`.
   */
  import { onMount } from 'svelte';
  import { monthName } from '$lib/format';

  interface Beat {
    month: string;
    title: string;
    what: string;
    why: string;
    assets: string[];
    move?: { asset: string; pct: number };
    importance: number;
    source: string;
    cut?: boolean;
    lead?: boolean;
    note?: string;
  }
  interface Asset { name: string; renames?: { from: string; name: string }[]; listed: string; end?: string; prices: Record<string, number> }
  interface Row { arc: string; index: number; beat: Beat }

  const dev = import.meta.env.DEV;
  let arcs = $state<Record<string, Beat[]>>({});
  let assets = $state<Record<string, Asset>>({});
  let loaded = $state(false);
  let error = $state('');
  let view = $state<'month' | 'arc'>('month');
  let month = $state('1979-12');
  let arc = $state('');
  let cursor = $state(0);
  let threshold = $state(3); // show beats up to this importance
  let showCut = $state(false);

  onMount(async () => {
    try {
      const r = await fetch('/__review/data');
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      arcs = d.arcs;
      assets = d.assets;
      arc = Object.keys(arcs)[0] ?? '';
      loaded = true;
    } catch (e) {
      error = (e as Error).message;
    }
  });

  const all = $derived.by((): Row[] => {
    const out: Row[] = [];
    for (const [a, beats] of Object.entries(arcs)) beats.forEach((beat, index) => out.push({ arc: a, index, beat }));
    return out.sort((x, y) => x.beat.month.localeCompare(y.beat.month) || x.beat.importance - y.beat.importance);
  });
  const months = $derived.by(() => {
    const m = new Map<string, { total: number; kept: number }>();
    for (const r of all) {
      const e = m.get(r.beat.month) ?? { total: 0, kept: 0 };
      e.total++;
      if (!r.beat.cut && r.beat.importance <= threshold) e.kept++;
      m.set(r.beat.month, e);
    }
    return [...m.entries()].sort();
  });
  const visible = $derived(
    (view === 'month' ? all.filter((r) => r.beat.month === month) : all.filter((r) => r.arc === arc)).filter((r) => showCut || !r.beat.cut)
  );
  const kept = $derived(all.filter((r) => !r.beat.cut && r.beat.importance <= threshold).length);
  const perArc = $derived.by(() => {
    const m = new Map<string, { total: number; kept: number }>();
    for (const r of all) {
      const e = m.get(r.arc) ?? { total: 0, kept: 0 };
      e.total++;
      if (!r.beat.cut && r.beat.importance <= threshold) e.kept++;
      m.set(r.arc, e);
    }
    return [...m.entries()].sort();
  });

  const nameAt = (id: string, m: string) => {
    const a = assets[id];
    if (!a) return id;
    let n = a.name;
    for (const r of a.renames ?? []) if (r.from <= m) n = r.name;
    return n;
  };
  const prevMonth = (m: string) => {
    const [y, mm] = m.split('-').map(Number);
    return mm === 1 ? `${y - 1}-12` : `${y}-${String(mm - 1).padStart(2, '0')}`;
  };
  const change = (id: string, m: string): number | undefined => {
    const p = assets[id]?.prices;
    if (!p || p[m] === undefined || p[prevMonth(m)] === undefined) return undefined;
    return p[m] / p[prevMonth(m)] - 1;
  };
  const pct = (x: number | undefined) => (x === undefined ? '' : `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)}%`);
  const movers = (m: string) =>
    Object.keys(assets)
      .filter((id) => id !== 'sp500' && id !== 'gold')
      .map((id) => ({ id, c: change(id, m) }))
      .filter((x): x is { id: string; c: number } => x.c !== undefined && assets[x.id].listed <= m)
      .sort((a, b) => Math.abs(b.c) - Math.abs(a.c))
      .slice(0, 4);

  async function patch(row: Row, p: Partial<Beat>) {
    const r = await fetch('/__review/beat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ arc: row.arc, index: row.index, patch: p }) });
    if (!r.ok) {
      error = `Save failed: ${(await r.json()).error}`;
      return;
    }
    const saved = (await r.json()).beat as Beat;
    arcs[row.arc][row.index] = saved;
    arcs = { ...arcs };
  }

  function stepMonth(d: number) {
    const i = months.findIndex(([m]) => m === month);
    const next = months[Math.min(months.length - 1, Math.max(0, i + d))];
    if (next) month = next[0];
    cursor = 0;
  }

  function onKey(e: KeyboardEvent) {
    if ((e.target as HTMLElement)?.tagName === 'TEXTAREA' || (e.target as HTMLElement)?.tagName === 'INPUT') return;
    const row = visible[cursor];
    if (e.key === 'j' || e.key === 'ArrowDown') cursor = Math.min(visible.length - 1, cursor + 1);
    else if (e.key === 'k' || e.key === 'ArrowUp') cursor = Math.max(0, cursor - 1);
    else if (e.key === 'n' && view === 'month') stepMonth(1);
    else if (e.key === 'p' && view === 'month') stepMonth(-1);
    else if (row && ['1', '2', '3'].includes(e.key)) void patch(row, { importance: Number(e.key) });
    else if (row && e.key === 'x') void patch(row, { cut: !row.beat.cut });
    else if (row && e.key === 'l') void patch(row, { lead: !row.beat.lead });
    else return;
    e.preventDefault();
  }
</script>

<svelte:window onkeydown={onKey} />
<svelte:head><title>Review · marketsim</title></svelte:head>

{#if !dev}
  <main class="center"><p class="notice warn">The review desk only works in development: run <code>npm run dev:web</code> and open this page on port 5173.</p></main>
{:else if error && !loaded}
  <main class="center"><p class="notice error">{error}</p></main>
{:else if !loaded}
  <main class="center"><p class="muted">Loading…</p></main>
{:else}
  <main class="desk">
    <aside class="side">
      <h1>Review</h1>
      <p class="sub">{kept} of {all.length} beats kept at importance ≤ {threshold}</p>
      <div class="segmented" role="group" aria-label="View">
        <button aria-pressed={view === 'month'} onclick={() => { view = 'month'; cursor = 0; }}>By month</button>
        <button aria-pressed={view === 'arc'} onclick={() => { view = 'arc'; cursor = 0; }}>By arc</button>
      </div>
      <label class="field inline"><span>Show up to</span>
        <select bind:value={threshold}><option value={1}>1 must</option><option value={2}>2 should</option><option value={3}>3 all</option></select>
      </label>
      <label class="field inline"><input type="checkbox" bind:checked={showCut} /> <span>show cut beats</span></label>
      <p class="sub keys">Keys: j/k move · 1 2 3 importance · x cut · l lead · n/p next/previous month</p>
      {#if error}<p class="notice error">{error}</p>{/if}

      {#if view === 'month'}
        <ul class="list">
          {#each months as [m, c] (m)}
            <li>
              <button class:on={m === month} onclick={() => { month = m; cursor = 0; }}>
                <span>{m}</span><span class="count" class:thin={c.kept < 2} class:fat={c.kept > 5}>{c.kept}/{c.total}</span>
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <ul class="list">
          {#each perArc as [a, c] (a)}
            <li>
              <button class:on={a === arc} onclick={() => { arc = a; cursor = 0; }}>
                <span>{a}</span><span class="count">{c.kept}/{c.total}</span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </aside>

    <section class="main">
      {#if view === 'month'}
        <header class="month-head">
          <h2>{monthName(month)}</h2>
          <p class="sub">
            Market {pct(change('sp500', month))} · gold {pct(change('gold', month))}
            {#each movers(month) as x (x.id)} · {nameAt(x.id, month)} <span class={x.c < 0 ? 'down' : 'up'}>{pct(x.c)}</span>{/each}
          </p>
        </header>
      {:else}
        <header class="month-head"><h2>{arc}</h2><p class="sub">{visible.length} beats</p></header>
      {/if}

      {#if visible.length === 0}
        <p class="muted">Nothing here.</p>
      {/if}
      <ol class="beats">
        {#each visible as row, i (row.arc + row.index)}
          {@const b = row.beat}
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
          <li class="beat" class:current={i === cursor} class:cut={b.cut} class:faded={b.importance > threshold} onclick={() => (cursor = i)}>
            <div class="rank">
              <span class="imp imp-{b.importance}">{b.importance}</span>
              {#if b.lead}<span class="badge new">lead</span>{/if}
            </div>
            <div class="body">
              <p class="meta sub">
                {#if view === 'arc'}{b.month} · {/if}<strong>{row.arc}</strong>
                {#each b.assets as id (id)} · {nameAt(id, b.month)} <span class={(change(id, b.month) ?? 0) < 0 ? 'down' : 'up'}>{pct(change(id, b.month))}</span>{/each}
                {#if b.move} · explains {b.move.asset} {b.move.pct > 0 ? '+' : ''}{b.move.pct}%{/if}
              </p>
              <h3>{b.title}</h3>
              <p class="what">{b.what}</p>
              <p class="why sub">{b.why}</p>
              <p class="src sub">{b.source}</p>
              <div class="actions">
                {#each [1, 2, 3] as n (n)}<button class="btn small" aria-pressed={b.importance === n} onclick={(e) => { e.stopPropagation(); void patch(row, { importance: n }); }}>{n}</button>{/each}
                <button class="btn small" aria-pressed={!!b.cut} onclick={(e) => { e.stopPropagation(); void patch(row, { cut: !b.cut }); }}>{b.cut ? 'cut' : 'keep'}</button>
                <button class="btn small" aria-pressed={!!b.lead} onclick={(e) => { e.stopPropagation(); void patch(row, { lead: !b.lead }); }}>lead</button>
                <input class="input note" placeholder="note to the writer" value={b.note ?? ''} onchange={(e) => void patch(row, { note: (e.currentTarget as HTMLInputElement).value })} onclick={(e) => e.stopPropagation()} />
              </div>
            </div>
          </li>
        {/each}
      </ol>
    </section>
  </main>
{/if}

<style>
  .center {
    min-height: 60vh;
    display: grid;
    place-content: center;
    padding: 24px;
  }
  .desk {
    display: grid;
    grid-template-columns: 240px minmax(0, 1fr);
    gap: 20px;
    padding: 16px 20px 60px;
    max-width: 1500px;
    margin: 0 auto;
  }
  .side {
    position: sticky;
    top: 12px;
    align-self: start;
    max-height: calc(100vh - 24px);
    overflow-y: auto;
    display: grid;
    gap: 10px;
    align-content: start;
  }
  .side h1 {
    font-size: 1.3rem;
  }
  .keys {
    font-size: 0.78rem;
  }
  .field.inline {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 0.87rem;
  }
  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 2px;
  }
  .list button {
    all: unset;
    display: flex;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
    padding: 3px 8px;
    border-radius: 6px;
    cursor: pointer;
    font-variant-numeric: tabular-nums;
    font-size: 0.85rem;
  }
  .list button:hover {
    background: var(--surface-2);
  }
  .list button.on {
    background: var(--accent-wash);
    color: var(--accent);
    font-weight: 600;
  }
  .count {
    color: var(--muted);
  }
  .count.thin {
    color: var(--down);
  }
  .count.fat {
    color: var(--warn-ink);
  }
  .month-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  .month-head h2 {
    font-size: 1.5rem;
  }
  .beats {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 10px;
  }
  .beat {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr);
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    cursor: default;
  }
  .beat.current {
    outline: 2px solid var(--accent);
  }
  .beat.cut {
    opacity: 0.45;
    text-decoration: line-through;
  }
  .beat.faded {
    opacity: 0.6;
  }
  .rank {
    display: grid;
    gap: 4px;
    justify-items: center;
    align-content: start;
  }
  .imp {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-weight: 700;
    color: #fff;
  }
  .imp-1 {
    background: var(--accent);
  }
  .imp-2 {
    background: #6b7a8f;
  }
  .imp-3 {
    background: var(--axis);
  }
  .body {
    display: grid;
    gap: 4px;
  }
  .meta {
    font-size: 0.8rem;
  }
  h3 {
    font-size: 1.05rem;
    margin: 0;
  }
  .what {
    margin: 0;
    line-height: 1.45;
  }
  .why {
    margin: 0;
    font-style: italic;
  }
  .src {
    margin: 0;
    font-size: 0.72rem;
    overflow-wrap: anywhere;
  }
  .actions {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 4px;
  }
  .actions .btn[aria-pressed='true'] {
    background: var(--accent);
    color: var(--accent-ink);
  }
  .note {
    flex: 1;
    min-width: 200px;
    font-size: 0.85rem;
    padding: 4px 8px;
  }
</style>
