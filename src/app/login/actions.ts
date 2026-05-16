"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const credSchema = z.object({
  email: z.email("Enter a valid email").max(200),
  password: z.string().min(8, "Use at least 8 characters").max(120),
  next: z.string().optional(),
});

const magicSchema = z.object({
  email: z.email("Enter a valid email").max(200),
  next: z.string().optional(),
});

type Result =
  | { ok: true; redirectTo?: string }
  | { ok: false; error: string };

async function originUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signInWithPassword(
  input: z.infer<typeof credSchema>,
): Promise<Result> {
  const parsed = credSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, redirectTo: parsed.data.next ?? "/dashboard" };
}

export async function signUpWithPassword(
  input: z.infer<typeof credSchema>,
): Promise<Result> {
  const parsed = credSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const origin = await originUrl();
  const next = parsed.data.next ?? "/dashboard";
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/login/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { ok: false, error: error.message };
  // If email confirmation is required, no session yet; nudge the user.
  if (!data.session) {
    return {
      ok: true,
      redirectTo: `/login?sent=1${parsed.data.next ? `&next=${encodeURIComponent(parsed.data.next)}` : ""}`,
    };
  }
  return { ok: true, redirectTo: next };
}

export async function sendMagicLink(
  input: z.infer<typeof magicSchema>,
): Promise<Result> {
  const parsed = magicSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const origin = await originUrl();
  const next = parsed.data.next ?? "/dashboard";
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/login/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
