"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import type { RegistrationField } from "@/lib/supabase/types";

export type CustomAnswers = Record<string, string | number | boolean>;

export function CustomFieldsBlock({
  fields,
  answers,
  onChange,
}: {
  fields: RegistrationField[];
  answers: CustomAnswers;
  onChange: (key: string, value: string | number | boolean) => void;
}) {
  if (fields.length === 0) return null;
  return (
    <div className="space-y-5">
      {fields.map((f) => (
        <CustomFieldInput key={f.id} field={f} value={answers[f.field_key]} onChange={onChange} />
      ))}
    </div>
  );
}

function CustomFieldInput({
  field,
  value,
  onChange,
}: {
  field: RegistrationField;
  value: string | number | boolean | undefined;
  onChange: (key: string, value: string | number | boolean) => void;
}) {
  const id = `cf_${field.field_key}`;
  const required = field.is_required;
  const labelText = `${field.label}${required ? " *" : ""}`;

  if (field.kind === "checkbox") {
    return (
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(field.field_key, e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-neutral-300"
        />
        <span>
          <span className="font-medium text-ink">{labelText}</span>
          {field.help_text && (
            <span className="block text-xs text-ink-subtle">{field.help_text}</span>
          )}
        </span>
      </label>
    );
  }

  if (field.kind === "select") {
    return (
      <Field>
        <Label htmlFor={id}>{labelText}</Label>
        <select
          id={id}
          required={required}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(field.field_key, e.target.value)}
          className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">— Choose —</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {field.help_text && (
          <p className="mt-1 text-xs text-ink-subtle">{field.help_text}</p>
        )}
      </Field>
    );
  }

  if (field.kind === "textarea") {
    return (
      <Field>
        <Label htmlFor={id}>{labelText}</Label>
        <Textarea
          id={id}
          rows={3}
          required={required}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(field.field_key, e.target.value)}
          maxLength={4000}
        />
        {field.help_text && (
          <p className="mt-1 text-xs text-ink-subtle">{field.help_text}</p>
        )}
      </Field>
    );
  }

  if (field.kind === "number") {
    return (
      <Field>
        <Label htmlFor={id}>{labelText}</Label>
        <Input
          id={id}
          type="number"
          required={required}
          value={typeof value === "number" ? value : (typeof value === "string" ? value : "")}
          onChange={(e) =>
            onChange(
              field.field_key,
              e.target.value === "" ? "" : Number(e.target.value),
            )
          }
          className="sm:max-w-[200px]"
        />
        {field.help_text && (
          <p className="mt-1 text-xs text-ink-subtle">{field.help_text}</p>
        )}
      </Field>
    );
  }

  // default: text
  return (
    <Field>
      <Label htmlFor={id}>{labelText}</Label>
      <Input
        id={id}
        required={required}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(field.field_key, e.target.value)}
        maxLength={500}
      />
      {field.help_text && (
        <p className="mt-1 text-xs text-ink-subtle">{field.help_text}</p>
      )}
    </Field>
  );
}
