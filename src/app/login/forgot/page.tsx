import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-form";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your Creek's Girls Lacrosse account password.",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-16">
      <Link
        href="/login"
        className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-brand-purple-600"
      >
        ← Back to sign in
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
        Forgot password
      </h1>
      <p className="mt-2 text-center text-sm text-ink-muted">
        Enter your email and we&apos;ll send you a link to reset it.
      </p>

      <div className="mt-8 w-full rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        {params.expired === "1" && (
          <p className="mb-4 rounded-md bg-brand-pink-50 px-3 py-2 text-sm text-brand-pink-700">
            That reset link has expired or already been used. Request a new one.
          </p>
        )}
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
