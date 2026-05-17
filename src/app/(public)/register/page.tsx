import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function fmtFee(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function RegisterIndexPage() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const [{ data: open }, user] = await Promise.all([
    supabase
      .from("registration_windows")
      .select("*")
      .eq("is_active", true)
      .lte("opens_at", nowIso)
      .gte("closes_at", nowIso)
      .order("closes_at", { ascending: true }),
    getSessionUser(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-purple-600">
        Register
      </p>
      <h1 className="mt-1 font-display text-4xl font-bold text-ink sm:text-5xl">
        Sign your player up
      </h1>
      <p className="mt-3 max-w-xl text-base text-ink-muted">
        Pick the open registration below and fill in your player&apos;s info.
        You&apos;ll need a Creek&apos;s Lacrosse account to register — it takes
        about a minute.
      </p>

      {!open || open.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-neutral-300 bg-surface-muted p-8 text-center">
          <p className="font-display text-xl font-semibold text-ink">
            Registration is currently closed
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            Check back soon, or follow us on Instagram for an announcement
            when the next season opens.
          </p>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {open.map((w) => (
            <li
              key={w.id}
              className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-ink">
                    {w.name}
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    Closes {fmtDate(w.closes_at)} · {fmtFee(w.fee_cents)} per
                    player
                  </p>
                  {w.description && (
                    <p className="mt-3 text-sm text-ink">{w.description}</p>
                  )}
                </div>
                <Link
                  href={
                    user
                      ? `/register/${w.id}`
                      : `/login?next=${encodeURIComponent(`/register/${w.id}`)}`
                  }
                >
                  <Button size="lg">
                    {user ? "Register now" : "Sign in to register"}
                  </Button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!user && (
        <p className="mt-8 text-center text-sm text-ink-muted">
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="font-medium text-brand-teal-700 hover:underline">
            Create one
          </Link>
          .
        </p>
      )}
    </div>
  );
}
