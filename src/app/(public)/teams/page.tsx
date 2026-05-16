import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Teams",
  description: "Rosters and team pages for Creek's Girls Lacrosse.",
};

export default async function PublicTeamsPage() {
  const supabase = await createClient();
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, season, age_group")
    .eq("is_public", true)
    .order("name");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-purple-600">
        Teams
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold text-ink sm:text-5xl">
        Our teams
      </h1>

      {!teams || teams.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-neutral-300 p-8 text-center text-ink-muted">
          Team pages will appear here as the season ramps up.
        </p>
      ) : (
        <ul className="mt-10 divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {teams.map((t) => (
            <li key={t.id}>
              <Link
                href={`/teams/${t.id}`}
                className="group flex items-center justify-between gap-3 px-4 py-4 hover:bg-surface-muted"
              >
                <div>
                  <p className="font-display text-lg font-semibold text-ink group-hover:text-brand-teal-700">
                    {t.name}
                  </p>
                  <p className="text-xs text-ink-subtle">
                    {[t.season, t.age_group].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <span className="text-sm text-brand-teal-700 group-hover:underline">
                  View roster →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
