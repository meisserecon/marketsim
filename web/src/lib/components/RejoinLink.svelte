<script lang="ts">
  import { rejoinLink } from '$lib/api/tokens';

  /** `path` is the page the link opens (`/g/CODE` or `/g/CODE/gm`). */
  let { path, token, gm = false }: { path: string; token: string; gm?: boolean } = $props();

  let status = $state<'idle' | 'copied' | 'manual'>('idle');
  let link = $state('');
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function copy() {
    link = rejoinLink(path, token);
    clearTimeout(timer);
    try {
      await navigator.clipboard.writeText(link);
      status = 'copied';
      timer = setTimeout(() => (status = 'idle'), 8000);
    } catch {
      // No clipboard API, or the browser refused: show the link to copy by hand.
      status = 'manual';
    }
  }
</script>

<div class="rejoin">
  <button class="btn small" type="button" onclick={copy}>Link to come back</button>
  {#if status === 'copied'}
    <p class="notice info" role="status">
      Link copied. Open it on any device to {gm ? 'run the game' : 'return to your portfolio'}. Anyone with this link can {gm ? 'run the game' : 'trade as you'}.
    </p>
  {:else if status === 'manual'}
    <p class="notice info" role="status">
      Copy this link and open it on any device to return. Anyone with this link can act as you.
      <input class="input" readonly value={link} aria-label="Link to come back" onfocus={(e) => e.currentTarget.select()} />
    </p>
  {/if}
</div>

<style>
  .rejoin {
    display: grid;
    justify-items: start;
    gap: 6px;
    margin-top: 4px;
  }
  .rejoin .notice {
    max-width: 34rem;
    margin: 0;
    font-size: 0.85rem;
  }
  .rejoin input {
    display: block;
    width: 100%;
    margin-top: 6px;
  }
</style>
