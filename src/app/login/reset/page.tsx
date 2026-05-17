import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./reset-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your Creek's Girls Lacrosse account.",
};

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/login/forgot?expired=1");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-16">
      <Link
        href="/login"
        className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-brand-purple-600"
      >
        ← Back to sign in
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
        Choose a new password
      </h1>
      <p className="mt-2 text-center text-sm text-ink-muted">
        Pick something at least 8 characters long.
      </p>

      <div className="mt-8 w-full rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
