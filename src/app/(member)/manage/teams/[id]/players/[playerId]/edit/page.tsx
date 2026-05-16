import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditPlayerForm } from "./edit-player-form";
import { VisibilityForm } from "./visibility-form";
import { DeletePlayerButton } from "./delete-player-button";

export const dynamic = "force-dynamic";

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ id: string; playerId: string }>;
}) {
  const { id: teamId, playerId } = await params;
  const supabase = await createClient();

  const [{ data: player }, { data: visibility }, { data: team }] = await Promise.all([
    supabase.from("players").select("*").eq("id", playerId).maybeSingle(),
    supabase.from("player_visibility").select("*").eq("player_id", playerId).maybeSingle(),
    supabase.from("teams").select("name").eq("id", teamId).maybeSingle(),
  ]);

  if (!player || player.team_id !== teamId) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link
        href={`/manage/teams/${teamId}/players`}
        className="text-sm font-medium text-brand-teal-700 hover:underline"
      >
        ← {team?.name ?? "Roster"}
      </Link>
      <h1 className="mt-3 font-display text-3xl font-bold text-ink">
        Edit player
      </h1>

      <section className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          Player info
        </h2>
        <div className="mt-4">
          <EditPlayerForm
            initial={{
              id: player.id,
              first_name: player.first_name,
              last_name: player.last_name,
              jersey: player.jersey ?? "",
              position: player.position,
              grade: player.grade ?? "",
            }}
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          Public visibility
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Choose what shows on the public team page for this player.
        </p>
        <div className="mt-4">
          <VisibilityForm
            playerId={player.id}
            initial={{
              show_name: visibility?.show_name ?? true,
              show_jersey: visibility?.show_jersey ?? true,
              show_position: visibility?.show_position ?? true,
              show_grade: visibility?.show_grade ?? true,
              show_photo: visibility?.show_photo ?? true,
              show_parents: visibility?.show_parents ?? true,
            }}
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-brand-pink-100 bg-brand-pink-50/40 p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          Danger zone
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Remove this player from the roster. This can&apos;t be undone.
        </p>
        <div className="mt-4">
          <DeletePlayerButton id={player.id} teamId={teamId} />
        </div>
      </section>
    </div>
  );
}
