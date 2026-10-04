<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { AGES, ageAt, previousAge, type AgesView } from '@marketsim/shared';
  import AgeScreen from '$lib/components/AgeScreen.svelte';
  import { nextMonth, type GameEvent, type GameView, type HoldingsView, type LeaderboardView, type MarketView, type NewsView } from '@marketsim/shared';
  import { api, isApiFailure } from '$lib/api';
  import { clearToken, fragmentToken, getToken, setToken, showTokenInAddress } from '$lib/api/tokens';
  import { errorMessage, monthName, pct, usd } from '$lib/format';
  import Leaderboard from '$lib/components/Leaderboard.svelte';
  import FrontPage from '$lib/components/FrontPage.svelte';
  import MarketTable from '$lib/components/MarketTable.svelte';

  const code = (page.params.code ?? '').toUpperCase();
  // A personal link (#key=...) wins over a key the browser already holds.
  const linkToken = fragmentToken();
  /** The key this browser held before the link was opened; restored if the link turns out to be wrong. */
  let keyBeforeLink = linkToken ? getToken('gm', code) : undefined;
  if (linkToken) setToken('gm', code, linkToken);
  let token = $state(getToken('gm', code));
  // The address bar always shows the personal link, so it can be copied to another device.
  $effect(() => showTokenInAddress(token));
  let keyRejected = $state(false);
  const hasPlayerToken = !!getToken('player', code);

  let phase = $state<'loading' | 'ready' | 'missing' | 'error'>('loading');
  let fatal = $state('');
  let game = $state<GameView | undefined>(undefined);
  let board = $state<LeaderboardView | undefined>(undefined);
  let holdings = $state<HoldingsView | undefined>(undefined);
  let news = $state<NewsView | undefined>(undefined);
  let market = $state<MarketView | undefined>(undefined);
  let ages = $state<AgesView | undefined>(undefined);
  const age = $derived(game ? ageAt(game.currentMonth) : AGES[0]);
  /** The age screen opens by itself when the clock enters a new age, for the room to read together. */
  let ageOpen = $state(false);
  let ageShownFor = '';
  $effect(() => {
    if (game && game.currentMonth === age.from && ageShownFor !== age.id) {
      ageShownFor = age.id;
      ageOpen = true;
    }
  });

  const nameOf = (id: string) => market?.assets.find((a) => a.id === id)?.name ?? id;
  /** The month's biggest rises and falls among everything quoted, for a one-line market summary. */
  const movers = $derived.by(() => {
    const rows = (market?.assets ?? [])
      .filter((a) => a.pricePrev !== undefined && a.pricePrev > 0)
      .map((a) => ({ name: a.name, change: a.price / a.pricePrev! - 1 }))
      .sort((a, b) => b.change - a.change);
    return { up: rows.slice(0, 3).filter((r) => r.change > 0), down: rows.slice(-3).reverse().filter((r) => r.change < 0) };
  });
  /** The strip under the masthead: the stock market and gold, then the biggest movers up and down. */
  const marketStrip = $derived.by(() => {
    const indices: { name: string; change: number }[] = [];
    const h = board?.benchmark?.history ?? [];
    if (h.length >= 2 && h[h.length - 1].month === game?.currentMonth) indices.push({ name: 'Stock market', change: h[h.length - 1].totalValue / h[h.length - 2].totalValue - 1 });
    const gold = market?.assets.find((a) => a.kind === 'gold');
    if (gold?.pricePrev) indices.push({ name: 'Gold', change: gold.price / gold.pricePrev - 1 });
    // Gold has its own place among the indices.
    return { indices, movers: [...movers.up, ...movers.down].filter((m) => m.name !== gold?.name) };
  });
  let lastJoined = $state('');

  let advancing = $state(false);
  /** After an advance the button stays locked briefly, so a double click cannot skip a month. */
  let cooling = $state(false);
  let advanceError = $state('');

  const finished = $derived(game?.status === 'finished');
  const lobby = $derived(game?.status === 'lobby');
  const next = $derived(game ? nextMonth(game.currentMonth) : '');
  const host = typeof location !== 'undefined' ? location.host : '';

  async function refresh() {
    try {
      const [g, l, n, m] = await Promise.all([api.getGame(code), api.leaderboard(code, token), api.news(code, undefined, token), api.market(code, token)]);
      game = g;
      board = l;
      news = n;
      market = m;
      api.ages(code, token).then((a) => (ages = a)).catch(() => {});
      phase = 'ready';
      // Only the game master's browser may see who holds what.
      if (token) {
        api
          .holdings(code, token)
          .then((h) => (holdings = h))
          .catch((e) => {
            // A key the server does not know (e.g. from a link for another game): drop it.
            if (isApiFailure(e) && e.code === 'unauthorized') {
              keyRejected = true;
              if (token === linkToken && keyBeforeLink && keyBeforeLink !== linkToken) {
                // A wrong link must not cost this browser the key it already had.
                token = keyBeforeLink;
                keyBeforeLink = undefined;
                setToken('gm', code, token);
                void refresh();
                return;
              }
              clearToken('gm', code);
              token = undefined;
            }
          });
      }
    } catch (e) {
      if (phase !== 'loading') return;
      if (isApiFailure(e) && e.code === 'not_found') phase = 'missing';
      else {
        fatal = errorMessage(e);
        phase = 'error';
      }
    }
  }

  function onEvent(event: GameEvent) {
    if (event.type === 'player-joined') {
      lastJoined = event.name;
      if (game) game = { ...game, playerCount: event.playerCount };
    } else {
      game = event.game;
    }
    void refresh();
  }

  onMount(() => {
    void refresh();
    const unsubscribe = api.subscribe(code, onEvent, () => void refresh());
    const poll = setInterval(() => {
      if (!document.hidden) void refresh();
    }, 20_000);
    return () => {
      unsubscribe();
      clearInterval(poll);
    };
  });

  async function advance() {
    if (!token || !game || advancing || cooling || finished) return;
    advancing = true;
    advanceError = '';
    try {
      game = await api.advance(code, token);
      cooling = true;
      setTimeout(() => (cooling = false), 250);
      void refresh();
    } catch (e) {
      advanceError = errorMessage(e);
      void refresh();
    } finally {
      advancing = false;
    }
  }
