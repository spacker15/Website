-- Phase 3.0 (part 1 of 2): add the program_leader role to the user_role enum.
--
-- This MUST be run separately from part 2: PostgreSQL allows ALTER TYPE ADD
-- VALUE inside a transaction, but does not allow that new value to be used
-- in the same transaction. Run this file first, then 0003_program_leader_scope.sql.

alter type public.user_role add value if not exists 'program_leader' before 'head_coach';
