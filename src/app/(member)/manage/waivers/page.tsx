import Link from "next/link";
import { requireProgramLeader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function WaiversPage() {
  await requireProgramLeader();
  const supabase = await createClient();
  const { data: waivers } = await supabase
    .from("waivers")
    .select("*")
    .order("display_order")
    .order("created_at");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-purple-600">
            Program leader
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
            Waivers
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            Parents see and sign the active, required waivers when registering.
            Each signed waiver is snapshotted, so future edits don&apos;t change
            historical signatures. Bump the version when you make a meaningful
            wording change.
          </p>
        </div>
        <Link href="/manage/waivers/new">
          <Button size="lg">New waiver</Button>
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {!waivers || waivers.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-muted">No waivers yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Version</th>
                <th className="px-4 py-2">Required</th>
                <th className="px-4 py-2">Active</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {waivers.map((w) => (
                <tr key={w.id}>
                  <td className="px-4 py-3 text-ink-muted">{w.display_order}</td>
                  <td className="px-4 py-3 font-medium text-ink">{w.title}</td>
                  <td className="px-4 py-3 text-ink-muted">v{w.version}</td>
                  <td className="px-4 py-3">
                    {w.is_required ? (
                      <span className="text-ink">Required</span>
                    ) : (
                      <span className="text-ink-subtle">Optional</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {w.is_active ? (
                      <span className="rounded-full bg-brand-teal-50 px-2 py-0.5 text-xs font-medium text-brand-teal-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-ink-muted">
                        Archived
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/manage/waivers/${w.id}`}>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
