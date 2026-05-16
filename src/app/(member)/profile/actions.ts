"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  full_name: z.string().max(120).optional().default(""),
  phone: z.string().max(40).optional().default(""),
});

export async function updateProfile(
  input: z.infer<typeof schema>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name || null,
      phone: parsed.data.phone || null,
    })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}
