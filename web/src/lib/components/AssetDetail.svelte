<script lang="ts">
  import type { AssetHistory, AssetView, PortfolioView } from '@marketsim/shared';
  import { api } from '$lib/api';
  import { change, direction, errorMessage, monthName, monthShort, pct, price, priceTick, usd } from '$lib/format';
  import Chart from './Chart.svelte';
  import NewsList from './NewsList.svelte';

  interface Props {
    code: string;
    token: string;
    asset: AssetView;
    month: string;
    portfolio: PortfolioView;
    isNew: boolean;
    onclose: () => void;
    canBuy: boolean;
    canSell: boolean;
    buyHint: string;
    onbuy: () => void;
    onsell: () => void;
  }
  let { code, token, asset, month, portfolio, isNew, onclose, canBuy, canSell, buyHint, onbuy, onsell }: Props = $props();
  /** One step of trading: 5% of the portfolio. */
  const step = $derived(portfolio.totalValue * 0.05);

  let history = $state<AssetHistory | undefined>(undefined);
  let loadError = $state('');
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
  // Newest first: the player wants to know what happened lately before the beginnings.
  const story = $derived(history && history.id === asset.id ? [...(history.news ?? [])].reverse() : []);

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

  {#if history?.profile}
    {@const p = history.profile}
    <section class="profile" aria-label="About {asset.name}">
      <div class="profile-head">
        {#if p.logo}<img class="logo" src={p.logo} alt="{asset.name} logo" />{/if}
        <p class="sub">{[p.sector, p.country].filter(Boolean).join(' · ')}</p>
      </div>
      <blockquote>{p.tagline}</blockquote>
      {#if p.image}
        <figure>
          <img src={p.image} alt={p.imageCaption ?? ''} />
          {#if p.imageCaption}<figcaption class="sub">{p.imageCaption}</figcaption>{/if}
        </figure>
      {/if}
      <p class="about">{p.about}</p>
    </section>
  {/if}

  <div class="stats">
    <div><span class="sub">Price</span><strong>${price(asset.price)}</strong></div>
    <div><span class="sub">1 month</span><strong class={direction(m1)}>{pct(m1, { sign: true })}</strong></div>
    <div><span class="sub">12 months</span><strong class={direction(m12)}>{pct(m12, { sign: true })}</strong></div>
    <div>
      <span class="sub">Yield</span><strong>{pct(asset.kind === 'bond' && asset.extra?.yield !== undefined ? asset.extra.yield : asset.price > 0 ? asset.incomeLastYear / asset.price : 0)}</strong>
    </div>
    {#if asset.kind === 'bond' && asset.maturity}<div><span class="sub">Repays 100 on</span><strong>1 Jan {asset.maturity.slice(0, 4)}</strong></div>{/if}
  </div>

  {#if loadError}<p class="notice error">{loadError}</p>{/if}

  <section>
    <div class="section-head">
      <h3>Price <span class="sub">USD per unit</span></h3>
    </div>
    {#if rows.length}
      <Chart points={pricePoints} height={190} label="Price history of {asset.name}" formatValue={(v) => `${price(v)}`} formatTick={priceTick} />
    {:else}
      <p class="sub muted loading">{loadError ? '' : 'Loading history…'}</p>
    {/if}
  </section>

  <section class="trade-box">
    <div class="trade-row">
      <button class="btn primary" disabled={!canBuy} title={buyHint} onclick={onbuy}>Buy</button>
      {#if position}
        <button class="btn" disabled={!canSell} title={position.value <= step * 1.001 ? 'Sell the whole position' : `Sell for ${usd(step)}`} onclick={onsell}>Sell</button>
      {/if}
      <span class="sub">
        {#if position}You hold <strong>{usd(position.value)}</strong> ({pct(portfolio.totalValue > 0 ? position.value / portfolio.totalValue : 0)} of your portfolio).{:else}Not in your portfolio.{/if}
        Each click moves {usd(step)}, 5% of your portfolio.
      </span>
    </div>
    {#if !canBuy && buyHint}<p class="sub muted why">{buyHint}.</p>{/if}
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

  {#if story.length}
    <section>
      <div class="section-head"><h3>The story so far</h3></div>
      <NewsList items={story} nameOf={() => ''} showMonth monthLabel={monthName} />
    </section>
  {/if}

  {#if yieldPoints.length > 1}
    <section>
      <div class="section-head"><h3>Yield <span class="sub">yearly return from buying at that month's price and holding until the bond is repaid</span></h3></div>
      <Chart points={yieldPoints} zero height={130} label="Yield history" formatValue={(v) => pct(v, { digits: 2 })} formatTick={(v) => pct(v, { digits: 0 })} />
    </section>
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
  .trade-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .trade-row .btn {
    min-width: 84px;
    justify-content: center;
    text-align: center;
  }
  .why {
    margin: 8px 0 0;
  }
  .trade-box {
    padding: 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
  }
  .profile {
    display: grid;
    gap: 8px;
    padding: 12px 0 14px;
    border-bottom: 1px solid var(--line, #e3e1da);
  }
  .profile-head {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .profile .logo {
    height: 36px;
    max-width: 120px;
    object-fit: contain;
  }
  .profile blockquote {
    margin: 0;
    font-size: 1.12rem;
    font-weight: 600;
    line-height: 1.35;
    quotes: '\201C' '\201D';
  }
  .profile blockquote::before {
    content: open-quote;
  }
  .profile blockquote::after {
    content: close-quote;
  }
  .profile figure {
    margin: 0;
  }
  .profile figure img {
    width: 100%;
    max-height: 220px;
    object-fit: cover;
    border-radius: 8px;
    display: block;
  }
  .profile .about {
    margin: 0;
    line-height: 1.5;
  }
</style>
