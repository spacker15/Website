"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireProgramLeader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const fieldSchema = z
  .object({
    label: z.string().min(1, "Label is required").max(200),
    field_key: z
      .string()
      .min(1, "Field key is required")
      .max(60)
      .regex(
        /^[a-z][a-z0-9_]*$/,
        "Field key must start with a letter and contain only lowercase letters, numbers, and underscores",
      ),
    help_text: z.string().max(500).optional().default(""),
    kind: z.enum(["text", "textarea", "number", "select", "checkbox"]),
    options: z.array(z.string().min(1).max(120)).max(40).optional().default([]),
    is_required: z.boolean(),
    is_active: z.boolean(),
    display_order: z.number().int().min(0).max(9999).default(0),
  })
  .refine(
    (d) => d.kind !== "select" || (d.options && d.options.length >= 2),
    {
      message: "Select fields need at least 2 options",
      path: ["options"],
    },
  );

type CreateResult = { ok: true; id: string } | { ok: false; error: string };
type Result = { ok: true } | { ok: false; error: string };

export async function createRegistrationField(
  input: z.infer<typeof fieldSchema>,
): Promise<CreateResult> {
  await requireProgramLeader();
  const parsed = fieldSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("registration_fields")
    .insert({
      ...parsed.data,
      help_text: parsed.data.help_text || null,
      options: parsed.data.kind === "select" ? parsed.data.options : null,
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That field key is already in use." };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath("/manage/registration-fields");
  return { ok: true, id: data.id };
}

export async function updateRegistrationField(
  input: z.infer<typeof fieldSchema> & { id: string },
): Promise<Result> {
  await requireProgramLeader();
  const parsed = fieldSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase
    .from("registration_fields")
    .update({
      ...parsed.data,
      help_text: parsed.data.help_text || null,
      options: parsed.data.kind === "select" ? parsed.data.options : null,
    })
    .eq("id", input.id);
  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That field key is already in use." };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath("/manage/registration-fields");
  return { ok: true };
}

export async function deleteRegistrationField(id: string): Promise<Result> {
  await requireProgramLeader();
  const supabase = await createClient();
  const { error } = await supabase.from("registration_fields").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/manage/registration-fields");
  return { ok: true };
}
