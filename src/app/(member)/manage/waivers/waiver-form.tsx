"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError } from "@/components/ui/field";
import { createWaiver, deleteWaiver, updateWaiver } from "./actions";

type WaiverDefaults = {
  id?: string;
  title?: string;
  body?: string;
  version?: number;
  is_required?: boolean;
  is_active?: boolean;
  display_order?: number;
};

export function WaiverForm({ defaults }: { defaults?: WaiverDefaults }) {
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
      title: String(fd.get("title") ?? "").trim(),
      body: String(fd.get("body") ?? "").trim(),
      is_required: fd.get("is_required") === "on",
      is_active: fd.get("is_active") === "on",
      display_order: Number(fd.get("display_order") ?? 0),
    };

    startTransition(async () => {
      const res = editing
        ? await updateWaiver({
            ...payload,
            id: defaults!.id!,
            bumpVersion: fd.get("bump_version") === "on",
          })
        : await createWaiver(payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/manage/waivers");
      router.refresh();
    });
  }

  function onDelete() {
    if (!defaults?.id) return;
    if (
      !confirm(
        `Delete waiver "${defaults.title}"? Use Archive instead if it's been signed.`,
      )
    ) {
      return;
    }
    setError(null);
    startDelete(async () => {
      const res = await deleteWaiver(defaults.id!);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/manage/waivers");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={defaults?.title ?? ""}
          placeholder="Liability waiver"
        />
      </Field>

      <Field>
        <Label htmlFor="body">Waiver text</Label>
        <Textarea
          id="body"
          name="body"
          required
          rows={14}
          maxLength={20000}
          defaultValue={defaults?.body ?? ""}
          placeholder="I, the undersigned parent or legal guardian, acknowledge..."
        />
        <p className="mt-1 text-xs text-ink-subtle">
          Plain text. Line breaks are preserved. This exact text is shown to
          parents and snapshotted with their signature.
        </p>
      </Field>

      <Field>
        <Label htmlFor="display_order">Display order</Label>
        <Input
          id="display_order"
          name="display_order"
          type="number"
          min="0"
          max="999"
          defaultValue={defaults?.display_order ?? 0}
        />
        <p className="mt-1 text-xs text-ink-subtle">
          Lower numbers appear first on the registration form.
        </p>
      </Field>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_required"
            defaultChecked={defaults?.is_required ?? true}
            className="h-4 w-4 rounded border-neutral-300"
          />
          <span>Required (parent must check this to submit)</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={defaults?.is_active ?? true}
            className="h-4 w-4 rounded border-neutral-300"
          />
          <span>Active (shown on the registration form)</span>
        </label>
        {editing && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="bump_version"
              className="h-4 w-4 rounded border-neutral-300"
            />
            <span>
              Bump version (current: v{defaults?.version ?? 1}) — check this
              when you make a meaningful wording change
            </span>
          </label>
        )}
      </div>

      {error && <FieldError>{error}</FieldError>}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending || deleting}>
          {pending ? "Saving…" : editing ? "Save changes" : "Create waiver"}
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
