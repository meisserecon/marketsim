<script lang="ts">
  import type { PortfolioView } from '@marketsim/shared';
  import { pct, units, usd, usdCompact } from '$lib/format';
  import Chart from './Chart.svelte';

  interface Props {
    portfolio: PortfolioView;
    startingCash: number;
    /** Ids that can be opened in the asset panel (quoted this month). */
    tradable: Set<string>;
    selectedId?: string;
    onselect: (id: string) => void;
  }
  let { portfolio, startingCash, tradable, selectedId, onselect }: Props = $props();

  const total = $derived(portfolio.totalValue);
  const weight = (v: number) => (total > 0 ? v / total : 0);
  const used = $derived(portfolio.positions.length);
  const positions = $derived([...portfolio.positions].sort((a, b) => b.value - a.value));
  const sinceStart = $derived(startingCash > 0 ? total / startingCash - 1 : undefined);

  /**
   * Month-end values so far. The contract does not say whether `history` already contains the
   * current month, so the current month is always taken from the live portfolio.
   */
  const curve = $derived.by(() => {
    const points = portfolio.history.filter((h) => h.month < portfolio.month).map((h) => ({ month: h.month, value: h.totalValue }));
    points.push({ month: portfolio.month, value: total });
    return points;
  });
</script>

<section class="card">
  <div class="card-head">
    <h2>Portfolio</h2>
    <span class="slots" title="Cash does not count as a position">
      <span class="pips" aria-hidden="true">
        {#each Array(portfolio.maxPositions) as _, i (i)}<i class:on={i < used}></i>{/each}
      </span>
      {used} of {portfolio.maxPositions} positions used
    </span>
  </div>
  <div class="card-body">
    <h3>Portfolio value <span class="sub">at each month end</span></h3>
    <Chart points={curve} height={200} label="Total portfolio value over time" formatValue={(v) => usd(v)} formatTick={usdCompact} />

    <table class="data holdings">
      <thead>
        <tr><th>Holding</th><th class="num">Value</th><th class="num weight-col">Weight</th></tr>
      </thead>
      <tbody>
        {#each positions as p (p.assetId)}
          <tr class:selected={p.assetId === selectedId}>
            <td>
              {#if tradable.has(p.assetId)}
                <button class="link" onclick={() => onselect(p.assetId)} title="{units(p.units)} units">{p.name}</button>
              {:else}
                <span title="{units(p.units)} units">{p.name}</span>
              {/if}
            </td>
            <td class="num">{usd(p.value)}</td>
            <td class="num weight-col">
              <span class="bar" aria-hidden="true"><i style:width="{Math.min(100, weight(p.value) * 100)}%"></i></span>{pct(weight(p.value))}
            </td>
          </tr>
        {/each}
        <tr>
          <td>Cash <span class="muted note">earns nothing</span></td>
          <td class="num">{usd(portfolio.cash)}</td>
          <td class="num weight-col">
            <span class="bar cash" aria-hidden="true"><i style:width="{Math.min(100, weight(portfolio.cash) * 100)}%"></i></span>{pct(weight(portfolio.cash))}
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td>Total</td>
          <td class="num">{usd(total)}</td>
          <td class="num weight-col since {sinceStart !== undefined && sinceStart < 0 ? 'down' : 'up'}" title="Change since the start of the game">
            {pct(sinceStart, { sign: true })} since start
          </td>
        </tr>
      </tfoot>
    </table>
    {#if used === 0}
      <p class="sub hint">All your money is in cash. Pick an asset from the market to invest.</p>
    {/if}

  </div>
</section>

<style>
  .slots {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.87rem;
    font-weight: 600;
    color: var(--ink-2);
  }
  .pips {
    display: inline-flex;
    gap: 3px;
  }
  .pips i {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    border: 1.5px solid var(--axis);
  }
  .pips i.on {
    background: var(--series-1);
    border-color: var(--series-1);
  }
  .link {
    all: unset;
    cursor: pointer;
    font-weight: 550;
    text-decoration: underline;
    text-decoration-color: var(--axis);
    text-underline-offset: 3px;
  }
  .link:hover {
    text-decoration-color: var(--ink);
  }
  .link:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 3px;
  }
  tr.selected td {
    background: var(--accent-wash);
  }
  .weight-col {
    width: 42%;
  }
  .holdings {
    margin-top: 16px;
  }
  .bar {
    display: inline-block;
    width: calc(100% - 58px);
    max-width: 120px;
    height: 8px;
    margin-right: 8px;
    vertical-align: middle;
    background: var(--surface-2);
    border-radius: 2px;
    overflow: hidden;
  }
  .bar i {
    display: block;
    height: 100%;
    background: var(--series-1);
    border-radius: 0 3px 3px 0;
  }
  .bar.cash i {
    background: var(--axis);
  }
  .note {
    font-size: 0.8rem;
    margin-left: 4px;
  }
  tfoot td {
    padding: 8px;
    font-weight: 700;
    border-top: 1px solid var(--axis);
  }
  tfoot td.since {
    font-weight: 600;
    font-size: 0.87rem;
  }
  .hint {
    margin-top: 8px;
  }
  h3 {
    font-size: 0.9rem;
    font-weight: 650;
    margin: 0 0 6px;
  }
  h3 .sub {
    font-weight: 400;
  }
</style>
