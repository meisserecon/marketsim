<script lang="ts">
  import type { LeaderboardView } from '@marketsim/shared';
  import { direction, pct, usd } from '$lib/format';
  import PlayersChart from './PlayersChart.svelte';

  interface Props {
    view: LeaderboardView;
    startingCash: number;
    /** Highlights the viewer's own row. */
    meId?: string;
    /** Larger type for the projector. */
    big?: boolean;
    /** Show only the top rows (plus the viewer's own). */
    limit?: number;
    /** Last month of the game. When given, a chart of every listed player's value is shown, spanning the whole game. */
    finalMonth?: string;
    /** Chart on the left and the list on the right, where the width allows. */
    wide?: boolean;
  }
  let { view, startingCash, meId, big = false, limit, finalMonth, wide = false }: Props = $props();

  const PALETTE = ['#2a78d6', '#e0711c', '#1baf7a', '#c8453b', '#8e5bd0', '#c9a400', '#17a2b8', '#d6589f', '#6b7a8f', '#7a9a1f'];
  /** A player keeps the same colour whatever the ranking: colours go by the order of joining ids, not by rank. */
  const colors = $derived(new Map([...view.players].sort((a, b) => a.playerId.localeCompare(b.playerId)).map((p, i) => [p.playerId, PALETTE[i % PALETTE.length]])));

  const ret = (v: number) => (startingCash > 0 ? v / startingCash - 1 : undefined);
  const rows = $derived(
    limit === undefined ? view.players : view.players.filter((p, i) => i < limit || p.playerId === meId)
  );
  const hidden = $derived(view.players.length - rows.length);
  const series = $derived(
    rows.map((p) => ({
      id: p.playerId,
      name: p.name,
      color: colors.get(p.playerId) ?? PALETTE[0],
      points: (p.history ?? []).map((h) => ({ month: h.month, value: h.totalValue }))
    }))
  );
  /** The stock market index from the same starting cash, as a dashed reference line. */
  const withMarket = $derived(
    view.benchmark?.history?.length
      ? [{ id: 'market', name: view.benchmark.name, color: 'var(--ink-2)', dashed: true, points: view.benchmark.history.map((h) => ({ month: h.month, value: h.totalValue })) }, ...series]
      : series
  );
  const firstMonth = $derived(series.flatMap((s) => s.points.map((p) => p.month)).sort()[0] ?? view.month);
</script>

{#if view.players.length === 0}
  <p class="sub muted">No players yet.</p>
{:else}
  <div class="wrap" class:wide>
  {#if finalMonth}
    <div class="race">
      <PlayersChart series={withMarket} span={{ from: firstMonth, to: finalMonth }} highlightId={meId} height={big ? 300 : wide ? 240 : 200} />
    </div>
  {/if}
  <div class="list">
  <table class="data board" class:big>
    <thead>
      <tr><th class="rank">#</th><th>Player</th><th class="num">Portfolio value</th><th class="num">Since start</th></tr>
    </thead>
    <tbody>
      {#each rows as p (p.playerId)}
        {@const r = ret(p.totalValue)}
        <tr class:me={p.playerId === meId} class:first={p.rank === 1}>
          <td class="rank">{p.rank}</td>
          <td class="name">{#if finalMonth}<i class="key" style:background={colors.get(p.playerId)}></i>{/if}{p.name}{#if p.playerId === meId} <span class="badge held">You</span>{/if}</td>
          <td class="num value">{usd(p.totalValue, { cents: false })}</td>
          <td class="num {direction(r)}">{pct(r, { sign: true })}</td>
        </tr>
      {/each}
      {#if view.benchmark}
        {@const r = ret(view.benchmark.totalValue)}
        <tr class="benchmark">
          <td class="rank"></td>
          <td class="name">{view.benchmark.name} <span class="muted">(benchmark)</span></td>
          <td class="num value">{usd(view.benchmark.totalValue, { cents: false })}</td>
          <td class="num {direction(r)}">{pct(r, { sign: true })}</td>
        </tr>
      {/if}
    </tbody>
  </table>
  {#if hidden > 0}<p class="sub muted more">and {hidden} more</p>{/if}
  </div>
  </div>
{/if}

<style>
  .race {
    margin-bottom: 12px;
    min-width: 0;
  }
  @media (min-width: 900px) {
    .wide {
      display: grid;
      grid-template-columns: minmax(0, 3fr) minmax(300px, 2fr);
      gap: 24px;
      align-items: start;
    }
    .wide .race {
      margin-bottom: 0;
    }
  }
  .key {
    display: inline-block;
    width: 0.62em;
    height: 0.62em;
    border-radius: 50%;
    margin-right: 0.5em;
  }
  .rank {
    width: 2.2em;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }
  .name {
    font-weight: 550;
    overflow-wrap: anywhere;
  }
  tr.first .rank {
    color: var(--ink);
    font-weight: 700;
  }
  tr.me td {
    background: var(--accent-wash);
  }
  tr.benchmark td {
    font-style: italic;
    border-top: 1px solid var(--axis);
  }
  .value {
    font-weight: 650;
  }
  .more {
    margin-top: 6px;
  }
  .big {
    font-size: 1.35rem;
  }
  .big th {
    font-size: 0.95rem;
  }
  .big td {
    padding: 11px 12px;
  }
  .big tr.first td {
    font-size: 1.6rem;
  }
</style>
