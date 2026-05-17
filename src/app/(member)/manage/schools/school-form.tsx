"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError } from "@/components/ui/field";
import { createSchool, deleteSchool, updateSchool } from "./actions";
import type { SchoolKind } from "@/lib/supabase/types";

type SchoolDefaults = {
  id?: string;
  name?: string;
  kind?: SchoolKind;
  is_active?: boolean;
  is_high_school?: boolean;
  display_order?: number;
};

const KINDS: { value: SchoolKind; label: string }[] = [
  { value: "public_high", label: "Public — High school" },
  { value: "public_middle", label: "Public — Middle school" },
  { value: "public_k8", label: "Public — K–8 academy" },
  { value: "public_elementary", label: "Public — Elementary" },
  { value: "private", label: "Private" },
  { value: "other", label: "Other (virtual / homeschool / out-of-area)" },
];

export function SchoolForm({ defaults }: { defaults?: SchoolDefaults }) {
  const router = useRouter();
  const editing = !!defaults?.id;
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      kind: String(fd.get("kind") ?? "public_high") as SchoolKind,
      is_active: fd.get("is_active") === "on",
      is_high_school: fd.get("is_high_school") === "on",
      display_order: Number(fd.get("display_order") ?? 0),
    };

    startTransition(async () => {
      const res = editing
        ? await updateSchool({ ...payload, id: defaults!.id! })
        : await createSchool(payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/manage/schools");
      router.refresh();
    });
  }

  function onDelete() {
    if (!defaults?.id) return;
    if (!confirm(`Delete "${defaults.name}"? Mark inactive instead if it's been used.`)) {
      return;
    }
    setError(null);
    startDelete(async () => {
      const res = await deleteSchool(defaults.id!);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/manage/schools");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={200}
          defaultValue={defaults?.name ?? ""}
        />
      </Field>

      <Field>
        <Label htmlFor="kind">Kind</Label>
        <select
          id="kind"
          name="kind"
          defaultValue={defaults?.kind ?? "public_high"}
          className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </Field>

      <Field>
        <Label htmlFor="display_order">Display order</Label>
        <Input
          id="display_order"
          name="display_order"
          type="number"
          min="0"
          max="9999"
          defaultValue={defaults?.display_order ?? 0}
        />
        <p className="mt-1 text-xs text-ink-subtle">
          Lower numbers appear first within a kind.
        </p>
      </Field>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={defaults?.is_active ?? true}
            className="h-4 w-4 rounded border-neutral-300"
          />
          <span>Active (shown in registration dropdowns)</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_high_school"
            defaultChecked={defaults?.is_high_school ?? false}
            className="h-4 w-4 rounded border-neutral-300"
          />
          <span>Offers high school grades (eligible for the &quot;Zoned high school&quot; dropdown)</span>
        </label>
      </div>

      {error && <FieldError>{error}</FieldError>}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending || deleting}>
          {pending ? "Saving…" : editing ? "Save changes" : "Create school"}
        </Button>
        {editing && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onDelete}
            disabled={pending || deleting}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        )}
      </div>
    </form>
  );
}
