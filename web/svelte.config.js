import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // SPA: every route is rendered in the browser; the server serves index.html for unknown paths.
    adapter: adapter({ pages: 'build', assets: 'build', fallback: 'index.html' })
  }
};

export default config;
