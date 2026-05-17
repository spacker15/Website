"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError } from "@/components/ui/field";
import {
  createRegistrationWindow,
  deleteRegistrationWindow,
  updateRegistrationWindow,
} from "./actions";

type WindowDefaults = {
  id?: string;
  name?: string;
  description?: string | null;
  opens_at?: string;
  closes_at?: string;
  fee_cents?: number;
  is_active?: boolean;
};

function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  // datetime-local wants "yyyy-MM-ddThh:mm" in local time
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function WindowForm({ defaults }: { defaults?: WindowDefaults }) {
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
      description: String(fd.get("description") ?? "").trim(),
      opens_at: String(fd.get("opens_at") ?? ""),
      closes_at: String(fd.get("closes_at") ?? ""),
      fee_dollars: Number(fd.get("fee_dollars") ?? 0),
      is_active: fd.get("is_active") === "on",
    };

    startTransition(async () => {
      const res = editing
        ? await updateRegistrationWindow({ ...payload, id: defaults!.id! })
        : await createRegistrationWindow(payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/manage/registration");
      router.refresh();
    });
  }

  function onDelete() {
    if (!defaults?.id) return;
    if (
      !confirm(
        `Delete the "${defaults.name}" window? This can't be undone.`,
      )
    ) {
      return;
    }
    setError(null);
    startDelete(async () => {
      const res = await deleteRegistrationWindow(defaults.id!);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/manage/registration");
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
          maxLength={120}
          defaultValue={defaults?.name ?? ""}
          placeholder="Spring 2026"
        />
      </Field>

      <Field>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          maxLength={2000}
          defaultValue={defaults?.description ?? ""}
          placeholder="Open to all grades 7–12. Includes 12 weeks of practices and 10 games."
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <Label htmlFor="opens_at">Opens at</Label>
          <Input
            id="opens_at"
            name="opens_at"
            type="datetime-local"
            required
            defaultValue={toLocalInput(defaults?.opens_at)}
          />
        </Field>
        <Field>
          <Label htmlFor="closes_at">Closes at</Label>
          <Input
            id="closes_at"
            name="closes_at"
            type="datetime-local"
            required
            defaultValue={toLocalInput(defaults?.closes_at)}
          />
        </Field>
      </div>

      <Field>
        <Label htmlFor="fee_dollars">Fee (USD)</Label>
        <Input
          id="fee_dollars"
          name="fee_dollars"
          type="number"
          min="0"
          step="0.01"
          required
          defaultValue={
            defaults?.fee_cents !== undefined
              ? (defaults.fee_cents / 100).toFixed(2)
              : ""
          }
          placeholder="250.00"
        />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={defaults?.is_active ?? true}
          className="h-4 w-4 rounded border-neutral-300"
        />
        <span>Active (visible to the public when open)</span>
      </label>

      {error && <FieldError>{error}</FieldError>}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending || deleting}>
          {pending ? "Saving…" : editing ? "Save changes" : "Create window"}
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
