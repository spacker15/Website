import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/supabase/types";

export type SessionUser = {
  id: string;
  email: string;
  profile: Profile;
  roles: UserRole[];
};

function bootstrapEmails(): string[] {
  const raw = process.env.BOOTSTRAP_HEAD_COACH_EMAILS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Loads the current user's profile + roles. Returns null when no session.
 * Bootstraps the head_coach role for emails listed in
 * BOOTSTRAP_HEAD_COACH_EMAILS when a matching user has no roles yet.
 *
 * Cached per request so multiple consumers (layout, page, components) share
 * the same fetch.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user || !user.email) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      // Trigger should have inserted it; if not, surface nothing rather than throw.
      return null;
    }

    const { data: roleRows } = await supabase
      .from("profile_roles")
      .select("role")
      .eq("profile_id", user.id);

    let roles = (roleRows ?? []).map((r) => r.role);

    if (roles.length === 0 && bootstrapEmails().includes(user.email.toLowerCase())) {
      const admin = createAdminClient();
      if (admin) {
        const { error } = await admin
          .from("profile_roles")
          .insert({ profile_id: user.id, role: "head_coach" });
        if (!error) roles = ["head_coach"];
      }
    }

    return {
      id: user.id,
      email: user.email,
      profile: profile as Profile,
      roles: roles as UserRole[],
    };
  } catch (err) {
    // Missing env vars, network issues, or unexpected Supabase errors fall
    // through to "no session" so public pages still render.
    console.error("getSessionUser failed:", err);
    return null;
  }
});

export async function requireUser(): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) redirect("/login");
  return u;
}

export async function requireRole(role: UserRole): Promise<SessionUser> {
  const u = await requireUser();
  if (!u.roles.includes(role)) redirect("/dashboard");
  return u;
}

export function hasRole(user: SessionUser | null, role: UserRole): boolean {
  return !!user && user.roles.includes(role);
}
