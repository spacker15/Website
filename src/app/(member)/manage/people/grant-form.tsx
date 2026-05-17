"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError } from "@/components/ui/field";
import { grantRole } from "./actions";

type Role =
  | "program_leader"
  | "head_coach"
  | "assistant_coach"
  | "parent"
  | "volunteer";

const ROLES: { value: Role; label: string; description: string }[] = [
  {
    value: "program_leader",
    label: "Program leader",
    description: "Site-wide super-admin. Manages every team and grants others.",
  },
  {
    value: "head_coach",
    label: "Head coach",
    description: "Manages a single team's roster, players, and visibility.",
  },
  {
    value: "assistant_coach",
    label: "Assistant coach",
    description: "Same scope as head coach for one team.",
  },
  {
    value: "parent",
    label: "Parent",
    description: "Linked to one or more players; can view team contacts.",
  },
  {
    value: "volunteer",
    label: "Volunteer",
    description: "General volunteer access (site-wide or team-scoped).",
  },
];

function requiresTeam(role: Role): boolean {
  return role === "head_coach" || role === "assistant_coach";
}

function allowsTeam(role: Role): boolean {
  // program_leader is site-wide only; everything else can optionally scope
  return role !== "program_leader";
}

export function GrantForm({ teams }: { teams: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [role, setRole] = useState<Role>("head_coach");
  const [teamId, setTeamId] = useState<string>("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();

    if (requiresTeam(role) && !teamId) {
      setError("Pick a team for this role.");
      return;
    }

    startTransition(async () => {
      const res = await grantRole({
        email,
        role,
        team_id: allowsTeam(role) && teamId ? teamId : null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(`Granted ${role.replace("_", " ")} to ${email}.`);
      // reset form
      (e.target as HTMLFormElement).reset();
      setTeamId("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
      <Field className="sm:col-span-2">
        <Label htmlFor="email">User&apos;s email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="off"
          placeholder="parent@example.com"
          required
        />
        <p className="mt-1 text-xs text-ink-subtle">
          The user must have signed up first.
        </p>
      </Field>

      <Field>
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-ink-subtle">
          {ROLES.find((r) => r.value === role)?.description}
        </p>
      </Field>

      <Field>
        <Label htmlFor="team">
          Team{" "}
          {requiresTeam(role)
            ? "(required)"
            : allowsTeam(role)
              ? "(optional)"
              : "(n/a)"}
        </Label>
        <select
          id="team"
          name="team_id"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          disabled={!allowsTeam(role)}
          className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm disabled:bg-surface-muted disabled:text-ink-subtle"
        >
          <option value="">
            {allowsTeam(role) ? "— Site-wide —" : "Site-wide only"}
          </option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </Field>

      {error && (
        <div className="sm:col-span-2">
          <FieldError>{error}</FieldError>
        </div>
      )}
      {success && (
        <p className="rounded-md bg-brand-teal-50 px-3 py-2 text-sm text-brand-teal-700 sm:col-span-2">
          {success}
        </p>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Granting…" : "Grant role"}
        </Button>
      </div>
    </form>
  );
}
