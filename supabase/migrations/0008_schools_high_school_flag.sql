-- Phase 3.1.3: fix zoned HS dropdown + add missing private high schools.
--
-- The zoned HS dropdown currently shows every private school, including
-- Cathedral Parish (K-8 only). Adds an explicit `is_high_school` flag so
-- the dropdown can filter precisely, and seeds the Catholic / Christian
-- private HSs in the St. Johns / South Jax area.

alter table public.schools
  add column is_high_school boolean not null default false;

-- All currently-seeded public_high rows do offer HS
update public.schools
  set is_high_school = true
  where kind = 'public_high';

-- Most seeded private schools offer HS (Bolles K-12, Episcopal 6-12,
-- St. Joseph Academy 9-12, St. Johns Country Day K-12, Trinity K-12).
-- Cathedral Parish is K-8 and should NOT be in the zoned HS dropdown.
update public.schools
  set is_high_school = true
  where kind = 'private'
    and name in (
      'St. Johns Country Day School',
      'St. Joseph Academy',
      'The Bolles School',
      'Episcopal School of Jacksonville',
      'Trinity Christian Academy'
    );

-- Homeschool and FL Virtual School can be a HS placement
update public.schools
  set is_high_school = true
  where kind = 'other';

-- Add Providence + the other commonly-attended private HSs nearby
insert into public.schools (name, kind, is_high_school, display_order) values
  ('Providence School of Jacksonville', 'private', true, 415),
  ('Bishop Kenny High School', 'private', true, 425),
  ('Bishop John J. Snyder High School', 'private', true, 435),
  ('Christ''s Church Academy', 'private', true, 445),
  ('Foundation Academy', 'private', true, 455),
  ('University Christian School', 'private', true, 465);
