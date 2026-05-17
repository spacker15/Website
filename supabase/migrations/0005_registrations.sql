-- Phase 3.1: parent registration submissions.
--
-- A `registration` is a parent's request to enroll one player in an open
-- registration window. It captures snapshots of the parent and player info
-- at submission time so the registration is self-contained even if the
-- parent's profile changes later. The real `players` row is created when a
-- coach approves the registration (phase 3.3).

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  window_id uuid not null references public.registration_windows(id) on delete restrict,

  -- Parent (must be a signed-in user)
  parent_profile_id uuid not null references public.profiles(id) on delete cascade,
  parent_full_name text not null,
  parent_email text not null,
  parent_phone text,

  -- Player snapshot
  player_first_name text not null,
  player_last_name text not null,
  player_date_of_birth date,
  player_grade text,
  player_position public.player_position not null default 'unspecified',
  player_jersey_pref text,

  -- Optional preferred team; the program leader can reassign on approval
  requested_team_id uuid references public.teams(id) on delete set null,

  -- Free-form note from the parent
  notes text,

  -- Workflow status
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'approved', 'rejected', 'cancelled')),

  fee_cents integer not null check (fee_cents >= 0),

  -- Filled by the Stripe webhook in phase 3.2
  stripe_session_id text,
  stripe_payment_intent_id text,
  paid_at timestamptz,

  -- Filled when a coach approves / rejects (phase 3.3)
  approved_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  rejected_reason text,
  resulting_player_id uuid references public.players(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index registrations_window_idx on public.registrations (window_id, status);
create index registrations_parent_idx on public.registrations (parent_profile_id, created_at desc);

create trigger registrations_set_updated_at
  before update on public.registrations
  for each row execute function public.set_updated_at();

alter table public.registrations enable row level security;

-- Parents see their own registrations
create policy "registrations_owner_select"
  on public.registrations for select
  using (auth.uid() = parent_profile_id);

-- Program leaders see everything
create policy "registrations_pl_select"
  on public.registrations for select
  using (public.is_program_leader());

-- A signed-in user can submit a registration for themselves
create policy "registrations_self_insert"
  on public.registrations for insert
  with check (auth.uid() = parent_profile_id);

-- A parent can cancel (delete) their own row only while still pending_payment
create policy "registrations_owner_cancel_pending"
  on public.registrations for delete
  using (
    auth.uid() = parent_profile_id and status = 'pending_payment'
  );

-- A parent can update a few fields on their own pending_payment row (e.g.,
-- fix a typo before paying). The status workflow itself is locked down by
-- only allowing PL to write status transitions in app code.
create policy "registrations_owner_update_pending"
  on public.registrations for update
  using (auth.uid() = parent_profile_id and status = 'pending_payment')
  with check (auth.uid() = parent_profile_id and status = 'pending_payment');

-- Program leaders can manage every registration
create policy "registrations_pl_update"
  on public.registrations for update
  using (public.is_program_leader())
  with check (public.is_program_leader());

create policy "registrations_pl_delete"
  on public.registrations for delete
  using (public.is_program_leader());
