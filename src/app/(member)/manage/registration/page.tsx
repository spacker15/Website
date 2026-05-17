import Link from "next/link";
import { requireProgramLeader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function fmtFee(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function status(opens: string, closes: string): { label: string; tone: string } {
  const now = Date.now();
  const open = new Date(opens).getTime();
  const close = new Date(closes).getTime();
  if (now < open)
    return {
      label: "Upcoming",
      tone: "bg-brand-purple-50 text-brand-purple-700",
    };
  if (now > close) return { label: "Closed", tone: "bg-neutral-100 text-ink-muted" };
  return { label: "Open", tone: "bg-brand-teal-50 text-brand-teal-700" };
}

export default async function RegistrationManagePage() {
  await requireProgramLeader();
  const supabase = await createClient();
  const { data: windows } = await supabase
    .from("registration_windows")
    .select("*")
    .order("opens_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-purple-600">
            Program leader
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
            Registration windows
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            Open a registration window for a season. While the window is open,
            parents can register players and pay the fee.
          </p>
        </div>
        <Link href="/manage/registration/new">
          <Button size="lg">New window</Button>
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {!windows || windows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-muted">
            No registration windows yet. Click <span className="font-medium">New window</span> to create one.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Opens</th>
                <th className="px-4 py-2">Closes</th>
                <th className="px-4 py-2">Fee</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {windows.map((w) => {
                const s = status(w.opens_at, w.closes_at);
                return (
                  <tr key={w.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{w.name}</p>
                      {!w.is_active && (
                        <p className="mt-0.5 text-xs text-ink-subtle">
                          Hidden (inactive)
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {fmtDateTime(w.opens_at)}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {fmtDateTime(w.closes_at)}
                    </td>
                    <td className="px-4 py-3 text-ink">
                      {fmtFee(w.fee_cents)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${s.tone}`}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/manage/registration/${w.id}`}>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
