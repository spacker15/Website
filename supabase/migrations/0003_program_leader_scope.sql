-- Phase 3.0 (part 2 of 2): team-scoped role grants + program_leader as super-admin.
--
-- Prereq: 0002_program_leader_enum.sql must have been applied (and committed)
-- before this file runs, because we reference the new 'program_leader' enum value.
--
-- Run after 0002 in the Supabase SQL Editor.

-- ============================================================
-- profile_roles: surrogate PK + nullable team_id
-- ============================================================

alter table public.profile_roles drop constraint profile_roles_pkey;

alter table public.profile_roles
  add column id uuid primary key default gen_random_uuid();

alter table public.profile_roles
  add column team_id uuid references public.teams(id) on delete cascade;

-- Promote pre-existing site-wide head_coach grants to program_leader. They
-- were effectively program leaders under the old model.
update public.profile_roles
  set role = 'program_leader'
  where role = 'head_coach' and team_id is null;

-- Scope rules:
--   program_leader            → team_id must be NULL (site-wide only)
--   head_coach, assistant_coach → team_id must be NOT NULL (team-scoped)
--   parent, volunteer         → either is allowed
alter table public.profile_roles
  add constraint profile_roles_scope_check check (
    case role
      when 'program_leader' then team_id is null
      when 'head_coach' then team_id is not null
      when 'assistant_coach' then team_id is not null
      else true
    end
  );

-- Uniqueness: one global grant per (profile, role) when team_id is null,
-- one per (profile, role, team) when team_id is set.
create unique index profile_roles_unique_global
  on public.profile_roles (profile_id, role)
  where team_id is null;

create unique index profile_roles_unique_team
  on public.profile_roles (profile_id, role, team_id)
  where team_id is not null;

-- ============================================================
-- Helper functions
-- ============================================================

create or replace function public.is_program_leader()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profile_roles
    where profile_id = auth.uid()
      and role = 'program_leader'
  );
$$;

-- True if the caller is a program leader OR is head_coach / assistant_coach
-- of the given team.
create or replace function public.manages_team(target_team uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_program_leader() or exists(
    select 1 from public.profile_roles
    where profile_id = auth.uid()
      and role in ('head_coach', 'assistant_coach')
      and team_id = target_team
  );
$$;

-- True if the caller manages the team that owns the given player.
create or replace function public.manages_player(target_player uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_program_leader() or exists(
    select 1
    from public.players p
    join public.profile_roles pr
      on pr.team_id = p.team_id
      and pr.profile_id = auth.uid()
      and pr.role in ('head_coach', 'assistant_coach')
    where p.id = target_player
  );
$$;

-- Back-compat: is_head_coach() now means "site-wide admin", i.e. program leader.
-- Keeping the name lets existing RLS policies referencing is_head_coach() keep
-- working without churn.
create or replace function public.is_head_coach()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_program_leader();
$$;

-- ============================================================
-- RLS: relax team-scoped policies so team coaches can manage their own team
-- ============================================================

-- teams: program leader can create / delete; team coach can update their team
drop policy if exists "teams_head_coach_update" on public.teams;
create policy "teams_team_manage_update"
  on public.teams for update
  using (public.manages_team(id))
  with check (public.manages_team(id));

-- players: team coach can manage roster for their team
drop policy if exists "players_head_coach_insert" on public.players;
drop policy if exists "players_head_coach_update" on public.players;
drop policy if exists "players_head_coach_delete" on public.players;
create policy "players_team_manage_insert"
  on public.players for insert
  with check (public.manages_team(team_id));
create policy "players_team_manage_update"
  on public.players for update
  using (public.manages_team(team_id))
  with check (public.manages_team(team_id));
create policy "players_team_manage_delete"
  on public.players for delete
  using (public.manages_team(team_id));

-- player_visibility: team coach can edit visibility for their team's players
drop policy if exists "visibility_head_coach_insert" on public.player_visibility;
drop policy if exists "visibility_head_coach_update" on public.player_visibility;
create policy "visibility_team_manage_insert"
  on public.player_visibility for insert
  with check (public.manages_player(player_id));
create policy "visibility_team_manage_update"
  on public.player_visibility for update
  using (public.manages_player(player_id))
  with check (public.manages_player(player_id));

-- player_parents: team coach can manage parent links for their team's players
drop policy if exists "pp_head_coach_select" on public.player_parents;
drop policy if exists "pp_head_coach_insert" on public.player_parents;
drop policy if exists "pp_head_coach_delete" on public.player_parents;
create policy "pp_team_manage_select"
  on public.player_parents for select
  using (public.manages_player(player_id));
create policy "pp_team_manage_insert"
  on public.player_parents for insert
  with check (public.manages_player(player_id));
create policy "pp_team_manage_delete"
  on public.player_parents for delete
  using (public.manages_player(player_id));