</script>

<svelte:window onhashchange={() => { const k = fragmentToken(); if (k && k !== token) location.reload(); }} />

<svelte:head><title>{game ? `${game.name} · game master` : 'Game master'}</title></svelte:head>

{#if phase === 'loading'}
  <p class="center muted">Loading…</p>
{:else if phase === 'missing'}
  <div class="center">
    <h1>No such game</h1>
    <p class="sub">There is no game with the code <strong>{code}</strong>.</p>
    <a class="btn" href="/">Back to start</a>
  </div>
{:else if phase === 'error'}
  <div class="center">
    <h1>Cannot load the game</h1>
    <p class="notice error">{fatal}</p>
    <button class="btn" onclick={() => location.reload()}>Try again</button>
  </div>
{:else if game}
  <main>
    <header>
      <div>
        <p class="sub">Month by Month · game master · {game.name}</p>
        <h1 class="month">{monthName(game.currentMonth)}</h1>
        <button class="age" onclick={() => (ageOpen = true)}>{age.name}</button>
        {#if finished || lobby}
          <p class="status">{finished ? 'Final month. The game is over.' : 'Not started: players are building their first portfolios.'}</p>
        {/if}
      </div>
      <div class="join card">
        <span class="sub">Join at <strong>{host}</strong> with code</span>
        <span class="code">{game.code}</span>
        <span class="players">
          <strong>{game.playerCount}</strong> {game.playerCount === 1 ? 'player' : 'players'}
          {#if lastJoined}<span class="sub">· {lastJoined} just joined</span>{/if}
        </span>
      </div>
    </header>

    <section class="control">
      {#if !token}
        {#if keyRejected}<p class="notice warn" role="alert">That link is not valid for this game.</p>{/if}
        <p class="notice warn">
          This browser does not hold the game master key for this game, so it can watch but not advance the clock. The key is stored in the browser that created the game.
        </p>
      {:else if finished}
        <div class="done card">
          <h2>The game is over</h2>
          <p class="sub">{monthName(game.currentMonth)} was the last month with data. The standings below are final.</p>
        </div>
      {:else}
        <button class="btn primary advance" onclick={advance} disabled={advancing || cooling}>
          {#if advancing}Advancing…{:else if lobby}Start the game: advance to {monthName(next)}{:else}Advance to {monthName(next)}{/if}
        </button>
      {/if}
      {#if advanceError}<p class="notice error" role="alert">{advanceError}</p>{/if}
    </section>

    {#if news && news.month === game.currentMonth && news.items.length}
      <FrontPage month={news.month} items={news.items} {nameOf} big markets={marketStrip} />
    {/if}

    <section class="card board">
      <div class="card-head">
        <h2>{finished ? 'Final standings' : 'Leaderboard'}</h2>
        <span class="sub">
          by portfolio value, starting from ${game.startingCash.toLocaleString('en-US')}
          {#if hasPlayerToken}· <a href="/g/{code}">open my player view</a>{/if}
        </span>
      </div>
      <div class="card-body">
        {#if board}<Leaderboard view={board} startingCash={game.startingCash} finalMonth={game.finalMonth} big />{/if}
      </div>
    </section>

    {#if market}
      <section class="card">
        <div class="card-head">
          <h2>Market</h2>
        </div>
        <div class="card-body">
          <MarketTable assets={market.assets} month={market.month} held={new Set()} markNew={!lobby} onselect={() => {}} />
        </div>
      </section>
    {/if}

    {#if holdings && holdings.players.length}
      <section class="card">
        <div class="card-head">
          <h2>Who holds what</h2>
          <span class="sub">positions of every player in {monthName(holdings.month)}, as a share of their portfolio · only you see this</span>
        </div>
        <div class="card-body">
          <table class="data holdings">
            <thead>
              <tr><th>Player</th><th>Positions</th><th class="num">Cash</th><th class="num">Portfolio value</th></tr>
            </thead>
            <tbody>
              {#each holdings.players as p (p.playerId)}
                <tr>
                  <td class="who">{p.name}</td>
                  <td>
                    {#each p.positions as pos (pos.assetId)}
                      <span class="pos" title={usd(pos.value)}>{pos.name} <b>{pct(p.totalValue > 0 ? pos.value / p.totalValue : 0, { digits: 0 })}</b></span>
                    {:else}
                      <span class="muted">all in cash</span>
                    {/each}
                  </td>
                  <td class="num">{pct(p.totalValue > 0 ? p.cash / p.totalValue : 0, { digits: 0 })}</td>
                  <td class="num total">{usd(p.totalValue)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
    {/if}
  </main>
  {#if ageOpen}
    {@const ended = previousAge(age)}
    <AgeScreen {age} {ended} review={ages?.ended.find((r) => r.id === ended?.id)} {board} big onclose={() => (ageOpen = false)} />
  {/if}
{/if}

<style>
  .center {
    min-height: 70vh;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 14px;
    padding: 24px;
    text-align: center;
  }
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 28px 28px 56px;
    display: grid;
    gap: 26px;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    gap: 24px;
    flex-wrap: wrap;
  }
  header .sub {
    font-size: 1.05rem;
  }
  .month {
    font-size: clamp(3rem, 8vw, 6rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
  }
  .status {
    font-size: 1.2rem;
    color: var(--ink-2);
    margin-top: 6px;
  }
  .join {
    display: grid;
    justify-items: center;
    align-content: center;
    gap: 2px;
    padding: 16px 32px;
  }
  .code {
    font-size: clamp(3rem, 7vw, 5rem);
    font-weight: 750;
    letter-spacing: 0.14em;
    line-height: 1.1;
    font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
    /* letter-spacing adds a trailing gap; pull the text back to the optical centre */
    margin-right: -0.14em;
  }
  .players {
    font-size: 1.2rem;
  }
  .control {
    display: grid;
    gap: 10px;
    justify-items: start;
  }
  .advance {
    font-size: 1.7rem;
    padding: 20px 36px;
    border-radius: 14px;
  }
  .done {
    padding: 18px 22px;
    border-left: 5px solid var(--accent);
  }
  .done h2 {
    font-size: 1.6rem;
  }
  .holdings {
    font-size: 1.1rem;
  }
  .holdings td {
    padding: 9px 10px;
    vertical-align: top;
  }
  .who,
  .total {
    font-weight: 650;
    white-space: nowrap;
  }
  .pos {
    display: inline-block;
    margin: 0 6px 5px 0;
    padding: 2px 9px;
    border-radius: 999px;
    background: var(--surface-2);
    white-space: nowrap;
  }
  .pos b {
    font-weight: 650;
    font-variant-numeric: tabular-nums;
  }
  .age {
    all: unset;
    display: block;
    /* clear the descenders of the month above (the g in August) */
    margin-top: 0.7rem;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 650;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .age:hover {
    text-decoration: underline;
  }
  .board .card-head h2 {
    font-size: 1.4rem;
  }
</style>
