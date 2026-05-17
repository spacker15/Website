import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/supabase/types";

export type RoleGrant = {
  role: UserRole;
  teamId: string | null;
};

export type SessionUser = {
  id: string;
  email: string;
  profile: Profile;
  roles: RoleGrant[];
};

function bootstrapEmails(): string[] {
  // Prefer the new var name; fall back to the old one so existing deployments
  // keep working until they re-key the env.
  const raw =
    process.env.BOOTSTRAP_PROGRAM_LEADER_EMAILS ??
    process.env.BOOTSTRAP_HEAD_COACH_EMAILS ??
    "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function isNextInternalError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const digest = (err as { digest?: unknown }).digest;
  return typeof digest === "string";
}

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

    if (!profile) return null;

    const { data: roleRows } = await supabase
      .from("profile_roles")
      .select("role, team_id")
      .eq("profile_id", user.id);

    let roles: RoleGrant[] = (roleRows ?? []).map((r) => ({
      role: r.role,
      teamId: r.team_id,
    }));

    if (roles.length === 0 && bootstrapEmails().includes(user.email.toLowerCase())) {
      const admin = createAdminClient();
      if (admin) {
        const { error } = await admin
          .from("profile_roles")
          .insert({ profile_id: user.id, role: "program_leader", team_id: null });
        if (!error) roles = [{ role: "program_leader", teamId: null }];
      }
    }

    return {
      id: user.id,
      email: user.email,
      profile: profile as Profile,
      roles,
    };
  } catch (err) {
    if (isNextInternalError(err)) throw err;
    console.error("getSessionUser failed:", err);
    return null;
  }
});

export async function requireUser(): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) redirect("/login");
  return u;
}

export function hasRole(user: SessionUser | null, role: UserRole): boolean {
  return !!user && user.roles.some((r) => r.role === role);
}

export function isProgramLeader(user: SessionUser | null): boolean {
  return hasRole(user, "program_leader");
}

export function managesTeam(user: SessionUser | null, teamId: string): boolean {
  if (!user) return false;
  return user.roles.some(
    (r) =>
      r.role === "program_leader" ||
      ((r.role === "head_coach" || r.role === "assistant_coach") && r.teamId === teamId),
  );
}

export function managesAnyTeam(user: SessionUser | null): boolean {
  if (!user) return false;
  return user.roles.some(
    (r) =>
      r.role === "program_leader" ||
      r.role === "head_coach" ||
      r.role === "assistant_coach",
  );
}

export async function requireProgramLeader(): Promise<SessionUser> {
  const u = await requireUser();
  if (!isProgramLeader(u)) redirect("/dashboard");
  return u;
}

export async function requireManagesTeam(teamId: string): Promise<SessionUser> {
  const u = await requireUser();
  if (!managesTeam(u, teamId)) redirect("/dashboard");
  return u;
}

export async function requireManagesPlayer(playerId: string): Promise<SessionUser> {
  const u = await requireUser();
  if (isProgramLeader(u)) return u;
  const supabase = await createClient();
  const { data } = await supabase
    .from("players")
    .select("team_id")
    .eq("id", playerId)
    .maybeSingle();
  if (!data || !managesTeam(u, data.team_id)) redirect("/dashboard");
  return u;
}
