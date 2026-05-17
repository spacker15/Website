"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireProgramLeader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

const roleEnum = z.enum([
  "program_leader",
  "head_coach",
  "assistant_coach",
  "parent",
  "volunteer",
]);

const grantSchema = z
  .object({
    email: z.email("Enter a valid email").max(200),
    role: roleEnum,
    team_id: z.string().uuid().optional().nullable(),
  })
  .refine(
    (d) => {
      if (d.role === "program_leader") return !d.team_id;
      if (d.role === "head_coach" || d.role === "assistant_coach") return !!d.team_id;
      return true;
    },
    {
      message:
        "program_leader must be site-wide; head_coach and assistant_coach require a team",
      path: ["team_id"],
    },
  );

type Result = { ok: true } | { ok: false; error: string };

export async function grantRole(input: z.infer<typeof grantSchema>): Promise<Result> {
  await requireProgramLeader();
  const parsed = grantSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();

  const { data: profile, error: lookupErr } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", parsed.data.email)
    .maybeSingle();
  if (lookupErr) return { ok: false, error: lookupErr.message };
  if (!profile) {
    return {
      ok: false,
      error:
        "No account exists for that email yet. Have them sign up first, then come back to grant.",
    };
  }

  const { error } = await supabase.from("profile_roles").insert({
    profile_id: profile.id,
    role: parsed.data.role as UserRole,
    team_id: parsed.data.team_id ?? null,
  });
  if (error) {
    // Unique-index violation → friendlier message
    if (error.code === "23505") {
      return { ok: false, error: "That user already has this role for that scope." };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath("/manage/people");
  return { ok: true };
}

export async function revokeRole(id: string): Promise<Result> {
  await requireProgramLeader();
  if (!z.string().uuid().safeParse(id).success) {
    return { ok: false, error: "Invalid grant id" };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("profile_roles").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/manage/people");
  return { ok: true };
}
