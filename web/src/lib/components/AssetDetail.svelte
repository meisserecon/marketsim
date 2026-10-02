<script lang="ts">
  import type { AssetHistory, AssetView, PortfolioView } from '@marketsim/shared';
  import { api } from '$lib/api';
  import { change, direction, errorMessage, monthName, monthShort, pct, price, priceTick, usd } from '$lib/format';
  import Chart from './Chart.svelte';
  import TradeForm from './TradeForm.svelte';

  interface Props {
    code: string;
    token: string;
    asset: AssetView;
    month: string;
    portfolio: PortfolioView;
    closed?: string;
    isNew: boolean;
    onclose: () => void;
    ontraded: (portfolio: PortfolioView) => void;
  }
  let { code, token, asset, month, portfolio, closed, isNew, onclose, ontraded }: Props = $props();

  let history = $state<AssetHistory | undefined>(undefined);
  let loadError = $state('');
  let log = $state(false);
  let incomeMode = $state<'monthly' | 'year'>('monthly');

  // Reload when another asset is opened or the month advances.
  $effect(() => {
    const id = asset.id;
    void month;
    let stale = false;
    loadError = '';
    api
      .asset(code, id, token)
      .then((h) => {
        if (!stale) history = h;
      })
      .catch((e) => {
        if (!stale) loadError = errorMessage(e);
      });
    return () => {
      stale = true;
    };
  });

  // Never show the previous asset's rows under the new asset's name.
  const rows = $derived(history && history.id === asset.id ? history.rows : []);
  const pricePoints = $derived(rows.map((r) => ({ month: r.month, value: r.price })));
  const incomeMonthly = $derived(rows.map((r) => ({ month: r.month, value: r.income })));
  const incomeYear = $derived(
    rows.map((r, i) => {
      let sum = 0;
      for (let k = Math.max(0, i - 11); k <= i; k++) sum += rows[k].income;
      return { month: r.month, value: sum };
    })
  );
  const yieldPoints = $derived(
    asset.kind === 'bond' ? rows.filter((r) => r.extra?.yield !== undefined).map((r) => ({ month: r.month, value: r.extra!.yield })) : []
  );
  const paysIncome = $derived(rows.some((r) => r.income > 0));
  const spansDecades = $derived(rows.length > 60);

  const m1 = $derived(change(asset.price, asset.pricePrev));
  const m12 = $derived(change(asset.price, asset.priceYearAgo));
  const position = $derived(portfolio.positions.find((p) => p.assetId === asset.id));
  const kindLabel = $derived(asset.kind === 'bond' ? 'Bond' : asset.kind === 'gold' ? 'Gold' : 'Stock');

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }
</script>

<svelte:window onkeydown={onKey} />

