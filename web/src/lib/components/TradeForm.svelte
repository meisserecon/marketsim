<script lang="ts">
  import type { AssetView, PortfolioView, Trade } from '@marketsim/shared';
  import { api } from '$lib/api';
  import { errorMessage, pct, price, units as fmtUnits, usd } from '$lib/format';

  interface Props {
    code: string;
    token: string;
    asset: AssetView;
    portfolio: PortfolioView;
    /** Set when trading is closed (game finished). */
    closed?: string;
    ontraded: (portfolio: PortfolioView) => void;
  }
  let { code, token, asset, portfolio, closed, ontraded }: Props = $props();

  let side = $state<'buy' | 'sell'>('buy');
  let amountText = $state('');
  /** "Max" on a buy, "All" on a sell: sent as { all: true } so no rounding dust is left behind. */
  let everything = $state(false);
  let busy = $state(false);
  let error = $state('');
  let done = $state('');

  // A different asset resets the form.
  let lastAsset = '';
  $effect(() => {
    if (asset.id !== lastAsset) {
      lastAsset = asset.id;
      side = 'buy';
      amountText = '';
      everything = false;
      error = '';
      done = '';
    }
  });

  const position = $derived(portfolio.positions.find((p) => p.assetId === asset.id));
  const heldValue = $derived(position?.value ?? 0);
  const limit = $derived(side === 'buy' ? portfolio.cash : heldValue);
  const typed = $derived(Number(amountText.replace(/[,\s$']/g, '')));
  const amount = $derived(everything ? limit : typed);
  const hasAmount = $derived(everything || amountText.trim() !== '');
  /** Typing the full balance to the cent is treated like "all". */
  const isAll = $derived(everything || (Number.isFinite(amount) && limit > 0 && Math.abs(amount - limit) < 0.005));

  const problem = $derived.by((): string => {
    if (closed) return closed;
    if (side === 'buy') {
      if (!position && portfolio.positions.length >= portfolio.maxPositions) {
        return `You already hold ${portfolio.maxPositions} positions, the maximum. Sell one completely before buying a new asset.`;
      }
      if (portfolio.cash < 0.005) return 'You have no cash. Sell something first, or wait for income.';
    } else if (!position) return 'You do not hold this asset, so there is nothing to sell.';
    if (!hasAmount) return '';
    if (!Number.isFinite(amount) || amount <= 0) return 'Enter an amount greater than zero.';
    if (side === 'buy' && amount > portfolio.cash + 0.005) return `Not enough cash: you have ${usd(portfolio.cash, { cents: true })}.`;
    if (side === 'sell' && amount > heldValue + 0.005) return `Your position is worth ${usd(heldValue, { cents: true })}; you cannot sell more than that.`;
    return '';
  });

  /** A bond pays nothing until it matures; what matters is what it repays and the yearly return that implies. */
  const bondYield = $derived(asset.kind === 'bond' ? asset.extra?.yield : undefined);
  const maturityYear = $derived(asset.maturity ? asset.maturity.slice(0, 4) : '');

  const preview = $derived.by(() => {
    if (problem || !hasAmount || !(amount > 0)) return undefined;
    const sign = side === 'buy' ? 1 : -1;
    const positionAfter = isAll && side === 'sell' ? 0 : Math.max(0, heldValue + sign * amount);
    const cashAfter = isAll && side === 'buy' ? 0 : Math.max(0, portfolio.cash - sign * amount);
    return {
      units: amount / asset.price,
      cashAfter,
      positionAfter,
      weightAfter: portfolio.totalValue > 0 ? positionAfter / portfolio.totalValue : 0,
      // Based on what the asset paid over the past twelve months; says nothing about the future.
      incomePerYear: asset.kind !== 'bond' && asset.price > 0 ? (positionAfter * asset.incomeLastYear) / asset.price : 0,
      // Each unit of a bond repays 100.
      repayment: asset.kind === 'bond' && asset.price > 0 ? (positionAfter / asset.price) * 100 : 0
    };
  });

  function pick(fraction: number) {
    done = '';
    error = '';
    if (fraction === 1) {
      everything = true;
      amountText = limit.toFixed(2);
    } else {
      everything = false;
      amountText = (Math.floor(limit * fraction * 100) / 100).toFixed(2);
    }
  }

  function setSide(s: 'buy' | 'sell') {
    side = s;
    amountText = '';
    everything = false;
    error = '';
    done = '';
  }

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    if (busy || problem || !preview) return;
    const trade: Trade = { assetId: asset.id, side, amount: isAll ? { all: true } : { usd: amount } };
    busy = true;
    error = '';
    done = '';
    try {
      const res = await api.trade(code, token, trade);
      done = `${side === 'buy' ? 'Bought' : 'Sold'} ${usd(Math.abs(res.entry.cash), { cents: true })} of ${asset.name} at ${price(res.entry.price)}.`;
      amountText = '';
      everything = false;
      ontraded(res.portfolio);
    } catch (err) {
      error = errorMessage(err);
    } finally {
      busy = false;
    }
  }
</script>

<form class="trade" onsubmit={submit}>
  <div class="row">
    <div class="segmented side" role="group" aria-label="Buy or sell">
      <button type="button" aria-pressed={side === 'buy'} onclick={() => setSide('buy')}>Buy</button>
      <button type="button" aria-pressed={side === 'sell'} onclick={() => setSide('sell')}>Sell</button>
    </div>
    <span class="sub">
      {#if side === 'buy'}Cash available: <strong>{usd(portfolio.cash, { cents: true })}</strong>
      {:else}Your position: <strong>{usd(heldValue, { cents: true })}</strong>{/if}
    </span>
  </div>

  <label class="field">
    <span>Amount in USD</span>
    <div class="amount">
      <span class="prefix">$</span>
      <input
        class="input"
        inputmode="decimal"
        autocomplete="off"
        placeholder="0.00"
        bind:value={amountText}
        oninput={() => { everything = false; done = ''; error = ''; }}
        disabled={busy || !!closed}
      />
    </div>
  </label>
  <div class="quick">
    <button type="button" class="btn small" onclick={() => pick(0.25)} disabled={limit <= 0 || !!closed}>25%</button>
    <button type="button" class="btn small" onclick={() => pick(0.5)} disabled={limit <= 0 || !!closed}>50%</button>
    <button type="button" class="btn small" aria-pressed={everything} onclick={() => pick(1)} disabled={limit <= 0 || !!closed}>
      {side === 'buy' ? 'Max' : 'All'}
    </button>
    <span class="sub muted">{side === 'buy' ? 'of your cash' : 'of your position'}</span>
  </div>

  {#if problem}
    <p class="notice warn" role="alert">{problem}</p>
  {:else if preview}
    <dl class="preview" aria-label="What this trade will do">
      <dt>You {side}</dt>
      <dd><strong>{usd(amount, { cents: true })}</strong> of {asset.name} at {price(asset.price)} <span class="muted">(≈ {fmtUnits(preview.units)} units)</span></dd>
      <dt>Cash after</dt>
      <dd>{usd(preview.cashAfter, { cents: true })}</dd>
      <dt>Position after</dt>
      <dd>
        {#if preview.positionAfter < 0.005}closed
        {:else}{usd(preview.positionAfter, { cents: true })} <span class="muted">({pct(preview.weightAfter)} of your portfolio)</span>{/if}
      </dd>
      {#if preview.positionAfter >= 0.005}
        {#if asset.kind === 'bond'}
          <dt>At maturity</dt>
          <dd>
            repays {usd(preview.repayment, { cents: true })}{maturityYear ? ` on 1 January ${maturityYear}` : ''}
            {#if bondYield !== undefined && bondYield > 0}<span class="muted">that is {(bondYield * 100).toFixed(2)}% a year if held until then</span>{/if}
          </dd>
        {:else}
        <dt>Income</dt>
        <dd>
          {#if preview.incomePerYear > 0}about {usd(preview.incomePerYear, { cents: true })} a year <span class="muted">if it pays what it paid over the last 12 months</span>
          {:else}<span class="muted">paid nothing over the last 12 months</span>{/if}
        </dd>
        {/if}
      {/if}
    </dl>
  {/if}

  {#if error}<p class="notice error" role="alert">{error}</p>{/if}
  {#if done}<p class="notice info" role="status">{done}</p>{/if}

  <button class="btn primary confirm" type="submit" disabled={busy || !!problem || !preview}>
    {#if busy}Trading…{:else if preview}Confirm: {side} {usd(amount, { cents: true })}{:else}{side === 'buy' ? 'Buy' : 'Sell'}{/if}
  </button>
  <p class="sub muted fine">Executes immediately at this month's price. No fees.</p>
</form>

<style>
  .trade {
    display: grid;
    gap: 10px;
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .side button {
    padding: 6px 22px;
    font-size: 0.93rem;
  }
  .amount {
    position: relative;
  }
  .prefix {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
  }
  .amount .input {
    padding-left: 24px;
    font-size: 1.1rem;
    font-variant-numeric: tabular-nums;
  }
  .quick {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .quick .btn[aria-pressed='true'] {
    background: var(--accent-wash);
    border-color: var(--accent);
  }
  .preview {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 4px 14px;
    margin: 0;
    padding: 10px 12px;
    background: var(--surface-2);
    border-radius: 8px;
    font-size: 0.9rem;
  }
  .preview dt {
    color: var(--ink-2);
  }
  .preview dd {
    margin: 0;
  }
  .confirm {
    padding: 11px 14px;
    font-size: 1rem;
  }
  .confirm::first-letter {
    text-transform: uppercase;
  }
  .fine {
    font-size: 0.8rem;
    text-align: center;
  }
</style>
