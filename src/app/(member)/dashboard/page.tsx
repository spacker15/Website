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

  const { data: myRegistrations } = await supabase
    .from("registrations")
    .select("id, window_id, player_first_name, player_last_name, status, fee_cents, created_at")
    .eq("parent_profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

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
          <Card title="Registration windows" href="/manage/registration">
            Open and close registration for a season, set the fee, and watch
            sign-ups roll in.
          </Card>
        )}
        {isProgramLeader(user) && (
          <Card title="Custom fields" href="/manage/registration-fields">
            Add ad-hoc questions to the registration form (dropdown, text,
            checkbox, etc.).
          </Card>
        )}
        {isProgramLeader(user) && (
          <Card title="Waivers" href="/manage/waivers">
            Edit liability, photo, and code-of-conduct waivers parents sign at
            registration.
          </Card>
        )}
        {isProgramLeader(user) && (
          <Card title="Schools" href="/manage/schools">
            Manage the school list parents pick from on the registration form.
          </Card>
        )}
        {isProgramLeader(user) && (
          <Card title="People & permissions" href="/manage/people">
            Grant head coaches, assistant coaches, parents, and volunteers
            access — site-wide or scoped to a single team.
          </Card>
        )}
      </section>

      {myRegistrations && myRegistrations.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-ink">
            Your registrations
          </h2>
          <ul className="mt-3 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
            {myRegistrations.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-ink">
                    {r.player_first_name} {r.player_last_name}
                  </p>
                  <p className="text-xs text-ink-subtle">
                    Submitted{" "}
                    {new Date(r.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · ${(r.fee_cents / 100).toFixed(2)}
                  </p>
                </div>
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium capitalize text-ink-muted">
                  {r.status.replace("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

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
