create table if not exists public.miritmo_user_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.miritmo_user_data enable row level security;

revoke all on table public.miritmo_user_data from anon, authenticated;
grant select, insert, update on table public.miritmo_user_data to authenticated;

drop policy if exists miritmo_user_data_owner on public.miritmo_user_data;
create policy miritmo_user_data_owner
  on public.miritmo_user_data
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
