<script lang="ts">
  import type { LeaderboardView } from '@marketsim/shared';
  import { direction, pct, usd } from '$lib/format';

  interface Props {
    view: LeaderboardView;
    startingCash: number;
    /** Highlights the viewer's own row. */
    meId?: string;
    /** Larger type for the projector. */
    big?: boolean;
    /** Show only the top rows (plus the viewer's own). */
    limit?: number;
  }
  let { view, startingCash, meId, big = false, limit }: Props = $props();

  const ret = (v: number) => (startingCash > 0 ? v / startingCash - 1 : undefined);
  const rows = $derived(
    limit === undefined ? view.players : view.players.filter((p, i) => i < limit || p.playerId === meId)
  );
  const hidden = $derived(view.players.length - rows.length);
</script>

{#if view.players.length === 0}
  <p class="sub muted">No players yet.</p>
{:else}
  <table class="data board" class:big>
    <thead>
      <tr><th class="rank">#</th><th>Player</th><th class="num">Portfolio value</th><th class="num">Since start</th></tr>
    </thead>
    <tbody>
      {#each rows as p (p.playerId)}
        {@const r = ret(p.totalValue)}
        <tr class:me={p.playerId === meId} class:first={p.rank === 1}>
          <td class="rank">{p.rank}</td>
          <td class="name">{p.name}{#if p.playerId === meId} <span class="badge held">You</span>{/if}</td>
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
{/if}

<style>
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
