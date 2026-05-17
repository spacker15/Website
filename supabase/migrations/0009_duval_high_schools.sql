-- Phase 3.1.4: add Duval County public high schools near the St. Johns line.
--
-- Some St. Johns players are zoned for Duval HSs (Mandarin, Atlantic Coast,
-- Sandalwood). Adding them so the zoned HS dropdown covers those cases.

insert into public.schools (name, kind, is_high_school, display_order) values
  ('Mandarin High School', 'public_high', true, 90),
  ('Atlantic Coast High School', 'public_high', true, 95),
  ('Sandalwood High School', 'public_high', true, 100);
