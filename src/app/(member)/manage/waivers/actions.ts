"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireProgramLeader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const waiverSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Waiver text is required").max(20000),
  is_required: z.boolean(),
  is_active: z.boolean(),
  display_order: z.number().int().min(0).max(999).default(0),
});

type CreateResult = { ok: true; id: string } | { ok: false; error: string };
type Result = { ok: true } | { ok: false; error: string };

export async function createWaiver(
  input: z.infer<typeof waiverSchema>,
): Promise<CreateResult> {
  await requireProgramLeader();
  const parsed = waiverSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("waivers")
    .insert(parsed.data)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/manage/waivers");
  return { ok: true, id: data.id };
}

export async function updateWaiver(
  input: z.infer<typeof waiverSchema> & { id: string; bumpVersion: boolean },
): Promise<Result> {
  await requireProgramLeader();
  const parsed = waiverSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();

  // If the body changed and the caller chose to bump version, increment
  // version so previously-signed snapshots can be distinguished.
  if (input.bumpVersion) {
    const { data: existing } = await supabase
      .from("waivers")
      .select("version")
      .eq("id", input.id)
      .maybeSingle();
    const nextVersion = (existing?.version ?? 0) + 1;
    const { error } = await supabase
      .from("waivers")
      .update({ ...parsed.data, version: nextVersion })
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("waivers")
      .update(parsed.data)
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/manage/waivers");
  return { ok: true };
}

export async function deleteWaiver(id: string): Promise<Result> {
  await requireProgramLeader();
  const supabase = await createClient();
  const { error } = await supabase.from("waivers").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        error:
          "This waiver has been signed by at least one registration and can't be deleted. Mark it inactive instead.",
      };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath("/manage/waivers");
  return { ok: true };
}
