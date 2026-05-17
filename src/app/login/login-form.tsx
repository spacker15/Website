"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError } from "@/components/ui/field";
import { signInWithPassword, signUpWithPassword, sendMagicLink } from "./actions";

type Mode = "password-signin" | "password-signup" | "magic";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password-signin");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const confirmPassword = String(fd.get("confirmPassword") ?? "");

    if (mode === "password-signup" && password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    startTransition(async () => {
      if (mode === "magic") {
        const res = await sendMagicLink({ email, next });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        router.replace(`/login?sent=1${next ? `&next=${encodeURIComponent(next)}` : ""}`);
        return;
      }
      const res =
        mode === "password-signin"
          ? await signInWithPassword({ email, password, next })
          : await signUpWithPassword({ email, password, confirmPassword, next });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (res.redirectTo) router.replace(res.redirectTo);
    });
  }

  return (
    <>
      <div className="flex gap-1 rounded-md bg-surface-muted p-1 text-sm">
        <TabButton active={mode === "password-signin"} onClick={() => setMode("password-signin")}>
          Sign in
        </TabButton>
        <TabButton active={mode === "password-signup"} onClick={() => setMode("password-signup")}>
          Create account
        </TabButton>
        <TabButton active={mode === "magic"} onClick={() => setMode("magic")}>
          Magic link
        </TabButton>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <Field>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>

        {mode !== "magic" && (
          <Field>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "password-signin" ? "current-password" : "new-password"}
              required
              minLength={8}
            />
          </Field>
        )}

        {mode === "password-signup" && (
          <Field>
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </Field>
        )}

        {error && <FieldError>{error}</FieldError>}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending
            ? "Working…"
            : mode === "password-signin"
              ? "Sign in"
              : mode === "password-signup"
                ? "Create account"
                : "Email me a magic link"}
        </Button>

        {mode === "password-signin" && (
          <p className="text-center text-sm">
            <Link
              href="/login/forgot"
              className="font-medium text-brand-teal-700 hover:underline"
            >
              Forgot password?
            </Link>
          </p>
        )}
      </form>
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex-1 rounded-md px-3 py-1.5 font-medium transition-colors " +
        (active
          ? "bg-white text-brand-teal-700 shadow-sm"
          : "text-ink-muted hover:text-ink")
      }
    >
      {children}
    </button>
  );
}
