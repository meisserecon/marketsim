<script lang="ts">
  import type { AssetKind, AssetView } from '@marketsim/shared';
  import { change, direction, pct, price } from '$lib/format';

  interface Props {
    assets: AssetView[];
    month: string;
    /** Asset ids the player holds. */
    held: Set<string>;
    selectedId?: string;
    /** Off in the base month, where every asset would count as new. */
    markNew: boolean;
    onselect: (id: string) => void;
  }
  let { assets, month, held, selectedId, markNew, onselect }: Props = $props();

  type SortKey = 'name' | 'price' | 'm1' | 'm12' | 'income' | 'yield';
  let sortKey = $state<SortKey>('name');
  let sortDir = $state<1 | -1>(1);

  const GROUPS: { kind: AssetKind; title: string; hint: string }[] = [
    { kind: 'bond', title: 'Bonds', hint: 'US Treasuries. Each repays 100 in January of its year and pays nothing before; the price moves against interest rates.' },
    { kind: 'gold', title: 'Gold', hint: 'Pays no income.' },
    { kind: 'stock', title: 'Stocks', hint: 'Dividends are paid into your cash.' }
  ];

  const COLUMNS: { key: SortKey; label: string; title: string }[] = [
    { key: 'price', label: 'Price', title: 'USD per unit, split-adjusted' },
    { key: 'm1', label: '1 month', title: 'Price change since last month' },
    { key: 'm12', label: '12 months', title: 'Price change over twelve months' },
    { key: 'income', label: 'Income 12 mo', title: 'Dividends paid over the last twelve months, as a percentage of the price' },
    { key: 'yield', label: 'Bond yield', title: 'Yearly return if you buy now and hold until the bond is repaid' }
  ];

  interface Row {
    asset: AssetView;
    m1?: number;
    m12?: number;
    income: number;
    yield?: number;
    isNew: boolean;
  }

  const rows = $derived(
    assets.map(
      (a): Row => ({
        asset: a,
        m1: change(a.price, a.pricePrev),
        m12: change(a.price, a.priceYearAgo),
        income: a.price > 0 ? a.incomeLastYear / a.price : 0,
        yield: a.kind === 'bond' ? a.extra?.yield : undefined,
        isNew: markNew && a.listedSince === month
      })
    )
  );

  function value(r: Row, key: SortKey): number | string | undefined {
    switch (key) {
      case 'name':
        return r.asset.name.toLowerCase();
      case 'price':
        return r.asset.price;
      case 'm1':
        return r.m1;
      case 'm12':
        return r.m12;
      case 'income':
        return r.income;
      case 'yield':
        return r.yield;
    }
  }

  const groups = $derived(
    GROUPS.map((g) => ({
      ...g,
      rows: rows
        .filter((r) => r.asset.kind === g.kind)
        .sort((a, b) => {
          const va = value(a, sortKey);
          const vb = value(b, sortKey);
          // Missing values always sink to the bottom, whatever the direction.
          if (va === undefined && vb === undefined) return a.asset.name.localeCompare(b.asset.name);
          if (va === undefined) return 1;
          if (vb === undefined) return -1;
          const c = typeof va === 'string' ? va.localeCompare(vb as string, 'en', { numeric: true }) : va - (vb as number);
          return c !== 0 ? c * sortDir : a.asset.name.localeCompare(b.asset.name, 'en', { numeric: true });
        })
    })).filter((g) => g.rows.length > 0)
  );

  function sortBy(key: SortKey) {
    if (sortKey === key) sortDir = sortDir === 1 ? -1 : 1;
    else {
      sortKey = key;
      sortDir = key === 'name' ? 1 : -1;
    }
  }
  const aria = (key: SortKey) => (sortKey === key ? (sortDir === 1 ? 'ascending' : 'descending') : 'none');
  const arrow = (key: SortKey) => (sortKey === key ? (sortDir === 1 ? '▲' : '▼') : '');
</script>

<div class="scroll">
  <table class="data market">
    <thead>
      <tr>
        <th aria-sort={aria('name')}><button onclick={() => sortBy('name')}>Asset <span class="arrow">{arrow('name')}</span></button></th>
        {#each COLUMNS as c (c.key)}
          <th class="num" aria-sort={aria(c.key)} title={c.title}>
            <button onclick={() => sortBy(c.key)}><span class="arrow">{arrow(c.key)}</span> {c.label}</button>
          </th>
        {/each}
      </tr>
    </thead>
    {#each groups as g (g.kind)}
      <tbody>
        <tr class="group">
          <th colspan="6" scope="rowgroup">{g.title} <span class="hint">{g.hint}</span></th>
        </tr>
        {#each g.rows as r (r.asset.id)}
          <tr class="asset" class:selected={r.asset.id === selectedId} class:new={r.isNew} onclick={() => onselect(r.asset.id)}>
            <td class="name">
              <button class="link" onclick={(e) => { e.stopPropagation(); onselect(r.asset.id); }}>{r.asset.name}</button>
              {#if r.isNew}<span class="badge new">New</span>{/if}
              {#if held.has(r.asset.id)}<span class="badge held">Held</span>{/if}
            </td>
            <td class="num">{price(r.asset.price)}</td>
            <td class="num {direction(r.m1)}">{pct(r.m1, { sign: true })}</td>
            <td class="num {direction(r.m12)}">{pct(r.m12, { sign: true })}</td>
            <td class="num" class:zero={r.income === 0}>{pct(r.income)}</td>
            <td class="num">{r.yield !== undefined ? pct(r.yield, { digits: 2 }) : ''}</td>
          </tr>
        {/each}
      </tbody>
    {/each}
  </table>
</div>

<style>
  .scroll {
    overflow-x: auto;
  }
  .market {
    min-width: 560px;
  }
  thead th {
    position: sticky;
    top: 0;
    background: var(--surface);
    padding: 0;
  }
  thead button {
    all: unset;
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 6px 8px;
    cursor: pointer;
  }
  thead button:hover {
    color: var(--ink);
  }
  thead button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }
  .arrow {
    font-size: 0.65rem;
    color: var(--accent);
  }
  tr.group th {
    padding: 14px 8px 6px;
    font-size: 0.87rem;
    font-weight: 700;
    color: var(--ink);
    border-bottom: 1px solid var(--axis);
    white-space: normal;
  }
  .hint {
    font-weight: 400;
    color: var(--muted);
    margin-left: 6px;
    font-size: 0.8rem;
  }
  tr.asset {
    cursor: pointer;
  }
  tr.asset:hover td {
    background: var(--surface-2);
  }
  tr.asset.selected td {
    background: var(--accent-wash);
  }
  tr.asset.new td {
    background: var(--new-wash);
    animation: flash 1.6s ease-out 1;
  }
  @keyframes flash {
    from {
      box-shadow: inset 0 0 0 100px color-mix(in srgb, var(--new-ink) 22%, transparent);
    }
    to {
      box-shadow: inset 0 0 0 100px transparent;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    tr.asset.new td {
      animation: none;
    }
  }
  td.name {
    font-weight: 550;
  }
  td.name .badge {
    margin-left: 6px;
  }
  .link {
    all: unset;
    cursor: pointer;
  }
  .link:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 3px;
  }
  .zero {
    color: var(--muted);
  }
  :global(td.flat) {
    color: var(--ink-2);
  }
</style>
