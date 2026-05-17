"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireProgramLeader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const schoolSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  kind: z.enum([
    "public_elementary",
    "public_middle",
    "public_k8",
    "public_high",
    "private",
    "other",
  ]),
  is_active: z.boolean(),
  is_high_school: z.boolean(),
  display_order: z.number().int().min(0).max(9999).default(0),
});

type CreateResult = { ok: true; id: string } | { ok: false; error: string };
type Result = { ok: true } | { ok: false; error: string };

export async function createSchool(
  input: z.infer<typeof schoolSchema>,
): Promise<CreateResult> {
  await requireProgramLeader();
  const parsed = schoolSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schools")
    .insert(parsed.data)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/manage/schools");
  return { ok: true, id: data.id };
}

export async function updateSchool(
  input: z.infer<typeof schoolSchema> & { id: string },
): Promise<Result> {
  await requireProgramLeader();
  const parsed = schoolSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase
    .from("schools")
    .update(parsed.data)
    .eq("id", input.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/manage/schools");
  return { ok: true };
}

export async function deleteSchool(id: string): Promise<Result> {
  await requireProgramLeader();
  const supabase = await createClient();
  const { error } = await supabase.from("schools").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        error:
          "This school has been selected on a registration and can't be deleted. Mark it inactive instead.",
      };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath("/manage/schools");
  return { ok: true };
}
