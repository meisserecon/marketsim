<script lang="ts">
  /**
   * Highscores across all games ever played. One board for the whole game, and one for each age:
   * the gain during that age, so that a game which began with a later age competes on equal terms.
   */
  import type { HighscoresView } from '@marketsim/shared';
  import { api } from '$lib/api';
  import { errorMessage, monthName, pct, usd } from '$lib/format';
  import { STARTING_CASH } from '@marketsim/shared';

  let board = $state('overall');
  let view = $state<HighscoresView | undefined>(undefined);
  let error = $state('');

  $effect(() => {
    const wanted = board;
    error = '';
    api
      .highscores(wanted)
      .then((v) => {
        if (wanted === board) view = v;
      })
      .catch((e) => (error = errorMessage(e)));
  });

  const current = $derived(view?.boards.find((b) => b.id === board));
  const overall = $derived(board === 'overall');
</script>

<svelte:head><title>Highscores · Month by Month</title></svelte:head>

<main>
  <header>
    <p class="sub"><a href="/">Month by Month</a></p>
    <h1>Highscores</h1>
    <p class="sub">
      The best players of all games ever played. One board is for the whole game, from {usd(STARTING_CASH)} at the start to the end.
      The others are for one age each: what counts there is how much a portfolio gained during that age, so a game that
      begins with a later age competes on equal terms with those that came all the way.
    </p>
  </header>

  {#if view}
    <div class="segmented boards" role="group" aria-label="Board">
      {#each view.boards as b (b.id)}
        <button aria-pressed={board === b.id} onclick={() => (board = b.id)}>{b.id === 'overall' ? 'Overall' : b.name}</button>
      {/each}
    </div>
  {/if}
  {#if error}<p class="notice error">{error}</p>{/if}

  <section class="card">
    <div class="card-head">
      <h2>{current?.name ?? 'Highscores'}</h2>
      {#if current}<span class="sub">{monthName(current.from)} to {monthName(current.to)}{#if view?.market !== undefined} · the stock market: {pct(view.market, { sign: true, digits: 0 })}{/if}</span>{/if}
    </div>
    <div class="card-body">
      {#if !view}
        <p class="muted">Loading…</p>
      {:else if view.entries.length === 0}
        <p class="muted">{overall ? 'No game has been played from the first month to the last yet.' : `No game has played through ${current?.name ?? 'this age'} yet.`}</p>
      {:else}
        <table class="data">
          <thead>
            <tr><th class="rank">#</th><th>Player</th><th>Game</th><th class="num">{overall ? 'Portfolio value' : 'Gain in this age'}</th><th class="num">{overall ? 'Since start' : 'Value at its end'}</th><th class="num">Played</th></tr>
          </thead>
          <tbody>
            {#each view.entries as e (e.rank)}
              <tr class:first={e.rank === 1}>
                <td class="rank">{e.rank}</td>
                <td class="name">{e.name}</td>
                <td>{e.game}{#if e.solo} <span class="badge">solo</span>{/if}</td>
                {#if overall}
                  <td class="num value">{usd(e.totalValue)}</td>
                  <td class="num {e.gain < 0 ? 'down' : 'up'}">{pct(e.gain, { sign: true, digits: 0 })}</td>
                {:else}
                  <td class="num value {e.gain < 0 ? 'down' : 'up'}">{pct(e.gain, { sign: true, digits: 0 })}</td>
                  <td class="num">{usd(e.totalValue)}</td>
                {/if}
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
