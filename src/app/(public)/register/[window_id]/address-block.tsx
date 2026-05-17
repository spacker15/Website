"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  "DC",
] as const;

export type Address = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
};

export const emptyAddress: Address = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
};

export function AddressBlock({
  idPrefix,
  value,
  onChange,
  disabled = false,
  required = false,
}: {
  idPrefix: string;
  value: Address;
  onChange: (next: Address) => void;
  disabled?: boolean;
  required?: boolean;
}) {
  function set<K extends keyof Address>(key: K, v: Address[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="space-y-5">
      <Field>
        <Label htmlFor={`${idPrefix}_line1`}>Street address</Label>
        <Input
          id={`${idPrefix}_line1`}
          value={value.line1}
          onChange={(e) => set("line1", e.target.value)}
          disabled={disabled}
          required={required}
          maxLength={200}
        />
      </Field>
      <Field>
        <Label htmlFor={`${idPrefix}_line2`}>Apt / Suite (optional)</Label>
        <Input
          id={`${idPrefix}_line2`}
          value={value.line2}
          onChange={(e) => set("line2", e.target.value)}
          disabled={disabled}
          maxLength={200}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field className="sm:col-span-2">
          <Label htmlFor={`${idPrefix}_city`}>City</Label>
          <Input
            id={`${idPrefix}_city`}
            value={value.city}
            onChange={(e) => set("city", e.target.value)}
            disabled={disabled}
            required={required}
            maxLength={100}
          />
        </Field>
        <Field>
          <Label htmlFor={`${idPrefix}_state`}>State</Label>
          <select
            id={`${idPrefix}_state`}
            value={value.state}
            onChange={(e) => set("state", e.target.value)}
            disabled={disabled}
            required={required}
            className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm disabled:bg-surface-muted disabled:text-ink-subtle"
          >
            <option value="">—</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field>
        <Label htmlFor={`${idPrefix}_zip`}>ZIP</Label>
        <Input
          id={`${idPrefix}_zip`}
          value={value.zip}
          onChange={(e) => set("zip", e.target.value)}
          disabled={disabled}
          required={required}
          maxLength={20}
          inputMode="numeric"
          className="sm:max-w-[160px]"
        />
      </Field>
    </div>
  );
}
