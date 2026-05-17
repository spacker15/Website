import Link from "next/link";
import { requireProgramLeader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function RegistrationFieldsPage() {
  await requireProgramLeader();
  const supabase = await createClient();
  const { data: fields } = await supabase
    .from("registration_fields")
    .select("*")
    .order("display_order")
    .order("label");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-purple-600">
            Program leader
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
            Custom registration fields
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            Add extra questions to the registration form. Answers are stored
            with the registration and shown to coaches when they review
            submissions.
          </p>
        </div>
        <Link href="/manage/registration-fields/new">
          <Button size="lg">New field</Button>
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {!fields || fields.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-muted">
            No custom fields yet. The built-in fields (guardian, player,
            waivers) are always shown.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Label</th>
                <th className="px-4 py-2">Key</th>
                <th className="px-4 py-2">Kind</th>
                <th className="px-4 py-2">Required</th>
                <th className="px-4 py-2">Active</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {fields.map((f) => (
                <tr key={f.id}>
                  <td className="px-4 py-3 text-ink-muted">{f.display_order}</td>
                  <td className="px-4 py-3 font-medium text-ink">{f.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                    {f.field_key}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{f.kind}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {f.is_required ? "Required" : "Optional"}
                  </td>
                  <td className="px-4 py-3">
                    {f.is_active ? (
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
                    <Link href={`/manage/registration-fields/${f.id}`}>
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
