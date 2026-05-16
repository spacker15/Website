"use client";

import { useState, useTransition } from "react";
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
      const action = mode === "password-signin" ? signInWithPassword : signUpWithPassword;
      const res = await action({ email, password, next });
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
