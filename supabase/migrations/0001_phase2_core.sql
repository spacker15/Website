-- Phase 2: profiles, roles, teams, players, visibility, parent links
-- Run in Supabase Dashboard → SQL Editor (https://supabase.com/dashboard/project/<ref>/sql/new).

-- ============================================================
-- ENUMS
-- ============================================================

create type public.user_role as enum (
  'head_coach',
  'assistant_coach',
  'parent',
  'volunteer'
);

create type public.player_position as enum (
  'attack',
  'midfield',
  'defense',
  'goalie',
  'unspecified'
);

-- ============================================================
-- TABLES
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_email_idx on public.profiles (lower(email));

create table public.profile_roles (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.user_role not null,
  created_at timestamptz not null default now(),
  primary key (profile_id, role)
);
create index profile_roles_role_idx on public.profile_roles (role);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  season text,
  age_group text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  jersey text,
  position public.player_position not null default 'unspecified',
  grade text,
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index players_team_idx on public.players (team_id);

create table public.player_visibility (
  player_id uuid primary key references public.players(id) on delete cascade,
  show_name boolean not null default true,
  show_jersey boolean not null default true,
  show_position boolean not null default true,
  show_grade boolean not null default true,
  show_photo boolean not null default true,
  show_parents boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.player_parents (
  player_id uuid not null references public.players(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (player_id, profile_id)
);
create index player_parents_profile_idx on public.player_parents (profile_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger teams_set_updated_at
  before update on public.teams
  for each row execute function public.set_updated_at();

create trigger players_set_updated_at
  before update on public.players
  for each row execute function public.set_updated_at();

create trigger player_visibility_set_updated_at
  before update on public.player_visibility
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a Supabase auth.users row is inserted
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-create the visibility row for each new player (all toggles default true)
create or replace function public.handle_new_player()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.player_visibility (player_id) values (new.id)
  on conflict (player_id) do nothing;
  return new;
end;
$$;

create trigger on_player_created
  after insert on public.players
  for each row execute function public.handle_new_player();

-- ============================================================
-- HELPER FUNCTIONS (security definer to bypass caller RLS safely)
-- ============================================================

create or replace function public.has_role(target_role public.user_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profile_roles
    where profile_id = auth.uid()
      and profile_roles.role = target_role
  );
$$;

create or replace function public.is_head_coach()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('head_coach');
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles         enable row level security;
alter table public.profile_roles    enable row level security;
alter table public.teams            enable row level security;
alter table public.players          enable row level security;
alter table public.player_visibility enable row level security;
alter table public.player_parents   enable row level security;

-- profiles: self read/update; head_coach can read all
create policy "profiles_self_select"        on public.profiles for select using (auth.uid() = id);
create policy "profiles_head_coach_select"  on public.profiles for select using (public.is_head_coach());
create policy "profiles_self_update"        on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- profile_roles: self read, head_coach manage
create policy "roles_self_select"           on public.profile_roles for select using (profile_id = auth.uid());
create policy "roles_head_coach_select"     on public.profile_roles for select using (public.is_head_coach());
create policy "roles_head_coach_insert"     on public.profile_roles for insert with check (public.is_head_coach());
create policy "roles_head_coach_delete"     on public.profile_roles for delete using (public.is_head_coach());

-- teams: public read, head_coach manage
create policy "teams_public_select"         on public.teams for select using (true);
create policy "teams_head_coach_insert"     on public.teams for insert with check (public.is_head_coach());
create policy "teams_head_coach_update"     on public.teams for update using (public.is_head_coach()) with check (public.is_head_coach());
create policy "teams_head_coach_delete"     on public.teams for delete using (public.is_head_coach());

-- players: public read, head_coach manage
create policy "players_public_select"       on public.players for select using (true);
create policy "players_head_coach_insert"   on public.players for insert with check (public.is_head_coach());
create policy "players_head_coach_update"   on public.players for update using (public.is_head_coach()) with check (public.is_head_coach());
create policy "players_head_coach_delete"   on public.players for delete using (public.is_head_coach());

-- player_visibility: public read, head_coach manage
create policy "visibility_public_select"    on public.player_visibility for select using (true);
create policy "visibility_head_coach_insert" on public.player_visibility for insert with check (public.is_head_coach());
create policy "visibility_head_coach_update" on public.player_visibility for update using (public.is_head_coach()) with check (public.is_head_coach());

-- player_parents: head_coach manage; parents see their own links
create policy "pp_head_coach_select"        on public.player_parents for select using (public.is_head_coach());
create policy "pp_self_select"              on public.player_parents for select using (profile_id = auth.uid());
create policy "pp_head_coach_insert"        on public.player_parents for insert with check (public.is_head_coach());
create policy "pp_head_coach_delete"        on public.player_parents for delete using (public.is_head_coach());
