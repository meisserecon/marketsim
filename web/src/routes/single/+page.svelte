<script lang="ts">
  // Not linked from anywhere: only whoever knows this address and the password can start a game alone.
  import { goto } from '$app/navigation';
  import { api } from '$lib/api';
  import { setToken } from '$lib/api/tokens';
  import { errorMessage } from '$lib/format';

  let name = $state('');
  let password = $state('');
  let starting = $state(false);
  let error = $state('');

  async function playAlone(e: SubmitEvent) {
    e.preventDefault();
    if (starting) return;
    error = '';
    if (!name.trim()) return void (error = 'Enter your name.');
    starting = true;
    try {
      const res = await api.solo({ name: name.trim(), ...(password ? { password } : {}) });
      setToken('player', res.game.code, res.playerToken);
      await goto(`/g/${res.game.code}`);
    } catch (err) {
      error = errorMessage(err);
    } finally {
      starting = false;
    }
  }
</script>

<svelte:head><title>Play alone · Month by Month</title></svelte:head>

<main>
  <form class="card panel" onsubmit={playAlone}>
    <h1>Play alone</h1>
    <p class="sub">Start a game of your own. You invest, and you decide when the next month begins.</p>
    <label class="field">
      <span>Your name</span>
      <input class="input" bind:value={name} autocomplete="nickname" placeholder="Shown in the highscores" maxlength="30" />
    </label>
    <label class="field">
      <span>Password</span>
      <input class="input" type="password" bind:value={password} autocomplete="current-password" />
    </label>
    {#if error}<p class="notice error" role="alert">{error}</p>{/if}
    <button class="btn primary" type="submit" disabled={starting}>{starting ? 'Starting…' : 'Start my game'}</button>
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
    font-size: 1.4rem;
    margin: 0;
  }
</style>
