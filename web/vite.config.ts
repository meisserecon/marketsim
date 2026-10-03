import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { reviewPlugin } from './review-plugin';

export default defineConfig(({ mode }) => {
  // VITE_MOCK=1 (from the environment, or from .env.mock via `--mode mock`) swaps the HTTP
  // client for the in-browser mock. It is turned into a compile-time constant so that a
  // normal build drops the mock and the market data files entirely.
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const mock = env.VITE_MOCK === '1';

  return {
    // The review plugin only runs under ; it reads and writes files in ../data.
    plugins: [sveltekit(), reviewPlugin()],
    define: { __MOCK__: JSON.stringify(mock) },
    server: {
      proxy: { '/api': 'http://localhost:3000' },
      // The mock imports ../data/out/*.json, and @marketsim/shared lives in ../shared.
      fs: { allow: ['..'] }
    }
  };
});
