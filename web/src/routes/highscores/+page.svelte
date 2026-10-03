<script lang="ts">
  /** Highscores across all games ever played, compared at one month so that everybody had the same markets. */
  import type { HighscoresView } from '@marketsim/shared';
  import { api } from '$lib/api';
  import { errorMessage, monthName, pct, usd } from '$lib/format';
  import { STARTING_CASH } from '@marketsim/shared';

  let at = $state('final');
  let view = $state<HighscoresView | undefined>(undefined);
  let error = $state('');

  $effect(() => {
    const wanted = at;
    error = '';
    api
      .highscores(wanted)
      .then((v) => {
        if (wanted === at) view = v;
      })
      .catch((e) => (error = errorMessage(e)));
  });

  const label = (m: string) => (m === 'final' ? 'Finished games' : `End of ${m.slice(0, 4)}`);
</script>

<svelte:head><title>Highscores · Month by Month</title></svelte:head>

<main>
  <header>
    <p class="sub"><a href="/">Month by Month</a></p>
    <h1>Highscores</h1>
    <p class="sub">
      The best portfolios of all games ever played, from {usd(STARTING_CASH)} at the start. To keep it fair, everyone is compared at the same month:
      pick a year to see who was ahead by then, or the finished games for the full distance.
    </p>
  </header>

  {#if view}
    <div class="segmented" role="group" aria-label="Compare at">
      {#each view.milestones as m (m)}
        <button aria-pressed={at === m} onclick={() => (at = m)}>{m === 'final' ? 'Finished' : m.slice(0, 4)}</button>
      {/each}
    </div>
  {/if}
  {#if error}<p class="notice error">{error}</p>{/if}

  <section class="card">
    <div class="card-head">
      <h2>{label(at)}</h2>
      {#if at !== 'final'}<span class="sub">portfolio value in {monthName(at)}</span>{/if}
    </div>
    <div class="card-body">
      {#if !view}
        <p class="muted">Loading…</p>
      {:else if view.entries.length === 0}
        <p class="muted">{at === 'final' ? 'No game has been played to the end yet.' : `No game has reached ${monthName(at)} yet.`}</p>
      {:else}
        <table class="data">
          <thead>
            <tr><th class="rank">#</th><th>Player</th><th>Game</th><th class="num">Portfolio value</th><th class="num">Since start</th><th class="num">Played</th></tr>
          </thead>
          <tbody>
            {#each view.entries as e (e.rank)}
              <tr class:first={e.rank === 1}>
                <td class="rank">{e.rank}</td>
                <td class="name">{e.name}</td>
                <td>{e.game}{#if e.solo} <span class="badge">solo</span>{/if}</td>
                <td class="num value">{usd(e.totalValue)}</td>
                <td class="num {e.totalValue < STARTING_CASH ? 'down' : 'up'}">{pct(e.totalValue / STARTING_CASH - 1, { sign: true, digits: 0 })}</td>
                <td class="num muted">{e.playedAt}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </section>
</main>

<style>
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 28px 20px 56px;
    display: grid;
    gap: 18px;
  }
  h1 {
    font-size: 2.2rem;
  }
  .segmented {
    flex-wrap: wrap;
  }
  .rank {
    width: 2.2em;
    color: var(--muted);
  }
  .name,
  .value {
    font-weight: 650;
  }
  tr.first td {
    font-size: 1.15rem;
  }
</style>
