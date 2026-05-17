import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RegistrationForm } from "./registration-form";

export const dynamic = "force-dynamic";

export default async function RegisterWindowPage({
  params,
}: {
  params: Promise<{ window_id: string }>;
}) {
  const { window_id } = await params;

  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/register/${window_id}`)}`);
  }

  const supabase = await createClient();
  const [{ data: window }, { data: teams }] = await Promise.all([
    supabase
      .from("registration_windows")
      .select("*")
      .eq("id", window_id)
      .eq("is_active", true)
      .maybeSingle(),
    supabase.from("teams").select("id, name, season").order("name"),
  ]);
  if (!window) notFound();

  const fee = `$${(window.fee_cents / 100).toFixed(2)}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link
        href="/register"
        className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-brand-purple-600"
      >
        ← Back to registration
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
        {window.name}
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        {fee} per player · closes{" "}
        {new Date(window.closes_at).toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>
      {window.description && (
        <p className="mt-4 max-w-prose text-sm text-ink">{window.description}</p>
      )}

      <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <RegistrationForm
          windowId={window.id}
          teams={teams ?? []}
          parentDefaults={{
            full_name: user.profile.full_name ?? "",
            email: user.email,
            phone: user.profile.phone ?? "",
          }}
        />
      </div>
    </div>
  );
}
