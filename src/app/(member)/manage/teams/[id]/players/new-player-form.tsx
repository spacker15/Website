"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError } from "@/components/ui/field";
import { createPlayer } from "./actions";

const POSITIONS = ["unspecified", "attack", "midfield", "defense", "goalie"] as const;

export function NewPlayerForm({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [v, setV] = useState({
    first_name: "",
    last_name: "",
    jersey: "",
    position: "unspecified" as (typeof POSITIONS)[number],
    grade: "",
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createPlayer({ teamId, ...v });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      toast.success("Player added.");
      setV({ first_name: "", last_name: "", jersey: "", position: "unspecified", grade: "" });
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <Label htmlFor="first_name">First name</Label>
          <Input
            id="first_name"
            required
            value={v.first_name}
            onChange={(e) => setV((s) => ({ ...s, first_name: e.target.value }))}
          />
        </Field>
        <Field>
          <Label htmlFor="last_name">Last name</Label>
          <Input
            id="last_name"
            required
            value={v.last_name}
            onChange={(e) => setV((s) => ({ ...s, last_name: e.target.value }))}
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field>
          <Label htmlFor="jersey">Jersey</Label>
          <Input
            id="jersey"
            value={v.jersey}
            onChange={(e) => setV((s) => ({ ...s, jersey: e.target.value }))}
          />
        </Field>
        <Field>
          <Label htmlFor="position">Position</Label>
          <select
            id="position"
            className="flex h-11 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            value={v.position}
            onChange={(e) =>
              setV((s) => ({
                ...s,
                position: e.target.value as (typeof POSITIONS)[number],
              }))
            }
          >
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p[0].toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </Field>
        <Field>
          <Label htmlFor="grade">Grade</Label>
          <Input
            id="grade"
            placeholder="e.g. 11th"
            value={v.grade}
            onChange={(e) => setV((s) => ({ ...s, grade: e.target.value }))}
          />
        </Field>
      </div>

      {error && <FieldError>{error}</FieldError>}

      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add player"}
      </Button>
    </form>
  );
}
