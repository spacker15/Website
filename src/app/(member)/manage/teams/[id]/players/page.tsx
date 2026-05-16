import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { NewPlayerForm } from "./new-player-form";

export const dynamic = "force-dynamic";

export default async function TeamRosterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("id, name, season")
    .eq("id", id)
    .maybeSingle();
  if (!team) notFound();

  const { data: players } = await supabase
    .from("players")
    .select("id, first_name, last_name, jersey, position, grade")
    .eq("team_id", id)
    .order("last_name");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Link
        href="/manage/teams"
        className="text-sm font-medium text-brand-teal-700 hover:underline"
      >
        ← Teams
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">
            {team.name}
          </h1>
          {team.season && (
            <p className="mt-1 text-sm text-ink-muted">{team.season}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/manage/teams/${team.id}/edit`}>
            <Button size="sm" variant="outline">Edit team</Button>
          </Link>
        </div>
      </div>

      <section className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          Add player
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          You can adjust per-field public visibility from the player edit page.
        </p>
        <div className="mt-4">
          <NewPlayerForm teamId={team.id} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">Roster</h2>
        {players && players.length > 0 ? (
          <ul className="mt-4 divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white">
            {players.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-ink">
                    {p.first_name} {p.last_name}
                    {p.jersey && (
                      <span className="ml-2 text-sm text-ink-subtle">
                        #{p.jersey}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink-subtle">
                    {[p.position, p.grade].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <Link
                  href={`/manage/teams/${team.id}/players/${p.id}/edit`}
                >
                  <Button size="sm" variant="ghost">Edit</Button>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-ink-muted">
            No players yet — add one above.
          </p>
        )}
      </section>
    </div>
  );
}
