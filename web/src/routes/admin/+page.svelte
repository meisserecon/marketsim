<script lang="ts">
  // The host's page, not linked from anywhere: every game on the server, and deleting one for good.
  import type { AdminGamesView } from '@marketsim/shared';
  import { api } from '$lib/api';
  import { errorMessage, monthName } from '$lib/format';

  let password = $state('');
  let view = $state<AdminGamesView | undefined>(undefined);
  let busy = $state(false);
  let error = $state('');
  /** The game whose delete button was pressed once: it asks before it deletes. */
  let asking = $state('');

  async function load(e?: SubmitEvent) {
    e?.preventDefault();
    if (busy) return;
    busy = true;
    error = '';
    try {
      view = await api.adminGames({ password });
    } catch (err) {
      error = errorMessage(err);
    } finally {
      busy = false;
    }
  }

  async function remove(code: string) {
    if (busy) return;
    busy = true;
    error = '';
    try {
      view = await api.adminDelete(code, { password });
      asking = '';
    } catch (err) {
      error = errorMessage(err);
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head><title>Admin · Month by Month</title></svelte:head>

<main>
  <h1>Games on this server</h1>
  {#if !view}
    <form class="card panel" onsubmit={load}>
      <label class="field">
        <span>Password</span>
        <input class="input" type="password" bind:value={password} autocomplete="current-password" />
      </label>
      {#if error}<p class="notice error" role="alert">{error}</p>{/if}
      <button class="btn primary" type="submit" disabled={busy}>{busy ? 'Loading…' : 'Show the games'}</button>
    </form>
  {:else}
    <p class="sub">{view.games.length} games. Deleting a game also removes its players and their entries in the highscores. It cannot be undone.</p>
    {#if error}<p class="notice error" role="alert">{error}</p>{/if}
    <section class="card">
      {#if view.games.length === 0}
        <p class="muted pad">No games.</p>
      {:else}
        <table class="data">
          <thead>
            <tr><th>Game</th><th>Code</th><th>Players</th><th>From</th><th>Now in</th><th>Created</th><th>Last played</th><th></th></tr>
          </thead>
          <tbody>
            {#each view.games as g (g.code)}
              <tr>
                <td class="name"><a href="/g/{g.code}">{g.name}</a>{#if g.solo} <span class="badge">solo</span>{/if}{#if g.status === 'finished'} <span class="badge">finished</span>{/if}</td>
                <td>{g.code}</td>
                <td>{g.players.join(', ') || '–'}</td>
                <td>{monthName(g.startMonth)}</td>
                <td>{monthName(g.currentMonth)}</td>
                <td class="muted">{g.createdAt}</td>
                <td class="muted">{g.lastPlayedAt}</td>
                <td class="act">
                  {#if asking === g.code}
                    <button class="btn small danger" disabled={busy} onclick={() => remove(g.code)}>Really delete</button>
                    <button class="btn small" onclick={() => (asking = '')}>Keep</button>
                  {:else}
                    <button class="btn small" onclick={() => (asking = g.code)}>Delete</button>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </section>
  {/if}
</main>

<style>
  main {
    max-width: 1100px;
    margin: 0 auto;
    padding: 40px 20px 64px;
    display: grid;
    gap: 14px;
  }
  h1 {
    font-size: 1.5rem;
    margin: 0;
  }
  .panel {
    max-width: 420px;
    padding: 22px;
    display: grid;
    gap: 14px;
  }
  .pad {
    padding: 16px;
    margin: 0;
  }
  .card {
    overflow-x: auto;
  }
  .act {
    white-space: nowrap;
    text-align: right;
  }
  .name a {
    font-weight: 600;
  }
</style>
