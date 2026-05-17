import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProgramLeader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusPill(status: string) {
  const tones: Record<string, string> = {
    pending_payment: "bg-brand-pink-50 text-brand-pink-700",
    paid: "bg-brand-purple-50 text-brand-purple-700",
    approved: "bg-brand-teal-50 text-brand-teal-700",
    rejected: "bg-neutral-100 text-ink-muted",
    cancelled: "bg-neutral-100 text-ink-muted",
  };
  const label = status.replace("_", " ");
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${tones[status] ?? "bg-neutral-100"}`}
    >
      {label}
    </span>
  );
}

export default async function WindowSubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireProgramLeader();
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: window }, { data: regs }, { data: teams }] = await Promise.all([
    supabase
      .from("registration_windows")
      .select("id, name, fee_cents")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("registrations")
      .select("*")
      .eq("window_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("teams").select("id, name"),
  ]);
  if (!window) notFound();

  const teamName = new Map((teams ?? []).map((t) => [t.id, t.name]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link
        href="/manage/registration"
        className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-brand-purple-600"
      >
        ← Back to windows
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
        {window.name} — submissions
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        {regs?.length ?? 0} registration{regs?.length === 1 ? "" : "s"}.
        Approval and payment status are coming in the next phases.
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {!regs || regs.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-muted">
            No registrations yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-2">Submitted</th>
                <th className="px-4 py-2">Player</th>
                <th className="px-4 py-2">Parent</th>
                <th className="px-4 py-2">Team requested</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {regs.map((r) => (
                <tr key={r.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3 text-ink-muted">
                    {fmtDate(r.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/manage/registration/${id}/submissions/${r.id}`}
                      className="font-medium text-ink hover:text-brand-teal-700"
                    >
                      {r.player_first_name} {r.player_last_name}
                    </Link>
                    {r.player_grade && (
                      <p className="text-xs text-ink-subtle">
                        Grade {r.player_grade}
                        {r.player_position !== "unspecified" &&
                          ` · ${r.player_position}`}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-ink">{r.parent_full_name}</p>
                    <p className="text-xs text-ink-subtle">{r.parent_email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {r.requested_team_id
                      ? (teamName.get(r.requested_team_id) ?? "(deleted team)")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{statusPill(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
