<script lang="ts">
  /**
   * Income is the point of the game: coupons and dividends land in cash every month and are
   * never reinvested. This card keeps "this month" and "so far" in view at all times.
   */
  import type { PortfolioView } from '@marketsim/shared';
  import { monthName, usd, usdCompact } from '$lib/format';
  import Chart from './Chart.svelte';

  interface Props {
    portfolio: PortfolioView;
    nameOf: (assetId: string) => string;
  }
  let { portfolio, nameOf }: Props = $props();

  const income = $derived(portfolio.ledger.filter((e) => e.kind === 'income'));
  const thisMonth = $derived(income.filter((e) => e.month === portfolio.month));
  const thisMonthTotal = $derived(thisMonth.reduce((s, e) => s + e.cash, 0));
  const total = $derived(income.reduce((s, e) => s + e.cash, 0));

  const monthIndex = (m: string) => Number(m.slice(0, 4)) * 12 + Number(m.slice(5, 7));
  const lastYear = $derived(income.filter((e) => monthIndex(portfolio.month) - monthIndex(e.month) < 12).reduce((s, e) => s + e.cash, 0));

  /** Cumulative income at each month the player has been in the game. */
  const cumulative = $derived.by(() => {
    const byMonth = new Map<string, number>();
    for (const e of income) byMonth.set(e.month, (byMonth.get(e.month) ?? 0) + e.cash);
    const months = portfolio.history.map((h) => h.month);
    if (months[months.length - 1] !== portfolio.month) months.push(portfolio.month);
    let sum = 0;
    return months.map((month) => {
      sum += byMonth.get(month) ?? 0;
      return { month, value: sum };
    });
  });
</script>

<section class="card income">
  <div class="card-head">
    <h2>Income received</h2>
    <span class="sub">dividends, paid into cash</span>
  </div>
  <div class="card-body">
    <div class="tiles">
      <div class="tile main">
        <span class="sub">{monthName(portfolio.month)}</span>
        <strong>{usd(thisMonthTotal, { cents: true })}</strong>
      </div>
      <div class="tile">
        <span class="sub">Last 12 months</span>
        <strong>{usd(lastYear, { cents: true })}</strong>
      </div>
      <div class="tile">
        <span class="sub">Since you started</span>
        <strong>{usd(total, { cents: true })}</strong>
      </div>
    </div>

    {#if thisMonth.length}
      <ul class="lines">
        {#each thisMonth as e (e.assetId)}
          <li><span>{(e.assetName ?? nameOf(e.assetId))}</span><span class="num">{usd(e.cash, { cents: true, sign: true })}</span></li>
        {/each}
      </ul>
    {:else}
      <p class="sub muted none">
        {portfolio.positions.length ? 'None of your holdings paid income this month.' : 'Cash earns nothing, and bonds pay only when they mature. Many stocks pay dividends.'}
      </p>
    {/if}

    {#if total > 0 && cumulative.length > 2}
      <h3>Cumulative income</h3>
      <Chart points={cumulative} zero height={120} color="var(--series-income)" label="Cumulative income received" formatValue={(v) => usd(v, { cents: true })} formatTick={usdCompact} />
    {/if}
  </div>
</section>

<style>
  .tiles {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .tile {
    display: grid;
    padding: 9px 11px;
    border-radius: 8px;
    background: var(--surface-2);
    min-width: 0;
  }
  .tile.main {
    background: var(--income-wash);
    box-shadow: inset 3px 0 0 var(--series-income);
  }
  .tile strong {
    font-size: 1.15rem;
    font-weight: 650;
    overflow-wrap: anywhere;
  }
  .lines {
    list-style: none;
    margin: 10px 0 0;
    padding: 0;
    font-size: 0.9rem;
  }
  .lines li {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 4px 2px;
    border-bottom: 1px solid var(--hairline);
  }
  .lines li:last-child {
    border-bottom: 0;
  }
  .none {
    margin-top: 10px;
  }
  h3 {
    font-size: 0.9rem;
    font-weight: 650;
    margin: 14px 0 6px;
  }
</style>
