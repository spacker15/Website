-- Phase 3.0: registration windows.
--
-- A registration window defines when parents can register players for a
-- season, and how much the registration fee is. Parent-facing registration
-- and payment land in subsequent migrations.

create table public.registration_windows (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  opens_at timestamptz not null,
  closes_at timestamptz not null,
  fee_cents integer not null check (fee_cents >= 0),
  currency text not null default 'usd',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint window_closes_after_opens check (closes_at > opens_at)
);

create index registration_windows_active_idx
  on public.registration_windows (is_active, opens_at);

create trigger registration_windows_set_updated_at
  before update on public.registration_windows
  for each row execute function public.set_updated_at();

alter table public.registration_windows enable row level security;

-- Public can read active windows (homepage banner, public /register page later).
create policy "registration_windows_public_select"
  on public.registration_windows for select
  using (is_active);

-- Program leaders also see inactive/archived windows in /manage.
create policy "registration_windows_pl_select"
  on public.registration_windows for select
  using (public.is_program_leader());

-- Only program leaders can create / edit / delete windows.
create policy "registration_windows_pl_insert"
  on public.registration_windows for insert
  with check (public.is_program_leader());
create policy "registration_windows_pl_update"
  on public.registration_windows for update
  using (public.is_program_leader())
  with check (public.is_program_leader());
create policy "registration_windows_pl_delete"
  on public.registration_windows for delete
  using (public.is_program_leader());
