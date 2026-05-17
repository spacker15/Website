# Supabase setup (Phase 2)

One-time configuration required to make auth, profiles, teams, and rosters work end-to-end.

## 1. Apply the database migration

Open the Supabase SQL Editor for this project:

`https://supabase.com/dashboard/project/inzbmjpylrukhoqiklms/sql/new`

Paste the contents of `supabase/migrations/0001_phase2_core.sql` and run it. This creates:

- Tables: `profiles`, `profile_roles`, `teams`, `players`, `player_visibility`, `player_parents`
- Enums: `user_role`, `player_position`
- Triggers: auto-create profile on signup, auto-create visibility on player insert, `updated_at` maintenance
- Helper functions: `has_role`, `is_head_coach`
- Row Level Security policies for all six tables

A migration only needs to run once. Re-running will fail because the types/tables already exist — that's expected.

### Phase 3.0 — Program Leader

After 0001 is applied, run the two phase-3 migrations **separately** (not in a single paste — PostgreSQL won't let you ALTER an enum and use the new value in the same transaction):

1. Paste `supabase/migrations/0002_program_leader_enum.sql` and Run.
2. Then paste `supabase/migrations/0003_program_leader_scope.sql` and Run.

Together they:

- Add a `program_leader` value to `user_role` (super-admin)
- Add a nullable `team_id` to `profile_roles` so roles can be scoped to a team
- Migrate existing site-wide `head_coach` rows to `program_leader`
- Add helper functions `is_program_leader()`, `manages_team(team_id)`, `manages_player(player_id)`
- Tighten RLS so team coaches can manage just their own team's roster, while program leaders manage everything

Then run `supabase/migrations/0004_registration_windows.sql` for the registration foundation:

- New table `registration_windows` (name, opens_at, closes_at, fee_cents, is_active)
- Public can read active windows (used by the homepage banner)
- Only program leaders can create / edit / delete windows

Then run `supabase/migrations/0005_registrations.sql` for parent registration submissions:

- New table `registrations` (parent and player snapshots, status workflow, fee snapshot, Stripe fields stubbed for phase 3.2, approval fields stubbed for phase 3.3)
- Parents can see / cancel only their own pending submissions
- Program leaders can see and manage every submission

## 2. Set environment variables

### In Vercel (Production, Preview, Development)

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://inzbmjpylrukhoqiklms.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon `public` key from Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key from same page — **server-only**, never expose to client |
| `BOOTSTRAP_PROGRAM_LEADER_EMAILS` | comma-separated list of emails that auto-receive `program_leader` role on first sign-in. The old name `BOOTSTRAP_HEAD_COACH_EMAILS` is still read as a fallback. |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | already set in Phase 1 |
| `NEXT_PUBLIC_SITE_URL` | the canonical site URL (e.g. `https://creeksgirlslacrosse.com` once DNS is live, or the current `*.vercel.app`) |

### Locally (`.env.local`, gitignored)

Same as above, but leave `SUPABASE_SERVICE_ROLE_KEY` blank if you don't want the bootstrap path to run from your local dev — it'll still run in Vercel.

## 3. Enable auth providers

Supabase Dashboard → Authentication → Providers:

- **Email** — enable. Toggle "Confirm email" ON for production; OFF for dev makes signup faster.
- **Magic Link** — enabled by default; verify it's on.
- Google OAuth — leave disabled for Phase 2.

## 4. Configure auth email sending (Gmail SMTP)

Supabase Dashboard → Authentication → Settings → SMTP Settings:

| Field | Value |
| --- | --- |
| Sender email | `creeksgirlslacrosse@gmail.com` |
| Sender name | `Creek's Girls Lacrosse` |
| Host | `smtp.gmail.com` |
| Port | `465` |
| Username | `creeksgirlslacrosse@gmail.com` |
| Password | the Gmail App Password from Phase 1 |
| Minimum interval | `60` (seconds; protects against accidental spam) |

Enable "Use custom SMTP" and save. Test by triggering a magic link.

## 5. Configure redirect URLs

Supabase Dashboard → Authentication → URL Configuration:

- Site URL: `https://<your-vercel-domain>` (will become `https://creeksgirlslacrosse.com` after DNS cutover)
- Redirect URLs (one per line):
  - `https://<vercel-prod-domain>/login/callback`
  - `https://*-spacker15s-projects.vercel.app/login/callback` (Vercel previews)
  - `http://localhost:3000/login/callback` (local dev)

## 6. First head coach sign-in

The two bootstrap emails (`Meganpackerc@gmail.com`, `Sean.packer15@gmail.com`) will:

1. Visit `/login`, sign up with email + password (or use a magic link).
2. Confirm email if "Confirm email" is on.
3. After their first authenticated request, the app reads `BOOTSTRAP_HEAD_COACH_EMAILS`, sees the match, and inserts a `head_coach` row via the service role client.
4. Refresh — the "Manage teams" tab now shows in the member nav.

If bootstrap doesn't take effect, check Vercel logs for an error from the service-role insert. The most likely cause is a missing `SUPABASE_SERVICE_ROLE_KEY` in Vercel.

## Granting other roles

Once a head coach is in place, additional roles are granted by inserting into `profile_roles` (currently via the SQL Editor; a UI lands in a later phase). Example:

```sql
insert into public.profile_roles (profile_id, role)
select id, 'assistant_coach' from public.profiles
where lower(email) = 'someone@example.com';
```
