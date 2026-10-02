-- marketsim database schema (Postgres).
-- Market data is NOT stored here: the server loads data/out/*.json into memory.
-- The database holds games, players, and what players own.

create table games (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,            -- short join code shown to players
  name            text not null,
  status          text not null default 'lobby' check (status in ('lobby', 'running', 'finished')),
  current_month   text not null,                   -- 'YYYY-MM'
  final_month     text not null,
  starting_cash   numeric(20, 6) not null,
  gm_token_hash   text not null,
  created_at      timestamptz not null default now(),
  advanced_at     timestamptz
);

create table players (
  id              uuid primary key default gen_random_uuid(),
  game_id         uuid not null references games (id) on delete cascade,
  name            text not null,
  token_hash      text not null unique,
  cash            numeric(20, 6) not null,
  joined_at       timestamptz not null default now(),
  unique (game_id, name)
);

-- Units held per asset. Cash lives on the player row; zero holdings are deleted, not stored.
create table holdings (
  player_id       uuid not null references players (id) on delete cascade,
  asset_id        text not null,
  units           numeric(30, 12) not null check (units > 0),
  cost            numeric(20, 6) not null default 0,  -- USD paid for these units (average-cost method)
  primary key (player_id, asset_id)
);

-- Account statement: every trade, income payment and corporate event. Mirrors LedgerEntry.
create table ledger (
  id              bigserial primary key,
  player_id       uuid not null references players (id) on delete cascade,
  month           text not null,
  kind            text not null check (kind in ('buy', 'sell', 'income', 'bankruptcy', 'payout', 'conversion')),
  asset_id        text not null,
  units           numeric(30, 12) not null,
  price           numeric(20, 6) not null,
  cash            numeric(20, 6) not null,
  note            text,
  created_at      timestamptz not null default now()
);
create index ledger_player_idx on ledger (player_id, id desc);

-- Month-end value per player, written when the game advances. Feeds equity curves and the leaderboard history.
create table snapshots (
  player_id       uuid not null references players (id) on delete cascade,
  month           text not null,
  total_value     numeric(20, 6) not null,
  cash            numeric(20, 6) not null,
  primary key (player_id, month)
);
