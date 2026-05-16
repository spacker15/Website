import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TeamForm } from "../../team-form";
import { DeleteTeamButton } from "../../delete-team-button";

export const dynamic = "force-dynamic";

export default async function EditTeamPage({
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
  if (!team) notFound();

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <Link
        href="/manage/teams"
        className="text-sm font-medium text-brand-teal-700 hover:underline"
      >
        ← Teams
      </Link>
      <h1 className="mt-3 font-display text-3xl font-bold text-ink">
        Edit team
      </h1>

      <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
        <TeamForm
          id={team.id}
          initial={{
            name: team.name,
            season: team.season ?? "",
            age_group: team.age_group ?? "",
            is_public: team.is_public,
          }}
        />
      </div>

      <div className="mt-6 rounded-xl border border-brand-pink-100 bg-brand-pink-50/40 p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          Danger zone
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Deleting a team also deletes its roster and visibility settings.
        </p>
        <div className="mt-4">
          <DeleteTeamButton id={team.id} />
        </div>
      </div>
    </div>
  );
}
