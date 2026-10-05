<script lang="ts">
  // Players only ever join. Games are created on /create and solo games on /single; neither is linked here.
  import { goto } from '$app/navigation';
  import { api, isApiFailure } from '$lib/api';
  import { getToken, knownGames, setToken, clearToken, type Role } from '$lib/api/tokens';
  import { errorMessage, monthName } from '$lib/format';
  import type { GameView } from '@marketsim/shared';

  let code = $state('');
  let playerName = $state('');
  let joining = $state(false);
  let joinError = $state('');

  const cleanCode = $derived(code.trim().toUpperCase());

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

<svelte:head><title>Month by Month</title></svelte:head>

<main>
  <header>
    <h1>Month by Month</h1>
    <p class="lead">Live through the markets from 1980 to today, one month at a time. Invest in bonds, gold and stocks, collect the income, and see who ends up ahead.</p>
  </header>

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

  <p class="hs"><a href="/highscores">Highscores of all games</a></p>

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
  .hs {
    text-align: center;
    margin: 0;
  }
  main {
    max-width: 520px;
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