<aside class="detail card" aria-label="{asset.name} details">
  <header>
    <div>
      <p class="kind sub">{kindLabel} · listed since {monthShort(asset.listedSince)} {#if isNew}<span class="badge new">New this month</span>{/if}</p>
      <h2>{asset.name}</h2>
    </div>
    <button class="btn small" onclick={onclose} aria-label="Close details">Close ✕</button>
  </header>

  <div class="stats">
    <div><span class="sub">Price</span><strong>${price(asset.price)}</strong></div>
    <div><span class="sub">1 month</span><strong class={direction(m1)}>{pct(m1, { sign: true })}</strong></div>
    <div><span class="sub">12 months</span><strong class={direction(m12)}>{pct(m12, { sign: true })}</strong></div>
    <div>
      <span class="sub">Income 12 mo</span><strong>{pct(asset.price > 0 ? asset.incomeLastYear / asset.price : 0)}</strong>
    </div>
    {#if asset.kind === 'bond' && asset.extra?.yield !== undefined}
      <div><span class="sub">Yield to maturity</span><strong>{pct(asset.extra.yield, { digits: 2 })}</strong></div>
      {#if asset.maturity}<div><span class="sub">Repays 100 on</span><strong>1 Jan {asset.maturity.slice(0, 4)}</strong></div>{/if}
    {/if}
  </div>

  {#if loadError}<p class="notice error">{loadError}</p>{/if}

  <section>
    <div class="section-head">
      <h3>Price <span class="sub">USD per unit, {rows.length ? `${monthShort(rows[0].month)} to ${monthShort(month)}` : ''}</span></h3>
      <div class="segmented" role="group" aria-label="Price scale">
        <button aria-pressed={!log} onclick={() => (log = false)}>Linear</button>
        <button aria-pressed={log} onclick={() => (log = true)} title="Equal percentage moves look equally tall. Better for long histories.">Log</button>
      </div>
    </div>
    {#if rows.length}
      <Chart points={pricePoints} {log} height={190} label="Price history of {asset.name}" formatValue={(v) => `${price(v)}`} formatTick={priceTick} />
    {:else}
      <p class="sub muted loading">{loadError ? '' : 'Loading history…'}</p>
    {/if}
    {#if spansDecades && !log}
      <p class="sub muted tip">Long history: try the log scale, where a doubling looks the same in any decade.</p>
    {/if}
  </section>

  <section class="trade-box">
    <div class="section-head">
      <h3>Trade</h3>
      {#if position}
        <span class="sub">You hold <strong>{usd(position.value, { cents: true })}</strong> ({pct(portfolio.totalValue > 0 ? position.value / portfolio.totalValue : 0)} of your portfolio)</span>
      {:else}
        <span class="sub muted">Not in your portfolio</span>
      {/if}
    </div>
    <TradeForm {code} {token} {asset} {portfolio} {closed} {ontraded} />
  </section>

  <section>
    <div class="section-head">
      <h3>
        Income
        <span class="sub">
          dividends per unit, {incomeMode === 'monthly' ? 'paid each month' : 'sum of the last 12 months'}
        </span>
      </h3>
      {#if paysIncome}
        <div class="segmented" role="group" aria-label="Income view">
          <button aria-pressed={incomeMode === 'monthly'} onclick={() => (incomeMode = 'monthly')}>Monthly</button>
          <button aria-pressed={incomeMode === 'year'} onclick={() => (incomeMode = 'year')}>12 months</button>
        </div>
      {/if}
    </div>
    {#if paysIncome}
      {#if incomeMode === 'monthly'}
        <Chart points={incomeMonthly} mode="bars" height={130} color="var(--series-income)" label="Income per unit each month" formatValue={(v) => `$${price(v)}`} formatTick={priceTick} />
      {:else}
        <Chart points={incomeYear} zero height={130} color="var(--series-income)" label="Income per unit over trailing twelve months" formatValue={(v) => `$${price(v)}`} formatTick={priceTick} />
      {/if}
    {:else if rows.length}
      <p class="sub none">{asset.name} has not paid any income so far.</p>
    {/if}
  </section>

  {#if yieldPoints.length > 1}
    <section>
      <div class="section-head"><h3>Yield <span class="sub">yearly return from buying at that month's price and holding until the bond is repaid</span></h3></div>
      <Chart points={yieldPoints} zero height={130} label="Yield history" formatValue={(v) => pct(v, { digits: 2 })} formatTick={(v) => pct(v, { digits: 0 })} />
    </section>
  {/if}

  {#if rows.length}
    <details>
      <summary>Monthly data table</summary>
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr><th>Month</th><th class="num">Price</th><th class="num">Income per unit</th>{#if asset.kind === 'bond'}<th class="num">Yield</th>{/if}</tr>
          </thead>
          <tbody>
            {#each [...rows].reverse() as r (r.month)}
              <tr>
                <td>{monthName(r.month)}</td>
                <td class="num">{price(r.price)}</td>
                <td class="num">{r.income > 0 ? price(r.income) : '–'}</td>
                {#if asset.kind === 'bond'}<td class="num">{pct(r.extra?.yield, { digits: 2 })}</td>{/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </details>
  {/if}
</aside>

<style>
  .detail {
    display: grid;
    gap: 16px;
    padding: 16px;
    align-content: start;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }
  h2 {
    font-size: 1.45rem;
    line-height: 1.2;
  }
  h3 {
    font-size: 0.95rem;
    font-weight: 650;
  }
  h3 .sub {
    font-weight: 400;
    margin-left: 4px;
  }
  .stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 26px;
    padding: 10px 0;
    border-block: 1px solid var(--hairline);
  }
  .stats div {
    display: grid;
  }
  .stats strong {
    font-size: 1.15rem;
    font-weight: 650;
  }
  .section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }
  .tip {
    margin-top: 4px;
    font-size: 0.8rem;
  }
  .none {
    padding: 8px 0;
  }
  .loading {
    height: 190px;
    display: grid;
    place-items: center;
  }
  .trade-box {
    padding: 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
  }
  summary {
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--ink-2);
  }
  .table-scroll {
    max-height: 300px;
    overflow: auto;
    margin-top: 8px;
  }
  .table-scroll thead th {
    position: sticky;
    top: 0;
    background: var(--surface);
  }
</style>
