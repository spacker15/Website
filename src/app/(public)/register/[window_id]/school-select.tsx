"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import type { School, SchoolKind } from "@/lib/supabase/types";

const KIND_GROUPS: { kind: SchoolKind; label: string }[] = [
  { kind: "public_high", label: "Public high schools" },
  { kind: "public_middle", label: "Public middle schools" },
  { kind: "public_k8", label: "Public K–8 academies" },
  { kind: "public_elementary", label: "Public elementary schools" },
  { kind: "private", label: "Private schools" },
  { kind: "other", label: "Other" },
];

export function SchoolSelect({
  idPrefix,
  label,
  schools,
  value,
  otherValue,
  onChange,
  onOtherChange,
  highSchoolOnly = false,
  required = false,
  helpText,
}: {
  idPrefix: string;
  label: string;
  schools: School[];
  value: string;
  otherValue: string;
  onChange: (id: string) => void;
  onOtherChange: (other: string) => void;
  highSchoolOnly?: boolean;
  required?: boolean;
  helpText?: string;
}) {
  const filtered = highSchoolOnly
    ? schools.filter((s) => s.is_high_school)
    : schools;

  const isOther = value === "__other__";

  return (
    <div className="space-y-2">
      <Field>
        <Label htmlFor={`${idPrefix}_id`}>{label}</Label>
        <select
          id={`${idPrefix}_id`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">— Choose —</option>
          {KIND_GROUPS.map((g) => {
            const groupSchools = filtered.filter((s) => s.kind === g.kind);
            if (groupSchools.length === 0) return null;
            return (
              <optgroup key={g.kind} label={g.label}>
                {groupSchools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            );
          })}
          <option value="__other__">Not listed (type below)</option>
        </select>
        {helpText && (
          <p className="mt-1 text-xs text-ink-subtle">{helpText}</p>
        )}
      </Field>
      {isOther && (
        <Field>
          <Label htmlFor={`${idPrefix}_other`}>School name</Label>
          <Input
            id={`${idPrefix}_other`}
            value={otherValue}
            onChange={(e) => onOtherChange(e.target.value)}
            maxLength={200}
            required={required}
            placeholder="Type the school name"
          />
        </Field>
      )}
    </div>
  );
}
