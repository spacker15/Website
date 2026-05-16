import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = { title: "Manage teams" };

export default async function ManageTeamsPage() {
  const supabase = await createClient();
  const { data: teams, error } = await supabase
    .from("teams")
    .select("id, name, season, age_group, is_public")
    .order("name");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-purple-600">
            Coach tools
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">
            Teams
          </h1>
        </div>
        <Link href="/manage/teams/new">
          <Button className="gap-2">
            <Plus size={18} aria-hidden /> New team
          </Button>
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-md bg-brand-pink-50 px-3 py-2 text-sm text-brand-pink-700">
          {error.message}
        </p>
      )}

      {!error && (!teams || teams.length === 0) ? (
        <p className="mt-10 rounded-lg border border-dashed border-neutral-300 p-8 text-center text-ink-muted">
          No teams yet. Create the first one to start adding players.
        </p>
      ) : null}

      {teams && teams.length > 0 && (
        <ul className="mt-8 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {teams.map((team) => (
            <li
              key={team.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="font-medium text-ink">{team.name}</p>
                <p className="text-xs text-ink-subtle">
                  {[team.season, team.age_group].filter(Boolean).join(" · ") || "—"}
                  {!team.is_public && " · Hidden from public"}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/manage/teams/${team.id}/players`}>
                  <Button size="sm" variant="outline">Roster</Button>
                </Link>
                <Link href={`/manage/teams/${team.id}/edit`}>
                  <Button size="sm" variant="ghost">Edit</Button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
