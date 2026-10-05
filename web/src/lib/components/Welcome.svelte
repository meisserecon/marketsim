<script lang="ts">
  /**
   * The welcome screen: what the game is, how a month works, and the three things it wants to
   * teach. Shown once when a player enters a game.
   */
  import { STARTING_CASH } from '@marketsim/shared';
  import { monthName, usd } from '$lib/format';

  interface Props {
    playerName: string;
    startMonth: string;
    finalMonth: string;
    /** Single-player game: the player advances the clock himself. */
    solo: boolean;
    onclose: () => void;
  }
  let { playerName, startMonth, finalMonth, solo, onclose }: Props = $props();

  const monthIndex = (m: string) => Number(m.slice(0, 4)) * 12 + Number(m.slice(5, 7));
  /** Whole years from the first to the last month. */
  const years = $derived(Math.floor((monthIndex(finalMonth) - monthIndex(startMonth)) / 12));

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="backdrop" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
  <div class="sheet card">
    <p class="brand">Month by Month</p>
    <h1 id="welcome-title">Welcome, {playerName}</h1>
    <p class="lead">
      It is {monthName(startMonth)}. You have {usd(STARTING_CASH, { cents: false })} and {years} years of markets ahead of you, one month at a time.
      Invest it in companies, gold and government bonds, and see what it has become by {monthName(finalMonth)}.
    </p>

    <section>
      <h2>How a month works</h2>
      <ol class="steps">
        <li><strong>Read the news.</strong> Every month brings a few stories: what happened in the world, and what happened to the companies you can buy.</li>
        <li><strong>Decide.</strong> Buy or sell at this month's prices, as often as you like. Each click moves 5% of your portfolio, and you can hold as many investments as you like. Click a company to learn what it does.</li>
        <li><strong>Time moves on.</strong> {solo ? 'When you are ready, press the button at the top to go to the next month.' : 'The game master moves everybody to the next month at the same time.'} Prices change, and dividends are paid into your cash.</li>
      </ol>
    </section>

    <section>
      <h2>Three things this game wants to teach you</h2>
      <p class="sub">No need to keep them secret: knowing them is easy, living by them for {years} years is the hard part.</p>
      <ul class="lessons">
        <li>
          <span class="n">1</span>
          <div>
            <h3>Diversification</h3>
            <p>Don't put all your eggs in one basket. (Unless you know the future.)</p>
          </div>
        </li>
        <li>
          <span class="n">2</span>
          <div>
            <h3>Buy and Hold</h3>
            <p>At average, it is better to be invested than not.</p>
          </div>
        </li>
        <li>
          <span class="n">3</span>
          <div>
            <h3>Historical Awareness</h3>
            <p>Markets are embedded in world history.</p>
          </div>
        </li>
      </ul>
    </section>

    <section class="limits">
      <h2>Limitations</h2>
      <ul>
        <li>You can only buy a handpicked selection of companies, not the whole market. They were chosen with hindsight, because their stories are worth telling.</li>
        <li>The game cannot teach you much about choosing shares by solid measures such as a company's sales and profits: it does not have that data. What you get is prices, dividends and the news.</li>
      </ul>
    </section>

    <div class="go">
      <button class="btn primary" onclick={onclose}>Let's Go</button>
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: color-mix(in srgb, var(--page) 88%, transparent);
    backdrop-filter: blur(6px);
    overflow-y: auto;
    padding: 24px 16px 48px;
    display: grid;
    justify-items: center;
    align-items: start;
  }
  .sheet {
    width: min(760px, 100%);
    padding: 28px 30px 26px;
    display: grid;
    gap: 20px;
  }
  .brand {
    margin: 0;
    font-weight: 750;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.8rem;
    color: var(--accent);
  }
  h1 {
    font-size: clamp(1.8rem, 5vw, 2.6rem);
    line-height: 1.1;
    margin: -12px 0 0;
  }
  .lead {
    font-size: 1.12rem;
    line-height: 1.5;
    margin: -6px 0 0;
    color: var(--ink-2);
  }
  section {
    display: grid;
    gap: 10px;
  }
  h2 {
    font-size: 1.1rem;
  }
  section .sub {
    margin: -4px 0 0;
  }
  .steps {
    margin: 0;
    padding-left: 1.3em;
    display: grid;
    gap: 6px;
    line-height: 1.5;
  }
  .lessons {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 10px;
  }
  .lessons li {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr);
    gap: 14px;
    align-items: start;
    padding: 14px 16px;
    border-radius: 10px;
    background: var(--accent-wash);
  }
  .n {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--accent);
    color: var(--accent-ink);
    font-weight: 750;
    font-size: 1.2rem;
  }
  h3 {
    font-size: 1.05rem;
    margin: 0 0 2px;
  }
  .lessons p {
    margin: 0;
    line-height: 1.5;
  }
  .limits ul {
    margin: 0;
    padding-left: 1.3em;
    display: grid;
    gap: 6px;
    line-height: 1.5;
    color: var(--ink-2);
  }
  .go {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }
  .go .btn {
    font-size: 1.1rem;
    padding: 12px 26px;
  }
</style>
