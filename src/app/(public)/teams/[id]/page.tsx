import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: team } = await supabase
    .from("teams")
    .select("name, is_public")
    .eq("id", id)
    .maybeSingle();
  if (!team || !team.is_public) return { title: "Team" };
  return { title: team.name, description: `Roster for ${team.name}` };
}

export default async function PublicTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!team || !team.is_public) notFound();

  const { data: players } = await supabase
    .from("players")
    .select("id, first_name, last_name, jersey, position, grade")
    .eq("team_id", id)
    .order("last_name");

  const { data: visibilityRows } = await supabase
    .from("player_visibility")
    .select("*")
    .in("player_id", (players ?? []).map((p) => p.id));

  const visibilityById = new Map(visibilityRows?.map((v) => [v.player_id, v]) ?? []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Link
        href="/teams"
        className="text-sm font-medium text-brand-teal-700 hover:underline"
      >
        ← All teams
      </Link>
      <h1 className="mt-3 font-display text-4xl font-bold text-ink sm:text-5xl">
        {team.name}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        {[team.season, team.age_group].filter(Boolean).join(" · ") || ""}
      </p>

      {!players || players.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-neutral-300 p-8 text-center text-ink-muted">
          Roster coming soon.
        </p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs uppercase tracking-wider text-ink-subtle">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {players.map((p) => {
                const v = visibilityById.get(p.id);
                const showName = v?.show_name ?? true;
                const showJersey = v?.show_jersey ?? true;
                const showPosition = v?.show_position ?? true;
                const showGrade = v?.show_grade ?? true;
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium text-ink">
                      {showJersey && p.jersey ? p.jersey : "—"}
                    </td>
                    <td className="px-4 py-3 text-ink">
                      {showName ? `${p.first_name} ${p.last_name}` : "Player"}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {showPosition && p.position !== "unspecified"
                        ? p.position[0].toUpperCase() + p.position.slice(1)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {showGrade && p.grade ? p.grade : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
