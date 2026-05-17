"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { PlayerPosition } from "@/lib/supabase/types";

const optional = (max: number) => z.string().max(max).optional().default("");

const submitSchema = z.object({
  window_id: z.string().uuid(),

  // Primary guardian (required)
  parent_full_name: z.string().min(1, "Your name is required").max(120),
  parent_phone: z.string().min(7, "Phone is required").max(40),
  parent_relationship: z.string().min(1, "Relationship to player is required").max(40),
  parent_address_line1: z.string().min(1, "Street address is required").max(200),
  parent_address_line2: optional(200),
  parent_city: z.string().min(1, "City is required").max(100),
  parent_state: z.string().min(2, "State is required").max(60),
  parent_zip: z.string().min(3, "ZIP is required").max(20),

  // Secondary guardian (optional)
  secondary_guardian_full_name: optional(120),
  secondary_guardian_email: z.union([z.email(), z.literal("")]).optional().default(""),
  secondary_guardian_phone: optional(40),
  secondary_guardian_relationship: optional(40),

  // Emergency contact (required)
  emergency_contact_name: z.string().min(1, "Emergency contact name is required").max(120),
  emergency_contact_phone: z.string().min(7, "Emergency contact phone is required").max(40),
  emergency_contact_relationship: z.string().min(1, "Relationship is required").max(40),

  // Player (most required)
  player_first_name: z.string().min(1, "Player first name is required").max(80),
  player_last_name: z.string().min(1, "Player last name is required").max(80),
  player_date_of_birth: z.string().min(1, "Date of birth is required"),
  player_grade: z.string().min(1, "Grade is required").max(20),
  player_school: optional(200),
  player_position: z.enum(["unspecified", "attack", "midfield", "defense", "goalie"]),
  player_usa_lacrosse_member: z.boolean(),
  player_usa_lacrosse_number: optional(40),
  player_jersey_pref_1: optional(10),
  player_jersey_pref_2: optional(10),
  player_jersey_pref_3: optional(10),
  player_tshirt_size: z.string().min(1, "T-shirt size is required").max(20),
  player_pinnie_size: z.string().min(1, "Pinnie size is required").max(20),
  player_years_experience: z
    .number({ message: "Years of experience must be a number" })
    .int()
    .min(0)
    .max(30)
    .optional()
    .nullable(),
  player_medical_notes: optional(4000),

  // Team + notes
  requested_team_id: z.string().uuid().optional().nullable(),
  notes: optional(2000),

  // Waiver signatures: array of {waiver_id, version, title, body}
  signed_by_name: z.string().min(2, "Type your full legal name to sign").max(120),
  waiver_signatures: z.array(
    z.object({
      waiver_id: z.string().uuid(),
      version: z.number().int(),
      title: z.string(),
      body: z.string(),
    }),
  ),
});

type SubmitResult = { ok: true; id: string } | { ok: false; error: string };

export async function submitRegistration(
  input: z.infer<typeof submitSchema>,
): Promise<SubmitResult> {
  const user = await requireUser();
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const supabase = await createClient();

  // Re-fetch the window server-side to lock in the fee and confirm it's
  // still open at submission time.
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

  // Verify the signed waivers match every currently-required+active waiver.
  // We refetch from the DB to make sure the client didn't omit any.
  const { data: requiredWaivers } = await supabase
    .from("waivers")
    .select("id, version")
    .eq("is_active", true)
    .eq("is_required", true);
  const signedIds = new Set(parsed.data.waiver_signatures.map((s) => s.waiver_id));
  for (const w of requiredWaivers ?? []) {
    if (!signedIds.has(w.id)) {
      return {
        ok: false,
        error: "All required waivers must be signed before submitting.",
      };
    }
  }

  const d = parsed.data;

  const { data: reg, error: regErr } = await supabase
    .from("registrations")
    .insert({
      window_id: window.id,
      parent_profile_id: user.id,
      parent_full_name: d.parent_full_name,
      parent_email: user.email,
      parent_phone: d.parent_phone,
      parent_relationship: d.parent_relationship,
      parent_address_line1: d.parent_address_line1,
      parent_address_line2: d.parent_address_line2 || null,
      parent_city: d.parent_city,
      parent_state: d.parent_state,
      parent_zip: d.parent_zip,
      secondary_guardian_full_name: d.secondary_guardian_full_name || null,
      secondary_guardian_email: d.secondary_guardian_email || null,
      secondary_guardian_phone: d.secondary_guardian_phone || null,
      secondary_guardian_relationship: d.secondary_guardian_relationship || null,
      emergency_contact_name: d.emergency_contact_name,
      emergency_contact_phone: d.emergency_contact_phone,
      emergency_contact_relationship: d.emergency_contact_relationship,
      player_first_name: d.player_first_name,
      player_last_name: d.player_last_name,
      player_date_of_birth: d.player_date_of_birth,
      player_grade: d.player_grade,
      player_school: d.player_school || null,
      player_position: d.player_position as PlayerPosition,
      player_usa_lacrosse_member: d.player_usa_lacrosse_member,
      player_usa_lacrosse_number: d.player_usa_lacrosse_number || null,
      player_jersey_pref_1: d.player_jersey_pref_1 || null,
      player_jersey_pref_2: d.player_jersey_pref_2 || null,
      player_jersey_pref_3: d.player_jersey_pref_3 || null,
      player_tshirt_size: d.player_tshirt_size,
      player_pinnie_size: d.player_pinnie_size,
      player_years_experience: d.player_years_experience ?? null,
      player_medical_notes: d.player_medical_notes || null,
      requested_team_id: d.requested_team_id ?? null,
      notes: d.notes || null,
      fee_cents: window.fee_cents,
      status: "pending_payment",
    })
    .select("id")
    .single();

  if (regErr) return { ok: false, error: regErr.message };

  // Snapshot every signed waiver. Insert in one batch so the row exists or
  // nothing does. RLS allows the parent to insert because the registration
  // they just created belongs to them.
  if (d.waiver_signatures.length > 0) {
    const { error: sigErr } = await supabase.from("registration_waivers").insert(
      d.waiver_signatures.map((s) => ({
        registration_id: reg.id,
        waiver_id: s.waiver_id,
        waiver_version: s.version,
        waiver_title_snapshot: s.title,
        waiver_body_snapshot: s.body,
        signed_by_name: d.signed_by_name,
      })),
    );
    if (sigErr) {
      // Best-effort: registration is already created; surface the error so
      // the parent knows their signatures didn't save and can retry.
      return {
        ok: false,
        error: `Registration saved but waiver signatures failed: ${sigErr.message}`,
      };
    }
  }

  revalidatePath("/manage/registration");
  redirect(`/register/${window.id}/success?r=${reg.id}`);
}
