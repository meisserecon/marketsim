<script lang="ts">
  import { goto } from '$app/navigation';
  import { api, isApiFailure } from '$lib/api';
  import { getToken, knownGames, setToken, clearToken, type Role } from '$lib/api/tokens';
  import { errorMessage, monthName } from '$lib/format';
  import type { GameView } from '@marketsim/shared';

  let gameName = $state('');
  let startingCash = $state('100000');
  let creating = $state(false);
  let createError = $state('');

  let code = $state('');
  let playerName = $state('');
  let joining = $state(false);
  let joinError = $state('');

  const cleanCode = $derived(code.trim().toUpperCase());
  const cash = $derived(Number(startingCash.replace(/[,\s$']/g, '')));

  // Games this browser already has a token for.
  let mine = $state<{ game: GameView; roles: Role[] }[]>([]);
  $effect(() => {
    const byCode = new Map<string, Role[]>();
    for (const k of knownGames()) byCode.set(k.code, [...(byCode.get(k.code) ?? []), k.role]);
    Promise.all(
      [...byCode].map(async ([c, roles]) => {
        try {
          return { game: await api.getGame(c), roles };
        } catch {
          return undefined; // game gone (or server unreachable): just do not list it
        }
      })
    ).then((list) => (mine = list.filter((x) => x !== undefined)));
  });

  async function create(e: SubmitEvent) {
    e.preventDefault();
    if (creating) return;
    createError = '';
    if (!gameName.trim()) return void (createError = 'Give the game a name.');
    if (!Number.isFinite(cash) || cash <= 0) return void (createError = 'Starting cash must be a positive amount.');
    creating = true;
    try {
      const res = await api.createGame({ name: gameName.trim(), startingCash: cash });
      setToken('gm', res.game.code, res.gameMasterToken);
      await goto(`/g/${res.game.code}/gm`);
    } catch (err) {
      createError = errorMessage(err);
    } finally {
      creating = false;
    }
  }

  async function join(e: SubmitEvent) {
    e.preventDefault();
    if (joining) return;
    joinError = '';
    if (!cleanCode) return void (joinError = 'Enter the game code shown by the game master.');
    joining = true;
    try {
      // Rejoining on the same browser resumes the stored player.
      const stored = getToken('player', cleanCode);
      if (stored) {
        try {
          await api.me(cleanCode, stored);
          await goto(`/g/${cleanCode}`);
          return;
        } catch (err) {
          if (isApiFailure(err) && (err.code === 'unauthorized' || err.code === 'not_found')) clearToken('player', cleanCode);
          else throw err;
        }
      }
      if (!playerName.trim()) {
        joinError = 'Enter your player name.';
        return;
      }
      const res = await api.join(cleanCode, { name: playerName.trim() });
      setToken('player', cleanCode, res.playerToken);
      await goto(`/g/${cleanCode}`);
    } catch (err) {
      joinError = errorMessage(err);
    } finally {
      joining = false;
    }
  }
</script>

<svelte:head><title>marketsim</title></svelte:head>

<main>
  <header>
    <h1>marketsim</h1>
    <p class="lead">Live through the markets from 1980 to today, one month at a time. Invest in bonds, gold and stocks, collect the income, and see who ends up ahead.</p>
  </header>

  <div class="grid">
    <form class="card panel" onsubmit={join}>
      <h2>Join a game</h2>
      <p class="sub">Enter the code your game master shows on the screen.</p>
      <label class="field">
        <span>Game code</span>
        <input class="input code" bind:value={code} autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCDE" maxlength="12" />
      </label>
      <label class="field">
        <span>Your name</span>
        <input class="input" bind:value={playerName} autocomplete="nickname" placeholder="Shown on the leaderboard" maxlength="40" />
      </label>
      {#if joinError}<p class="notice error" role="alert">{joinError}</p>{/if}
      <button class="btn primary" type="submit" disabled={joining}>{joining ? 'Joining…' : 'Join game'}</button>
      <p class="sub muted">Already joined on this browser? Enter the code and you will continue where you left off.</p>
    </form>

    <form class="card panel" onsubmit={create}>
      <h2>Create a game</h2>
      <p class="sub">You become the game master and advance the clock for everybody.</p>
      <label class="field">
        <span>Game name</span>
        <input class="input" bind:value={gameName} placeholder="e.g. Economics 101, Tuesday" maxlength="60" />
      </label>
      <label class="field">
        <span>Starting cash per player (USD)</span>
        <input class="input" bind:value={startingCash} inputmode="decimal" />
      </label>
      {#if createError}<p class="notice error" role="alert">{createError}</p>{/if}
      <button class="btn primary" type="submit" disabled={creating}>{creating ? 'Creating…' : 'Create game'}</button>
    </form>
  </div>

  {#if mine.length}
    <section class="card panel mine">
      <h2>Your games on this browser</h2>
      <ul>
        {#each mine as m (m.game.code)}
          <li>
            <div>
              <strong>{m.game.name}</strong>
              <span class="sub">{m.game.code} · {m.game.status === 'finished' ? 'finished' : monthName(m.game.currentMonth)}</span>
            </div>
            <div class="actions">
              {#if m.roles.includes('player')}<a class="btn small" href="/g/{m.game.code}">Continue playing</a>{/if}
              {#if m.roles.includes('gm')}<a class="btn small" href="/g/{m.game.code}/gm">Game master view</a>{/if}
            </div>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</main>

<style>
  main {
    max-width: 880px;
    margin: 0 auto;
    padding: 48px 20px 64px;
    display: grid;
    gap: 24px;
  }
  h1 {
    font-size: 2.4rem;
    letter-spacing: -0.02em;
  }
  .lead {
    color: var(--ink-2);
    font-size: 1.1rem;
    max-width: 56ch;
    margin-top: 6px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    align-items: start;
  }
  .panel {
    padding: 22px;
    display: grid;
    gap: 14px;
  }
  h2 {
    font-size: 1.2rem;
  }
  .code {
    font-size: 1.4rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-weight: 650;
  }
  .code::placeholder {
    font-weight: 400;
    opacity: 0.4;
  }
  .mine ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 10px;
  }
  .mine li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .mine li > div:first-child {
    display: grid;
  }
  .actions {
    display: flex;
    gap: 8px;
  }
</style>
