-- ModelLab leaderboard schema (Supabase / Postgres). Run once in the SQL editor.
-- Trust model: the browser can only INSERT an entry. Entry prices are set by a trigger from
-- price_snapshots, which only the service role (scripts/push_prices.py) can write. Clients cannot read
-- owner_hash or edit/delete rows.

create table if not exists price_snapshots (
  ticker text primary key,
  price numeric not null check (price > 0),
  as_of date not null,
  updated_at timestamptz not null default now()
);

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  handle text not null check (handle ~ '^[A-Za-z0-9_]{3,20}$'),
  label text not null check (char_length(label) <= 40),
  model_id text not null check (char_length(model_id) <= 30),
  holdings jsonb not null,
  entry_prices jsonb not null default '{}'::jsonb,
  price_asof date,
  owner_hash text not null,
  joined_at timestamptz not null default now()
);
create unique index if not exists entries_handle_ci on entries (lower(handle));

create or replace function entries_before_insert() returns trigger language plpgsql security definer as $$
declare h jsonb; p numeric; ep jsonb := '{}'::jsonb; asof date; n int := 0; tot numeric := 0;
begin
  if jsonb_typeof(new.holdings) <> 'array' or jsonb_array_length(new.holdings) not between 1 and 12 then
    raise exception 'holdings must be 1-12 items';
  end if;
  for h in select * from jsonb_array_elements(new.holdings) loop
    select price, as_of into p, asof from price_snapshots where ticker = (h->>0);
    if p is null then raise exception 'no price for %', (h->>0); end if;
    if (h->>1)::numeric <= 0 then raise exception 'bad weight'; end if;
    tot := tot + (h->>1)::numeric;
    ep := ep || jsonb_build_object(h->>0, p);
    n := n + 1;
  end loop;
  select price into p from price_snapshots where ticker = 'SPY';
  if p is not null then ep := ep || jsonb_build_object('SPY', p); end if;
  new.entry_prices := ep;
  new.price_asof := asof;
  new.joined_at := now();
  return new;
end $$;

drop trigger if exists entries_bi on entries;
create trigger entries_bi before insert on entries for each row execute function entries_before_insert();

-- Public view without owner_hash
create or replace view leaderboard_public as
  select id, handle, label, model_id, holdings, entry_prices, price_asof, joined_at from entries;

alter table entries enable row level security;
alter table price_snapshots enable row level security;
drop policy if exists entries_insert on entries;
create policy entries_insert on entries for insert to anon with check (true);

revoke all on entries from anon, authenticated;
grant insert (handle, label, model_id, holdings, owner_hash) on entries to anon;
revoke all on price_snapshots from anon, authenticated;
-- the view runs with owner rights, so anon can read it without touching the table
alter view leaderboard_public set (security_invoker = false);
grant select on leaderboard_public to anon;
