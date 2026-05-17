-- Phase 3.1.2: schools, custom fields, additional addresses.
--
-- Adds:
--   1. `schools` table with a starter list of St. Johns County, FL
--      schools so 'Current school' and 'Zoned HS school' can be
--      dropdowns instead of free text.
--   2. `registration_fields` table letting the program leader add
--      ad-hoc fields to the registration form. Answers are stored in
--      a single jsonb column on `registrations`.
--   3. Address columns on `registrations` for the secondary guardian
--      and emergency contact, plus a custom_field_answers jsonb column.

-- =====================================================
-- schools
-- =====================================================
create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in (
    'public_elementary',
    'public_middle',
    'public_k8',
    'public_high',
    'private',
    'other'
  )),
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index schools_active_idx on public.schools (is_active, kind, display_order);

create trigger schools_set_updated_at
  before update on public.schools
  for each row execute function public.set_updated_at();

alter table public.schools enable row level security;

create policy "schools_public_select"
  on public.schools for select
  using (is_active);

create policy "schools_pl_select"
  on public.schools for select
  using (public.is_program_leader());

create policy "schools_pl_insert"
  on public.schools for insert
  with check (public.is_program_leader());

create policy "schools_pl_update"
  on public.schools for update
  using (public.is_program_leader())
  with check (public.is_program_leader());

create policy "schools_pl_delete"
  on public.schools for delete
  using (public.is_program_leader());

-- Seed: St. Johns County, FL area schools. PL can edit / add via /manage/schools.
insert into public.schools (name, kind, display_order) values
  -- Public high schools
  ('Bartram Trail High School', 'public_high', 10),
  ('Beachside High School', 'public_high', 20),
  ('Creekside High School', 'public_high', 30),
  ('Allen D. Nease High School', 'public_high', 40),
  ('Pedro Menendez High School', 'public_high', 50),
  ('Ponte Vedra High School', 'public_high', 60),
  ('St. Augustine High School', 'public_high', 70),
  ('Tocoi Creek High School', 'public_high', 80),

  -- Public middle schools
  ('Alice B. Landrum Middle School', 'public_middle', 110),
  ('Fruit Cove Middle School', 'public_middle', 120),
  ('Gamble Rogers Middle School', 'public_middle', 130),
  ('Pacetti Bay Middle School', 'public_middle', 140),
  ('R.J. Murray Middle School', 'public_middle', 150),
  ('Switzerland Point Middle School', 'public_middle', 160),

  -- Public K-8 academies
  ('Liberty Pines Academy', 'public_k8', 210),
  ('Mill Creek Academy', 'public_k8', 220),
  ('Patriot Oaks Academy', 'public_k8', 230),
  ('Valley Ridge Academy', 'public_k8', 240),

  -- Public elementary
  ('Cunningham Creek Elementary', 'public_elementary', 310),
  ('Hickory Creek Elementary', 'public_elementary', 320),
  ('Picolata Crossing Elementary', 'public_elementary', 330),
  ('Timberlin Creek Elementary', 'public_elementary', 340),
  ('Wards Creek Elementary', 'public_elementary', 350),

  -- Private
  ('St. Johns Country Day School', 'private', 410),
  ('St. Joseph Academy', 'private', 420),
  ('Cathedral Parish School', 'private', 430),
  ('The Bolles School', 'private', 440),
  ('Episcopal School of Jacksonville', 'private', 450),
  ('Trinity Christian Academy', 'private', 460),

  -- Other
  ('Florida Virtual School', 'other', 510),
  ('Homeschool', 'other', 520);


-- =====================================================
-- registration_fields (PL-managed custom fields)
-- =====================================================
create table public.registration_fields (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  -- Stable string used as the jsonb key on registrations.custom_field_answers.
  -- Lowercase letters, digits, underscores only.
  field_key text not null unique check (field_key ~ '^[a-z][a-z0-9_]*$'),
  help_text text,
  kind text not null check (kind in ('text', 'textarea', 'number', 'select', 'checkbox')),
  -- For kind='select': jsonb array of strings, e.g. ["Returning player","New player"].
  options jsonb,
  is_required boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index registration_fields_active_idx
  on public.registration_fields (is_active, display_order);

create trigger registration_fields_set_updated_at
  before update on public.registration_fields
  for each row execute function public.set_updated_at();

alter table public.registration_fields enable row level security;

create policy "rf_public_select"
  on public.registration_fields for select
  using (is_active);

create policy "rf_pl_select"
  on public.registration_fields for select
  using (public.is_program_leader());

create policy "rf_pl_insert"
  on public.registration_fields for insert
  with check (public.is_program_leader());

create policy "rf_pl_update"
  on public.registration_fields for update
  using (public.is_program_leader())
  with check (public.is_program_leader());

create policy "rf_pl_delete"
  on public.registration_fields for delete
  using (public.is_program_leader());


-- =====================================================
-- registrations: new columns
-- =====================================================
alter table public.registrations
  -- Schools (structured replacements for player_school)
  add column current_school_id uuid references public.schools(id) on delete set null,
  add column current_school_other text,
  add column zoned_high_school_id uuid references public.schools(id) on delete set null,
  add column zoned_high_school_other text,

  -- Secondary guardian address
  add column secondary_guardian_address_line1 text,
  add column secondary_guardian_address_line2 text,
  add column secondary_guardian_city text,
  add column secondary_guardian_state text,
  add column secondary_guardian_zip text,

  -- Emergency contact address
  add column emergency_contact_address_line1 text,
  add column emergency_contact_address_line2 text,
  add column emergency_contact_city text,
  add column emergency_contact_state text,
  add column emergency_contact_zip text,

  -- Answers to PL-defined custom fields, keyed by field_key
  add column custom_field_answers jsonb not null default '{}'::jsonb;
