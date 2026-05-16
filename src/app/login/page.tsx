import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Creek's Girls Lacrosse.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; sent?: string; error?: string }>;
}) {
  const user = await getSessionUser();
  const params = await searchParams;
  if (user) redirect(params.next ?? "/dashboard");

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-16">
      <Link
        href="/"
        className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-brand-purple-600"
      >
        ← Back home
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
        Sign in
      </h1>
      <p className="mt-2 text-center text-sm text-ink-muted">
        For coaches, parents, and volunteers. New here? Use the same form — an
        account is created on first sign-in.
      </p>

      <div className="mt-8 w-full rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <LoginForm next={params.next} />
        {params.sent === "1" && (
          <p className="mt-4 rounded-md bg-brand-teal-50 px-3 py-2 text-sm text-brand-teal-700">
            Check your inbox for a magic link.
          </p>
        )}
        {params.error && (
          <p className="mt-4 rounded-md bg-brand-pink-50 px-3 py-2 text-sm text-brand-pink-700">
            {params.error}
          </p>
        )}
      </div>
    </div>
  );
}
