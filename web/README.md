# marketsim web

SvelteKit (Svelte 5, TypeScript) single-page app, built with `@sveltejs/adapter-static` into
`web/build`. In production the Node server serves `web/build` and the API from the same
origin under `/api`.

Run everything from the repository root (npm workspaces).

```
npm install

npm run dev -w web          # dev server; /api is proxied to http://localhost:3000
npm run dev:mock -w web     # dev server without a backend (see below)
npm run check -w web        # svelte-check
npm run build -w web        # production build into web/build
npm run build:mock -w web   # static demo build that contains the mock and the data
```

## Mock mode

`VITE_MOCK=1` (set by `--mode mock` through `.env.mock`, or in the environment) replaces the
HTTP client with `src/lib/api/mock.ts`. The mock loads `data/out/*.json`, builds a `Market`
from `@marketsim/shared` and answers every route with the real engine (`applyTrade`,
`advanceMonth`, `portfolioValue`, `nameAt`), following the no-lookahead rule like the server.

- Games are stored in `localStorage` and events travel over a `BroadcastChannel`, so a game
  master tab and a player tab **in the same browser** share a game. Other browsers do not.
- Each new game gets three buy-and-hold bots so the leaderboard is not empty.
- The flag is a compile-time constant (`__MOCK__`, see `vite.config.ts`); a normal build
  contains neither the mock nor the data files.

## Layout

```
src/lib/api/types.ts    Api interface (one method per route of shared/src/api.ts), ApiFailure
src/lib/api/http.ts     fetch + EventSource implementation
src/lib/api/mock.ts     in-browser implementation
src/lib/api/tokens.ts   player / game master tokens in localStorage, keyed by game code
src/lib/components/     Chart (hand-written SVG), MarketTable, AssetDetail, TradeForm, ...
src/routes/+page.svelte             landing: create or join
src/routes/g/[code]/+page.svelte    player view
src/routes/g/[code]/gm/+page.svelte game master view
```
