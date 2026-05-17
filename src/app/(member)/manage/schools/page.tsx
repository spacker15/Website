import Link from "next/link";
import { requireProgramLeader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import type { SchoolKind } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const KIND_LABELS: Record<SchoolKind, string> = {
  public_high: "Public high",
  public_middle: "Public middle",
  public_k8: "Public K–8",
  public_elementary: "Public elementary",
  private: "Private",
  other: "Other",
};

export default async function SchoolsPage() {
  await requireProgramLeader();
  const supabase = await createClient();
  const { data: schools } = await supabase
    .from("schools")
    .select("*")
    .order("kind")
    .order("display_order")
    .order("name");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-purple-600">
            Program leader
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
            Schools
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            Schools shown to parents in the registration form. Players who
            don&apos;t see their school can still type one in via the
            &quot;Not listed&quot; option.
          </p>
        </div>
        <Link href="/manage/schools/new">
          <Button size="lg">New school</Button>
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {!schools || schools.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-muted">No schools yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Kind</th>
                <th className="px-4 py-2">HS?</th>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Active</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {schools.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium text-ink">{s.name}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {KIND_LABELS[s.kind]}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {s.is_high_school ? "✓" : "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{s.display_order}</td>
                  <td className="px-4 py-3">
                    {s.is_active ? (
                      <span className="rounded-full bg-brand-teal-50 px-2 py-0.5 text-xs font-medium text-brand-teal-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-ink-muted">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/manage/schools/${s.id}`}>
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
