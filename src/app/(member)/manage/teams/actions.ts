"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireManagesTeam, requireProgramLeader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const teamSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  season: z.string().max(60).optional().default(""),
  age_group: z.string().max(60).optional().default(""),
  is_public: z.boolean(),
});

type CreateResult = { ok: true; id: string } | { ok: false; error: string };
type WriteResult = { ok: true } | { ok: false; error: string };

export async function createTeam(input: z.infer<typeof teamSchema>): Promise<CreateResult> {
  await requireProgramLeader();
  const parsed = teamSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .insert({
      name: parsed.data.name,
      season: parsed.data.season || null,
      age_group: parsed.data.age_group || null,
      is_public: parsed.data.is_public,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/manage/teams");
  revalidatePath("/teams");
  return { ok: true, id: data.id };
}

export async function updateTeam(
  input: z.infer<typeof teamSchema> & { id: string },
): Promise<WriteResult> {
  await requireManagesTeam(input.id);
  const parsed = teamSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase
    .from("teams")
    .update({
      name: parsed.data.name,
      season: parsed.data.season || null,
      age_group: parsed.data.age_group || null,
      is_public: parsed.data.is_public,
    })
    .eq("id", input.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/manage/teams");
  revalidatePath(`/teams/${input.id}`);
  revalidatePath("/teams");
  return { ok: true };
}

export async function deleteTeam(id: string): Promise<WriteResult> {
  await requireProgramLeader();
  const supabase = await createClient();
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/manage/teams");
  revalidatePath("/teams");
  return { ok: true };
}
