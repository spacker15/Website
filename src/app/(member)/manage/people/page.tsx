import { requireProgramLeader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { GrantForm } from "./grant-form";
import { GrantsTable } from "./grants-table";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  await requireProgramLeader();
  const supabase = await createClient();

  const [{ data: grantsRaw }, { data: profiles }, { data: teams }] =
    await Promise.all([
      supabase
        .from("profile_roles")
        .select("id, role, team_id, created_at, profile_id")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, email"),
      supabase.from("teams").select("id, name").order("name"),
    ]);

  const profileEmail = new Map((profiles ?? []).map((p) => [p.id, p.email]));
  const teamName = new Map((teams ?? []).map((t) => [t.id, t.name]));

  const grants = (grantsRaw ?? []).map((r) => ({
    id: r.id,
    role: r.role,
    team_id: r.team_id,
    created_at: r.created_at,
    profile_email: profileEmail.get(r.profile_id) ?? "(unknown)",
    team_name: r.team_id ? (teamName.get(r.team_id) ?? "(deleted team)") : null,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-purple-600">
        Program leader
      </p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
        People &amp; permissions
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Grant access by email. Program leaders run the whole program. Head and
        assistant coaches manage a single team&apos;s roster. Parents and
        volunteers can be linked to a team or left site-wide.
      </p>

      <section className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-ink">
          Grant a role
        </h2>
        <GrantForm teams={teams ?? []} />
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">
          Current grants ({grants.length})
        </h2>
        <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <GrantsTable grants={grants} />
        </div>
      </section>
    </div>
  );
}
