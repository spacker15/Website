"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError } from "@/components/ui/field";
import {
  createRegistrationField,
  deleteRegistrationField,
  updateRegistrationField,
} from "./actions";
import type { RegistrationFieldKind } from "@/lib/supabase/types";

type FieldDefaults = {
  id?: string;
  label?: string;
  field_key?: string;
  help_text?: string | null;
  kind?: RegistrationFieldKind;
  options?: string[] | null;
  is_required?: boolean;
  is_active?: boolean;
  display_order?: number;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

export function FieldForm({ defaults }: { defaults?: FieldDefaults }) {
  const router = useRouter();
  const editing = !!defaults?.id;
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<RegistrationFieldKind>(defaults?.kind ?? "text");
  const [optionsText, setOptionsText] = useState(
    (defaults?.options ?? []).join("\n"),
  );
  const [fieldKey, setFieldKey] = useState(defaults?.field_key ?? "");
  const [label, setLabel] = useState(defaults?.label ?? "");

  function onLabelChange(value: string) {
    setLabel(value);
    // Only auto-derive the key on new fields; once the user has typed a key
    // (or on edit) we leave it alone.
    if (!editing && (fieldKey === "" || fieldKey === slugify(label))) {
      setFieldKey(slugify(value));
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const options = optionsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      label: String(fd.get("label") ?? "").trim(),
      field_key: String(fd.get("field_key") ?? "").trim(),
      help_text: String(fd.get("help_text") ?? "").trim(),
      kind,
      options: kind === "select" ? options : [],
      is_required: fd.get("is_required") === "on",
      is_active: fd.get("is_active") === "on",
      display_order: Number(fd.get("display_order") ?? 0),
    };

    startTransition(async () => {
      const res = editing
        ? await updateRegistrationField({ ...payload, id: defaults!.id! })
        : await createRegistrationField(payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/manage/registration-fields");
      router.refresh();
    });
  }

  function onDelete() {
    if (!defaults?.id) return;
    if (
      !confirm(
        `Delete the "${defaults.label}" field? Previous answers will remain on past registrations but are no longer surfaced.`,
      )
    ) {
      return;
    }
    setError(null);
    startDelete(async () => {
      const res = await deleteRegistrationField(defaults.id!);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/manage/registration-fields");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field>
        <Label htmlFor="label">Label (shown to parents)</Label>
        <Input
          id="label"
          name="label"
          required
          maxLength={200}
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
        />
      </Field>

      <Field>
        <Label htmlFor="field_key">Field key</Label>
        <Input
          id="field_key"
          name="field_key"
          required
          maxLength={60}
          value={fieldKey}
          onChange={(e) => setFieldKey(e.target.value)}
          pattern="[a-z][a-z0-9_]*"
          className="font-mono"
        />
        <p className="mt-1 text-xs text-ink-subtle">
          Stable identifier used to store the answer. Lowercase letters,
          digits, and underscores. Don&apos;t change after submissions exist.
        </p>
      </Field>

      <Field>
        <Label htmlFor="help_text">Help text (optional)</Label>
        <Input
          id="help_text"
          name="help_text"
          maxLength={500}
          defaultValue={defaults?.help_text ?? ""}
          placeholder="Shown below the field as a hint"
        />
      </Field>

      <Field>
        <Label htmlFor="kind">Kind</Label>
        <select
          id="kind"
          name="kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as RegistrationFieldKind)}
          className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          <option value="text">Short text</option>
          <option value="textarea">Long text (multi-line)</option>
          <option value="number">Number</option>
          <option value="select">Dropdown (choose one)</option>
          <option value="checkbox">Checkbox (yes / no)</option>
        </select>
      </Field>

      {kind === "select" && (
        <Field>
          <Label htmlFor="options">Dropdown options</Label>
          <Textarea
            id="options"
            rows={5}
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            placeholder={"Returning player\nNew player\nTransferred from another team"}
          />
          <p className="mt-1 text-xs text-ink-subtle">
            One option per line. Minimum 2.
          </p>
        </Field>
      )}

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
          Lower numbers appear first within the &quot;Additional info&quot;
          section.
        </p>
      </Field>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_required"
            defaultChecked={defaults?.is_required ?? false}
            className="h-4 w-4 rounded border-neutral-300"
          />
          <span>Required</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={defaults?.is_active ?? true}
            className="h-4 w-4 rounded border-neutral-300"
          />
          <span>Active (shown on the form)</span>
        </label>
      </div>

      {error && <FieldError>{error}</FieldError>}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending || deleting}>
          {pending ? "Saving…" : editing ? "Save changes" : "Create field"}
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
