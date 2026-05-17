-- Phase 3.1.1: full guardian/player info + electronic waivers.
--
-- Extends `registrations` with the full set of fields a lacrosse program
-- typically collects (address, secondary guardian, emergency contact, USA
-- Lacrosse membership, multiple jersey preferences, sizes, experience,
-- medical notes, school).
--
-- Adds a `waivers` table the program leader edits, and a
-- `registration_waivers` table that snapshots the exact text the parent
-- signed for each waiver (so future waiver edits don't change historical
-- signatures).
--
-- All new columns on `registrations` are nullable so existing rows aren't
-- invalidated. The app form enforces which ones are required.

-- =====================================================
-- registrations: new columns
-- =====================================================
alter table public.registrations
  -- Primary guardian extras
  add column parent_relationship text,
  add column parent_address_line1 text,
  add column parent_address_line2 text,
  add column parent_city text,
  add column parent_state text,
  add column parent_zip text,

  -- Secondary guardian (optional)
  add column secondary_guardian_full_name text,
  add column secondary_guardian_email text,
  add column secondary_guardian_phone text,
  add column secondary_guardian_relationship text,

  -- Emergency contact (required by app validation)
  add column emergency_contact_name text,
  add column emergency_contact_phone text,
  add column emergency_contact_relationship text,

  -- Player extras
  add column player_school text,
  add column player_usa_lacrosse_member boolean not null default false,
  add column player_usa_lacrosse_number text,
  add column player_jersey_pref_2 text,
  add column player_jersey_pref_3 text,
  add column player_tshirt_size text,
  add column player_pinnie_size text,
  add column player_years_experience integer check (player_years_experience is null or player_years_experience >= 0),
  add column player_medical_notes text;

-- Rename the existing single-jersey field for clarity
alter table public.registrations rename column player_jersey_pref to player_jersey_pref_1;


-- =====================================================
-- waivers: program-leader-managed templates
-- =====================================================
create table public.waivers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  version integer not null default 1,
  is_required boolean not null default true,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index waivers_active_order_idx on public.waivers (is_active, display_order);

create trigger waivers_set_updated_at
  before update on public.waivers
  for each row execute function public.set_updated_at();

alter table public.waivers enable row level security;

-- Public can read active waivers (so the registration form can show them)
create policy "waivers_public_select"
  on public.waivers for select
  using (is_active);

-- Program leaders see archived ones too
create policy "waivers_pl_select"
  on public.waivers for select
  using (public.is_program_leader());

create policy "waivers_pl_insert"
  on public.waivers for insert
  with check (public.is_program_leader());

create policy "waivers_pl_update"
  on public.waivers for update
  using (public.is_program_leader())
  with check (public.is_program_leader());

create policy "waivers_pl_delete"
  on public.waivers for delete
  using (public.is_program_leader());


-- =====================================================
-- registration_waivers: snapshotted signatures
-- =====================================================
create table public.registration_waivers (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  waiver_id uuid not null references public.waivers(id) on delete restrict,
  -- snapshots so future edits to the waiver text don't change history
  waiver_version integer not null,
  waiver_title_snapshot text not null,
  waiver_body_snapshot text not null,
  signed_by_name text not null,
  signed_at timestamptz not null default now(),
  unique (registration_id, waiver_id)
);

create index registration_waivers_reg_idx on public.registration_waivers (registration_id);

alter table public.registration_waivers enable row level security;

-- Parents see their own signatures
create policy "rw_owner_select"
  on public.registration_waivers for select
  using (
    exists(
      select 1 from public.registrations r
      where r.id = registration_waivers.registration_id
        and r.parent_profile_id = auth.uid()
    )
  );

-- Parents can sign waivers on their own registration
create policy "rw_owner_insert"
  on public.registration_waivers for insert
  with check (
    exists(
      select 1 from public.registrations r
      where r.id = registration_waivers.registration_id
        and r.parent_profile_id = auth.uid()
    )
  );

-- Program leaders see all signatures
create policy "rw_pl_select"
  on public.registration_waivers for select
  using (public.is_program_leader());


-- =====================================================
-- Seed three standard waivers (edit any time at /manage/waivers)
-- =====================================================
insert into public.waivers (title, body, display_order, is_required) values
  (
    'Liability waiver',
    'I, the undersigned parent or legal guardian, acknowledge that participation in lacrosse involves inherent risks of injury, including but not limited to sprains, fractures, concussions, and other serious injuries. I voluntarily assume all such risks on behalf of my player. In consideration of my player being permitted to participate, I hereby release, waive, and discharge Creek''s Girls Lacrosse, its coaches, volunteers, officers, and affiliates from any and all liability, claims, demands, or causes of action arising out of or related to any loss, damage, or injury sustained while participating in the program. By signing below, I confirm that I have read, understood, and agreed to this waiver on behalf of my player.',
    1,
    true
  ),
  (
    'Photo and video release',
    'I grant Creek''s Girls Lacrosse permission to photograph and/or video record my player during practices, games, team events, and other program activities, and to use those images and recordings in materials including the team website, social media accounts, news articles, promotional flyers, and printed publications. No compensation will be provided for such use. I understand that I may revoke this consent at any time by contacting the program leader in writing.',
    2,
    true
  ),
  (
    'Code of conduct',
    'I and my player agree to:

- Respect coaches, officials, teammates, and opponents at all times
- Attend practices and games on time and prepared with appropriate equipment
- Communicate absences in advance whenever possible
- Refrain from physical altercations, profanity, and unsportsmanlike behavior
- Support the team and program in a positive manner, both on and off the field

I understand that failure to abide by this code may result in suspension or removal from the program at the discretion of the coaches and program leader.',
    3,
    true
  );
