<script lang="ts">
  import type { PortfolioView } from '@marketsim/shared';
  import { change, direction, pct, units, usd } from '$lib/format';

  interface Props {
    portfolio: PortfolioView;
    startingCash: number;
    /** Ids that can be opened in the asset panel (quoted this month). */
    tradable: Set<string>;
    selectedId?: string;
    onselect: (id: string) => void;
    canBuy: (id: string) => boolean;
    canSell: (id: string) => boolean;
    buyHint: (id: string) => string;
    onbuy: (id: string) => void;
    onsell: (id: string) => void;
  }
  let { portfolio, startingCash, tradable, selectedId, onselect, canBuy, canSell, buyHint, onbuy, onsell }: Props = $props();
  /** One step of trading: 5% of the portfolio. */
  const step = $derived(portfolio.totalValue * 0.05);

  const total = $derived(portfolio.totalValue);
  const weight = (v: number) => (total > 0 ? v / total : 0);
  const positions = $derived([...portfolio.positions].sort((a, b) => b.value - a.value));
  const sinceStart = $derived(startingCash > 0 ? total / startingCash - 1 : undefined);
</script>

<section class="card">
  <div class="card-head">
    <h2>Portfolio</h2>
  </div>
  <div class="card-body">
    <table class="data holdings">
      <thead>
        <tr>
          <th>Holding</th>
          <th class="num">Value</th>
          <th class="num" title="Price change since last month">1 month</th>
          <th class="num" title="Price now against your average purchase price">Since bought</th>
          <th class="num weight-col">Weight</th>
          <th class="act"></th>
        </tr>
      </thead>
      <tbody>
        {#each positions as p (p.assetId)}
          {@const m1 = change(p.price, p.pricePrev)}
          {@const sinceBought = p.avgPrice > 0 ? p.price / p.avgPrice - 1 : undefined}
          <tr class:selected={p.assetId === selectedId}>
            <td>
              {#if tradable.has(p.assetId)}
                <button class="link" onclick={() => onselect(p.assetId)} title="{units(p.units)} units">{p.name}</button>
              {:else}
                <span title="{units(p.units)} units">{p.name}</span>
              {/if}
            </td>
            <td class="num">{usd(p.value)}</td>
            <td class="num {direction(m1)}">{pct(m1, { sign: true })}</td>
            <td class="num {direction(sinceBought)}" title={p.avgPrice > 0 ? `Bought at ${usd(p.avgPrice, { cents: true })} on average` : ''}>{pct(sinceBought, { sign: true })}</td>
            <td class="num weight-col">
              <span class="bar" aria-hidden="true"><i style:width="{Math.min(100, weight(p.value) * 100)}%"></i></span>{pct(weight(p.value))}
            </td>
            <td class="act">
              <button class="btn small" disabled={!canBuy(p.assetId)} title={buyHint(p.assetId)} onclick={() => onbuy(p.assetId)}>Buy</button>
              <button class="btn small" disabled={!canSell(p.assetId)} title={p.value <= step * 1.001 ? 'Sell the whole position' : `Sell for ${usd(step)}`} onclick={() => onsell(p.assetId)}>Sell</button>
            </td>
          </tr>
        {/each}
        <tr>
          <td>Cash <span class="muted note">earns nothing</span></td>
          <td class="num">{usd(portfolio.cash)}</td>
          <td></td>
          <td></td>
          <td class="num weight-col">
            <span class="bar cash" aria-hidden="true"><i style:width="{Math.min(100, weight(portfolio.cash) * 100)}%"></i></span>{pct(weight(portfolio.cash))}
          </td>
          <td></td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td>Total</td>
          <td class="num">{usd(total)}</td>
          <td></td>
          <td></td>
          <td class="num weight-col since {sinceStart !== undefined && sinceStart < 0 ? 'down' : 'up'}" title="Change since the start of the game">
            {pct(sinceStart, { sign: true })} since start
          </td>
          <td class="act step" title="Every Buy or Sell moves 5% of your portfolio">one step = {usd(step)}</td>
        </tr>
      </tfoot>
    </table>

  </div>
</section>

<style>
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
  .act {
    width: 1%;
    white-space: nowrap;
    text-align: right;
    padding-left: 14px;
  }
  .act .btn {
    padding: 2px 12px;
  }
  tfoot td.step {
    font-weight: 400;
    font-size: 0.8rem;
    color: var(--muted);
  }
  .weight-col {
    width: 32%;
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
</style>
