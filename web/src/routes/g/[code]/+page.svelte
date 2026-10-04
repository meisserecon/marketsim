<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { page } from '$app/state';
  import { AGES, GAME_START_MONTH, ageAt, nextMonth, previousAge, type AgesView } from '@marketsim/shared';
  import AgeScreen from '$lib/components/AgeScreen.svelte';
  import type { GameEvent, GameView, LeaderboardView, LedgerEntry, MarketView, NewsView, PortfolioView } from '@marketsim/shared';
  import { api, isApiFailure } from '$lib/api';
  import { clearToken, fragmentToken, getToken, setToken, showTokenInAddress } from '$lib/api/tokens';
  import { LEDGER_LABEL, errorMessage, monthName, pct, usd } from '$lib/format';
  import { loadNames, saveNames } from '$lib/names';
  import AssetDetail from '$lib/components/AssetDetail.svelte';
  import Leaderboard from '$lib/components/Leaderboard.svelte';
  import NewsTicker from '$lib/components/NewsTicker.svelte';
  import Welcome from '$lib/components/Welcome.svelte';
  import MarketTable from '$lib/components/MarketTable.svelte';
  import PortfolioCard from '$lib/components/PortfolioCard.svelte';

  const code = (page.params.code ?? '').toUpperCase();

  let phase = $state<'loading' | 'join' | 'play' | 'missing' | 'error'>('loading');
  let fatal = $state('');
  // A personal link (#key=...) wins over a token the browser already holds.
  const linkToken = fragmentToken();
  /** The seat this browser held before the link was opened; restored if the link turns out to be wrong. */
  let seatBeforeLink = linkToken ? getToken('player', code) : undefined;
  if (linkToken) setToken('player', code, linkToken);
  let token = $state(getToken('player', code));
  // The address bar always shows the personal link, so it can be copied to another device.
  $effect(() => showTokenInAddress(token));
  let linkRejected = $state(false);
  const hasGmToken = !!getToken('gm', code);

  let game = $state<GameView | undefined>(undefined);
  let market = $state<MarketView | undefined>(undefined);
  let portfolio = $state<PortfolioView | undefined>(undefined);
  let board = $state<LeaderboardView | undefined>(undefined);
  let news = $state<NewsView | undefined>(undefined);
  let names = $state<Record<string, string>>(loadNames(code));
  let selectedId = $state<string | undefined>(undefined);
  let refreshError = $state('');

  interface Summary {
    month: string;
    totalValue: number;
    change?: number;
    income: LedgerEntry[];
    incomeTotal: number;
    events: LedgerEntry[];
    listings: string[];
  }
  let summary = $state<Summary | undefined>(undefined);
  let showFinal = $state(false);

  // join form
  let joinName = $state('');
  let joining = $state(false);
  let joinError = $state('');

  let rightColumn = $state<HTMLElement | undefined>(undefined);

  const nameOf = (id: string) => names[id] ?? id.toUpperCase();
  const selected = $derived(selectedId ? market?.assets.find((a) => a.id === selectedId) : undefined);
  const held = $derived(new Set(portfolio?.positions.map((p) => p.assetId) ?? []));
  const tradable = $derived(new Set(market?.assets.map((a) => a.id) ?? []));
  const finished = $derived(game?.status === 'finished');
  const solo = $derived(!!game?.solo);

  // The age screen: shown once when the clock enters a new age, and again from the age's name in the header.
  let ages = $state<AgesView | undefined>(undefined);
  const age = $derived(game ? ageAt(game.currentMonth) : AGES[0]);
  const ageKey = (id: string) => `marketsim:age:${code}:${id}`;
  const seenAge = (id: string) => { try { return localStorage.getItem(ageKey(id)) === '1'; } catch { return false; } };
  let ageOpen = $state(false);
  $effect(() => {
    if (game && game.currentMonth === age.from && !seenAge(age.id)) ageOpen = true;
  });
  function closeAge() {
    ageOpen = false;
    try { localStorage.setItem(ageKey(age.id), '1'); } catch { /* shown again, no harm */ }
  }
  $effect(() => {
    // The figures of the ages that are over; refetched when the month changes.
    void game?.currentMonth;
    if (token) api.ages(code, token).then((a) => (ages = a)).catch(() => {});
  });

  // The welcome screen shows once per game on this browser.
  const welcomeKey = `marketsim:welcome:${code}`;
  const seenWelcome = () => { try { return localStorage.getItem(welcomeKey) === '1'; } catch { return false; } };
  let showWelcome = $state(!seenWelcome());
  function closeWelcome() {
    showWelcome = false;
    try { localStorage.setItem(welcomeKey, '1'); } catch { /* shown again next time, no harm */ }
  }
  let advancing = $state(false);
  let advanceError = $state('');
  /** Single-player games: the player's own token moves the clock. */
  async function advance() {
    if (!token || advancing || finished) return;
    advancing = true;
    advanceError = '';
    try {
      await api.advance(code, token);
      await refresh();
    } catch (e) {
      advanceError = errorMessage(e);
    } finally {
      advancing = false;
    }
  }
  const lobby = $derived(game?.status === 'lobby');
  const incomeThisMonth = $derived(
    portfolio ? portfolio.ledger.filter((e) => e.kind === 'income' && e.month === portfolio!.month).reduce((s, e) => s + e.cash, 0) : 0
  );

  function remember(m: MarketView | undefined, p: PortfolioView | undefined) {
    const next = { ...names };
    for (const a of m?.assets ?? []) next[a.id] = a.name;
    for (const pos of p?.positions ?? []) next[pos.assetId] = pos.name;
    names = next;
    saveNames(code, next);
  }

  function summarize(p: PortfolioView, m: MarketView): Summary {
    const entries = p.ledger.filter((e) => e.month === p.month);
    const income = entries.filter((e) => e.kind === 'income');
    const before = p.history.filter((h) => h.month < p.month).at(-1)?.totalValue;
    return {
      month: p.month,
      totalValue: p.totalValue,
      change: before && before > 0 ? p.totalValue / before - 1 : undefined,
      income,
      incomeTotal: income.reduce((s, e) => s + e.cash, 0),
      events: entries.filter((e) => e.kind === 'bankruptcy' || e.kind === 'payout' || e.kind === 'conversion'),
      listings: m.assets.filter((a) => a.listedSince === m.month).map((a) => a.name)
    };
  }

  /** Refetches everything. Responses of an overtaken refresh are dropped. */
  let generation = 0;
  async function refresh(attempt = 0): Promise<void> {
    if (!token) return;
    const mine = ++generation;
    const previousMonth = portfolio?.month;
    try {
      const [g, m, p, l, n] = await Promise.all([api.getGame(code), api.market(code, token), api.me(code, token), api.leaderboard(code, token), api.news(code, undefined, token)]);
      if (mine !== generation) return;
      // The four calls are separate requests; if the clock moved in between, go again.
      if ((m.month !== g.currentMonth || p.month !== g.currentMonth) && attempt < 3) return refresh(attempt + 1);
      remember(m, p);
      game = g;
      market = m;
      portfolio = p;
      board = l;
      news = n;
      refreshError = '';
      phase = 'play';
      if (previousMonth && previousMonth !== p.month) {
        summary = summarize(p, m);
        // The open asset may have ended with the month.
        if (selectedId && !m.assets.some((a) => a.id === selectedId)) selectedId = undefined;
        if (g.status === 'finished') showFinal = true;
      }
    } catch (e) {
      if (mine !== generation) return;
      if (isApiFailure(e) && e.code === 'unauthorized') {
        if (token === linkToken) linkRejected = true;
        if (token === linkToken && seatBeforeLink && seatBeforeLink !== linkToken) {
          // A wrong link must not cost the player the seat this browser already had.
          token = seatBeforeLink;
          seatBeforeLink = undefined;
          setToken('player', code, token);
          return refresh();
        }
        clearToken('player', code);
        token = undefined;
        phase = 'join';
      } else if (isApiFailure(e) && e.code === 'not_found' && !game) {
        phase = 'missing';
      } else if (phase === 'loading') {
        fatal = errorMessage(e);
        phase = 'error';
      } else {
        refreshError = errorMessage(e);
      }
    }
  }

  function onEvent(event: GameEvent) {
    if (event.type === 'player-joined') {
      if (game) game = { ...game, playerCount: event.playerCount };
      if (token) api.leaderboard(code, token).then((l) => (board = l)).catch(() => {});
      return;
    }
    game = event.game;
    if (event.type === 'game-finished') showFinal = true;
    void refresh();
  }

  onMount(() => {
    (async () => {
      try {
        game = await api.getGame(code);
      } catch (e) {
        if (isApiFailure(e) && e.code === 'not_found') phase = 'missing';
        else {
          fatal = errorMessage(e);
          phase = 'error';
        }
        return;
      }
      if (token) await refresh();
      else phase = 'join';
    })();

    const unsubscribe = api.subscribe(code, onEvent, () => void refresh(0));
    // Safety net in case the event stream is blocked by a proxy: notice a moved clock anyway.
    const poll = setInterval(async () => {
      if (phase !== 'play' || document.hidden) return;
      try {
        const g = await api.getGame(code);
        if (g.currentMonth !== game?.currentMonth || g.status !== game?.status) void refresh();
        else game = g;
      } catch {
        // next round
      }
    }, 20_000);
    return () => {
      unsubscribe();
      clearInterval(poll);
    };
  });

  async function join(e: SubmitEvent) {
    e.preventDefault();
    if (joining) return;
    if (!joinName.trim()) return void (joinError = 'Enter your player name.');
    joining = true;
    joinError = '';
    try {
      const res = await api.join(code, { name: joinName.trim() });
      setToken('player', code, res.playerToken);
      token = res.playerToken;
      await refresh();
    } catch (err) {
      joinError = errorMessage(err);
    } finally {
      joining = false;
    }
  }

  async function select(id: string) {
    selectedId = id;
    await tick();
    rightColumn?.scrollTo({ top: 0 });
    // Coming from a news tag or the portfolio, the company panel may be far below: bring it into view.
    const panel = rightColumn?.querySelector('.detail-wrap');
    if (panel) {
      const r = panel.getBoundingClientRect();
      if (r.top < 90 || r.top > window.innerHeight * 0.5) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /** Every trade moves one step: this share of the portfolio's total value. */
  const STEP = 0.05;
  const step = $derived((portfolio?.totalValue ?? 0) * STEP);
  let trading = $state(false);
  let tradeNote = $state<{ text: string; error: boolean } | undefined>(undefined);
  let noteTimer: ReturnType<typeof setTimeout> | undefined;

  /** A buy needs cash, and a free slot unless the asset is already held. */
  function canBuy(id: string): boolean {
    if (!portfolio || finished || trading || !tradable.has(id)) return false;
    return portfolio.cash >= 0.01 && (held.has(id) || portfolio.positions.length < portfolio.maxPositions);
  }
  function canSell(id: string): boolean {
    return !!portfolio && !finished && !trading && held.has(id) && tradable.has(id);
  }
  /** Why the buy button is off, for its tooltip. */
  function buyHint(id: string): string {
    if (!portfolio) return '';
    if (finished) return 'The game is over';
    if (portfolio.cash < 0.01) return 'You have no cash: sell something first';
    if (!held.has(id) && portfolio.positions.length >= portfolio.maxPositions) return `You already hold ${portfolio.maxPositions} investments: sell one completely first`;
    return `Buy for ${usd(Math.min(step, portfolio.cash))}`;
  }

  /** Buys one step (or with all cash, if that is less); sells one step (or the whole position, if that is less). */
  async function quickTrade(id: string, side: 'buy' | 'sell') {
    if (!token || !portfolio || trading) return;
    const position = portfolio.positions.find((p) => p.assetId === id);
    const all = side === 'buy' ? portfolio.cash <= step : !position || position.value <= step * 1.001;
    trading = true;
    try {
      const res = await api.trade(code, token, { assetId: id, side, amount: all ? { all: true } : { usd: step } });
      portfolio = res.portfolio;
      remember(market, res.portfolio);
      tradeNote = { text: `${side === 'buy' ? 'Bought' : 'Sold'} ${usd(Math.abs(res.entry.cash))} of ${nameOf(id)}`, error: false };
      api.leaderboard(code, token).then((l) => (board = l)).catch(() => {});
    } catch (e) {
      tradeNote = { text: errorMessage(e), error: true };
    } finally {
      trading = false;
      clearTimeout(noteTimer);
      noteTimer = setTimeout(() => (tradeNote = undefined), 3500);
    }
  }
</script>

<svelte:window onhashchange={() => { const k = fragmentToken(); if (k && k !== token) location.reload(); }} />

<svelte:head><title>{game ? `${game.name} · Month by Month` : 'Month by Month'}</title></svelte:head>

{#if phase === 'loading'}
  <p class="center muted">Loading…</p>
{:else if phase === 'missing'}
  <div class="center">
    <h1>No such game</h1>
    <p class="sub">There is no game with the code <strong>{code}</strong>. Check the code on the game master's screen.</p>
    <a class="btn" href="/">Back to start</a>
  </div>
{:else if phase === 'error'}
  <div class="center">
    <h1>Cannot load the game</h1>
    <p class="notice error">{fatal}</p>
    <button class="btn" onclick={() => location.reload()}>Try again</button>
  </div>
{:else if phase === 'join' && game}
  <div class="center">
    <form class="card join" onsubmit={join}>
      <p class="sub">Game {game.code} · {game.playerCount} {game.playerCount === 1 ? 'player' : 'players'}</p>
      <h1>{game.name}</h1>
      {#if linkRejected}<p class="notice warn" role="alert">That link is not valid for this game. You can join below instead.</p>{/if}
      {#if game.status === 'finished'}
        <p class="notice warn">This game is over and cannot be joined any more.</p>
      {:else}
        <p class="sub">
          {game.status === 'lobby' ? 'The game has not started yet.' : `The game is in ${monthName(game.currentMonth)}.`}
          You start with {usd(game.startingCash)} in cash.
        </p>
        <label class="field">
          <span>Your name</span>
          <!-- svelte-ignore a11y_autofocus -->
          <input class="input" bind:value={joinName} placeholder="Shown on the leaderboard" maxlength="40" autofocus />
        </label>
        {#if joinError}<p class="notice error" role="alert">{joinError}</p>{/if}
        <button class="btn primary" type="submit" disabled={joining}>{joining ? 'Joining…' : 'Join game'}</button>
      {/if}
      {#if hasGmToken}<a class="sub" href="/g/{code}/gm">You are the game master of this game: open the game master view</a>{/if}
    </form>
  </div>
{:else if game && market && portfolio}
  <header class="top">
    <div class="game">
      <span class="sub"><a class="brand" href="/">Month by Month</a> · {game.name} · {game.code} · {portfolio.name}</span>
      <h1>{monthName(game.currentMonth)}</h1>
      <button class="age" onclick={() => (ageOpen = true)} title="About this age">{age.name}</button>
    </div>
    {#if solo && !finished}
      <div class="advance-box">
        <button class="btn primary" onclick={advance} disabled={advancing}>
          {advancing ? 'Advancing…' : lobby ? `Start: go to ${monthName(nextMonth(game.currentMonth))}` : `Next month: ${monthName(nextMonth(game.currentMonth))}`}
        </button>
        {#if advanceError}<span class="sub down" role="alert">{advanceError}</span>{/if}
      </div>
    {/if}
    <dl class="figures">
      <div class="total">
        <dt>Portfolio value</dt>
        <dd>{usd(portfolio.totalValue, { cents: false })}</dd>
      </div>
      <div>
        <dt>Cash</dt>
        <dd>{usd(portfolio.cash, { cents: false })}</dd>
      </div>
      {#if incomeThisMonth > 0}
        <div class="income">
          <dt>Income this month</dt>
          <dd>{usd(incomeThisMonth, { cents: true })}</dd>
        </div>
      {/if}
    </dl>
  </header>

  <div class="banners">
    {#if refreshError}<p class="notice error" role="alert">Could not refresh: {refreshError}</p>{/if}
    {#if finished}
      <p class="notice warn">
        <strong>The game is over.</strong> {monthName(game.currentMonth)} was the final month; trading is closed.
        <button class="btn small" onclick={() => (showFinal = true)}>Show final standings</button>
      </p>
    {/if}
    {#if summary && summary.month === game.currentMonth}
      <section class="summary card" aria-live="polite">
        <div class="summary-head">
          <h2>What happened in {monthName(summary.month)}</h2>
          <button class="btn small" onclick={() => (summary = undefined)}>Dismiss</button>
        </div>
        <ul>
          <li>
            Your portfolio is worth <strong>{usd(summary.totalValue, { cents: false })}</strong>{#if summary.change !== undefined},
              <span class={summary.change < 0 ? 'down' : 'up'}>{pct(summary.change, { sign: true, digits: 2 })}</span> on last month{/if}.
          </li>
          {#if summary.incomeTotal > 0}
            <li class="income-line">
              You received <strong>{usd(summary.incomeTotal, { cents: true })}</strong> of income in cash:
              {#each summary.income as e, i (e.assetId)}{i > 0 ? ', ' : ' '}{(e.assetName ?? nameOf(e.assetId))} {usd(e.cash, { cents: true })}{/each}.
            </li>
          {/if}
          {#each summary.events as e, i (i)}
            <li class="event">
              <strong>{LEDGER_LABEL[e.kind]}: {(e.assetName ?? nameOf(e.assetId))}.</strong>
              {#if e.kind === 'bankruptcy'}Your position is now worthless.
              {:else if e.kind === 'payout'}Your position was paid out: {usd(e.cash, { cents: true })} added to cash.
              {:else if e.units < 0}Your position was converted.
              {:else}You received a position in {(e.assetName ?? nameOf(e.assetId))}.{/if}
              {#if e.note}<span class="sub">{e.note}</span>{/if}
            </li>
          {/each}
          {#if summary.listings.length}
            <li><span class="badge new">New</span> Now trading for the first time: <strong>{summary.listings.join(', ')}</strong>.</li>
          {/if}
        </ul>
      </section>
    {/if}
  </div>

  <div class="portfolio-wrap">
    {#if news && news.month === game.currentMonth}
      <div class="news-card"><NewsTicker month={news.month} items={news.items} {nameOf} openable={tradable} onselect={select} /></div>
    {/if}
    {#if board}
      <section class="card">
        <div class="card-head">
          <h2>{solo ? 'Your progress' : 'Leaderboard'}</h2>
          {#if solo}<a class="sub" href="/highscores">Highscores of all games</a>{:else}<span class="sub">{game.playerCount} {game.playerCount === 1 ? 'player' : 'players'}</span>{/if}
        </div>
        <div class="card-body"><Leaderboard view={board} startingCash={game.startingCash} finalMonth={game.finalMonth} meId={portfolio.playerId} limit={10} wide /></div>
      </section>
    {/if}
    <PortfolioCard {portfolio} startingCash={game.startingCash} {tradable} {selectedId} onselect={select} {canBuy} {canSell} {buyHint} onbuy={(id) => quickTrade(id, 'buy')} onsell={(id) => quickTrade(id, 'sell')} />
  </div>

  <main class="layout" class:has-detail={!!selected}>
    <div class="left">
      <section class="card">
        <div class="card-head">
          <h2>Market</h2>
        </div>
        <div class="card-body">
          <MarketTable assets={market.assets} month={market.month} {held} {selectedId} markNew={!lobby} onselect={select} {canBuy} {buyHint} onbuy={(id) => quickTrade(id, 'buy')} />
        </div>
      </section>
    </div>

    <div class="right" bind:this={rightColumn}>
      {#if selected && token}
        <div class="detail-wrap">
          <AssetDetail
            {code}
            {token}
            asset={selected}
            month={market.month}
            {portfolio}
            isNew={!lobby && selected.listedSince === market.month}
            onclose={() => (selectedId = undefined)}
          />
        </div>
      {/if}
    </div>
  </main>

  {#if showWelcome && !finished}
    <Welcome playerName={portfolio.name} startMonth={GAME_START_MONTH} finalMonth={game.finalMonth} {solo} onclose={closeWelcome} />
  {/if}

  {#if ageOpen && !showWelcome}
    {@const ended = previousAge(age)}
    <AgeScreen {age} {ended} review={ages?.ended.find((r) => r.id === ended?.id)} board={board} meId={portfolio.playerId} onclose={closeAge} />
  {/if}

  {#if tradeNote}
    <p class="toast" class:error={tradeNote.error} role="status">{tradeNote.text}</p>
  {/if}

  {#if showFinal && board}
    <div class="overlay" role="dialog" aria-modal="true" aria-label="Final standings">
      <div class="card final">
        <p class="sub">{game.name} · final month {monthName(game.currentMonth)}</p>
        <h1>Final standings</h1>
        <Leaderboard view={board} startingCash={game.startingCash} finalMonth={game.finalMonth} meId={portfolio.playerId} />
        <button class="btn primary" onclick={() => (showFinal = false)}>Close</button>
      </div>
    </div>
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
  .join {
    width: min(420px, 92vw);
    padding: 24px;
    display: grid;
    gap: 14px;
    text-align: left;
  }

  .top {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 16px 32px;
    flex-wrap: wrap;
    padding: 10px 20px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
  }
  .game h1 {
    font-size: clamp(1.7rem, 3.4vw, 2.5rem);
    line-height: 1.1;
    letter-spacing: -0.02em;
  }
  .figures {
    display: flex;
    gap: 10px 30px;
    flex-wrap: wrap;
    margin: 0;
  }
  .figures div {
    display: grid;
  }
  .figures dt {
    font-size: 0.8rem;
    color: var(--ink-2);
  }
  .figures dd {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 650;
    line-height: 1.2;
  }
  .figures .total dd {
    font-size: 1.7rem;
  }
  .figures .income {
    padding-left: 12px;
    box-shadow: inset 3px 0 0 var(--series-income);
  }

  .banners {
    display: grid;
    gap: 10px;
    padding: 0 20px;
    max-width: 1500px;
    margin: 0 auto;
  }
  .banners > :first-child {
    margin-top: 14px;
  }
  .summary {
    padding: 12px 16px;
    border-left: 4px solid var(--accent);
  }
  .summary-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  .summary h2 {
    font-size: 1.05rem;
  }
  .summary ul {
    margin: 6px 0 0;
    padding-left: 18px;
    display: grid;
    gap: 3px;
  }
  .summary .income-line::marker {
    color: var(--series-income);
  }
  .summary .event .sub {
    display: block;
  }

  .brand {
    font-weight: 700;
    color: var(--ink);
    text-decoration: none;
  }
  .age {
    all: unset;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 650;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .age:hover {
    text-decoration: underline;
  }
  .age:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .toast {
    position: fixed;
    left: 50%;
    bottom: 22px;
    transform: translateX(-50%);
    z-index: 30;
    margin: 0;
    padding: 10px 18px;
    border-radius: 999px;
    background: var(--ink);
    color: var(--surface);
    font-weight: 600;
    box-shadow: var(--shadow);
  }
  .toast.error {
    background: var(--danger-ink);
    color: #fff;
  }
  .advance-box {
    display: grid;
    gap: 4px;
    justify-items: center;
    margin: 0 auto;
  }
  .advance-box .btn {
    font-size: 1.05rem;
    padding: 10px 20px;
  }
  .detail-wrap {
    /* leave room for the sticky header when scrolled to */
    scroll-margin-top: 96px;
  }
  .portfolio-wrap {
    display: grid;
    gap: 14px;
    padding: 14px 20px 0;
    max-width: 1500px;
    margin: 0 auto;
  }
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(380px, 1fr);
    gap: 16px;
    padding: 14px 20px 40px;
    max-width: 1500px;
    margin: 0 auto;
    align-items: start;
  }
  .left,
  .right {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
    min-width: 0;
  }
  .right {
    position: sticky;
    top: 84px;
    max-height: calc(100vh - 96px);
    overflow-y: auto;
    padding-bottom: 8px;
    scrollbar-gutter: stable;
  }

  .overlay {
    position: fixed;
    inset: 0;
    z-index: 30;
    background: rgba(0, 0, 0, 0.45);
    display: grid;
    place-items: center;
    padding: 20px;
    overflow: auto;
  }
  .final {
    width: min(640px, 100%);
    padding: 24px;
    display: grid;
    gap: 14px;
  }

  @media (max-width: 1020px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
    .right {
      position: static;
      max-height: none;
      overflow: visible;
      order: -1;
    }
    .top {
      position: static;
    }
    /* On narrow screens the asset panel takes over the screen. */
    .detail-wrap {
      position: fixed;
      inset: 0;
      z-index: 20;
      overflow-y: auto;
      background: var(--page);
      padding: 10px;
    }
  }
</style>
