"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { createTeam, updateTeam } from "./actions";

type Initial = {
  name: string;
  season: string;
  age_group: string;
  is_public: boolean;
};

const DEFAULTS: Initial = {
  name: "",
  season: "",
  age_group: "",
  is_public: true,
};

export function TeamForm({
  id,
  initial = DEFAULTS,
}: {
  id?: string;
  initial?: Initial;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Initial>(initial);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      if (id) {
        const res = await updateTeam({ id, ...values });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        toast.success("Team updated.");
        router.push("/manage/teams");
      } else {
        const res = await createTeam(values);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        toast.success("Team created.");
        router.push(`/manage/teams/${res.id}/players`);
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field>
        <Label htmlFor="name">Team name</Label>
        <Input
          id="name"
          required
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <Label htmlFor="season">Season</Label>
          <Input
            id="season"
            placeholder="e.g. Spring 2026"
            value={values.season}
            onChange={(e) => setValues((v) => ({ ...v, season: e.target.value }))}
          />
        </Field>
        <Field>
          <Label htmlFor="age_group">Age group</Label>
          <Input
            id="age_group"
            placeholder="e.g. Varsity / 14U"
            value={values.age_group}
            onChange={(e) => setValues((v) => ({ ...v, age_group: e.target.value }))}
          />
        </Field>
      </div>
      <Field>
        <Switch
          label="Show this team on the public site"
          checked={values.is_public}
          onChange={(e) =>
            setValues((v) => ({ ...v, is_public: e.target.checked }))
          }
        />
      </Field>

      {error && <FieldError>{error}</FieldError>}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : id ? "Save changes" : "Create team"}
      </Button>
    </form>
  );
}
