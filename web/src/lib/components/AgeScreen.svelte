<script lang="ts">
  /**
   * The screen between two ages: a look back at the age that ended, with the market and every
   * player on one chart, then the title and the scene of the age that begins.
   */
  import type { Age, AgeReview, LeaderboardView } from '@marketsim/shared';
  import { monthName, pct } from '$lib/format';
  import PlayersChart from './PlayersChart.svelte';

  interface Props {
    /** The age that begins (or, when reopened, the current one). */
    age: Age;
    /** The age that just ended, with its figures, if there is one. */
    ended?: Age;
    review?: AgeReview;
    board?: LeaderboardView;
    meId?: string;
    /** Larger type for the projector. */
    big?: boolean;
    onclose: () => void;
  }
  let { age, ended, review, board, meId, big = false, onclose }: Props = $props();

  const PALETTE = ['#2a78d6', '#e0711c', '#1baf7a', '#c8453b', '#8e5bd0', '#c9a400', '#17a2b8', '#d6589f', '#6b7a8f', '#7a9a1f'];

  /** Everything rebased to 100 at the start of the ended age, so that players and the market can be compared. */
  const series = $derived.by(() => {
    if (!ended || !board) return [];
    const inAge = (m: string) => m >= ended.from && (!ended.to || m <= ended.to);
    const rebase = (id: string, name: string, color: string, points: { month: string; totalValue: number }[], dashed = false) => {
      const own = points.filter((p) => inAge(p.month));
      const base = own[0]?.totalValue;
      return { id, name, color, dashed, points: base ? own.map((p) => ({ month: p.month, value: (p.totalValue / base) * 100 })) : [] };
    };
    const players = [...board.players]
      .sort((a, b) => a.playerId.localeCompare(b.playerId))
      .map((p, i) => rebase(p.playerId, p.name, PALETTE[i % PALETTE.length], p.history));
    const market = board.benchmark?.history ? [rebase('market', board.benchmark.name, 'var(--ink-2)', board.benchmark.history, true)] : [];
    return [...market, ...players].filter((s) => s.points.length > 1);
  });

  const results = $derived(
    series
      .map((s) => ({ id: s.id, name: s.name, color: s.color, change: s.points[s.points.length - 1].value / 100 - 1 }))
      .sort((a, b) => b.change - a.change)
  );

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' || e.key === 'Enter') onclose();
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="backdrop" class:big role="dialog" aria-modal="true" aria-labelledby="age-title">
  <div class="sheet card">
    {#if ended}
      <section class="back">
        <p class="eyebrow">Looking back · {monthName(ended.from)} to {monthName(ended.to ?? '')}</p>
        <h2>{ended.name}</h2>
        <p class="text">{ended.lookBack}</p>

        {#if series.length}
          <div class="chart">
            <PlayersChart {series} span={{ from: ended.from, to: ended.to ?? ended.from }} highlightId={meId} height={big ? 320 : 230}
              formatValue={(v) => pct(v / 100 - 1, { sign: true, digits: 0 })} formatTick={(v) => pct(v / 100 - 1, { sign: true, digits: 0 })} label="The market and every player during {ended.name}" />
          </div>
          <ul class="results">
            {#each results as r (r.id)}
              <li class:me={r.id === meId} class:market={r.id === 'market'}>
                <i class="key" style:background={r.color}></i>
                <span class="who">{r.name}{#if r.id === 'market'}<span class="muted">, the stock market</span>{/if}</span>
                <b class={r.change < 0 ? 'down' : 'up'}>{pct(r.change, { sign: true, digits: 0 })}</b>
              </li>
            {/each}
          </ul>
        {/if}

        {#if review && (review.best.length || review.worst.length)}
          <div class="movers">
            <div>
              <h3>Best of the age</h3>
              <ul>{#each review.best as m (m.name)}<li><span>{m.name}</span><b class="up">{pct(m.change, { sign: true, digits: 0 })}</b></li>{/each}</ul>
            </div>
            <div>
              <h3>Worst of the age</h3>
              <ul>{#each review.worst as m (m.name)}<li><span>{m.name}</span><b class={m.change < 0 ? 'down' : 'up'}>{pct(m.change, { sign: true, digits: 0 })}</b></li>{/each}</ul>
            </div>
          </div>
        {/if}
      </section>
    {/if}

    <section class="next">
      <p class="eyebrow">{ended ? 'A new age begins' : 'The game begins'} · {monthName(age.from)}</p>
      <h1 id="age-title">{age.name}</h1>
      <p class="motto">{age.motto}</p>
      <p class="text">{age.intro}</p>
    </section>

    <div class="go">
      <button class="btn primary" onclick={onclose}>Continue</button>
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 39;
    background: color-mix(in srgb, var(--page) 90%, transparent);
    backdrop-filter: blur(6px);
    overflow-y: auto;
    padding: 24px 16px 48px;
    display: grid;
    justify-items: center;
    align-items: start;
  }
  .sheet {
    width: min(860px, 100%);
    padding: 28px 30px 26px;
    display: grid;
    gap: 26px;
  }
  .big .sheet {
    width: min(1100px, 100%);
    font-size: 1.2rem;
  }
  section {
    display: grid;
    gap: 10px;
  }
  .eyebrow {
    margin: 0;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.78rem;
    color: var(--accent);
  }
  .back {
    padding-bottom: 24px;
    border-bottom: 1px solid var(--hairline);
  }
  .back h2 {
    font-size: 1.5rem;
    margin: -6px 0 0;
  }
  h1 {
    font-size: clamp(2.2rem, 6vw, 3.6rem);
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin: -6px 0 0;
  }
  .motto {
    margin: 0;
    font-size: 1.2em;
    font-style: italic;
    color: var(--ink-2);
  }
  .text {
    margin: 0;
    line-height: 1.55;
    font-size: 1.05em;
  }
  .chart {
    margin-top: 6px;
  }
  .results {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 6px 18px;
    font-size: 0.95em;
  }
  .results li {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .results li.me .who {
    font-weight: 700;
  }
  .results b,
  .movers b {
    font-variant-numeric: tabular-nums;
  }
  .key {
    width: 0.65em;
    height: 0.65em;
    border-radius: 50%;
  }
  .market .key {
    border-radius: 0;
    height: 2px;
    width: 1em;
  }
  .movers {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 4px;
  }
  .movers h3 {
    font-size: 0.85em;
    font-weight: 650;
    margin: 0 0 4px;
    color: var(--ink-2);
  }
  .movers ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 2px;
    font-size: 0.95em;
  }
  .movers li {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }
  .go .btn {
    font-size: 1.1rem;
    padding: 12px 26px;
  }
  @media (max-width: 560px) {
    .movers {
      grid-template-columns: 1fr;
    }
  }
</style>
