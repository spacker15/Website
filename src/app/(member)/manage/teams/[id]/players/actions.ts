"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { PlayerPosition } from "@/lib/supabase/types";

const positionEnum = z.enum(["unspecified", "attack", "midfield", "defense", "goalie"]);

const createSchema = z.object({
  teamId: z.uuid(),
  first_name: z.string().min(1, "First name is required").max(80),
  last_name: z.string().min(1, "Last name is required").max(80),
  jersey: z.string().max(10).optional().default(""),
  position: positionEnum,
  grade: z.string().max(20).optional().default(""),
});

const updateSchema = z.object({
  id: z.uuid(),
  first_name: z.string().min(1).max(80),
  last_name: z.string().min(1).max(80),
  jersey: z.string().max(10).optional().default(""),
  position: positionEnum,
  grade: z.string().max(20).optional().default(""),
});

const visibilitySchema = z.object({
  player_id: z.uuid(),
  show_name: z.boolean(),
  show_jersey: z.boolean(),
  show_position: z.boolean(),
  show_grade: z.boolean(),
  show_photo: z.boolean(),
  show_parents: z.boolean(),
});

type Result = { ok: true } | { ok: false; error: string };
type CreateResult = { ok: true; id: string } | { ok: false; error: string };

export async function createPlayer(
  input: z.infer<typeof createSchema>,
): Promise<CreateResult> {
  await requireRole("head_coach");
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .insert({
      team_id: parsed.data.teamId,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      jersey: parsed.data.jersey || null,
      position: parsed.data.position as PlayerPosition,
      grade: parsed.data.grade || null,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/manage/teams/${parsed.data.teamId}/players`);
  revalidatePath(`/teams/${parsed.data.teamId}`);
  return { ok: true, id: data.id };
}

export async function updatePlayer(
  input: z.infer<typeof updateSchema>,
): Promise<Result> {
  await requireRole("head_coach");
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase
    .from("players")
    .update({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      jersey: parsed.data.jersey || null,
      position: parsed.data.position as PlayerPosition,
      grade: parsed.data.grade || null,
    })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/manage/teams`);
  revalidatePath(`/teams`);
  return { ok: true };
}

export async function deletePlayer(id: string): Promise<Result> {
  await requireRole("head_coach");
  const supabase = await createClient();
  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/manage/teams`);
  revalidatePath(`/teams`);
  return { ok: true };
}

export async function updateVisibility(
  input: z.infer<typeof visibilitySchema>,
): Promise<Result> {
  await requireRole("head_coach");
  const parsed = visibilitySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  // upsert so the row exists even for legacy players missing the visibility trigger
  const { error } = await supabase.from("player_visibility").upsert({
    player_id: parsed.data.player_id,
    show_name: parsed.data.show_name,
    show_jersey: parsed.data.show_jersey,
    show_position: parsed.data.show_position,
    show_grade: parsed.data.show_grade,
    show_photo: parsed.data.show_photo,
    show_parents: parsed.data.show_parents,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/manage/teams`);
  revalidatePath(`/teams`);
  return { ok: true };
}
