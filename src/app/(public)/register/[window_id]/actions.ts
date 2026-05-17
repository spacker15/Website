"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { PlayerPosition } from "@/lib/supabase/types";

const submitSchema = z.object({
  window_id: z.string().uuid(),
  parent_full_name: z.string().min(1, "Parent name is required").max(120),
  parent_phone: z.string().max(40).optional().default(""),
  player_first_name: z.string().min(1, "Player first name is required").max(80),
  player_last_name: z.string().min(1, "Player last name is required").max(80),
  player_date_of_birth: z.string().optional().default(""),
  player_grade: z.string().max(20).optional().default(""),
  player_position: z.enum(["unspecified", "attack", "midfield", "defense", "goalie"]),
  player_jersey_pref: z.string().max(10).optional().default(""),
  requested_team_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(2000).optional().default(""),
});

type SubmitResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function submitRegistration(
  input: z.infer<typeof submitSchema>,
): Promise<SubmitResult> {
  const user = await requireUser();
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const supabase = await createClient();

  // Re-fetch the window server-side to lock in the fee and confirm it's
  // still open at submission time (don't trust client-supplied fee).
  const { data: window, error: winErr } = await supabase
    .from("registration_windows")
    .select("id, fee_cents, opens_at, closes_at, is_active")
    .eq("id", parsed.data.window_id)
    .maybeSingle();
  if (winErr) return { ok: false, error: winErr.message };
  if (!window || !window.is_active) {
    return { ok: false, error: "That registration window isn't open." };
  }
  const now = Date.now();
  if (new Date(window.opens_at).getTime() > now) {
    return { ok: false, error: "Registration hasn't opened yet." };
  }
  if (new Date(window.closes_at).getTime() < now) {
    return { ok: false, error: "Registration is closed for this window." };
  }

  const { data, error } = await supabase
    .from("registrations")
    .insert({
      window_id: window.id,
      parent_profile_id: user.id,
      parent_full_name: parsed.data.parent_full_name,
      parent_email: user.email,
      parent_phone: parsed.data.parent_phone || null,
      player_first_name: parsed.data.player_first_name,
      player_last_name: parsed.data.player_last_name,
      player_date_of_birth: parsed.data.player_date_of_birth || null,
      player_grade: parsed.data.player_grade || null,
      player_position: parsed.data.player_position as PlayerPosition,
      player_jersey_pref: parsed.data.player_jersey_pref || null,
      requested_team_id: parsed.data.requested_team_id ?? null,
      notes: parsed.data.notes || null,
      fee_cents: window.fee_cents,
      status: "pending_payment",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/manage/registration");
  redirect(`/register/${window.id}/success?r=${data.id}`);
}
