"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError } from "@/components/ui/field";
import { submitRegistration } from "./actions";

type Team = { id: string; name: string; season: string | null };

type ParentDefaults = {
  full_name: string;
  email: string;
  phone: string;
};

const POSITIONS = [
  { value: "unspecified", label: "No preference" },
  { value: "attack", label: "Attack" },
  { value: "midfield", label: "Midfield" },
  { value: "defense", label: "Defense" },
  { value: "goalie", label: "Goalie" },
] as const;

export function RegistrationForm({
  windowId,
  teams,
  parentDefaults,
}: {
  windowId: string;
  teams: Team[];
  parentDefaults: ParentDefaults;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    const teamId = String(fd.get("requested_team_id") ?? "");

    startTransition(async () => {
      const res = await submitRegistration({
        window_id: windowId,
        parent_full_name: String(fd.get("parent_full_name") ?? "").trim(),
        parent_phone: String(fd.get("parent_phone") ?? "").trim(),
        player_first_name: String(fd.get("player_first_name") ?? "").trim(),
        player_last_name: String(fd.get("player_last_name") ?? "").trim(),
        player_date_of_birth: String(fd.get("player_date_of_birth") ?? ""),
        player_grade: String(fd.get("player_grade") ?? "").trim(),
        player_position: String(fd.get("player_position") ?? "unspecified") as
          | "unspecified"
          | "attack"
          | "midfield"
          | "defense"
          | "goalie",
        player_jersey_pref: String(fd.get("player_jersey_pref") ?? "").trim(),
        requested_team_id: teamId || null,
        notes: String(fd.get("notes") ?? "").trim(),
      });
      // If submitRegistration succeeded, it redirects — so we only get here on error.
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">
          Parent / guardian
        </h2>
        <Field>
          <Label htmlFor="parent_full_name">Your name</Label>
          <Input
            id="parent_full_name"
            name="parent_full_name"
            required
            maxLength={120}
            defaultValue={parentDefaults.full_name}
          />
        </Field>
        <Field>
          <Label htmlFor="parent_email">Email</Label>
          <Input
            id="parent_email"
            type="email"
            value={parentDefaults.email}
            disabled
          />
          <p className="mt-1 text-xs text-ink-subtle">
            Confirmations and receipts go to this email.
          </p>
        </Field>
        <Field>
          <Label htmlFor="parent_phone">Phone</Label>
          <Input
            id="parent_phone"
            name="parent_phone"
            type="tel"
            maxLength={40}
            defaultValue={parentDefaults.phone}
            placeholder="(555) 123-4567"
          />
        </Field>
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">Player</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <Label htmlFor="player_first_name">First name</Label>
            <Input
              id="player_first_name"
              name="player_first_name"
              required
              maxLength={80}
            />
          </Field>
          <Field>
            <Label htmlFor="player_last_name">Last name</Label>
            <Input
              id="player_last_name"
              name="player_last_name"
              required
              maxLength={80}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <Label htmlFor="player_date_of_birth">Date of birth</Label>
            <Input
              id="player_date_of_birth"
              name="player_date_of_birth"
              type="date"
            />
          </Field>
          <Field>
            <Label htmlFor="player_grade">Grade in fall</Label>
            <Input
              id="player_grade"
              name="player_grade"
              maxLength={20}
              placeholder="9th"
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <Label htmlFor="player_position">Position preference</Label>
            <select
              id="player_position"
              name="player_position"
              defaultValue="unspecified"
              className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <Label htmlFor="player_jersey_pref">Jersey number (preference)</Label>
            <Input
              id="player_jersey_pref"
              name="player_jersey_pref"
              maxLength={10}
              placeholder="00"
            />
          </Field>
        </div>

        {teams.length > 0 && (
          <Field>
            <Label htmlFor="requested_team_id">Team (if known)</Label>
            <select
              id="requested_team_id"
              name="requested_team_id"
              defaultValue=""
              className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">— Let the coaches decide —</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.season ? ` (${t.season})` : ""}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-ink-subtle">
              Coaches will confirm the final team placement after registration.
            </p>
          </Field>
        )}
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">
          Anything else?
        </h2>
        <Field>
          <Label htmlFor="notes">Notes for the coaches (optional)</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={2000}
            placeholder="Allergies, prior experience, scheduling conflicts, etc."
          />
        </Field>
      </section>

      {error && <FieldError>{error}</FieldError>}

      <div className="border-t border-neutral-200 pt-6">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Submitting…" : "Submit registration"}
        </Button>
        <p className="mt-3 text-xs text-ink-subtle">
          You&apos;ll be asked to pay the registration fee on the next step.
        </p>
      </div>
    </form>
  );
}
