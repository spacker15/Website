import Link from "next/link";
import { isProgramLeader, managesAnyTeam, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  // Program leaders see every team; team coaches see only the teams they manage.
  const managedTeamIds = user.roles
    .filter((r) => r.role === "head_coach" || r.role === "assistant_coach")
    .map((r) => r.teamId)
    .filter((id): id is string => !!id);

  const teamsQuery = isProgramLeader(user)
    ? supabase.from("teams").select("id, name, season").order("name")
    : managedTeamIds.length > 0
      ? supabase
          .from("teams")
          .select("id, name, season")
          .in("id", managedTeamIds)
          .order("name")
      : null;

  const { data: teams } = teamsQuery ? await teamsQuery : { data: null };

  const showManageCard = managesAnyTeam(user);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-purple-600">
        Dashboard
      </p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
        Welcome back{user.profile.full_name ? `, ${user.profile.full_name.split(" ")[0]}` : ""}
      </h1>

      {user.roles.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-neutral-300 p-6 text-sm text-ink-muted">
          You don&apos;t have any roles assigned yet. A program leader can grant
          you access. In the meantime, you can still update your profile.
        </div>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card title="Your profile" href="/profile">
          Update your name, contact info, and avatar.
        </Card>
        {showManageCard && (
          <Card title="Manage teams" href="/manage/teams">
            Create teams, manage rosters, and control per-player visibility.
          </Card>
        )}
        {isProgramLeader(user) && (
          <Card title="People & permissions" href="/manage/people">
            Grant head coaches, assistant coaches, parents, and volunteers
            access — site-wide or scoped to a single team.
          </Card>
        )}
      </section>

      {teams && teams.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-ink">
            {isProgramLeader(user) ? "All teams" : "Your teams"}
          </h2>
          <ul className="mt-3 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
            {teams.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="font-medium text-ink">{t.name}</p>
                  {t.season && <p className="text-xs text-ink-subtle">{t.season}</p>}
                </div>
                <Link href={`/manage/teams/${t.id}/players`}>
                  <Button size="sm" variant="outline">Manage</Button>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Card({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-neutral-200 bg-white p-6 transition-colors hover:border-brand-teal-200"
    >
      <h3 className="font-display text-lg font-semibold text-ink group-hover:text-brand-teal-700">
        {title}
      </h3>
      <p className="mt-1 text-sm text-ink-muted">{children}</p>
    </Link>
  );
}
