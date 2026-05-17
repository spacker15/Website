"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireProgramLeader } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// We accept ISO strings from the form (datetime-local), parse server-side.
const windowSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(120),
    description: z.string().max(2000).optional().default(""),
    opens_at: z.string().min(1, "Opens at is required"),
    closes_at: z.string().min(1, "Closes at is required"),
    fee_dollars: z
      .number({ message: "Fee must be a number" })
      .min(0, "Fee can't be negative")
      .max(100000, "Fee too large"),
    is_active: z.boolean(),
  })
  .refine((d) => new Date(d.closes_at) > new Date(d.opens_at), {
    message: "Close date must be after open date",
    path: ["closes_at"],
  });

type CreateResult = { ok: true; id: string } | { ok: false; error: string };
type WriteResult = { ok: true } | { ok: false; error: string };

function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export async function createRegistrationWindow(
  input: z.infer<typeof windowSchema>,
): Promise<CreateResult> {
  await requireProgramLeader();
  const parsed = windowSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("registration_windows")
    .insert({
      name: parsed.data.name,
      description: parsed.data.description || null,
      opens_at: new Date(parsed.data.opens_at).toISOString(),
      closes_at: new Date(parsed.data.closes_at).toISOString(),
      fee_cents: toCents(parsed.data.fee_dollars),
      is_active: parsed.data.is_active,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/manage/registration");
  revalidatePath("/");
  return { ok: true, id: data.id };
}

export async function updateRegistrationWindow(
  input: z.infer<typeof windowSchema> & { id: string },
): Promise<WriteResult> {
  await requireProgramLeader();
  const parsed = windowSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase
    .from("registration_windows")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      opens_at: new Date(parsed.data.opens_at).toISOString(),
      closes_at: new Date(parsed.data.closes_at).toISOString(),
      fee_cents: toCents(parsed.data.fee_dollars),
      is_active: parsed.data.is_active,
    })
    .eq("id", input.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/manage/registration");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteRegistrationWindow(id: string): Promise<WriteResult> {
  await requireProgramLeader();
  const supabase = await createClient();
  const { error } = await supabase.from("registration_windows").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/manage/registration");
  revalidatePath("/");
  return { ok: true };
}
