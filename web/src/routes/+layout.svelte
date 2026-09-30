<script lang="ts">
  import '../app.css';
  import { MOCK } from '$lib/api';

  let { children } = $props();
</script>

{#if MOCK}
  <div class="mock" role="note">Mock mode: no server. Games live in this browser only.</div>
{/if}
{@render children()}

<style>
  .mock {
    background: var(--warn-wash);
    color: var(--warn-ink);
    font-size: 0.8rem;
    text-align: center;
    padding: 3px 8px;
  }
</style>
