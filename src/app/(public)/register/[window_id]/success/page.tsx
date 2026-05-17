import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function RegistrationSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ window_id: string }>;
  searchParams: Promise<{ r?: string }>;
}) {
  const { window_id } = await params;
  const { r } = await searchParams;
  if (!r) notFound();

  const user = await getSessionUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: reg } = await supabase
    .from("registrations")
    .select("id, parent_full_name, player_first_name, player_last_name, fee_cents, status")
    .eq("id", r)
    .eq("window_id", window_id)
    .eq("parent_profile_id", user.id)
    .maybeSingle();
  if (!reg) notFound();

  const fee = `$${(reg.fee_cents / 100).toFixed(2)}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="rounded-xl border border-brand-teal-200 bg-brand-teal-50 p-8 text-center">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-teal-700">
          Registration received
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
          Thanks, {reg.parent_full_name.split(" ")[0]}!
        </h1>
        <p className="mt-3 text-sm text-ink">
          We&apos;ve got {reg.player_first_name} {reg.player_last_name} on the
          list. Your spot is held pending payment of {fee}.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-ink">
          Next step: pay the registration fee
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Online payment is launching shortly. We&apos;ll email you a payment
          link as soon as it&apos;s available. Once paid, a coach will confirm
          your player&apos;s team placement.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button disabled size="lg">
            Pay {fee} (coming soon)
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              Back to dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
