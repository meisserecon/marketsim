<script lang="ts">
  // Not linked from anywhere: only whoever knows this address and the password can start a game.
  import { goto } from '$app/navigation';
  import { api } from '$lib/api';
  import { setToken } from '$lib/api/tokens';
  import { errorMessage, monthName, usd } from '$lib/format';
  import { AGES, STARTING_CASH } from '@marketsim/shared';

  let gameName = $state('');
  let password = $state('');
  /** The age the game begins with; empty for the first, i.e. the whole game. */
  let startAge = $state('');
  let creating = $state(false);
  let createError = $state('');

  async function create(e: SubmitEvent) {
    e.preventDefault();
    if (creating) return;
    createError = '';
    if (!gameName.trim()) return void (createError = 'Give the game a name.');
    creating = true;
    try {
      const res = await api.createGame({ name: gameName.trim(), ...(password ? { password } : {}), ...(startAge ? { startAge } : {}) });
      setToken('gm', res.game.code, res.gameMasterToken);
      await goto(`/g/${res.game.code}/gm`);
    } catch (err) {
      createError = errorMessage(err);
    } finally {
      creating = false;
    }
  }
</script>

<svelte:head><title>Create a game · Month by Month</title></svelte:head>

<main>
  <form class="card panel" onsubmit={create}>
    <h1>Create a game</h1>
    <p class="sub">You become the game master and advance the clock for everybody. Every player starts with {usd(STARTING_CASH)} in cash.</p>
    <label class="field">
      <span>Game name</span>
      <input class="input" bind:value={gameName} placeholder="e.g. Family game, autumn 2026" maxlength="60" />
    </label>
    <label class="field">
      <span>Start with</span>
      <select class="input" bind:value={startAge}>
        {#each AGES as a, i (a.id)}<option value={i === 0 ? '' : a.id}>{a.name} ({monthName(a.from)}){i === 0 ? ': the whole game' : ''}</option>{/each}
      </select>
    </label>
    <label class="field">
      <span>Password</span>
      <input class="input" type="password" bind:value={password} autocomplete="current-password" />
    </label>
    {#if createError}<p class="notice error" role="alert">{createError}</p>{/if}
    <button class="btn primary" type="submit" disabled={creating}>{creating ? 'Creating…' : 'Create game'}</button>
  </form>
</main>

<style>
  main {
    max-width: 480px;
    margin: 0 auto;
    padding: 48px 20px 64px;
  }
  .panel {
    padding: 22px;
    display: grid;
    gap: 14px;
  }
  h1 {
    font-size: 1.5rem;
  }
</style>
