-- gladna.joz Organizer — Supabase setup
-- Run this once in your Supabase project: SQL Editor -> New query -> paste -> Run.
--
-- It creates a single-row table that holds the whole app's data as JSON, which
-- matches how the app saves (one load / one save of everything).

create table if not exists public.app_data (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_data enable row level security;

-- Personal single-user app: allow the public (anon) key full access to this
-- table. The anon key ships in the app; anyone who has your app URL + key could
-- read/write this data, so treat the link as private. (We can add a PIN or
-- proper login later if you want a lock on it.)
drop policy if exists "anon full access" on public.app_data;
create policy "anon full access"
  on public.app_data
  for all
  to anon
  using (true)
  with check (true);
