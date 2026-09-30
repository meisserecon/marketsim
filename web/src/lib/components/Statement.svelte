<script lang="ts">
  import type { LedgerEntry } from '@marketsim/shared';
  import { LEDGER_LABEL, monthShort, price, usd } from '$lib/format';

  interface Props {
    /** Most recent first. */
    ledger: LedgerEntry[];
    nameOf: (assetId: string) => string;
  }
  let { ledger, nameOf }: Props = $props();

  type Filter = 'all' | 'trades' | 'income' | 'events';
  let filter = $state<Filter>('all');
  let shown = $state(30);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'trades', label: 'Trades' },
    { key: 'income', label: 'Income' },
    { key: 'events', label: 'Events' }
  ];

  const group = (e: LedgerEntry): Filter => (e.kind === 'buy' || e.kind === 'sell' ? 'trades' : e.kind === 'income' ? 'income' : 'events');
  const filtered = $derived(filter === 'all' ? ledger : ledger.filter((e) => group(e) === filter));
  const visible = $derived(filtered.slice(0, shown));
  const sum = $derived(filtered.reduce((s, e) => s + e.cash, 0));

  function detail(e: LedgerEntry): string {
    switch (e.kind) {
      case 'buy':
      case 'sell':
        return `at ${price(e.price)} per unit`;
      case 'income':
        return `${price(e.price)} per unit`;
      case 'bankruptcy':
        return e.note ?? 'Position written off';
      case 'payout':
        return [`paid out at ${price(e.price)}`, e.note].filter(Boolean).join(' · ');
      case 'conversion':
        return [e.units < 0 ? `converted at ${price(e.price)}` : `received at ${price(e.price)}`, e.note].filter(Boolean).join(' · ');
    }
  }
</script>

<section class="card">
  <div class="card-head">
    <h2>Account statement</h2>
    <div class="segmented" role="group" aria-label="Filter statement">
      {#each FILTERS as f (f.key)}
        <button aria-pressed={filter === f.key} onclick={() => { filter = f.key; shown = 30; }}>{f.label}</button>
      {/each}
    </div>
  </div>
  <div class="card-body">
    {#if filtered.length === 0}
      <p class="sub muted">
        {ledger.length === 0 ? 'Nothing yet. Trades, income and corporate events will be listed here.' : 'No entries of this kind.'}
      </p>
    {:else}
      <div class="scroll">
        <table class="data">
          <thead>
            <tr><th>Month</th><th>Type</th><th>Asset</th><th>Detail</th><th class="num">Cash</th></tr>
          </thead>
          <tbody>
            {#each visible as e, i (i)}
              <tr>
                <td class="month">{monthShort(e.month)}</td>
                <td><span class="kind {group(e)} {e.kind}">{LEDGER_LABEL[e.kind]}</span></td>
                <td>{nameOf(e.assetId)}</td>
                <td class="sub">{detail(e)}</td>
                <td class="num">{e.cash === 0 ? '–' : usd(e.cash, { cents: true, sign: true })}</td>
              </tr>
            {/each}
          </tbody>
          {#if filter === 'income'}
            <tfoot>
              <tr><td colspan="4">Total income received</td><td class="num">{usd(sum, { cents: true, sign: true })}</td></tr>
            </tfoot>
          {/if}
        </table>
      </div>
      {#if filtered.length > shown}
        <button class="btn small more" onclick={() => (shown += 100)}>Show more ({filtered.length - shown} older entries)</button>
      {/if}
    {/if}
  </div>
</section>

<style>
  .scroll {
    overflow-x: auto;
  }
  .month {
    white-space: nowrap;
  }
  .kind {
    display: inline-block;
    padding: 1px 8px;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 650;
    background: var(--surface-2);
    color: var(--ink-2);
    white-space: nowrap;
  }
  .kind.income {
    background: var(--income-wash);
    color: var(--ink);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--series-income) 50%, transparent);
  }
  .kind.events {
    background: var(--warn-wash);
    color: var(--warn-ink);
  }
  .kind.bankruptcy {
    background: var(--danger-wash);
    color: var(--danger-ink);
  }
  tfoot td {
    padding: 8px;
    font-weight: 700;
    border-top: 1px solid var(--axis);
  }
  .more {
    margin-top: 10px;
  }
</style>
